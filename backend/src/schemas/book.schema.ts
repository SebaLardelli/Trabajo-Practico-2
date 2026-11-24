import { z } from "zod";

const publishedAt = z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), {
  error: "La fecha de publicacion no es valida",
});

export const listBooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(8),
  search: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value || undefined),
  available: z.enum(["true", "false"]).optional(),
  faculty: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => value || undefined),
  career: z
    .string()
    .trim()
    .max(140)
    .optional()
    .transform((value) => value || undefined),
});

export const createBookSchema = z.object({
  title: z.string().trim().min(1, { error: "El titulo es obligatorio" }).max(160),
  author: z.string().trim().min(1, { error: "El autor es obligatorio" }).max(120),
  pages: z.coerce.number().int().min(1, { error: "El libro tiene que tener al menos 1 pagina" }).max(20000),
  publishedAt,
  available: z.boolean().default(true),
  copies: z.coerce.number().int().min(0, { error: "Los ejemplares no pueden ser negativos" }).max(99).default(1),
  faculty: z.string().trim().min(1, { error: "La facultad es obligatoria" }).max(80),
  career: z.string().trim().min(1, { error: "La carrera es obligatoria" }).max(140),
});

export const updateBookSchema = createBookSchema.partial();

export const loanBookSchema = z.object({
  available: z.boolean(),
});

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type LoanBookInput = z.infer<typeof loanBookSchema>;
