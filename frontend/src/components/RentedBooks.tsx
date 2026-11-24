import { useEffect, useState } from "react";
import { Link } from "react-router";
import { formatDay } from "../lib/days";
import { demoLoans, demoReturn } from "../lib/demo-loans";
import { getErrorMessage } from "../lib/api";
import { listMyLoans, returnLoan } from "../services/loans";
import type { LoanRecord } from "../types/loan";

function rank(status: LoanRecord["status"]): number {
  if (status === "overdue") return 0;
  if (status === "active") return 1;
  return 2;
}

function statusLabel(status: LoanRecord["status"]): string {
  if (status === "overdue") return "Vencido";
  if (status === "returned") return "Devuelto";
  return "Alquilado";
}

export const RentedBooks = ({ variant }: { variant: "page" | "home" }) => {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const load = async () => {
    const local = demoLoans();
    try {
      const remote = await listMyLoans();
      setLoans([...remote, ...local].sort((a, b) => rank(a.status) - rank(b.status)));
      setError(null);
    } catch {
      setLoans(local.sort((a, b) => rank(a.status) - rank(b.status)));
      setError(local.length === 0 ? "No se pudo leer el listado en el servidor." : null);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const giveBack = async (loan: LoanRecord) => {
    setPendingId(loan._id);
    setNotice(null);
    try {
      if (loan._id.startsWith("demo-")) {
        const result = demoReturn(loan.bookId);
        if (result.error) setError(result.error);
        else setNotice(`Devolviste «${loan.title}».`);
      } else {
        await returnLoan(loan._id);
        setNotice(`Devolviste «${loan.title}».`);
      }
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  const visible = variant === "home" ? loans.filter((loan) => loan.status !== "returned") : loans;
  if (!ready) return variant === "page" ? <div className="skeleton h-40" aria-busy="true" /> : null;

  return (
    <section className={variant === "home" ? "panel p-5" : ""}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={variant === "page" ? "text-3xl font-semibold tracking-tight" : "text-xl font-semibold"}>Libros alquilados</h2>
          <p className="mt-1 text-sm text-muted">
            {variant === "page"
              ? "Listado de los libros que pediste. El límite de devolución es la fecha de la derecha."
              : "Los que todavía no devolviste."}
          </p>
        </div>
        {variant === "home" && (
          <Link to="/alquilados" className="text-sm font-medium text-brand-700">
            Ver el listado
          </Link>
        )}
      </div>
      {variant === "page" && error && <p className="alert mt-4">{error}</p>}
      {notice && <p className="alert-ok mt-4">{notice}</p>}
      {visible.length === 0 ? (
        <p className="mt-6 text-muted">Todavía no pediste ningún libro.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-line">
                <th className="px-3 py-2 font-medium">Libro</th>
                <th className="px-3 py-2 font-medium">Lo pediste</th>
                <th className="px-3 py-2 font-medium">Devolver antes del</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((loan) => (
                <tr key={loan._id} className="border-b border-line last:border-0">
                  <td className="px-3 py-3 font-medium">
                    <Link to={`/libros/${loan.bookId}`} className="hover:text-brand-700">
                      {loan.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{formatDay(loan.startDate)}</td>
                  <td className="px-3 py-3">{formatDay(loan.dueDate)}</td>
                  <td className={`px-3 py-3 ${loan.status === "overdue" ? "font-medium text-danger" : ""}`}>{statusLabel(loan.status)}</td>
                  <td className="px-3 py-3 text-right">
                    {loan.status !== "returned" && (
                      <button type="button" className="btn text-sm" disabled={pendingId === loan._id} onClick={() => void giveBack(loan)}>
                        {pendingId === loan._id ? "Devolviendo…" : "Devolver"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
