-- Trust No Bot issue #42: atomic anonymous-session usage limits.

alter table public.anonymous_sessions
  add column ai_actions_today integer not null default 0
  check (ai_actions_today >= 0);

create index ai_usage_events_game_purpose_idx
  on public.ai_usage_events (game_id, purpose);

create or replace function public.claim_anonymous_game_start(
  p_session_id text,
  p_daily_limit integer
)
returns table (
  allowed boolean,
  limit_reason text,
  usage_date date,
  games_started_today integer,
  ai_actions_today integer,
  questions_submitted_for_game bigint
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  session_row public.anonymous_sessions%rowtype;
begin
  if p_daily_limit < 1 then
    raise exception 'p_daily_limit must be positive';
  end if;

  insert into public.anonymous_sessions as sessions (id)
  values (p_session_id)
  on conflict (id) do update
  set
    games_started_today = case
      when sessions.usage_date = current_date
        then sessions.games_started_today
      else 0
    end,
    ai_actions_today = case
      when sessions.usage_date = current_date
        then sessions.ai_actions_today
      else 0
    end,
    usage_date = current_date,
    last_seen_at = now()
  returning * into session_row;

  if session_row.games_started_today >= p_daily_limit then
    return query select
      false,
      'game_start_limit'::text,
      session_row.usage_date,
      session_row.games_started_today,
      session_row.ai_actions_today,
      0::bigint;
    return;
  end if;

  update public.anonymous_sessions
  set
    games_started_today = public.anonymous_sessions.games_started_today + 1,
    last_seen_at = now()
  where id = p_session_id
  returning * into session_row;

  return query select
    true,
    null::text,
    session_row.usage_date,
    session_row.games_started_today,
    session_row.ai_actions_today,
    0::bigint;
end;
$$;

create or replace function public.claim_anonymous_ai_action(
  p_session_id text,
  p_game_id uuid,
  p_purpose text,
  p_provider text,
  p_model text,
  p_daily_limit integer,
  p_question_limit integer
)
returns table (
  allowed boolean,
  limit_reason text,
  usage_date date,
  games_started_today integer,
  ai_actions_today integer,
  questions_submitted_for_game bigint
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  session_row public.anonymous_sessions%rowtype;
  question_count bigint := 0;
begin
  if p_daily_limit < 1 or p_question_limit < 1 then
    raise exception 'usage limits must be positive';
  end if;

  if p_purpose not in ('day_discussion', 'question_response') then
    raise exception 'unsupported AI usage purpose';
  end if;

  if nullif(trim(p_provider), '') is null or nullif(trim(p_model), '') is null then
    raise exception 'provider and model are required';
  end if;

  if not exists (
    select 1
    from public.games
    where public.games.id = p_game_id
      and public.games.anonymous_session_id = p_session_id
  ) then
    return query select
      false,
      'game_not_found'::text,
      current_date,
      0,
      0,
      0::bigint;
    return;
  end if;

  insert into public.anonymous_sessions as sessions (id)
  values (p_session_id)
  on conflict (id) do update
  set
    games_started_today = case
      when sessions.usage_date = current_date
        then sessions.games_started_today
      else 0
    end,
    ai_actions_today = case
      when sessions.usage_date = current_date
        then sessions.ai_actions_today
      else 0
    end,
    usage_date = current_date,
    last_seen_at = now()
  returning * into session_row;

  if p_purpose = 'question_response' then
    select count(*)
    into question_count
    from public.ai_usage_events
    where public.ai_usage_events.game_id = p_game_id
      and public.ai_usage_events.purpose = 'question_response';
  end if;

  if session_row.ai_actions_today >= p_daily_limit then
    return query select
      false,
      'ai_action_limit'::text,
      session_row.usage_date,
      session_row.games_started_today,
      session_row.ai_actions_today,
      question_count;
    return;
  end if;

  if p_purpose = 'question_response' and question_count >= p_question_limit then
    return query select
      false,
      'question_limit'::text,
      session_row.usage_date,
      session_row.games_started_today,
      session_row.ai_actions_today,
      question_count;
    return;
  end if;

  update public.anonymous_sessions
  set
    ai_actions_today = public.anonymous_sessions.ai_actions_today + 1,
    last_seen_at = now()
  where id = p_session_id
  returning * into session_row;

  insert into public.ai_usage_events (
    game_id,
    provider,
    model,
    purpose,
    input_tokens,
    output_tokens,
    estimated_cost_usd,
    metadata
  )
  values (
    p_game_id,
    p_provider,
    p_model,
    p_purpose,
    null,
    null,
    null,
    jsonb_build_object('reserved_before_call', true)
  );

  if p_purpose = 'question_response' then
    question_count := question_count + 1;
  end if;

  return query select
    true,
    null::text,
    session_row.usage_date,
    session_row.games_started_today,
    session_row.ai_actions_today,
    question_count;
end;
$$;

revoke all on function public.claim_anonymous_game_start(text, integer)
  from public, anon, authenticated;
revoke all on function public.claim_anonymous_ai_action(
  text, uuid, text, text, text, integer, integer
)
  from public, anon, authenticated;

grant execute on function public.claim_anonymous_game_start(text, integer)
  to service_role;
grant execute on function public.claim_anonymous_ai_action(
  text, uuid, text, text, text, integer, integer
)
  to service_role;
