import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/test-yourself", label: "Try it" },
  { href: "/methodology", label: "Methodology" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="mono text-sm font-medium tracking-tight transition-opacity hover:opacity-80"
        >
          BENCH<span className="text-[var(--accent)]">/</span>04.25
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-none px-3 py-1.5 text-[var(--mute)] transition-colors hover:bg-[var(--rule)] hover:text-[var(--foreground)]"
            >
              {n.label}
            </Link>
          ))}
          <span className="ml-2">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}
