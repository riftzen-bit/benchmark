import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("eyebrow", className)} {...rest}>
      <span aria-hidden className="text-[var(--rule)]">[</span>
      <span className="px-1.5">{children}</span>
      <span aria-hidden className="text-[var(--rule)]">]</span>
    </p>
  );
}
