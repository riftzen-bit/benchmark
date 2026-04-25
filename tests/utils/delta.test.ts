import { describe, it, expect } from "vitest";
import { winnerOf, deltaOf, signedAdvantage } from "@/lib/utils/delta";

describe("winnerOf", () => {
  it("returns 'opus' when opus higher and higher is better", () => {
    expect(winnerOf({ opus: 90, gpt: 80, higherIsBetter: true })).toBe("opus");
  });
  it("returns 'gpt' when gpt higher and higher is better", () => {
    expect(winnerOf({ opus: 70, gpt: 80, higherIsBetter: true })).toBe("gpt");
  });
  it("returns 'tie' when within 0.5 absolute units", () => {
    expect(winnerOf({ opus: 80.0, gpt: 80.4, higherIsBetter: true })).toBe("tie");
  });
  it("inverts when higher is worse (e.g. price)", () => {
    expect(winnerOf({ opus: 25, gpt: 30, higherIsBetter: false })).toBe("opus");
  });
  it("returns 'na' when either is null", () => {
    expect(winnerOf({ opus: null, gpt: 80, higherIsBetter: true })).toBe("na");
  });
});

describe("deltaOf", () => {
  it("returns signed delta opus - gpt", () => {
    expect(deltaOf(87.6, 85)).toBeCloseTo(2.6, 5);
  });
  it("returns null if either side missing", () => {
    expect(deltaOf(null, 80)).toBeNull();
    expect(deltaOf(80, null)).toBeNull();
  });
});

describe("signedAdvantage", () => {
  it("returns 0 when either side is null", () => {
    expect(signedAdvantage({ opus: null, gpt: 80, higherIsBetter: true })).toBe(0);
    expect(signedAdvantage({ opus: 80, gpt: null, higherIsBetter: true })).toBe(0);
  });
  it("returns positive when Opus leads on a higher-is-better metric", () => {
    expect(signedAdvantage({ opus: 90, gpt: 80, higherIsBetter: true })).toBe(10);
  });
  it("returns negative when GPT leads on a higher-is-better metric", () => {
    expect(signedAdvantage({ opus: 70, gpt: 80, higherIsBetter: true })).toBe(-10);
  });
  it("inverts sign when higher is worse (e.g. price)", () => {
    expect(signedAdvantage({ opus: 25, gpt: 30, higherIsBetter: false })).toBe(5);
    expect(signedAdvantage({ opus: 30, gpt: 25, higherIsBetter: false })).toBe(-5);
  });
});
