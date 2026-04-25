import { describe, it, expect } from "vitest";
import { PromptSchema } from "@/lib/schema/prompt";

describe("PromptSchema", () => {
  it("accepts a valid prompt", () => {
    expect(() =>
      PromptSchema.parse({
        id: "long-context-recall",
        title: "Long-context fact retrieval",
        category: "reasoning",
        difficulty: "hard",
        body: "Given this 200k-token document, find the line that mentions ...",
        watchFor: ["Cites the right line", "Does not hallucinate adjacent text"],
        playgroundIds: ["lmarena", "duckai"],
      }),
    ).not.toThrow();
  });

  it("rejects empty body", () => {
    expect(() =>
      PromptSchema.parse({
        id: "x",
        title: "x",
        category: "coding",
        difficulty: "easy",
        body: "",
        watchFor: [],
        playgroundIds: ["lmarena"],
      }),
    ).toThrow();
  });
});
