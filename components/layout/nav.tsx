"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/config/site";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex">
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-3 py-1.5 transition-colors",
              active
                ? "text-[var(--foreground)]"
                : "text-[var(--mute)] hover:text-[var(--foreground)]",
            )}
          >
            <span
              className={cn(
                "mono text-xs uppercase tracking-widest border-b border-transparent pb-0.5",
                active && "border-[var(--accent)]",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function NavMobile() {
  return (
    <nav aria-label="Primary mobile" className="flex items-center gap-1 text-xs md:hidden">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="mono px-2 py-1.5 text-[10px] uppercase tracking-widest text-[var(--mute)] hover:text-[var(--foreground)]"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
