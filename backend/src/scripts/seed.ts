import "dotenv/config";
import mongoose from "mongoose";
import { connectMongoDB, disconnectMongoDB } from "../config/db.js";
import { libraryBooks } from "../data/library.js";
import { ensureFixedAdmin } from "../lib/fixed-admin.js";
import Book from "../models/Book.js";

async function main(): Promise<void> {
  await connectMongoDB();
  await ensureFixedAdmin();

  let created = 0;
  for (const book of libraryBooks) {
    const result = await Book.updateOne(
      { title: book.title, career: book.career },
      {
        $setOnInsert: {
          ...book,
          copies: 2,
          onLoan: 0,
          publishedAt: new Date(book.publishedAt),
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount > 0) created += 1;
  }
  await Book.updateMany({ copies: { $exists: false } }, { $set: { copies: 2, onLoan: 0, available: true } });
  console.log(`[seed] catalogo UAI: ${created} libros nuevos, ${libraryBooks.length} en total`);

  await disconnectMongoDB();
}

main().catch(async (error: unknown) => {
  console.error("[seed] fallo:", error);
  await mongoose.connection.close().catch(() => undefined);
  process.exit(1);
});
