"use client";
import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "claude-opus-4-7", label: "Claude Opus 4.7" },
  { id: "gpt-5.5", label: "GPT-5.5" },
  { id: "gpt-5.5-pro", label: "GPT-5.5 Pro" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro" },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro" },
  { id: "llama-4-405b-instruct", label: "Llama 4 405B" },
  { id: "qwen3-next-80b", label: "Qwen3 Next 80B" },
  { id: "mistral-large-2503", label: "Mistral Large" },
  { id: "grok-4", label: "Grok 4" },
];

interface Props {
  selected: ReadonlyArray<string>;
  max?: number;
}

export function ComparePicker({ selected, max = 6 }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const set = new Set(selected);

  const toggle = (id: string) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else if (next.size < max) {
      next.add(id);
    }
    if (next.size < 2) return;
    const params = new URLSearchParams(sp.toString());
    params.set("models", Array.from(next).join(","));
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const on = set.has(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={`mono border px-2 py-1 text-xs uppercase tracking-widest transition-colors ${
              on
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--background)]"
                : "border-[var(--rule)] text-[var(--mute)] hover:text-[var(--foreground)]"
            }`}
            aria-pressed={on}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
