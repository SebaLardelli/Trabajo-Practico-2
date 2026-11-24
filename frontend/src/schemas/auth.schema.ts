import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
  password: z.string().min(1, { error: "La contraseña es obligatoria" }),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, { error: "El nombre es obligatorio" }).max(80),
  email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
    .max(72, { error: "La contraseña no puede superar 72 caracteres" }),
  career: z.string().trim().min(1, { error: "Elegí tu carrera" }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "El email no tiene un formato valido" }).trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
      .max(72, { error: "La contraseña no puede superar 72 caracteres" }),
    confirm: z.string().min(1, { error: "Repetí la contraseña" }),
  })
  .refine((values) => values.password === values.confirm, {
    error: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
