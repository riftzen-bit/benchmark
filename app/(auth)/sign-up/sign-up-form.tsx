"use client";
import { useActionState } from "react";
import { signUpAction } from "@/lib/auth/actions";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, null);
  if (state?.ok) {
    return (
      <p className="text-sm">
        Check your inbox for a confirmation link to finish creating your account.
      </p>
    );
  }
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
        Password (min 8 chars)
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="border border-[var(--rule)] bg-transparent px-2 py-1.5"
        />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
