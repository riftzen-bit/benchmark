import { sourceById } from "@/lib/data/sources";

export function SourceCite({ ids }: { ids: ReadonlyArray<string> }) {
  const resolved = ids
    .map((id) => sourceById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  if (resolved.length === 0) return null;
  return (
    <span className="ml-1 align-super font-mono text-[10px] text-[var(--mute)]">
      {resolved.map((s, i) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--accent)]"
          title={`${s.publisher} — ${s.label}`}
        >
          [{i + 1}]
        </a>
      ))}
    </span>
  );
}
