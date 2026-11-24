// Better Auth guarda usuarios, sesiones y cuentas de GitHub y Google en Mongo
// (colecciones user, session, account y verification).
import { betterAuth } from "better-auth";
import { APIError, getOAuthState } from "better-auth/api";
import { admin } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { findCareer } from "../data/uai.js";
import { sendPasswordResetEmail } from "./mail.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable. Check your .env file (see .env.example).`);
  }
  return value;
}

// El cliente conecta solo en la primera consulta. Pasarlo como `client` habilita transacciones (Atlas = replica set).
const client = new MongoClient(requireEnv("MONGODB_URI"));

export const auth = betterAuth({
  // URL publica que ve el navegador: la del FRONT, porque /api llega al back a traves del proxy.
  // El secret se lee solo de BETTER_AUTH_SECRET.
  baseURL: requireEnv("BETTER_AUTH_URL"),
  database: mongodbAdapter(client.db(), { client }),
  user: {
    additionalFields: {
      career: { type: "string", required: true, input: true },
      faculty: { type: "string", required: true, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const state = await getOAuthState();
          const fromState = state && typeof state === "object" && "career" in state ? state.career : undefined;
          const raw = typeof user.career === "string" && user.career.trim() ? user.career : fromState;
          const career = typeof raw === "string" ? findCareer(raw) : undefined;
          if (!career) {
            throw new APIError("BAD_REQUEST", { message: "Elegí una carrera de la UAI" });
          }
          return { data: { ...user, career: career.name, faculty: career.faculty } };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // El enlace del correo vence a la hora. Al cambiar la clave caen las sesiones abiertas.
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      // GitHub y Google no tienen contraseña propia: el recupero queda en esos servicios.
      const credential = await client.db().collection("account").findOne({
        userId: user.id,
        providerId: "credential",
      });
      if (typeof credential?.password !== "string" || credential.password.length === 0) {
        console.info(`[biblioteca] ${user.email} no tiene contraseña. No se envía el correo.`);
        return;
      }
      await sendPasswordResetEmail({ to: user.email, name: user.name, url });
    },
  },
  socialProviders: {
    github: {
      clientId: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
      // La cuenta nueva solo se crea desde Registrarse, donde ya eligió carrera.
      disableImplicitSignUp: true,
    },
    // Google es opcional: sin estas dos variables el servidor arranca igual y solo queda GitHub.
    ...(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
            disableImplicitSignUp: true,
          },
        }
      : {}),
  },
  // Si alguien ya registrado con email+password entra con GitHub o Google (mismo email), une las cuentas.
  account: {
    accountLinking: { trustedProviders: ["github", "google"] },
  },
  // admin(): agrega user.role ("user" por defecto) y endpoints para listar usuarios y cambiar roles.
  plugins: [admin()],
});
