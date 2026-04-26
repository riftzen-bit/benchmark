"use client";
import { useMemo, useState } from "react";
import type { BenchmarkRow, BenchmarkCategory } from "@/lib/schema/benchmark";
import { winnerOf, deltaOf, signedAdvantage } from "@/lib/utils/delta";
import { formatScore, formatDelta } from "@/lib/utils/fmt";
import { CategoryFilter } from "@/components/benchmark/category-filter";
import { SourceCite } from "@/components/benchmark/source-cite";
import { Eyebrow } from "@/components/shared/eyebrow";

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

type Sort = "delta-mag" | "delta-opus" | "delta-gpt";

const SORT_BUTTONS: ReadonlyArray<{ key: Sort; label: string }> = [
  { key: "delta-mag", label: "Biggest gap" },
  { key: "delta-opus", label: "Opus most ahead" },
  { key: "delta-gpt", label: "GPT most ahead" },
];

interface Props {
  rows: ReadonlyArray<BenchmarkRow>;
}

export function CompareBoard({ rows }: Props) {
  const [cat, setCat] = useState<BenchmarkCategory | "all">("all");
  const [sort, setSort] = useState<Sort>("delta-mag");

  const cats = useMemo(() => {
    const present = new Set(rows.map((r) => r.category));
    return CATEGORY_ORDER.filter((c) => c === "all" || present.has(c));
  }, [rows]);

  const display = useMemo(() => {
    const filtered = cat === "all" ? rows : rows.filter((r) => r.category === cat);
    return [...filtered].sort((a, b) => {
      const da = signedAdvantage(a);
      const db = signedAdvantage(b);
      if (sort === "delta-mag") return Math.abs(db) - Math.abs(da);
      if (sort === "delta-opus") return db - da;
      return da - db;
    });
  }, [rows, cat, sort]);

  const max = useMemo(
    () =>
      display.reduce((m, r) => {
        const a = Math.abs(signedAdvantage(r));
        return a > m ? a : m;
      }, 1),
    [display],
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <Eyebrow className="mb-2">Category</Eyebrow>
          <CategoryFilter categories={cats} active={cat} onChange={setCat} />
        </div>
        <div>
          <Eyebrow className="mb-2">Sort</Eyebrow>
          <div className="flex flex-wrap gap-1">
            {SORT_BUTTONS.map((b) => {
              const active = b.key === sort;
              return (
                <button
                  key={b.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSort(b.key)}
                  className={
                    active
                      ? "mono border border-[var(--cream)] bg-[var(--cream)] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--paper)]"
                      : "mono border border-[var(--rule)] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--cream-mute)] transition-colors hover:border-[var(--cream)] hover:text-[var(--cream)]"
                  }
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="grid gap-2">
        {display.map((row) => (
          <CompareRow key={row.id} row={row} maxAdvantage={max} />
        ))}
      </ul>

      {display.length === 0 && (
        <p className="text-sm text-[var(--cream-mute)]">
          No benchmarks in this category yet.
        </p>
      )}
    </div>
  );
}

interface CompareRowProps {
  row: BenchmarkRow;
  maxAdvantage: number;
}

function CompareRow({ row, maxAdvantage }: CompareRowProps) {
  const winner = winnerOf(row);
  const advantage = signedAdvantage(row);
  const pct = Math.min(100, (Math.abs(advantage) / maxAdvantage) * 100);
  const delta = deltaOf(row.opus, row.gpt);

  return (
    <li className="grid grid-cols-1 gap-3 border border-[var(--rule)] bg-[var(--paper-2)] p-4 transition-colors hover:border-[var(--cream)] md:grid-cols-[2fr_3fr_1.4fr] md:items-center md:gap-6">
      <div className="min-w-0">
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
          {row.category}
        </p>
        <p className="mt-0.5 text-[14px] font-semibold leading-snug tracking-[-0.01em] text-[var(--cream)]">
          {row.label}
          <SourceCite ids={row.sourceIds} />
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3" aria-label="Score gap">
        <BarSide
          align="right"
          color="var(--pos)"
          show={advantage > 0}
          pct={advantage > 0 ? pct : 0}
          score={formatScore(row.opus, row.unit)}
          tone={winner === "opus" ? "text-[var(--pos)]" : "text-[var(--cream-mute)]"}
        />
        <span aria-hidden className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
          vs
        </span>
        <BarSide
          align="left"
          color="var(--neg)"
          show={advantage < 0}
          pct={advantage < 0 ? pct : 0}
          score={formatScore(row.gpt, row.unit)}
          tone={winner === "gpt" ? "text-[var(--neg)]" : "text-[var(--cream-mute)]"}
        />
      </div>

      <div className="text-right">
        <p
          className={
            "mono text-base tabular-nums " +
            (winner === "opus"
              ? "text-[var(--pos)]"
              : winner === "gpt"
                ? "text-[var(--neg)]"
                : "text-[var(--cream-mute)]")
          }
        >
          Δ {formatDelta(delta)}
          {row.unit === "%" ? " pts" : ""}
        </p>
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
          {winner === "opus"
            ? "Opus leads"
            : winner === "gpt"
              ? "GPT leads"
              : winner === "tie"
                ? "Tie"
                : "n/a"}
        </p>
      </div>
    </li>
  );
}

interface BarSideProps {
  align: "left" | "right";
  color: string;
  show: boolean;
  pct: number;
  score: string;
  tone: string;
}

function BarSide({ align, color, show, pct, score, tone }: BarSideProps) {
  return (
    <div className={align === "right" ? "flex items-center justify-end gap-3" : "flex items-center justify-start gap-3"}>
      {align === "right" && (
        <span className={`mono text-sm tabular-nums ${tone}`}>{score}</span>
      )}
      <div
        aria-hidden
        className="relative h-2 flex-1 bg-[var(--rule)]"
        style={align === "right" ? { transform: "scaleX(-1)" } : undefined}
      >
        {show && (
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-500"
            style={{ width: `${pct}%`, background: color }}
          />
        )}
      </div>
      {align === "left" && (
        <span className={`mono text-sm tabular-nums ${tone}`}>{score}</span>
      )}
    </div>
  );
}

