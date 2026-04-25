import Link from "next/link";
import { Eyebrow } from "@/components/shared/eyebrow";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthDivider } from "@/components/auth/auth-divider";
import { SignUpForm } from "./sign-up-form";

export const metadata = { title: "Sign up" };

const PERKS = [
  "Post your own benchmark tasks with rubrics",
  "Submit cited runs (URL, screenshot, transcript)",
  "Vote and discuss community runs",
  "Track your model leaderboard contributions",
];

export default function SignUpPage() {
  return (
    <div className="grid gap-8 fade-up">
      <header className="grid gap-2">
        <Eyebrow>Create account &middot; free</Eyebrow>
        <h1 className="display text-3xl tracking-tight md:text-4xl">
          Join the people<br />
          keeping <span className="text-[var(--accent)]">receipts</span>.
        </h1>
        <p className="text-sm text-[var(--mute)]">
          Free forever. No credit card. Anyone can post a benchmark or submit a run.
        </p>
      </header>

      <GoogleButton label="Sign up with Google" />
      <AuthDivider label="or with email" />
      <SignUpForm />

      <ul className="grid gap-2 border-t border-[var(--rule)] pt-6">
        {PERKS.map((p) => (
          <li key={p} className="flex items-start gap-3 text-sm">
            <span
              aria-hidden
              className="mono mt-0.5 text-[10px] tracking-widest text-[var(--accent)]"
            >
              [ok]
            </span>
            <span className="text-[var(--mute)]">{p}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-[var(--mute)]">
        Have one already?{" "}
        <Link
          href="/sign-in"
          className="text-[var(--foreground)] underline decoration-[var(--rule)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
