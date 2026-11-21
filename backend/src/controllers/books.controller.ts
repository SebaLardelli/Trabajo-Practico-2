import { Request, Response } from "express";
import { QueryFilter, isValidObjectId } from "mongoose";
import Book, { IBookDocument } from "../models/Book.js";
import { CreateBookInput, ListBooksQuery, UpdateBookInput } from "../schemas/book.schema.js";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function listBooks(_req: Request, res: Response): Promise<void> {
  const { search, page, limit, available } = res.locals.query as ListBooksQuery;
  const filter: QueryFilter<IBookDocument> = {};

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { author: { $regex: safeSearch, $options: "i" } },
    ];
  }

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
  try {
    const book = await Book.create(req.body);
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
    const book = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!book) {
      res.status(404).json({ success: false, error: { message: "Libro no encontrado" } });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("[books] error updating:", error);
    res.status(500).json({ success: false, error: { message: "No se pudo actualizar el libro" } });
  }
}

export async function deleteBook(req: Request, res: Response): Promise<void> {
  const id = readId(req.params.id);

  if (!isValidObjectId(id)) {
    res.status(400).json({ success: false, error: { message: "El id no es valido" } });
    return;
  }

  try {
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
