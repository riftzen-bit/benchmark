import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "@/components/ui/identity/sparkline";

describe("Sparkline", () => {
  it("renders one bar per value", () => {
    const { container } = render(<Sparkline values={[1, 2, 3, 4, 5]} />);
    expect(container.querySelectorAll("[data-bar]")).toHaveLength(5);
  });

  it("tints the last bar by trend", () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} trend="up" />);
    const bars = container.querySelectorAll("[data-bar]");
    expect(bars[bars.length - 1]?.getAttribute("data-trend")).toBe("up");
  });
});
