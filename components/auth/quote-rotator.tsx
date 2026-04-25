"use client";
import { useEffect, useState } from "react";

interface Quote {
  text: string;
  by: string;
}

export function QuoteRotator({ items }: { items: ReadonlyArray<Quote> }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(
      () => setI((n) => (n + 1) % items.length),
      6000,
    );
    return () => clearInterval(id);
  }, [items.length]);
  const q = items[i] ?? items[0];
  if (!q) return null;
  return (
    <figure className="grid gap-3" aria-live="polite">
      <blockquote
        key={i}
        className="fade-up display text-balance text-lg leading-snug text-[var(--foreground)] md:text-xl"
      >
        &ldquo;{q.text}&rdquo;
      </blockquote>
      <figcaption className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
        — {q.by}
      </figcaption>
      <div className="flex gap-1.5" role="tablist" aria-label="Quote selector">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={idx === i}
            aria-label={`Quote ${idx + 1}`}
            onClick={() => setI(idx)}
            className={
              idx === i
                ? "h-1 w-6 bg-[var(--foreground)] transition-colors"
                : "h-1 w-6 bg-[var(--rule)] transition-colors hover:bg-[var(--mute)]"
            }
          />
        ))}
      </div>
    </figure>
  );
}
