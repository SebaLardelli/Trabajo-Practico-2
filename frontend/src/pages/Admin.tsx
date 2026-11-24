import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "../components/AdminNav";
import { BookForm } from "../components/BookForm";
import { catalogAuthors, filterDemoBooks } from "../data/catalog";
import { getErrorMessage } from "../lib/api";
import type { BookFormValues } from "../schemas/book.schema";
import { loanSummary } from "../services/loans";
import { createBook, deleteBook, listBooks, updateBook } from "../services/books";
import type { Book } from "../types/book";
import type { LoanSummary } from "../types/loan";

type SortKey = "title" | "author" | "career" | "pages" | "publishedAt" | "copies" | "onLoan" | "available";

const columns: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "title", label: "Título" },
  { key: "author", label: "Autor" },
  { key: "career", label: "Carrera" },
  { key: "pages", label: "Páginas", align: "right" },
  { key: "publishedAt", label: "Publicación" },
  { key: "copies", label: "Ejemplares", align: "right" },
  { key: "onLoan", label: "Prestados", align: "right" },
  { key: "available", label: "Estado" },
];

function sortValue(book: Book, key: SortKey): string | number {
  if (key === "pages") return book.pages;
  if (key === "copies") return book.copies ?? 1;
  if (key === "onLoan") return book.onLoan ?? 0;
  if (key === "available") return book.available ? 1 : 0;
  if (key === "publishedAt") return new Date(book.publishedAt).getTime() || 0;
  return (book[key] ?? "").toLocaleLowerCase("es");
}

export const Admin = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [editing, setEditing] = useState<Book | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [fromPage, setFromPage] = useState(false);
  const [query, setQuery] = useState("");
  const [career, setCareer] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const load = async () => {
    const [first, stock] = await Promise.all([listBooks({ page: 1, limit: 100 }), loanSummary().catch(() => null)]);
    if (first.meta.total === 0) {
      setBooks(filterDemoBooks({ page: 1, limit: 500 }).data);
      setSummary(null);
      setFromPage(true);
      return;
    }
    const loaded = [...first.data];
    for (let page = 2; page <= first.meta.totalPages; page += 1) {
      const next = await listBooks({ page, limit: 100 });
      loaded.push(...next.data);
    }
    setBooks(loaded);
    setSummary(stock);
    setFromPage(false);
  };

  useEffect(() => {
    load().catch((err: unknown) => setError(getErrorMessage(err)));
  }, []);

  const careers = useMemo(
    () => [...new Set(books.map((book) => book.career).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "es")),
    [books],
  );
  const authors = useMemo(
    () => [...new Set([...catalogAuthors(), ...books.map((book) => book.author)])].sort((a, b) => a.localeCompare(b, "es")),
    [books],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    const filtered = books.filter((book) => {
      if (career && book.career !== career) return false;
      if (!needle) return true;
      return [book.title, book.author, book.career].some((value) => value?.toLocaleLowerCase("es").includes(needle));
    });
    const direction = sortDir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      const left = sortValue(a, sortKey);
      const right = sortValue(b, sortKey);
      if (typeof left === "number" && typeof right === "number") return (left - right) * direction;
      return String(left).localeCompare(String(right), "es") * direction;
    });
  }, [books, career, query, sortDir, sortKey]);

  const sortBy = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const handleSave = async (values: BookFormValues) => {
    if (editing?._id.startsWith("demo-")) {
      setError("Estos libros son los que se ven en el inicio. Se pueden editar cuando quedan guardados en la base.");
      return;
    }
    if (editing) {
      await updateBook(editing._id, values);
    } else {
      await createBook(values);
    }
    setEditing(null);
    setFormOpen(false);
    await load();
  };

  const handleDelete = async (book: Book) => {
    if (book._id.startsWith("demo-")) {
      setError("Estos libros son los que se ven en el inicio. Se pueden eliminar cuando quedan guardados en la base.");
      return;
    }
    if (!window.confirm(`¿Eliminar ${book.title}?`)) return;
    try {
      await deleteBook(book._id);
      if (editing?._id === book._id) {
        setEditing(null);
        setFormOpen(false);
      }
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const stats = summary
    ? [
        ["Títulos", summary.titles],
        ["Ejemplares", summary.copies],
        ["En sala", summary.inRoom],
        ["Prestados", summary.onLoan],
      ]
    : [["Títulos", books.length]];

  return (
    <section>
      <AdminNav />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Libros</h1>
          <p className="mt-2 text-sm text-muted">
            {fromPage ? "Este listado es el mismo catálogo que se ve en el inicio." : "Tocá un encabezado para ordenar la tabla."}
          </p>
        </div>
        <button
          type="button"
          className="btn text-sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
            setError(null);
          }}
        >
          Nuevo libro
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={String(label)} className="panel px-4 py-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      {formOpen && (
        <div className="mt-6 max-w-xl">
          <BookForm
            book={editing}
            authors={authors}
            onSave={handleSave}
            onCancel={() => {
              setEditing(null);
              setFormOpen(false);
            }}
          />
        </div>
      )}

      {error && <p className="mt-4 alert">{error}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-medium">
          Buscar
          <input className="field font-normal" value={query} placeholder="Título, autor o carrera" onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:w-72">
          Carrera
          <select className="field font-normal" value={career} onChange={(event) => setCareer(event.target.value)}>
            <option value="">Todas</option>
            {careers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-sm text-muted">
        {visible.length} de {books.length} libros
      </p>

      <div className="panel mt-3 max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-card text-muted">
            <tr className="border-b border-line">
              {columns.map((column) => {
                const active = sortKey === column.key;
                return (
                  <th key={column.key} className="px-3 py-3 font-medium" aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-1 hover:text-ink ${column.align === "right" ? "justify-end" : ""} ${active ? "text-ink" : ""}`}
                      onClick={() => sortBy(column.key)}
                    >
                      {column.label}
                      <span aria-hidden className="text-xs">
                        {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
              <th className="px-3 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((book) => (
              <tr key={book._id} className={`border-b border-line last:border-0 ${editing?._id === book._id ? "bg-field" : ""}`}>
                <td className="px-3 py-3 font-medium">{book.title}</td>
                <td className="px-3 py-3">{book.author}</td>
                <td className="px-3 py-3">{book.career ?? "—"}</td>
                <td className="px-3 py-3 text-right tabular-nums">{book.pages}</td>
                <td className="px-3 py-3">{new Date(book.publishedAt).toLocaleDateString("es-AR")}</td>
                <td className="px-3 py-3 text-right tabular-nums">{book.copies ?? 1}</td>
                <td className="px-3 py-3 text-right tabular-nums">{book.onLoan ?? 0}</td>
                <td className="px-3 py-3">
                  <span className={book.available ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-200"}>
                    {book.available ? "En sala" : "Sin ejemplares"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-ghost text-sm"
                      onClick={() => {
                        setEditing(book);
                        setFormOpen(true);
                        setError(null);
                      }}
                    >
                      Editar
                    </button>
                    <button type="button" className="btn-ghost text-sm text-danger" onClick={() => void handleDelete(book)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-muted">
                  No hay libros con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
