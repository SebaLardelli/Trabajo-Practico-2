import { Schema, model, Document, Model, Types } from "mongoose";

export interface IBook {
  title: string;
  author: string;
  pages: number;
  publishedAt: Date;
  available: boolean;
}

export interface IBookDocument extends IBook, Document {
  _id: Types.ObjectId;
}

const bookSchema = new Schema<IBookDocument>(
  {
    title: {
      type: String,
      required: [true, "El titulo es obligatorio"],
      trim: true,
      maxlength: [160, "El titulo no puede superar 160 caracteres"],
    },
    author: {
      type: String,
      required: [true, "El autor es obligatorio"],
      trim: true,
      maxlength: [120, "El autor no puede superar 120 caracteres"],
    },
    pages: {
      type: Number,
      required: [true, "La cantidad de paginas es obligatoria"],
      min: [1, "El libro tiene que tener al menos 1 pagina"],
    },
    publishedAt: {
      type: Date,
      required: [true, "La fecha de publicacion es obligatoria"],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Book: Model<IBookDocument> = model<IBookDocument>("Book", bookSchema);

export default Book;
