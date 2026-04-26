import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavPill } from "@/components/ui/identity/nav-pill";

const items = [
  { href: "/", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
];

describe("NavPill", () => {
  it("renders every item as a link", () => {
    render(<NavPill items={items} active="/" />);
    for (const it of items) {
      const link = screen.getByRole("link", { name: it.label });
      expect(link).toHaveAttribute("href", it.href);
    }
  });

  it("marks the active item", () => {
    render(<NavPill items={items} active="/leaderboard" />);
    const active = screen.getByRole("link", { name: "Leaderboard" });
    expect(active.className).toMatch(/text-cream\b|text-\[var\(--cream\)\]/);
  });

  it("renders a pulsing live dot when liveDotOn is true", () => {
    const { container } = render(<NavPill items={items} active="/" liveDotOn />);
    const dot = container.querySelector('[data-pulse="live"]');
    expect(dot).not.toBeNull();
  });

  it("does not render the live dot when liveDotOn is false", () => {
    const { container } = render(<NavPill items={items} active="/" />);
    expect(container.querySelector('[data-pulse="live"]')).toBeNull();
  });

  it("renders a Sign in slot at the end", () => {
    render(<NavPill items={items} active="/" signedInAs={null} />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the username (truncated) when signedInAs is provided", () => {
    render(<NavPill items={items} active="/" signedInAs="aria_w" />);
    expect(screen.getByText("aria_w")).toBeInTheDocument();
  });
});
