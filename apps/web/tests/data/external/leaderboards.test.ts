import { afterEach, describe, expect, it, vi } from "vitest";
import { loadLeaderboardSnapshot } from "@/lib/data/external/leaderboards";
import * as lmarena from "@/lib/data/external/lmarena";
import * as openllm from "@/lib/data/external/open-llm";
import * as livebench from "@/lib/data/external/livebench";

describe("loadLeaderboardSnapshot", () => {
  afterEach(() => vi.restoreAllMocks());

  it("merges live results across all three sources", async () => {
    vi.spyOn(lmarena, "fetchLmArenaLeaderboard").mockResolvedValue([
      { rank: 1, model: "x", score: 1400, ciLabel: null, votes: 0, organization: "X", license: null },
    ] as never);
    vi.spyOn(openllm, "fetchOpenLlmLeaderboard").mockResolvedValue([
      { rank: 1, model: "y", average: 60, scores: { ifeval: null, bbh: null, math: null, gpqa: null, musr: null, mmluPro: null } },
    ] as never);
    vi.spyOn(livebench, "fetchLiveBench").mockResolvedValue([
      { rank: 1, model: "z", global: 70, coding: null, math: null, reasoning: null, language: null, dataAnalysis: null, ifAvg: null },
    ] as never);

    const snap = await loadLeaderboardSnapshot();
    expect(snap.arena.length).toBe(1);
    expect(snap.openLlm.length).toBe(1);
    expect(snap.liveBench.length).toBe(1);
    expect(snap.sources).toEqual({ arena: "live", openLlm: "live", liveBench: "live" });
    expect(snap.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("marks individual sources as fallback when their fetcher rejects", async () => {
    vi.spyOn(lmarena, "fetchLmArenaLeaderboard").mockRejectedValue(new Error("x"));
    vi.spyOn(openllm, "fetchOpenLlmLeaderboard").mockResolvedValue([
      { rank: 1, model: "y", average: 60, scores: { ifeval: null, bbh: null, math: null, gpqa: null, musr: null, mmluPro: null } },
    ] as never);
    vi.spyOn(livebench, "fetchLiveBench").mockRejectedValue(new Error("x"));

    const snap = await loadLeaderboardSnapshot();
    expect(snap.sources.arena).toBe("fallback");
    expect(snap.sources.openLlm).toBe("live");
    expect(snap.sources.liveBench).toBe("fallback");
    expect(snap.arena.length).toBeGreaterThan(0);
    expect(snap.liveBench.length).toBeGreaterThan(0);
  });
});
