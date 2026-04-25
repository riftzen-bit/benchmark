import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Tổng quan" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/test-yourself", label: "Tự thử" },
  { href: "/methodology", label: "Phương pháp" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm tracking-tight">
          BENCH<span className="text-[var(--accent)]">/</span>04.25
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[var(--mute)] transition-colors hover:text-[var(--foreground)]"
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
