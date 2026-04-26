"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { OpenRouterModel } from "@/lib/data/external/openrouter";
import { vendorLabel } from "@/lib/data/vendors";
import { cn } from "@/lib/utils";

interface Props {
  models: ReadonlyArray<OpenRouterModel>;
}

type SortKey = "vendor" | "context" | "prompt" | "completion" | "modality" | "updated";

const SORT_HEADERS: Array<{ id: SortKey; label: string; align?: "right" }> = [
  { id: "vendor", label: "Vendor" },
  { id: "context", label: "Context", align: "right" },
  { id: "prompt", label: "In $/Mtok", align: "right" },
  { id: "completion", label: "Out $/Mtok", align: "right" },
  { id: "modality", label: "Modality" },
  { id: "updated", label: "Updated" },
];

const PRICE_MAX: Record<string, number> = { free: 0, "1": 1, "5": 5, "20": 20 };
const CTX_MIN: Record<string, number> = { "32": 32, "128": 128, "1m": 1000 };

export function PulseTable({ models }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const vendor = sp.get("vendor") ?? "";
  const modality = sp.get("modality") ?? "";
  const priceMax = sp.get("priceMax") ?? "";
  const minContext = sp.get("minContext") ?? "";
  const sort = (sp.get("sort") as SortKey | null) ?? "prompt";
  const dir = (sp.get("dir") as "asc" | "desc" | null) ?? "asc";

  const filtered = useMemo(() => {
    return models.filter((m) => {
      if (vendor && m.vendor !== vendor) return false;
      if (modality && m.modality !== modality) return false;
      if (priceMax) {
        const cap = PRICE_MAX[priceMax];
        if (cap === undefined) return true;
        if (cap === 0) {
          if ((m.promptUSDPerMtok ?? 1) > 0) return false;
        } else if ((m.promptUSDPerMtok ?? Infinity) >= cap) return false;
      }
      if (minContext) {
        const min = CTX_MIN[minContext] ?? 0;
        if ((m.contextK ?? 0) < min) return false;
      }
      return true;
    });
  }, [models, vendor, modality, priceMax, minContext]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) => compareBy(a, b, sort) * (dir === "asc" ? 1 : -1));
    return arr;
  }, [filtered, sort, dir]);

  const onHeaderClick = (key: SortKey) => {
    const nextDir = sort === key ? (dir === "asc" ? "desc" : "asc") : "asc";
    const next = new URLSearchParams(sp.toString());
    next.set("sort", key);
    next.set("dir", nextDir);
    router.replace(`/pulse?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="overflow-x-auto border-y border-[var(--rule)]">
      <table className="tnum w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--rule)] text-left">
            <th className="mono py-2 pl-3 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
              Model
            </th>
            {SORT_HEADERS.map((h) => (
              <th
                key={h.id}
                className={cn(
                  "mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]",
                  h.align === "right" && "text-right",
                )}
              >
                <button
                  type="button"
                  onClick={() => onHeaderClick(h.id)}
                  className={cn(
                    "inline-flex items-center gap-1 hover:text-[var(--foreground)]",
                    sort === h.id && "text-[var(--foreground)]",
                  )}
                >
                  {h.label}
                  {sort === h.id && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-sm text-[var(--mute)]">
                No models match those filters.
              </td>
            </tr>
          ) : (
            sorted.map((m) => (
              <tr key={m.id} className="border-b border-[var(--rule)]/60">
                <td className="mono py-2 pl-3 pr-4">
                  <span className="font-medium">{m.displayName}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-widest text-[var(--mute)]">
                    {m.id}
                  </span>
                </td>
                <td className="mono py-2 pr-4 text-xs uppercase tracking-widest text-[var(--mute)]">
                  {vendorLabel(m.vendor)}
                </td>
                <td className="mono py-2 pr-4 text-right">
                  {m.contextK ? formatK(m.contextK) : "—"}
                </td>
                <td className="mono py-2 pr-4 text-right">
                  {fmtPrice(m.promptUSDPerMtok)}
                </td>
                <td className="mono py-2 pr-4 text-right">
                  {fmtPrice(m.completionUSDPerMtok)}
                </td>
                <td className="mono py-2 pr-4 text-xs uppercase tracking-widest">
                  {m.modality}
                </td>
                <td className="mono py-2 pr-3 text-xs text-[var(--mute)]">
                  {m.createdAt ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function compareBy(a: OpenRouterModel, b: OpenRouterModel, key: SortKey): number {
  switch (key) {
    case "vendor":
      return a.vendor.localeCompare(b.vendor);
    case "context":
      return (a.contextK ?? -1) - (b.contextK ?? -1);
    case "prompt":
      return (a.promptUSDPerMtok ?? Infinity) - (b.promptUSDPerMtok ?? Infinity);
    case "completion":
      return (a.completionUSDPerMtok ?? Infinity) - (b.completionUSDPerMtok ?? Infinity);
    case "modality":
      return a.modality.localeCompare(b.modality);
    case "updated":
      return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
  }
}

function fmtPrice(n: number | null): string {
  if (n == null) return "—";
  if (n === 0) return "free";
  if (n < 1) return n.toFixed(2);
  return n.toFixed(2);
}

function formatK(k: number): string {
  if (k >= 1000) return `${(k / 1000).toFixed(1)}M`;
  return `${k}k`;
}
