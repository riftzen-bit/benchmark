import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";

interface Props {
  label: string;
  value: React.ReactNode;
  side?: "opus" | "gpt" | "tie" | null;
  className?: string;
}

const SIDE_TONE: Record<NonNullable<Props["side"]>, string> = {
  opus: "text-[var(--opus)]",
  gpt: "text-[var(--gpt)]",
  tie: "text-[var(--tie)]",
};

export function Stat({ label, value, side, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Eyebrow>{label}</Eyebrow>
      <p
        className={cn(
          "tnum display text-3xl md:text-4xl leading-none",
          side ? SIDE_TONE[side] : "text-[var(--foreground)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
