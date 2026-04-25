"use client";
import { useActionState } from "react";
import { signInAction } from "@/lib/auth/actions";
import { AuthInput } from "@/components/auth/auth-input";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, null);
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
        minLength={1}
        autoComplete="current-password"
        placeholder="••••••••"
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
        {pending ? "Signing in…" : "Sign in →"}
      </button>
    </form>
  );
}
