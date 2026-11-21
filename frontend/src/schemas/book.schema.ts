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
});

export type BookFormValues = z.infer<typeof bookSchema>;

export const emptyBook: BookFormValues = {
  title: "",
  author: "",
  pages: 1,
  publishedAt: "",
  available: true,
};

export function toBookFormValues(book: Book): BookFormValues {
  return {
    title: book.title,
    author: book.author,
    pages: book.pages,
    publishedAt: book.publishedAt.slice(0, 10),
    available: book.available,
  };
}
