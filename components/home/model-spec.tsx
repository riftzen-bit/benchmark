import { Eyebrow } from "@/components/shared/eyebrow";
import { SITE_META } from "@/lib/data/meta";
import { formatPrice } from "@/lib/utils/fmt";
import type { ModelKey } from "@/lib/config/site";

const TONE: Record<ModelKey, string> = {
  opus: "text-[var(--opus)]",
  gpt: "text-[var(--gpt)]",
};

function fmtK(n: number): string {
  return `${(n / 1000).toFixed(0)}k`;
}

interface Props {
  model: ModelKey;
}

export function ModelSpec({ model }: Props) {
  const m = SITE_META.models[model];
  return (
    <div className="border border-[var(--rule)] p-6">
      <Eyebrow>{m.vendor}</Eyebrow>
      <p className={["display mt-2 text-4xl leading-none", TONE[model]].join(" ")}>
        {m.name}
      </p>
      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Released">{m.releaseDate}</Row>
        <Row label="Context window">{fmtK(m.contextWindow)}</Row>
        <Row label="Max output">{m.maxOutput ? fmtK(m.maxOutput) : "—"}</Row>
        <Row label="Input price">{formatPrice(m.inputPrice)} / Mtok</Row>
        <Row label="Output price">{formatPrice(m.outputPrice)} / Mtok</Row>
        <Row label="API ID">{m.apiId}</Row>
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--rule)] pb-2 last:border-0 last:pb-0">
      <dt className="text-[var(--mute)]">{label}</dt>
      <dd className="mono tnum text-right">{children}</dd>
    </div>
  );
}
