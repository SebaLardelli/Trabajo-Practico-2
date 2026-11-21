import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { ThemeToggle } from "../components/ThemeToggle";
import { signIn, signUp, useSession } from "../lib/auth-client";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";

export const Register = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  if (session && !isSubmitting) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: RegisterFormValues) => {
    const { error } = await signUp.email(values);
    if (error) {
      setError("root.server", { message: error.message ?? "No se pudo crear la cuenta" });
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6 font-sans">
      <ThemeToggle className="absolute top-6 right-6" />
      <section className="panel w-full max-w-md p-8">
        <p className="text-xs font-medium tracking-[0.18em] text-brand-700 uppercase">Biblioteca</p>
        <h1 className="mt-2 font-serif text-4xl">Crear cuenta</h1>
        <p className="mt-2 mb-6 text-sm text-ink/60">La cuenta nueva entra como usuario y solo puede leer el catálogo.</p>
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
          onClick={() => void signIn.social({ provider: "github", callbackURL: "/", errorCallbackURL: "/login" })}
          className="btn-ghost mt-3 w-full"
        >
          Registrarme con GitHub
        </button>
        <p className="mt-6 text-center text-sm text-ink/60">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-medium text-brand-700 underline">
            Ingresar
          </Link>
        </p>
      </section>
    </main>
  );
};
