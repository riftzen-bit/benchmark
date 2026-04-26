import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SegmentedControl } from "@/components/ui/identity/segmented-control";

const opts = [
  { value: "all", label: "All" },
  { value: "coding", label: "Coding" },
  { value: "reasoning", label: "Reasoning" },
];

describe("SegmentedControl", () => {
  it("renders one button per option", () => {
    render(<SegmentedControl options={opts} value="all" onChange={() => {}} />);
    for (const o of opts) {
      expect(screen.getByRole("button", { name: o.label })).toBeInTheDocument();
    }
  });

  it("marks the active option with aria-pressed", () => {
    render(<SegmentedControl options={opts} value="coding" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Coding" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the option value on click", () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={opts} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Reasoning" }));
    expect(onChange).toHaveBeenCalledWith("reasoning");
  });
});
