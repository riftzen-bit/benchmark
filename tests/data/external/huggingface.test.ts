import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTrendingHFModels, TRENDING_FALLBACK } from "@/lib/data/external/huggingface";

describe("fetchTrendingHFModels", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchTrendingHFModels({ limit: 4 });
    expect(out.length).toBe(4);
    expect(out[0]?.id).toBe(TRENDING_FALLBACK[0]?.id);
  });

  it("returns the fallback when the response is not JSON-array shaped", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ error: "rate-limited" }),
        } as Response),
      ),
    );
    const out = await fetchTrendingHFModels({ limit: 3 });
    expect(out.length).toBe(3);
    expect(out[0]?.id).toBe(TRENDING_FALLBACK[0]?.id);
  });

  it("parses well-formed Hugging Face entries and computes a hub URL", async () => {
    const sample = [
      {
        id: "openai/whisper-large-v3",
        pipeline_tag: "automatic-speech-recognition",
        tags: ["asr", "audio"],
        downloads: 5_000_000,
        likes: 4321,
        trendingScore: 950,
        lastModified: "2026-04-22T00:00:00Z",
      },
      {
        id: "missing-org-model",
        pipeline_tag: null,
        tags: [],
        downloads: 1,
        likes: 1,
        trendingScore: 1,
        lastModified: null,
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => sample,
        } as Response),
      ),
    );
    const out = await fetchTrendingHFModels({ limit: 5 });
    expect(out.length).toBe(2);
    expect(out[0]).toMatchObject({
      id: "openai/whisper-large-v3",
      org: "openai",
      name: "whisper-large-v3",
      url: "https://huggingface.co/openai/whisper-large-v3",
      downloads: 5_000_000,
    });
    expect(out[1]?.org).toBe("");
    expect(out[1]?.name).toBe("missing-org-model");
  });

  it("falls back when every entry fails Zod validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => [{ no_id: true }, { also_bogus: 1 }],
        } as Response),
      ),
    );
    const out = await fetchTrendingHFModels({ limit: 2 });
    expect(out[0]?.id).toBe(TRENDING_FALLBACK[0]?.id);
  });

  it("clamps the limit to [1, 50]", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    const tiny = await fetchTrendingHFModels({ limit: 0 });
    const big = await fetchTrendingHFModels({ limit: 999 });
    expect(tiny.length).toBe(1);
    expect(big.length).toBe(TRENDING_FALLBACK.length);
  });
});
