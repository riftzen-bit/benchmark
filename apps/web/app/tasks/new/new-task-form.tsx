"use client";
import { useActionState } from "react";
import { createTaskAction } from "../actions";

type Cat = { id: string; label: string };

export interface NewTaskDefaults {
  slug?: string;
  title?: string;
  category?: string;
  body?: string;
  rubric?: string;
}

export function NewTaskForm({
  categories,
  defaults = {},
}: {
  categories: Cat[];
  defaults?: NewTaskDefaults;
}) {
  const [state, action, pending] = useActionState(createTaskAction, null);
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Slug
        <input
          name="slug"
          required
          minLength={3}
          maxLength={64}
          pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
          placeholder="long-context-needle"
          defaultValue={defaults.slug ?? ""}
          className="mono border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Title
        <input
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={defaults.title ?? ""}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Category
        <select
          name="category"
          required
          defaultValue={defaults.category ?? ""}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Visibility
        <select
          name="visibility"
          defaultValue="public"
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted (only people with the link)</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Prompt body (markdown)
        <textarea
          name="body_md"
          required
          minLength={10}
          maxLength={20000}
          rows={10}
          defaultValue={defaults.body ?? ""}
          className="mono border border-[var(--rule)] bg-transparent px-2 py-1.5 text-sm"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Rubric / what to look for (markdown, optional)
        <textarea
          name="rubric_md"
          maxLength={10000}
          rows={5}
          defaultValue={defaults.rubric ?? ""}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5 text-sm"
        />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="justify-self-start border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create task"}
      </button>
    </form>
  );
}
