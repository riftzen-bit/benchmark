"use client";
import { Rule } from "@/components/shared/rule";
import { CategoryFilter } from "./category-filter";
import { SortControl, type SortKey, type SortDir } from "./sort-control";
import type { BenchmarkCategory } from "@/lib/schema/benchmark";

interface Props {
  categories: ReadonlyArray<BenchmarkCategory | "all">;
  activeCategory: BenchmarkCategory | "all";
  onCategoryChange: (c: BenchmarkCategory | "all") => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  shownCount: number;
  totalCount: number;
}

export function BoardToolbar({
  categories,
  activeCategory,
  onCategoryChange,
  sortKey,
  sortDir,
  onSort,
  shownCount,
  totalCount,
}: Props) {
  return (
    <div className="sticky top-14 z-30 bg-[var(--background)]/90 backdrop-blur">
      <Rule weight="hair" />
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 py-3">
        <div className="min-w-0 flex-1">
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={onCategoryChange}
          />
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <SortControl sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
          <span className="eyebrow whitespace-nowrap">
            {shownCount} of {totalCount}
          </span>
        </div>
      </div>
      <Rule weight="hair" />
    </div>
  );
}
