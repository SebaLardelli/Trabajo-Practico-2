import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ScrollRail } from "../components/ScrollRail";
import { CAREERS, FACULTIES } from "../data/uai";

const facultyId = (name: string) =>
  `facultad-${name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

export const Careers = () => {
  const [active, setActive] = useState<string>(FACULTIES[0]);

  useEffect(() => {
    const nodes = FACULTIES.map((faculty) => document.getElementById(facultyId(faculty))).filter(
      (node): node is HTMLElement => node !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const faculty = FACULTIES.find((item) => facultyId(item) === visible?.target.id);
        if (faculty) setActive(faculty);
      },
      { rootMargin: "-104px 0px -40% 0px", threshold: [0, 0.2, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="flex flex-col gap-8 pb-[50vh]">
      <div className="rise-in">
        <p className="text-sm font-medium text-brand-700">Oferta de grado y pregrado</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Carreras de la UAI</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Diez facultades. Cada carrera abre el estante con la bibliografía cargada para esa formación. Las que también se dictan a distancia están marcadas.
        </p>
      </div>

      <div className="sticky top-24 z-20 -mx-3 border-b border-line bg-paper px-3 py-3 sm:-mx-4 sm:px-4">
        <ScrollRail watch={active}>
          {FACULTIES.map((faculty) => {
            const selected = faculty === active;
            return (
              <a
                key={faculty}
                href={`#${facultyId(faculty)}`}
                data-active={selected ? "true" : "false"}
                onClick={() => setActive(faculty)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
                  selected ? "bg-accent text-on-accent" : "bg-card text-ink"
                }`}
              >
                {faculty}
              </a>
            );
          })}
        </ScrollRail>
      </div>

      {FACULTIES.map((faculty, facultyIndex) => {
        const careers = CAREERS.filter((career) => career.faculty === faculty);
        return (
          <section key={faculty} id={facultyId(faculty)} className="scroll-mt-52 rise-in" style={{ animationDelay: `${facultyIndex * 40}ms` }}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-brand-700">
                  {String(facultyIndex + 1).padStart(2, "0")} · {careers.length} carreras
                </p>
                <h2 className="mt-1 text-xl font-semibold">{faculty}</h2>
              </div>
              <Link to={`/?faculty=${encodeURIComponent(faculty)}`} className="shrink-0 text-sm font-medium text-brand-700">
                Ver estante
              </Link>
            </div>
            <ScrollRail snap>
              {careers.map((career, index) => (
                <Link
                  key={career.name}
                  to={`/?career=${encodeURIComponent(career.name)}&faculty=${encodeURIComponent(faculty)}`}
                  className="hover-lift group panel flex w-[78%] shrink-0 flex-col justify-between p-5 sm:w-80"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold tracking-wide text-brand-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {career.distance && (
                        <span className="rounded-full bg-[var(--glow)] px-2.5 py-1 text-[11px] font-medium text-brand-strong">
                          A distancia
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-lg font-semibold leading-snug">{career.name}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                    Ver bibliografía
                    <span className="transition duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              ))}
            </ScrollRail>
          </section>
        );
      })}
    </section>
  );
};
