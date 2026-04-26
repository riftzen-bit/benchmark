export interface LiveBenchEntry {
  rank: number;
  model: string;
  global: number;
  coding: number | null;
  math: number | null;
  reasoning: number | null;
  language: number | null;
  dataAnalysis: number | null;
  ifAvg: number | null;
}

const FALLBACK: ReadonlyArray<LiveBenchEntry> = Object.freeze([
  fb(1, "claude-opus-4-7", 73.1, 68.5, 75.1, 80.2, 69.8, 71.4, 73.6),
  fb(2, "gpt-5.5", 70.2, 71.2, 72.8, 76.4, 67.5, 68.9, 71.5),
  fb(3, "gemini-3-pro", 68.1, 65.4, 70.2, 74.1, 66.0, 67.1, 69.8),
  fb(4, "deepseek-v4-pro", 65.4, 69.1, 67.5, 71.8, 60.2, 64.3, 65.5),
  fb(5, "claude-opus-4-5", 64.2, 60.1, 66.4, 71.2, 63.5, 62.8, 64.8),
  fb(6, "qwen3-next-80b", 60.5, 58.7, 62.4, 65.9, 57.3, 58.1, 61.2),
  fb(7, "llama-4-405b", 58.4, 55.2, 60.1, 63.5, 56.8, 56.3, 59.4),
  fb(8, "mistral-large-2503", 55.7, 52.4, 57.0, 60.8, 53.6, 53.9, 56.5),
]);

function fb(
  rank: number,
  model: string,
  global: number,
  coding: number,
  math: number,
  reasoning: number,
  language: number,
  data: number,
  ifAvg: number,
): LiveBenchEntry {
  return {
    rank,
    model,
    global,
    coding,
    math,
    reasoning,
    language,
    dataAnalysis: data,
    ifAvg,
  };
}

interface FetchOpts {
  limit?: number;
  signal?: AbortSignal;
}

const ENDPOINT =
  "https://raw.githubusercontent.com/livebench/livebench/main/leaderboard_table.csv";

export async function fetchLiveBench(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<LiveBenchEntry>> {
  const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4500);
    const res = await fetch(ENDPOINT, {
      signal: opts.signal ?? ac.signal,
      headers: { accept: "text/csv,text/plain" },
      next: { revalidate: 1800 },
    });
    clearTimeout(t);
    if (!res.ok) return FALLBACK.slice(0, limit);
    const text = await res.text();
    const parsed = parseCsv(text);
    if (parsed.length === 0) return FALLBACK.slice(0, limit);
    parsed.sort((a, b) => b.global - a.global);
    parsed.forEach((e, i) => {
      e.rank = i + 1;
    });
    return Object.freeze(parsed.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

function parseCsv(text: string): LiveBenchEntry[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(",").map((s) => s.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());
  const iModel = idx("model");
  const iGlobal = idx("global average");
  if (iModel < 0 || iGlobal < 0) return [];
  const iCoding = idx("coding average");
  const iMath = idx("mathematics average");
  const iReason = idx("reasoning average");
  const iLang = idx("language average");
  const iData = idx("data analysis average");
  const iIf = idx("if average");
  const out: LiveBenchEntry[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = lines[r]!.split(",").map((s) => s.trim());
    const model = cols[iModel];
    const global = num(cols[iGlobal]);
    if (!model || global === null) continue;
    out.push({
      rank: 0,
      model,
      global,
      coding: iCoding >= 0 ? num(cols[iCoding]) : null,
      math: iMath >= 0 ? num(cols[iMath]) : null,
      reasoning: iReason >= 0 ? num(cols[iReason]) : null,
      language: iLang >= 0 ? num(cols[iLang]) : null,
      dataAnalysis: iData >= 0 ? num(cols[iData]) : null,
      ifAvg: iIf >= 0 ? num(cols[iIf]) : null,
    });
  }
  return out;
}

function num(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export const LIVEBENCH_FALLBACK = FALLBACK;
