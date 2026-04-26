import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { getUser } from "@/lib/auth/session";
import { listCategories } from "@/lib/db/queries/models";
import { listPublicTasks } from "@/lib/db/queries/tasks";
import { TASK_TEMPLATES } from "@/lib/data/task-templates";
import { NewTaskForm } from "./new-task-form";

export const metadata = { title: "New task" };

type Search = Promise<{
  slug?: string;
  title?: string;
  category?: string;
  template?: string;
}>;

export default async function NewTaskPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const user = await getUser();
  if (!user) {
    const qs = new URLSearchParams(sp as Record<string, string>).toString();
    const next = `/tasks/new${qs ? `?${qs}` : ""}`;
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  }
  const [categories, recent] = await Promise.all([
    listCategories(),
    listPublicTasks({ limit: 3 }).catch(() => []),
  ]);

  const tpl = sp.template
    ? TASK_TEMPLATES.find((t) => t.slug === sp.template)
    : undefined;

  const defaults = {
    slug: sp.slug ?? tpl?.slug,
    title: sp.title ?? tpl?.title,
    category: sp.category ?? tpl?.category,
    body: tpl?.body,
    rubric: tpl?.rubric,
  };

  return (
    <Container width="wide" className="py-12">
      <header className="mb-8">
        <Eyebrow>New benchmark task</Eyebrow>
        <h1 className="display mt-3 text-3xl tracking-tight md:text-4xl">
          Post a prompt the community can run.
        </h1>
      </header>

      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <NewTaskForm categories={categories} defaults={defaults} />

        <aside className="grid gap-6">
          <Card title="Slug rules">
            <ul className="mono grid gap-1 text-[11px] uppercase tracking-widest text-[var(--mute)]">
              <li>lowercase letters, digits, dashes</li>
              <li>3 to 64 characters</li>
              <li>cannot start or end with a dash</li>
              <li>must be unique site-wide</li>
            </ul>
          </Card>

          <Card title="Rubric tips">
            <ul className="grid gap-1 text-sm text-[var(--mute)]">
              <li>Name what counts as evidence (URL, screenshot, log).</li>
              <li>List 3 to 5 yes/no checks instead of a paragraph.</li>
              <li>Be explicit about partial credit.</li>
            </ul>
          </Card>

          <Card title="Templates">
            <ul className="grid gap-2">
              {TASK_TEMPLATES.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/tasks/new?template=${t.slug}`}
                    className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {recent.length > 0 && (
            <Card title="Recently posted">
              <ul className="grid gap-2">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/tasks/${r.slug}`}
                      className="mono text-xs uppercase tracking-widest text-[var(--mute)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </Container>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--rule)] p-5">
      <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
