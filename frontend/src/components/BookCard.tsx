import { Link } from "react-router";
import type { Book } from "../types/book";

export const BookCard = ({ book }: { book: Book }) => {
  const year = new Date(book.publishedAt).getFullYear();

  return (
    <Link to={`/libros/${book._id}`} className="panel block p-5 transition hover:-translate-y-0.5">
      <p className="text-xs font-medium tracking-[0.16em] text-brand-700 uppercase">
        {book.available ? "Disponible" : "Prestado"}
      </p>
      <h2 className="mt-2 font-serif text-2xl text-ink">{book.title}</h2>
      <p className="mt-2 text-sm text-ink/70">
        {book.author} · {year} · {book.pages} páginas
      </p>
    </Link>
  );
};
