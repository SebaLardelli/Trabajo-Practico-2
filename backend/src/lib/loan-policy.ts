import mongoose, { isValidObjectId } from "mongoose";
import Book from "../models/Book.js";
import Loan, { ILoanDocument } from "../models/Loan.js";
import Notice, { NoticeKind } from "../models/Notice.js";
import { addDays, dayKey, formatDay, parseDay, todayKey } from "./days.js";
import { sendLibraryNotice } from "./mail.js";

export const LOAN_LIMIT = 3;
export const LOAN_DAYS = 15;

export class LoanError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "LoanError";
    this.status = status;
  }
}

export interface Reader {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  career?: string | null;
}

export interface LoanView {
  _id: string;
  bookId: string;
  title: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCareer: string;
  startDate: string;
  dueDate: string;
  returnedAt: string | null;
  status: ILoanDocument["status"];
}

async function notify(loan: ILoanDocument, kind: NoticeKind, title: string, body: string): Promise<void> {
  await Notice.create({ userId: loan.userId, kind, title, body, loanId: loan._id });
  try {
    await sendLibraryNotice(loan.userEmail, loan.userName, title, body);
  } catch (error) {
    console.error("[notices] no se pudo enviar el correo:", error);
  }
}

async function notifyOverdue(loan: ILoanDocument): Promise<void> {
  if (loan.overdueNotifiedAt || loan.returnedAt) return;
  const due = formatDay(loan.dueDate);
  await notify(
    loan,
    "overdue",
    `Préstamo vencido: ${loan.bookTitle}`,
    `El préstamo de «${loan.bookTitle}» venció el ${due} y sigue sin devolverse. No podés pedir otro libro hasta devolverlo.`,
  );
  loan.overdueNotifiedAt = new Date();
  loan.status = "overdue";
  await loan.save();
}

export function presentLoan(loan: ILoanDocument): LoanView {
  return {
    _id: String(loan._id),
    bookId: String(loan.book),
    title: loan.bookTitle,
    userId: loan.userId,
    userName: loan.userName,
    userEmail: loan.userEmail,
    userCareer: loan.userCareer,
    startDate: dayKey(loan.startDate),
    dueDate: dayKey(loan.dueDate),
    returnedAt: loan.returnedAt ? loan.returnedAt.toISOString() : null,
    status: loan.returnedAt ? "returned" : loan.status,
  };
}

export async function refreshStock(bookId: string): Promise<void> {
  if (!isValidObjectId(bookId)) return;
  const onLoan = await Loan.countDocuments({ book: bookId, returnedAt: null });
  const book = await Book.findById(bookId);
  if (!book) return;
  const copies = Math.max(0, book.copies ?? 0);
  book.copies = copies;
  book.onLoan = onLoan;
  book.available = copies > 0 && onLoan < copies;
  await book.save();
}

export async function reconcileStock(): Promise<void> {
  const books = await Book.find().select("_id copies");
  for (const book of books) {
    await refreshStock(String(book._id));
  }
}

export async function refreshOverdue(): Promise<void> {
  const today = parseDay(todayKey());
  const loans = await Loan.find({ returnedAt: null, dueDate: { $lt: today } });
  for (const loan of loans) {
    if (loan.status !== "overdue") {
      loan.status = "overdue";
      await loan.save();
    }
    await notifyOverdue(loan);
  }
}

export async function findReader(userId: string): Promise<Reader | null> {
  const db = mongoose.connection.db;
  if (!db) return null;
  const doc = await db.collection("user").findOne({ id: userId });
  if (!doc || typeof doc.id !== "string") return null;
  return {
    id: doc.id,
    name: typeof doc.name === "string" ? doc.name : "Lector",
    email: typeof doc.email === "string" ? doc.email : "",
    role: typeof doc.role === "string" ? doc.role : null,
    career: typeof doc.career === "string" ? doc.career : null,
  };
}

