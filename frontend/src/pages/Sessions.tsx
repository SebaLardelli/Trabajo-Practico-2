import { useEffect, useState } from "react";
import { AdminNav } from "../components/AdminNav";
import { authClient } from "../lib/auth-client";

interface ListedUser {
  id: string;
  name: string;
  email: string;
}

interface ListedSession {
  id: string;
  token: string;
  expiresAt: string | Date;
  createdAt: string | Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function when(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

export const Sessions = () => {
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [userId, setUserId] = useState("");
  const [sessions, setSessions] = useState<ListedSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  useEffect(() => {
    void authClient.admin.listUsers({ query: { limit: 50 } }).then(({ data, error: listError }) => {
      if (listError) {
        setError(listError.message ?? "No se pudieron listar los usuarios");
        return;
      }
      const listed = (data?.users ?? []).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email ?? "",
      }));
      setUsers(listed);
      setUserId((current) => current || listed[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      setSessions([]);
      return;
    }
    void authClient.admin.listUserSessions({ userId }).then(({ data, error: listError }) => {
      if (listError) {
        setError(listError.message ?? "No se pudieron listar las sesiones");
        setSessions([]);
        return;
      }
      setSessions((data?.sessions ?? []) as ListedSession[]);
    });
  }, [userId]);

  const revoke = async (token: string) => {
    setPendingToken(token);
    setError(null);
    const { error: revokeError } = await authClient.admin.revokeUserSession({ sessionToken: token });
    setPendingToken(null);
    if (revokeError) {
      setError(revokeError.message ?? "No se pudo cerrar la sesión");
      return;
    }
    setSessions((current) => current.filter((session) => session.token !== token));
  };

  return (
    <section>
      <AdminNav />
      <h1 className="text-3xl font-semibold tracking-tight">Sesiones</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        Cada ingreso deja una sesión en Mongo. Cerrarla saca a esa persona del sitio hasta que vuelva a entrar.
      </p>
      {error && <p className="mb-4 alert">{error}</p>}
      <label className="mb-4 block max-w-md text-sm">
        <span className="mb-1 block text-muted">Lector</span>
        <select className="field" value={userId} onChange={(event) => setUserId(event.target.value)}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} · {user.email}
            </option>
          ))}
        </select>
      </label>
      {userId && sessions.length === 0 && <p className="text-sm text-muted">No hay sesiones abiertas.</p>}
      <ul className="flex flex-col gap-3">
        {sessions.map((session) => (
          <li key={session.id} className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">Abierta {when(session.createdAt)}</p>
              <p className="text-sm text-ink/60">
                Vence {when(session.expiresAt)}
                {session.ipAddress ? ` · ${session.ipAddress}` : ""}
              </p>
              {session.userAgent && <p className="mt-1 max-w-xl truncate text-xs text-muted">{session.userAgent}</p>}
            </div>
            <button
              type="button"
              className="btn-ghost text-sm"
              disabled={pendingToken === session.token}
              onClick={() => void revoke(session.token)}
            >
              Cerrar sesión
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
