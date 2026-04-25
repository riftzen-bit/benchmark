import type { Prompt } from "@/lib/schema/prompt";
import { playgroundById } from "@/lib/data/playgrounds";
import { CopyButton } from "./copy-button";
import { PlaygroundLink } from "./playground-link";
import { PromptMeta } from "./prompt-meta";
import { PromptBody } from "./prompt-body";
import { WatchList } from "./watch-list";
import { Eyebrow } from "@/components/shared/eyebrow";

export function PromptCard({ prompt }: { prompt: Prompt }) {
  return (
    <article className="border-t border-[var(--rule)] py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PromptMeta category={prompt.category} difficulty={prompt.difficulty} />
        <CopyButton text={prompt.body} />
      </div>

      <h3 className="display mt-4 text-2xl tracking-tight md:text-3xl">{prompt.title}</h3>

      <div className="mt-5">
        <PromptBody>{prompt.body}</PromptBody>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[7fr_5fr]">
        <WatchList items={prompt.watchFor} />

        <div>
          <Eyebrow>Open in</Eyebrow>
          <div className="mt-3 flex flex-wrap gap-2">
            {prompt.playgroundIds.map((id) => {
              const pg = playgroundById(id);
              if (!pg) return null;
              return <PlaygroundLink key={id} p={pg} />;
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
