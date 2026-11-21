import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getErrorMessage } from "../lib/api";
import { getBook } from "../services/books";
import type { Book } from "../types/book";

export const BookDetail = () => {
  const { id = "" } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBook(id)
      .then((data) => {
        if (active) setBook(data);
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <section className="panel max-w-lg p-6">
        <p className="text-danger">{error}</p>
        <Link to="/" className="mt-4 inline-block text-sm underline">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  if (!book) return <p className="text-ink/50">Cargando...</p>;

  return (
    <article className="panel max-w-2xl p-8">
      <p className="text-xs font-medium tracking-[0.16em] text-brand-700 uppercase">
        {book.available ? "Disponible" : "Prestado"}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{book.title}</h1>
      <p className="mt-3 text-lg text-ink/70">{book.author}</p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink/50">Páginas</dt>
          <dd>{book.pages}</dd>
        </div>
        <div>
          <dt className="text-ink/50">Publicación</dt>
          <dd>{new Date(book.publishedAt).toLocaleDateString("es-AR")}</dd>
        </div>
      </dl>
      <Link to="/" className="mt-8 inline-block text-sm underline">
        Volver al catálogo
      </Link>
    </article>
  );
};
