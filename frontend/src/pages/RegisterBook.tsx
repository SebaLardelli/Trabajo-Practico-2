import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { getErrorMessage } from "../lib/api";
import { useSession } from "../lib/auth-client";
import { bookSchema } from "../schemas/book.schema";
import { createBook } from "../services/books";

const studentBookSchema = bookSchema.pick({ title: true, author: true, pages: true, publishedAt: true });
type StudentBookValues = z.infer<typeof studentBookSchema>;

export const RegisterBook = () => {
  const { data: session } = useSession();
  const career = session?.user.career ?? "";
  const faculty = session?.user.faculty ?? "";
  const [done, setDone] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentBookValues>({
    resolver: zodResolver(studentBookSchema),
    defaultValues: { title: "", author: "", pages: 1, publishedAt: "" },
  });

  if (!career) {
    return (
      <section className="panel max-w-lg p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Registrar libro</h1>
        <p className="mt-3 text-sm text-muted">Tu cuenta no tiene una carrera asignada. Volvé a registrarte eligiendo una.</p>
      </section>
    );
  }

  const onSubmit = async (values: StudentBookValues) => {
    try {
      const book = await createBook({ ...values, faculty, career, available: true, copies: 1 });
      setDone(book.title);
      reset({ title: "", author: "", pages: 1, publishedAt: "" });
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <section className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Registrar libro</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        Queda en el estante de <span className="font-medium text-ink">{career}</span>. No se pueden cargar libros de otra carrera.
      </p>
      {done && (
        <p className="alert-ok mb-4">
          {done} quedó registrado.{" "}
          <Link to={`/?career=${encodeURIComponent(career)}&faculty=${encodeURIComponent(faculty)}`} className="font-medium text-brand-700">
            Ver el estante
          </Link>
        </p>
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="panel flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Título
          <input className="field font-normal" {...register("title")} />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Autor
          <input className="field font-normal" {...register("author")} />
          {errors.author && <span className="field-error">{errors.author.message}</span>}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Páginas
            <input type="number" min={1} className="field font-normal" {...register("pages", { valueAsNumber: true })} />
            {errors.pages && <span className="field-error">{errors.pages.message}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Publicación
            <input type="date" className="field font-normal" {...register("publishedAt")} />
            {errors.publishedAt && <span className="field-error">{errors.publishedAt.message}</span>}
          </label>
        </div>
        {errors.root?.server && (
          <p role="alert" className="alert">
            {errors.root.server.message}
          </p>
        )}
        <button type="submit" disabled={isSubmitting} className="btn">
          {isSubmitting ? "Guardando..." : "Registrar libro"}
        </button>
      </form>
    </section>
  );
};
