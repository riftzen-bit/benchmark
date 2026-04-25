import { z } from "zod";

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});
export type SignUpInput = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type SignInInput = z.infer<typeof SignInSchema>;

export const ProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/i, "letters, digits, underscore only"),
  display_name: z.string().max(64),
  bio: z.string().max(280),
  avatar_url: z.union([z.string().url(), z.literal("")]).optional(),
});
export type ProfileInput = z.infer<typeof ProfileSchema>;
