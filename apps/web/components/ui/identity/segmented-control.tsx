"use client";

import { cn } from "@/lib/utils";

export type SegOption<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex">
      {options.map((o, i) => {
        const active = o.value === value;
        const first = i === 0;
        const last = i === options.length - 1;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "mono cursor-pointer border border-[var(--rule)] px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors",
              first && "rounded-l-full pl-[18px]",
              last && "rounded-r-full pr-[18px]",
              !first && "border-l-0",
              active
                ? "border-[var(--cream)] bg-[var(--cream)] text-[var(--paper)]"
                : "bg-transparent text-[var(--cream-mute)] hover:text-[var(--cream)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
