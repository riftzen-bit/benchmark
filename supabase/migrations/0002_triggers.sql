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
