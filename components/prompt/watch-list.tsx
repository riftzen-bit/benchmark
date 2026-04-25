import { Eyebrow } from "@/components/shared/eyebrow";

export function WatchList({ items }: { items: readonly string[] }) {
  return (
    <div>
      <Eyebrow>What to look for</Eyebrow>
      <ol className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mono shrink-0 text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[var(--mute)]">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
