# Biblioteca UAI

Catálogo de la Biblioteca Central de la Universidad Abierta Interamericana. El backend expone un CRUD en `/api/books` y Better Auth guarda usuarios y sesiones en MongoDB. El frontend es un sitio estático de React que habla con la API por `/api` (proxy de Vite en local, rewrite de Render en producción).

La entidad es **libro**, con título (texto), autor (texto), páginas (número), fecha de publicación (fecha) y disponible (booleano).

## URLs

| Servicio | URL |
|---|---|
| Frontend (Render Static Site) | https://trabajo-practico-2-1.onrender.com |
| Backend (Render Web Service) | https://trabajo-practico-2.onrender.com |

## Cómo correrlo en local

Hacen falta Node 22, una base en MongoDB Atlas, una OAuth App de GitHub y un cliente OAuth de Google para el login social.

```bash
cd backend
cp .env.example .env
# completar MONGODB_URI, BETTER_AUTH_SECRET, GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET
npm install
npm run dev
```

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Entrar siempre por http://localhost:5173. El frontend no tiene `.env`: llama a `/api` y Vite lo reenvía a `http://localhost:3000`.

Al arrancar, el backend deja fija la cuenta de administrador. El catálogo de ejemplo se carga aparte:

```bash
cd backend
npm run seed
```

El secret se genera con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Variables de entorno (`backend/.env`)

| Variable | Para qué |
|---|---|
| `PORT` | Puerto local. En Render no se setea: la plataforma lo inyecta. |
| `NODE_ENV` | `development` en local, `production` en Render. |
| `MONGODB_URI` | URI de Atlas, con usuario, contraseña y nombre de base. No se commitea. |
| `BETTER_AUTH_SECRET` | Firma las cookies de sesión. Uno distinto por entorno, mínimo 32 caracteres. |
| `BETTER_AUTH_URL` | URL pública del **frontend**. Local: `http://localhost:5173`. |
| `GITHUB_CLIENT_ID` | Client ID de la OAuth App de GitHub. |
| `GITHUB_CLIENT_SECRET` | Client secret de la OAuth App de GitHub. |
| `GOOGLE_CLIENT_ID` | Client ID del cliente OAuth de Google. Si falta, el servidor arranca y Google queda desactivado. |
| `GOOGLE_CLIENT_SECRET` | Client secret del cliente OAuth de Google. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Correo de los avisos. Si quedan vacías, el aviso igual se guarda en la app. |

Callback de GitHub: `{BETTER_AUTH_URL}/api/auth/callback/github`. Hacen falta dos OAuth Apps, una para local y otra para producción, porque GitHub acepta una sola callback por app.

Callback de Google: `{BETTER_AUTH_URL}/api/auth/callback/google`. Un solo cliente de Google alcanza para local y producción: acepta varias redirect URI.

## Endpoints

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/books` | público |
| GET | `/api/books/:id` | público |
| POST | `/api/books` | admin |
| PUT | `/api/books/:id` | admin |
| PATCH | `/api/books/:id` | admin |
| DELETE | `/api/books/:id` | admin |
| PATCH | `/api/books/:id/loan` | sesión, con las reglas de préstamo |
| GET | `/api/loans` | admin |
| GET | `/api/loans/mine` | sesión |
| POST | `/api/loans` | sesión. El admin puede asignarlo a otro lector |
| PATCH | `/api/loans/:id` | admin (fechas) |
| POST | `/api/loans/:id/return` | dueño del préstamo o admin |
| GET | `/api/notices` | sesión |
| POST | `/api/auth/sign-up/email` | público |
| POST | `/api/auth/sign-in/email` | público |
| POST | `/api/auth/sign-in/social` | público |
| GET | `/api/auth/callback/github` | público (OAuth) |
| GET | `/api/auth/callback/google` | público (OAuth) |
| GET | `/api/auth/get-session` | público |
| POST | `/api/auth/sign-out` | sesión |
| POST | `/api/auth/admin/set-role` | admin |
| POST | `/api/auth/admin/list-user-sessions` | admin |
| POST | `/api/auth/admin/revoke-user-session` | admin |

`GET /api/books` acepta `search`, `available` (`true` o `false`), `faculty`, `career`, `page` y `limit`.

Crear, editar y eliminar un libro es solo del admin. El alumno solo puede alquilar. Crear responde 201. Sin sesión, 401. Sin permiso, 403. Si el libro no existe, 404. Si Zod rechaza el body, 400.

Un alumno puede retirar hasta 3 libros, de cualquier carrera. Si tiene uno vencido, no puede pedir otro hasta devolverlo. Esos movimientos quedan en `/api/loans` y los avisos en `/api/notices`.

## Quién entra

El administrador está fijo. No se registra y no se le puede sacar el rol. Al iniciar sesión entra al panel (`/admin`) y solo ve ese panel: libros, préstamos, lectores y sesiones. No usa el catálogo ni alquila.

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@biblioteca.test | Admin1234! |
| alumno | alumno@biblioteca.test | Alumno1234! |

El alumno de ejemplo ya está creado: es de Ingeniería en Sistemas Informáticos. Puede alquilar cualquier libro y no puede registrar títulos. Cualquier otro alumno se registra en **Registrarse**:

1. Elige su carrera. Sin eso no se crea la cuenta, tampoco con GitHub o Google.
2. Entra con el email y la contraseña que eligió, o con el mismo GitHub o Google.
3. Abre un libro y lo alquila. No puede dar de alta un título: eso lo hace el administrador.
4. En **Alquilados** ve el listado de los libros que pidió, con la fecha en que los retiró y la fecha límite. También le aparece un resumen arriba del catálogo. En **Avisos** ve el retiro, la devolución y si un libro está vencido.

## Deploy en Render

1. En Atlas, Network Access → Add IP Address → `0.0.0.0/0`. Las IPs de Render cambian, no se pueden listar.
2. Backend, New → Web Service. Root Directory `backend`. Build: `npm install --include=dev && npm run build`. Start: `npm start`. Variables: `NODE_ENV=production`, `NODE_VERSION=22`, `MONGODB_URI`, un `BETTER_AUTH_SECRET` nuevo, `BETTER_AUTH_URL` con la URL del frontend, los GitHub de la OAuth App de producción, y `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
3. Frontend, New → Static Site. Root Directory `frontend`. Build: `npm install && npm run build`. Publish Directory `dist`. `NODE_VERSION=22`.
4. Rewrites del Static Site, en este orden:

| Source | Destination | Action |
|---|---|---|
| `/api/*` | `https://trabajo-practico-2.onrender.com/api/*` | Rewrite |
| `/*` | `/index.html` | Rewrite |

5. Verificar `https://trabajo-practico-2.onrender.com/api/auth/ok` → `{ "ok": true }`.
6. Probar el login con GitHub desde la URL del frontend, no desde la del backend.

En el plan gratuito de Render el backend se apaga si pasa un rato sin visitas. La primera vez que alguien entra después puede tardar cerca de un minuto en cargar.
