-- Aggregate vote tally per run (used by leaderboard + run-detail).
create or replace view public.run_vote_tally as
select
  r.id as run_id,
  coalesce(sum(case when v.value = 1 then 1 else 0 end), 0)::int as up,
  coalesce(sum(case when v.value = -1 then 1 else 0 end), 0)::int as down,
  coalesce(sum(v.value), 0)::int as score
from public.benchmark_runs r
left join public.votes v on v.run_id = r.id
group by r.id;

-- Leaderboard: per (model, category) average score from live runs.
create or replace view public.model_category_leaderboard as
select
  r.model_id,
  t.category,
  count(*)::int as runs,
  avg(r.score) as avg_score,
  max(r.created_at) as last_run_at
from public.benchmark_runs r
join public.benchmark_tasks t on t.id = r.task_id
where r.status = 'live' and r.score is not null
group by r.model_id, t.category;

grant select on public.run_vote_tally to anon, authenticated;
grant select on public.model_category_leaderboard to anon, authenticated;
