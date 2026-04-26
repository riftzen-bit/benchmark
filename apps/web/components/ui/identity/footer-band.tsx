import type { ReactNode } from "react";

export function FooterBand({
  left,
  mid,
  right,
}: {
  left: ReactNode;
  mid: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 border-t border-[var(--rule)] md:grid-cols-[2fr_1fr_1fr]">
      <div className="px-8 py-7">{left}</div>
      <div className="border-t border-[var(--rule)] px-8 py-7 md:border-l md:border-t-0">{mid}</div>
      <div className="border-t border-[var(--rule)] px-8 py-7 md:border-l md:border-t-0">{right}</div>
    </div>
  );
}
