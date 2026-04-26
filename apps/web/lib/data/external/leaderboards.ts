import { fetchLmArenaLeaderboard, LMARENA_FALLBACK, type LmArenaEntry } from "./lmarena";
import { fetchOpenLlmLeaderboard, OPEN_LLM_FALLBACK, type OpenLlmEntry } from "./open-llm";
import { fetchLiveBench, LIVEBENCH_FALLBACK, type LiveBenchEntry } from "./livebench";

export type SourceStatus = "live" | "fallback";

export interface LeaderboardSnapshot {
  arena: ReadonlyArray<LmArenaEntry>;
  openLlm: ReadonlyArray<OpenLlmEntry>;
  liveBench: ReadonlyArray<LiveBenchEntry>;
  updatedAt: string;
  sources: { arena: SourceStatus; openLlm: SourceStatus; liveBench: SourceStatus };
}

export async function loadLeaderboardSnapshot(): Promise<LeaderboardSnapshot> {
  const [arenaR, openLlmR, liveBenchR] = await Promise.allSettled([
    fetchLmArenaLeaderboard({ limit: 60 }),
    fetchOpenLlmLeaderboard({ limit: 60 }),
    fetchLiveBench({ limit: 60 }),
  ]);

  const arena = pick(arenaR, LMARENA_FALLBACK);
  const openLlm = pick(openLlmR, OPEN_LLM_FALLBACK);
  const liveBench = pick(liveBenchR, LIVEBENCH_FALLBACK);

  return {
    arena: arena.entries,
    openLlm: openLlm.entries,
    liveBench: liveBench.entries,
    updatedAt: new Date().toISOString(),
    sources: {
      arena: arena.status,
      openLlm: openLlm.status,
      liveBench: liveBench.status,
    },
  };
}

function pick<T>(
  r: PromiseSettledResult<ReadonlyArray<T>>,
  fallback: ReadonlyArray<T>,
): { entries: ReadonlyArray<T>; status: SourceStatus } {
  if (r.status === "fulfilled" && r.value.length > 0) {
    return { entries: r.value, status: "live" };
  }
  return { entries: fallback, status: "fallback" };
}
