import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPulseSnapshot } from "@/lib/data/external/pulse";
import * as openrouter from "@/lib/data/external/openrouter";
import * as huggingface from "@/lib/data/external/huggingface";

describe("loadPulseSnapshot", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("merges live HF and OR results, marking both as live", async () => {
    vi.spyOn(openrouter, "fetchOpenRouterModels").mockResolvedValue([
      {
        id: "openai/gpt-5.5",
        vendor: "openai",
        family: "gpt-5.5",
        displayName: "GPT-5.5",
        contextK: 1050,
        promptUSDPerMtok: 5,
        completionUSDPerMtok: 30,
        modality: "multimodal",
        createdAt: "2026-04-23",
      },
    ]);
    vi.spyOn(huggingface, "fetchTrendingHFModels").mockResolvedValue([
      {
        id: "Qwen/Qwen3-Next-80B-A3B-Instruct",
        org: "Qwen",
        name: "Qwen3-Next-80B-A3B-Instruct",
        pipeline: "text-generation",
        tags: [],
        downloads: 1,
        likes: 1,
        trendingScore: 1,
        lastModified: null,
        url: "https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct",
      },
    ]);

    const snap = await loadPulseSnapshot();
    expect(snap.models.length).toBe(1);
    expect(snap.hf.length).toBe(1);
    expect(snap.sources.or).toBe("live");
    expect(snap.sources.hf).toBe("live");
    expect(typeof snap.updatedAt).toBe("string");
  });

  it("marks OR fallback when fetchOpenRouterModels rejects", async () => {
    vi.spyOn(openrouter, "fetchOpenRouterModels").mockRejectedValue(new Error("boom"));
    vi.spyOn(huggingface, "fetchTrendingHFModels").mockResolvedValue([]);
    const snap = await loadPulseSnapshot();
    expect(snap.sources.or).toBe("fallback");
    expect(snap.models.length).toBe(openrouter.OPENROUTER_FALLBACK.length);
  });

  it("marks HF fallback when fetchTrendingHFModels rejects", async () => {
    vi.spyOn(openrouter, "fetchOpenRouterModels").mockResolvedValue([]);
    vi.spyOn(huggingface, "fetchTrendingHFModels").mockRejectedValue(new Error("boom"));
    const snap = await loadPulseSnapshot();
    expect(snap.sources.hf).toBe("fallback");
    expect(snap.hf.length).toBe(huggingface.TRENDING_FALLBACK.length);
  });
});
