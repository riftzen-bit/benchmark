import Link from "next/link";
import { Eyebrow } from "@/components/shared/eyebrow";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="grid gap-6">
      <Eyebrow>Sign in</Eyebrow>
      <SignInForm />
      <p className="text-sm text-[var(--mute)]">
        New here?{" "}
        <Link href="/sign-up" className="underline decoration-[var(--rule)] underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
