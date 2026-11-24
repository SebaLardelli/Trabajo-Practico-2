import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { addDays, formatDay, todayKey } from "../lib/days";
import { getErrorMessage } from "../lib/api";
import { borrowBook, listLoans, loanSummary, returnLoan, updateLoanDates } from "../services/loans";
import { listBooks } from "../services/books";
import type { Book } from "../types/book";
import type { LoanRecord, LoanSummary } from "../types/loan";

interface ListedUser {
  id: string;
  name: string;
  email: string;
  career?: string | null;
}

const emptySummary: LoanSummary = { titles: 0, copies: 0, onLoan: 0, inRoom: 0, active: 0, overdue: 0, returned: 0 };
const PAGE = 10;

function statusLabel(status: LoanRecord["status"]): string {
  if (status === "overdue") return "Vencido";
  if (status === "returned") return "Devuelto";
  return "En préstamo";
}

export const AdminLoans = () => {
  const [summary, setSummary] = useState<LoanSummary>(emptySummary);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"" | LoanRecord["status"]>("");
  const [readerId, setReaderId] = useState("");
  const [bookId, setBookId] = useState("");
  const [startDate, setStartDate] = useState(todayKey());
  const [dueDate, setDueDate] = useState(addDays(todayKey(), 15));
  const [drafts, setDrafts] = useState<Record<string, { startDate: string; dueDate: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (nextPage = page, status: "" | LoanRecord["status"] = filter) => {
    setLoading(true);
    try {
      const [nextSummary, listed] = await Promise.all([
        loanSummary(),
        listLoans({ status: status || undefined, page: nextPage, limit: PAGE }),
      ]);
      setSummary(nextSummary);
      setLoans(listed.data);
      setTotal(listed.meta.total);
      setTotalPages(listed.meta.totalPages);
      setDrafts(Object.fromEntries(listed.data.map((loan) => [loan._id, { startDate: loan.startDate, dueDate: loan.dueDate }])));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch((err: unknown) => setError(getErrorMessage(err)));
    void authClient.admin.listUsers({ query: { limit: 100 } }).then(({ data, error: listError }) => {
      if (listError) return;
      setUsers(
        (data?.users ?? []).map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email ?? "",
          career: "career" in user && typeof user.career === "string" ? user.career : null,
        })),
      );
    });
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      listBooks({ search: query, page: 1, limit: 20 })
        .then((result) => setBooks(result.data))
        .catch(() => setBooks([]));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  const create = async () => {
    setError(null);
    setNotice(null);
    if (!readerId || !bookId) {
      setError("Elegí un lector y un libro.");
      return;
    }
    setPending(true);
    try {
      const loan = await borrowBook({ bookId, userId: readerId, startDate, dueDate });
      setNotice(`Préstamo cargado: ${loan.title} para ${loan.userName}.`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const saveDates = async (loan: LoanRecord) => {
    const draft = drafts[loan._id];
    if (!draft) return;
    setError(null);
    setPending(true);
    try {
      await updateLoanDates(loan._id, draft);
      setNotice(`Fechas actualizadas para ${loan.title}. El lector recibe un aviso.`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const giveBack = async (loan: LoanRecord) => {
    setError(null);
    setPending(true);
    try {
      await returnLoan(loan._id);
      setNotice(`${loan.userName} devolvió ${loan.title}. Le avisamos.`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const stats = [
    ["Títulos", summary.titles],
    ["Ejemplares", summary.copies],
    ["En sala", summary.inRoom],
    ["Prestados", summary.onLoan],
    ["Vencidos", summary.overdue],
  ] as const;

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Préstamos</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Cada lector puede llevarse hasta 3 libros. Si tiene uno vencido, no puede pedir otro hasta devolverlo. Al devolver o al vencer, le llega un aviso.
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="panel px-4 py-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <form
        className="panel mt-6 grid gap-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void create();
        }}
      >
        <h2 className="text-xl font-semibold">Cargar un préstamo</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Lector
            <select className="field font-normal" value={readerId} onChange={(event) => setReaderId(event.target.value)}>
              <option value="">Elegí un lector</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} · {user.email}
                  {user.career ? ` · ${user.career}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Buscar libro
            <input className="field font-normal" value={query} placeholder="Título o autor" onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Ejemplar
          <select className="field font-normal" value={bookId} onChange={(event) => setBookId(event.target.value)}>
            <option value="">Elegí un título</option>
            {books.map((book) => (
              <option key={book._id} value={book._id}>
                {book.title} · {Math.max(0, (book.copies ?? 1) - (book.onLoan ?? 0))} en sala
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Inicio
            <input type="date" className="field font-normal" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Devolución
            <input type="date" className="field font-normal" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
        </div>
        <button type="submit" className="btn w-fit" disabled={pending}>
          {pending ? "Guardando…" : "Registrar préstamo"}
        </button>
      </form>

      {error && <p className="alert mt-4">{error}</p>}
      {notice && <p className="alert-ok mt-4">{notice}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["", "Todos"],
            ["active", "En préstamo"],
            ["overdue", "Vencidos"],
            ["returned", "Devueltos"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={label}
            type="button"
            className={filter === value ? "btn text-sm" : "btn-ghost text-sm"}
            onClick={() => {
              setFilter(value);
              setPage(1);
              load(1, value).catch((err: unknown) => setError(getErrorMessage(err)));
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="panel mt-4 overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-3 font-medium">Lector</th>
              <th className="px-4 py-3 font-medium">Libro</th>
              <th className="px-4 py-3 font-medium">Inicio</th>
              <th className="px-4 py-3 font-medium">Devolución</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const draft = drafts[loan._id] ?? { startDate: loan.startDate, dueDate: loan.dueDate };
              return (
                <tr key={loan._id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{loan.userName}</p>
                    <p className="text-xs text-muted">{loan.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">{loan.title}</td>
                  <td className="px-4 py-3">
                    {loan.status === "returned" ? (
                      formatDay(loan.startDate)
                    ) : (
                      <input
                        type="date"
                        className="field font-normal"
                        value={draft.startDate}
                        onChange={(event) => setDrafts((current) => ({ ...current, [loan._id]: { ...draft, startDate: event.target.value } }))}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {loan.status === "returned" ? (
                      formatDay(loan.dueDate)
                    ) : (
                      <input
                        type="date"
                        className="field font-normal"
                        value={draft.dueDate}
                        onChange={(event) => setDrafts((current) => ({ ...current, [loan._id]: { ...draft, dueDate: event.target.value } }))}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={loan.status === "overdue" ? "text-danger" : loan.status === "returned" ? "text-muted" : "text-ink"}>
                      {statusLabel(loan.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {loan.status !== "returned" && (
                      <div className="flex gap-2">
                        <button type="button" className="btn-ghost text-sm" disabled={pending} onClick={() => void saveDates(loan)}>
                          Fechas
                        </button>
                        <button type="button" className="btn-ghost text-sm" disabled={pending} onClick={() => void giveBack(loan)}>
                          Devolvió
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-muted">
                  {loading ? "Cargando la lista…" : "Todavía no hay préstamos en este filtro."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center text-sm text-muted">{total} préstamos</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          className="btn-ghost"
          disabled={page <= 1 || loading}
          onClick={() => {
            const next = page - 1;
            setPage(next);
            load(next).catch((err: unknown) => setError(getErrorMessage(err)));
          }}
        >
          Anterior
        </button>
        <span className="text-sm text-muted">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          className="btn-ghost"
          disabled={page >= totalPages || loading}
          onClick={() => {
            const next = page + 1;
            setPage(next);
            load(next).catch((err: unknown) => setError(getErrorMessage(err)));
          }}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
};
