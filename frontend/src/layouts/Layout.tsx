import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router";
import { ThemeToggle } from "../components/ThemeToggle";
import { UaiMark } from "../components/UaiMark";
import { signOut, useSession } from "../lib/auth-client";
import { unreadNotices } from "../services/loans";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-pill w-full rounded-full px-3 py-2 text-sm font-medium md:w-auto ${
    isActive ? "bg-accent text-on-accent" : "text-muted hover:bg-field hover:text-ink"
  }`;

export const Layout = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!user || isAdmin) {
      setUnread(0);
      return;
    }
    unreadNotices()
      .then(setUnread)
      .catch(() => setUnread(0));
  }, [user, isAdmin, location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(error.message ?? "No se pudo cerrar sesión");
      return;
    }
    window.location.replace("/");
  };

  const links = isAdmin ? (
    <>
      <NavLink to="/admin" className={linkClass} end>
        Libros
      </NavLink>
      <NavLink to="/admin/prestamos" className={linkClass}>
        Préstamos
      </NavLink>
      <NavLink to="/admin/usuarios" className={linkClass}>
        Lectores
      </NavLink>
      <NavLink to="/admin/sesiones" className={linkClass}>
        Sesiones
      </NavLink>
    </>
  ) : (
    <>
      <NavLink to="/" className={linkClass} end>
        Catálogo
      </NavLink>
      <NavLink to="/carreras" className={linkClass}>
        Carreras
      </NavLink>
      {user && (
        <NavLink to="/alquilados" className={linkClass}>
          Alquilados
        </NavLink>
      )}
    </>
  );

  const actions = user ? (
    <button type="button" onClick={handleLogout} className="w-fit justify-self-start px-1 py-1 text-xs font-medium text-muted hover:text-ink">
      Salir
    </button>
  ) : (
    <>
      <NavLink to="/login" className="btn-ghost text-center text-sm">
        Ingresar
      </NavLink>
      <NavLink to="/register" className="btn text-center text-sm">
        Crear cuenta
      </NavLink>
    </>
  );

  if (isAdmin && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="fixed inset-x-0 top-0 z-40 bg-card">
        <div className="bg-stamp text-stamp-ink">
          <div className="mx-auto flex h-8 max-w-6xl items-center justify-between gap-3 px-4 text-xs font-medium tracking-wide">
            <span className="truncate">Universidad Abierta Interamericana</span>
            <span className="hidden shrink-0 sm:inline">UAIbibliolabs · Rosario</span>
          </div>
        </div>
        <div className="border-b border-line">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
            <NavLink to={isAdmin ? "/admin" : "/"} className="nav-pill flex min-w-0 items-center gap-2 font-semibold tracking-tight text-ink">
              <UaiMark />
              <span className="truncate">Biblioteca</span>
            </NavLink>
            <nav className="ml-2 hidden items-center gap-1 md:flex">{links}</nav>
            <div className="ml-auto hidden items-center gap-2 md:flex">
              {user && !isAdmin && <NoticeBell count={unread} />}
              <ThemeToggle />
              {actions}
            </div>
            <button
              type="button"
              className="nav-pill ml-auto grid h-10 w-10 place-items-center rounded-xl border border-line md:hidden"
              aria-expanded={open}
              aria-controls="menu-principal"
              onClick={() => setOpen((current) => !current)}
            >
              <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
              <span className="relative block h-3.5 w-5">
                <span className={`absolute left-0 h-0.5 w-5 bg-ink transition duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute top-1.5 left-0 h-0.5 w-5 bg-ink transition duration-300 ${open ? "opacity-0" : ""}`} />
                <span className={`absolute left-0 h-0.5 w-5 bg-ink transition duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
          {open && (
            <div id="menu-principal" className="menu-in border-t border-line bg-card md:hidden">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4">
                <nav className="flex flex-col gap-1">{links}</nav>
                {user && !isAdmin && <NoticeBell count={unread} wide />}
                <ThemeToggle />
                <div className="grid gap-2">{actions}</div>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="h-24 shrink-0" aria-hidden />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4 sm:py-8">
        <Outlet />
      </main>
      <footer className="px-3 pb-6 sm:px-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-1 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Biblioteca UAI · consulta en sala y préstamo</p>
          <p>Foto: ingreso de la Sede Rosario, UAI Noticias</p>
        </div>
      </footer>
    </div>
  );
};

function NoticeBell({ count, wide = false }: { count: number; wide?: boolean }) {
  return (
    <NavLink
      to="/avisos"
      className={`nav-pill relative inline-flex items-center justify-center gap-2 rounded-xl border border-line ${wide ? "h-10 px-3" : "h-10 w-10"}`}
      aria-label={count > 0 ? `${count} avisos sin leer` : "Avisos"}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" strokeLinejoin="round" />
        <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
      </svg>
      {wide && <span className="text-sm font-medium">Avisos</span>}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-on-accent">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </NavLink>
  );
}
