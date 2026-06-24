export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GameStatus = "active" | "completed" | "abandoned";
export type GameMode = "classic";
export type GameDifficulty = "normal";
export type GameTheme = "classic";
export type GameWinner = "villagers" | "mafia";
export type StoredRole = "Mafia" | "Detective" | "Doctor" | "Villager";
export type StoredTeam = "mafia" | "village";
export type MessageVisibility = "public" | "private" | "system";
export type NightActionType = "mafia_kill" | "doctor_save" | "detective_check";

export type AnonymousSessionRow = {
  ai_actions_today: number;
  id: string;
  created_at: string;
  last_seen_at: string;
  games_started_today: number;
  usage_date: string;
};

export type UsageClaimRow = {
  allowed: boolean;
  limit_reason: string | null;
  usage_date: string;
  games_started_today: number;
  ai_actions_today: number;
  questions_submitted_for_game: number;
};

export type GameRow = {
  id: string;
  anonymous_session_id: string;
  status: GameStatus;
  mode: GameMode;
  difficulty: GameDifficulty;
  theme: GameTheme;
  current_phase: string;
  day_number: number;
  seed: string;
  winner: GameWinner | null;
  state_version: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type GamePlayerRow = {
  id: string;
  game_id: string;
  display_name: string;
  is_human: boolean;
  role: StoredRole;
  team: StoredTeam;
  is_alive: boolean;
  public_style: string;
  avatar_key: string | null;
  personality_json: Json;
  memory_json: Json;
  suspicion_json: Json;
  created_at: string;
};

export type GameMessageRow = {
  id: string;
  game_id: string;
  phase: string;
  day_number: number;
  speaker_player_id: string | null;
  visibility: MessageVisibility;
  message: string;
  intent: string | null;
  metadata: Json;
  created_at: string;
};

export type GameVoteRow = {
  id: string;
  game_id: string;
  day_number: number;
  voter_player_id: string;
  target_player_id: string;
  reason: string | null;
  created_at: string;
};

export type NightActionRow = {
  id: string;
  game_id: string;
  night_number: number;
  actor_player_id: string;
  action_type: NightActionType;
  target_player_id: string | null;
  result_json: Json;
  created_at: string;
};

export type GameResultRow = {
  id: string;
  game_id: string;
  winner: GameWinner;
  result_summary: string | null;
  reveal_json: Json;
  share_text: string | null;
  stats_json: Json;
  created_at: string;
};

export type AIUsageEventRow = {
  id: string;
  game_id: string | null;
  provider: string;
  model: string;
  purpose: string;
  input_tokens: number | null;
  output_tokens: number | null;
  estimated_cost_usd: number | null;
  metadata: Json;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      anonymous_sessions: {
        Row: AnonymousSessionRow;
        Insert: Omit<AnonymousSessionRow, "ai_actions_today" | "created_at" | "last_seen_at" | "games_started_today" | "usage_date"> &
          Partial<Pick<AnonymousSessionRow, "ai_actions_today" | "created_at" | "last_seen_at" | "games_started_today" | "usage_date">>;
        Update: Partial<AnonymousSessionRow>;
        Relationships: [];
      };
      games: {
        Row: GameRow;
        Insert: Omit<GameRow, "id" | "status" | "difficulty" | "theme" | "winner" | "state_version" | "created_at" | "updated_at" | "completed_at"> &
          Partial<Pick<GameRow, "id" | "status" | "difficulty" | "theme" | "winner" | "state_version" | "created_at" | "updated_at" | "completed_at">>;
        Update: Partial<GameRow>;
        Relationships: [];
      };
      game_players: {
        Row: GamePlayerRow;
        Insert: Omit<GamePlayerRow, "id" | "is_alive" | "public_style" | "avatar_key" | "personality_json" | "memory_json" | "suspicion_json" | "created_at"> &
          Partial<Pick<GamePlayerRow, "id" | "is_alive" | "public_style" | "avatar_key" | "personality_json" | "memory_json" | "suspicion_json" | "created_at">>;
        Update: Partial<GamePlayerRow>;
        Relationships: [];
      };
      game_messages: {
        Row: GameMessageRow;
        Insert: Omit<GameMessageRow, "id" | "speaker_player_id" | "visibility" | "intent" | "metadata" | "created_at"> &
          Partial<Pick<GameMessageRow, "id" | "speaker_player_id" | "visibility" | "intent" | "metadata" | "created_at">>;
        Update: Partial<GameMessageRow>;
        Relationships: [];
      };
      game_votes: {
        Row: GameVoteRow;
        Insert: Omit<GameVoteRow, "id" | "reason" | "created_at"> &
          Partial<Pick<GameVoteRow, "id" | "reason" | "created_at">>;
        Update: Partial<GameVoteRow>;
        Relationships: [];
      };
      night_actions: {
        Row: NightActionRow;
        Insert: Omit<NightActionRow, "id" | "target_player_id" | "result_json" | "created_at"> &
          Partial<Pick<NightActionRow, "id" | "target_player_id" | "result_json" | "created_at">>;
        Update: Partial<NightActionRow>;
        Relationships: [];
      };
      game_results: {
        Row: GameResultRow;
        Insert: Omit<GameResultRow, "id" | "result_summary" | "reveal_json" | "share_text" | "stats_json" | "created_at"> &
          Partial<Pick<GameResultRow, "id" | "result_summary" | "reveal_json" | "share_text" | "stats_json" | "created_at">>;
        Update: Partial<GameResultRow>;
        Relationships: [];
      };
      ai_usage_events: {
        Row: AIUsageEventRow;
        Insert: Omit<AIUsageEventRow, "id" | "game_id" | "input_tokens" | "output_tokens" | "estimated_cost_usd" | "metadata" | "created_at"> &
          Partial<Pick<AIUsageEventRow, "id" | "game_id" | "input_tokens" | "output_tokens" | "estimated_cost_usd" | "metadata" | "created_at">>;
        Update: Partial<AIUsageEventRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_anonymous_game_start: {
        Args: {
          p_session_id: string;
          p_daily_limit: number;
        };
        Returns: UsageClaimRow[];
      };
      claim_anonymous_ai_action: {
        Args: {
          p_session_id: string;
          p_game_id: string;
          p_purpose: string;
          p_provider: string;
          p_model: string;
          p_daily_limit: number;
          p_question_limit: number;
        };
        Returns: UsageClaimRow[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PersistedGameState = {
  game: GameRow;
  players: GamePlayerRow[];
  messages: GameMessageRow[];
  votes: GameVoteRow[];
  nightActions: NightActionRow[];
  result: GameResultRow | null;
};
