import { NavLink } from "react-router";

const item = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium ${isActive ? "bg-accent text-on-accent" : "bg-field text-muted hover:text-ink"}`;

export const AdminNav = () => (
  <nav className="mb-6 flex flex-wrap gap-2" aria-label="Panel de administración">
    <NavLink to="/admin" end className={item}>
      Libros
    </NavLink>
    <NavLink to="/admin/prestamos" className={item}>
      Préstamos
    </NavLink>
    <NavLink to="/admin/usuarios" className={item}>
      Lectores
    </NavLink>
  </nav>
);
