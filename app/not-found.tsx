import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[600px] flex-col justify-center px-6">
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">404</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">Page not found.</h1>
      <p className="mt-3 text-[var(--mute)]">
        The link may be old, or there&apos;s a typo in the URL.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] transition-colors hover:bg-transparent hover:text-[var(--foreground)]"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
