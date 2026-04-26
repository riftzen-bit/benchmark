import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BentoGrid, type BentoCell } from "@/components/ui/identity/bento-grid";

const cells: BentoCell[] = [
  { category: "Coding", value: "87.6", winner: "opus-4-7", vendor: "anthropic", meta: "42 runs", spark: [1,2,3], sparkTrend: "up" },
  { category: "Vision", value: "82.1", winner: "opus-4-7", vendor: "anthropic", meta: "14 runs", spark: [1,1,1], sparkTrend: "flat" },
];

describe("BentoGrid", () => {
  it("renders one cell per item", () => {
    const { container } = render(<BentoGrid cells={cells} highlightIndex={0} />);
    expect(container.querySelectorAll("[data-bento-cell]")).toHaveLength(2);
  });

  it("inverts the highlighted cell", () => {
    const { container } = render(<BentoGrid cells={cells} highlightIndex={0} />);
    const cell0 = container.querySelectorAll("[data-bento-cell]")[0];
    expect(cell0?.getAttribute("data-highlight")).toBe("true");
  });
});
