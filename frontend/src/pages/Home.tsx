import { useEffect, useState } from "react";
import { BookCard } from "../components/BookCard";
import { getErrorMessage } from "../lib/api";
import { listBooks } from "../services/books";
import type { BookList } from "../types/book";

export const Home = () => {
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [available, setAvailable] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<BookList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listBooks({ page, search, available: available || undefined })
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, search, available]);

  const totalPages = result?.meta.totalPages ?? 1;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-brand-700 uppercase">Catálogo</p>
        <h1 className="mt-1 font-serif text-4xl">Libros</h1>
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(draft.trim());
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Buscar por título o autor"
          className="field max-w-sm"
        />
        <select
          value={available}
          onChange={(event) => {
            setAvailable(event.target.value as "" | "true" | "false");
            setPage(1);
          }}
          className="field w-auto"
        >
          <option value="">Todos</option>
          <option value="true">Disponibles</option>
          <option value="false">Prestados</option>
        </select>
        <button type="submit" className="btn">
          Buscar
        </button>
      </form>
      {error && <p className="alert">{error}</p>}
      {loading && <p className="text-ink/50">Cargando libros...</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {result?.data.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
      {!loading && result?.data.length === 0 && <p className="text-ink/60">No hay libros con ese filtro.</p>}
      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button type="button" className="btn-ghost" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            Anterior
          </button>
          <span className="text-sm text-ink/70">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            className="btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
};
