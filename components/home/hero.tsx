import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { CtaRow } from "@/components/home/cta-row";

export function Hero() {
  return (
    <section className="py-20 md:py-28">
      {/* Asymmetric duel grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:items-center">
        {/* Left: Opus — cols 1-5 */}
        <div className="md:col-span-5">
          <Eyebrow>Anthropic · 04.16</Eyebrow>
          <p className="mono mt-1 text-xs uppercase tracking-widest text-[var(--mute)]">Claude</p>
          <p
            className="display tnum mt-1 leading-[0.85] tracking-tighter text-[var(--opus)] text-7xl md:text-9xl"
          >
            Opus<br />4.7
          </p>
        </div>

        {/* Center: vs — cols 6-7 */}
        <div className="my-8 flex items-center gap-4 md:my-0 md:col-span-2 md:flex-col md:justify-center">
          <Rule weight="hair" className="flex-1 md:hidden" />
          <p className="display italic text-3xl text-[var(--mute)]">vs</p>
          <Rule weight="hair" className="flex-1 md:hidden" />
        </div>

        {/* Right: GPT — cols 8-12 */}
        <div className="md:col-span-5 md:text-right">
          <Eyebrow className="md:justify-end">OpenAI · 04.23</Eyebrow>
          <p className="mono mt-1 text-xs uppercase tracking-widest text-[var(--mute)] md:text-right">GPT</p>
          <p
            className="display tnum mt-1 leading-[0.85] tracking-tighter text-[var(--gpt)] text-7xl md:text-right md:text-9xl"
          >
            5.5
          </p>
        </div>
      </div>

      {/* Full-width hairline */}
      <Rule weight="hair" className="mt-10 md:mt-14" />

      {/* Kicker paragraph */}
      <p className="mt-6 max-w-[64ch] text-lg leading-relaxed text-[var(--mute)] md:text-xl">
        Two frontier models. Public numbers. No spin. Every figure on this site
        is sourced from the vendor&apos;s release post, system card, or a
        reputable third-party leaderboard — with the citation linked from each
        cell.
      </p>

      {/* CTA row */}
      <div className="mt-8">
        <CtaRow />
      </div>
    </section>
  );
}
