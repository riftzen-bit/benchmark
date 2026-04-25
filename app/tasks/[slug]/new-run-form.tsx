"use client";
import { useActionState } from "react";
import { submitRunAction, type CreateRunResult } from "./actions";

type Model = { id: string; vendor: string };

export function NewRunForm({
  slug,
  taskId,
  models,
}: {
  slug: string;
  taskId: string;
  models: Model[];
}) {
  const action = submitRunAction.bind(null, slug, taskId);
  const [state, formAction, pending] = useActionState<CreateRunResult | null, FormData>(
    action,
    null,
  );
  if (state?.ok) {
    return <p className="text-sm">Run submitted. Refresh to see it in the list.</p>;
  }
  return (
    <form action={formAction} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        Model
        <select
          name="model_id"
          required
          className="mono border border-[var(--rule)] bg-transparent px-2 py-1.5"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id} — {m.vendor}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          Score
          <input
            name="score"
            type="number"
            step="0.01"
            placeholder="87.6"
            className="mono border border-[var(--rule)] bg-transparent px-2 py-1.5"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Unit
          <input
            name="unit"
            defaultValue="%"
            maxLength={16}
            className="mono border border-[var(--rule)] bg-transparent px-2 py-1.5"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        Evidence kind
        <select
          name="evidence_kind"
          required
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        >
          <option value="url">Public chat share URL</option>
          <option value="screenshot">Screenshot</option>
          <option value="transcript">Transcript text</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Evidence URL (chat share, screenshot host, etc.)
        <input
          name="evidence_url"
          type="url"
          placeholder="https://chatgpt.com/share/…"
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Notes (markdown, optional)
        <textarea
          name="notes_md"
          maxLength={10000}
          rows={4}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5 text-sm"
        />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="justify-self-start border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)] disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit run"}
      </button>
    </form>
  );
}
