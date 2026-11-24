import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router";
import { UaiMark } from "../components/UaiMark";
import { resetPassword } from "../lib/auth-client";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas/auth.schema";

const resetError = (message?: string) => {
  if (message && /token/i.test(message)) return "El enlace venció o ya se usó. Pedí uno nuevo.";
  if (message && /short/i.test(message)) return "La contraseña debe tener al menos 8 caracteres.";
  return "No se pudo cambiar la contraseña. Pedí un enlace nuevo.";
};

export const ResetPassword = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const linkBroken = !token || params.get("error") === "INVALID_TOKEN";
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) return;
    const { error } = await resetPassword({ newPassword: values.password, token });
    if (error) {
      setError("root.server", { message: resetError(error.message) });
      return;
    }
    setDone(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 font-sans">
      <section className="panel w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <UaiMark className="h-11 w-11" />
          <div>
            <p className="text-sm text-muted">Biblioteca UAI</p>
            <h1 className="text-2xl font-semibold tracking-tight">Nueva contraseña</h1>
          </div>
        </div>
        {done ? (
          <p className="alert-ok">Listo. Ya podés entrar con la contraseña nueva.</p>
        ) : linkBroken ? (
          <p className="alert">El enlace venció o ya se usó.</p>
        ) : (
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Contraseña nueva
              <input type="password" autoComplete="new-password" className="field font-normal" {...register("password")} />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Repetir contraseña
              <input type="password" autoComplete="new-password" className="field font-normal" {...register("confirm")} />
              {errors.confirm && <span className="field-error">{errors.confirm.message}</span>}
            </label>
            {errors.root?.server && (
              <p role="alert" className="alert">
                {errors.root.server.message}
              </p>
            )}
            <button type="submit" disabled={isSubmitting} className="btn">
              {isSubmitting ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted">
          {linkBroken && !done ? (
            <Link to="/recuperar" className="font-medium text-brand-700">
              Pedir otro enlace
            </Link>
          ) : (
            <Link to="/login" className="font-medium text-brand-700">
              Ingresar
            </Link>
          )}
        </p>
      </section>
    </main>
  );
};
