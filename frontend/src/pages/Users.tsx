import { useEffect, useState } from "react";
import { authClient, useSession } from "../lib/auth-client";

interface ListedUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
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
      <h1 className="font-serif text-4xl">Usuarios</h1>
      <p className="mt-2 mb-6 text-sm text-ink/60">Un admin puede pasar una cuenta de user a admin, o al revés.</p>
      {error && <p className="mb-4 alert">{error}</p>}
      <ul className="flex flex-col gap-3">
        {users.map((user) => {
          const isSelf = user.id === session?.user.id;
          return (
            <li key={user.id} className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-ink/60">
                  {user.email} · {user.role ?? "user"}
                </p>
              </div>
              <button type="button" className="btn-ghost text-sm" disabled={isSelf || pendingId === user.id} onClick={() => void changeRole(user)}>
                {isSelf ? "Tu cuenta" : user.role === "admin" ? "Pasar a user" : "Pasar a admin"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
