import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable, type Column } from "@/components/ui/identity/data-table";

type R = { id: string; name: string; score: number };
const cols: Column<R>[] = [
  { key: "name", header: "Name", align: "left" },
  { key: "score", header: "Score", align: "right" },
];
const rows: R[] = [{ id: "a", name: "opus-4-7", score: 87.6 }];

describe("DataTable", () => {
  it("renders headers + cells", () => {
    render(<DataTable rowKey={(r) => r.id} columns={cols} rows={rows} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("opus-4-7")).toBeInTheDocument();
    expect(screen.getByText("87.6")).toBeInTheDocument();
  });
});
