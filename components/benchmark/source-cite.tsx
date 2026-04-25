import { sourceById } from "@/lib/data/sources";

export function SourceCite({ ids }: { ids: ReadonlyArray<string> }) {
  return (
    <span className="ml-1 align-super font-mono text-[10px] text-[var(--mute)]">
      {ids.map((id, i) => {
        const s = sourceById(id);
        if (!s) return null;
        return (
          <a
            key={id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent)]"
            title={`${s.publisher} — ${s.label}`}
          >
            [{i + 1}]
          </a>
        );
      })}
    </span>
  );
}
