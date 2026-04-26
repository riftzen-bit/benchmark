import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Column<R> = {
  key: string;
  header: ReactNode;
  align?: "left" | "right";
  render?: (row: R) => ReactNode;
};

export function DataTable<R>({
  columns,
  rows,
  rowKey,
}: {
  columns: Column<R>[];
  rows: R[];
  rowKey: (row: R) => string;
}) {
  return (
    <table className="mono w-full border-collapse text-[13px]">
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              className={cn(
                "border-b border-[var(--rule)] px-3.5 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cream-mute)]",
                c.align === "right" ? "text-right" : "text-left",
              )}
            >
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} className="border-b border-[var(--rule)] hover:bg-[var(--cream)]/[0.025]">
            {columns.map((c) => (
              <td
                key={c.key}
                className={cn(
                  "px-3.5 py-3 align-baseline",
                  c.align === "right" ? "text-right" : "text-left",
                )}
              >
                {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
