import { Link } from "react-router";
import { spineColor } from "../lib/spine";
import { bookStock } from "../lib/stock";
import type { Book } from "../types/book";

function initials(title: string): string {
  const parts = title.split(/\s+/).filter((word) => word.length > 2);
  const source = parts.length > 0 ? parts : title.split(/\s+/);
  return source
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export const BookCard = ({ book }: { book: Book }) => {
  const year = new Date(book.publishedAt).getFullYear();

  return (
    <Link to={`/libros/${book._id}`} className="hover-lift panel flex h-full items-center gap-4 p-4">
      <span
        className="grid h-20 w-14 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white transition duration-500 group-hover:scale-105"
        style={{ background: spineColor(book.title) }}
        aria-hidden
      >
        {initials(book.title)}
      </span>
      <div className="min-w-0">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            bookStock(book).inRoom ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-200"
          }`}
        >
          {bookStock(book).inRoom ? "En sala" : "Sin ejemplares"}
        </span>
        <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-ink">{book.title}</h2>
        <p className="mt-1 text-sm text-muted">{book.author}</p>
        <p className="mt-1 text-xs text-muted">
          {book.career ?? "Formación general"} · {year} · {book.pages} págs
          {` · quedan ${bookStock(book).left} de ${bookStock(book).total}`}
        </p>
      </div>
    </Link>
  );
};
