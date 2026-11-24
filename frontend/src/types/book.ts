export interface Book {
  _id: string;
  title: string;
  author: string;
  pages: number;
  publishedAt: string;
  available: boolean;
  copies?: number;
  onLoan?: number;
  faculty?: string;
  career?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookList {
  data: Book[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
