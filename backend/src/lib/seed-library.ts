import { libraryBooks } from "../data/library.js";
import Book from "../models/Book.js";

export async function seedLibrary(): Promise<number> {
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
  return created;
}
