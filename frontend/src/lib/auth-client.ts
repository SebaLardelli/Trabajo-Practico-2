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
}

interface SessionState {
  data: { user: SessionUser } | null;
  isPending: boolean;
  error: { message?: string } | null;
}

interface AuthResult {
  error: { message?: string } | null;
}

// Better Auth 1.7 infiere la sesion como `never` cuando getSession exige argumentos.
// En runtime useSession() no recibe nada: la cookie viaja sola.
export function useSession(): SessionState {
  return authClient.useSession() as unknown as SessionState;
}

export const signIn = {
  email: (body: { email: string; password: string }) => authClient.signIn.email(body) as Promise<AuthResult>,
  social: (body: { provider: "github"; callbackURL?: string; errorCallbackURL?: string }) =>
    authClient.signIn.social(body) as Promise<AuthResult>,
};

export const signUp = {
  email: (body: { name: string; email: string; password: string }) => authClient.signUp.email(body) as Promise<AuthResult>,
};

export function signOut(): Promise<AuthResult> {
  const signOutWithBody = authClient.signOut as unknown as (body: Record<string, never>) => Promise<AuthResult>;
  return signOutWithBody({});
}
