import { Suspense } from "react";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Rule } from "@/components/shared/rule";
import { RelativeTime } from "@/components/shared/relative-time";
import { BoardTabs, type BoardKey } from "@/components/leaderboard/board-tabs";
import { ExternalBoard, type BoardRow } from "@/components/leaderboard/external-board";
import { CommunityBoard } from "@/components/leaderboard/community-board";
import { listLeaderboard } from "@/lib/db/queries/leaderboard";
import { listCategories } from "@/lib/db/queries/models";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";

export const metadata = { title: "Leaderboard" };
export const revalidate = 1800;

type Search = Promise<{ board?: string; category?: string }>;

const VALID: ReadonlyArray<BoardKey> = ["arena", "open-llm", "livebench", "community"];

export default async function LeaderboardPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const board: BoardKey = (VALID as readonly string[]).includes(sp.board ?? "")
    ? (sp.board as BoardKey)
    : "arena";

  const [snap, communityRows, categories] = await Promise.all([
    loadLeaderboardSnapshot(),
    board === "community" ? listLeaderboard(sp.category) : Promise.resolve([]),
    board === "community" ? listCategories() : Promise.resolve([]),
  ]);

  const activeSource =
    board === "arena" ? snap.sources.arena
    : board === "open-llm" ? snap.sources.openLlm
    : board === "livebench" ? snap.sources.liveBench
    : null;

  return (
    <Container width="wide" className="py-12 md:py-16">
      <header className="mb-8 grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-end">
        <div>
          <Eyebrow>Leaderboards · issue 04.25</Eyebrow>
          <h1 className="display mt-3 text-4xl tracking-tight md:text-6xl">
            Four boards. One shelf.
          </h1>
        </div>
        <p className="max-w-prose text-sm text-[var(--mute)]">
          Public benchmark rankings pulled live from LMSYS Arena, HF Open LLM v2, and
          LiveBench, plus this site&apos;s own community runs. Refreshes every 30 min via ISR.
          Last fetched <RelativeTime iso={snap.updatedAt} className="mono" />.
          {activeSource && (
            <>
              {" "}
              <SourceBadge label={board} status={activeSource} />
            </>
          )}
        </p>
      </header>

      <BoardTabs active={board} />

      <Rule weight="hair" className="my-8" />

      <Suspense fallback={null}>
        {board === "arena" && (
          <ExternalBoard
            basePath="/leaderboard"
            primaryLabel="Arena ELO"
            primaryFormat="round"
            rows={snap.arena.map<BoardRow>((e) => ({
              rank: e.rank,
              modelId: e.model,
              label: e.model,
              meta: e.organization || null,
              primary: e.score,
              secondary: [
                { key: "ci", label: "95% CI", value: e.ciLabel },
                { key: "votes", label: "Votes", value: e.votes },
              ],
            }))}
          />
        )}
        {board === "open-llm" && (
          <ExternalBoard
            basePath="/leaderboard"
            primaryLabel="Average"
            rows={snap.openLlm.map<BoardRow>((e) => ({
              rank: e.rank,
              modelId: e.model,
              label: e.model,
              meta: null,
              primary: e.average,
              secondary: [
                { key: "ifeval", label: "IFEval", value: e.scores.ifeval },
                { key: "bbh", label: "BBH", value: e.scores.bbh },
                { key: "math", label: "MATH", value: e.scores.math },
                { key: "gpqa", label: "GPQA", value: e.scores.gpqa },
                { key: "musr", label: "MUSR", value: e.scores.musr },
                { key: "mmlu", label: "MMLU-PRO", value: e.scores.mmluPro },
              ],
            }))}
          />
        )}
        {board === "livebench" && (
          <ExternalBoard
            basePath="/leaderboard"
            primaryLabel="Global"
            rows={snap.liveBench.map<BoardRow>((e) => ({
              rank: e.rank,
              modelId: e.model,
              label: e.model,
              meta: null,
              primary: e.global,
              secondary: [
                { key: "coding", label: "Coding", value: e.coding },
                { key: "math", label: "Math", value: e.math },
                { key: "reasoning", label: "Reasoning", value: e.reasoning },
                { key: "language", label: "Language", value: e.language },
                { key: "data", label: "Data", value: e.dataAnalysis },
                { key: "if", label: "IF", value: e.ifAvg },
              ],
            }))}
          />
        )}
        {board === "community" && (
          <CommunityBoard rows={communityRows} categories={categories} active={sp.category ?? null} />
        )}
      </Suspense>
    </Container>
  );
}

function SourceBadge({ label, status }: { label: string; status: "live" | "fallback" }) {
  return (
    <span
      className={
        "mono inline-block border px-1.5 py-0.5 text-[10px] uppercase tracking-widest " +
        (status === "live"
          ? "border-[var(--pos)]/60 text-[var(--pos)]"
          : "border-[var(--mute)]/60 text-[var(--mute)]")
      }
    >
      {label}: {status === "live" ? "live" : "cached"}
    </span>
  );
}
