# Database Schema Plan

Do not add persistence in Phase 0 unless needed. Start with local/in-memory state, then add database in Phase 8.

Recommended database: Postgres through Supabase.

## Tables

## games

Stores one game session.

```sql
create table games (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id text,
  status text not null,
  mode text not null,
  difficulty text not null default 'normal',
  theme text not null default 'classic',
  current_phase text not null,
  day_number integer not null default 0,
  seed text not null,
  winner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
```

## game_players

Stores players and hidden role data.

```sql
create table game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  display_name text not null,
  is_human boolean not null default false,
  role text not null,
  team text not null,
  is_alive boolean not null default true,
  personality_json jsonb not null default '{}',
  memory_json jsonb not null default '{}',
  suspicion_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## game_messages

Stores public transcript and optional private system messages.

```sql
create table game_messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  phase text not null,
  day_number integer not null,
  speaker_player_id uuid references game_players(id),
  visibility text not null default 'public',
  message text not null,
  intent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## game_votes

Stores votes.

```sql
create table game_votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  day_number integer not null,
  voter_player_id uuid not null references game_players(id),
  target_player_id uuid not null references game_players(id),
  reason text,
  created_at timestamptz not null default now()
);
```

## night_actions

Stores night actions.

```sql
create table night_actions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  night_number integer not null,
  actor_player_id uuid not null references game_players(id),
  action_type text not null,
  target_player_id uuid references game_players(id),
  result_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## game_results

Stores result summary.

```sql
create table game_results (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  winner text not null,
  result_summary text,
  reveal_json jsonb not null default '{}',
  share_text text,
  stats_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

## anonymous_sessions

Optional for free limits and resume.

```sql
create table anonymous_sessions (
  id text primary key,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  games_started_today integer not null default 0,
  usage_date date not null default current_date
);
```

## ai_usage_events

Optional for cost tracking.

```sql
create table ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete set null,
  provider text not null,
  model text not null,
  purpose text not null,
  input_tokens integer,
  output_tokens integer,
  estimated_cost_usd numeric,
  created_at timestamptz not null default now()
);
```

## Privacy notes

- Avoid storing unnecessary personal data.
- Anonymous sessions are enough for early MVP.
- Do not require login before the game is proven.
- Store game text because replay/results need it, but add delete controls later.