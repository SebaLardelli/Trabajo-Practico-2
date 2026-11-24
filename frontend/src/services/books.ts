import { api } from "../lib/api";
import type { BookFormValues } from "../schemas/book.schema";
import type { Book, BookList } from "../types/book";

export interface ListBooksParams {
  page?: number;
  limit?: number;
  search?: string;
  available?: "true" | "false";
  faculty?: string;
  career?: string;
  sort?: "title" | "author" | "career" | "pages" | "publishedAt" | "copies" | "onLoan" | "left";
  dir?: "asc" | "desc";
}

export async function listBooks(params: ListBooksParams): Promise<BookList> {
  const query: Record<string, string | number> = { page: params.page ?? 1, limit: params.limit ?? 8 };
  if (params.search) query.search = params.search;
  if (params.available) query.available = params.available;
  if (params.faculty) query.faculty = params.faculty;
  if (params.career) query.career = params.career;
  if (params.sort) query.sort = params.sort;
  if (params.dir) query.dir = params.dir;
  const { data } = await api.get<BookList>("/books", { params: query });
  return data;
}

export async function getBook(id: string): Promise<Book> {
  const { data } = await api.get<Book>(`/books/${id}`);
  return data;
}

export async function createBook(values: BookFormValues): Promise<Book> {
  const { data } = await api.post<Book>("/books", values);
  return data;
}

export async function loanBook(id: string, available: boolean): Promise<Book> {
  const { data } = await api.patch<Book>(`/books/${id}/loan`, { available });
  return data;
}

export async function updateBook(id: string, values: BookFormValues): Promise<Book> {
  const { data } = await api.put<Book>(`/books/${id}`, values);
  return data;
}

export async function deleteBook(id: string): Promise<void> {
  await api.delete(`/books/${id}`);
}
