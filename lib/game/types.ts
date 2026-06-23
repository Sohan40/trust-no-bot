export type PlayerId = string;
export type GameId = string;

export type Role = "Mafia" | "Detective" | "Doctor" | "Villager";

export type Team = "mafia" | "village";

export type GameStatus = "active" | "completed" | "abandoned";

export type Winner = "villagers" | "mafia";

export type AvailableAction = "ADVANCE_PHASE" | "ASK_QUESTION" | "VOTE";

export type Phase =
  | "LOBBY"
  | "ROLE_REVEAL"
  | "NIGHT_ACTIONS"
  | "NIGHT_RESOLUTION"
  | "DAY_DISCUSSION"
  | "PLAYER_QUESTION"
  | "AI_RESPONSES"
  | "VOTING"
  | "ELIMINATION"
  | "WIN_CHECK"
  | "GAME_OVER";

export type MessageVisibility = "public" | "private" | "system";

export type NightActionType = "mafia_kill" | "doctor_save" | "detective_check";

export type AgentTraits = {
  aggression: number;
  caution: number;
  humor: number;
  logic: number;
  empathy: number;
  defensiveness: number;
  riskTolerance: number;
  talkativeness: number;
};

export type Player = {
  id: PlayerId;
  displayName: string;
  isHuman: boolean;
  role: Role;
  team: Team;
  isAlive: boolean;
  publicStyle: string;
  traits: AgentTraits;
  memorySummary: string;
  suspicion: number;
};

export type PublicPlayer = Omit<Player, "role" | "team" | "memorySummary"> & {
  role?: Role;
  team?: Team;
};

export type Message = {
  id: string;
  speakerId: PlayerId | "system";
  speakerName: string;
  phase: Phase;
  phaseLabel: string;
  dayNumber?: number;
  visibility: MessageVisibility;
  text: string;
  intent?: string;
  metadata?: Record<string, unknown>;
};

export type Vote = {
  voterId: PlayerId;
  targetId: PlayerId;
  dayNumber: number;
  reason?: string;
};

export type NightAction = {
  actorId: PlayerId;
  targetId: PlayerId | null;
  nightNumber: number;
  actionType: NightActionType;
  result?: Record<string, unknown>;
};

export type Game = {
  id: GameId;
  mode: "classic";
  status: GameStatus;
  phase: Phase;
  phaseLabel: string;
  dayNumber: number;
  seed: string;
  winner: Winner | null;
  humanPlayerId: PlayerId;
  players: Player[];
  messages: Message[];
  votes: Vote[];
  nightActions: NightAction[];
};

export type PrivateInfo = {
  role: Role;
  team: Team;
};

export type VisibleGameState = {
  game: {
    id: GameId;
    mode: "classic";
    status: GameStatus;
    phase: Phase;
    phaseLabel: string;
    dayNumber: number;
    winner: Winner | null;
  };
  humanPlayerId: PlayerId;
  publicPlayers: PublicPlayer[];
  messages: Message[];
  availableActions: AvailableAction[];
  privateInfo: PrivateInfo;
  result?: {
    winner: Winner;
    summary: string;
    shareText: string;
  };
};
