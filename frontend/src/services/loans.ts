import { api } from "../lib/api";
import type { LoanRecord, LoanSummary, NoticeItem } from "../types/loan";

export async function loanSummary(): Promise<LoanSummary> {
  const { data } = await api.get<LoanSummary>("/loans/summary");
  return data;
}

export async function listLoans(params?: {
  status?: LoanRecord["status"];
  page?: number;
  limit?: number;
}): Promise<{ data: LoanRecord[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
  const query: Record<string, string | number> = { page: params?.page ?? 1, limit: params?.limit ?? 10 };
  if (params?.status) query.status = params.status;
  const { data } = await api.get<{ data: LoanRecord[]; meta: { total: number; page: number; limit: number; totalPages: number } }>("/loans", {
    params: query,
  });
  return data;
}

export async function listMyLoans(): Promise<LoanRecord[]> {
  const { data } = await api.get<{ data: LoanRecord[] }>("/loans/mine");
  return data.data;
}

export async function borrowBook(body: {
  bookId: string;
  userId?: string;
  startDate?: string;
  dueDate?: string;
}): Promise<LoanRecord> {
  const { data } = await api.post<LoanRecord>("/loans", body);
  return data;
}

export async function returnLoan(id: string): Promise<LoanRecord> {
  const { data } = await api.post<LoanRecord>(`/loans/${id}/return`);
  return data;
}

export async function updateLoanDates(id: string, body: { startDate: string; dueDate: string }): Promise<LoanRecord> {
  const { data } = await api.patch<LoanRecord>(`/loans/${id}`, body);
  return data;
}

export async function listNotices(): Promise<NoticeItem[]> {
  const { data } = await api.get<{ data: NoticeItem[] }>("/notices");
  return data.data;
}

export async function unreadNotices(): Promise<number> {
  const { data } = await api.get<{ count: number }>("/notices/unread");
  return data.count;
}

export async function markNoticesRead(ids?: string[]): Promise<void> {
  await api.post("/notices/read", ids ? { ids } : {});
}
