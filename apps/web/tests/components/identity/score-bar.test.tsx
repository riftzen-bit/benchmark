import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBar } from "@/components/ui/identity/score-bar";

describe("ScoreBar", () => {
  it("renders the value to one decimal", () => {
    render(<ScoreBar value={85.34} />);
    expect(screen.getByText("85.3")).toBeInTheDocument();
  });

  it("sets the fill width to value/max as a percentage", () => {
    const { container } = render(<ScoreBar value={50} max={200} />);
    const fill = container.querySelector("[data-fill]") as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("clamps over-max to 100%", () => {
    const { container } = render(<ScoreBar value={150} max={100} />);
    const fill = container.querySelector("[data-fill]") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });
});
