import { cn } from "@/lib/utils";

export function Rule({
  weight = "hair",
  className,
  ...rest
}: { weight?: "hair" | "ink" } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn(
        "h-px w-full",
        weight === "ink" ? "bg-[var(--foreground)]" : "bg-[var(--rule)]",
        className,
      )}
      {...rest}
    />
  );
}
