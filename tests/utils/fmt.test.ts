import { describe, it, expect } from "vitest";
import { formatScore, formatDelta, formatPrice } from "@/lib/utils/fmt";

describe("formatScore", () => {
  it("appends % unit", () => {
    expect(formatScore(87.6, "%")).toBe("87.6%");
  });
  it("renders 'n/a' for null", () => {
    expect(formatScore(null, "%")).toBe("n/a");
  });
  it("renders price with $/Mtok unit", () => {
    expect(formatScore(25, "$/Mtok")).toBe("$25.00 / Mtok");
  });
  it("renders elo without decimals", () => {
    expect(formatScore(1402, "elo")).toBe("1402");
  });
});

describe("formatDelta", () => {
  it("prefixes + for positive", () => {
    expect(formatDelta(2.6)).toBe("+2.6");
  });
  it("renders dash for null", () => {
    expect(formatDelta(null)).toBe("—");
  });
  it("renders 0.0 for tie", () => {
    expect(formatDelta(0)).toBe("0.0");
  });
  it("renders 0.0 (no negative zero) for small negative deltas", () => {
    expect(formatDelta(-0.04)).toBe("0.0");
  });
});

describe("formatPrice", () => {
  it("formats per Mtok", () => {
    expect(formatPrice(5)).toBe("$5.00");
    expect(formatPrice(30)).toBe("$30.00");
  });
});
