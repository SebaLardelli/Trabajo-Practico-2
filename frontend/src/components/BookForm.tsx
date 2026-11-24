import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CAREERS, FACULTIES } from "../data/uai";
import { getErrorMessage } from "../lib/api";
import { bookSchema, emptyBook, toBookFormValues, type BookFormValues } from "../schemas/book.schema";
import type { Book } from "../types/book";

interface BookFormProps {
  book: Book | null;
  onSave: (values: BookFormValues) => Promise<void>;
  onCancel: () => void;
}

export const BookForm = ({ book, onSave, onCancel }: BookFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    values: book ? toBookFormValues(book) : emptyBook,
  });
  const faculty = watch("faculty");
  const careers = CAREERS.filter((item) => item.faculty === faculty);

  useEffect(() => {
    if (!faculty || faculty === "Formación general") return;
    const names = CAREERS.filter((item) => item.faculty === faculty).map((item) => item.name);
    if (names.includes(getValues("career"))) return;
    setValue("career", names[0] ?? "");
  }, [faculty, getValues, setValue]);

  const onSubmit = async (values: BookFormValues) => {
    try {
      await onSave({ ...values, available: values.copies > 0 });
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
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Autor
        <input className="field font-normal" {...register("author")} />
        {errors.author && <span className="field-error">{errors.author.message}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Facultad
        <select className="field font-normal" {...register("faculty")}>
          <option value="">Elegí una facultad</option>
          {FACULTIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value="Formación general">Formación general</option>
        </select>
        {errors.faculty && <span className="field-error">{errors.faculty.message}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Carrera
        <select className="field font-normal" {...register("career")}>
          <option value="">Elegí una carrera</option>
          {faculty === "Formación general" && <option value="Todas las carreras">Todas las carreras</option>}
          {careers.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
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
        Ejemplares
        <input type="number" min={1} max={99} className="field font-normal" {...register("copies", { valueAsNumber: true })} />
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
        {book && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
