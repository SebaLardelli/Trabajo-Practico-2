import { z } from "zod";
import type { Book } from "../types/book";

export const bookSchema = z.object({
  title: z.string().trim().min(1, { error: "El titulo es obligatorio" }).max(160),
  author: z.string().trim().min(1, { error: "El autor es obligatorio" }).max(120),
  pages: z
    .number({ error: "Las paginas tienen que ser un numero" })
    .int({ error: "Las paginas tienen que ser un numero entero" })
    .min(1, { error: "El libro tiene que tener al menos 1 pagina" })
    .max(20000),
  publishedAt: z.string().min(1, { error: "La fecha de publicacion es obligatoria" }),
  available: z.boolean(),
  copies: z
    .number({ error: "La cantidad tiene que ser un numero" })
    .int({ error: "La cantidad tiene que ser un numero entero" })
    .min(1, { error: "Tiene que haber al menos 1 ejemplar" })
    .max(99, { error: "No se pueden cargar mas de 99 ejemplares" }),
  faculty: z.string().trim().min(1, { error: "La facultad es obligatoria" }).max(80),
  career: z.string().trim().min(1, { error: "La carrera es obligatoria" }).max(140),
});

export type BookFormValues = z.infer<typeof bookSchema>;

export const emptyBook: BookFormValues = {
  title: "",
  author: "",
  pages: 1,
  publishedAt: "",
  available: true,
  copies: 1,
  faculty: "",
  career: "",
};

export function toBookFormValues(book: Book): BookFormValues {
  return {
    title: book.title,
    author: book.author,
    pages: book.pages,
    publishedAt: book.publishedAt.slice(0, 10),
    available: book.available,
    copies: book.copies ?? 1,
    faculty: book.faculty ?? "",
    career: book.career ?? "",
  };
}
