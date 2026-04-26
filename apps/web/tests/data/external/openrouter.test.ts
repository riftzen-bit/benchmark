import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchOpenRouterModels,
  OPENROUTER_FALLBACK,
} from "@/lib/data/external/openrouter";

describe("fetchOpenRouterModels", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the curated fallback when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await fetchOpenRouterModels({ limit: 4 });
    expect(out.length).toBe(4);
    expect(out[0]?.id).toBe(OPENROUTER_FALLBACK[0]?.id);
  });

  it("returns the fallback when the response is not data-array shaped", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ error: "rate-limited" }),
        } as Response),
      ),
    );
    const out = await fetchOpenRouterModels({ limit: 3 });
    expect(out.length).toBe(3);
    expect(out[0]?.id).toBe(OPENROUTER_FALLBACK[0]?.id);
  });

  it("parses well-formed entries and converts pricing to USD per Mtok", async () => {
    const sample = {
      data: [
        {
          id: "openai/gpt-5.5",
          name: "OpenAI: GPT-5.5",
          context_length: 1050000,
          created: 1777051893,
          architecture: {
            modality: "text+image->text",
            input_modalities: ["image", "text"],
            output_modalities: ["text"],
          },
          pricing: { prompt: "0.000005", completion: "0.00003" },
        },
        {
          id: "deepseek/deepseek-v4-flash",
          name: "DeepSeek: DeepSeek V4 Flash",
          context_length: 131072,
          created: 1777000666,
          architecture: {
            modality: "text->text",
            input_modalities: ["text"],
            output_modalities: ["text"],
          },
          pricing: { prompt: "0.0000001", completion: "0.0000003" },
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: true, json: async () => sample } as Response),
      ),
    );
    const out = await fetchOpenRouterModels({ limit: 5 });
    expect(out.length).toBe(2);
    expect(out[0]).toMatchObject({
      id: "openai/gpt-5.5",
      vendor: "openai",
      contextK: 1050,
      promptUSDPerMtok: 5,
      completionUSDPerMtok: 30,
      modality: "multimodal",
    });
    expect(out[1]).toMatchObject({
      id: "deepseek/deepseek-v4-flash",
      vendor: "deepseek",
      contextK: 131,
      promptUSDPerMtok: 0.1,
      completionUSDPerMtok: 0.3,
      modality: "text",
    });
  });

  it("falls back when every entry fails Zod validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ data: [{ no_id: true }, { also_bogus: 1 }] }),
        } as Response),
      ),
    );
    const out = await fetchOpenRouterModels({ limit: 2 });
    expect(out[0]?.id).toBe(OPENROUTER_FALLBACK[0]?.id);
  });

  it("clamps the limit to [1, 500]", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const tiny = await fetchOpenRouterModels({ limit: 0 });
    const big = await fetchOpenRouterModels({ limit: 9999 });
    expect(tiny.length).toBe(1);
    expect(big.length).toBe(OPENROUTER_FALLBACK.length);
  });
});
