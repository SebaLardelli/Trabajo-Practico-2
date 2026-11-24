import "dotenv/config";
import express, { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import booksRouter from "./routes/books.routes.js";
import loansRouter from "./routes/loans.routes.js";
import noticesRouter from "./routes/notices.routes.js";
import { connectMongoDB } from "./config/db.js";
import { ensureFixedAdmin } from "./lib/fixed-admin.js";

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
type Environment = "development" | "test" | "production";
const NODE_ENV: Environment = (process.env.NODE_ENV as Environment) ?? "development";

// Sin cors ni cookie-parser: el front llama a /api en su mismo origen
// (proxy de Vite en local, rewrite del Static Site en Render).

// Better Auth ANTES de express.json(): el handler lee el body crudo del request.
// "*splat" es el comodin de Express 5.
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

app.use("/api/books", booksRouter);
app.use("/api/loans", loansRouter);
app.use("/api/notices", noticesRouter);

if (NODE_ENV === "development") {
  app.get("/", (_req: Request, res: Response) => {
    res.send("Biblioteca API");
  });
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

async function startServer(): Promise<void> {
  await connectMongoDB();
  await ensureFixedAdmin();

  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("[server] failed to start:", error);
  process.exit(1);
});
