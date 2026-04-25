import { PromptSchema, type Prompt } from "@/lib/schema/prompt";

const raw: Prompt[] = [
  {
    id: "long-context-needle",
    title: "Needle in a long stack",
    category: "long-context",
    difficulty: "hard",
    body: `Below is a long document — paste 50 paragraphs of any long-form text before sending. In the 37th paragraph, place a single sentence that contains the fictional account number "AC-19880412-XQ".

Task:
1. Quote the exact sentence containing AC-19880412-XQ.
2. State which paragraph number it appears in.
3. List 3 semantic clues that let you rule out the other paragraphs.

Do not paraphrase. Do not invent neighboring sentences.`,
    watchFor: [
      "Quotes the sentence containing AC-19880412-XQ exactly",
      "Identifies paragraph 37 correctly",
      "Does not hallucinate adjacent sentences",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground"],
  },
  {
    id: "multi-file-refactor",
    title: "Multi-file TypeScript bug hunt",
    category: "coding",
    difficulty: "hard",
    body: `Paste the three files below. \`auth.ts\` has an off-by-one bug in the token expiry check (uses \`<\` where it should use \`<=\`).

\`\`\`ts
// user.ts
export interface User { id: string; tokenExp: number }

// auth.ts
import type { User } from "./user";
export function isExpired(u: User, now: number) {
  return u.tokenExp < now; // bug
}

// api.ts
import { isExpired } from "./auth";
export function authorize(u: User) {
  if (isExpired(u, Date.now())) throw new Error("expired");
  return u;
}
\`\`\`

Task:
1. Identify the bug and explain why it matters.
2. Show the minimal unified diff that fixes it.
3. List the call sites affected.
4. Write a Vitest test that reproduces the bug (fails before the fix, passes after).`,
    watchFor: [
      "Identifies the off-by-one correctly",
      "Diff is minimal — does not refactor unrelated code",
      "Test fails before the fix and passes after",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground", "poe"],
  },
  {
    id: "aime-style",
    title: "AIME-style number theory",
    category: "math",
    difficulty: "extreme",
    body: `Let f(x) = x^3 - 6x^2 + 11x - 6. Find the sum of all integers n in [-100, 100] such that f(n) divides n^4 + 1. Show your full reasoning. Do not use external tools.`,
    watchFor: [
      "Factors f(n) = (n-1)(n-2)(n-3)",
      "Reasons about divisibility carefully",
      "Does not skip negative n",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground"],
  },
  {
    id: "agent-tool-plan",
    title: "Agentic tool-use planning",
    category: "agent",
    difficulty: "hard",
    body: `You are a coordinator agent with four tools:
\`search_web(q)\`, \`read_url(u)\`, \`run_python(code)\`, \`write_file(path, content)\`.

Goal: produce \`prices.csv\` with the average RON95 gasoline price for the past week in five major Vietnamese cities.

Output a plan as JSON: \`{ steps: [{ tool, input, why }] }\`. Minimize the number of tool calls. Do not actually execute — just plan.`,
    watchFor: [
      "Steps are in a logical order",
      "No redundant tool calls",
      "Output is valid JSON",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground"],
  },
  {
    id: "vision-chart-read",
    title: "High-resolution chart reading",
    category: "vision",
    difficulty: "medium",
    body: `Attach a screenshot of a bar chart that compares 6 models on one benchmark — pick any chart with small annotations and a fine grid (e.g., from a recent model release post).

Task:
1. Read each bar value to one decimal place.
2. Rank from highest to lowest.
3. Compute the difference between the top and bottom bars.

Only answer after reading the image. Do not guess.`,
    watchFor: [
      "Reads each bar accurately",
      "Does not invent models that are not in the chart",
      "Final subtraction is correct",
    ],
    playgroundIds: ["claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground"],
  },
  {
    id: "multilingual-mix",
    title: "Multilingual reasoning",
    category: "multilingual",
    difficulty: "hard",
    body: `The passage below mixes Vietnamese, English, Chinese, and Japanese. Tasks:
1. Translate the whole thing into formal academic English.
2. Extract the three main claims.
3. Identify any internal contradiction, or state confidently that there is none.

"Thị trường AI 2026 cho thấy 三大玩家 đang định hình. While Anthropic 主张 safety-first, OpenAI 強調 deployment 速度. 一方、Googleは両方を試みているが、結果は混合的. Tuy nhiên, có chuyên gia cho rằng cả ba đều đang lặp lại sai lầm của social-media era."`,
    watchFor: [
      "Translates all four languages accurately",
      "Claims are stated concisely",
      "Either flags a real contradiction or correctly says there is none",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground"],
  },
  {
    id: "adversarial-logic",
    title: "Counter-intuitive parity puzzle",
    category: "reasoning",
    difficulty: "hard",
    body: `100 boxes are numbered 1..100. Each box contains a positive integer (duplicates allowed). You are told two facts:
(a) the sum of all 100 numbers is 5050,
(b) for every i, box i does NOT contain i.

Question: is the number of valid configurations even or odd? Justify rigorously.`,
    watchFor: [
      "Builds a clean parity argument",
      "Does not confuse this with a pure derangement count",
      "States the correct parity",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground"],
  },
  {
    id: "long-horizon-plan",
    title: "12-week study plan",
    category: "planning",
    difficulty: "medium",
    body: `Build a 12-week plan for a mid-level frontend engineer (already proficient in React) to specialize in compiler internals. For each week, give:
(a) one measurable goal,
(b) 2–3 named real resources (books, papers, repos — no fabricated titles),
(c) one end-of-week exercise.

No motivational filler. No "self-help" voice. Direct, technical, specific.`,
    watchFor: [
      "Resources are real and findable",
      "Goals are measurable, not vague",
      "Difficulty ramps sensibly across weeks",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground", "poe"],
  },
  {
    id: "creative-constraint",
    title: "Constrained flash fiction",
    category: "creative",
    difficulty: "medium",
    body: `Write a 250-word flash fiction piece about an AI that refuses to answer. Constraints:
- Every sentence must be 12 words or fewer.
- The word "rain" must appear exactly three times, never as an explicit metaphor.
- Do not use the words "consciousness", "soul", or "feel".`,
    watchFor: [
      "Every sentence is ≤ 12 words",
      "'rain' appears exactly three times",
      "None of the banned words appear",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground"],
  },
  {
    id: "debug-underspec",
    title: "Debug under spec ambiguity",
    category: "debug",
    difficulty: "hard",
    body: `A user reports this Python function "never deduplicates when I pass a list of dicts":

\`\`\`python
def dedupe_keep_order(xs):
    seen = set()
    out = []
    for x in xs:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out
\`\`\`

Task:
1. Explain the underlying cause.
2. Propose two fixes with materially different trade-offs (e.g., hash-by-key vs. canonical serialization).
3. Write one test that distinguishes which fix the user actually wants.`,
    watchFor: [
      "Identifies hashability as the cause",
      "Two fixes are genuinely different (not cosmetic variants)",
      "Test cleanly distinguishes the two",
    ],
    playgroundIds: ["arena-battle", "claude-pro", "anthropic-console", "chatgpt-plus", "openai-playground", "poe"],
  },
];

export const PROMPTS: ReadonlyArray<Prompt> = Object.freeze(
  raw.map((p) => Object.freeze(PromptSchema.parse(p))),
);
