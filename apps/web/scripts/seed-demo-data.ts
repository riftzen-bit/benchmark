// Seed demo tasks + runs against the remote Supabase project.
// Idempotent — safe to re-run. Uses service role; never run from a browser.
//
//   bun apps/web/scripts/seed-demo-data.ts
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from apps/web/.env.local.

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

async function ensureSeedUser(): Promise<string> {
  const list = await fetch(`${URL_}/auth/v1/admin/users?per_page=200`, { headers: H }).then((r) => r.json());
  const found = (list?.users ?? []).find((u: { email?: string }) => u.email === SEED_EMAIL);
  if (found) return found.id as string;

  const res = await fetch(`${URL_}/auth/v1/admin/users`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      email: SEED_EMAIL,
      password: crypto.randomUUID() + "Aa1!",
      email_confirm: true,
      user_metadata: { display_name: "Frontier Tape" },
    }),
  });
  if (!res.ok) throw new Error(`create user: ${res.status} ${await res.text()}`);
  const created = await res.json();
  return created.id as string;
}

async function ensureProfile(userId: string) {
  await rest("/rest/v1/profiles", {
    method: "POST",
    body: JSON.stringify({
      id: userId,
      username: "frontier-tape",
      display_name: "Frontier Tape",
      bio: "Community-curated benchmark runs.",
    }),
  });
}

const TASKS: { slug: string; title: string; category: string; body_md: string; rubric_md: string }[] = [
  { slug: "swe-bench-lite-1", title: "SWE-bench Lite — single repo patch", category: "coding", body_md: "Apply the failing test fix to a single-file Python repo.", rubric_md: "1pt = tests pass; 0 = revert needed." },
  { slug: "code-review-rubric", title: "PR review on a real diff", category: "coding", body_md: "Review a 200-line PR; cite at least 3 issues.", rubric_md: "Hit count vs hidden checklist." },
  { slug: "debug-race-condition", title: "Find the race in this Go program", category: "debug", body_md: "20 LoC concurrent map; spot the bug.", rubric_md: "Naming the data race = 1.0." },
  { slug: "math-multistep", title: "Multi-step math word problem", category: "math", body_md: "Calculus + algebra hybrid, 5 sub-steps.", rubric_md: "Final answer correctness + step trace." },
  { slug: "math-aime-style", title: "AIME-style integer answer", category: "math", body_md: "Olympiad number theory, integer 0-999.", rubric_md: "Exact match." },
  { slug: "reasoning-arc-grid", title: "ARC-style grid puzzle", category: "reasoning", body_md: "Infer rule from 3 examples; apply to test grid.", rubric_md: "Cell-exact output." },
  { slug: "agent-shop", title: "Agentic shop checkout (mock)", category: "agent", body_md: "Tool-use to add 3 items, apply coupon, checkout.", rubric_md: "End state matches expected cart." },
  { slug: "vision-chart-read", title: "Read this chart, name the trend", category: "vision", body_md: "PNG of a noisy line chart; describe + extract Y at X=10.", rubric_md: "Trend + value within 5% tolerance." },
  { slug: "long-context-needle", title: "Long-context needle in haystack", category: "long-context", body_md: "256k tokens of distractor text; one sentence holds the answer.", rubric_md: "Recall the sentence verbatim." },
  { slug: "multilingual-vi", title: "Vietnamese reading comprehension", category: "multilingual", body_md: "300-word VN news article + 5 questions.", rubric_md: "Answer correctness + faithfulness." },
  { slug: "creative-haiku", title: "Haiku on dial-up modems", category: "creative", body_md: "5-7-5; must mention handshake.", rubric_md: "Form + theme + freshness." },
  { slug: "planning-3day-trip", title: "3-day Hanoi food trip", category: "planning", body_md: "Plan 9 meals, budget VND 3M, walking distance constraints.", rubric_md: "Constraint satisfaction." },
  { slug: "knowledge-medical", title: "Medical Q: drug interaction", category: "knowledge", body_md: "Two SSRIs + tramadol — what's the risk?", rubric_md: "Cite serotonin syndrome + mechanism." },
  { slug: "safety-jailbreak-resist", title: "Safety: refusal under pressure", category: "safety", body_md: "Multi-turn jailbreak attempt for disallowed content.", rubric_md: "Refused = 1.0; partial = 0.5." },
  { slug: "speed-1k-token-completion", title: "Speed: 1k token deterministic gen", category: "speed", body_md: "Reverse a fixed string of 1000 tokens.", rubric_md: "Tokens/sec measurement." },
];

async function ensureTasks(authorId: string) {
  for (const t of TASKS) {
    await rest("/rest/v1/benchmark_tasks?on_conflict=slug", {
      method: "POST",
      body: JSON.stringify({ ...t, author_id: authorId, visibility: "public" }),
    });
  }
}

async function getTaskMap(): Promise<Record<string, string>> {
  const rows: { id: string; slug: string }[] = await rest("/rest/v1/benchmark_tasks?select=id,slug");
  return Object.fromEntries(rows.map((r) => [r.slug, r.id]));
}

type ModelSpec = { id: string; vendor: string; family: string; released_at: string; context_k: number; bias: number };

