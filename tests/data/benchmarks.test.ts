import { describe, it, expect } from "vitest";
import { BENCHMARKS } from "@/lib/data/benchmarks";
import { SOURCES, sourceById } from "@/lib/data/sources";

describe("benchmarks dataset", () => {
  it("loads without throwing (Zod validates) and has 20 rows", () => {
    expect(BENCHMARKS.length).toBe(20);
  });

  it("every sourceId references a real source", () => {
    for (const row of BENCHMARKS) {
      for (const sid of row.sourceIds) {
        expect(sourceById(sid), `sourceId ${sid} from ${row.id}`).toBeDefined();
      }
    }
  });

  it("ids are unique", () => {
    const ids = BENCHMARKS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all sources have valid URLs", () => {
    for (const s of SOURCES) {
      expect(s.url).toMatch(/^https?:\/\//);
    }
  });
});
