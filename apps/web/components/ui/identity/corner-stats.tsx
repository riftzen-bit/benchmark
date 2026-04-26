import type { ReactNode } from "react";

export function CornerStats({ slot, children }: { slot: "left" | "right"; children: ReactNode }) {
  return (
    <div
      className={
        "mono absolute top-[18px] z-10 text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)] " +
        (slot === "left" ? "left-7" : "right-7 text-right")
      }
    >
      {children}
    </div>
  );
}
