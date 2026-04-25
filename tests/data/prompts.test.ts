import { describe, it, expect } from "vitest";
import { PROMPTS } from "@/lib/data/prompts";
import { PLAYGROUNDS, playgroundById } from "@/lib/data/playgrounds";

describe("prompts dataset", () => {
  it("has 10 prompts", () => {
    expect(PROMPTS.length).toBe(10);
  });

  it("ids are unique", () => {
    const ids = PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every playgroundId references a real playground", () => {
    for (const prompt of PROMPTS) {
      for (const pid of prompt.playgroundIds) {
        expect(
          playgroundById(pid),
          `playgroundId ${pid} from ${prompt.id}`,
        ).toBeDefined();
      }
    }
  });
});

describe("playgrounds dataset", () => {
  it("has 5 playgrounds", () => {
    expect(PLAYGROUNDS.length).toBe(5);
  });

  it("ids are unique", () => {
    const ids = PLAYGROUNDS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("free playgrounds (no account) have models marked appropriately", () => {
    const free = PLAYGROUNDS.filter((p) => !p.needsAccount);
    expect(free.length).toBeGreaterThan(0);
    for (const p of free) {
      expect(p.models.length).toBeGreaterThan(0);
    }
  });
});
