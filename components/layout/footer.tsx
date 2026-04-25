import { SITE_META } from "@/lib/data/meta";
import { SOURCES } from "@/lib/data/sources";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--rule)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Last updated
            </p>
            <p className="mt-2 mono text-sm">{SITE_META.lastUpdated}</p>
          </div>
          <div>
            <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Sources
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {SOURCES.map((s) => (
                <li key={s.id}>
                  <a
                    className="underline decoration-[var(--rule)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.publisher} — {s.label.replace(`${s.publisher} — `, "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
              About this site
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--mute)]">
              All numbers are public figures published by the model vendors or by reputable
              third-party analysts. This site does not call the models — it links you out to
              public playgrounds where you can test the prompts yourself.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
