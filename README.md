# Biblioteca

Catálogo de libros. El backend expone un CRUD en `/api/books` y Better Auth guarda usuarios y sesiones en MongoDB. El frontend es un sitio estático de React que habla con la API por `/api` (proxy de Vite en local, rewrite de Render en producción).

La entidad es **libro**, con título (texto), autor (texto), páginas (número), fecha de publicación (fecha) y disponible (booleano).

## URLs

| Servicio | URL |
|---|---|
| Frontend (Render Static Site) | https://TU-FRONTEND.onrender.com |
| Backend (Render Web Service) | https://TU-BACKEND.onrender.com |

Reemplazar las dos URLs después de desplegar.

## Cómo correrlo en local

Hacen falta Node 22, una base en MongoDB Atlas y una OAuth App de GitHub para el login social.

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

Usuarios de prueba (después de tener la URI real):

```bash
cd backend
npm run seed
```

Eso crea las dos cuentas y, si la colección está vacía, dos libros de ejemplo. El secret se genera con:

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
| `GITHUB_CLIENT_ID` | Client ID de la OAuth App. |
| `GITHUB_CLIENT_SECRET` | Client secret de la OAuth App. |

Callback de GitHub: `{BETTER_AUTH_URL}/api/auth/callback/github`. Hacen falta dos OAuth Apps, una para local y otra para producción, porque GitHub acepta una sola callback por app.

## Endpoints

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/books` | público |
| GET | `/api/books/:id` | público |
| POST | `/api/books` | admin |
| PUT | `/api/books/:id` | admin |
| PATCH | `/api/books/:id` | admin |
| DELETE | `/api/books/:id` | admin |
| POST | `/api/auth/sign-up/email` | público |
| POST | `/api/auth/sign-in/email` | público |
| POST | `/api/auth/sign-in/social` | público |
| GET | `/api/auth/callback/github` | público (OAuth) |
| GET | `/api/auth/get-session` | público |
| POST | `/api/auth/sign-out` | sesión |
| POST | `/api/auth/admin/set-role` | admin |

`GET /api/books` acepta `search`, `available` (`true` o `false`), `page` y `limit`.

Un usuario recién registrado recibe el rol `user` y solo puede leer. Crear, editar y eliminar exige sesión de admin (`authMiddleware` + `requireRole("admin")`). Sin sesión las rutas de escritura responden 401; con sesión y sin rol, 403. Crear responde 201. Si el libro no existe, 404. Si Zod rechaza el body, 400.

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@biblioteca.test | Admin1234! |
| user | user@biblioteca.test | User1234! |

Si no se corre el seed, el primer admin se crea registrándose y editando en Atlas el documento de la colección `user`: `role` pasa de `"user"` a `"admin"`. Después hay que cerrar sesión y volver a entrar. Desde `/admin/usuarios` un admin puede cambiar el rol del resto.

## Deploy en Render

1. En Atlas, Network Access → `0.0.0.0/0`.
2. Backend, New → Web Service. Root Directory `backend`. Build: `npm install --include=dev && npm run build`. Start: `npm start`. Variables: `NODE_ENV=production`, `NODE_VERSION=22`, `MONGODB_URI`, un `BETTER_AUTH_SECRET` nuevo, `BETTER_AUTH_URL` con la URL del frontend, y los GitHub de la OAuth App de producción.
3. Frontend, New → Static Site. Root Directory `frontend`. Build: `npm install && npm run build`. Publish Directory `dist`. `NODE_VERSION=22`.
4. Rewrites del Static Site, en este orden:

| Source | Destination | Action |
|---|---|---|
| `/api/*` | `https://TU-BACKEND.onrender.com/api/*` | Rewrite |
| `/*` | `/index.html` | Rewrite |

5. Verificar `https://TU-BACKEND.onrender.com/api/auth/ok` → `{ "ok": true }`.
6. Probar el login con GitHub desde la URL del frontend, no desde la del backend.

El plan free duerme el backend a los 15 minutos. El primer request puede tardar cerca de un minuto.
