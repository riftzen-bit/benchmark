import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative min-h-[calc(100vh-32px)] overflow-hidden rounded-[20px] bg-[var(--paper)] md:rounded-[28px]">
      {children}
    </section>
  );
}
