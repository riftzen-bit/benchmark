-- Refresh metadata on rows that landed in 0004_seed.sql with stale numbers.
update public.models
   set vendor='openai', family='gpt', released_at='2026-04-23', context_k=1000, visible=true
 where id='gpt-5.5';

update public.models
   set vendor='google', family='gemini', released_at='2025-11-18', context_k=1000, visible=true
 where id='gemini-3-pro';

-- llama-4-405b never shipped under that label; soft-hide so it stops showing in the registry.
update public.models set visible = false where id = 'llama-4-405b';

-- Real, shipped model registry. Source: vendor model cards / API references.
insert into public.models (id, vendor, family, released_at, context_k, visible) values
  -- Anthropic Claude
  ('claude-sonnet-4-6',               'anthropic', 'claude',    '2026-01-12', 1000, true),
  ('claude-haiku-4-5',                'anthropic', 'claude',    '2025-10-01',  200, true),
  ('claude-opus-4-5',                 'anthropic', 'claude',    '2025-09-29', 1000, true),
  ('claude-sonnet-4-5',               'anthropic', 'claude',    '2025-09-29', 1000, true),
  ('claude-opus-4-1',                 'anthropic', 'claude',    '2025-08-05',  200, true),
  ('claude-3-7-sonnet-20250219',      'anthropic', 'claude',    '2025-02-19',  200, true),
  ('claude-3-5-sonnet-20241022',      'anthropic', 'claude',    '2024-10-22',  200, true),

  -- OpenAI GPT + o-series + open weights
  ('gpt-5.1',                         'openai',    'gpt',       '2025-11-12',  400, true),
  ('gpt-5.1-mini',                    'openai',    'gpt',       '2025-11-12',  400, true),
  ('gpt-5.1-codex',                   'openai',    'gpt',       '2025-11-13',  400, true),
  ('gpt-5-mini',                      'openai',    'gpt',       '2025-08-07',  400, true),
  ('gpt-5-nano',                      'openai',    'gpt',       '2025-08-07',  400, true),
  ('gpt-4.1',                         'openai',    'gpt',       '2025-04-14', 1000, true),
  ('gpt-4o-2024-11-20',               'openai',    'gpt',       '2024-11-20',  128, true),
  ('o4-mini',                         'openai',    'o-series',  '2025-04-16',  200, true),
  ('o3',                              'openai',    'o-series',  '2025-04-16',  200, true),
  ('o3-pro',                          'openai',    'o-series',  '2025-06-10',  200, true),
  ('o3-mini',                         'openai',    'o-series',  '2025-01-31',  200, true),
  ('gpt-oss-120b',                    'openai',    'gpt-oss',   '2025-08-05',  128, true),
  ('gpt-oss-20b',                     'openai',    'gpt-oss',   '2025-08-05',  128, true),

  -- Google Gemini
  ('gemini-3-deep-think',             'google',    'gemini',    '2025-11-18', 1000, true),
  ('gemini-2.5-pro',                  'google',    'gemini',    '2025-03-25', 2000, true),
  ('gemini-2.5-flash',                'google',    'gemini',    '2025-04-09', 1000, true),
  ('gemini-2.5-flash-lite',           'google',    'gemini',    '2025-06-17', 1000, true),
  ('gemini-2.0-flash',                'google',    'gemini',    '2025-02-05', 1000, true),
  ('gemma-3-27b-it',                  'google',    'gemma',     '2025-03-12',  128, true),

  -- Meta Llama
  ('llama-4-scout-17b-16e-instruct',  'meta',      'llama',     '2025-04-05', 10000, true),
  ('llama-4-maverick-17b-128e-instruct','meta',    'llama',     '2025-04-05', 1000, true),
  ('llama-3.3-70b-instruct',          'meta',      'llama',     '2024-12-06',  128, true),
  ('llama-3.1-405b-instruct',         'meta',      'llama',     '2024-07-23',  128, true),

  -- Mistral
  ('mistral-medium-3.1',              'mistral',   'mistral',   '2025-08-13',  128, true),
  ('mistral-medium-3',                'mistral',   'mistral',   '2025-05-13',  128, true),
  ('mistral-large-2411',              'mistral',   'mistral',   '2024-11-18',  128, true),
  ('magistral-medium-1.2',            'mistral',   'magistral', '2025-09-18',  128, true),
  ('devstral-small-2507',             'mistral',   'devstral',  '2025-07-10',  128, true),
  ('codestral-2501',                  'mistral',   'codestral', '2025-01-13',  256, true),
  ('mixtral-8x22b-instruct',          'mistral',   'mistral',   '2024-04-17',   64, true),

  -- DeepSeek
  ('deepseek-v3.2-exp',               'deepseek',  'deepseek',  '2025-09-29',  128, true),
  ('deepseek-v3.1',                   'deepseek',  'deepseek',  '2025-08-21',  128, true),
  ('deepseek-v3',                     'deepseek',  'deepseek',  '2024-12-26',  128, true),
  ('deepseek-r1-0528',                'deepseek',  'deepseek-r','2025-05-28',  128, true),
  ('deepseek-r1',                     'deepseek',  'deepseek-r','2025-01-20',  128, true),

  -- xAI Grok
  ('grok-4',                          'xai',       'grok',      '2025-07-09',  256, true),
  ('grok-4-fast',                     'xai',       'grok',      '2025-09-19', 2000, true),
  ('grok-4-heavy',                    'xai',       'grok',      '2025-07-09',  256, true),
  ('grok-3',                          'xai',       'grok',      '2025-02-17', 1000, true),
  ('grok-2-1212',                     'xai',       'grok',      '2024-12-12',  128, true),

  -- Alibaba Qwen
  ('qwen3-235b-a22b',                 'alibaba',   'qwen',      '2025-04-29',  128, true),
  ('qwen3-32b',                       'alibaba',   'qwen',      '2025-04-29',  128, true),
  ('qwen3-coder-480b',                'alibaba',   'qwen',      '2025-07-22',  256, true),
  ('qwq-32b',                         'alibaba',   'qwen',      '2025-03-06',  128, true),
  ('qwen2.5-72b-instruct',            'alibaba',   'qwen',      '2024-09-19',  128, true),
  ('qwen2.5-coder-32b-instruct',      'alibaba',   'qwen',      '2024-11-12',  128, true),

  -- Moonshot AI
  ('kimi-k2',                         'moonshot',  'kimi',      '2025-07-12',  128, true),
  ('kimi-k1.5',                       'moonshot',  'kimi',      '2025-01-22',  200, true),

  -- Z.AI / Zhipu
  ('glm-4.6',                         'zai',       'glm',       '2025-09-30',  200, true),
  ('glm-4.5',                         'zai',       'glm',       '2025-07-28',  128, true),

  -- Cohere
  ('command-a-03-2025',               'cohere',    'command',   '2025-03-13',  256, true),
  ('command-r-plus-08-2024',          'cohere',    'command',   '2024-08-30',  128, true),
  ('command-r-08-2024',               'cohere',    'command',   '2024-08-30',  128, true),

  -- AI21
  ('jamba-1.5-large',                 'ai21',      'jamba',     '2024-08-22',  256, true),
  ('jamba-1.5-mini',                  'ai21',      'jamba',     '2024-08-22',  256, true),

  -- 01.AI
  ('yi-large',                        '01ai',      'yi',        '2024-05-13',   32, true),
  ('yi-1.5-34b-chat',                 '01ai',      'yi',        '2024-05-12',    4, true),

  -- Microsoft
  ('phi-4-reasoning-plus',            'microsoft', 'phi',       '2025-04-30',   32, true),
  ('phi-4',                           'microsoft', 'phi',       '2024-12-12',   16, true),
  ('phi-4-mini',                      'microsoft', 'phi',       '2025-02-26',  128, true),

  -- IBM
  ('granite-4-h-small',               'ibm',       'granite',   '2025-10-01',  128, true),
  ('granite-4-h-tiny',                'ibm',       'granite',   '2025-10-01',  128, true),

  -- StepFun
  ('step-3',                          'stepfun',   'step',      '2025-07-25',   64, true),

  -- Reka
  ('reka-flash-3',                    'reka',      'reka',      '2025-03-10',   32, true),
  ('reka-core',                       'reka',      'reka',      '2024-04-15',  128, true),

  -- Perplexity
  ('sonar-reasoning-pro',             'perplexity','sonar',     '2025-02-11',  127, true),
  ('sonar-pro',                       'perplexity','sonar',     '2025-01-21',  200, true)
on conflict (id) do nothing;
