import type { Book, BookList } from "../types/book";
import { companionBooks } from "./companions";

export interface SeedBook {
  title: string;
  author: string;
  pages: number;
  publishedAt: string;
  available: boolean;
  faculty: string;
  career: string;
}

const baseBooks: SeedBook[] = [
  { faculty: "Arquitectura", career: "Arquitectura", title: "Arquitectura: forma, espacio y orden", author: "Francis D. K. Ching", pages: 464, publishedAt: "2015-01-01", available: true },
  { faculty: "Arquitectura", career: "Licenciatura en Diseño de Interiores", title: "Diseño de interiores: un manual", author: "Francis D. K. Ching", pages: 352, publishedAt: "2015-01-01", available: true },
  { faculty: "Ciencias de la Comunicación", career: "Licenciatura en Diseño de Comunicación Visual", title: "La sintaxis de la imagen", author: "Donis A. Dondis", pages: 240, publishedAt: "1973-01-01", available: true },
  { faculty: "Ciencias de la Comunicación", career: "Licenciatura en Periodismo, Gestión y Producción de Contenidos", title: "Los elementos del periodismo", author: "Bill Kovach y Tom Rosenstiel", pages: 288, publishedAt: "2001-01-01", available: false },
  { faculty: "Ciencias de la Comunicación", career: "Licenciatura en Producción y Realización Audiovisual", title: "Dirección de documentales", author: "Michael Rabiger", pages: 672, publishedAt: "2009-01-01", available: true },
  { faculty: "Ciencias de la Comunicación", career: "Licenciatura en Publicidad", title: "Confesiones de un publicitario", author: "David Ogilvy", pages: 192, publishedAt: "1963-01-01", available: true },
  { faculty: "Ciencias de la Comunicación", career: "Licenciatura en Relaciones Públicas", title: "Dirección de relaciones públicas", author: "James E. Grunig", pages: 640, publishedAt: "2003-01-01", available: true },
  { faculty: "Ciencias de la Comunicación", career: "Tecnicatura Universitaria en Animación Digital y Efectos Visuales", title: "El kit de supervivencia del animador", author: "Richard Williams", pages: 384, publishedAt: "2001-01-01", available: false },
  { faculty: "Ciencias de la Comunicación", career: "Tecnicatura Universitaria en Periodismo Deportivo", title: "Periodismo deportivo", author: "Raymond Boyle", pages: 256, publishedAt: "2006-01-01", available: true },
  { faculty: "Ciencias de la Educación y Psicopedagogía", career: "Licenciatura en Gestión de Instituciones Educativas", title: "Gestión escolar: una aproximación a la calidad", author: "Carlos Alvariño", pages: 220, publishedAt: "2000-01-01", available: true },
  { faculty: "Ciencias de la Educación y Psicopedagogía", career: "Licenciatura en Gestión Educativa", title: "El significado del cambio educativo", author: "Michael Fullan", pages: 320, publishedAt: "2002-01-01", available: true },
  { faculty: "Ciencias de la Educación y Psicopedagogía", career: "Licenciatura en Psicopedagogía", title: "Psicología de la inteligencia", author: "Jean Piaget", pages: 208, publishedAt: "1947-01-01", available: true },
  { faculty: "Ciencias de la Educación y Psicopedagogía", career: "Profesorado Universitario en Ciencias de la Educación", title: "Pedagogía del oprimido", author: "Paulo Freire", pages: 248, publishedAt: "1970-01-01", available: false },
  { faculty: "Ciencias de la Educación y Psicopedagogía", career: "Profesorado Universitario para la Educación Secundaria y Superior", title: "La formación docente en cuestión", author: "María Cristina Davini", pages: 224, publishedAt: "1995-01-01", available: true },
  { faculty: "Ciencias Económicas", career: "Contador Público", title: "Contabilidad básica", author: "Enrique Fowler Newton", pages: 720, publishedAt: "2019-01-01", available: true },
  { faculty: "Ciencias Económicas", career: "Licenciatura en Administración", title: "Administración", author: "Stephen P. Robbins", pages: 752, publishedAt: "2018-01-01", available: true },
  { faculty: "Ciencias Económicas", career: "Licenciatura en Comercialización", title: "Dirección de marketing", author: "Philip Kotler", pages: 816, publishedAt: "2016-01-01", available: false },
  { faculty: "Ciencias Económicas", career: "Licenciatura en Comercio Internacional", title: "Negocios internacionales", author: "John D. Daniels", pages: 704, publishedAt: "2015-01-01", available: true },
  { faculty: "Ciencias Económicas", career: "Licenciatura en Economía", title: "Principios de economía", author: "N. Gregory Mankiw", pages: 880, publishedAt: "2020-01-01", available: true },
  { faculty: "Ciencias Económicas", career: "Tecnicatura Universitaria en Ventas", title: "Dirección de ventas", author: "Gilbert A. Churchill", pages: 640, publishedAt: "2006-01-01", available: true },
  { faculty: "Derecho y Ciencias Políticas", career: "Abogacía", title: "Derecho de las obligaciones", author: "Atilio Aníbal Alterini", pages: 912, publishedAt: "2016-01-01", available: true },
  { faculty: "Derecho y Ciencias Políticas", career: "Licenciatura en Ciencia Política y Gobierno", title: "Elementos de teoría política", author: "Giovanni Sartori", pages: 320, publishedAt: "1987-01-01", available: true },
  { faculty: "Derecho y Ciencias Políticas", career: "Licenciatura en Relaciones Internacionales", title: "Teoría de la política internacional", author: "Kenneth N. Waltz", pages: 256, publishedAt: "1979-01-01", available: false },
  { faculty: "Derecho y Ciencias Políticas", career: "Martillero Público, Corredor y Administrador de Consorcio", title: "Derechos reales", author: "Marina Mariani de Vidal", pages: 980, publishedAt: "2016-01-01", available: true },
  { faculty: "Medicina y Ciencias de la Salud", career: "Medicina", title: "Tratado de fisiología médica", author: "Arthur C. Guyton y John E. Hall", pages: 1120, publishedAt: "2021-01-01", available: true },
  { faculty: "Medicina y Ciencias de la Salud", career: "Odontología", title: "Anatomía, fisiología y oclusión dental", author: "Stanley J. Nelson", pages: 368, publishedAt: "2015-01-01", available: true },
  { faculty: "Medicina y Ciencias de la Salud", career: "Licenciatura en Enfermería", title: "Fundamentos de enfermería", author: "Barbara Kozier", pages: 1600, publishedAt: "2018-01-01", available: false },
  { faculty: "Medicina y Ciencias de la Salud", career: "Licenciatura en Instrumentación Quirúrgica", title: "Instrumentación quirúrgica", author: "Joanna Kotcher Fuller", pages: 1136, publishedAt: "2019-01-01", available: true },
  { faculty: "Medicina y Ciencias de la Salud", career: "Licenciatura en Kinesiología y Fisiatría", title: "Fisiología articular", author: "Adalbert I. Kapandji", pages: 336, publishedAt: "2006-01-01", available: true },
  { faculty: "Medicina y Ciencias de la Salud", career: "Licenciatura en Nutrición", title: "Nutrición y dietoterapia", author: "L. Kathleen Mahan", pages: 1224, publishedAt: "2017-01-01", available: true },
  { faculty: "Medicina y Ciencias de la Salud", career: "Licenciatura en Producción de Bioimágenes", title: "Física de la imagen médica", author: "Jerrold T. Bushberg", pages: 1048, publishedAt: "2012-01-01", available: true },
  { faculty: "Medicina y Ciencias de la Salud", career: "Tecnicatura Universitaria en Asistencia Dental", title: "Asistencia odontológica moderna", author: "Doni L. Bird", pages: 1184, publishedAt: "2018-01-01", available: false },
  { faculty: "Medicina y Ciencias de la Salud", career: "Tecnicatura Universitaria en Prótesis Dental", title: "Fundamentos de prótesis fija", author: "Herbert T. Shillingburg", pages: 584, publishedAt: "2012-01-01", available: true },
  { faculty: "Motricidad Humana y Deportes", career: "Profesorado Universitario en Educación Física y Deportes", title: "La enseñanza de la educación física", author: "Muska Mosston", pages: 384, publishedAt: "2008-01-01", available: true },
  { faculty: "Motricidad Humana y Deportes", career: "Licenciatura en Actividad Física y Deportes", title: "Fisiología del esfuerzo y del deporte", author: "Jack H. Wilmore", pages: 736, publishedAt: "2007-01-01", available: true },
  { faculty: "Psicología y Relaciones Humanas", career: "Licenciatura en Psicología", title: "Psicología", author: "David G. Myers", pages: 864, publishedAt: "2014-01-01", available: true },
  { faculty: "Psicología y Relaciones Humanas", career: "Licenciatura en Musicoterapia", title: "Modelos de improvisación en musicoterapia", author: "Kenneth E. Bruscia", pages: 560, publishedAt: "1987-01-01", available: false },
  { faculty: "Psicología y Relaciones Humanas", career: "Licenciatura en Terapia Ocupacional", title: "Modelo de ocupación humana", author: "Gary Kielhofner", pages: 576, publishedAt: "2008-01-01", available: true },
  { faculty: "Psicología y Relaciones Humanas", career: "Tecnicatura Universitaria en Acompañamiento Terapéutico", title: "El acompañamiento terapéutico", author: "Susana Kuras de Mauer", pages: 192, publishedAt: "2007-01-01", available: true },
  { faculty: "Tecnología Informática", career: "Ingeniería en Sistemas Informáticos", title: "Ingeniería del software", author: "Ian Sommerville", pages: 816, publishedAt: "2016-01-01", available: true },
  { faculty: "Tecnología Informática", career: "Analista Programador", title: "Fundamentos de programación", author: "Luis Joyanes Aguilar", pages: 736, publishedAt: "2020-01-01", available: true },
  { faculty: "Tecnología Informática", career: "Licenciatura en Gestión de Tecnología Informática", title: "Sistemas de información gerencial", author: "Kenneth C. Laudon", pages: 672, publishedAt: "2020-01-01", available: false },
  { faculty: "Tecnología Informática", career: "Licenciatura en Matemática", title: "Cálculo de una variable", author: "James Stewart", pages: 960, publishedAt: "2016-01-01", available: true },
  { faculty: "Tecnología Informática", career: "Licenciatura en Producción de Simuladores y Videojuegos", title: "El arte del diseño de juegos", author: "Jesse Schell", pages: 544, publishedAt: "2019-01-01", available: true },
  { faculty: "Turismo y Hospitalidad", career: "Licenciatura en Turismo", title: "Planificación del espacio turístico", author: "Roberto C. Boullón", pages: 288, publishedAt: "2006-01-01", available: true },
  { faculty: "Turismo y Hospitalidad", career: "Licenciatura en Hotelería", title: "Introducción a la hospitalidad", author: "John R. Walker", pages: 640, publishedAt: "2017-01-01", available: true },
  { faculty: "Turismo y Hospitalidad", career: "Licenciatura en Gastronomía", title: "La cocina y los alimentos", author: "Harold McGee", pages: 896, publishedAt: "2004-01-01", available: false },
  { faculty: "Turismo y Hospitalidad", career: "Guía Universitario en Turismo", title: "Introducción al turismo", author: "Miguel Ángel Acerenza", pages: 240, publishedAt: "2006-01-01", available: true },
  { faculty: "Turismo y Hospitalidad", career: "Tecnicatura Universitaria en Gestión de Servicios Turísticos y Hoteleros", title: "Administración de servicios", author: "Christopher Lovelock", pages: 704, publishedAt: "2015-01-01", available: true },
  { faculty: "Turismo y Hospitalidad", career: "Tecnicatura Universitaria en Gestión y Organización de Eventos", title: "Organización de reuniones y eventos", author: "Donald Getz", pages: 320, publishedAt: "2007-01-01", available: true },
  { faculty: "Formación general", career: "Todas las carreras", title: "Cómo se hace una tesis", author: "Umberto Eco", pages: 272, publishedAt: "1977-01-01", available: true },
  { faculty: "Formación general", career: "Todas las carreras", title: "La cocina de la escritura", author: "Daniel Cassany", pages: 256, publishedAt: "1995-01-01", available: true },
];

