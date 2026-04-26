import { SOURCES } from "@/lib/data/sources";
import { Eyebrow } from "@/components/shared/eyebrow";

export function SourceList() {
  return (
    <ul role="list" className="mt-2">
      {SOURCES.map((source) => (
        <li key={source.id}>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between border-t border-[var(--rule)] py-4 transition-colors hover:bg-[var(--foreground)]/[0.02]"
          >
            <div className="flex flex-col gap-1">
              <Eyebrow>{source.publisher}</Eyebrow>
              <span className="text-base font-medium transition-colors group-hover:text-[var(--accent)] group-hover:underline decoration-[var(--accent)] underline-offset-2">
                {source.label}
              </span>
              <Eyebrow>Captured {source.capturedAt}</Eyebrow>
            </div>
            <span
              aria-hidden
              className="ml-4 shrink-0 text-base leading-none text-[var(--mute)] transition-colors group-hover:text-[var(--accent)]"
            >↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
