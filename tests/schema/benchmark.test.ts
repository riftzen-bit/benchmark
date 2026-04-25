import { describe, it, expect } from "vitest";
import { BenchmarkRowSchema, BenchmarkCategory } from "@/lib/schema/benchmark";

describe("BenchmarkRowSchema", () => {
  it("accepts a complete row", () => {
    const row = {
      id: "swe-bench-verified",
      label: "SWE-bench Verified",
      category: "coding" as const,
      opus: 87.6,
      gpt: 85.0,
      unit: "%" as const,
      sourceIds: ["vellum"],
      capturedAt: "2026-04-25",
      higherIsBetter: true,
    };
    expect(BenchmarkRowSchema.parse(row)).toMatchObject({ id: "swe-bench-verified" });
  });

  it("accepts null for missing model score", () => {
    const row = {
      id: "gdpval",
      label: "GDPval",
      category: "agent" as const,
      opus: null,
      gpt: 84.9,
      unit: "%" as const,
      sourceIds: ["openai-release"],
      capturedAt: "2026-04-25",
      higherIsBetter: true,
    };
    expect(() => BenchmarkRowSchema.parse(row)).not.toThrow();
  });

  it("rejects unknown category", () => {
    expect(() =>
      BenchmarkRowSchema.parse({
        id: "x",
        label: "X",
        category: "bogus",
        opus: 1,
        gpt: 1,
        unit: "%",
        sourceIds: ["a"],
        capturedAt: "2026-04-25",
        higherIsBetter: true,
      }),
    ).toThrow();
  });

  it("exposes the BenchmarkCategory enum values", () => {
    expect(BenchmarkCategory.options).toContain("coding");
    expect(BenchmarkCategory.options).toContain("reasoning");
  });
});
