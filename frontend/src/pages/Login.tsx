import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { ThemeToggle } from "../components/ThemeToggle";
import { authClient, signIn, useSession } from "../lib/auth-client";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

export const Login = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
  const oauthError = new URLSearchParams(location.search).get("error");
  const mustLinkGithub = oauthError === "account_not_linked";

  if (session && !isSubmitting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (credentials: LoginFormValues) => {
    const { error } = await signIn.email(credentials);
    if (error) {
      setError("root.server", { message: error.message ?? "No se pudo iniciar sesión" });
      return;
    }
    if (mustLinkGithub) {
      const { error: linkError } = await authClient.linkSocial({ provider: "github", callbackURL: from });
      if (linkError) setError("root.server", { message: linkError.message ?? "No se pudo vincular GitHub" });
      return;
    }
    navigate(from, { replace: true });
  };

  const handleGithub = () => {
    void signIn.social({ provider: "github", callbackURL: from, errorCallbackURL: "/login" });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6 font-sans">
      <ThemeToggle className="absolute top-6 right-6" />
      <section className="panel w-full max-w-md p-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-700 uppercase">Biblioteca</p>
        <h1 className="mt-2 font-serif text-4xl">Iniciar sesión</h1>
        <p className="mt-2 mb-6 text-sm text-ink/60">Entrá con email o con GitHub.</p>
        {oauthError && (
          <p className="alert-warn mb-4">
            {mustLinkGithub
              ? "Ya tenés una cuenta con ese email. Ingresá tu contraseña para vincular GitHub."
              : "No se pudo iniciar sesión con GitHub."}
          </p>
        )}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input type="email" autoComplete="email" className="field font-normal" {...register("email")} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Contraseña
            <input type="password" autoComplete="current-password" className="field font-normal" {...register("password")} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </label>
          {errors.root?.server && (
            <p role="alert" className="alert">
              {errors.root.server.message}
            </p>
          )}
          <button type="submit" disabled={isSubmitting} className="btn">
            {isSubmitting ? "Ingresando..." : mustLinkGithub ? "Ingresar y vincular GitHub" : "Ingresar"}
          </button>
        </form>
        <button type="button" onClick={handleGithub} className="btn-ghost mt-3 w-full">
          Entrar con GitHub
        </button>
        <p className="mt-6 text-center text-sm text-ink/60">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-medium text-brand-700 underline">
            Crear cuenta
          </Link>
        </p>
      </section>
    </main>
  );
};
