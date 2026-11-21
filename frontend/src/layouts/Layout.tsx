import { NavLink, Outlet } from "react-router";
import { ThemeToggle } from "../components/ThemeToggle";
import { signOut, useSession } from "../lib/auth-client";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm transition ${
    isActive ? "bg-accent text-on-accent" : "text-ink/70 hover:bg-card hover:text-ink"
  }`;

export const Layout = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(error.message ?? "No se pudo cerrar sesión");
      return;
    }
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-10 border-b border-line/80 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-6 py-3">
          <NavLink to="/" className="font-serif text-2xl tracking-tight text-ink">
            Biblioteca
          </NavLink>
          <nav className="flex items-center gap-1 rounded-full bg-card/80 p-1">
            <NavLink to="/" className={linkClass} end>
              Catálogo
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/usuarios" className={linkClass}>
                Usuarios
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <button type="button" onClick={handleLogout} className="btn-ghost text-sm">
                Salir · {user.name}
              </button>
            ) : (
              <>
                <NavLink to="/login" className="btn-ghost text-sm">
                  Ingresar
                </NavLink>
                <NavLink to="/register" className="btn text-sm">
                  Crear cuenta
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};
