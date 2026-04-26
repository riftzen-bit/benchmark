"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { vendorLabel } from "@/lib/data/vendors";
import { cn } from "@/lib/utils";

interface Props {
  vendors: ReadonlyArray<string>;
}

const PRICE_TIERS: Array<{ id: string; label: string; max: number }> = [
  { id: "free", label: "free", max: 0 },
  { id: "1", label: "<$1", max: 1 },
  { id: "5", label: "<$5", max: 5 },
  { id: "20", label: "<$20", max: 20 },
];

const CTX_TIERS: Array<{ id: string; label: string; min: number }> = [
  { id: "32", label: "32k+", min: 32 },
  { id: "128", label: "128k+", min: 128 },
  { id: "1m", label: "1M+", min: 1000 },
];

export function PulseFilters({ vendors }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
      router.replace(`/pulse?${next.toString()}`, { scroll: false });
    },
    [router, sp],
  );

  const vendor = sp.get("vendor") ?? "";
  const modality = sp.get("modality") ?? "";
  const priceMax = sp.get("priceMax") ?? "";
  const minContext = sp.get("minContext") ?? "";

  return (
    <div className="grid gap-4 border border-[var(--rule)] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Label>Vendor</Label>
        <select
          value={vendor}
          onChange={(e) => setParam("vendor", e.target.value || null)}
          className="mono border border-[var(--rule)] bg-transparent px-2 py-1 text-xs"
        >
          <option value="">all ({vendors.length})</option>
          {vendors.map((v) => (
            <option key={v} value={v}>
              {vendorLabel(v)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label>Modality</Label>
        <ChipGroup
          value={modality}
          options={[
            { id: "", label: "all" },
            { id: "text", label: "text" },
            { id: "multimodal", label: "multimodal" },
          ]}
          onChange={(v) => setParam("modality", v || null)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label>Prompt $/Mtok</Label>
        <ChipGroup
          value={priceMax}
          options={[{ id: "", label: "any" }, ...PRICE_TIERS.map((t) => ({ id: t.id, label: t.label }))]}
          onChange={(v) => setParam("priceMax", v || null)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label>Context</Label>
        <ChipGroup
          value={minContext}
          options={[{ id: "", label: "any" }, ...CTX_TIERS.map((t) => ({ id: t.id, label: t.label }))]}
          onChange={(v) => setParam("minContext", v || null)}
        />
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono w-28 text-[10px] uppercase tracking-widest text-[var(--mute)]">
      {children}
    </span>
  );
}

function ChipGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: ReadonlyArray<{ id: string; label: string }>;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id || "all"}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "mono border px-2 py-1 text-[11px] uppercase tracking-widest transition-colors",
              active
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                : "border-[var(--rule)] text-[var(--mute)] hover:text-[var(--foreground)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
