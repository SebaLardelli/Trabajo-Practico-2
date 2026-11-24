import { CAREERS } from "../data/uai";
import type { SocialProvider } from "./auth-client";

const CAREER_KEY = "biblioteca.signupCareer";

export function rememberSignupCareer(career: string): void {
  sessionStorage.setItem(CAREER_KEY, career);
}

export function rememberedSignupCareer(): string {
  const saved = sessionStorage.getItem(CAREER_KEY) ?? "";
  return CAREERS.some((item) => item.name === saved) ? saved : "";
}

export type SocialReturn = "cancel" | "no-account" | "retry" | "link" | "other";

export function classifySocialReturn(error: string | null): SocialReturn | null {
  if (!error) return null;
  const text = error.toLowerCase();
  if (text.includes("account_not_linked") || text.includes("account not linked")) return "link";
  if (text.includes("access_denied") || text.includes("cancel")) return "cancel";
  if (text.includes("state_mismatch") || text.includes("state_security_mismatch") || text.includes("state_not_found")) {
    return "retry";
  }
  if (
    text.includes("signup") ||
    text.includes("sign up") ||
    text.includes("sign_up") ||
    text.includes("carrera") ||
    text.includes("missing_field") ||
    text.includes("is required") ||
    text.includes("unable_to_create") ||
    text.includes("user_not_found")
  ) {
    return "no-account";
  }
  return "retry";
}

export function providerLabel(provider: SocialProvider | null): string {
  if (provider === "google") return "Google";
  if (provider === "github") return "GitHub";
  return "GitHub o Google";
}

export function signupNotice(kind: SocialReturn | null, provider: SocialProvider | null, fromLogin: boolean): string | null {
  const name = providerLabel(provider);
  if (fromLogin || kind === "no-account") {
    return `No hay una cuenta de ${name}. Elegí la carrera y registrate con ${name}.`;
  }
  if (kind === "cancel") {
    return `Cancelaste ${name}. Para crear la cuenta, elegí la carrera y tocá el botón de nuevo.`;
  }
  if (kind === "retry") {
    return `El registro con ${name} no terminó. Elegí la carrera y tocá el botón de nuevo.`;
  }
  return null;
}
