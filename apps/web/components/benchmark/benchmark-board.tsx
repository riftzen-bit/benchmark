"use client";
import { useState, useMemo } from "react";
import type { BenchmarkRow, BenchmarkCategory } from "@/lib/schema/benchmark";
import { groupByCategory } from "@/lib/utils/aggregate";
import { winnerOf, deltaOf } from "@/lib/utils/delta";
import { BoardToolbar } from "./board-toolbar";
import { BoardLegend } from "./board-legend";
import { CategorySection } from "./category-section";
import { BoardRow } from "./board-row";
import { BoardMobileCard } from "./board-mobile-card";
import type { SortKey, SortDir } from "./sort-control";

interface Props {
  data: ReadonlyArray<BenchmarkRow>;
}

const CATEGORY_ORDER: ReadonlyArray<BenchmarkCategory | "all"> = [
  "all",
  "coding",
  "reasoning",
  "agent",
  "vision",
  "multilingual",
  "knowledge",
  "math",
  "price",
];

export function BenchmarkBoard({ data }: Props) {
  const [cat, setCat] = useState<BenchmarkCategory | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const availableCategories = useMemo<ReadonlyArray<BenchmarkCategory | "all">>(() => {
    const present = new Set(data.map((r) => r.category));
    return CATEGORY_ORDER.filter((c) => c === "all" || present.has(c));
  }, [data]);

  const filtered = useMemo<ReadonlyArray<BenchmarkRow>>(() => {
    return cat === "all" ? data : data.filter((r) => r.category === cat);
  }, [data, cat]);

  const sorted = useMemo<ReadonlyArray<BenchmarkRow>>(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "label") return dir * a.label.localeCompare(b.label);
      if (sortKey === "opus") {
        return dir * ((a.opus ?? -Infinity) - (b.opus ?? -Infinity));
      }
      if (sortKey === "gpt") {
        return dir * ((a.gpt ?? -Infinity) - (b.gpt ?? -Infinity));
      }
      // delta
      const da = deltaOf(a.opus, a.gpt) ?? -Infinity;
      const db = deltaOf(b.opus, b.gpt) ?? -Infinity;
      return dir * (da - db);
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const useGrouped = cat === "all" && sortKey === "label";
  const grouped = useMemo(
    () => (useGrouped ? groupByCategory(sorted) : null),
    [useGrouped, sorted],
  );

  return (
    <div>
      <BoardToolbar
        categories={availableCategories}
        activeCategory={cat}
        onCategoryChange={setCat}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        shownCount={sorted.length}
        totalCount={data.length}
      />

      <div className="mt-3">
        <BoardLegend />
      </div>

      {useGrouped && grouped ? (
        <div className="mt-4">
          {grouped.map((g, i) => (
            <CategorySection
              key={g.category}
              category={g.category}
              rows={g.rows}
              isFirst={i === 0}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          {/* Desktop flat list */}
          <div className="hidden md:block">
            {sorted.map((row) => (
              <BoardRow key={row.id} row={row} />
            ))}
          </div>
          {/* Mobile flat list */}
          <div className="md:hidden">
            {sorted.map((row) => (
              <BoardMobileCard key={row.id} row={row} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
