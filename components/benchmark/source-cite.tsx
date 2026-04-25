import { sourceById } from "@/lib/data/sources";

export function SourceCite({ ids }: { ids: ReadonlyArray<string> }) {
  const resolved = ids
    .map((id) => sourceById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  if (resolved.length === 0) return null;
  return (
    <span className="ml-1.5 inline-flex items-baseline gap-0.5 align-super mono text-[11px]">
      {resolved.map((s, i) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--mute)] underline decoration-[var(--rule)] decoration-1 underline-offset-2 transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
          title={`${s.publisher} — ${s.label}`}
        >
          [{i + 1}]
        </a>
      ))}
    </span>
  );
}
