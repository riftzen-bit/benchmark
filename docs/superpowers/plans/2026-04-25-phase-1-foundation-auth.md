# Phase 1 — Foundation + Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Supabase (Auth + Postgres + Storage) into the existing Next.js 15 app, install canonical schema with RLS, and ship working email + Google sign-in / sign-out / profile flow without breaking existing pages.

**Architecture:** Three Supabase clients (server / browser / middleware) per `@supabase/ssr` v0.5+ patterns. Session refresh in `middleware.ts`. RLS-only DB access from app code; service role only inside scripts and explicitly opted-in route handlers. Schema lives in `supabase/migrations/`, applied via `supabase db push`. Static-data pages from the pre-rebuild keep working until Phase 2 swaps them.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Bun, `@supabase/supabase-js` v2, `@supabase/ssr`, Zod, Vitest, Playwright.

---

## Pre-flight (one-time, manual — user runs these)

The agent cannot create cloud accounts. Document these as a setup runbook the user runs once before/during Task 1.

```bash
# 1. Install Supabase CLI (https://supabase.com/docs/guides/cli)
# 2. Create a Supabase project at https://supabase.com (free tier)
# 3. Locally:
bunx supabase login
bunx supabase init
bunx supabase link --project-ref <ref>
# 4. Vercel: import the repo, set env vars listed in .env.local.example
# 5. (optional, later) Google OAuth: configure provider in Supabase dashboard
```

The agent writes `.env.local.example`, the migrations, and the runbook in `README.md`. The user runs the steps above, fills `.env.local`, then `bunx supabase db push`.

---

## Task 1: Install dependencies + scaffolding

**Files:**
- Modify: `package.json`
- Create: `.env.local.example`
- Create: `supabase/.gitignore`
- Modify: `.gitignore`

- [ ] **Step 1: Install Supabase libs**

```bash
bun add @supabase/supabase-js @supabase/ssr
bun add -d supabase
```

- [ ] **Step 2: Create `.env.local.example`**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://postgres:PWD@db.YOUR-PROJECT.supabase.co:5432/postgres
```

- [ ] **Step 3: Update `.gitignore`** (already has `.env*`, add explicit Supabase tempfiles)

```
.env*
!.env.local.example

