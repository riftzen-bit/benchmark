import { PlaygroundSchema, type Playground } from "@/lib/schema/prompt";

const raw: Playground[] = [
  {
    id: "lmarena",
    label: "LMArena (Battle)",
    url: "https://lmarena.ai/?mode=battle",
    needsAccount: false,
    models: ["anonymous"],
    note: "Cả hai model có thể xuất hiện ẩn danh trong battle mode. Refresh tới khi gặp.",
  },
  {
    id: "duckai",
    label: "Duck.ai",
    url: "https://duck.ai",
    needsAccount: false,
    models: ["both"],
    note: "Truy cập miễn phí Claude và GPT, không cần đăng ký, có cảnh báo riêng tư.",
  },
  {
    id: "claude-ai",
    label: "Claude.ai (free tier)",
    url: "https://claude.ai/new",
    needsAccount: true,
    models: ["opus-4-7"],
    note: "Free tier đôi khi không cho dùng Opus. Cần Claude Pro để chắc chắn.",
  },
  {
    id: "chatgpt",
    label: "ChatGPT (free tier)",
    url: "https://chatgpt.com/",
    needsAccount: true,
    models: ["gpt-5-5"],
    note: "Free tier có giới hạn lượt với GPT-5.5. Hết quota tự rớt xuống model nhẹ hơn.",
  },
  {
    id: "copilot-ms",
    label: "Microsoft Copilot",
    url: "https://copilot.microsoft.com/",
    needsAccount: true,
    models: ["gpt-5-5"],
    note: "Truy cập GPT-5.5 qua Microsoft, cần tài khoản MS miễn phí.",
  },
];

export const PLAYGROUNDS: ReadonlyArray<Playground> = Object.freeze(
  raw.map((p) => Object.freeze(PlaygroundSchema.parse(p))),
);

export function playgroundById(id: string): Playground | undefined {
  return PLAYGROUNDS.find((p) => p.id === id);
}
