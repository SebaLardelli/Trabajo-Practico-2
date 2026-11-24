import { addDays, todayKey } from "./days";
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

function pushNotice(notice: Omit<DemoNotice, "_id" | "read" | "createdAt">): void {
  const next: DemoNotice = { ...notice, _id: `demo-notice-${Date.now()}`, read: false, createdAt: new Date().toISOString() };
  localStorage.setItem(NOTICES_KEY, JSON.stringify([next, ...readNotices()].slice(0, 40)));
}

function withStatus(loan: LoanRecord): LoanRecord {
  if (loan.returnedAt) return { ...loan, status: "returned" };
  if (loan.dueDate < todayKey()) return { ...loan, status: "overdue" };
  return { ...loan, status: "active" };
}

export function demoLoans(): LoanRecord[] {
  const loans = readLoans();
  const announced = new Set(readNotices().filter((item) => item.kind === "overdue").map((item) => item.title));
  for (const loan of loans) {
    if (loan.status !== "overdue") continue;
    const title = `Préstamo vencido: ${loan.title}`;
    if (announced.has(title)) continue;
    pushNotice({
      kind: "overdue",
      title,
      body: `El préstamo de «${loan.title}» venció el ${loan.dueDate} y sigue sin devolverse.`,
    });
    announced.add(title);
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
    title: `Retiraste ${title}`,
    body: `Retiraste «${title}». La devolución es el ${dueDate}. Este préstamo queda en este navegador porque el ejemplar es de demostración.`,
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
    title: `Devolviste ${current.title}`,
    body: `Devolviste «${current.title}». El ejemplar volvió a sala.`,
  });
  return { loan: returned };
}