supabase/.temp/
supabase/.branches/
```

- [ ] **Step 4: Add `supabase/.gitignore`**

```
.branches
.temp
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add supabase deps + env template"
```

---

## Task 2: Initial schema migration

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Write `supabase/migrations/0001_init.sql`**

```sql
create extension if not exists citext;

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     citext unique not null,
  display_name text not null default '',
  avatar_url   text,
  bio          text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.models (
  id          text primary key,
  vendor      text not null,
  family      text not null,
  released_at date,
  context_k   integer,
  visible     boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.benchmark_categories (
  id    text primary key,
  label text not null
);

create table public.benchmark_tasks (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  category    text not null references public.benchmark_categories(id),
  body_md     text not null,
  rubric_md   text not null default '',
  author_id   uuid not null references public.profiles(id) on delete cascade,
  visibility  text not null default 'public' check (visibility in ('public','unlisted')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.benchmark_runs (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references public.benchmark_tasks(id) on delete cascade,
  model_id      text not null references public.models(id),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  score         numeric,
  unit          text not null default '%',
  evidence_kind text not null check (evidence_kind in ('url','screenshot','transcript')),
  evidence_url  text,
  notes_md      text not null default '',
  status        text not null default 'live' check (status in ('live','flagged','removed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.votes (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  run_id   uuid not null references public.benchmark_runs(id) on delete cascade,
  value    smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_id, run_id)
);

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  run_id     uuid not null references public.benchmark_runs(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body_md    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pings (
  id         bigserial primary key,
  pinged_at  timestamptz not null default now()
);

create index on public.benchmark_tasks (category);
create index on public.benchmark_runs (task_id);
create index on public.benchmark_runs (model_id);
create index on public.benchmark_runs (author_id);
create index on public.benchmark_runs (status);
create index on public.comments (run_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0001_init.sql
git commit -m "feat(db): initial schema"
```

---

## Task 3: Triggers (profile auto-create, updated_at)

**Files:**
- Create: `supabase/migrations/0002_triggers.sql`

- [ ] **Step 1: Write `supabase/migrations/0002_triggers.sql`**

```sql
-- updated_at touch trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_touch        before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger benchmark_tasks_touch before update on public.benchmark_tasks
  for each row execute function public.touch_updated_at();
create trigger benchmark_runs_touch  before update on public.benchmark_runs
  for each row execute function public.touch_updated_at();
create trigger comments_touch        before update on public.comments
  for each row execute function public.touch_updated_at();

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 10),
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0002_triggers.sql
git commit -m "feat(db): triggers — profile auto-create, updated_at"
```

---

## Task 4: RLS policies

**Files:**
- Create: `supabase/migrations/0003_rls.sql`

- [ ] **Step 1: Write `supabase/migrations/0003_rls.sql`**

```sql
alter table public.profiles            enable row level security;
alter table public.benchmark_tasks     enable row level security;
alter table public.benchmark_runs      enable row level security;
alter table public.votes               enable row level security;
alter table public.comments            enable row level security;
alter table public.models              enable row level security;
alter table public.benchmark_categories enable row level security;
alter table public.pings               enable row level security;

-- profiles: world-readable; only owner mutates
create policy "profiles_read"   on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- models / categories: world-readable; no client write
create policy "models_read"      on public.models      for select using (visible);
create policy "categories_read"  on public.benchmark_categories for select using (true);

-- tasks: public visible to all; unlisted needs slug knowledge (still read-permitted, rely on lookup); author writes
create policy "tasks_read"   on public.benchmark_tasks for select using (true);
create policy "tasks_insert" on public.benchmark_tasks for insert with check (auth.uid() = author_id);
create policy "tasks_update" on public.benchmark_tasks for update using (auth.uid() = author_id);
create policy "tasks_delete" on public.benchmark_tasks for delete using (auth.uid() = author_id);

-- runs: live readable to all; author writes; soft-delete via status
create policy "runs_read"   on public.benchmark_runs for select using (status = 'live' or auth.uid() = author_id);
create policy "runs_insert" on public.benchmark_runs for insert with check (auth.uid() = author_id);
create policy "runs_update" on public.benchmark_runs for update using (auth.uid() = author_id);

-- votes: read all; only voter writes own row
create policy "votes_read"   on public.votes for select using (true);
create policy "votes_insert" on public.votes for insert with check (auth.uid() = user_id);
create policy "votes_update" on public.votes for update using (auth.uid() = user_id);
create policy "votes_delete" on public.votes for delete using (auth.uid() = user_id);

-- comments: read all; author writes
create policy "comments_read"   on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments_update" on public.comments for update using (auth.uid() = author_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = author_id);

-- pings: insertable from server only (service role bypasses RLS)
create policy "pings_no_select" on public.pings for select using (false);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0003_rls.sql
git commit -m "feat(db): RLS policies"
```

---

## Task 5: Seed data

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Write `supabase/seed.sql`**

```sql
insert into public.benchmark_categories (id, label) values
  ('coding', 'Coding'),
  ('reasoning', 'Reasoning'),
  ('math', 'Math'),
  ('agent', 'Agent'),
  ('vision', 'Vision'),
  ('multilingual', 'Multilingual'),
  ('long-context', 'Long context'),
  ('creative', 'Creative'),
  ('debug', 'Debug'),
  ('planning', 'Planning'),
  ('knowledge', 'Knowledge'),
  ('safety', 'Safety'),
  ('speed', 'Speed'),
  ('price', 'Price')
on conflict (id) do nothing;

insert into public.models (id, vendor, family, released_at, context_k, visible) values
  ('claude-opus-4-7', 'anthropic', 'claude', '2026-04-16', 1000, true),
  ('gpt-5.5',          'openai',    'gpt',     '2026-04-23', 1000, true),
  ('claude-opus-4-6', 'anthropic', 'claude', '2025-09-01', 1000, true),
  ('gpt-5',            'openai',    'gpt',     '2025-08-01', 256,  true),
  ('gemini-3-pro',    'google',    'gemini', '2026-02-01', 2000, true),
  ('llama-4-405b',    'meta',      'llama',  '2025-12-01', 256,  true)
on conflict (id) do nothing;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat(db): seed categories + models"
```

---

## Task 6: Supabase clients

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/browser.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `lib/supabase/admin.ts`
- Create: `lib/db/types.ts`

- [ ] **Step 1: Write minimal `lib/db/types.ts` placeholder**

```ts
// Generated by `bunx supabase gen types typescript --linked > lib/db/types.ts`.
// This stub keeps the app building before the user runs the generator.
export type Database = {
  public: {
    Tables: Record<string, { Row: unknown; Insert: unknown; Update: unknown }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
```

- [ ] **Step 2: Write `lib/supabase/server.ts`**

```ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";

export async function getSupabaseServer() {
  const store = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options as CookieOptions);
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Write `lib/supabase/browser.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";

export function getSupabaseBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: Write `lib/supabase/middleware.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";

export async function updateSession(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) req.cookies.set(name, value);
          res = NextResponse.next({ request: req });
          for (const { name, value, options } of cookiesToSet) res.cookies.set(name, value, options);
        },
      },
    },
  );
  await supabase.auth.getUser();
  return res;
}
```

- [ ] **Step 5: Write `lib/supabase/admin.ts`**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

let cached: ReturnType<typeof createClient<Database>> | null = null;
export function getSupabaseAdmin() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env missing");
  cached = createClient<Database>(url, key, { auth: { persistSession: false } });
  return cached;
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/supabase lib/db/types.ts
git commit -m "feat(supabase): typed clients (server, browser, middleware, admin)"
```

---

## Task 7: Root middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write `middleware.ts`**

```ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

export async function middleware(req: NextRequest) {
  return updateSession(req);
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): session-refresh middleware"
```

---

## Task 8: Auth schemas (Zod)

**Files:**
- Create: `lib/auth/schema.ts`
- Create: `tests/auth/schema.test.ts`

- [ ] **Step 1: Write failing tests `tests/auth/schema.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { SignUpSchema, SignInSchema, ProfileSchema } from "@/lib/auth/schema";

describe("SignUpSchema", () => {
  it("accepts strong password + valid email", () => {
    const r = SignUpSchema.safeParse({ email: "a@b.co", password: "abcd1234!" });
    expect(r.success).toBe(true);
  });
  it("rejects short password", () => {
    const r = SignUpSchema.safeParse({ email: "a@b.co", password: "abc" });
    expect(r.success).toBe(false);
  });
  it("rejects invalid email", () => {
    const r = SignUpSchema.safeParse({ email: "nope", password: "abcd1234!" });
    expect(r.success).toBe(false);
  });
});

describe("SignInSchema", () => {
  it("requires both fields", () => {
    expect(SignInSchema.safeParse({ email: "a@b.co" }).success).toBe(false);
  });
});

describe("ProfileSchema", () => {
  it("accepts valid handle", () => {
    expect(ProfileSchema.safeParse({ username: "good_handle1", display_name: "X", bio: "" }).success).toBe(true);
  });
  it("rejects spaces in username", () => {
    expect(ProfileSchema.safeParse({ username: "no spaces", display_name: "", bio: "" }).success).toBe(false);
  });
  it("rejects too-short username", () => {
    expect(ProfileSchema.safeParse({ username: "ab", display_name: "", bio: "" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests, expect failures**

```bash
bun run test tests/auth/schema.test.ts
```
Expected: failures (module not found).

- [ ] **Step 3: Write `lib/auth/schema.ts`**

```ts
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
  username: z.string().min(3).max(32).regex(/^[a-z0-9_]+$/i, "letters, digits, underscore only"),
  display_name: z.string().max(64),
  bio: z.string().max(280),
  avatar_url: z.string().url().optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof ProfileSchema>;
```

- [ ] **Step 4: Re-run tests**

```bash
bun run test tests/auth/schema.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/auth/schema.ts tests/auth/schema.test.ts
git commit -m "feat(auth): zod schemas + tests"
```

---

## Task 9: Session helpers

**Files:**
- Create: `lib/auth/session.ts`
- Create: `tests/auth/session.test.ts`

- [ ] **Step 1: Write failing test `tests/auth/session.test.ts`**

```ts
import { describe, it, expect, vi } from "vitest";
import { requireUser } from "@/lib/auth/session";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: async () => ({
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
  }),
}));

