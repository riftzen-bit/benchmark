import Link from "next/link";
import { Eyebrow } from "@/components/shared/eyebrow";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthDivider } from "@/components/auth/auth-divider";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="grid gap-8 fade-up">
      <header className="grid gap-2">
        <Eyebrow>Sign in</Eyebrow>
        <h1 className="display text-3xl tracking-tight md:text-4xl">
          Welcome back to the<br />
          <span className="text-[var(--accent)]">Tape</span>.
        </h1>
        <p className="text-sm text-[var(--mute)]">
          Continue with Google or use your email. Your runs travel with you.
        </p>
      </header>

      <GoogleButton />
      <AuthDivider label="or sign in with email" />
      <SignInForm />

      <p className="border-t border-[var(--rule)] pt-6 text-sm text-[var(--mute)]">
        New to frontier·tape?{" "}
        <Link
          href="/sign-up"
          className="text-[var(--foreground)] underline decoration-[var(--rule)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
