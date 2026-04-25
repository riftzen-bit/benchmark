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
  user_id    uuid not null references public.profiles(id) on delete cascade,
  run_id     uuid not null references public.benchmark_runs(id) on delete cascade,
  value      smallint not null check (value in (-1, 1)),
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
  id        bigserial primary key,
  pinged_at timestamptz not null default now()
);

create index on public.benchmark_tasks (category);
create index on public.benchmark_runs (task_id);
create index on public.benchmark_runs (model_id);
create index on public.benchmark_runs (author_id);
create index on public.benchmark_runs (status);
create index on public.comments (run_id);
