import { Request, Response } from "express";
import { QueryFilter, isValidObjectId } from "mongoose";
import Book, { IBookDocument } from "../models/Book.js";
import { CreateBookInput, ListBooksQuery, LoanBookInput, UpdateBookInput } from "../schemas/book.schema.js";
import { LoanError, Reader, borrowBook, countActiveLoans, refreshStock, returnOwnCopy } from "../lib/loan-policy.js";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function listBooks(_req: Request, res: Response): Promise<void> {
  const { search, page, limit, available, faculty, career } = res.locals.query as ListBooksQuery;
  const filter: QueryFilter<IBookDocument> = {};

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { author: { $regex: safeSearch, $options: "i" } },
      { career: { $regex: safeSearch, $options: "i" } },
      { faculty: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (faculty) filter.faculty = faculty;
  if (career) filter.career = career;
  if (available === "true") filter.available = true;
  if (available === "false") filter.available = false;

  try {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    res.status(200).json({
      data: books,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[books] error listing:", error);
    res.status(500).json({ success: false, error: { message: "No se pudieron obtener los libros" } });
  }
}

export async function getBookById(req: Request, res: Response): Promise<void> {
  const id = readId(req.params.id);

  if (!isValidObjectId(id)) {
    res.status(400).json({ success: false, error: { message: "El id no es valido" } });
    return;
  }

  try {
    const book = await Book.findById(id);

    if (!book) {
      res.status(404).json({ success: false, error: { message: "Libro no encontrado" } });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("[books] error fetching:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo obtener el libro" } });
  }
}

export async function createBook(req: Request<Record<string, string>, unknown, CreateBookInput>, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({ success: false, error: { message: "Solo un administrador puede registrar libros." } });
    return;
  }

  try {
    const copies = req.body.copies ?? 1;
    const book = await Book.create({ ...req.body, copies, onLoan: 0, available: copies > 0 });
    res.status(201).json(book);
  } catch (error) {
    console.error("[books] error creating:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo crear el libro" } });
  }
}

export async function updateBook(
  req: Request<{ id: string }, unknown, UpdateBookInput>,
  res: Response,
): Promise<void> {
  const id = readId(req.params.id);

  if (!isValidObjectId(id)) {
    res.status(400).json({ success: false, error: { message: "El id no es valido" } });
    return;
  }

  try {
    if (req.body.copies !== undefined) {
      const onLoan = await countActiveLoans(id);
      if (req.body.copies < onLoan) {
        res.status(400).json({
          success: false,
          error: { message: `Hay ${onLoan} ejemplares prestados. La cantidad no puede ser menor.` },
        });
        return;
      }
    }

    const book = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!book) {
      res.status(404).json({ success: false, error: { message: "Libro no encontrado" } });
      return;
    }

    await refreshStock(id);
    const fresh = await Book.findById(id);
    res.status(200).json(fresh);
  } catch (error) {
    console.error("[books] error updating:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo actualizar el libro" } });
  }
}

export async function loanBook(req: Request<{ id: string }, unknown, LoanBookInput>, res: Response): Promise<void> {
  const id = readId(req.params.id);

  if (!isValidObjectId(id)) {
    res.status(400).json({ success: false, error: { message: "El id no es valido" } });
    return;
  }

  try {
    const current = await Book.findById(id);

    if (!current) {
      res.status(404).json({ success: false, error: { message: "Libro no encontrado" } });
      return;
    }

    const user = req.user;
    if (!user?.id || !user.email) {
      res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
      return;
    }
    const reader: Reader = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      career: user.career,
    };
    if (req.body.available) {
      await returnOwnCopy(reader, id);
    } else {
      await borrowBook({ bookId: id, reader, actorIsAdmin: user.role === "admin", forSelf: true });
    }
    const book = await Book.findById(id);
    res.status(200).json(book);
  } catch (error) {
    if (error instanceof LoanError) {
      res.status(error.status).json({ success: false, error: { message: error.message } });
      return;
    }
    console.error("[books] error lending:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo registrar el prestamo" } });
  }
}

export async function deleteBook(req: Request, res: Response): Promise<void> {
  const id = readId(req.params.id);

  if (!isValidObjectId(id)) {
    res.status(400).json({ success: false, error: { message: "El id no es valido" } });
    return;
  }

  try {
    const onLoan = await countActiveLoans(id);
    if (onLoan > 0) {
      res.status(409).json({
        success: false,
        error: { message: "Hay ejemplares prestados. No se puede eliminar el título hasta que vuelvan." },
      });
      return;
    }

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      res.status(404).json({ success: false, error: { message: "Libro no encontrado" } });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("[books] error deleting:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo eliminar el libro" } });
  }
}
