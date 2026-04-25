// Vendor metadata used across model + leaderboard surfaces.
// Keep label + url stable; swatch is a perceptual chip, not the official brand color.

export type Vendor = {
  id: string;
  label: string;
  url: string;
  swatch: string;
  blurb: string;
};

export const VENDORS: Vendor[] = [
  { id: "anthropic",  label: "Anthropic",  url: "https://anthropic.com",       swatch: "#D97757", blurb: "Claude family. Constitutional-AI lineage." },
  { id: "openai",     label: "OpenAI",     url: "https://openai.com",          swatch: "#10A37F", blurb: "GPT, o-series, gpt-oss open weights." },
  { id: "google",     label: "Google",     url: "https://deepmind.google",     swatch: "#4285F4", blurb: "Gemini + Gemma. Native multimodal, 2M context." },
  { id: "meta",       label: "Meta",       url: "https://ai.meta.com",         swatch: "#1877F2", blurb: "Llama family. Open weights, permissive license." },
  { id: "mistral",    label: "Mistral",    url: "https://mistral.ai",          swatch: "#FA552E", blurb: "Mistral, Magistral, Devstral, Codestral. EU-based." },
  { id: "deepseek",   label: "DeepSeek",   url: "https://deepseek.com",        swatch: "#4D6BFE", blurb: "DeepSeek V/R lines. Open weights, MoE." },
  { id: "xai",        label: "xAI",        url: "https://x.ai",                swatch: "#0F0F0F", blurb: "Grok family. Real-time X access." },
  { id: "alibaba",    label: "Alibaba",    url: "https://qwenlm.github.io",    swatch: "#FF6A00", blurb: "Qwen + QwQ. Open weights, multilingual." },
  { id: "moonshot",   label: "Moonshot AI",url: "https://www.moonshot.ai",     swatch: "#0A8AFF", blurb: "Kimi family. Long context specialists." },
  { id: "zai",        label: "Z.AI",       url: "https://z.ai",                swatch: "#5145CD", blurb: "GLM family. Open agentic models." },
  { id: "cohere",     label: "Cohere",     url: "https://cohere.com",          swatch: "#39594D", blurb: "Command-R / Command-A. Retrieval-tuned for enterprise." },
  { id: "ai21",       label: "AI21",       url: "https://www.ai21.com",        swatch: "#A6122B", blurb: "Jamba. SSM/transformer hybrid." },
  { id: "01ai",       label: "01.AI",      url: "https://www.01.ai",           swatch: "#1F6FEB", blurb: "Yi family. Bilingual EN/ZH." },
  { id: "microsoft",  label: "Microsoft",  url: "https://azure.microsoft.com", swatch: "#0078D4", blurb: "Phi family. Small models, strong reasoning." },
  { id: "ibm",        label: "IBM",        url: "https://www.ibm.com/granite", swatch: "#0F62FE", blurb: "Granite. Enterprise open weights." },
  { id: "stepfun",    label: "StepFun",    url: "https://www.stepfun.com",     swatch: "#FF5C00", blurb: "Step series. Multimodal." },
  { id: "reka",       label: "Reka",       url: "https://reka.ai",             swatch: "#7C3AED", blurb: "Reka Core / Flash. Multimodal." },
  { id: "perplexity", label: "Perplexity", url: "https://www.perplexity.ai",   swatch: "#1FB8CD", blurb: "Sonar. Online-grounded answers." },
];

export const VENDOR_BY_ID: Record<string, Vendor> = Object.fromEntries(
  VENDORS.map((v) => [v.id, v]),
);

export function vendorLabel(id: string): string {
  return VENDOR_BY_ID[id]?.label ?? id;
}
