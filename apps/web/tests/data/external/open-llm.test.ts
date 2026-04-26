import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOpenLlmLeaderboard, OPEN_LLM_FALLBACK } from "@/lib/data/external/open-llm";

describe("fetchOpenLlmLeaderboard", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchOpenLlmLeaderboard({ limit: 4 });
    expect(out.length).toBe(4);
    expect(out[0]?.model).toBe(OPEN_LLM_FALLBACK[0]?.model);
  });

  it("parses rows, normalizes column variations, and ranks by Average", async () => {
    const sample = {
      rows: [
        {
          row_idx: 0,
          row: {
            fullname: "meta-llama/Llama-4-405B-Instruct",
            "Average ⬆️": 64.8,
            "IFEval": 88.4,
            "BBH": 70.2,
            "MATH Lvl 5": 51.9,
            "GPQA": 39.5,
            "MUSR": 53.1,
            "MMLU-PRO": 65.6,
          },
        },
        {
          row_idx: 1,
          row: {
            fullname: "Qwen/Qwen3-Next-80B-A3B-Instruct",
            "Average ⬆️": 62.1,
            "IFEval": 85.0,
            "BBH": 68.5,
            "MATH Lvl 5": 49.7,
            "GPQA": 36.2,
            "MUSR": 50.8,
            "MMLU-PRO": 62.5,
          },
        },
      ],
    };
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => sample } as Response),
    ));
    const out = await fetchOpenLlmLeaderboard({ limit: 5 });
    expect(out.length).toBe(2);
    expect(out[0]).toMatchObject({
      rank: 1,
      model: "meta-llama/Llama-4-405B-Instruct",
      average: 64.8,
      scores: { ifeval: 88.4, bbh: 70.2, math: 51.9, gpqa: 39.5, musr: 53.1, mmluPro: 65.6 },
    });
  });

  it("falls back when no row carries a parseable Average", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ rows: [{ row_idx: 0, row: { fullname: "x", note: "skip" } }] }),
      } as Response),
    ));
    const out = await fetchOpenLlmLeaderboard({ limit: 3 });
    expect(out[0]?.model).toBe(OPEN_LLM_FALLBACK[0]?.model);
  });
});
