alter table public.profiles             enable row level security;
alter table public.benchmark_tasks      enable row level security;
alter table public.benchmark_runs       enable row level security;
alter table public.votes                enable row level security;
alter table public.comments             enable row level security;
alter table public.models               enable row level security;
alter table public.benchmark_categories enable row level security;
alter table public.pings                enable row level security;

-- profiles: world-readable; only owner mutates
create policy "profiles_read"   on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- models / categories: world-readable; no client write
create policy "models_read"     on public.models      for select using (visible);
create policy "categories_read" on public.benchmark_categories for select using (true);

-- tasks: read all; author writes
create policy "tasks_read"   on public.benchmark_tasks for select using (true);
create policy "tasks_insert" on public.benchmark_tasks for insert with check (auth.uid() = author_id);
create policy "tasks_update" on public.benchmark_tasks for update using (auth.uid() = author_id);
create policy "tasks_delete" on public.benchmark_tasks for delete using (auth.uid() = author_id);

-- runs: live readable to all; author can also see own non-live; author writes
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

-- pings: only service role writes (RLS denies all client access)
create policy "pings_no_select" on public.pings for select using (false);
