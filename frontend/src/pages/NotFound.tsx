import { Link } from "react-router";

export const NotFound = () => (
  <section className="panel max-w-lg p-6">
    <h1 className="font-serif text-3xl">Página no encontrada</h1>
    <Link to="/" className="mt-4 inline-block text-sm underline">
      Volver al catálogo
    </Link>
  </section>
);
