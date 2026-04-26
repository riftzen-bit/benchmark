"use client";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface BoardRow {
  rank: number;
  label: string;
  modelId: string;
  primary: number;
  secondary: ReadonlyArray<{ key: string; label: string; value: number | string | null }>;
  meta?: string | null;
}

type PrimaryFormat = "round" | "fixed1";

interface Props {
  rows: ReadonlyArray<BoardRow>;
  primaryLabel: string;
  primaryFormat?: PrimaryFormat;
  basePath: string;
}

export function ExternalBoard({ rows, primaryLabel, primaryFormat, basePath }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const sort = sp.get("sort") ?? "primary";
  const dir = sp.get("dir") === "asc" ? "asc" : "desc";

  const sorted = useMemo(() => {
    const arr = rows.slice();
    arr.sort((a, b) => {
      const av = sort === "primary" ? a.primary : findSecondary(a, sort);
      const bv = sort === "primary" ? b.primary : findSecondary(b, sort);
      return compare(av, bv) * (dir === "asc" ? 1 : -1);
    });
    return arr;
  }, [rows, sort, dir]);

  const onSort = (key: string) => {
    const nextDir = sort === key ? (dir === "asc" ? "desc" : "asc") : "desc";
    const next = new URLSearchParams(sp.toString());
    next.set("sort", key);
    next.set("dir", nextDir);
    router.replace(`${basePath}?${next.toString()}`, { scroll: false });
  };

  const cols = sorted[0]?.secondary ?? [];
  const fmt = (n: number) =>
    primaryFormat === "round" ? Math.round(n).toString() : n.toFixed(1);

  return (
    <div className="overflow-x-auto border-y border-[var(--rule)]">
      <table className="tnum w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--rule)] text-left">
            <th className="mono py-2 pl-3 pr-4 text-xs uppercase tracking-widest text-[var(--mute)] w-12 text-right">
              #
            </th>
            <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
              Model
            </th>
            <th className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)] text-right">
              <button
                type="button"
                onClick={() => onSort("primary")}
                className={cn(
                  "inline-flex items-center gap-1 hover:text-[var(--foreground)]",
                  sort === "primary" && "text-[var(--foreground)]",
                )}
              >
                {primaryLabel}
                {sort === "primary" && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
              </button>
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)] text-right"
              >
                <button
                  type="button"
                  onClick={() => onSort(c.key)}
                  className={cn(
                    "inline-flex items-center gap-1 hover:text-[var(--foreground)]",
                    sort === c.key && "text-[var(--foreground)]",
                  )}
                >
                  {c.label}
                  {sort === c.key && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.modelId} className="border-b border-[var(--rule)]/60">
              <td className="mono py-2 pl-3 pr-4 text-right text-[var(--mute)]">
                {String(r.rank).padStart(2, "0")}
              </td>
              <td className="mono py-2 pr-4">
                <span className="font-medium">{r.label}</span>
                {r.meta && (
                  <span className="ml-2 text-[10px] uppercase tracking-widest text-[var(--mute)]">
                    {r.meta}
                  </span>
                )}
              </td>
              <td className="mono py-2 pr-4 text-right font-medium">
                {fmt(r.primary)}
              </td>
              {r.secondary.map((c) => (
                <td key={c.key} className="mono py-2 pr-4 text-right text-[var(--mute)]">
                  {c.value == null ? "—" : typeof c.value === "number" ? c.value.toFixed(1) : c.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function findSecondary(r: BoardRow, key: string): number {
  const cell = r.secondary.find((c) => c.key === key);
  if (!cell || cell.value == null) return -Infinity;
  return typeof cell.value === "number" ? cell.value : -Infinity;
}

function compare(a: number, b: number): number {
  return a - b;
}
