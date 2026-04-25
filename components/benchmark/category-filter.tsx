"use client";
import type { BenchmarkCategory } from "@/lib/schema/benchmark";

interface Props {
  categories: ReadonlyArray<BenchmarkCategory | "all">;
  active: BenchmarkCategory | "all";
  onChange: (c: BenchmarkCategory | "all") => void;
}

export function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`mono border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              isActive
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                : "border-[var(--rule)] text-[var(--mute)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            }`}
            aria-pressed={isActive}
          >
            {c === "all" ? "All" : c}
          </button>
        );
      })}
    </div>
  );
}
