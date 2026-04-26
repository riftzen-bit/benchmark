import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Display } from "@/components/ui/identity/display";

describe("Display", () => {
  it("renders one span per word", () => {
    const { container } = render(<Display level="lg">Tape board live</Display>);
    const spans = container.querySelectorAll("h1 > span > span.word-up");
    expect(spans).toHaveLength(3);
  });

  it("appends the footnote mark as superscript when provided", () => {
    render(<Display level="lg" footnoteMark="†">Tape</Display>);
    expect(screen.getByText("†")).toBeInTheDocument();
  });

  it("applies the size class for the chosen level", () => {
    const { container } = render(<Display level="xl">Frontier</Display>);
    expect(container.firstChild).toHaveClass("display-xl");
  });
});
