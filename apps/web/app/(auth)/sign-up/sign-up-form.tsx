"use client";
import { useActionState } from "react";
import { signUpAction } from "@/lib/auth/actions";
import { AuthInput } from "@/components/auth/auth-input";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, null);
  if (state?.ok) {
    return (
      <div
        role="status"
        className="border border-[var(--pos)]/40 bg-[var(--pos)]/8 px-4 py-3 text-sm leading-relaxed text-[var(--foreground)]"
      >
        <p className="mono mb-1 text-[10px] uppercase tracking-widest text-[var(--pos)]">
          Confirmation sent
        </p>
        Check your inbox for a confirmation link to finish creating your account.
      </div>
    );
  }
  return (
    <form action={formAction} className="grid gap-4">
      <AuthInput
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@domain.com"
      />
      <AuthInput
        label="Password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="min 8 chars"
        hint="At least 8 characters. We salt &amp; hash, never store plaintext."
      />
      {state && !state.ok && (
        <p
          role="alert"
          className="border-l-2 border-[var(--neg)] bg-[var(--neg)]/8 px-3 py-2 text-sm text-[var(--neg)]"
        >
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-[var(--paper)] transition-colors hover:bg-transparent hover:text-[var(--ink)] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create account →"}
      </button>
    </form>
  );
}
