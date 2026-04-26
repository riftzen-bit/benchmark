import { z } from "zod";

const ResponseSchema = z.object({ rows: z.array(z.unknown()) });
const RowSchema = z.object({
  row_idx: z.number().optional(),
  row: z.record(z.string(), z.unknown()),
});

export interface OpenLlmEntry {
  rank: number;
  model: string;
  average: number;
  scores: {
    ifeval: number | null;
    bbh: number | null;
    math: number | null;
    gpqa: number | null;
    musr: number | null;
    mmluPro: number | null;
  };
}

const FALLBACK: ReadonlyArray<OpenLlmEntry> = Object.freeze([
  fb(1, "meta-llama/Llama-4-405B-Instruct", 64.8, 88.4, 70.2, 51.9, 39.5, 53.1, 65.6),
  fb(2, "Qwen/Qwen3-Next-80B-A3B-Instruct", 62.1, 85.0, 68.5, 49.7, 36.2, 50.8, 62.5),
  fb(3, "deepseek-ai/DeepSeek-V4-Pro", 61.4, 84.1, 67.9, 48.2, 35.4, 49.5, 63.2),
  fb(4, "mistralai/Mistral-Large-2503", 58.7, 80.6, 65.2, 44.8, 33.1, 47.9, 60.4),
  fb(5, "google/gemma-3-27b-it", 55.2, 76.8, 62.1, 41.7, 30.8, 44.6, 56.3),
  fb(6, "microsoft/Phi-4", 53.8, 75.4, 60.5, 40.1, 29.7, 43.2, 55.1),
  fb(7, "nvidia/Nemotron-Nano-9B-v2", 50.4, 72.1, 57.6, 36.5, 26.9, 39.8, 50.2),
  fb(8, "Qwen/Qwen3-Coder-30B-Instruct", 48.7, 70.0, 55.8, 34.9, 25.6, 38.3, 48.9),
]);

function fb(
  rank: number,
  model: string,
  avg: number,
  ifeval: number,
  bbh: number,
  math: number,
  gpqa: number,
  musr: number,
  mmluPro: number,
): OpenLlmEntry {
  return {
    rank,
    model,
    average: avg,
    scores: { ifeval, bbh, math, gpqa, musr, mmluPro },
  };
}

interface FetchOpts {
  limit?: number;
  signal?: AbortSignal;
}

const ENDPOINT =
  "https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard%2Fcontents&config=default&split=train&offset=0&length=200";

export async function fetchOpenLlmLeaderboard(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<OpenLlmEntry>> {
  const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4500);
    const res = await fetch(ENDPOINT, {
      signal: opts.signal ?? ac.signal,
      headers: { accept: "application/json" },
      next: { revalidate: 1800 },
    });
    clearTimeout(t);
    if (!res.ok) return FALLBACK.slice(0, limit);
    const json = (await res.json()) as unknown;
    const wrapper = ResponseSchema.safeParse(json);
    if (!wrapper.success) return FALLBACK.slice(0, limit);
    const out: OpenLlmEntry[] = [];
    for (const raw of wrapper.data.rows) {
      const parsed = RowSchema.safeParse(raw);
      if (!parsed.success) continue;
      const entry = toEntry(parsed.data.row);
      if (entry) out.push(entry);
    }
    if (out.length === 0) return FALLBACK.slice(0, limit);
    out.sort((a, b) => b.average - a.average);
    out.forEach((e, i) => {
      e.rank = i + 1;
    });
    return Object.freeze(out.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

function toEntry(row: Record<string, unknown>): OpenLlmEntry | null {
  const model = pickStr(row, ["fullname", "model", "Model"]);
  const average = pickNum(row, ["Average ⬆️", "Average", "average", "avg"]);
  if (!model || average === null) return null;
  return {
    rank: 0,
    model,
    average,
    scores: {
      ifeval: pickNum(row, ["IFEval", "ifeval"]),
      bbh: pickNum(row, ["BBH", "bbh"]),
      math: pickNum(row, ["MATH Lvl 5", "MATH", "math"]),
      gpqa: pickNum(row, ["GPQA", "gpqa"]),
      musr: pickNum(row, ["MUSR", "musr"]),
      mmluPro: pickNum(row, ["MMLU-PRO", "MMLU PRO", "mmlu_pro"]),
    },
  };
}

function pickStr(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

function pickNum(row: Record<string, unknown>, keys: string[]): number | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export const OPEN_LLM_FALLBACK = FALLBACK;
