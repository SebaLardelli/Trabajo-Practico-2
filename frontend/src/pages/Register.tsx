import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { GitHubIcon, GoogleIcon } from "../components/BrandIcons";
import { UaiMark } from "../components/UaiMark";
import { CAREERS, FACULTIES } from "../data/uai";
import { signIn, signUp, useSession, type SocialProvider } from "../lib/auth-client";
import { classifySocialReturn, rememberedSignupCareer, rememberSignupCareer, signupNotice } from "../lib/signup-flow";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";

export const Register = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", career: "" },
  });

  const [notice, setNotice] = useState<string | null>(null);
  const [params] = useSearchParams();
  const arrivedProvider: SocialProvider | null = params.get("provider") === "google" ? "google" : params.get("provider") === "github" ? "github" : null;
  const careerReady = CAREERS.some((item) => item.name === watch("career"));

  useEffect(() => {
    const saved = rememberedSignupCareer();
    if (saved) setValue("career", saved);
    const detail = `${params.get("error") ?? ""} ${params.get("error_description") ?? ""}`.trim();
    const kind = classifySocialReturn(detail);
    const fromLogin = params.get("alta") === "1";
    const text = signupNotice(kind, arrivedProvider, fromLogin, detail);
    if (text) setNotice(text);
    if (!params.get("error")) return;
    const next = new URLSearchParams(params);
    next.delete("error");
    navigate({ pathname: "/register", search: next.toString() ? `?${next.toString()}` : "" }, { replace: true });
  }, [arrivedProvider, navigate, params, setValue]);

  if (session && !isSubmitting) {
    return <Navigate to="/" replace />;
  }

  const handleSocial = async (provider: SocialProvider) => {
    const career = CAREERS.find((item) => item.name === getValues("career"));
    if (!career) {
      setError("career", { message: "Elegí tu carrera" });
      setNotice("Elegí la carrera y después tocá el botón de GitHub o Google.");
      return;
    }
    rememberSignupCareer(career.name);
    const { error } = await signIn.social({
      provider,
      callbackURL: "/",
      errorCallbackURL: `/register?provider=${provider}`,
      requestSignUp: true,
      additionalData: { career: career.name, faculty: career.faculty },
    });
    if (error) {
      const kind = classifySocialReturn(`${error.code ?? ""} ${error.message ?? ""}`);
      setNotice(signupNotice(kind, provider, false) ?? "Elegí la carrera y tocá el botón de nuevo.");
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    const career = CAREERS.find((item) => item.name === values.career);
    if (!career) {
      setError("career", { message: "Elegí tu carrera" });
      return;
    }
    const { error } = await signUp.email({ ...values, faculty: career.faculty });
    if (error) {
      const text = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
      if (text.includes("exist") || text.includes("already")) {
        setError("root.server", { message: "Ese email ya tiene cuenta. Entrá desde Iniciar sesión." });
        return;
      }
      if (text.includes("carrera")) {
        setError("career", { message: "Elegí tu carrera" });
        return;
      }
      setError("root.server", { message: "Revisá los datos y volvé a crear la cuenta." });
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 font-sans">
      <section className="panel w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <UaiMark className="h-11 w-11" />
          <div>
            <p className="text-sm text-muted">Biblioteca UAI</p>
            <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
          </div>
        </div>
        {notice && <p className="alert-warn mb-6">{notice}</p>}
        <p className="mb-6 text-sm text-muted">Elegí la carrera. Vale para el email y también para GitHub o Google.</p>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Nombre
            <input autoComplete="name" className="field font-normal" {...register("name")} />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input type="email" autoComplete="email" className="field font-normal" {...register("email")} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Carrera
            <select className="field font-normal" {...register("career")}>
              <option value="">Elegí tu carrera</option>
              {FACULTIES.map((faculty) => (
                <optgroup key={faculty} label={faculty}>
                  {CAREERS.filter((item) => item.faculty === faculty).map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.career && <span className="field-error">{errors.career.message}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Contraseña
            <input type="password" autoComplete="new-password" className="field font-normal" {...register("password")} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </label>
          {errors.root?.server && (
            <p role="alert" className="alert">
              {errors.root.server.message}
            </p>
          )}
          <button type="submit" disabled={isSubmitting} className="btn">
            {isSubmitting ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <button
          type="button"
          disabled={!careerReady}
          onClick={() => void handleSocial("github")}
          className="btn-ghost mt-3 inline-flex w-full items-center justify-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GitHubIcon />
          Registrarme con GitHub
        </button>
        <button
          type="button"
          disabled={!careerReady}
          onClick={() => void handleSocial("google")}
          className="btn-ghost mt-2 inline-flex w-full items-center justify-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleIcon />
          Registrarme con Google
        </button>
        {!careerReady && (
          <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm font-semibold text-accent">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 fill-accent">
              <path d="M12 2.2a9.8 9.8 0 1 0 0 19.6 9.8 9.8 0 0 0 0-19.6Zm0 14.2a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Zm1.05-2.15h-2.1l-.35-7.3h2.8l-.35 7.3Z" />
            </svg>
            ¡Elegí la carrera para habilitar GitHub y Google!
          </p>
        )}
        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-medium text-brand-700">
            Ingresar
          </Link>
        </p>
      </section>
    </main>
  );
};
