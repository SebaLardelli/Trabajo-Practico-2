import { z } from "zod";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "La fecha tiene que ser AAAA-MM-DD" });

export const createLoanSchema = z.object({
  bookId: z.string().trim().min(1, { error: "Elegí un libro" }),
  userId: z.string().trim().min(1).optional(),
  startDate: day.optional(),
  dueDate: day.optional(),
});

export const updateLoanSchema = z.object({
  startDate: day,
  dueDate: day,
});

export const listLoansQuerySchema = z.object({
  status: z.enum(["active", "overdue", "returned"]).optional(),
});

export const markNoticesSchema = z.object({
  ids: z.array(z.string().trim().min(1)).max(100).optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
export type ListLoansQuery = z.infer<typeof listLoansQuerySchema>;
export type MarkNoticesInput = z.infer<typeof markNoticesSchema>;
