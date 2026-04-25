import { z } from "zod";

const HFModelSchema = z.object({
  id: z.string().min(1),
  modelId: z.string().optional(),
  pipeline_tag: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  downloads: z.number().nullable().optional(),
  likes: z.number().nullable().optional(),
  trendingScore: z.number().nullable().optional(),
  lastModified: z.string().nullable().optional(),
});

export interface TrendingHFModel {
  id: string;
  org: string;
  name: string;
  pipeline: string | null;
  tags: ReadonlyArray<string>;
  downloads: number;
  likes: number;
  trendingScore: number;
  lastModified: string | null;
  url: string;
}

const FALLBACK: ReadonlyArray<TrendingHFModel> = Object.freeze([
  fb("Qwen/Qwen3-Next-80B-A3B-Instruct", "text-generation", 412_000, 1280, 920, "2026-04-19"),
  fb("meta-llama/Llama-4-Scout-17B-16E", "text-generation", 980_000, 2410, 815, "2026-04-15"),
  fb("deepseek-ai/DeepSeek-V3.5", "text-generation", 1_240_000, 3120, 760, "2026-04-22"),
  fb("mistralai/Mixtral-8x22B-v0.3", "text-generation", 540_000, 1850, 690, "2026-04-12"),
  fb("google/gemma-3-27b-it", "text-generation", 712_000, 1600, 640, "2026-04-09"),
  fb("microsoft/Phi-4-mini", "text-generation", 880_000, 1340, 580, "2026-04-08"),
  fb("nvidia/Nemotron-Nano-9B-v2", "text-generation", 290_000, 940, 540, "2026-04-21"),
  fb("Qwen/Qwen3-Coder-30B-Instruct", "text-generation", 360_000, 1100, 510, "2026-04-18"),
]);

function fb(
  id: string,
  pipeline: string,
  downloads: number,
  likes: number,
  score: number,
  lastModified: string,
): TrendingHFModel {
  const [org, name] = id.includes("/") ? id.split("/") : ["", id];
  return {
    id,
    org: org ?? "",
    name: name ?? id,
    pipeline,
    tags: [],
    downloads,
    likes,
    trendingScore: score,
    lastModified,
    url: `https://huggingface.co/${id}`,
  };
}

interface FetchOpts {
  limit?: number;
  pipeline?: string;
  signal?: AbortSignal;
}

export async function fetchTrendingHFModels(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<TrendingHFModel>> {
  const limit = Math.max(1, Math.min(50, opts.limit ?? 8));
  const pipeline = opts.pipeline ?? "text-generation";
  const url = new URL("https://huggingface.co/api/models");
  url.searchParams.set("sort", "trendingScore");
  url.searchParams.set("direction", "-1");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("filter", pipeline);
  url.searchParams.set(
    "config",
    "false",
  );
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4500);
    const res = await fetch(url, {
      signal: opts.signal ?? ac.signal,
      headers: { accept: "application/json" },
      next: { revalidate: 1800 },
    });
    clearTimeout(t);
    if (!res.ok) return FALLBACK.slice(0, limit);
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json)) return FALLBACK.slice(0, limit);
    const parsed: TrendingHFModel[] = [];
    for (const raw of json) {
      const r = HFModelSchema.safeParse(raw);
      if (!r.success) continue;
      const id = r.data.id;
      const [org, name] = id.includes("/") ? id.split("/") : ["", id];
      parsed.push({
        id,
        org: org ?? "",
        name: name ?? id,
        pipeline: r.data.pipeline_tag ?? null,
        tags: r.data.tags,
        downloads: r.data.downloads ?? 0,
        likes: r.data.likes ?? 0,
        trendingScore: r.data.trendingScore ?? 0,
        lastModified: r.data.lastModified ?? null,
        url: `https://huggingface.co/${id}`,
      });
    }
    if (parsed.length === 0) return FALLBACK.slice(0, limit);
    return Object.freeze(parsed.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

export const TRENDING_FALLBACK = FALLBACK;
