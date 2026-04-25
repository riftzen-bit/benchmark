import { ModelDot } from "@/components/shared/model-mark";

export function BoardLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2">
      <span className="mono flex items-center gap-1.5 text-[11px] text-[var(--mute)]">
        <ModelDot model="opus" />
        Opus 4.7 (Anthropic)
      </span>
      <span className="mono flex items-center gap-1.5 text-[11px] text-[var(--mute)]">
        <ModelDot model="gpt" />
        GPT-5.5 (OpenAI)
      </span>
      <span className="mono text-[11px] text-[var(--mute)]">
        bar = relative score
      </span>
      <span className="mono text-[11px] text-[var(--mute)]">
        Δ = Opus − GPT
      </span>
      <span className="mono text-[11px] text-[var(--mute)]">
        n/a = no published number
      </span>
    </div>
  );
}
