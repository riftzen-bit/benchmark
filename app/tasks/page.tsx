import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { listPublicTasks } from "@/lib/db/queries/tasks";
import { getUser } from "@/lib/auth/session";

export const metadata = { title: "Tasks" };
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasks, user] = await Promise.all([listPublicTasks({ limit: 200 }), getUser()]);
  return (
    <Container width="wide" className="py-12">
      <header className="mb-8 flex items-baseline justify-between">
        <Eyebrow>Community tasks</Eyebrow>
        {user && (
          <Link
            href="/tasks/new"
            className="mono border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--paper)]"
          >
            New task
          </Link>
        )}
      </header>
      {tasks.length === 0 ? (
        <p className="text-sm text-[var(--mute)]">No tasks yet. Be the first.</p>
      ) : (
        <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
          {tasks.map((t) => (
            <li key={t.id} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-3">
              <Link href={`/tasks/${t.slug}`} className="hover:text-[var(--accent)]">
                <div className="font-medium">{t.title}</div>
                <div className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
                  {t.slug}
                </div>
              </Link>
              <span className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
                {t.category}
              </span>
              <time
                className="mono text-xs text-[var(--mute)]"
                dateTime={t.created_at}
              >
                {new Date(t.created_at).toISOString().slice(0, 10)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
