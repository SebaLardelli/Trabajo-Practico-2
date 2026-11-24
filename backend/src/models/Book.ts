import { Schema, model, Document, Model, Types } from "mongoose";

export interface IBook {
  title: string;
  author: string;
  pages: number;
  publishedAt: Date;
  available: boolean;
  copies: number;
  onLoan: number;
  faculty: string;
  career: string;
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
    copies: {
      type: Number,
      default: 1,
      min: [1, "Tiene que haber al menos 1 ejemplar"],
      max: [99, "No se pueden cargar mas de 99 ejemplares"],
    },
    onLoan: {
      type: Number,
      default: 0,
      min: [0, "Los prestamos no pueden ser negativos"],
    },
    faculty: {
      type: String,
      required: [true, "La facultad es obligatoria"],
      trim: true,
      maxlength: [80, "La facultad no puede superar 80 caracteres"],
    },
    career: {
      type: String,
      required: [true, "La carrera es obligatoria"],
      trim: true,
      maxlength: [140, "La carrera no puede superar 140 caracteres"],
    },
  },
  { timestamps: true },
);

const Book: Model<IBookDocument> = model<IBookDocument>("Book", bookSchema);

export default Book;