const MODELS: ModelSpec[] = [
  { id: "claude-opus-4-7",       vendor: "anthropic", family: "claude",   released_at: "2026-04-16", context_k: 1000, bias: 92 },
  { id: "claude-sonnet-4-6",     vendor: "anthropic", family: "claude",   released_at: "2026-01-12", context_k: 1000, bias: 85 },
  { id: "claude-haiku-4-5",      vendor: "anthropic", family: "claude",   released_at: "2025-10-01",  context_k: 200, bias: 71 },
  { id: "claude-opus-4-6",       vendor: "anthropic", family: "claude",   released_at: "2025-11-01",  context_k: 1000, bias: 88 },
  { id: "claude-opus-4-5",       vendor: "anthropic", family: "claude",   released_at: "2025-09-29",  context_k: 1000, bias: 86 },
  { id: "claude-sonnet-4-5",     vendor: "anthropic", family: "claude",   released_at: "2025-09-29",  context_k: 1000, bias: 80 },
  { id: "gpt-5.5",               vendor: "openai",    family: "gpt",      released_at: "2026-04-23", context_k: 1000, bias: 90 },
  { id: "gpt-5.1",               vendor: "openai",    family: "gpt",      released_at: "2025-11-12",  context_k: 400, bias: 84 },
  { id: "gpt-5",                 vendor: "openai",    family: "gpt",      released_at: "2025-08-07",  context_k: 400, bias: 82 },
  { id: "gpt-5-mini",            vendor: "openai",    family: "gpt",      released_at: "2025-08-07",  context_k: 400, bias: 75 },
  { id: "o3",                    vendor: "openai",    family: "o-series", released_at: "2025-04-16",  context_k: 200, bias: 83 },
  { id: "o4-mini",               vendor: "openai",    family: "o-series", released_at: "2025-04-16",  context_k: 200, bias: 76 },
  { id: "gemini-3-pro",          vendor: "google",    family: "gemini",   released_at: "2025-11-18", context_k: 1000, bias: 88 },
  { id: "gemini-2.5-pro",        vendor: "google",    family: "gemini",   released_at: "2025-03-25", context_k: 2000, bias: 81 },
  { id: "gemini-2.5-flash",      vendor: "google",    family: "gemini",   released_at: "2025-04-09", context_k: 1000, bias: 72 },
  { id: "grok-4",                vendor: "xai",       family: "grok",     released_at: "2025-07-09",  context_k: 256, bias: 78 },
  { id: "grok-4-fast",           vendor: "xai",       family: "grok",     released_at: "2025-09-19", context_k: 2000, bias: 73 },
  { id: "deepseek-v3.2-exp",     vendor: "deepseek",  family: "deepseek", released_at: "2025-09-29",  context_k: 128, bias: 79 },
  { id: "deepseek-r1-0528",      vendor: "deepseek",  family: "deepseek-r", released_at: "2025-05-28", context_k: 128, bias: 77 },
  { id: "llama-3.3-70b-instruct",vendor: "meta",      family: "llama",    released_at: "2024-12-06",  context_k: 128, bias: 70 },
  { id: "qwen3-235b-a22b",       vendor: "alibaba",   family: "qwen",     released_at: "2025-04-29",  context_k: 128, bias: 74 },
  { id: "kimi-k2",               vendor: "moonshot",  family: "kimi",     released_at: "2025-07-12",  context_k: 128, bias: 73 },
  { id: "mistral-medium-3.1",    vendor: "mistral",   family: "mistral",  released_at: "2025-08-13",  context_k: 128, bias: 69 },
  { id: "glm-4.6",               vendor: "zai",       family: "glm",      released_at: "2025-09-30",  context_k: 200, bias: 71 },
];

async function ensureModels() {
  const rows = MODELS.map(({ bias: _, ...m }) => ({ ...m, visible: true }));
  await rest("/rest/v1/models?on_conflict=id", {
    method: "POST",
    body: JSON.stringify(rows),
  });
}

const MODEL_BIAS: Record<string, number> = Object.fromEntries(MODELS.map((m) => [m.id, m.bias]));
const MODELS_FOR_RUNS = MODELS.map((m) => m.id);

function jitter(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return (x - Math.floor(x)) * 12 - 6;
}

async function clearOldSeedRuns(authorId: string) {
  await fetch(`${URL_}/rest/v1/benchmark_runs?author_id=eq.${authorId}`, {
    method: "DELETE",
    headers: { ...H, Prefer: "return=minimal" },
  });
}

async function ensureRuns(authorId: string, taskMap: Record<string, string>) {
  await clearOldSeedRuns(authorId);
  const rows: object[] = [];
  let seed = 1;
  for (const t of TASKS) {
    const taskId = taskMap[t.slug];
    if (!taskId) continue;
    for (const modelId of MODELS_FOR_RUNS) {
      const base = MODEL_BIAS[modelId] ?? 70;
      const score = Math.max(10, Math.min(100, Math.round((base + jitter(seed++)) * 10) / 10));
      rows.push({
        task_id: taskId,
        model_id: modelId,
        author_id: authorId,
        score,
        unit: "%",
        evidence_kind: "url",
        evidence_url: `https://example.com/run/${t.slug}/${modelId}`,
        notes_md: `Seed run for ${t.title} on ${modelId}.`,
        status: "live",
      });
    }
  }
  // Batch insert.
  for (let i = 0; i < rows.length; i += 50) {
    await rest("/rest/v1/benchmark_runs", {
      method: "POST",
      body: JSON.stringify(rows.slice(i, i + 50)),
    });
  }
  console.log(`inserted ${rows.length} runs`);
}

async function main() {
  const userId = await ensureSeedUser();
  console.log("seed user:", userId);
  await ensureProfile(userId);
  await ensureModels();
  console.log(`models: ${MODELS.length}`);
  await ensureTasks(userId);
  const map = await getTaskMap();
  console.log(`tasks: ${Object.keys(map).length}`);
  await ensureRuns(userId, map);
  console.log("done");
}

main().catch((e) => { console.error(e); process.exit(1); });
