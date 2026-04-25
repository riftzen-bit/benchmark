"use client";
import type { BenchmarkCategory } from "@/lib/schema/benchmark";

interface Props {
  categories: ReadonlyArray<BenchmarkCategory | "all">;
  active: BenchmarkCategory | "all";
  onChange: (c: BenchmarkCategory | "all") => void;
}

export function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2 border-b border-[var(--rule)]">
      {categories.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`mono px-3 py-2 text-xs uppercase tracking-widest transition-colors ${
              isActive
                ? "border-b border-[var(--accent)] text-[var(--foreground)]"
                : "text-[var(--mute)] hover:text-[var(--foreground)]"
            }`}
            aria-pressed={isActive}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
