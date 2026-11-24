import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { GitHubIcon, GoogleIcon } from "../components/BrandIcons";
import { UaiMark } from "../components/UaiMark";
import { authClient, fetchSession, signIn, useSession, type SocialProvider } from "../lib/auth-client";
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

  const [socialError, setSocialError] = useState<string | null>(null);
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
  const afterLogin = (role: string | null | undefined) => (from !== "/" ? from : role === "admin" ? "/admin" : "/");
  const params = new URLSearchParams(location.search);
  const oauthError = params.get("error");
  const providerParam = params.get("provider");
  const linkProvider: SocialProvider = providerParam === "google" ? "google" : "github";
  const mustLinkSocial = oauthError === "account_not_linked";
  const namedProvider: SocialProvider | null = providerParam === "google" || providerParam === "github" ? providerParam : null;

  useEffect(() => {
    if (oauthError !== "signup_disabled" || !namedProvider) return;
    navigate(`/register?provider=${namedProvider}&alta=1`, { replace: true });
  }, [oauthError, namedProvider, navigate]);

  if (session && !isSubmitting) {
    return <Navigate to={afterLogin(session.user.role)} replace />;
  }

  const onSubmit = async (credentials: LoginFormValues) => {
    const { error } = await signIn.email(credentials);
    if (error) {
      const origin = error.code === "INVALID_ORIGIN" || (error.message ?? "").toLowerCase().includes("origin");
      setError("root.server", {
        message: origin
          ? "Este sitio no está autorizado para iniciar sesión. Revisá BETTER_AUTH_URL en Render."
          : "El email o la contraseña no coinciden. Si todavía no tenés cuenta, registrate.",
      });
      return;
    }
    if (mustLinkSocial) {
      const { error: linkError } = await authClient.linkSocial({ provider: linkProvider, callbackURL: from });
      if (linkError) {
        setError("root.server", { message: linkError.message ?? `No se pudo vincular ${linkProvider === "google" ? "Google" : "GitHub"}` });
      }
      return;
    }
    const current = await fetchSession();
    navigate(afterLogin(current?.user.role), { replace: true });
  };

  const handleSocial = async (provider: SocialProvider) => {
    setSocialError(null);
    const { data, error } = await signIn.social({
      provider,
      callbackURL: from === "/" ? "/entrada" : from,
      errorCallbackURL: `/login?provider=${provider}`,
    });
    if (data?.url || data?.redirect || !error) return;
    const detail = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
    const noAccount = detail.includes("signup") || detail.includes("sign up");
    if (noAccount) {
      navigate(`/register?provider=${provider}&alta=1`);
      return;
    }
    setSocialError(error.message ?? "No se pudo iniciar sesión");
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 font-sans">
      <section className="panel w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <UaiMark className="h-11 w-11" />
          <div>
            <p className="text-sm text-muted">Biblioteca UAI</p>
            <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
          </div>
        </div>
        <p className="mb-6 text-sm text-muted">Entrá con email, GitHub o Google.</p>
        {oauthError && (
          <p className="alert-warn mb-4">
            {mustLinkSocial
              ? `Ya tenés una cuenta con ese email. Ingresá tu contraseña para vincular ${linkProvider === "google" ? "Google" : "GitHub"}.`
              : `No se pudo iniciar sesión con ${linkProvider === "google" ? "Google" : "GitHub"}.`}
          </p>
        )}
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input type="email" autoComplete="email" className="field font-normal" {...register("email")} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>
          <div className="flex flex-col gap-1.5 text-sm font-medium">
            <span className="flex items-baseline justify-between gap-3">
              <span>Contraseña</span>
              <Link to="/recuperar" className="font-medium text-brand-700">
                ¿Olvidaste tu contraseña?
              </Link>
            </span>
            <input type="password" autoComplete="current-password" className="field font-normal" {...register("password")} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>
          {errors.root?.server && (
            <p role="alert" className="alert">
              {errors.root.server.message}
            </p>
          )}
          <button type="submit" disabled={isSubmitting} className="btn">
            {isSubmitting ? "Ingresando..." : mustLinkSocial ? "Ingresar y vincular" : "Ingresar"}
          </button>
        </form>
        <button type="button" onClick={() => void handleSocial("github")} className="btn-ghost mt-3 inline-flex w-full items-center justify-center gap-2.5">
          <GitHubIcon />
          Entrar con GitHub
        </button>
        <button type="button" onClick={() => void handleSocial("google")} className="btn-ghost mt-2 inline-flex w-full items-center justify-center gap-2.5">
          <GoogleIcon />
          Entrar con Google
        </button>
        {socialError && <p className="alert mt-3">{socialError}</p>}
        <p className="mt-6 text-center text-sm text-muted">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-medium text-brand-700">
            Registrarse
          </Link>
        </p>
      </section>
    </main>
  );
};
