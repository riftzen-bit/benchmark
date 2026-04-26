import Link from "next/link";
import { SITE } from "@/lib/config/site";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label={SITE.name}
      className="group inline-flex items-center gap-2"
    >
      <span
        aria-hidden
        className="inline-flex h-6 w-6 items-center justify-center border border-[var(--foreground)] text-[var(--foreground)] transition-colors group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)]"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M3 2 H2 V14 H3" />
          <path d="M13 2 H14 V14 H13" />
          <path d="M5.5 8 H10.5" />
          <circle cx="8" cy="8" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="inline-flex items-baseline gap-1">
        <span className="display text-base font-medium leading-none tracking-tight">
          frontier
        </span>
        <span aria-hidden className="text-[var(--accent)] leading-none">·</span>
        <span className="display text-base font-medium leading-none tracking-tight italic">
          tape
        </span>
      </span>
      <span className="ml-1 mono text-[10px] uppercase tracking-widest text-[var(--mute)] group-hover:text-[var(--foreground)] transition-colors">
        {SITE.issue}
      </span>
    </Link>
  );
}
