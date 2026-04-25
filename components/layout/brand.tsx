import Link from "next/link";
import { SITE } from "@/lib/config/site";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label={SITE.name}
      className="group inline-flex items-baseline gap-2"
    >
      <span className="display text-base font-medium leading-none tracking-tight">
        frontier
      </span>
      <span aria-hidden className="text-[var(--accent)] leading-none">·</span>
      <span className="display text-base font-medium leading-none tracking-tight italic">
        tape
      </span>
      <span className="ml-2 mono text-[10px] uppercase tracking-widest text-[var(--mute)] group-hover:text-[var(--foreground)] transition-colors">
        {SITE.issue}
      </span>
    </Link>
  );
}
