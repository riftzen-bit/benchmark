import { z } from "zod";

const PricingSchema = z.object({
  prompt: z.string().optional(),
  completion: z.string().optional(),
});

const ArchitectureSchema = z.object({
  modality: z.string().optional(),
  input_modalities: z.array(z.string()).optional(),
  output_modalities: z.array(z.string()).optional(),
});

const RawModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  context_length: z.number().nullable().optional(),
  created: z.number().nullable().optional(),
  architecture: ArchitectureSchema.optional(),
  pricing: PricingSchema.optional(),
});

const ResponseSchema = z.object({ data: z.array(z.unknown()) });

export type Modality = "text" | "multimodal";

export interface OpenRouterModel {
  id: string;
  vendor: string;
  family: string;
  displayName: string;
  contextK: number | null;
  promptUSDPerMtok: number | null;
  completionUSDPerMtok: number | null;
  modality: Modality;
  createdAt: string | null;
}

const FALLBACK: ReadonlyArray<OpenRouterModel> = Object.freeze([
  fb("anthropic/claude-opus-4-7", "Claude Opus 4.7", 1000, 15, 75, "multimodal", "2026-04-16"),
  fb("openai/gpt-5.5", "GPT-5.5", 1050, 5, 30, "multimodal", "2026-04-23"),
  fb("openai/gpt-5.5-pro", "GPT-5.5 Pro", 1050, 30, 180, "multimodal", "2026-04-23"),
  fb("google/gemini-3-pro", "Gemini 3 Pro", 2000, 1.25, 5, "multimodal", "2026-02-01"),
  fb("meta-llama/llama-4-405b-instruct", "Llama 4 405B Instruct", 256, 0.9, 0.9, "text", "2025-12-01"),
  fb("deepseek/deepseek-v4-pro", "DeepSeek V4 Pro", 1024, 0.435, 0.87, "text", "2026-04-23"),
  fb("deepseek/deepseek-v4-flash", "DeepSeek V4 Flash", 131, 0.1, 0.3, "text", "2026-04-23"),
  fb("qwen/qwen3-next-80b-a3b-instruct", "Qwen3 Next 80B Instruct", 256, 0.4, 0.6, "text", "2026-04-19"),
  fb("mistralai/mistral-large-2503", "Mistral Large", 128, 2, 6, "text", "2026-03-01"),
  fb("xai/grok-4", "Grok 4", 256, 5, 15, "multimodal", "2026-02-15"),
  fb("cohere/command-r-plus", "Command R+", 128, 2.5, 10, "text", "2025-08-01"),
  fb("microsoft/phi-4-mini", "Phi-4 Mini", 128, 0.07, 0.14, "text", "2026-04-08"),
]);

function fb(
  id: string,
  displayName: string,
  contextK: number,
  prompt: number,
  completion: number,
  modality: Modality,
  createdAt: string,
): OpenRouterModel {
  const [vendor, family] = id.includes("/") ? id.split("/") : ["", id];
  return {
    id,
    vendor: vendor ?? "",
    family: family ?? id,
    displayName,
    contextK,
    promptUSDPerMtok: prompt,
    completionUSDPerMtok: completion,
    modality,
    createdAt,
  };
}

interface FetchOpts {
  limit?: number;
  signal?: AbortSignal;
}

export async function fetchOpenRouterModels(
  opts: FetchOpts = {},
): Promise<ReadonlyArray<OpenRouterModel>> {
  const limit = Math.max(1, Math.min(500, opts.limit ?? 200));
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4500);
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      signal: opts.signal ?? ac.signal,
      headers: { accept: "application/json" },
      next: { revalidate: 3600 },
    });
    clearTimeout(t);
    if (!res.ok) return FALLBACK.slice(0, limit);
    const json = (await res.json()) as unknown;
    const wrapper = ResponseSchema.safeParse(json);
    if (!wrapper.success) return FALLBACK.slice(0, limit);
    const out: OpenRouterModel[] = [];
    for (const raw of wrapper.data.data) {
      const parsed = RawModelSchema.safeParse(raw);
      if (!parsed.success) continue;
      const m = toModel(parsed.data);
      if (m) out.push(m);
    }
    if (out.length === 0) return FALLBACK.slice(0, limit);
    return Object.freeze(out.slice(0, limit));
  } catch {
    return FALLBACK.slice(0, limit);
  }
}

function toModel(r: z.infer<typeof RawModelSchema>): OpenRouterModel | null {
  const id = r.id;
  const [vendor, family] = id.includes("/") ? id.split("/") : ["", id];
  const ctx = r.context_length ?? null;
  const contextK = ctx ? Math.round(ctx / 1000) : null;
  const prompt = parsePerTokenPrice(r.pricing?.prompt);
  const completion = parsePerTokenPrice(r.pricing?.completion);
  const modality = inferModality(r.architecture);
  const createdAt = r.created ? new Date(r.created * 1000).toISOString().slice(0, 10) : null;
  return {
    id,
    vendor: vendor ?? "",
    family: family ?? id,
    displayName: r.name ?? id,
    contextK,
    promptUSDPerMtok: prompt,
    completionUSDPerMtok: completion,
    modality,
    createdAt,
  };
}

function parsePerTokenPrice(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 1_000_000 * 1000) / 1000;
}

function inferModality(a: z.infer<typeof ArchitectureSchema> | undefined): Modality {
  const inputs = a?.input_modalities ?? [];
  const hasNonText = inputs.some((m) => m !== "text");
  if (hasNonText) return "multimodal";
  const mod = a?.modality ?? "";
  if (/image|audio|file|video/i.test(mod)) return "multimodal";
  return "text";
}

export const OPENROUTER_FALLBACK = FALLBACK;
