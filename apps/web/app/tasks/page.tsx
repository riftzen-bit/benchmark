import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { listPublicTasks } from "@/lib/db/queries/tasks";
import { listCategories } from "@/lib/db/queries/models";
import { getUser } from "@/lib/auth/session";
import { TASK_TEMPLATES } from "@/lib/data/task-templates";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tasks" };
export const dynamic = "force-dynamic";

type Search = Promise<{ category?: string }>;

export default async function TasksPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const activeCategory = sp.category?.trim() || undefined;

  const [allTasks, user, categories] = await Promise.all([
    listPublicTasks({ limit: 200 }),
    getUser(),
    listCategories().catch(() => []),
  ]);

  const tasks = activeCategory
    ? allTasks.filter((t) => t.category === activeCategory)
    : allTasks;

  const categoryCount = new Set(allTasks.map((t) => t.category)).size;

  return (
    <Container width="wide" className="py-12">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <Eyebrow>Community tasks</Eyebrow>
          <h1 className="display mt-3 text-3xl tracking-tight md:text-4xl">
            Prompts anyone can run.
          </h1>
        </div>
        {user && (
          <Link
            href="/tasks/new"
            className="mono border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--paper)]"
          >
            New task
          </Link>
        )}
      </header>

      <section className="mb-6 grid grid-cols-3 gap-px border border-[var(--rule)] bg-[var(--rule)]">
        <Stat label="Tasks" value={allTasks.length} />
        <Stat label="Categories" value={categoryCount} />
        <Stat label="Showing" value={tasks.length} hint={activeCategory ?? "all"} />
      </section>

      {categories.length > 0 && (
        <nav aria-label="Filter by category" className="mb-6 flex flex-wrap gap-1">
          <CategoryChip href="/tasks" label="all" active={!activeCategory} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              href={`/tasks?category=${encodeURIComponent(c.id)}`}
              label={c.label}
              active={activeCategory === c.id}
            />
          ))}
        </nav>
      )}

      {tasks.length === 0 ? (
        <EmptyState user={!!user} />
      ) : (
        <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-3"
            >
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

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="bg-[var(--background)] p-4">
      <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">{label}</p>
      <p className="figure mt-2 text-3xl tabular-nums">{value}</p>
      {hint && (
        <p className="mono mt-0.5 text-[10px] uppercase tracking-widest text-[var(--mute)]">
          {hint}
        </p>
      )}
    </div>
  );
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "mono border px-2 py-1 text-[11px] uppercase tracking-widest transition-colors",
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
          : "border-[var(--rule)] text-[var(--mute)] hover:text-[var(--foreground)]",
      )}
    >
      {label}
    </Link>
  );
}

function EmptyState({ user }: { user: boolean }) {
  return (
    <div className="grid gap-6">
      <p className="text-sm text-[var(--mute)]">
        No tasks yet. Start with one of these templates, or write your own.
      </p>
      <Rule weight="hair" />
      <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
        {TASK_TEMPLATES.map((t) => (
          <li
            key={t.slug}
            className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-3 text-[var(--mute)]"
          >
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="mono text-xs uppercase tracking-widest">{t.slug}</div>
            </div>
            <span className="mono text-xs uppercase tracking-widest">{t.category}</span>
            {user ? (
              <Link
                href={`/tasks/new?template=${t.slug}`}
                className="mono text-xs uppercase tracking-widest underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
              >
                Use as template →
              </Link>
            ) : (
              <Link
                href={`/sign-in?next=/tasks/new?template=${t.slug}`}
                className="mono text-xs uppercase tracking-widest underline decoration-[var(--rule)] underline-offset-4"
              >
                Sign in →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
