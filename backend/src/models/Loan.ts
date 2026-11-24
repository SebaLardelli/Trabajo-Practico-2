import { Schema, model, Document, Model, Types } from "mongoose";

export type LoanStatus = "active" | "returned" | "overdue";

export interface ILoan {
  book: Types.ObjectId;
  bookTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCareer: string;
  startDate: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: LoanStatus;
  overdueNotifiedAt: Date | null;
}

export interface ILoanDocument extends ILoan, Document {
  _id: Types.ObjectId;
}

const loanSchema = new Schema<ILoanDocument>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    bookTitle: { type: String, required: true, trim: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, trim: true },
    userCareer: { type: String, default: "", trim: true },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnedAt: { type: Date, default: null },
    status: { type: String, enum: ["active", "returned", "overdue"], default: "active" },
    overdueNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

loanSchema.index({ userId: 1, returnedAt: 1 });
loanSchema.index({ book: 1, returnedAt: 1 });

const Loan: Model<ILoanDocument> = model<ILoanDocument>("Loan", loanSchema);

export default Loan;
