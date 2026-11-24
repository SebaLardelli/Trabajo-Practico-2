import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthorField } from "./AuthorField";
import { CAREERS } from "../data/uai";
import { getErrorMessage } from "../lib/api";
import { bookSchema, emptyBook, toBookFormValues, type BookFormValues } from "../schemas/book.schema";
import type { Book } from "../types/book";

interface BookFormProps {
  book: Book | null;
  authors: string[];
  onSave: (values: BookFormValues) => Promise<void>;
  onCancel: () => void;
}

function facultyOf(career: string): string {
  if (career === "Todas las carreras") return "Formación general";
  return CAREERS.find((item) => item.name === career)?.faculty ?? "";
}

const careerNames = ["Todas las carreras", ...CAREERS.map((item) => item.name)].sort((a, b) => a.localeCompare(b, "es"));

export const BookForm = ({ book, authors, onSave, onCancel }: BookFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    values: book ? toBookFormValues(book) : emptyBook,
  });
  const career = watch("career");
  const author = watch("author");

  useEffect(() => {
    setValue("faculty", facultyOf(career));
  }, [career, setValue]);

  const onSubmit = async (values: BookFormValues) => {
    try {
      await onSave({ ...values, faculty: facultyOf(values.career), available: values.copies > 0 });
      reset(emptyBook);
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="panel flex flex-col gap-4 p-5">
      <h2 className="text-xl font-semibold">{book ? `Editar ${book.title}` : "Nuevo libro"}</h2>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Título
        <input className="field font-normal" {...register("title")} />
        {errors.title && <span className="field-error">{errors.title.message}</span>}
      </label>
      <AuthorField
        key={book?._id ?? "nuevo"}
        value={author}
        authors={authors}
        error={errors.author?.message}
        onChange={(next) => setValue("author", next, { shouldValidate: true })}
      />
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Carrera
        <select className="field font-normal" {...register("career")}>
          <option value="">Elegí una carrera</option>
          {careerNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {errors.career && <span className="field-error">{errors.career.message}</span>}
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
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Ejemplares totales
        <input type="number" min={0} max={99} className="field font-normal" {...register("copies", { valueAsNumber: true })} />
        {errors.copies && <span className="field-error">{errors.copies.message}</span>}
      </label>
      {errors.root?.server && (
        <p role="alert" className="alert">
          {errors.root.server.message}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="btn">
          {isSubmitting ? "Guardando..." : book ? "Guardar cambios" : "Crear"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  );
};
