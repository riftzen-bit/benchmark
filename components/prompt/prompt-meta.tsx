import type { PromptCategory, PromptDifficulty } from "@/lib/schema/prompt";
import { Eyebrow } from "@/components/shared/eyebrow";
import { DifficultyPill } from "./difficulty-pill";

interface Props {
  category: PromptCategory;
  difficulty: PromptDifficulty;
}

export function PromptMeta({ category, difficulty }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Eyebrow>
        {category} · {difficulty}
      </Eyebrow>
      <DifficultyPill difficulty={difficulty} />
    </div>
  );
}
