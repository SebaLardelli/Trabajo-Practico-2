import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    values: book ? toBookFormValues(book) : emptyBook,
  });

  const onSubmit = async (values: BookFormValues) => {
    try {
      await onSave(values);
      reset(emptyBook);
    } catch (err) {
      setError("root.server", { message: getErrorMessage(err) });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="panel flex flex-col gap-4 p-5">
      <h2 className="font-serif text-2xl">{book ? `Editando ${book.title}` : "Nuevo libro"}</h2>
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
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" {...register("available")} />
        Disponible
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