describe("requireUser", () => {
  it("throws when no user", async () => {
    await expect(requireUser()).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
bun run test tests/auth/session.test.ts
```

- [ ] **Step 3: Write `lib/auth/session.ts`**

```ts
import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
```

- [ ] **Step 4: Re-run tests**

```bash
bun run test tests/auth/session.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/auth/session.ts tests/auth/session.test.ts
git commit -m "feat(auth): session helpers"
```

---

## Task 10: Server actions for auth

**Files:**
- Create: `lib/auth/actions.ts`

- [ ] **Step 1: Write `lib/auth/actions.ts`**

```ts
"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { SignInSchema, SignUpSchema } from "@/lib/auth/schema";

type ActionResult = { ok: false; error: string } | { ok: true };

function fieldErr(parsed: { success: false; error: { issues: { message: string }[] } }) {
  return parsed.error.issues[0]?.message ?? "invalid input";
}

export async function signUpAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = SignUpSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, error: fieldErr(parsed) };
  const supabase = await getSupabaseServer();
  const origin = (await headers()).get("origin") ?? "";
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = SignInSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { ok: false, error: fieldErr(parsed) };
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message };
  redirect("/");
}

export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await getSupabaseServer();
  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error) throw error;
  if (data?.url) redirect(data.url);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth/actions.ts
