import { useEffect, useState } from "react";
import { BookForm } from "../components/BookForm";
import { getErrorMessage } from "../lib/api";
import type { BookFormValues } from "../schemas/book.schema";
import { createBook, deleteBook, listBooks, updateBook } from "../services/books";
import type { Book } from "../types/book";

export const Admin = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [editing, setEditing] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const result = await listBooks({ page: 1, limit: 100 });
    setBooks(result.data);
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
    <section className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <BookForm book={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      <div>
        <h1 className="font-serif text-4xl">Panel de administración</h1>
        <p className="mt-2 mb-4 text-sm text-ink/60">Solo un admin puede crear, editar y eliminar libros.</p>
        {error && <p className="mb-4 alert">{error}</p>}
        <ul className="flex flex-col gap-3">
          {books.map((book) => (
            <li key={book._id} className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-ink/60">
                  {book.author} · {book.pages} págs · {book.available ? "Disponible" : "Prestado"}
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
          {books.length === 0 && <li className="text-ink/60">Todavía no hay libros cargados.</li>}
        </ul>
      </div>
    </section>
  );
};
