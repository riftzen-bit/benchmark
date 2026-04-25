import type { TrendingHFModel } from "@/lib/data/external/huggingface";

interface Props {
  models: ReadonlyArray<TrendingHFModel>;
}

const NF = new Intl.NumberFormat("en-US");

function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return NF.format(n);
}

export function TrendingModels({ models }: Props) {
  if (models.length === 0) {
    return (
      <p className="text-sm text-[var(--mute)]">
        Trending feed unavailable. Check huggingface.co/models?sort=trending.
      </p>
    );
  }
  return (
    <ol className="grid grid-cols-1 gap-px bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">
      {models.map((m, i) => (
        <li key={m.id}>
          <a
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block h-full bg-[var(--background)] p-4 transition-colors hover:bg-[var(--foreground)]/[0.03]"
          >
            <div className="mono flex items-baseline justify-between text-[10px] uppercase tracking-widest text-[var(--mute)]">
              <span>#{String(i + 1).padStart(2, "0")}</span>
              {m.org && <span className="truncate">{m.org}</span>}
            </div>
            <p className="mono mt-2 truncate text-sm font-medium tracking-tight transition-colors group-hover:text-[var(--accent)]">
              {m.name}
            </p>
            {m.pipeline && (
              <p className="mono mt-1 text-[10px] uppercase tracking-widest text-[var(--mute)]">
                {m.pipeline}
              </p>
            )}
            <dl className="mono mt-4 grid grid-cols-3 gap-2 text-[11px] tabular-nums">
              <div>
                <dt className="text-[9px] uppercase tracking-widest text-[var(--mute)]">DL</dt>
                <dd>{compactNumber(m.downloads)}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-widest text-[var(--mute)]">Likes</dt>
                <dd>{compactNumber(m.likes)}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-widest text-[var(--mute)]">
                  Heat
                </dt>
                <dd className="text-[var(--accent)]">
                  {m.trendingScore.toFixed(0)}
                </dd>
              </div>
            </dl>
          </a>
        </li>
      ))}
    </ol>
  );
}
