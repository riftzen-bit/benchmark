import { PROMPTS } from "@/lib/data/prompts";
import { PLAYGROUNDS } from "@/lib/data/playgrounds";
import { PromptCard } from "@/components/prompt/prompt-card";
import type { PlaygroundCost } from "@/lib/schema/prompt";

const COST_LABEL: Record<PlaygroundCost, string> = {
  "free-no-account": "Free, no account",
  "free-with-account": "Free, signup required",
  subscription: "Subscription",
  "pay-as-you-go": "Pay per token",
};

export const metadata = {
  title: "Try the prompts — Opus 4.7 vs GPT-5.5",
};

export default function TestYourselfPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <header className="mb-12 max-w-[65ch]">
        <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          Try it yourself
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">
          Test the models with the same prompts we used
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[var(--mute)]">
          Copy a prompt, open one of the playgrounds below, paste, and compare the answers
          yourself. This site does not call the models for you and does not store your prompts.
        </p>
        <div className="mt-6 rounded-none border border-[var(--rule)] bg-[var(--rule)]/30 p-4 text-sm leading-relaxed">
          <p className="font-medium">Honest note about access</p>
          <p className="mt-2 text-[var(--mute)]">
            No fully free playground gives reliable access to both Opus 4.7 and GPT-5.5 at the
            top tier. Arena&apos;s Battle Mode pairs anonymous models randomly. Claude Pro
            ($20/month) is the most reliable way to reach Opus 4.7. ChatGPT Plus ($20/month)
            for GPT-5.5. Pay-as-you-go API keys cost cents per prompt and don&apos;t require
            a subscription.
          </p>
        </div>
      </header>

      <section className="mb-16 border-t border-[var(--rule)] pt-10">
        <header className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-medium tracking-tight">Where to run them</h2>
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            {PLAYGROUNDS.length} playgrounds
          </p>
        </header>
        <ul className="grid gap-4 md:grid-cols-2">
          {PLAYGROUNDS.map((p) => (
            <li
              key={p.id}
              className="border border-[var(--rule)] p-5 transition-colors hover:border-[var(--foreground)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium tracking-tight underline decoration-[var(--rule)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  {p.label} ↗
                </a>
                <span
                  className={`mono shrink-0 text-[10px] uppercase tracking-widest ${
                    p.cost === "free-no-account"
                      ? "text-[var(--accent)]"
                      : "text-[var(--mute)]"
                  }`}
                >
                  {COST_LABEL[p.cost]}
                </span>
              </div>
              <p className="mt-2 text-sm">{p.models}</p>
              {p.note ? (
                <p className="mt-2 text-sm leading-relaxed text-[var(--mute)]">{p.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-[var(--rule)] pt-10">
        <header className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-medium tracking-tight">The prompts</h2>
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            {PROMPTS.length} prompts
          </p>
        </header>
        {PROMPTS.map((p) => (
          <PromptCard key={p.id} prompt={p} />
        ))}
      </section>
    </div>
  );
}
