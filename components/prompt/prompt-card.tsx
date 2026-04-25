import type { Prompt } from "@/lib/schema/prompt";
import { playgroundById } from "@/lib/data/playgrounds";
import { CopyButton } from "./copy-button";
import { PlaygroundLink } from "./playground-link";

export function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <article className="border-t border-[var(--rule)] py-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            {prompt.category} · {prompt.difficulty}
          </p>
          <h3 className="mt-2 text-xl font-medium tracking-tight">{prompt.title}</h3>
        </div>
        <CopyButton text={prompt.body} />
      </header>

      <pre className="mono mt-5 max-h-80 overflow-auto whitespace-pre-wrap break-words border border-[var(--rule)] bg-[var(--background)] p-4 text-sm leading-relaxed">
        {prompt.body}
      </pre>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div>
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            Cần quan sát
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {prompt.watchFor.map((w) => (
              <li key={w} className="text-[var(--mute)]">— {w}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
            Mở ở playground
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {prompt.playgroundIds.map((id) => {
              const p = playgroundById(id);
              if (!p) return null;
              return <PlaygroundLink key={id} p={p} />;
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