export const libraryBooks: SeedBook[] = baseBooks.flatMap((book) => [
  book,
  ...(companionBooks[book.career] ?? []).map((extra) => ({
    ...extra,
    faculty: book.faculty,
    career: book.career,
  })),
]);

export function catalogAuthors(): string[] {
  return [...new Set(libraryBooks.map((book) => book.author))].sort((a, b) => a.localeCompare(b, "es"));
}

const rented = new Map<string, boolean>();

const demoBooks: Book[] = libraryBooks.map((book, index) => ({
  _id: `demo-${index + 1}`,
  title: book.title,
  author: book.author,
  pages: book.pages,
  publishedAt: new Date(book.publishedAt).toISOString(),
  available: true,
  copies: 2,
  onLoan: 0,
  faculty: book.faculty,
  career: book.career,
  createdAt: new Date(book.publishedAt).toISOString(),
  updatedAt: new Date(book.publishedAt).toISOString(),
}));

function withLoan(book: Book): Book {
  const total = book.copies ?? 2;
  const loaned = rented.get(book._id) === false ? 1 : 0;
  return { ...book, copies: total, onLoan: loaned, available: total > 0 && loaned < total };
}

export function setDemoAvailable(id: string, available: boolean): void {
  rented.set(id, available);
}

export function findDemoBook(id: string): Book | undefined {
  const book = demoBooks.find((item) => item._id === id);
  return book ? withLoan(book) : undefined;
}

export function filterDemoBooks(params: {
  page?: number;
  limit?: number;
  search?: string;
  available?: "true" | "false";
  faculty?: string;
  career?: string;
}): BookList {
  const page = params.page ?? 1;
  const limit = params.limit ?? 8;
  const search = params.search?.trim().toLowerCase();
  const items = demoBooks.map(withLoan).filter((book) => {
    if (params.faculty && book.faculty !== params.faculty) return false;
    if (params.career && book.career !== params.career) return false;
    if (params.available === "true" && !book.available) return false;
    if (params.available === "false" && book.available) return false;
    if (!search) return true;
    return [book.title, book.author, book.career, book.faculty].some((value) => value?.toLowerCase().includes(search));
  });
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { total: items.length, page, limit, totalPages: Math.max(1, Math.ceil(items.length / limit)) },
  };
}
