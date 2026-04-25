"use client";

export type SortKey = "label" | "opus" | "gpt" | "delta";
export type SortDir = "asc" | "desc";

interface Props {
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

const BUTTONS: { key: SortKey; label: string }[] = [
  { key: "label", label: "Name" },
  { key: "opus", label: "Opus" },
  { key: "gpt", label: "GPT" },
  { key: "delta", label: "Δ" },
];

export function SortControl({ sortKey, sortDir, onSort }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow hidden sm:inline">Sort:</span>
      <div className="flex gap-1" role="group" aria-label="Sort benchmarks">
        {BUTTONS.map(({ key, label }) => {
          const isActive = sortKey === key;
          const arrow = sortDir === "asc" ? "↑" : "↓";
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSort(key)}
              aria-pressed={isActive}
              aria-label={
                isActive
                  ? `Sort by ${label}, ${sortDir === "asc" ? "ascending" : "descending"} (click to reverse)`
                  : `Sort by ${label}`
              }
              className={[
                "mono border px-2.5 py-1 text-[11px] uppercase tracking-widest transition-colors",
                isActive
                  ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                  : "border-[var(--rule)] text-[var(--mute)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              {label}
              {isActive ? <span aria-hidden> {arrow}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
