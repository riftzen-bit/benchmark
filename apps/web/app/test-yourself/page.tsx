import { PROMPTS } from "@/lib/data/prompts";
import { PLAYGROUNDS } from "@/lib/data/playgrounds";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { PromptCard } from "@/components/prompt/prompt-card";
import { PlaygroundGrid } from "@/components/prompt/playground-grid";

export const metadata = {
  title: "Run it. Opus 4.7 vs GPT-5.5",
};

export default function TestYourselfPage() {
  return (
    <Container width="wide" className="py-16 md:py-20">
      {/* Page header */}
      <header className="max-w-[70ch]">
        <Eyebrow>Run it · Issue 04.25</Eyebrow>
        <h1 className="display mt-4 text-4xl tracking-tight md:text-5xl">
          Same prompts. Two models. Your eyes.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-[var(--mute)] md:text-lg">
          Copy a prompt, open a playground, paste it in both models, and compare the answers
          yourself. This site does not call either model for you and does not store your prompts.
        </p>

        {/* Honest note callout */}
        <aside className="mt-8 border border-[var(--rule)] p-5">
          <p className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
            Honest note
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            No fully free playground gives reliable access to both Opus 4.7 and GPT-5.5.
            LMArena Battle Mode pairs anonymous models at random; you may need several
            refreshes. Claude Pro ($20/month) is the most reliable path to Opus 4.7.
            ChatGPT Plus ($20/month) for GPT-5.5. Pay-as-you-go API keys cost a few cents
            per prompt and need no subscription.
          </p>
        </aside>
      </header>

      <Rule weight="hair" className="mt-16" />

      {/* Playgrounds section */}
      <section className="pt-10">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <Eyebrow>Where to run them</Eyebrow>
            <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
              {PLAYGROUNDS.length === 7 ? "Seven" : PLAYGROUNDS.length} public playgrounds
            </h2>
          </div>
        </div>
        <PlaygroundGrid />
      </section>

      <Rule weight="hair" className="mt-16" />

      {/* Prompts section */}
      <section className="pt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <Eyebrow>The prompts</Eyebrow>
            <h2 className="display mt-3 text-3xl tracking-tight md:text-4xl">
              {PROMPTS.length === 10 ? "Ten" : PROMPTS.length} prompts
            </h2>
          </div>
        </div>
        {PROMPTS.map((p) => (
          <PromptCard key={p.id} prompt={p} />
        ))}
      </section>
    </Container>
  );
}
