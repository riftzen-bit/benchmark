import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { getTaskBySlug } from "@/lib/db/queries/tasks";
import { getRun } from "@/lib/db/queries/runs";
import { getVoteTally, getOwnVote } from "@/lib/db/queries/votes";
import { listComments } from "@/lib/db/queries/comments";
import { getUser } from "@/lib/auth/session";
import { VoteButtons } from "./vote-buttons";
import { CommentForm } from "./comment-form";

export const dynamic = "force-dynamic";

export default async function RunDetail({
  params,
}: {
  params: Promise<{ slug: string; runId: string }>;
}) {
  const { slug, runId } = await params;
  const task = await getTaskBySlug(slug);
  if (!task) notFound();
  const run = await getRun(runId);
  if (!run || run.task_id !== task.id) notFound();
  const user = await getUser();
  const [tally, ownVote, comments] = await Promise.all([
    getVoteTally(run.id),
    user ? getOwnVote(user.id, run.id) : Promise.resolve(0 as -1 | 0 | 1),
    listComments(run.id),
  ]);
  return (
    <Container width="narrow" className="py-12">
      <Eyebrow>
        <Link href={`/tasks/${task.slug}`} className="hover:text-[var(--accent)]">
          ← {task.title}
        </Link>
      </Eyebrow>

      <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-4">
        <div>
          <h1 className="mono text-2xl">{run.model_id}</h1>
          <p className="mono mt-1 tnum text-xl">
            {run.score == null ? "—" : `${run.score}${run.unit}`}
          </p>
          <p className="mono mt-1 text-xs text-[var(--mute)]">
            {new Date(run.created_at).toISOString().slice(0, 16).replace("T", " ")}
          </p>
        </div>
        <VoteButtons
          runId={run.id}
          slug={task.slug}
          tally={tally}
          ownVote={ownVote}
          signedIn={!!user}
        />
      </div>

      <Rule weight="hair" className="my-6" />

      <section className="grid gap-2">
        <Eyebrow>Evidence</Eyebrow>
        {run.evidence_url ? (
          <a
            href={run.evidence_url}
            rel="noopener noreferrer"
            target="_blank"
            className="mono break-all text-sm underline decoration-[var(--rule)] underline-offset-2"
          >
            {run.evidence_kind} → {run.evidence_url}
          </a>
        ) : (
          <p className="mono text-sm text-[var(--mute)]">{run.evidence_kind} (no URL)</p>
        )}
      </section>

      {run.notes_md && (
        <>
          <Rule weight="hair" className="my-6" />
          <section>
            <Eyebrow className="mb-2">Notes</Eyebrow>
            <pre className="mono whitespace-pre-wrap text-sm leading-relaxed">{run.notes_md}</pre>
          </section>
        </>
      )}

      <Rule weight="hair" className="my-6" />

      <section>
        <Eyebrow className="mb-3">Comments ({comments.length})</Eyebrow>
        <ul className="grid gap-3">
          {comments.map((c) => (
            <li key={c.id} className="border border-[var(--rule)] p-3 text-sm">
              <div className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
                {c.author_id.slice(0, 8)} · {new Date(c.created_at).toISOString().slice(0, 16).replace("T", " ")}
              </div>
              <pre className="mt-2 whitespace-pre-wrap font-sans">{c.body_md}</pre>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          {user ? (
            <CommentForm runId={run.id} slug={task.slug} />
          ) : (
            <p className="text-sm text-[var(--mute)]">
              <Link href={`/sign-in?next=/tasks/${task.slug}/runs/${run.id}`} className="underline">
                Sign in
              </Link>{" "}
              to comment.
            </p>
          )}
        </div>
      </section>
    </Container>
  );
}
