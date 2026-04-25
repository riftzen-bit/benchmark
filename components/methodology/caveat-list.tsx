interface CaveatItem {
  title?: string;
  body: string;
}

interface Props {
  items: CaveatItem[];
}

export function CaveatList({ items }: Props) {
  return (
    <ol role="list" className="mt-2">
      {items.map((item, index) => (
        <li
          key={index}
          className={`flex gap-6 py-5${index > 0 ? " border-t border-[var(--rule)]" : ""}`}
        >
          <span className="mono tnum shrink-0 text-2xl leading-tight text-[var(--accent)]" aria-hidden>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="pt-0.5">
            {item.title != null && (
              <p className="mb-1 text-sm font-medium text-[var(--foreground)]">{item.title}</p>
            )}
            <p className="text-base leading-relaxed text-[var(--mute)]">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
