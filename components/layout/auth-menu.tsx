import Link from "next/link";
import { getUser } from "@/lib/auth/session";

export async function AuthMenu() {
  const user = await getUser();
  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="mono px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--mute)] hover:text-[var(--foreground)]"
      >
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Link
        href="/profile"
        className="mono px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--mute)] hover:text-[var(--foreground)]"
        title={user.email ?? undefined}
      >
        Profile
      </Link>
      <form action="/auth/sign-out" method="post">
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
