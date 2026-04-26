import type { ReactNode } from "react";

export function Pitch({ children, maxWidth = 320 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <p
      className="text-[14px] leading-[1.4] text-[var(--cream-mute)] md:text-[15px]"
      style={{ maxWidth }}
    >
      {children}
    </p>
  );
}
