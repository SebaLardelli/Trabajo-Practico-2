import "dotenv/config";
import mongoose from "mongoose";
import { connectMongoDB, disconnectMongoDB } from "../config/db.js";
import { libraryBooks } from "../data/library.js";
import { ensureFixedAdmin } from "../lib/fixed-admin.js";
import { seedLibrary } from "../lib/seed-library.js";

async function main(): Promise<void> {
  await connectMongoDB();
  await ensureFixedAdmin();

  const created = await seedLibrary();
  console.log(`[seed] catalogo UAI: ${created} libros nuevos, ${libraryBooks.length} en total`);

  await disconnectMongoDB();
}

main().catch(async (error: unknown) => {
  console.error("[seed] fallo:", error);
  await mongoose.connection.close().catch(() => undefined);
  process.exit(1);
});
