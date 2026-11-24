import { useEffect, useState } from "react";
import { AdminNav } from "../components/AdminNav";
import { BookForm } from "../components/BookForm";
import { getErrorMessage } from "../lib/api";
import type { BookFormValues } from "../schemas/book.schema";
import { loanSummary } from "../services/loans";
import { createBook, deleteBook, listBooks, updateBook } from "../services/books";
import type { Book } from "../types/book";
import type { LoanSummary } from "../types/loan";

export const Admin = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [editing, setEditing] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<LoanSummary | null>(null);

  const load = async () => {
    const [result, stock] = await Promise.all([listBooks({ page: 1, limit: 100 }), loanSummary().catch(() => null)]);
    setBooks(result.data);
    setSummary(stock);
  };

  useEffect(() => {
    load().catch((err: unknown) => setError(getErrorMessage(err)));
  }, []);

  const handleSave = async (values: BookFormValues) => {
    if (editing) {
      await updateBook(editing._id, values);
      setEditing(null);
    } else {
      await createBook(values);
    }
    await load();
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`¿Eliminar ${book.title}?`)) return;
    try {
      await deleteBook(book._id);
      if (editing?._id === book._id) setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section>
      <AdminNav />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <BookForm book={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Libros</h1>
        <p className="mt-2 mb-4 text-sm text-muted">
          Cargá títulos y la cantidad de ejemplares.
          {summary ? ` Hay ${summary.copies} ejemplares, ${summary.inRoom} en sala y ${summary.onLoan} prestados.` : ""}
        </p>
        {error && <p className="mb-4 alert">{error}</p>}
        <ul className="flex flex-col gap-3">
          {books.map((book) => (
            <li key={book._id} className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-ink/60">
                  {book.author} · {book.career ?? "Sin carrera"} · {book.copies ?? 1} ejemplares · {book.onLoan ?? 0} prestados
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-ghost text-sm" onClick={() => setEditing(book)}>
                  Editar
                </button>
                <button type="button" className="btn-ghost text-sm text-danger" onClick={() => void handleDelete(book)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
          {books.length === 0 && <li className="text-muted">El estante todavía está vacío.</li>}
        </ul>
      </div>
      </div>
    </section>
  );
};
