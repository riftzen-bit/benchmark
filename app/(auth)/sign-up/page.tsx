import Link from "next/link";
import { Eyebrow } from "@/components/shared/eyebrow";
import { SignUpForm } from "./sign-up-form";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="grid gap-6">
      <Eyebrow>Create account</Eyebrow>
      <SignUpForm />
      <p className="text-sm text-[var(--mute)]">
        Already have one?{" "}
        <Link href="/sign-in" className="underline decoration-[var(--rule)] underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
