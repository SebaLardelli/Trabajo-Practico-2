import "dotenv/config";
import mongoose from "mongoose";
import { auth } from "../lib/auth.js";
import { connectMongoDB, disconnectMongoDB } from "../config/db.js";
import Book from "../models/Book.js";

const accounts = [
  { name: "Admin", email: "admin@biblioteca.test", password: "Admin1234!", role: "admin" },
  { name: "Usuario", email: "user@biblioteca.test", password: "User1234!", role: "user" },
] as const;

async function ensureAccount(account: (typeof accounts)[number]): Promise<void> {
  try {
    await auth.api.signUpEmail({
      body: { name: account.name, email: account.email, password: account.password },
    });
    console.log(`[seed] cuenta creada: ${account.email}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ya existia";
    console.log(`[seed] ${account.email}: ${message}`);
  }

  const db = mongoose.connection.db;
  if (!db) throw new Error("Mongo no esta conectado");

  const result = await db.collection("user").updateOne({ email: account.email }, { $set: { role: account.role } });
  if (result.matchedCount === 0) {
    throw new Error(`No se encontro el usuario ${account.email} para asignarle el rol`);
  }
  console.log(`[seed] rol ${account.role} en ${account.email}`);
}

async function main(): Promise<void> {
  await connectMongoDB();

  for (const account of accounts) {
    await ensureAccount(account);
  }

  const count = await Book.countDocuments();
  if (count === 0) {
    await Book.create([
      {
        title: "El Aleph",
        author: "Jorge Luis Borges",
        pages: 192,
        publishedAt: new Date("1949-06-01"),
        available: true,
      },
      {
        title: "Rayuela",
        author: "Julio Cortazar",
        pages: 600,
        publishedAt: new Date("1963-06-28"),
        available: false,
      },
    ]);
    console.log("[seed] dos libros de ejemplo creados");
  }

  await disconnectMongoDB();
}

main().catch(async (error: unknown) => {
  console.error("[seed] fallo:", error);
  await mongoose.connection.close().catch(() => undefined);
  process.exit(1);
});
