import { Request, Response } from "express";
import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import { CreateLoanInput, ListLoansQuery, UpdateLoanInput } from "../schemas/loan.schema.js";
import {
  LoanError,
  Reader,
  borrowBook,
  changeLoanDates,
  findReader,
  presentLoan,
  refreshOverdue,
  returnLoan,
} from "../lib/loan-policy.js";

function sendError(res: Response, error: unknown, fallback: string): void {
  if (error instanceof LoanError) {
    res.status(error.status).json({ success: false, error: { message: error.message } });
    return;
  }
  console.error(fallback, error);
  res.status(500).json({ success: false, error: { message: fallback } });
}

function readerFrom(req: Request): Reader | null {
  const user = req.user;
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    career: user.career,
  };
}

export async function loanSummary(_req: Request, res: Response): Promise<void> {
  try {
    await refreshOverdue();
    const [titles, copiesAgg, open, overdue, returned] = await Promise.all([
      Book.countDocuments(),
      Book.aggregate<{ copies: number; onLoan: number }>([
        { $group: { _id: null, copies: { $sum: "$copies" }, onLoan: { $sum: "$onLoan" } } },
      ]),
      Loan.countDocuments({ returnedAt: null, status: "active" }),
      Loan.countDocuments({ returnedAt: null, status: "overdue" }),
      Loan.countDocuments({ status: "returned" }),
    ]);
    const stock = copiesAgg[0] ?? { copies: 0, onLoan: 0 };
    res.status(200).json({
      titles,
      copies: stock.copies ?? 0,
      onLoan: stock.onLoan ?? 0,
      inRoom: Math.max(0, (stock.copies ?? 0) - (stock.onLoan ?? 0)),
      active: open,
      overdue,
      returned,
    });
  } catch (error) {
    sendError(res, error, "No se pudo armar el resumen");
  }
}

export async function listLoans(_req: Request, res: Response): Promise<void> {
  const { status, page, limit } = res.locals.query as ListLoansQuery;
  try {
    await refreshOverdue();
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [loans, total] = await Promise.all([
      Loan.find(filter)
        .select("book bookTitle userId userName userEmail userCareer startDate dueDate returnedAt status")
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Loan.countDocuments(filter),
    ]);
    res.status(200).json({
      data: loans.map((loan) => presentLoan(loan as never)),
      meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    sendError(res, error, "No se pudieron listar los préstamos");
  }
}

export async function listMyLoans(req: Request, res: Response): Promise<void> {
  const reader = readerFrom(req);
  if (!reader) {
    res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
    return;
  }
  try {
    await refreshOverdue();
    const loans = await Loan.find({ userId: reader.id }).sort({ status: 1, dueDate: 1 });
    res.status(200).json({ data: loans.map(presentLoan) });
  } catch (error) {
    sendError(res, error, "No se pudieron listar tus préstamos");
  }
}

export async function createLoan(req: Request<Record<string, string>, unknown, CreateLoanInput>, res: Response): Promise<void> {
  const actor = readerFrom(req);
  if (!actor) {
    res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
    return;
  }

  try {
    const actorIsAdmin = actor.role === "admin";
    let reader = actor;
    if (req.body.userId && req.body.userId !== actor.id) {
      if (!actorIsAdmin) throw new LoanError(403, "Solo un administrador puede cargar el préstamo de otro lector.");
      const found = await findReader(req.body.userId);
      if (!found) throw new LoanError(404, "No encontramos a ese lector.");
      reader = found;
    }
    const loan = await borrowBook({
      bookId: req.body.bookId,
      reader,
      actorIsAdmin,
      forSelf: reader.id === actor.id,
      startDate: req.body.startDate,
      dueDate: req.body.dueDate,
    });
    res.status(201).json(presentLoan(loan));
  } catch (error) {
    sendError(res, error, "No se pudo registrar el préstamo");
  }
}

export async function updateLoan(
  req: Request<{ id: string }, unknown, UpdateLoanInput>,
  res: Response,
): Promise<void> {
  try {
    const loan = await changeLoanDates(req.params.id, req.body.startDate, req.body.dueDate);
    res.status(200).json(presentLoan(loan));
  } catch (error) {
    sendError(res, error, "No se pudieron actualizar las fechas");
  }
}

export async function returnLoanById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const actor = readerFrom(req);
  if (!actor) {
    res.status(401).json({ success: false, error: { message: "Sesion requerida" } });
    return;
  }
  try {
    const loan = await returnLoan(req.params.id, actor);
    res.status(200).json(presentLoan(loan));
  } catch (error) {
    sendError(res, error, "No se pudo registrar la devolución");
  }
}
