import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLmArenaLeaderboard, LMARENA_FALLBACK } from "@/lib/data/external/lmarena";

describe("fetchLmArenaLeaderboard", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchLmArenaLeaderboard({ limit: 5 });
    expect(out.length).toBe(5);
    expect(out[0]?.model).toBe(LMARENA_FALLBACK[0]?.model);
  });

  it("parses well-formed rows and normalizes column names", async () => {
    const sample = {
      rows: [
        {
          row_idx: 0,
          row: {
            "Model": "claude-opus-4-7",
            "Arena Score": 1455,
            "95% CI": "+4/-5",
            "Votes": 18234,
            "Organization": "Anthropic",
            "License": "Proprietary",
          },
        },
        {
          row_idx: 1,
          row: {
            "Model": "gpt-5.5",
            "Arena Score": 1438,
            "95% CI": "+3/-4",
            "Votes": 21500,
            "Organization": "OpenAI",
            "License": "Proprietary",
          },
        },
      ],
    };
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => sample } as Response),
    ));
    const out = await fetchLmArenaLeaderboard({ limit: 5 });
    expect(out.length).toBe(2);
    expect(out[0]).toMatchObject({
      rank: 1,
      model: "claude-opus-4-7",
      score: 1455,
      ciLabel: "+4/-5",
      votes: 18234,
      organization: "Anthropic",
    });
    expect(out[1]?.rank).toBe(2);
  });

  it("falls back when the response is not rows-shaped", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({ error: "x" }) } as Response),
    ));
    const out = await fetchLmArenaLeaderboard({ limit: 3 });
    expect(out[0]?.model).toBe(LMARENA_FALLBACK[0]?.model);
  });

  it("falls back on non-ok status", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false, status: 503, json: async () => ({}) } as Response),
    ));
    const out = await fetchLmArenaLeaderboard({ limit: 2 });
    expect(out.length).toBe(2);
    expect(out[0]?.model).toBe(LMARENA_FALLBACK[0]?.model);
  });
});
