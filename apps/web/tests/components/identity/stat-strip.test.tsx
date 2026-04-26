import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatStrip } from "@/components/ui/identity/stat-strip";

describe("StatStrip", () => {
  it("renders each stat with label, value, and sub", () => {
    render(
      <StatStrip
        stats={[
          { label: "runs · 7d", value: "141", sub: "+38 vs prior", subTone: "pos" },
          { label: "models", value: "9", sub: "2 added this wk" },
        ]}
      />
    );
    expect(screen.getByText("141")).toBeInTheDocument();
    expect(screen.getByText("+38 vs prior")).toHaveClass("text-[var(--pos)]");
  });
});
