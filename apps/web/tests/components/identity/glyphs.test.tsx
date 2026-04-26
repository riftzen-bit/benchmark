import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  VoteGlyph, FlagGlyph, ShareGlyph, CopyGlyph,
  SortGlyph, FilterGlyph, SearchGlyph, ExternalLinkGlyph,
} from "@/components/ui/glyphs";

const all = { VoteGlyph, FlagGlyph, ShareGlyph, CopyGlyph, SortGlyph, FilterGlyph, SearchGlyph, ExternalLinkGlyph };

describe("glyph set", () => {
  it("exports exactly 8 glyph components", () => {
    expect(Object.keys(all)).toHaveLength(8);
  });

  for (const [name, Cmp] of Object.entries(all)) {
    it(`${name} renders an svg w/ currentColor stroke`, () => {
      const { container } = render(<Cmp />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute("stroke")).toBe("currentColor");
      expect(svg?.getAttribute("fill")).toBe("none");
      expect(svg?.getAttribute("viewBox")).toBe("0 0 16 16");
    });
  }

  it("VoteGlyph supports a `direction` prop that flips the path vertically", () => {
    const { container } = render(<VoteGlyph direction="down" />);
    const g = container.querySelector("g");
    expect(g?.getAttribute("transform")).toContain("scale(1,-1)");
  });
});
