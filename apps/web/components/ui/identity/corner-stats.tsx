import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CornerStats({ slot, children }: { slot: "left" | "right"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "mono absolute top-[18px] z-10 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]",
        slot === "left" ? "left-7" : "right-7 text-right",
      )}
    >
      {children}
    </div>
  );
}