git commit -m "feat(auth): sign-up/in/oauth server actions"
```

---

## Task 11: Auth callback + sign-out routes

**Files:**
- Create: `app/(auth)/callback/route.ts`
- Create: `app/(auth)/sign-out/route.ts`

- [ ] **Step 1: Write callback route**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await getSupabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/`);
}
```

- [ ] **Step 2: Write sign-out route**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(auth)/callback" "app/(auth)/sign-out"
git commit -m "feat(auth): callback + sign-out routes"
```

---

## Task 12: Auth pages (sign-in, sign-up)

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/sign-in/page.tsx`
- Create: `app/(auth)/sign-in/sign-in-form.tsx`
- Create: `app/(auth)/sign-up/page.tsx`
- Create: `app/(auth)/sign-up/sign-up-form.tsx`

- [ ] **Step 1: Write `app/(auth)/layout.tsx`**

```tsx
import { Container } from "@/components/shared/container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container width="narrow" className="py-16">
      <div className="mx-auto max-w-sm">{children}</div>
    </Container>
  );
}
```

- [ ] **Step 2: Write `app/(auth)/sign-in/sign-in-form.tsx`**

```tsx
"use client";
import { useActionState } from "react";
import { signInAction, signInWithGoogleAction } from "@/lib/auth/actions";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, null);
  return (
    <form action={formAction} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        Email
        <input name="email" type="email" required className="border px-2 py-1.5" />
      </label>
      <label className="grid gap-1 text-sm">
        Password
        <input name="password" type="password" required minLength={1} className="border px-2 py-1.5" />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="border bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)]">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <button
        type="button"
        formAction={signInWithGoogleAction}
        className="mono border px-3 py-1.5 text-xs uppercase tracking-widest"
      >
        Continue with Google
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write `app/(auth)/sign-in/page.tsx`**

```tsx
import Link from "next/link";
import { Eyebrow } from "@/components/shared/eyebrow";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="grid gap-6">
      <Eyebrow>Sign in</Eyebrow>
      <SignInForm />
      <p className="text-sm text-[var(--mute)]">
        New here? <Link href="/sign-up" className="underline">Create an account</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Write `app/(auth)/sign-up/sign-up-form.tsx`** (analogous to sign-in)

```tsx
"use client";
import { useActionState } from "react";
import { signUpAction } from "@/lib/auth/actions";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, null);
  if (state?.ok) {
    return <p className="text-sm">Check your inbox for a confirmation link.</p>;
  }
  return (
    <form action={formAction} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        Email
        <input name="email" type="email" required className="border px-2 py-1.5" />
      </label>
      <label className="grid gap-1 text-sm">
        Password (min 8)
        <input name="password" type="password" required minLength={8} className="border px-2 py-1.5" />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="border bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)]">
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Write `app/(auth)/sign-up/page.tsx`**

```tsx
import Link from "next/link";
import { Eyebrow } from "@/components/shared/eyebrow";
import { SignUpForm } from "./sign-up-form";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="grid gap-6">
      <Eyebrow>Create account</Eyebrow>
      <SignUpForm />
      <p className="text-sm text-[var(--mute)]">
        Already have one? <Link href="/sign-in" className="underline">Sign in</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add "app/(auth)"
git commit -m "feat(auth): sign-in + sign-up pages"
```

---

## Task 13: Profile queries + page

**Files:**
- Create: `lib/db/queries/profiles.ts`
- Create: `app/profile/page.tsx`
- Create: `app/profile/profile-form.tsx`
- Create: `app/profile/actions.ts`

- [ ] **Step 1: Write `lib/db/queries/profiles.ts`**

```ts
import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function getOwnProfile(userId: string) {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Write `app/profile/actions.ts`**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { ProfileSchema } from "@/lib/auth/schema";

type Result = { ok: false; error: string } | { ok: true };

export async function updateProfileAction(_prev: Result | null, fd: FormData): Promise<Result> {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse({
    username: fd.get("username"),
    display_name: fd.get("display_name"),
    bio: fd.get("bio"),
    avatar_url: fd.get("avatar_url") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}
```

- [ ] **Step 3: Write `app/profile/profile-form.tsx`**

```tsx
"use client";
import { useActionState } from "react";
import { updateProfileAction } from "./actions";

type Profile = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  return (
    <form action={action} className="grid gap-3">
      <label className="grid gap-1 text-sm">
        Username
        <input name="username" defaultValue={profile.username} required minLength={3} maxLength={32}
               className="border px-2 py-1.5" />
      </label>
      <label className="grid gap-1 text-sm">
        Display name
        <input name="display_name" defaultValue={profile.display_name} maxLength={64}
               className="border px-2 py-1.5" />
      </label>
      <label className="grid gap-1 text-sm">
        Avatar URL
        <input name="avatar_url" type="url" defaultValue={profile.avatar_url ?? ""}
               className="border px-2 py-1.5" />
      </label>
      <label className="grid gap-1 text-sm">
        Bio
        <textarea name="bio" defaultValue={profile.bio} maxLength={280} rows={4}
                  className="border px-2 py-1.5" />
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-700">Saved.</p>}
      <button disabled={pending} className="justify-self-start border bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)]">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Write `app/profile/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { getUser } from "@/lib/auth/session";
import { getOwnProfile } from "@/lib/db/queries/profiles";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/sign-in?next=/profile");
  const profile = await getOwnProfile(user.id);
  return (
    <Container width="narrow" className="py-16">
      <Eyebrow className="mb-6">Profile</Eyebrow>
      <ProfileForm
        profile={{
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
        }}
      />
    </Container>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/queries app/profile
git commit -m "feat(profile): editable profile page"
```

---

## Task 14: Header nav (auth-aware)

**Files:**
- Modify: `components/layout/site-header.tsx`
- Modify: `components/layout/nav.tsx`

- [ ] **Step 1: Read existing files** (mandatory before edit)

```bash
# read components/layout/site-header.tsx
# read components/layout/nav.tsx
```

- [ ] **Step 2: Modify `site-header.tsx`** to fetch the user and pass to nav

```tsx
import { getUser } from "@/lib/auth/session";
import { Brand } from "./brand";
import { Nav } from "./nav";

export async function SiteHeader() {
  const user = await getUser();
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
        <Brand />
        <Nav user={user ? { email: user.email ?? "" } : null} />
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Update `nav.tsx`** to accept `user` and render auth controls

```tsx
"use client";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

type NavUser = { email: string } | null;

export function Nav({ user }: { user: NavUser }) {
  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link href="/benchmarks">Benchmarks</Link>
      <Link href="/test-yourself">Test yourself</Link>
      <Link href="/methodology">Methodology</Link>
      {user ? (
        <>
          <Link href="/profile">{user.email}</Link>
          <form action="/auth/sign-out" method="post">
            <button className="mono text-xs uppercase tracking-widest">Sign out</button>
          </form>
        </>
      ) : (
        <Link href="/sign-in" className="mono text-xs uppercase tracking-widest">Sign in</Link>
      )}
      <ThemeToggle />
    </nav>
  );
}
```

(Adapt to existing structure — preserve any existing classes and link order; only add user-aware section.)

- [ ] **Step 4: Commit**

```bash
git add components/layout
git commit -m "feat(nav): auth-aware header"
```

---

## Task 15: Health endpoint + cron

**Files:**
- Create: `app/api/health/route.ts`
- Create: `.github/workflows/health-ping.yml`

- [ ] **Step 1: Write health endpoint**

```ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("pings").insert({});
    if (error) throw error;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
```

- [ ] **Step 2: Write `.github/workflows/health-ping.yml`**

```yaml
name: health-ping
on:
  schedule:
    - cron: "0 9 * * *"
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Hit /api/health
        run: |
          curl -fsSL "${{ secrets.HEALTH_URL }}" || exit 1
```

(User adds `HEALTH_URL` secret = deployed `https://<domain>/api/health`.)

- [ ] **Step 3: Commit**

```bash
git add app/api/health .github/workflows
git commit -m "feat(ops): health endpoint + daily ping cron"
```

---

## Task 16: Service-role guardrail (CI)

**Files:**
- Create: `scripts/check-no-service-role-in-client.mjs`
- Modify: `package.json` scripts

- [ ] **Step 1: Write guardrail script**

```js
// scripts/check-no-service-role-in-client.mjs
// Fails if SUPABASE_SERVICE_ROLE_KEY is referenced outside server-only modules.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ALLOW = ["lib/supabase/admin.ts", "app/api/health/route.ts", "scripts/"];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".git")) continue;
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx|js|mjs)$/.test(entry)) yield full;
  }
}

let bad = 0;
for (const f of walk(ROOT)) {
  const rel = relative(ROOT, f).replaceAll("\\", "/");
  if (ALLOW.some((a) => rel.startsWith(a))) continue;
  const src = readFileSync(f, "utf8");
  if (src.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    console.error("Forbidden service-role reference in:", rel);
    bad++;
  }
}
if (bad) process.exit(1);
console.log("guardrail OK");
```

- [ ] **Step 2: Add script to `package.json`**

```json
{
  "scripts": {
    "guard": "node scripts/check-no-service-role-in-client.mjs"
  }
}
```

- [ ] **Step 3: Run it; expect OK**

```bash
bun run guard
```

- [ ] **Step 4: Commit**

```bash
git add scripts package.json
git commit -m "ci: forbid service-role key outside server-only allowlist"
```

---

## Task 17: README setup runbook

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README with the rebuild runbook** (preserve `## Run` block, append setup section)

Add a new section near the top:

```md
## Backend setup (one-time)

1. Sign up at https://supabase.com (free).
2. Create a project. Note the project ref + anon + service-role keys.
3. Locally:
   ```bash
   bunx supabase login
   bunx supabase init    # if not already
   bunx supabase link --project-ref <ref>
   bunx supabase db push
   bunx supabase db seed
   bunx supabase gen types typescript --linked > lib/db/types.ts
   ```
4. Copy `.env.local.example` → `.env.local`, fill the four `SUPABASE_*` vars.
5. `bun run dev`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: backend setup runbook"
```

---

## Task 18: Build + typecheck + lint + test gate

**Files:** none

- [ ] **Step 1: Run everything**

```bash
bun run typecheck
bun run lint
bun run test
bun run guard
bun run build
```

Expected: all green. Fix anything that fails before declaring Phase 1 done.

- [ ] **Step 2: Final commit if any fixes**

```bash
git add -A
git commit -m "chore: phase-1 verification fixes" || true
```

---

## Phase 1 done checklist

- [ ] `bun run typecheck` green
- [ ] `bun run lint` green
- [ ] `bun run test` green (auth schema + session tests pass)
- [ ] `bun run guard` green (no service-role leak)
- [ ] `bun run build` green
- [ ] Manual: sign-up → email confirm → sign-in → edit profile → sign-out works against the live Supabase project
- [ ] `pings` table receives a row when `/api/health` is hit
- [ ] `lib/db/types.ts` is the generated file (not the stub) before merging
