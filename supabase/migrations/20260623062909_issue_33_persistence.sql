-- Trust No Bot issue #33: persistence foundation for next-week MVP deploy.
-- Database stores state; TypeScript game logic still owns game rules.

create extension if not exists pgcrypto;

create table public.anonymous_sessions (
  id text primary key,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  games_started_today integer not null default 0 check (games_started_today >= 0),
  usage_date date not null default current_date
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id text not null references public.anonymous_sessions(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  mode text not null default 'classic' check (mode in ('classic')),
  difficulty text not null default 'normal' check (difficulty in ('normal')),
  theme text not null default 'classic' check (theme in ('classic')),
  current_phase text not null,
  day_number integer not null default 0 check (day_number >= 0),
  seed text not null,
  winner text check (winner is null or winner in ('villagers', 'mafia')),
  state_version integer not null default 1 check (state_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint games_completed_status_requires_time check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed')
  )
);

create table public.game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  display_name text not null,
  is_human boolean not null default false,
  role text not null check (role in ('Mafia', 'Detective', 'Doctor', 'Villager')),
  team text not null check (team in ('mafia', 'village')),
  is_alive boolean not null default true,
  public_style text not null default '',
  avatar_key text,
  personality_json jsonb not null default '{}'::jsonb,
  memory_json jsonb not null default '{}'::jsonb,
  suspicion_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.game_messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  phase text not null,
  day_number integer not null check (day_number >= 0),
  speaker_player_id uuid references public.game_players(id) on delete set null,
  visibility text not null default 'public' check (visibility in ('public', 'private', 'system')),
  message text not null,
  intent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.game_votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  day_number integer not null check (day_number >= 0),
  voter_player_id uuid not null references public.game_players(id) on delete cascade,
  target_player_id uuid not null references public.game_players(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (game_id, day_number, voter_player_id)
);

create table public.night_actions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  night_number integer not null check (night_number >= 0),
  actor_player_id uuid not null references public.game_players(id) on delete cascade,
  action_type text not null check (action_type in ('mafia_kill', 'doctor_save', 'detective_check')),
  target_player_id uuid references public.game_players(id) on delete set null,
  result_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (game_id, night_number, actor_player_id, action_type)
);

create table public.game_results (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null unique references public.games(id) on delete cascade,
  winner text not null check (winner in ('villagers', 'mafia')),
  result_summary text,
  reveal_json jsonb not null default '{}'::jsonb,
  share_text text,
  stats_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete set null,
  provider text not null,
  model text not null,
  purpose text not null,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost_usd numeric check (estimated_cost_usd is null or estimated_cost_usd >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index anonymous_sessions_usage_date_idx
  on public.anonymous_sessions (usage_date);

create index games_session_status_updated_idx
  on public.games (anonymous_session_id, status, updated_at desc);

create index game_players_game_id_idx
  on public.game_players (game_id);

create index game_messages_game_order_idx
  on public.game_messages (game_id, created_at, id);

create index game_votes_game_day_idx
  on public.game_votes (game_id, day_number);

create index night_actions_game_night_idx
  on public.night_actions (game_id, night_number);

create index ai_usage_events_game_created_idx
  on public.ai_usage_events (game_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_set_updated_at
  before update on public.games
  for each row
  execute function public.set_updated_at();

alter table public.anonymous_sessions enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.game_messages enable row level security;
alter table public.game_votes enable row level security;
alter table public.night_actions enable row level security;
alter table public.game_results enable row level security;
alter table public.ai_usage_events enable row level security;

-- No anon/authenticated policies yet. MVP access goes through server-only
-- repository functions using the service role key so hidden roles stay private.
revoke all on function public.set_updated_at() from public, anon, authenticated;
