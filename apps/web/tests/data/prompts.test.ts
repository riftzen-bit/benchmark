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
  it("has 7 playgrounds", () => {
    expect(PLAYGROUNDS.length).toBe(7);
  });

  it("ids are unique", () => {
    const ids = PLAYGROUNDS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every playground has a non-empty models description", () => {
    for (const p of PLAYGROUNDS) {
      expect(p.models.length).toBeGreaterThan(0);
    }
  });

  it("at least one playground is free without account", () => {
    const noAccount = PLAYGROUNDS.filter((p) => p.cost === "free-no-account");
    expect(noAccount.length).toBeGreaterThan(0);
  });
});
