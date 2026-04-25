"use client";
import { useActionState } from "react";
import { addCommentAction, type CommentResult } from "./actions";

export function CommentForm({ runId, slug }: { runId: string; slug: string }) {
  const action = addCommentAction.bind(null, runId, slug);
  const [state, formAction, pending] = useActionState<CommentResult | null, FormData>(action, null);
  return (
    <form action={formAction} className="grid gap-2">
      <textarea
        name="body_md"
        required
        minLength={1}
        maxLength={4000}
        rows={3}
        placeholder="Add a comment…"
        className="border border-[var(--rule)] bg-transparent px-2 py-1.5 text-sm"
      />
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="mono justify-self-start border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--paper)] disabled:opacity-50"
      >
        {pending ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
