import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: vi.fn(),
}));

import { getSupabaseServer } from "@/lib/supabase/server";
import { requireUser, getUser } from "@/lib/auth/session";

const mocked = vi.mocked(getSupabaseServer);

describe("session helpers", () => {
  beforeEach(() => mocked.mockReset());

  it("getUser returns null when supabase has no user", async () => {
    mocked.mockResolvedValueOnce({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(await getUser()).toBeNull();
  });

  it("requireUser throws when no user", async () => {
    mocked.mockResolvedValueOnce({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    await expect(requireUser()).rejects.toThrow();
  });

  it("requireUser returns user when present", async () => {
    const user = { id: "abc", email: "x@y.z" };
    mocked.mockResolvedValueOnce({
      auth: { getUser: async () => ({ data: { user }, error: null }) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(await requireUser()).toEqual(user);
  });
});
