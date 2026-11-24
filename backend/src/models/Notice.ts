import { Schema, model, Document, Model, Types } from "mongoose";

export type NoticeKind = "loan" | "returned" | "overdue" | "updated";

export interface INotice {
  userId: string;
  kind: NoticeKind;
  title: string;
  body: string;
  read: boolean;
  loanId?: Types.ObjectId;
}

export interface INoticeDocument extends INotice, Document {
  _id: Types.ObjectId;
  createdAt?: Date;
}

const noticeSchema = new Schema<INoticeDocument>(
  {
    userId: { type: String, required: true, index: true },
    kind: { type: String, enum: ["loan", "returned", "overdue", "updated"], required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    loanId: { type: Schema.Types.ObjectId, ref: "Loan" },
  },
  { timestamps: true },
);

const Notice: Model<INoticeDocument> = model<INoticeDocument>("Notice", noticeSchema);

export default Notice;
