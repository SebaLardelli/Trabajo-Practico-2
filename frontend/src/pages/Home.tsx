import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { BookCard } from "../components/BookCard";
import { RentedBooks } from "../components/RentedBooks";
import { ScrollRail } from "../components/ScrollRail";
import { useSession } from "../lib/auth-client";
import { filterDemoBooks } from "../data/catalog";
import { FACULTIES } from "../data/uai";
import { listBooks } from "../services/books";
import type { BookList } from "../types/book";

export const Home = () => {
  const { data: session } = useSession();
  const [params, setParams] = useSearchParams();
  const faculty = params.get("faculty") ?? "";
  const career = params.get("career") ?? "";
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [available, setAvailable] = useState<"" | "true" | "false">((params.get("available") as "" | "true" | "false") || "");
  const [page, setPage] = useState(Number(params.get("page") ?? 1) || 1);
  const [result, setResult] = useState<BookList | null>(null);
  const [loading, setLoading] = useState(true);
  const source = useRef<"pending" | "api" | "demo">("pending");

  useEffect(() => {
    let active = true;
    const query = {
      page,
      limit: faculty || career ? 100 : 8,
      search,
      available: available || undefined,
      faculty: faculty || undefined,
      career: career || undefined,
    };

    if (source.current === "demo") {
      setResult(filterDemoBooks(query));
      setLoading(false);
      return;
    }

    if (source.current === "pending") {
      setResult(filterDemoBooks(query));
      setLoading(false);
    } else {
      setLoading(true);
    }

    listBooks(query)
      .then((data) => {
        if (!active) return;
        if (data.meta.total > 0) {
          source.current = "api";
          setResult(data);
        } else {
          source.current = "demo";
          setResult(filterDemoBooks(query));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        source.current = "demo";
        setResult(filterDemoBooks(query));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, search, available, faculty, career]);

  const writeParams = (next: { faculty?: string; career?: string; search?: string; available?: string; page?: number }) => {
    const query = new URLSearchParams();
    const facultyValue = next.faculty ?? faculty;
    const careerValue = next.career ?? career;
    const searchValue = next.search ?? search;
    const availableValue = next.available ?? available;
    const pageValue = next.page ?? 1;
    if (facultyValue) query.set("faculty", facultyValue);
    if (careerValue) query.set("career", careerValue);
    if (searchValue) query.set("search", searchValue);
    if (availableValue) query.set("available", availableValue);
    if (pageValue > 1) query.set("page", String(pageValue));
    setParams(query);
  };

  const totalPages = result?.meta.totalPages ?? 1;

  return (
    <section className="flex flex-col gap-6">
      <div className="panel rise-in relative overflow-hidden">
        <img
          src="/uai-roca.jpg"
          alt="Sede Rosario de la UAI"
          className="h-80 w-full object-cover transition duration-700 ease-out hover:scale-[1.04] sm:h-[26rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3b0d1b] via-[#3b0d1b]/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          <p className="text-sm font-medium text-white/80">Sede Rosario</p>
          <h1 className="mt-1 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">Biblioteca UAI</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
            Bibliografía de grado para las diez facultades. Consulta en sala o préstamo en UAIbibliolabs, Rosario.
          </p>
        </div>
      </div>

      {session?.user && session.user.role !== "admin" && <RentedBooks variant="home" />}

      <ScrollRail watch={faculty || "todas"}>
        <button
          type="button"
          data-active={faculty ? "false" : "true"}
          onClick={() => {
            setPage(1);
            writeParams({ faculty: "", career: "", page: 1 });
          }}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent ${
            faculty ? "bg-card text-muted" : "bg-accent text-on-accent"
          }`}
        >
          Todas
        </button>
        {FACULTIES.map((item) => (
          <button
            key={item}
            type="button"
            data-active={faculty === item ? "true" : "false"}
            onClick={() => {
              setPage(1);
              writeParams({ faculty: item, career: "", page: 1 });
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent ${
              faculty === item ? "bg-accent text-on-accent" : "bg-card text-ink"
            }`}
          >
            {item}
          </button>
        ))}
      </ScrollRail>

      <div className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(event) => {
            const next = event.target.value;
            setSearch(next);
            setPage(1);
            writeParams({ search: next, page: 1 });
          }}
          placeholder={career ? `Buscar en ${career}` : "Título, autor o carrera"}
          className="field min-w-0 flex-1"
          aria-label="Buscar libros"
        />
        <select
          value={available}
          onChange={(event) => {
            const next = event.target.value as "" | "true" | "false";
            setAvailable(next);
            setPage(1);
            writeParams({ available: next, page: 1 });
          }}
          className="field sm:w-auto"
          aria-label="Disponibilidad"
        >
          <option value="">Todos</option>
          <option value="true">En sala</option>
          <option value="false">Prestados</option>
        </select>
      </div>

      {(faculty || career) && (
        <p className="text-sm text-muted">
          {career || faculty}
          {result ? ` · ${result.meta.total} ejemplares` : ""}
        </p>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-live="polite">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="skeleton h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {result?.data.map((book, index) => (
            <div key={book._id} className="rise-in" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}
      {!loading && result?.data.length === 0 && (
        <p className="panel px-5 py-8 text-center text-muted">No hay ejemplares con ese filtro.</p>
      )}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="btn-ghost"
            disabled={page <= 1}
            onClick={() => {
              const next = page - 1;
              setPage(next);
              writeParams({ page: next });
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
            disabled={page >= totalPages}
            onClick={() => {
              const next = page + 1;
              setPage(next);
              writeParams({ page: next });
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
};