export async function borrowBook(input: {
  bookId: string;
  reader: Reader;
  actorIsAdmin: boolean;
  forSelf: boolean;
  startDate?: string;
  dueDate?: string;
}): Promise<ILoanDocument> {
  if (!isValidObjectId(input.bookId)) throw new LoanError(400, "El id no es valido");
  const book = await Book.findById(input.bookId);
  if (!book) throw new LoanError(404, "Libro no encontrado");

  await refreshOverdue();
  const open = await Loan.find({ userId: input.reader.id, returnedAt: null });
  const readerName = input.forSelf ? "Tenés" : `${input.reader.name} tiene`;
  if (open.some((loan) => loan.status === "overdue" || dayKey(loan.dueDate) < todayKey())) {
    throw new LoanError(
      403,
      input.forSelf
        ? "Tenés un préstamo vencido. No podés pedir otro libro hasta devolverlo."
        : `${input.reader.name} tiene un préstamo vencido. No puede retirar otro libro hasta devolverlo.`,
    );
  }
  if (open.length >= LOAN_LIMIT) {
    throw new LoanError(
      403,
      input.forSelf
        ? "Ya tenés 3 libros sin devolver. Devolvé alguno para pedir otro."
        : `${input.reader.name} ya tiene 3 libros sin devolver.`,
    );
  }
  if (open.some((loan) => String(loan.book) === String(book._id))) {
    throw new LoanError(409, input.forSelf ? "Ya retiraste este título y todavía no lo devolviste." : `${readerName} este título sin devolver.`);
  }

  const copies = Math.max(0, book.copies ?? 0);
  const onLoan = await Loan.countDocuments({ book: book._id, returnedAt: null });
  if (copies === 0 || onLoan >= copies) throw new LoanError(409, "No quedan ejemplares de este título.");

  const startKey = input.actorIsAdmin && input.startDate ? input.startDate : todayKey();
  const dueKey = input.actorIsAdmin && input.dueDate ? input.dueDate : addDays(startKey, LOAN_DAYS);
  if (dueKey < startKey) throw new LoanError(400, "La devolución no puede ser anterior al inicio.");

  const loan = await Loan.create({
    book: book._id,
    bookTitle: book.title,
    userId: input.reader.id,
    userName: input.reader.name,
    userEmail: input.reader.email,
    userCareer: input.reader.career ?? "",
    startDate: parseDay(startKey),
    dueDate: parseDay(dueKey),
    returnedAt: null,
    status: dueKey < todayKey() ? "overdue" : "active",
  });
  await refreshStock(String(book._id));
  await notify(
    loan,
    "loan",
    `Retiraste ${book.title}`,
    `Retiraste «${book.title}». La devolución es el ${formatDay(dueKey)}. Podés tener hasta ${LOAN_LIMIT} libros a la vez.`,
  );
  if (loan.status === "overdue") await notifyOverdue(loan);
  return loan;
}

export async function returnLoan(loanId: string, actor: Reader): Promise<ILoanDocument> {
  if (!isValidObjectId(loanId)) throw new LoanError(400, "El id no es valido");
  const loan = await Loan.findById(loanId);
  if (!loan) throw new LoanError(404, "Préstamo no encontrado");
  if (actor.role !== "admin" && loan.userId !== actor.id) {
    throw new LoanError(403, "Solo podés devolver tus propios libros.");
  }
  if (loan.returnedAt) throw new LoanError(400, "Ese ejemplar ya fue devuelto.");

  loan.returnedAt = new Date();
  loan.status = "returned";
  await loan.save();
  await refreshStock(String(loan.book));
  await notify(
    loan,
    "returned",
    `Devolviste ${loan.bookTitle}`,
    `Devolviste «${loan.bookTitle}». El ejemplar volvió a sala y ya podés pedir otro si no llegaste al máximo de ${LOAN_LIMIT}.`,
  );
  return loan;
}

export async function returnOwnCopy(actor: Reader, bookId: string): Promise<ILoanDocument> {
  const loan = await Loan.findOne({ book: bookId, userId: actor.id, returnedAt: null });
  if (!loan) throw new LoanError(404, "No tenés un ejemplar de este título para devolver.");
  return returnLoan(String(loan._id), actor);
}

export async function changeLoanDates(loanId: string, startDate: string, dueDate: string): Promise<ILoanDocument> {
  if (!isValidObjectId(loanId)) throw new LoanError(400, "El id no es valido");
  if (dueDate < startDate) throw new LoanError(400, "La devolución no puede ser anterior al inicio.");
  const loan = await Loan.findById(loanId);
  if (!loan) throw new LoanError(404, "Préstamo no encontrado");
  if (loan.returnedAt) throw new LoanError(400, "Ese préstamo ya fue devuelto.");

  loan.startDate = parseDay(startDate);
  loan.dueDate = parseDay(dueDate);
  const overdue = dueDate < todayKey();
  loan.status = overdue ? "overdue" : "active";
  if (!overdue) loan.overdueNotifiedAt = null;
  await loan.save();
  await notify(
    loan,
    "updated",
    `Nueva fecha para ${loan.bookTitle}`,
    `La biblioteca actualizó tu préstamo de «${loan.bookTitle}». Inicio: ${formatDay(startDate)}. Devolución: ${formatDay(dueDate)}.`,
  );
  if (overdue) await notifyOverdue(loan);
  return loan;
}

export async function countActiveLoans(bookId: string): Promise<number> {
  if (!isValidObjectId(bookId)) return 0;
  return Loan.countDocuments({ book: bookId, returnedAt: null });
}
