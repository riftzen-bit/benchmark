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
  ('gpt-5.5',         'openai',    'gpt',    '2026-04-23', 1000, true),
  ('claude-opus-4-6', 'anthropic', 'claude', '2025-09-01', 1000, true),
  ('gpt-5',           'openai',    'gpt',    '2025-08-01',  256, true),
  ('gemini-3-pro',    'google',    'gemini', '2026-02-01', 2000, true),
  ('llama-4-405b',    'meta',      'llama',  '2025-12-01',  256, true)
on conflict (id) do nothing;
