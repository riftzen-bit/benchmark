import { listVisibleModels } from "@/lib/db/queries/models";
import { vendorLabel, VENDOR_BY_ID } from "@/lib/data/vendors";

type Row = { id: string; vendor: string; released_at: string | null };

function pickLatestPerVendor(rows: Row[], cap = 16): Row[] {
  const best = new Map<string, Row>();
  for (const r of rows) {
    const cur = best.get(r.vendor);
    const aDate = r.released_at ?? "";
    const bDate = cur?.released_at ?? "";
    if (!cur || aDate > bDate) best.set(r.vendor, r);
  }
  return [...best.values()]
    .sort((a, b) => (b.released_at ?? "").localeCompare(a.released_at ?? ""))
    .slice(0, cap);
}

export async function ReleaseTape() {
  const models = await listVisibleModels().catch(() => [] as Row[]);
  const items = pickLatestPerVendor(models);
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div
      role="region"
      aria-label="Latest model releases per vendor"
      className="border-b border-[var(--rule)] bg-[var(--foreground)]/[0.025]"
    >
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee-slow py-1.5 hover:[animation-play-state:paused] motion-reduce:!animate-none">
          {doubled.map((m, i) => {
            const v = VENDOR_BY_ID[m.vendor];
            return (
              <span
                key={`${m.id}-${i}`}
                className="mono inline-flex items-center gap-2 px-5 text-[10px] whitespace-nowrap"
                aria-hidden={i >= items.length}
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5"
                  style={{ background: v?.swatch ?? "#999" }}
                />
                <span className="uppercase tracking-widest text-[var(--mute)]">
                  {vendorLabel(m.vendor)}
                </span>
                <span>{m.id}</span>
                <span className="text-[var(--mute)]">
                  {m.released_at ? `@ ${m.released_at}` : ""}
                </span>
                <span aria-hidden className="text-[var(--rule)]">|</span>
              </span>
            );
          })}
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[var(--background)] to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--background)] to-transparent"
        />
      </div>
    </div>
  );
}
