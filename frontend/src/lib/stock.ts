export interface Stock {
  total: number;
  loaned: number;
  left: number;
  inRoom: boolean;
}

export function bookStock(book: { copies?: number; onLoan?: number }): Stock {
  const total = Math.max(0, book.copies ?? 0);
  const loaned = Math.min(Math.max(0, book.onLoan ?? 0), total);
  const left = total - loaned;
  return { total, loaned, left, inRoom: left > 0 };
}
