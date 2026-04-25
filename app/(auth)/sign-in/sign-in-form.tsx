"use client";
import { useActionState } from "react";
import { signInAction, signInWithGoogleAction } from "@/lib/auth/actions";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, null);
  return (
    <form action={formAction} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={1}
          autoComplete="current-password"
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)] disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <button
        type="button"
        formAction={signInWithGoogleAction}
        className="mono border border-[var(--rule)] px-3 py-1.5 text-xs uppercase tracking-widest"
      >
        Continue with Google
      </button>
    </form>
  );
}
