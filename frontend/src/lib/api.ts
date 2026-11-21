import axios from "axios";

// Ruta relativa: mismo origen que el front. En local la resuelve el proxy de Vite;
// en Render, el rewrite /api/* del Static Site.
export const api = axios.create({
  baseURL: "/api",
});

export const getErrorMessage = (err: unknown): string => {
  if (typeof err === "string") return err;
  if (axios.isAxiosError(err)) {
    const error = err.response?.data?.error;
    return typeof error === "string" ? error : (error?.message ?? err.message);
  }
  return "Error desconocido";
};
