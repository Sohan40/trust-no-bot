import type { Game, Message, Player, PublicPlayer } from "@/lib/game/types";

const traits = {
  balanced: {
    aggression: 0.45,
    caution: 0.55,
    humor: 0.25,
    logic: 0.7,
    empathy: 0.55,
    defensiveness: 0.4,
    riskTolerance: 0.45,
    talkativeness: 0.55,
  },
  sharp: {
    aggression: 0.82,
    caution: 0.28,
    humor: 0.18,
    logic: 0.62,
    empathy: 0.2,
    defensiveness: 0.68,
    riskTolerance: 0.76,
    talkativeness: 0.75,
  },
};

export function createMockGame(seed: string): Game {
  const players: Player[] = [
    {
      id: "human",
      displayName: "You",
      isHuman: true,
      role: "Villager",
      team: "village",
      isAlive: true,
      publicStyle: "new arrival",
      traits: traits.balanced,
      memorySummary: "Human player has just entered the first mock room.",
      suspicion: 0.12,
    },
    {
      id: "arjun",
      displayName: "Arjun",
      isHuman: false,
      role: "Villager",
      team: "village",
      isAlive: true,
      publicStyle: "direct, impatient",
      traits: traits.sharp,
      memorySummary: "Pushes early accusations to force reactions.",
      suspicion: 0.38,
    },
    {
      id: "riya",
      displayName: "Riya",
      isHuman: false,
      role: "Detective",
      team: "village",
      isAlive: true,
      publicStyle: "calm, observant",
      traits: traits.balanced,
      memorySummary: "Tracks contradictions quietly.",
      suspicion: 0.22,
    },
    {
      id: "kabir",
      displayName: "Kabir",
      isHuman: false,
      role: "Mafia",
      team: "mafia",
      isAlive: true,
      publicStyle: "funny, slippery",
      traits: {
        ...traits.sharp,
        humor: 0.85,
        defensiveness: 0.72,
      },
      memorySummary: "Deflects pressure with jokes and half-answers.",
      suspicion: 0.64,
    },
    {
      id: "meera",
      displayName: "Meera",
      isHuman: false,
      role: "Doctor",
      team: "village",
      isAlive: true,
      publicStyle: "evidence-focused",
      traits: {
        ...traits.balanced,
        logic: 0.9,
        humor: 0.08,
      },
      memorySummary: "Watches voting patterns and timing.",
      suspicion: 0.3,
    },
    {
      id: "tara",
      displayName: "Tara",
      isHuman: false,
      role: "Villager",
      team: "village",
      isAlive: true,
      publicStyle: "quiet, careful",
      traits: {
        ...traits.balanced,
        caution: 0.86,
        talkativeness: 0.22,
      },
      memorySummary: "Speaks rarely, which makes others overread silence.",
      suspicion: 0.41,
    },
    {
      id: "dev",
      displayName: "Dev",
      isHuman: false,
      role: "Villager",
      team: "village",
      isAlive: true,
      publicStyle: "dramatic, emotional",
      traits: {
        ...traits.sharp,
        logic: 0.25,
        empathy: 0.62,
      },
      memorySummary: "Creates noise but sometimes spots tension.",
      suspicion: 0.48,
    },
  ];

  const messages: Message[] = [
    {
      id: "m1",
      speakerId: "system",
      speakerName: "Room",
      phase: "ROLE_REVEAL",
      phaseLabel: "Role Reveal",
      visibility: "private",
      text: "Your role is Villager. Find the hidden opponent before the vote turns against the room.",
    },
    {
      id: "m2",
      speakerId: "arjun",
      speakerName: "Arjun",
      phase: "DAY_DISCUSSION",
      phaseLabel: "Day 1",
      visibility: "public",
      text: "Kabir laughed off a simple question. That is exactly how someone buys time.",
    },
    {
      id: "m3",
      speakerId: "kabir",
      speakerName: "Kabir",
      phase: "DAY_DISCUSSION",
      phaseLabel: "Day 1",
      visibility: "public",
      text: "Or maybe I laugh because Arjun treats every comma like evidence.",
    },
    {
      id: "m4",
      speakerId: "meera",
      speakerName: "Meera",
      phase: "DAY_DISCUSSION",
      phaseLabel: "Day 1",
      visibility: "public",
      text: "The useful part is the timing. Kabir answered after Tara went quiet.",
    },
  ];

  return {
    id: "mock-game-001",
    mode: "classic",
    phase: "PLAYER_QUESTION",
    phaseLabel: "Player Question",
    dayNumber: 1,
    seed,
    humanPlayerId: "human",
    players,
    messages,
    votes: [],
  };
}

export function getPublicPlayers(game: Game): PublicPlayer[] {
  return game.players.map(({ role: _role, team: _team, memorySummary: _memorySummary, ...publicPlayer }) => publicPlayer);
}

export function getHumanPlayer(game: Game): Player {
  const human = game.players.find((player) => player.id === game.humanPlayerId);

  if (!human) {
    throw new Error("Mock game is missing the human player.");
  }

  return human;
}
