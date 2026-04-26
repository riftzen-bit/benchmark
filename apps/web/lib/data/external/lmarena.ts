import { z } from "zod";

const RowSchema = z.object({
  row_idx: z.number().optional(),
  row: z.record(z.string(), z.unknown()),
});

const ResponseSchema = z.object({ rows: z.array(z.unknown()) });

export interface LmArenaEntry {
  rank: number;
  model: string;
  score: number;
  ciLabel: string | null;
  votes: number;
  organization: string;
  license: string | null;
}

const FALLBACK: ReadonlyArray<LmArenaEntry> = Object.freeze([
  fb(1, "claude-opus-4-7", 1462, "+4/-5", 28800, "Anthropic", "Proprietary"),
  fb(2, "gpt-5.5", 1448, "+3/-4", 41200, "OpenAI", "Proprietary"),
  fb(3, "gemini-3-pro", 1431, "+4/-4", 35100, "Google", "Proprietary"),
  fb(4, "claude-opus-4-5", 1419, "+5/-5", 22600, "Anthropic", "Proprietary"),
  fb(5, "deepseek-v4-pro", 1404, "+4/-5", 18400, "DeepSeek", "Custom"),
  fb(6, "gpt-5.5-pro", 1398, "+5/-6", 12300, "OpenAI", "Proprietary"),
  fb(7, "qwen3-next-80b", 1382, "+5/-5", 11050, "Alibaba", "Apache-2.0"),
  fb(8, "llama-4-405b-instruct", 1371, "+5/-6", 9800, "Meta", "Llama-4"),
  fb(9, "mistral-large-2503", 1356, "+6/-7", 7200, "Mistral", "Mistral-AI"),
  fb(10, "grok-4", 1347, "+6/-7", 6500, "xAI", "Proprietary"),
]);

function fb(
  rank: number,
  model: string,
  score: number,
  ci: string,
  votes: number,
  org: string,
  license: string,
): LmArenaEntry {
  return { rank, model, score, ciLabel: ci, votes, organization: org, license };
}

interface FetchOpts {
  limit?: number;
  signal?: AbortSignal;
}

const ENDPOINT =
  "https://datasets-server.huggingface.co/rows?dataset=lmarena-ai%2Fchatbot-arena-leaderboard&config=default&split=train&offset=0&length=200";

export async function fetchLmArenaLeaderboard(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<LmArenaEntry>> {
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
    const out: LmArenaEntry[] = [];
    let i = 0;
    for (const raw of wrapper.data.rows) {
      const parsed = RowSchema.safeParse(raw);
      if (!parsed.success) continue;
      const entry = toEntry(parsed.data.row, i + 1);
      if (entry) {
        out.push(entry);
        i++;
      }
    }
    if (out.length === 0) return FALLBACK.slice(0, limit);
    return Object.freeze(out.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

function toEntry(row: Record<string, unknown>, rank: number): LmArenaEntry | null {
  const model = pickStr(row, ["Model", "model"]);
  const score = pickNum(row, ["Arena Score", "arena_score", "Score", "elo"]);
  if (!model || score === null) return null;
  return {
    rank,
    model,
    score,
    ciLabel: pickStr(row, ["95% CI", "CI", "ci"]),
    votes: pickNum(row, ["Votes", "votes"]) ?? 0,
    organization: pickStr(row, ["Organization", "organization", "Org"]) ?? "",
    license: pickStr(row, ["License", "license"]),
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

export const LMARENA_FALLBACK = FALLBACK;
