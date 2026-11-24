export interface CompanionBook {
  title: string;
  author: string;
  pages: number;
  publishedAt: string;
  available: boolean;
}

export const companionBooks: Record<string, CompanionBook[]> = {
  Arquitectura: [
    { title: "Arte de proyectar en arquitectura", author: "Ernst Neufert", pages: 568, publishedAt: "2013-01-01", available: true },
    { title: "Saber ver la arquitectura", author: "Bruno Zevi", pages: 208, publishedAt: "1948-01-01", available: false },
  ],
  "Licenciatura en Diseño de Interiores": [
    { title: "Color, espacio y estilo", author: "Chris Grimley", pages: 288, publishedAt: "2007-01-01", available: true },
    { title: "Los ojos de la piel", author: "Juhani Pallasmaa", pages: 80, publishedAt: "2005-01-01", available: true },
  ],
  "Licenciatura en Diseño de Comunicación Visual": [
    { title: "Diseñar para la gente", author: "Henry Dreyfuss", pages: 240, publishedAt: "1955-01-01", available: true },
    { title: "Pensar con tipos", author: "Ellen Lupton", pages: 224, publishedAt: "2004-01-01", available: true },
  ],
  "Licenciatura en Periodismo, Gestión y Producción de Contenidos": [
    { title: "Periodismo práctico", author: "Martín Caparrós", pages: 320, publishedAt: "2016-01-01", available: true },
    { title: "Sobre el oficio", author: "Ryszard Kapuściński", pages: 112, publishedAt: "2002-01-01", available: true },
  ],
  "Licenciatura en Producción y Realización Audiovisual": [
    { title: "El cine según Hitchcock", author: "François Truffaut", pages: 368, publishedAt: "1966-01-01", available: true },
    { title: "Narrativa cinematográfica", author: "Syd Field", pages: 272, publishedAt: "1979-01-01", available: false },
  ],
  "Licenciatura en Publicidad": [
    { title: "Ogilvy & la publicidad", author: "David Ogilvy", pages: 224, publishedAt: "1983-01-01", available: true },
    { title: "Publicidad", author: "William Wells", pages: 640, publishedAt: "2007-01-01", available: true },
  ],
  "Licenciatura en Relaciones Públicas": [
    { title: "Relaciones públicas", author: "Fraser P. Seitel", pages: 512, publishedAt: "2017-01-01", available: true },
    { title: "Comunicación estratégica", author: "Sandra Massoni", pages: 240, publishedAt: "2013-01-01", available: true },
  ],
  "Tecnicatura Universitaria en Animación Digital y Efectos Visuales": [
    { title: "La ilusión de la vida", author: "Frank Thomas y Ollie Johnston", pages: 576, publishedAt: "1981-01-01", available: true },
    { title: "Color y luz", author: "James Gurney", pages: 224, publishedAt: "2010-01-01", available: true },
  ],
  "Tecnicatura Universitaria en Periodismo Deportivo": [
    { title: "El fútbol a sol y sombra", author: "Eduardo Galeano", pages: 272, publishedAt: "1995-01-01", available: true },
    { title: "Periodismo deportivo de calidad", author: "José Luis Rojas Torrijos", pages: 220, publishedAt: "2014-01-01", available: false },
  ],
  "Licenciatura en Gestión de Instituciones Educativas": [
    { title: "Mejorar la escuela", author: "Michael Fullan", pages: 280, publishedAt: "2002-01-01", available: true },
    { title: "La escuela inteligente", author: "David Perkins", pages: 256, publishedAt: "1992-01-01", available: true },
  ],
  "Licenciatura en Gestión Educativa": [
    { title: "El cambio educativo", author: "Andy Hargreaves", pages: 304, publishedAt: "2003-01-01", available: true },
    { title: "Replantear la educación", author: "Fernando Reimers", pages: 240, publishedAt: "2016-01-01", available: true },
  ],
  "Licenciatura en Psicopedagogía": [
    { title: "Seis estudios de psicología", author: "Jean Piaget", pages: 192, publishedAt: "1964-01-01", available: true },
    { title: "Pensamiento y lenguaje", author: "Lev Vygotsky", pages: 224, publishedAt: "1934-01-01", available: false },
  ],
  "Profesorado Universitario en Ciencias de la Educación": [
    { title: "La educación como práctica de la libertad", author: "Paulo Freire", pages: 160, publishedAt: "1967-01-01", available: true },
    { title: "Experiencia y educación", author: "John Dewey", pages: 128, publishedAt: "1938-01-01", available: true },
  ],
  "Profesorado Universitario para la Educación Secundaria y Superior": [
    { title: "Enseñar en la universidad", author: "Ken Bain", pages: 288, publishedAt: "2004-01-01", available: true },
    { title: "Didáctica de nivel superior", author: "Alicia Camilloni", pages: 240, publishedAt: "2007-01-01", available: true },
  ],
  "Contador Público": [
    { title: "Contabilidad superior", author: "Enrique Fowler Newton", pages: 980, publishedAt: "2018-01-01", available: true },
    { title: "Normas contables profesionales", author: "Mario Biondi", pages: 640, publishedAt: "2014-01-01", available: false },
  ],
  "Licenciatura en Administración": [
    { title: "El proceso estratégico", author: "Henry Mintzberg", pages: 480, publishedAt: "1991-01-01", available: true },
    { title: "Administración: una perspectiva global", author: "Harold Koontz", pages: 704, publishedAt: "2012-01-01", available: true },
  ],
  "Licenciatura en Comercialización": [
    { title: "Marketing estratégico", author: "Jean-Jacques Lambin", pages: 608, publishedAt: "2009-01-01", available: true },
    { title: "Posicionamiento", author: "Al Ries y Jack Trout", pages: 224, publishedAt: "1981-01-01", available: true },
  ],
  "Licenciatura en Comercio Internacional": [
    { title: "Economía internacional", author: "Paul Krugman", pages: 784, publishedAt: "2018-01-01", available: true },
    { title: "Logística internacional", author: "Donald F. Wood", pages: 512, publishedAt: "2002-01-01", available: false },
  ],
  "Licenciatura en Economía": [
    { title: "Microeconomía", author: "Robert S. Pindyck", pages: 768, publishedAt: "2018-01-01", available: true },
    { title: "Macroeconomía", author: "Olivier Blanchard", pages: 672, publishedAt: "2017-01-01", available: true },
  ],
  "Tecnicatura Universitaria en Ventas": [
    { title: "Venta estratégica", author: "Neil Rackham", pages: 368, publishedAt: "1988-01-01", available: true },
    { title: "El vendedor desafiante", author: "Matthew Dixon", pages: 240, publishedAt: "2011-01-01", available: true },
  ],
  Abogacía: [
    { title: "Contratos", author: "Atilio Aníbal Alterini", pages: 860, publishedAt: "2014-01-01", available: true },
    { title: "Introducción al derecho", author: "Guillermo A. Borda", pages: 420, publishedAt: "1996-01-01", available: false },
  ],
  "Licenciatura en Ciencia Política y Gobierno": [
    { title: "El príncipe", author: "Nicolás Maquiavelo", pages: 176, publishedAt: "1532-01-01", available: true },
    { title: "La democracia en América", author: "Alexis de Tocqueville", pages: 640, publishedAt: "1835-01-01", available: true },
  ],
  "Licenciatura en Relaciones Internacionales": [
    { title: "La sociedad anárquica", author: "Hedley Bull", pages: 352, publishedAt: "1977-01-01", available: true },
    { title: "Paz y guerra entre las naciones", author: "Raymond Aron", pages: 720, publishedAt: "1962-01-01", available: true },
  ],
  "Martillero Público, Corredor y Administrador de Consorcio": [
    { title: "Propiedad horizontal", author: "Claudio Kiper", pages: 480, publishedAt: "2016-01-01", available: true },
    { title: "Manual del martillero", author: "Julio César Rivera", pages: 360, publishedAt: "2012-01-01", available: true },
  ],
  Medicina: [
    { title: "Harrison. Principios de medicina interna", author: "J. Larry Jameson", pages: 2400, publishedAt: "2022-01-01", available: true },
    { title: "Anatomía con orientación clínica", author: "Keith L. Moore", pages: 1168, publishedAt: "2018-01-01", available: false },
  ],
  Odontología: [
    { title: "Vías de la pulpa", author: "Kenneth M. Hargreaves", pages: 992, publishedAt: "2016-01-01", available: true },
    { title: "Periodoncia clínica", author: "Fermín Carranza", pages: 880, publishedAt: "2012-01-01", available: true },
  ],
  "Licenciatura en Enfermería": [
    { title: "Diagnósticos enfermeros", author: "T. Heather Herdman", pages: 512, publishedAt: "2018-01-01", available: true },
    { title: "Farmacología para enfermería", author: "Michael Adams", pages: 960, publishedAt: "2017-01-01", available: true },
  ],
  "Licenciatura en Instrumentación Quirúrgica": [
    { title: "Técnicas de quirófano", author: "Joanna Kotcher Fuller", pages: 1040, publishedAt: "2017-01-01", available: true },
    { title: "Alexander. Técnica quirúrgica", author: "Jane C. Rothrock", pages: 1216, publishedAt: "2019-01-01", available: false },
  ],
  "Licenciatura en Kinesiología y Fisiatría": [
    { title: "Kendall. Músculos: pruebas y funciones", author: "Florence Kendall", pages: 528, publishedAt: "2005-01-01", available: true },
    { title: "Biomecánica del aparato locomotor", author: "Margareta Nordin", pages: 480, publishedAt: "2012-01-01", available: true },
  ],
  "Licenciatura en Nutrición": [
    { title: "Krause. Dietoterapia", author: "L. Kathleen Mahan", pages: 1224, publishedAt: "2017-01-01", available: true },
    { title: "Nutrición clínica", author: "Adriana G. Chamorro", pages: 640, publishedAt: "2015-01-01", available: true },
  ],
  "Licenciatura en Producción de Bioimágenes": [
    { title: "Merrill. Atlas de posiciones radiográficas", author: "Bruce W. Long", pages: 560, publishedAt: "2016-01-01", available: true },
    { title: "Radiología esencial", author: "Ralph Weissleder", pages: 1264, publishedAt: "2011-01-01", available: false },
  ],
  "Tecnicatura Universitaria en Asistencia Dental": [
    { title: "Torres y Ehrlich. Asistencia dental", author: "Doni L. Bird", pages: 1184, publishedAt: "2018-01-01", available: true },
    { title: "Control de la infección", author: "Chris H. Miller", pages: 384, publishedAt: "2016-01-01", available: true },
  ],
  "Tecnicatura Universitaria en Prótesis Dental": [
    { title: "Prótesis parcial removible", author: "Alan B. Carr", pages: 400, publishedAt: "2016-01-01", available: true },
    { title: "Materiales dentales", author: "Kenneth J. Anusavice", pages: 592, publishedAt: "2013-01-01", available: true },
  ],
  "Profesorado Universitario en Educación Física y Deportes": [
    { title: "Didáctica de la educación física", author: "Omar Ruiz", pages: 240, publishedAt: "2010-01-01", available: true },
    { title: "El cuerpo y la educación física", author: "David Kirk", pages: 256, publishedAt: "2010-01-01", available: false },
  ],
  "Licenciatura en Actividad Física y Deportes": [
    { title: "Fisiología del ejercicio", author: "W. Larry Kenney", pages: 648, publishedAt: "2015-01-01", available: true },
    { title: "Entrenamiento deportivo", author: "Jürgen Weineck", pages: 736, publishedAt: "2005-01-01", available: true },
  ],
  "Licenciatura en Psicología": [
    { title: "Introducción al psicoanálisis", author: "Sigmund Freud", pages: 480, publishedAt: "1917-01-01", available: true },
    { title: "Psicología cognitiva", author: "Robert J. Sternberg", pages: 640, publishedAt: "2011-01-01", available: true },
  ],
  "Licenciatura en Musicoterapia": [
    { title: "Musicoterapia: métodos y prácticas", author: "Mercedes Pavlicevic", pages: 288, publishedAt: "2005-01-01", available: true },
    { title: "La musicoterapia", author: "Rolando Benenzon", pages: 240, publishedAt: "1981-01-01", available: false },
  ],
  "Licenciatura en Terapia Ocupacional": [
    { title: "Willard y Spackman. Terapia ocupacional", author: "Barbara A. Boyt Schell", pages: 1248, publishedAt: "2019-01-01", available: true },
    { title: "Ocupación y salud", author: "Ann Wilcock", pages: 320, publishedAt: "2006-01-01", available: true },
  ],
  "Tecnicatura Universitaria en Acompañamiento Terapéutico": [
    { title: "Clínica del acompañamiento terapéutico", author: "Gabriel Pulice", pages: 220, publishedAt: "2011-01-01", available: true },
    { title: "Acompañar en la clínica", author: "Leonel Dozza", pages: 180, publishedAt: "2014-01-01", available: true },
  ],
  "Ingeniería en Sistemas Informáticos": [
    { title: "El lenguaje unificado de modelado", author: "Grady Booch", pages: 512, publishedAt: "2006-01-01", available: true },
    { title: "Sistemas de bases de datos", author: "Ramez Elmasri", pages: 1200, publishedAt: "2016-01-01", available: false },
  ],
  "Analista Programador": [
    { title: "Código limpio", author: "Robert C. Martin", pages: 464, publishedAt: "2008-01-01", available: true },
    { title: "Algoritmos", author: "Robert Sedgewick", pages: 976, publishedAt: "2011-01-01", available: true },
  ],
  "Licenciatura en Gestión de Tecnología Informática": [
    { title: "La empresa digital", author: "George Westerman", pages: 256, publishedAt: "2014-01-01", available: true },
    { title: "Gobierno de TI", author: "Peter Weill", pages: 304, publishedAt: "2004-01-01", available: true },
  ],
  "Licenciatura en Matemática": [
    { title: "Álgebra lineal", author: "David C. Lay", pages: 576, publishedAt: "2016-01-01", available: true },
    { title: "Cómo plantear y resolver problemas", author: "George Pólya", pages: 240, publishedAt: "1945-01-01", available: true },
  ],
  "Licenciatura en Producción de Simuladores y Videojuegos": [
    { title: "Level Up! Guía de diseño de videojuegos", author: "Scott Rogers", pages: 552, publishedAt: "2014-01-01", available: true },
    { title: "Rules of Play", author: "Katie Salen y Eric Zimmerman", pages: 688, publishedAt: "2003-01-01", available: false },
  ],
  "Licenciatura en Turismo": [
    { title: "Turismo y recreación", author: "Roberto C. Boullón", pages: 192, publishedAt: "1990-01-01", available: true },
    { title: "Geografía del turismo", author: "Álvaro López López", pages: 280, publishedAt: "2011-01-01", available: true },
  ],
  "Licenciatura en Hotelería": [
    { title: "Administración de hoteles", author: "Denney G. Rutherford", pages: 480, publishedAt: "2002-01-01", available: true },
    { title: "Gestión de alimentos y bebidas", author: "John Cousins", pages: 416, publishedAt: "2014-01-01", available: false },
  ],
  "Licenciatura en Gastronomía": [
    { title: "El sabor de la técnica", author: "Harold McGee", pages: 640, publishedAt: "2004-01-01", available: true },
    { title: "Larousse gastronómico", author: "Librairie Larousse", pages: 1200, publishedAt: "2009-01-01", available: true },
  ],
  "Guía Universitario en Turismo": [
    { title: "Interpretación del patrimonio", author: "Jorge Morales Miranda", pages: 180, publishedAt: "2001-01-01", available: true },
    { title: "Guía de turismo cultural", author: "Josep Ballart", pages: 240, publishedAt: "2001-01-01", available: true },
  ],
  "Tecnicatura Universitaria en Gestión de Servicios Turísticos y Hoteleros": [
    { title: "Calidad en el servicio", author: "Karl Albrecht", pages: 256, publishedAt: "1988-01-01", available: true },
    { title: "Operación hotelera", author: "Gary K. Vallen", pages: 512, publishedAt: "2013-01-01", available: true },
  ],
  "Tecnicatura Universitaria en Gestión y Organización de Eventos": [
    { title: "Planificación de eventos", author: "Judy Allen", pages: 320, publishedAt: "2009-01-01", available: true },
    { title: "Eventos especiales", author: "Joe Goldblatt", pages: 448, publishedAt: "2014-01-01", available: false },
  ],
};
