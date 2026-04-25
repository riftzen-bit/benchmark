import { describe, it, expect } from "vitest";
import { SignUpSchema, SignInSchema, ProfileSchema } from "@/lib/auth/schema";

describe("SignUpSchema", () => {
  it("accepts strong password + valid email", () => {
    expect(SignUpSchema.safeParse({ email: "a@b.co", password: "abcd1234!" }).success).toBe(true);
  });
  it("rejects short password", () => {
    expect(SignUpSchema.safeParse({ email: "a@b.co", password: "abc" }).success).toBe(false);
  });
  it("rejects invalid email", () => {
    expect(SignUpSchema.safeParse({ email: "nope", password: "abcd1234!" }).success).toBe(false);
  });
});

describe("SignInSchema", () => {
  it("requires both fields", () => {
    expect(SignInSchema.safeParse({ email: "a@b.co" }).success).toBe(false);
  });
});

describe("ProfileSchema", () => {
  it("accepts valid handle", () => {
    expect(
      ProfileSchema.safeParse({ username: "good_handle1", display_name: "X", bio: "" }).success,
    ).toBe(true);
  });
  it("rejects spaces in username", () => {
    expect(
      ProfileSchema.safeParse({ username: "no spaces", display_name: "", bio: "" }).success,
    ).toBe(false);
  });
  it("rejects too-short username", () => {
    expect(
      ProfileSchema.safeParse({ username: "ab", display_name: "", bio: "" }).success,
    ).toBe(false);
  });
});
