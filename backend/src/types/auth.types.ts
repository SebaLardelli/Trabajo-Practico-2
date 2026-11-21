import type { auth } from "../lib/auth.js";

type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];
export type UserRole = "admin" | "user";

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}
