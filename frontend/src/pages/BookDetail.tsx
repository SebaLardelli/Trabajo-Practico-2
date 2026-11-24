import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { findDemoBook, setDemoAvailable } from "../data/catalog";
import { getErrorMessage } from "../lib/api";
import { useSession } from "../lib/auth-client";
import { demoBorrow, demoLoans, demoReturn } from "../lib/demo-loans";
import { formatDay } from "../lib/days";
import { spineColor } from "../lib/spine";
import { bookStock } from "../lib/stock";
import { getBook } from "../services/books";
import { borrowBook, listMyLoans, returnLoan } from "../services/loans";
import type { Book } from "../types/book";
import type { LoanRecord } from "../types/loan";

export const BookDetail = () => {
  const { id = "" } = useParams();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loans, setLoans] = useState<LoanRecord[]>([]);

  useEffect(() => {
    let active = true;
    const demo = findDemoBook(id);
    if (demo) {
      setBook(demo);
      return () => {
        active = false;
      };
    }
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

  useEffect(() => {
    if (!user) {
      setLoans([]);
      return;
    }
    if (id.startsWith("demo-")) {
      setLoans(demoLoans());
      return;
    }
    listMyLoans()
      .then(setLoans)
      .catch(() => setLoans([]));
  }, [user, id]);

  const activeLoan = loans.find((loan) => loan.bookId === id && loan.status !== "returned") ?? null;
  const open = loans.filter((loan) => loan.status !== "returned");
  const policyBlock = !activeLoan && open.some((loan) => loan.status === "overdue")
    ? "Tenés un préstamo vencido. No podés pedir otro libro hasta devolverlo."
    : !activeLoan && open.length >= 3
      ? "Ya tenés 3 libros sin devolver. Devolvé alguno para pedir otro."
    : !activeLoan && book && bookStock(book).left === 0
      ? "No quedan ejemplares de este título."
        : null;

  const handleLoan = async () => {
    if (!book) return;
    if (!user) {
      setNotice("No tenés permisos para alquilar este ejemplar.");
      return;
    }
    if (policyBlock && !activeLoan) {
      setNotice(policyBlock);
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      if (book._id.startsWith("demo-")) {
        const result = activeLoan ? demoReturn(book._id) : demoBorrow(book._id, book.title);
        if (result.error) {
          setNotice(result.error);
        } else {
          setDemoAvailable(book._id, Boolean(activeLoan));
          const fresh = findDemoBook(book._id);
          if (fresh) setBook(fresh);
          setLoans(demoLoans());
          setNotice(activeLoan ? `Devolviste «${book.title}».` : `Retiraste «${book.title}». Devolvé antes del ${formatDay(result.loan?.dueDate ?? "")}.`);
        }
        return;
      }

      if (activeLoan) {
        await returnLoan(activeLoan._id);
        setNotice(`Devolviste «${book.title}». Te avisamos en Avisos.`);
      } else {
        const created = await borrowBook({ bookId: book._id });
        setNotice(`Retiraste «${book.title}». La devolución es el ${formatDay(created.dueDate)}.`);
      }
      const [fresh, mine] = await Promise.all([getBook(book._id), listMyLoans()]);
      setBook(fresh);
      setLoans(mine);
    } catch (err: unknown) {
      setNotice(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <section className="panel max-w-lg p-6">
        <p className="text-danger">{error}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-700">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  if (!book) return <div className="skeleton h-64 max-w-3xl" aria-busy="true" />;

  const shelf = `/?faculty=${encodeURIComponent(book.faculty ?? "")}&career=${encodeURIComponent(book.career ?? "")}`;
  const stock = bookStock(book);

  return (
    <article className="panel grid max-w-3xl gap-6 p-6 sm:grid-cols-[8rem_1fr] sm:p-8">
      <div
        className="grid h-44 place-items-center rounded-2xl text-3xl font-semibold text-white sm:h-auto"
        style={{ background: spineColor(book.title) }}
        aria-hidden
      >
        {book.title.slice(0, 1)}
      </div>
      <div>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            stock.inRoom ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-200"
          }`}
        >
          {activeLoan ? "En tu poder" : stock.inRoom ? "En sala" : "Sin ejemplares"}
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{book.title}</h1>
        <p className="mt-2 text-lg text-muted">{book.author}</p>
        <p className="mt-1 text-sm text-brand-700">
          {book.faculty ?? "Formación general"} · {book.career ?? "Todas las carreras"}
        </p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Podés llevarte hasta 3 libros. Si uno está vencido, no podés pedir otro hasta devolverlo. El plazo inicial es de quince días.
        </p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl bg-field px-4 py-3">
            <dt className="text-muted">Totales</dt>
            <dd className="text-xl font-semibold">{stock.total}</dd>
          </div>
          <div className="rounded-2xl bg-field px-4 py-3">
            <dt className="text-muted">Quedan</dt>
            <dd className="text-xl font-semibold">{stock.left === 0 ? "Sin ejemplares" : stock.left}</dd>
          </div>
          <div className="rounded-2xl bg-field px-4 py-3">
            <dt className="text-muted">Prestados</dt>
            <dd className="text-xl font-semibold">{stock.loaned}</dd>
          </div>
        </dl>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-field px-4 py-3">
            <dt className="text-muted">Páginas</dt>
            <dd className="text-xl font-semibold">{book.pages}</dd>
          </div>
          <div className="rounded-2xl bg-field px-4 py-3">
            <dt className="text-muted">Publicación</dt>
            <dd className="text-xl font-semibold">{new Date(book.publishedAt).toLocaleDateString("es-AR")}</dd>
          </div>
        </dl>

        {!isPending && !user && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="alert">No tenés permisos para alquilar este ejemplar.</p>
            <Link to="/login" className="btn w-fit text-sm">
              Ingresar
            </Link>
          </div>
        )}

        {user && activeLoan && (
          <p className="alert-warn mt-6">
            Lo retiraste el {formatDay(activeLoan.startDate)}. Tenés que devolverlo el {formatDay(activeLoan.dueDate)}.
            {activeLoan.status === "overdue" ? " Está vencido." : ""}
          </p>
        )}

        {user && (activeLoan || !policyBlock) && (
          <button type="button" className="btn mt-6" disabled={saving} onClick={handleLoan}>
            {saving ? "Guardando…" : activeLoan ? "Devolver" : "Alquilar"}
          </button>
        )}

        {user && policyBlock && !activeLoan && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="alert">{policyBlock}</p>
            <Link to="/alquilados" className="text-sm font-medium text-brand-700">
              Ver libros alquilados
            </Link>
          </div>
        )}

        {notice && <p className="mt-3 text-sm text-muted">{notice}</p>}

        <Link to={shelf} className="mt-6 inline-block text-sm font-medium text-brand-700">
          Volver a {book.career ?? "la carrera"}
        </Link>
      </div>
    </article>
  );
};
