"use client";
import { useActionState } from "react";
import { updateProfileAction } from "./actions";

type Profile = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Username
        <input
          name="username"
          defaultValue={profile.username}
          required
          minLength={3}
          maxLength={32}
          pattern="[A-Za-z0-9_]+"
          className="mono border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Display name
        <input
          name="display_name"
          defaultValue={profile.display_name}
          maxLength={64}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Avatar URL
        <input
          name="avatar_url"
          type="url"
          defaultValue={profile.avatar_url ?? ""}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Bio (max 280 chars)
        <textarea
          name="bio"
          defaultValue={profile.bio}
          maxLength={280}
          rows={4}
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Saved.</p>}
      <button
        disabled={pending}
        className="justify-self-start border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)] disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
