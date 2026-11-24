export interface UaiCareer {
  faculty: string;
  name: string;
  distance?: boolean;
}

export const FACULTIES = [
  "Arquitectura",
  "Ciencias de la Comunicación",
  "Ciencias de la Educación y Psicopedagogía",
  "Ciencias Económicas",
  "Derecho y Ciencias Políticas",
  "Medicina y Ciencias de la Salud",
  "Motricidad Humana y Deportes",
  "Psicología y Relaciones Humanas",
  "Tecnología Informática",
  "Turismo y Hospitalidad",
] as const;

export const CAREERS: UaiCareer[] = [
  { faculty: "Arquitectura", name: "Arquitectura" },
  { faculty: "Arquitectura", name: "Licenciatura en Diseño de Interiores" },

  { faculty: "Ciencias de la Comunicación", name: "Licenciatura en Diseño de Comunicación Visual" },
  { faculty: "Ciencias de la Comunicación", name: "Licenciatura en Periodismo, Gestión y Producción de Contenidos" },
  { faculty: "Ciencias de la Comunicación", name: "Licenciatura en Producción y Realización Audiovisual" },
  { faculty: "Ciencias de la Comunicación", name: "Licenciatura en Publicidad" },
  { faculty: "Ciencias de la Comunicación", name: "Licenciatura en Relaciones Públicas" },
  { faculty: "Ciencias de la Comunicación", name: "Tecnicatura Universitaria en Animación Digital y Efectos Visuales", distance: true },
  { faculty: "Ciencias de la Comunicación", name: "Tecnicatura Universitaria en Periodismo Deportivo" },

  { faculty: "Ciencias de la Educación y Psicopedagogía", name: "Licenciatura en Gestión de Instituciones Educativas", distance: true },
  { faculty: "Ciencias de la Educación y Psicopedagogía", name: "Licenciatura en Gestión Educativa", distance: true },
  { faculty: "Ciencias de la Educación y Psicopedagogía", name: "Licenciatura en Psicopedagogía" },
  { faculty: "Ciencias de la Educación y Psicopedagogía", name: "Profesorado Universitario en Ciencias de la Educación" },
  { faculty: "Ciencias de la Educación y Psicopedagogía", name: "Profesorado Universitario para la Educación Secundaria y Superior" },

  { faculty: "Ciencias Económicas", name: "Contador Público" },
  { faculty: "Ciencias Económicas", name: "Licenciatura en Administración", distance: true },
  { faculty: "Ciencias Económicas", name: "Licenciatura en Comercialización", distance: true },
  { faculty: "Ciencias Económicas", name: "Licenciatura en Comercio Internacional" },
  { faculty: "Ciencias Económicas", name: "Licenciatura en Economía" },
  { faculty: "Ciencias Económicas", name: "Tecnicatura Universitaria en Ventas", distance: true },

  { faculty: "Derecho y Ciencias Políticas", name: "Abogacía" },
  { faculty: "Derecho y Ciencias Políticas", name: "Licenciatura en Ciencia Política y Gobierno" },
  { faculty: "Derecho y Ciencias Políticas", name: "Licenciatura en Relaciones Internacionales" },
  { faculty: "Derecho y Ciencias Políticas", name: "Martillero Público, Corredor y Administrador de Consorcio", distance: true },

  { faculty: "Medicina y Ciencias de la Salud", name: "Medicina" },
  { faculty: "Medicina y Ciencias de la Salud", name: "Odontología" },
  { faculty: "Medicina y Ciencias de la Salud", name: "Licenciatura en Enfermería" },
  { faculty: "Medicina y Ciencias de la Salud", name: "Licenciatura en Instrumentación Quirúrgica" },
  { faculty: "Medicina y Ciencias de la Salud", name: "Licenciatura en Kinesiología y Fisiatría" },
  { faculty: "Medicina y Ciencias de la Salud", name: "Licenciatura en Nutrición" },
  { faculty: "Medicina y Ciencias de la Salud", name: "Licenciatura en Producción de Bioimágenes", distance: true },
  { faculty: "Medicina y Ciencias de la Salud", name: "Tecnicatura Universitaria en Asistencia Dental" },
  { faculty: "Medicina y Ciencias de la Salud", name: "Tecnicatura Universitaria en Prótesis Dental" },

  { faculty: "Motricidad Humana y Deportes", name: "Profesorado Universitario en Educación Física y Deportes" },
  { faculty: "Motricidad Humana y Deportes", name: "Licenciatura en Actividad Física y Deportes", distance: true },

  { faculty: "Psicología y Relaciones Humanas", name: "Licenciatura en Psicología" },
  { faculty: "Psicología y Relaciones Humanas", name: "Licenciatura en Musicoterapia" },
  { faculty: "Psicología y Relaciones Humanas", name: "Licenciatura en Terapia Ocupacional" },
  { faculty: "Psicología y Relaciones Humanas", name: "Tecnicatura Universitaria en Acompañamiento Terapéutico" },

  { faculty: "Tecnología Informática", name: "Ingeniería en Sistemas Informáticos" },
  { faculty: "Tecnología Informática", name: "Analista Programador", distance: true },
  { faculty: "Tecnología Informática", name: "Licenciatura en Gestión de Tecnología Informática" },
  { faculty: "Tecnología Informática", name: "Licenciatura en Matemática", distance: true },
  { faculty: "Tecnología Informática", name: "Licenciatura en Producción de Simuladores y Videojuegos", distance: true },

  { faculty: "Turismo y Hospitalidad", name: "Licenciatura en Turismo" },
  { faculty: "Turismo y Hospitalidad", name: "Licenciatura en Hotelería" },
  { faculty: "Turismo y Hospitalidad", name: "Licenciatura en Gastronomía" },
  { faculty: "Turismo y Hospitalidad", name: "Guía Universitario en Turismo" },
  { faculty: "Turismo y Hospitalidad", name: "Tecnicatura Universitaria en Gestión de Servicios Turísticos y Hoteleros", distance: true },
  { faculty: "Turismo y Hospitalidad", name: "Tecnicatura Universitaria en Gestión y Organización de Eventos", distance: true },
];

export function findCareer(name: string): UaiCareer | undefined {
  const clean = name.trim();
  return CAREERS.find((career) => career.name === clean);
}
