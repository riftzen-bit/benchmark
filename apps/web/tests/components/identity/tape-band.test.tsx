import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TapeBand, type TapeItem } from "@/components/ui/identity/tape-band";

const items: TapeItem[] = [
  { time: "14:42", model: "opus-4-7", task: "swe-bench", score: 64.3, delta: 0.4 },
  { time: "14:41", model: "gpt-5.5", task: "terminal-bench", score: 82.7, delta: 1.1 },
];

describe("TapeBand", () => {
  it("renders each item twice (for seamless loop)", () => {
    const { container } = render(<TapeBand items={items} />);
    const blocks = container.querySelectorAll('[data-tape-item="true"]');
    expect(blocks).toHaveLength(items.length * 2);
  });

  it("marks positive delta as pos, negative as neg, zero as zero", () => {
    const three: TapeItem[] = [
      { time: "1", model: "a", task: "t", score: 1, delta: 0.5 },
      { time: "2", model: "b", task: "t", score: 1, delta: -0.5 },
      { time: "3", model: "c", task: "t", score: 1, delta: 0 },
    ];
    const { container } = render(<TapeBand items={three} />);
    expect(container.querySelector('[data-delta="pos"]')).not.toBeNull();
    expect(container.querySelector('[data-delta="neg"]')).not.toBeNull();
    expect(container.querySelector('[data-delta="zero"]')).not.toBeNull();
  });
});
