export type PlayerId = string;
export type GameId = string;

export type Role = "Mafia" | "Detective" | "Doctor" | "Villager";

export type Team = "mafia" | "village";

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

export type MessageVisibility = "public" | "private";

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

export type PublicPlayer = Omit<Player, "role" | "team" | "memorySummary">;

export type Message = {
  id: string;
  speakerId: PlayerId | "system";
  speakerName: string;
  phase: Phase;
  phaseLabel: string;
  visibility: MessageVisibility;
  text: string;
};

export type Vote = {
  voterId: PlayerId;
  targetId: PlayerId;
  dayNumber: number;
  reason?: string;
};

export type Game = {
  id: GameId;
  mode: "classic";
  phase: Phase;
  phaseLabel: string;
  dayNumber: number;
  seed: string;
  humanPlayerId: PlayerId;
  players: Player[];
  messages: Message[];
  votes: Vote[];
};
