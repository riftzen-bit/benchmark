"use client";
import { useActionState } from "react";
import { updateProfileAction } from "./actions";

type Profile = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
};

type Account = {
  email: string;
  provider: string;
  createdAt: string | undefined;
};

export function ProfileForm({ profile, account }: { profile: Profile; account: Account }) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  const memberSince = account.createdAt
    ? new Date(account.createdAt).toISOString().slice(0, 10)
    : null;

  return (
    <div className="grid gap-10">
      <section
        aria-labelledby="account-heading"
        className="border border-[var(--rule)] p-5"
      >
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <h2
            id="account-heading"
            className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]"
          >
            Account &middot; locked
          </h2>
          <span className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
            via {account.provider}
          </span>
        </header>
        <dl className="grid gap-3 text-sm">
          <div className="grid grid-cols-[120px_1fr] items-baseline gap-3">
            <dt className="mono text-[11px] uppercase tracking-widest text-[var(--mute)]">
              Email
            </dt>
            <dd className="mono break-all">{account.email || "(none)"}</dd>
          </div>
          {memberSince && (
            <div className="grid grid-cols-[120px_1fr] items-baseline gap-3">
              <dt className="mono text-[11px] uppercase tracking-widest text-[var(--mute)]">
                Member since
              </dt>
              <dd className="mono">{memberSince}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 text-xs text-[var(--mute)]">
          Email is tied to the OAuth account you signed in with and cannot be
          changed here. To use a different address, sign out and sign up with the
          new account.
        </p>
      </section>

      <form action={action} className="grid gap-4">
        <h2 className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
          Public profile
        </h2>
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
          <span className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
            3 to 32 chars. Letters, digits, underscore.
          </span>
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
            placeholder="https://..."
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
        {state && !state.ok && (
          <p role="alert" className="text-sm text-[var(--neg)]">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p role="status" className="text-sm text-[var(--pos)]">
            Saved.
          </p>
        )}
        <button
          disabled={pending}
          className="justify-self-start border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)] disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form
        action="/auth/sign-out"
        method="post"
        className="flex items-center justify-end border-t border-[var(--rule)] pt-6"
      >
        <button
          type="submit"
          className="mono px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--mute)] hover:text-[var(--foreground)]"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
