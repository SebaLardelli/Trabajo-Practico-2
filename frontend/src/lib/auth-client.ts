import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Sin baseURL: el front y la API comparten origen.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  career?: string | null;
  faculty?: string | null;
}

interface SessionState {
  data: { user: SessionUser } | null;
  isPending: boolean;
  error: { message?: string } | null;
}

interface AuthResult {
  data?: { url?: string; redirect?: boolean } | null;
  error: { message?: string; code?: string } | null;
}

// Better Auth 1.7 infiere la sesion como `never` cuando getSession exige argumentos.
// En runtime useSession() no recibe nada: la cookie viaja sola.
export function useSession(): SessionState {
  return authClient.useSession() as unknown as SessionState;
}

export async function fetchSession(): Promise<SessionState["data"]> {
  const getSession = authClient.getSession as unknown as () => Promise<{ data: SessionState["data"] }>;
  const result = await getSession();
  return result.data;
}

export type SocialProvider = "github" | "google";

export const signIn = {
  email: (body: { email: string; password: string }) => authClient.signIn.email(body) as Promise<AuthResult>,
  social: (body: {
    provider: SocialProvider;
    callbackURL?: string;
    errorCallbackURL?: string;
    additionalData?: { career: string; faculty: string };
    requestSignUp?: boolean;
  }) => authClient.signIn.social(body) as Promise<AuthResult>,
};

export const signUp = {
  email: (body: { name: string; email: string; password: string; career: string; faculty: string }) =>
    authClient.signUp.email(body) as Promise<AuthResult>,
};

export function requestPasswordReset(body: { email: string; redirectTo: string }): Promise<AuthResult> {
  const call = authClient.requestPasswordReset as unknown as (body: { email: string; redirectTo: string }) => Promise<AuthResult>;
  return call(body);
}

export function resetPassword(body: { newPassword: string; token: string }): Promise<AuthResult> {
  const call = authClient.resetPassword as unknown as (body: { newPassword: string; token: string }) => Promise<AuthResult>;
  return call(body);
}

export function signOut(): Promise<AuthResult> {
  const signOutWithBody = authClient.signOut as unknown as (body: Record<string, never>) => Promise<AuthResult>;
  return signOutWithBody({});
}
