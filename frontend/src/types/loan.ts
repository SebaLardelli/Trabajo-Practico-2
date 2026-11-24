export type LoanStatus = "active" | "returned" | "overdue";

export interface LoanRecord {
  _id: string;
  bookId: string;
  title: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCareer: string;
  startDate: string;
  dueDate: string;
  returnedAt: string | null;
  status: LoanStatus;
}

export interface LoanSummary {
  titles: number;
  copies: number;
  onLoan: number;
  inRoom: number;
  active: number;
  overdue: number;
  returned: number;
}

export interface NoticeItem {
  _id: string;
  kind: "loan" | "returned" | "overdue" | "updated";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
