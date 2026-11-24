import { useEffect, useState } from "react";
import { authClient, useSession } from "../lib/auth-client";

const FIXED_ADMIN_EMAIL = "admin@biblioteca.test";

interface ListedUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  career?: string | null;
}

export const Users = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<ListedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error: listError } = await authClient.admin.listUsers({ query: { limit: 100 } });
    if (listError) {
      setError(listError.message ?? "No se pudieron listar los usuarios");
      return;
    }
    setUsers(
      (data?.users ?? []).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email ?? "",
        role: user.role,
        career: "career" in user && typeof user.career === "string" ? user.career : null,
      })),
    );
  };

  useEffect(() => {
    void load();
  }, []);

  const changeRole = async (user: ListedUser) => {
    const role = user.role === "admin" ? "user" : "admin";
    setPendingId(user.id);
    setError(null);
    const { error: roleError } = await authClient.admin.setRole({ userId: user.id, role });
    setPendingId(null);
    if (roleError) {
      setError(roleError.message ?? "No se pudo cambiar el rol");
      return;
    }
    await load();
  };

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Lectores</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        El administrador de la biblioteca es una cuenta fija. El resto se registra como alumno y elige su carrera.
      </p>
      {error && <p className="mb-4 alert">{error}</p>}
      <ul className="flex flex-col gap-3">
        {users.map((user) => {
          const isSelf = user.id === session?.user.id;
          const isFixed = user.email === FIXED_ADMIN_EMAIL;
          return (
            <li key={user.id} className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-ink/60">
                  {user.email} · {user.career ?? "Sin carrera"} · {isFixed ? "admin fijo" : (user.role ?? "user")}
                </p>
              </div>
              <button type="button" className="btn-ghost text-sm" disabled={isSelf || isFixed || pendingId === user.id} onClick={() => void changeRole(user)}>
                {isFixed ? "Cuenta fija" : isSelf ? "Tu cuenta" : user.role === "admin" ? "Pasar a user" : "Pasar a admin"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
