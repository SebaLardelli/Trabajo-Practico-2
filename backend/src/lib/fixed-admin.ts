import mongoose from "mongoose";
import { auth } from "./auth.js";

export const FIXED_ADMIN = {
  name: "Administrador",
  email: "admin@biblioteca.test",
  password: "Admin1234!",
  faculty: "Tecnología Informática",
  career: "Ingeniería en Sistemas Informáticos",
} as const;

export const SAMPLE_STUDENT = {
  name: "Alumno",
  email: "alumno@biblioteca.test",
  password: "Alumno1234!",
  faculty: "Tecnología Informática",
  career: "Ingeniería en Sistemas Informáticos",
} as const;

async function ensureAccount(account: {
  name: string;
  email: string;
  password: string;
  faculty: string;
  career: string;
  role: "admin" | "user";
}): Promise<void> {
  try {
    await auth.api.signUpEmail({
      body: {
        name: account.name,
        email: account.email,
        password: account.password,
        faculty: account.faculty,
        career: account.career,
      },
    });
    console.log(`[cuentas] creada: ${account.email}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ya existia";
    console.log(`[cuentas] ${account.email}: ${message}`);
  }

  const db = mongoose.connection.db;
  if (!db) throw new Error("Mongo no esta conectado");

  const result = await db.collection("user").updateOne(
    { email: account.email },
    {
      $set: {
        role: account.role,
        name: account.name,
        faculty: account.faculty,
        career: account.career,
      },
    },
  );
  if (result.matchedCount === 0) {
    throw new Error(`No se pudo dejar la cuenta ${account.email}`);
  }
}

export async function ensureFixedAdmin(): Promise<void> {
  await ensureAccount({ ...FIXED_ADMIN, role: "admin" });
  await ensureAccount({ ...SAMPLE_STUDENT, role: "user" });
  console.log(`[cuentas] admin fijo ${FIXED_ADMIN.email}; alumno de ejemplo ${SAMPLE_STUDENT.email}`);
}
