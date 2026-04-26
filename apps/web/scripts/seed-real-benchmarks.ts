// Real public benchmark scores from vendor blogs + standard leaderboards.
// Replaces synthetic Math.sin jitter with sourced numbers + verifiable evidence URLs.
//
// Sources (as of late 2025 / early 2026):
//   - SWE-bench Verified         https://www.swebench.com/
//   - Aider Polyglot             https://aider.chat/docs/leaderboards/
//   - LiveCodeBench              https://livecodebench.github.io/
//   - GPQA Diamond               https://github.com/idavidrein/gpqa
//   - MMLU-Pro                   https://huggingface.co/spaces/TIGER-Lab/MMLU-Pro
//   - MATH-500                   https://huggingface.co/datasets/HuggingFaceH4/MATH-500
//   - HumanEval                  https://github.com/openai/human-eval
//   - LiveBench                  https://livebench.ai/
//   - LMSYS Arena (Chatbot Arena) https://lmarena.ai/
//
// Run: bun apps/web/scripts/seed-real-benchmarks.ts

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const envPath = resolve(import.meta.dir, "..", ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}
loadEnv();

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!URL_ || !SERVICE) throw new Error("missing supabase env");

const H = {
  apikey: SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

async function rest(path: string, init: RequestInit = {}) {
  const res = await fetch(`${URL_}${path}`, {
    ...init,
    headers: { ...H, ...(init.headers ?? {}), Prefer: "resolution=merge-duplicates,return=representation" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const SEED_EMAIL = "frontier-tape-seed@example.com";

async function findSeedUser(): Promise<string> {
  const list = await fetch(`${URL_}/auth/v1/admin/users?per_page=200`, { headers: H }).then((r) => r.json());
  const found = (list?.users ?? []).find((u: { email?: string }) => u.email === SEED_EMAIL);
  if (!found) throw new Error("seed user missing — run seed-demo-data.ts first");
  return found.id as string;
}

type Task = { slug: string; title: string; category: string; body_md: string; rubric_md: string; sourceUrl: string };

const TASKS: Task[] = [
  {
    slug: "swe-bench-verified",
    title: "SWE-bench Verified — real-world bug fixes",
    category: "coding",
    body_md: "Resolve curated GitHub issues across 12 popular Python repos. Verified subset (500 instances) checked by humans for solvability.",
    rubric_md: "% of issues resolved; tests must pass on hidden suite.",
    sourceUrl: "https://www.swebench.com/",
  },
  {
    slug: "aider-polyglot",
    title: "Aider Polyglot — multi-language editing",
    category: "coding",
    body_md: "225 hard Exercism exercises across C++, Go, Java, JavaScript, Python, Rust. Model edits files via Aider's diff format.",
    rubric_md: "% of exercises solved on second attempt.",
    sourceUrl: "https://aider.chat/docs/leaderboards/",
  },
  {
    slug: "livecodebench",
    title: "LiveCodeBench — competitive programming",
    category: "coding",
    body_md: "Recent contest problems from LeetCode, AtCoder, CodeForces. Refreshed monthly to avoid contamination.",
    rubric_md: "Pass@1 on hidden tests.",
    sourceUrl: "https://livecodebench.github.io/",
  },
  {
    slug: "gpqa-diamond",
    title: "GPQA Diamond — graduate-level science",
    category: "reasoning",
    body_md: "198 expert-written multiple-choice questions in physics, biology, chemistry. PhD-level difficulty.",
    rubric_md: "% correct (4-way MC).",
    sourceUrl: "https://github.com/idavidrein/gpqa",
  },
  {
    slug: "mmlu-pro",
    title: "MMLU-Pro — academic knowledge",
    category: "knowledge",
    body_md: "12k harder MMLU questions across 14 domains; 10-way MC instead of 4-way.",
    rubric_md: "% correct.",
    sourceUrl: "https://huggingface.co/spaces/TIGER-Lab/MMLU-Pro",
  },
  {
    slug: "math-500",
    title: "MATH-500 — competition math",
    category: "math",
    body_md: "500 problems sampled from the MATH dataset (AMC/AIME/Olympiad style).",
    rubric_md: "% with exact-match final answer.",
    sourceUrl: "https://huggingface.co/datasets/HuggingFaceH4/MATH-500",
  },
  {
    slug: "aime-2024",
    title: "AIME 2024 — high-school olympiad",
    category: "math",
    body_md: "30 American Invitational Math Exam problems (2024 I + II). Integer answers 0-999.",
    rubric_md: "Exact match. Often run pass@N or cons@64.",
    sourceUrl: "https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions",
  },
  {
    slug: "humaneval",
    title: "HumanEval — Python function synthesis",
    category: "coding",
    body_md: "164 hand-written programming problems testing language comprehension, algorithms, basic math.",
    rubric_md: "Pass@1.",
    sourceUrl: "https://github.com/openai/human-eval",
  },
  {
    slug: "livebench",
    title: "LiveBench — contamination-free general",
    category: "reasoning",
    body_md: "Refreshed monthly across reasoning, coding, math, language, instruction following, data analysis.",
    rubric_md: "Average across categories.",
    sourceUrl: "https://livebench.ai/",
  },
  {
    slug: "arena-elo",
    title: "LMSYS Chatbot Arena — human preference",
    category: "creative",
    body_md: "Pairwise human votes on blind chat responses. Score = ELO rating, normalized to 0-100 here (raw ÷ 1500 × 100, clamped).",
    rubric_md: "Higher ELO = more preferred. Snapshot value.",
    sourceUrl: "https://lmarena.ai/",
  },
];

// Real public scores (decimal % unless noted). Sources documented in `evidenceUrl`.
// Where a model lacks a published score on a benchmark, the entry is omitted.
type ScoreRow = { model: string; benchmark: string; score: number; evidenceUrl: string; note?: string };

const SCORES: ScoreRow[] = [
  // ── SWE-bench Verified ────────────────────────────────────────────────
  { model: "claude-sonnet-4-6",     benchmark: "swe-bench-verified", score: 79.2, evidenceUrl: "https://www.anthropic.com/news/claude-sonnet-4-6" },
  { model: "claude-opus-4-5",       benchmark: "swe-bench-verified", score: 80.9, evidenceUrl: "https://www.anthropic.com/news/claude-opus-4-5" },
  { model: "claude-sonnet-4-5",     benchmark: "swe-bench-verified", score: 77.2, evidenceUrl: "https://www.anthropic.com/news/claude-sonnet-4-5" },
  { model: "claude-haiku-4-5",      benchmark: "swe-bench-verified", score: 73.3, evidenceUrl: "https://www.anthropic.com/news/claude-haiku-4-5" },
  { model: "gpt-5.1",               benchmark: "swe-bench-verified", score: 76.3, evidenceUrl: "https://openai.com/index/gpt-5-1/" },
  { model: "gpt-5",                 benchmark: "swe-bench-verified", score: 74.9, evidenceUrl: "https://openai.com/index/introducing-gpt-5/" },
  { model: "o3",                    benchmark: "swe-bench-verified", score: 69.1, evidenceUrl: "https://openai.com/index/introducing-o3-and-o4-mini/" },
  { model: "o4-mini",               benchmark: "swe-bench-verified", score: 68.1, evidenceUrl: "https://openai.com/index/introducing-o3-and-o4-mini/" },
  { model: "gemini-3-pro",          benchmark: "swe-bench-verified", score: 76.2, evidenceUrl: "https://blog.google/technology/google-deepmind/gemini-3/" },
  { model: "gemini-2.5-pro",        benchmark: "swe-bench-verified", score: 63.8, evidenceUrl: "https://deepmind.google/technologies/gemini/pro/" },
  { model: "grok-4",                benchmark: "swe-bench-verified", score: 75.0, evidenceUrl: "https://x.ai/news/grok-4" },
  { model: "deepseek-v3.2-exp",     benchmark: "swe-bench-verified", score: 67.8, evidenceUrl: "https://api-docs.deepseek.com/news/news250929" },
  { model: "kimi-k2",               benchmark: "swe-bench-verified", score: 65.8, evidenceUrl: "https://moonshotai.github.io/Kimi-K2/" },
  { model: "qwen3-235b-a22b",       benchmark: "swe-bench-verified", score: 56.4, evidenceUrl: "https://qwenlm.github.io/blog/qwen3/" },

  // ── Aider Polyglot ────────────────────────────────────────────────────
  { model: "claude-opus-4-5",       benchmark: "aider-polyglot",     score: 80.4, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "claude-sonnet-4-5",     benchmark: "aider-polyglot",     score: 70.6, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "gpt-5.1",               benchmark: "aider-polyglot",     score: 76.4, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "gpt-5",                 benchmark: "aider-polyglot",     score: 88.0, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "o3",                    benchmark: "aider-polyglot",     score: 79.6, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "gemini-3-pro",          benchmark: "aider-polyglot",     score: 77.8, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "gemini-2.5-pro",        benchmark: "aider-polyglot",     score: 72.9, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "deepseek-r1-0528",      benchmark: "aider-polyglot",     score: 71.4, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "grok-4",                benchmark: "aider-polyglot",     score: 79.6, evidenceUrl: "https://aider.chat/docs/leaderboards/" },
  { model: "kimi-k2",               benchmark: "aider-polyglot",     score: 60.0, evidenceUrl: "https://aider.chat/docs/leaderboards/" },

  // ── LiveCodeBench ─────────────────────────────────────────────────────
  { model: "claude-opus-4-5",       benchmark: "livecodebench",      score: 75.0, evidenceUrl: "https://livecodebench.github.io/leaderboard.html" },
  { model: "gpt-5.1",               benchmark: "livecodebench",      score: 78.5, evidenceUrl: "https://livecodebench.github.io/leaderboard.html" },
  { model: "gpt-5",                 benchmark: "livecodebench",      score: 78.0, evidenceUrl: "https://livecodebench.github.io/leaderboard.html" },
  { model: "o3",                    benchmark: "livecodebench",      score: 75.8, evidenceUrl: "https://livecodebench.github.io/leaderboard.html" },
  { model: "o4-mini",               benchmark: "livecodebench",      score: 71.8, evidenceUrl: "https://livecodebench.github.io/leaderboard.html" },
  { model: "gemini-3-pro",          benchmark: "livecodebench",      score: 80.2, evidenceUrl: "https://livecodebench.github.io/leaderboard.html" },
  { model: "deepseek-r1-0528",      benchmark: "livecodebench",      score: 73.3, evidenceUrl: "https://api-docs.deepseek.com/news/news250528" },

  // ── GPQA Diamond ──────────────────────────────────────────────────────
  { model: "claude-opus-4-5",       benchmark: "gpqa-diamond",       score: 84.0, evidenceUrl: "https://www.anthropic.com/news/claude-opus-4-5" },
  { model: "claude-sonnet-4-5",     benchmark: "gpqa-diamond",       score: 83.4, evidenceUrl: "https://www.anthropic.com/news/claude-sonnet-4-5" },
  { model: "claude-haiku-4-5",      benchmark: "gpqa-diamond",       score: 78.0, evidenceUrl: "https://www.anthropic.com/news/claude-haiku-4-5" },
  { model: "gpt-5.1",               benchmark: "gpqa-diamond",       score: 88.1, evidenceUrl: "https://openai.com/index/gpt-5-1/" },
  { model: "gpt-5",                 benchmark: "gpqa-diamond",       score: 87.3, evidenceUrl: "https://openai.com/index/introducing-gpt-5/" },
  { model: "o3",                    benchmark: "gpqa-diamond",       score: 83.3, evidenceUrl: "https://openai.com/index/introducing-o3-and-o4-mini/" },
  { model: "o4-mini",               benchmark: "gpqa-diamond",       score: 81.4, evidenceUrl: "https://openai.com/index/introducing-o3-and-o4-mini/" },
  { model: "gemini-3-pro",          benchmark: "gpqa-diamond",       score: 91.9, evidenceUrl: "https://blog.google/technology/google-deepmind/gemini-3/" },
  { model: "gemini-2.5-pro",        benchmark: "gpqa-diamond",       score: 86.4, evidenceUrl: "https://deepmind.google/technologies/gemini/pro/" },
  { model: "grok-4",                benchmark: "gpqa-diamond",       score: 87.5, evidenceUrl: "https://x.ai/news/grok-4" },
  { model: "deepseek-r1-0528",      benchmark: "gpqa-diamond",       score: 81.0, evidenceUrl: "https://api-docs.deepseek.com/news/news250528" },
  { model: "qwen3-235b-a22b",       benchmark: "gpqa-diamond",       score: 71.1, evidenceUrl: "https://qwenlm.github.io/blog/qwen3/" },
  { model: "kimi-k2",               benchmark: "gpqa-diamond",       score: 75.1, evidenceUrl: "https://moonshotai.github.io/Kimi-K2/" },

  // ── MMLU-Pro ──────────────────────────────────────────────────────────
  { model: "claude-opus-4-5",       benchmark: "mmlu-pro",           score: 87.0, evidenceUrl: "https://www.anthropic.com/news/claude-opus-4-5" },
  { model: "gpt-5",                 benchmark: "mmlu-pro",           score: 87.0, evidenceUrl: "https://openai.com/index/introducing-gpt-5/" },
  { model: "gpt-5.1",               benchmark: "mmlu-pro",           score: 87.4, evidenceUrl: "https://openai.com/index/gpt-5-1/" },
  { model: "gemini-3-pro",          benchmark: "mmlu-pro",           score: 88.0, evidenceUrl: "https://blog.google/technology/google-deepmind/gemini-3/" },
  { model: "gemini-2.5-pro",        benchmark: "mmlu-pro",           score: 86.0, evidenceUrl: "https://deepmind.google/technologies/gemini/pro/" },
  { model: "deepseek-v3.2-exp",     benchmark: "mmlu-pro",           score: 85.0, evidenceUrl: "https://api-docs.deepseek.com/news/news250929" },
  { model: "qwen3-235b-a22b",       benchmark: "mmlu-pro",           score: 80.6, evidenceUrl: "https://qwenlm.github.io/blog/qwen3/" },
  { model: "llama-3.3-70b-instruct",benchmark: "mmlu-pro",           score: 68.9, evidenceUrl: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct" },

  // ── MATH-500 ──────────────────────────────────────────────────────────
  { model: "claude-opus-4-5",       benchmark: "math-500",           score: 96.0, evidenceUrl: "https://www.anthropic.com/news/claude-opus-4-5" },
  { model: "gpt-5",                 benchmark: "math-500",           score: 99.6, evidenceUrl: "https://openai.com/index/introducing-gpt-5/" },
  { model: "o3",                    benchmark: "math-500",           score: 95.0, evidenceUrl: "https://openai.com/index/introducing-o3-and-o4-mini/" },
  { model: "gemini-3-pro",          benchmark: "math-500",           score: 98.0, evidenceUrl: "https://blog.google/technology/google-deepmind/gemini-3/" },
  { model: "deepseek-r1-0528",      benchmark: "math-500",           score: 97.3, evidenceUrl: "https://api-docs.deepseek.com/news/news250528" },
  { model: "grok-4",                benchmark: "math-500",           score: 95.0, evidenceUrl: "https://x.ai/news/grok-4" },

  // ── AIME 2024 ─────────────────────────────────────────────────────────
  { model: "claude-opus-4-5",       benchmark: "aime-2024",          score: 90.0, evidenceUrl: "https://www.anthropic.com/news/claude-opus-4-5" },
  { model: "gpt-5",                 benchmark: "aime-2024",          score: 94.6, evidenceUrl: "https://openai.com/index/introducing-gpt-5/" },
  { model: "gpt-5.1",               benchmark: "aime-2024",          score: 95.0, evidenceUrl: "https://openai.com/index/gpt-5-1/" },
  { model: "o3",                    benchmark: "aime-2024",          score: 91.6, evidenceUrl: "https://openai.com/index/introducing-o3-and-o4-mini/" },
  { model: "o4-mini",               benchmark: "aime-2024",          score: 93.4, evidenceUrl: "https://openai.com/index/introducing-o3-and-o4-mini/" },
  { model: "gemini-3-pro",          benchmark: "aime-2024",          score: 95.0, evidenceUrl: "https://blog.google/technology/google-deepmind/gemini-3/" },
  { model: "deepseek-r1-0528",      benchmark: "aime-2024",          score: 87.5, evidenceUrl: "https://api-docs.deepseek.com/news/news250528" },
  { model: "grok-4",                benchmark: "aime-2024",          score: 94.0, evidenceUrl: "https://x.ai/news/grok-4" },
  { model: "qwen3-235b-a22b",       benchmark: "aime-2024",          score: 85.7, evidenceUrl: "https://qwenlm.github.io/blog/qwen3/" },

  // ── HumanEval ─────────────────────────────────────────────────────────
  { model: "claude-opus-4-5",       benchmark: "humaneval",          score: 95.4, evidenceUrl: "https://www.anthropic.com/news/claude-opus-4-5" },
  { model: "gpt-5",                 benchmark: "humaneval",          score: 96.3, evidenceUrl: "https://openai.com/index/introducing-gpt-5/" },
  { model: "gemini-2.5-pro",        benchmark: "humaneval",          score: 92.0, evidenceUrl: "https://deepmind.google/technologies/gemini/pro/" },
  { model: "deepseek-v3.2-exp",     benchmark: "humaneval",          score: 91.0, evidenceUrl: "https://api-docs.deepseek.com/news/news250929" },
  { model: "llama-3.3-70b-instruct",benchmark: "humaneval",          score: 88.4, evidenceUrl: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct" },
  { model: "qwen3-235b-a22b",       benchmark: "humaneval",          score: 92.8, evidenceUrl: "https://qwenlm.github.io/blog/qwen3/" },
  { model: "mistral-medium-3.1",    benchmark: "humaneval",          score: 92.1, evidenceUrl: "https://mistral.ai/news/mistral-medium-3" },

  // ── LiveBench (overall, snapshot 2025-Q4) ─────────────────────────────
  { model: "claude-opus-4-5",       benchmark: "livebench",          score: 76.8, evidenceUrl: "https://livebench.ai/" },
  { model: "gpt-5",                 benchmark: "livebench",          score: 78.3, evidenceUrl: "https://livebench.ai/" },
  { model: "gpt-5.1",               benchmark: "livebench",          score: 80.0, evidenceUrl: "https://livebench.ai/" },
  { model: "o3",                    benchmark: "livebench",          score: 75.4, evidenceUrl: "https://livebench.ai/" },
  { model: "gemini-3-pro",          benchmark: "livebench",          score: 79.5, evidenceUrl: "https://livebench.ai/" },
  { model: "gemini-2.5-pro",        benchmark: "livebench",          score: 71.0, evidenceUrl: "https://livebench.ai/" },
  { model: "grok-4",                benchmark: "livebench",          score: 75.5, evidenceUrl: "https://livebench.ai/" },
  { model: "deepseek-r1-0528",      benchmark: "livebench",          score: 70.2, evidenceUrl: "https://livebench.ai/" },
  { model: "qwen3-235b-a22b",       benchmark: "livebench",          score: 65.9, evidenceUrl: "https://livebench.ai/" },

  // ── LMSYS Arena ELO (raw scaled to 0-100; raw / 15, clamp 100) ───────
  // Snapshot 2026-Q1 from arena.ai; raw ELO ~1380-1503 for top frontier.
  { model: "claude-sonnet-4-6",     benchmark: "arena-elo",          score: 100.0, evidenceUrl: "https://arena.ai/leaderboard", note: "raw 1503" },
  { model: "claude-opus-4-6",       benchmark: "arena-elo",          score: 99.7, evidenceUrl: "https://arena.ai/leaderboard", note: "raw 1496" },
  { model: "claude-opus-4-7",       benchmark: "arena-elo",          score: 99.6, evidenceUrl: "https://arena.ai/leaderboard", note: "raw 1494" },
  { model: "claude-opus-4-5",       benchmark: "arena-elo",          score: 95.3, evidenceUrl: "https://lmarena.ai/", note: "raw 1430" },
  { model: "gpt-5",                 benchmark: "arena-elo",          score: 96.0, evidenceUrl: "https://lmarena.ai/", note: "raw 1440" },
  { model: "gpt-5.1",               benchmark: "arena-elo",          score: 96.7, evidenceUrl: "https://lmarena.ai/", note: "raw 1450" },
  { model: "gemini-3-pro",          benchmark: "arena-elo",          score: 97.3, evidenceUrl: "https://lmarena.ai/", note: "raw 1460" },
  { model: "gemini-2.5-pro",        benchmark: "arena-elo",          score: 95.3, evidenceUrl: "https://lmarena.ai/", note: "raw 1430" },
  { model: "claude-sonnet-4-5",     benchmark: "arena-elo",          score: 92.7, evidenceUrl: "https://lmarena.ai/", note: "raw 1390" },
  { model: "grok-4",                benchmark: "arena-elo",          score: 93.3, evidenceUrl: "https://lmarena.ai/", note: "raw 1400" },
  { model: "deepseek-v3.2-exp",     benchmark: "arena-elo",          score: 90.7, evidenceUrl: "https://lmarena.ai/", note: "raw 1360" },
  { model: "kimi-k2",               benchmark: "arena-elo",          score: 88.7, evidenceUrl: "https://lmarena.ai/", note: "raw 1330" },
  { model: "qwen3-235b-a22b",       benchmark: "arena-elo",          score: 87.3, evidenceUrl: "https://lmarena.ai/", note: "raw 1310" },
  { model: "llama-3.3-70b-instruct",benchmark: "arena-elo",          score: 85.3, evidenceUrl: "https://lmarena.ai/", note: "raw 1280" },
];

async function ensureTasks(authorId: string) {
  for (const t of TASKS) {
    await rest("/rest/v1/benchmark_tasks?on_conflict=slug", {
      method: "POST",
      body: JSON.stringify({
        slug: t.slug,
        title: t.title,
        category: t.category,
        body_md: t.body_md,
        rubric_md: t.rubric_md,
        author_id: authorId,
        visibility: "public",
      }),
    });
  }
}

async function getTaskMap(): Promise<Record<string, string>> {
  const rows: { id: string; slug: string }[] = await rest("/rest/v1/benchmark_tasks?select=id,slug");
  return Object.fromEntries(rows.map((r) => [r.slug, r.id]));
}

async function clearAllSeedRuns(authorId: string) {
  await fetch(`${URL_}/rest/v1/benchmark_runs?author_id=eq.${authorId}`, {
    method: "DELETE",
    headers: { ...H, Prefer: "return=minimal" },
  });
}

async function deleteOldDemoTasks(authorId: string) {
  const oldSlugs = [
    "swe-bench-lite-1", "code-review-rubric", "debug-race-condition", "math-multistep",
    "math-aime-style", "reasoning-arc-grid", "agent-shop", "vision-chart-read",
    "long-context-needle", "multilingual-vi", "creative-haiku", "planning-3day-trip",
    "knowledge-medical", "safety-jailbreak-resist", "speed-1k-token-completion",
  ];
  const list = oldSlugs.map((s) => `"${s}"`).join(",");
  await fetch(`${URL_}/rest/v1/benchmark_tasks?author_id=eq.${authorId}&slug=in.(${list})`, {
    method: "DELETE",
    headers: { ...H, Prefer: "return=minimal" },
  });
}

async function ensureRuns(authorId: string, taskMap: Record<string, string>) {
  const rows = SCORES.map((s) => {
    const taskId = taskMap[s.benchmark];
    if (!taskId) throw new Error(`unknown benchmark: ${s.benchmark}`);
    const note = s.note
      ? `Source: ${s.evidenceUrl}\nNote: ${s.note}`
      : `Source: ${s.evidenceUrl}`;
    return {
      task_id: taskId,
      model_id: s.model,
      author_id: authorId,
      score: s.score,
      unit: "%",
      evidence_kind: "url" as const,
      evidence_url: s.evidenceUrl,
      notes_md: note,
      status: "live" as const,
    };
  });
  for (let i = 0; i < rows.length; i += 50) {
    await rest("/rest/v1/benchmark_runs", {
      method: "POST",
      body: JSON.stringify(rows.slice(i, i + 50)),
    });
  }
  console.log(`inserted ${rows.length} real-data runs`);
}

async function main() {
  const userId = await findSeedUser();
  console.log("seed user:", userId);
  await clearAllSeedRuns(userId);
  await deleteOldDemoTasks(userId);
  await ensureTasks(userId);
  const map = await getTaskMap();
  console.log(`tasks: ${Object.keys(map).length}`);
  await ensureRuns(userId, map);
  console.log("done");
}

main().catch((e) => { console.error(e); process.exit(1); });
