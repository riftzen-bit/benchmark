import Link from "next/link";
import { cn } from "@/lib/utils";

export type BoardKey = "arena" | "open-llm" | "livebench" | "community";

const TABS: ReadonlyArray<{ key: BoardKey; label: string; sub: string }> = [
  { key: "arena", label: "Arena", sub: "LMSYS" },
  { key: "open-llm", label: "Open LLM", sub: "HF v2" },
  { key: "livebench", label: "LiveBench", sub: "GitHub" },
  { key: "community", label: "Community", sub: "Frontier Tape" },
];

interface Props {
  active: BoardKey;
}

export function BoardTabs({ active }: Props) {
  return (
    <nav aria-label="Leaderboard sources" className="grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-4">
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/leaderboard?board=${t.key}`}
            aria-current={on ? "page" : undefined}
            className={cn(
              "block bg-[var(--background)] p-4 transition-colors hover:bg-[var(--foreground)]/[0.04]",
              on && "bg-[var(--foreground)]/[0.06]",
            )}
          >
            <span
              className={cn(
                "mono block text-[10px] uppercase tracking-widest",
                on ? "text-[var(--accent)]" : "text-[var(--mute)]",
              )}
            >
              {t.sub}
            </span>
            <span className="display mt-1 block text-lg tracking-tight">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
