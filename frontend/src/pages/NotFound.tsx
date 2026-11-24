import { Link } from "react-router";

export const NotFound = () => (
  <section className="panel max-w-lg p-6">
    <h1 className="text-3xl font-semibold tracking-tight">Página no encontrada</h1>
    <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-700">
      Volver al catálogo
    </Link>
  </section>
);
