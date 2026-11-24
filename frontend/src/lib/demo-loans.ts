import { addDays, formatDay, todayKey } from "./days";
import type { LoanRecord } from "../types/loan";

const LOANS_KEY = "biblioteca.demoLoans";
const NOTICES_KEY = "biblioteca.demoNotices";
const LIMIT = 3;

export interface DemoNotice {
  _id: string;
  kind: "loan" | "returned" | "overdue";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  loanId?: string;
}

function readLoans(): LoanRecord[] {
  try {
    const raw = localStorage.getItem(LOANS_KEY);
    const parsed = raw ? (JSON.parse(raw) as LoanRecord[]) : [];
    return parsed.map(withStatus);
  } catch {
    return [];
  }
}

function writeLoans(loans: LoanRecord[]): void {
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
}

function readNotices(): DemoNotice[] {
  try {
    const raw = localStorage.getItem(NOTICES_KEY);
    return raw ? (JSON.parse(raw) as DemoNotice[]) : [];
  } catch {
    return [];
  }
}

function pushNotice(notice: Omit<DemoNotice, "_id" | "read" | "createdAt" | "loanId">, loanId?: string): void {
  const next: DemoNotice = { ...notice, loanId, _id: `demo-notice-${Date.now()}`, read: false, createdAt: new Date().toISOString() };
  localStorage.setItem(NOTICES_KEY, JSON.stringify([next, ...readNotices()].slice(0, 40)));
}

function withStatus(loan: LoanRecord): LoanRecord {
  if (loan.returnedAt) return { ...loan, status: "returned" };
  if (loan.dueDate < todayKey()) return { ...loan, status: "overdue" };
  return { ...loan, status: "active" };
}

export function demoLoans(): LoanRecord[] {
  const loans = readLoans();
  const announced = new Set(
    readNotices()
      .filter((item) => item.kind === "overdue")
      .map((item) => item.loanId ?? item.title),
  );
  for (const loan of loans) {
    if (loan.status !== "overdue") continue;
    if (announced.has(loan._id)) continue;
    pushNotice(
      {
        kind: "overdue",
        title: "Se te venció",
        body: `Se te pasó la fecha del ${formatDay(loan.dueDate)}. Devolvelo para poder pedir otro.`,
      },
      loan._id,
    );
    announced.add(loan._id);
  }
  return loans;
}

export function demoNotices(): DemoNotice[] {
  demoLoans();
  return readNotices();
}

export function markDemoNoticesRead(): void {
  const next = readNotices().map((item) => ({ ...item, read: true }));
  localStorage.setItem(NOTICES_KEY, JSON.stringify(next));
}

export function demoBorrow(bookId: string, title: string): { loan?: LoanRecord; error?: string } {
  const open = demoLoans().filter((loan) => loan.status !== "returned");
  if (open.some((loan) => loan.status === "overdue")) {
    return { error: "Tenés un préstamo vencido. No podés pedir otro libro hasta devolverlo." };
  }
  if (open.length >= LIMIT) {
    return { error: "Ya tenés 3 libros sin devolver. Devolvé alguno para pedir otro." };
  }
  if (open.some((loan) => loan.bookId === bookId)) {
    return { error: "Ya retiraste este título y todavía no lo devolviste." };
  }
  const startDate = todayKey();
  const dueDate = addDays(startDate, 15);
  const loan: LoanRecord = {
    _id: `demo-loan-${Date.now()}`,
    bookId,
    title,
    userId: "demo",
    userName: "Demostración",
    userEmail: "",
    userCareer: "",
    startDate,
    dueDate,
    returnedAt: null,
    status: "active",
  };
  writeLoans([loan, ...readLoans()]);
  pushNotice({
    kind: "loan",
    title: "Ya lo retiraste",
    body: `Ya lo retiraste. Devolvelo antes del ${formatDay(dueDate)}.`,
  });
  return { loan };
}

export function demoReturn(bookId: string): { loan?: LoanRecord; error?: string } {
  const loans = readLoans();
  const current = loans.find((loan) => loan.bookId === bookId && loan.status !== "returned");
  if (!current) return { error: "No tenés un ejemplar de este título para devolver." };
  const returned: LoanRecord = { ...current, status: "returned", returnedAt: new Date().toISOString() };
  writeLoans(loans.map((loan) => (loan._id === current._id ? returned : loan)));
  pushNotice({
    kind: "returned",
    title: current.dueDate < todayKey() ? "Lo devolvimos" : "Ya lo devolvimos",
    body: current.dueDate < todayKey()
      ? "Lo devolvimos, pero el plazo ya había pasado."
      : "Ya lo devolvimos. Si no llegaste a 3, podés pedir otro.",
  });
  return { loan: returned };
}
