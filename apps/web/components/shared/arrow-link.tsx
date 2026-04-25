import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "inline";
  external?: boolean;
  className?: string;
}

const STYLES = {
  primary:
    "inline-flex items-center gap-2 bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] border border-[var(--foreground)] transition-colors hover:bg-transparent hover:text-[var(--foreground)]",
  secondary:
    "inline-flex items-center gap-2 border border-[var(--rule)] px-5 py-2.5 text-sm transition-colors hover:border-[var(--foreground)]",
  inline:
    "inline-flex items-baseline gap-1 text-sm underline decoration-[var(--rule)] decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--accent)]",
} as const;

export function ArrowLink({ href, children, variant = "primary", external, className }: Props) {
  const Cmp = external ? "a" : Link;
  const Icon = external ? ArrowUpRight : ArrowRight;
  const extra = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Cmp href={href} className={cn(STYLES[variant], className)} {...extra}>
      <span>{children}</span>
      <Icon className="h-4 w-4" aria-hidden />
    </Cmp>
  );
}
