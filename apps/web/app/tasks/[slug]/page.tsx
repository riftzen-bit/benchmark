import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { getTaskBySlug } from "@/lib/db/queries/tasks";
import { listRunsByTask } from "@/lib/db/queries/runs";
import { listVisibleModels } from "@/lib/db/queries/models";
import { getUser } from "@/lib/auth/session";
import { NewRunForm } from "./new-run-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = await getTaskBySlug(slug);
  return { title: task?.title ?? "Task" };
}

export default async function TaskDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = await getTaskBySlug(slug);
  if (!task) notFound();
  const [runs, models, user] = await Promise.all([
    listRunsByTask(task.id),
    listVisibleModels(),
    getUser(),
  ]);
  return (
    <Container width="wide" className="py-12">
      <header className="mb-6">
        <Eyebrow>{task.category}</Eyebrow>
        <h1 className="mt-2 text-3xl font-medium md:text-4xl">{task.title}</h1>
        <p className="mono mt-1 text-xs uppercase tracking-widest text-[var(--mute)]">
          {task.slug}
        </p>
      </header>

      <Rule weight="hair" className="my-6" />

      <section className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <article className="grid gap-6">
          <div>
            <Eyebrow className="mb-3">Prompt</Eyebrow>
            <pre className="mono whitespace-pre-wrap border border-[var(--rule)] bg-[var(--rule)]/20 p-4 text-xs leading-relaxed">
              {task.body_md}
            </pre>
          </div>
          {task.rubric_md && (
            <div>
              <Eyebrow className="mb-3">Rubric</Eyebrow>
              <pre className="mono whitespace-pre-wrap text-xs leading-relaxed text-[var(--mute)]">
                {task.rubric_md}
              </pre>
            </div>
          )}
        </article>

        <aside className="grid gap-6">
          <div>
            <Eyebrow className="mb-3">Submit a run</Eyebrow>
            {user ? (
              <NewRunForm slug={task.slug} taskId={task.id} models={models} />
            ) : (
              <p className="text-sm text-[var(--mute)]">
                <Link href={`/sign-in?next=/tasks/${task.slug}`} className="underline">
                  Sign in
                </Link>{" "}
                to submit a run.
              </p>
            )}
          </div>
        </aside>
      </section>

      <Rule weight="hair" className="my-10" />

      <section>
        <header className="mb-4 flex items-baseline justify-between">
          <Eyebrow>Runs ({runs.length})</Eyebrow>
        </header>
        {runs.length === 0 ? (
          <div className="grid gap-4 border border-[var(--rule)] p-5">
            <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
              How to submit
            </p>
            <ol className="grid gap-2 text-sm">
              <li>
                <span className="mono text-[var(--accent)]">01</span>{" "}
                Pick a model from the local registry on the right.
              </li>
              <li>
                <span className="mono text-[var(--accent)]">02</span>{" "}
                Run the prompt on{" "}
                <Link href="/test-yourself" className="underline">a public playground</Link>{" "}
                and paste the output URL or screenshot.
              </li>
              <li>
                <span className="mono text-[var(--accent)]">03</span>{" "}
                Score the run against the rubric and submit.
              </li>
            </ol>
          </div>
        ) : (
          <table className="tnum w-full border-y border-[var(--rule)] text-sm">
            <thead>
              <tr className="border-b border-[var(--rule)] text-left">
                <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
                  Model
                </th>
                <th className="mono py-2 pr-4 text-right text-xs uppercase tracking-widest text-[var(--mute)]">
                  Score
                </th>
                <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
                  Evidence
                </th>
                <th className="mono py-2 text-xs uppercase tracking-widest text-[var(--mute)]">
                  When
                </th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-b border-[var(--rule)]/60">
                  <td className="mono py-2 pr-4">{r.model_id}</td>
                  <td className="mono py-2 pr-4 text-right">
                    {r.score == null ? "—" : `${r.score}${r.unit}`}
                  </td>
                  <td className="py-2 pr-4">
                    {r.evidence_url ? (
                      <a
                        href={r.evidence_url}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="underline decoration-[var(--rule)] underline-offset-2"
                      >
                        {r.evidence_kind}
                      </a>
                    ) : (
                      <span className="text-[var(--mute)]">{r.evidence_kind}</span>
                    )}
                  </td>
                  <td className="mono py-2 text-xs text-[var(--mute)]">
                    <Link
                      href={`/tasks/${task.slug}/runs/${r.id}`}
                      className="hover:text-[var(--accent)]"
                    >
                      {new Date(r.created_at).toISOString().slice(0, 10)} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Container>
  );
}
