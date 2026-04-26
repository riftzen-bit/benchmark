import {
  fetchOpenRouterModels,
  OPENROUTER_FALLBACK,
  type OpenRouterModel,
} from "./openrouter";
import {
  fetchTrendingHFModels,
  TRENDING_FALLBACK,
  type TrendingHFModel,
} from "./huggingface";

export interface PulseSnapshot {
  models: ReadonlyArray<OpenRouterModel>;
  hf: ReadonlyArray<TrendingHFModel>;
  updatedAt: string;
  sources: { or: "live" | "fallback"; hf: "live" | "fallback" };
}

export async function loadPulseSnapshot(): Promise<PulseSnapshot> {
  const [orResult, hfResult] = await Promise.allSettled([
    fetchOpenRouterModels({ limit: 300 }),
    fetchTrendingHFModels({ limit: 12 }),
  ]);

  const or =
    orResult.status === "fulfilled" && orResult.value.length > 0
      ? { models: orResult.value, status: "live" as const }
      : { models: OPENROUTER_FALLBACK, status: "fallback" as const };

  const hf =
    hfResult.status === "fulfilled" && hfResult.value.length > 0
      ? { models: hfResult.value, status: "live" as const }
      : { models: TRENDING_FALLBACK, status: "fallback" as const };

  return {
    models: or.models,
    hf: hf.models,
    updatedAt: new Date().toISOString(),
    sources: { or: or.status, hf: hf.status },
  };
}
