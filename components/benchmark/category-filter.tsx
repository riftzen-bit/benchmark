"use client";
import type { BenchmarkCategory } from "@/lib/schema/benchmark";

interface Props {
  categories: ReadonlyArray<BenchmarkCategory | "all">;
  active: BenchmarkCategory | "all";
  onChange: (c: BenchmarkCategory | "all") => void;
}

export function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
      {categories.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={isActive}
            className={[
              "mono shrink-0 border px-3 py-1.5 text-[11px] uppercase tracking-widest transition-colors",
              isActive
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                : "border-[var(--rule)] text-[var(--mute)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {c === "all" ? "All" : c}
          </button>
        );
      })}
    </div>
  );
}
