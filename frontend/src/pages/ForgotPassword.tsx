import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router";
import { UaiMark } from "../components/UaiMark";
import { requestPasswordReset, useSession } from "../lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/auth.schema";

export const ForgotPassword = () => {
  const { data: session } = useSession();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  if (session && !isSubmitting) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    const { error } = await requestPasswordReset({ email: values.email, redirectTo: "/restablecer" });
    if (error) {
      setError("root.server", { message: "No se pudo enviar el pedido. Intentá de nuevo." });
      return;
    }
    setSent(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 font-sans">
      <section className="panel w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <UaiMark className="h-11 w-11" />
          <div>
            <p className="text-sm text-muted">Biblioteca UAI</p>
            <h1 className="text-2xl font-semibold tracking-tight">Recuperar contraseña</h1>
          </div>
        </div>
        {sent ? (
          <>
            <p className="alert-ok">
              Si esa cuenta usa email y contraseña, te enviamos un enlace para elegir una nueva. Revisá la bandeja y el correo no deseado. Vale una hora.
            </p>
            <p className="mt-4 text-sm text-muted">GitHub y Google se recuperan en esos servicios, no desde acá.</p>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted">Es para cuentas creadas con email y contraseña. Te llega un enlace a ese correo.</p>
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Email
                <input type="email" autoComplete="email" className="field font-normal" {...register("email")} />
                {errors.email && <span className="field-error">{errors.email.message}</span>}
              </label>
              {errors.root?.server && (
                <p role="alert" className="alert">
                  {errors.root.server.message}
                </p>
              )}
              <button type="submit" disabled={isSubmitting} className="btn">
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm text-muted">
          <Link to="/login" className="font-medium text-brand-700">
            Volver a ingresar
          </Link>
        </p>
      </section>
    </main>
  );
};
