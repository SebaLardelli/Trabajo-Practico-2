import { useEffect, useState } from "react";
import { formatDay } from "../lib/days";
import { speakNotice } from "../lib/notice-copy";
import { demoNotices, markDemoNoticesRead } from "../lib/demo-loans";
import { getErrorMessage } from "../lib/api";
import { listNotices, markNoticesRead } from "../services/loans";
import type { NoticeItem } from "../types/loan";

export const Notices = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const local = demoNotices().map((item) => ({ ...item }));
    try {
      const remote = await listNotices();
      setNotices([...remote, ...local]);
      setError(null);
    } catch {
      setNotices(local);
      if (local.length === 0) setError("No se pudieron leer los avisos del servidor.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markAll = async () => {
    markDemoNoticesRead();
    try {
      await markNoticesRead();
    } catch (err) {
      setError(getErrorMessage(err));
    }
    await load();
  };

  return (
    <section className="max-w-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Avisos</h1>
          <p className="mt-2 text-sm text-muted">Te escribimos en corto: qué pasó y qué podés hacer.</p>
        </div>
        {notices.some((item) => !item.read) && (
          <button type="button" className="btn-ghost text-sm" onClick={() => void markAll()}>
            Marcar leídos
          </button>
        )}
      </div>
      {error && <p className="alert mt-4">{error}</p>}
      <ul className="mt-6 flex flex-col gap-3">
        {notices.map((notice) => {
          const spoken = speakNotice(notice.kind, `${notice.title} ${notice.body}`);
          return (
            <li key={notice._id} className={`panel px-4 py-3 ${notice.read ? "opacity-70" : ""}`}>
              <p className="text-xs text-muted">
                {formatDay(notice.createdAt.slice(0, 10))} · {spoken.label}
              </p>
              <p className="mt-1 text-sm text-ink">{spoken.text}</p>
            </li>
          );
        })}
        {notices.length === 0 && <li className="text-muted">No tenés avisos.</li>}
      </ul>
    </section>
  );
};
