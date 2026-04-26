import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PillCta } from "@/components/ui/identity/pill-cta";

describe("PillCta", () => {
  it("renders as an anchor when href is provided", () => {
    render(<PillCta href="/submit">Submit a run</PillCta>);
    const link = screen.getByRole("link", { name: /submit a run/i });
    expect(link).toHaveAttribute("href", "/submit");
  });

  it("renders as a button when onClick is provided", () => {
    const onClick = vi.fn();
    render(<PillCta onClick={onClick}>Filter</PillCta>);
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders the default arrow glyph", () => {
    render(<PillCta href="/x">Go</PillCta>);
    expect(screen.getByText("→")).toBeInTheDocument();
  });
});
