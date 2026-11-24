import { Navigate } from "react-router";
import { useSession } from "../lib/auth-client";

export const Entrance = () => {
  const { data, isPending } = useSession();
  if (isPending) return <p className="p-8 text-sm text-muted">Ingresando…</p>;
  if (!data?.user) return <Navigate to="/login" replace />;
  return <Navigate to={data.user.role === "admin" ? "/admin" : "/"} replace />;
};
