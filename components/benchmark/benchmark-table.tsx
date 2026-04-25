"use client";
import { useMemo, useState } from "react";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import type { BenchmarkCategory, BenchmarkRow } from "@/lib/schema/benchmark";
import { CategoryFilter } from "./category-filter";
import { ScoreCell } from "./score-cell";
import { winnerOf, deltaOf } from "@/lib/utils/delta";
import { formatDelta } from "@/lib/utils/fmt";

type SortKey = "label" | "opus" | "gpt" | "delta";
type SortDir = "asc" | "desc";

const ALL_CATS: ReadonlyArray<"all" | BenchmarkCategory> = [
  "all",
  "coding",
  "reasoning",
  "agent",
  "vision",
  "multilingual",
  "knowledge",
  "price",
];

export function BenchmarkTable() {
  const [cat, setCat] = useState<"all" | BenchmarkCategory>("all");
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo(() => {
    const filtered = cat === "all" ? BENCHMARKS : BENCHMARKS.filter((b) => b.category === cat);
    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "label") return a.label.localeCompare(b.label) * dir;
      if (sortKey === "opus") return ((a.opus ?? -Infinity) - (b.opus ?? -Infinity)) * dir;
      if (sortKey === "gpt") return ((a.gpt ?? -Infinity) - (b.gpt ?? -Infinity)) * dir;
      const da = deltaOf(a.opus, a.gpt) ?? -Infinity;
      const db = deltaOf(b.opus, b.gpt) ?? -Infinity;
      return (da - db) * dir;
    });
    return sorted;
  }, [cat, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div>
      <CategoryFilter categories={ALL_CATS} active={cat} onChange={setCat} />
      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--rule)] text-left">
            <Th onClick={() => toggleSort("label")} active={sortKey === "label"} dir={sortDir}>
              Benchmark
            </Th>
            <Th onClick={() => toggleSort("opus")} active={sortKey === "opus"} dir={sortDir} numeric>
              Opus 4.7
            </Th>
            <Th onClick={() => toggleSort("gpt")} active={sortKey === "gpt"} dir={sortDir} numeric>
              GPT-5.5
            </Th>
            <Th onClick={() => toggleSort("delta")} active={sortKey === "delta"} dir={sortDir} numeric>
              Δ
            </Th>
            <th className="mono py-3 pr-2 text-right text-xs uppercase tracking-widest text-[var(--mute)]">
              Cat.
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => <Row key={r.id} row={r} />)}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <p className="mt-12 text-center text-sm text-[var(--mute)]">Không có dữ liệu.</p>
      ) : null}
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  numeric,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  numeric?: boolean;
}) {
  const ariaSort = active ? (dir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th
      aria-sort={ariaSort}
      className={`mono py-3 text-xs uppercase tracking-widest ${
        numeric ? "pr-2 text-right" : "pl-0"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={active ? `Sắp xếp theo ${typeof children === "string" ? children : ""}, ${dir === "asc" ? "tăng dần" : "giảm dần"}` : undefined}
        className={`hover:text-[var(--foreground)] ${
          active ? "text-[var(--foreground)]" : "text-[var(--mute)]"
        }`}
      >
        {children}
        {active ? <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span> : null}
      </button>
    </th>
  );
}

function Row({ row }: { row: BenchmarkRow }) {
  const winner = winnerOf(row);
  const delta = deltaOf(row.opus, row.gpt);
  return (
    <tr className="border-b border-[var(--rule)] align-baseline">
      <td className="py-3 pr-4 text-sm">
        {row.label}
        {row.note ? <span className="ml-2 text-xs text-[var(--mute)]">— {row.note}</span> : null}
      </td>
      <td className="py-3 pr-2 text-right">
        <ScoreCell
          value={row.opus}
          unit={row.unit}
          isWinner={winner === "opus"}
          sourceIds={row.sourceIds}
        />
      </td>
      <td className="py-3 pr-2 text-right">
        <ScoreCell value={row.gpt} unit={row.unit} isWinner={winner === "gpt"} />
      </td>
      <td className="py-3 pr-2 text-right mono tnum text-sm text-[var(--mute)]">
        {formatDelta(delta)}
      </td>
      <td className="py-3 text-right mono text-xs uppercase tracking-widest text-[var(--mute)]">
        {row.category}
      </td>
    </tr>
  );
}
