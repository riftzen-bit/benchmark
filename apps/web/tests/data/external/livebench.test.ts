import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLiveBench, LIVEBENCH_FALLBACK } from "@/lib/data/external/livebench";

describe("fetchLiveBench", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchLiveBench({ limit: 4 });
    expect(out.length).toBe(4);
    expect(out[0]?.model).toBe(LIVEBENCH_FALLBACK[0]?.model);
  });

  it("parses CSV with header + rows, sorts by Global Average", async () => {
    const csv = [
      "model,Global Average,Coding Average,Mathematics Average,Reasoning Average,Language Average,Data Analysis Average,IF Average",
      "claude-opus-4-7,72.4,68.5,75.1,80.2,69.8,71.4,73.6",
      "gpt-5.5,69.8,71.2,72.8,76.4,67.5,68.9,71.5",
      "gemini-3-pro,67.5,65.4,70.2,74.1,66.0,67.1,69.8",
    ].join("\n");
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, text: async () => csv } as Response),
    ));
    const out = await fetchLiveBench({ limit: 5 });
    expect(out.length).toBe(3);
    expect(out[0]).toMatchObject({
      rank: 1,
      model: "claude-opus-4-7",
      global: 72.4,
      coding: 68.5,
    });
    expect(out[2]?.model).toBe("gemini-3-pro");
  });

  it("falls back on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false, status: 404, text: async () => "" } as Response),
    ));
    const out = await fetchLiveBench({ limit: 2 });
    expect(out[0]?.model).toBe(LIVEBENCH_FALLBACK[0]?.model);
  });

  it("falls back when no parseable rows", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, text: async () => "garbage" } as Response),
    ));
    const out = await fetchLiveBench({ limit: 2 });
    expect(out[0]?.model).toBe(LIVEBENCH_FALLBACK[0]?.model);
  });
});
