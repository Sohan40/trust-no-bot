import { seededShuffle } from "@/lib/game/random";
import type { AgentTraits, Player, Role, Team } from "@/lib/game/types";

const balancedTraits: AgentTraits = {
  aggression: 0.45,
  caution: 0.55,
  humor: 0.25,
  logic: 0.7,
  empathy: 0.55,
  defensiveness: 0.4,
  riskTolerance: 0.45,
  talkativeness: 0.55,
};

const boldTraits: AgentTraits = {
  aggression: 0.78,
  caution: 0.3,
  humor: 0.55,
  logic: 0.58,
  empathy: 0.35,
  defensiveness: 0.65,
  riskTolerance: 0.72,
  talkativeness: 0.76,
};

type CharacterTemplate = {
  id: string;
  displayName: string;
  publicStyle: string;
  traits: AgentTraits;
  memorySummary: string;
  suspicion: number;
};

const aiTemplates: CharacterTemplate[] = [
  {
    id: "arjun",
    displayName: "Arjun",
    publicStyle: "direct, impatient",
    traits: boldTraits,
    memorySummary: "Pushes early accusations to force reactions.",
    suspicion: 0.35,
  },
  {
    id: "riya",
    displayName: "Riya",
    publicStyle: "calm, observant",
    traits: balancedTraits,
    memorySummary: "Tracks contradictions quietly.",
    suspicion: 0.22,
  },
  {
    id: "kabir",
    displayName: "Kabir",
    publicStyle: "funny, slippery",
    traits: { ...boldTraits, humor: 0.85, defensiveness: 0.72 },
    memorySummary: "Deflects pressure with jokes and half-answers.",
    suspicion: 0.5,
  },
  {
    id: "meera",
    displayName: "Meera",
    publicStyle: "evidence-focused",
    traits: { ...balancedTraits, logic: 0.9, humor: 0.08 },
    memorySummary: "Watches voting patterns and timing.",
    suspicion: 0.28,
  },
  {
    id: "tara",
    displayName: "Tara",
    publicStyle: "quiet, careful",
    traits: { ...balancedTraits, caution: 0.86, talkativeness: 0.22 },
    memorySummary: "Speaks rarely, which makes others overread silence.",
    suspicion: 0.4,
  },
  {
    id: "dev",
    displayName: "Dev",
    publicStyle: "dramatic, emotional",
    traits: { ...boldTraits, logic: 0.25, empathy: 0.62 },
    memorySummary: "Creates noise but sometimes spots tension.",
    suspicion: 0.45,
  },
];

const aiRoles: Role[] = [
  "Mafia",
  "Detective",
  "Doctor",
  "Villager",
  "Villager",
  "Villager",
];

export function roleToTeam(role: Role): Team {
  return role === "Mafia" ? "mafia" : "village";
}

export function assignClassicRoles(seed: string): Player[] {
  const shuffledRoles = seededShuffle(aiRoles, `${seed}:roles`);

  const human: Player = {
    id: "human",
    displayName: "You",
    isHuman: true,
    role: "Villager",
    team: "village",
    isAlive: true,
    publicStyle: "new arrival",
    traits: balancedTraits,
    memorySummary: "Human player is trying to read the room.",
    suspicion: 0.12,
  };

  const aiPlayers = aiTemplates.map((template, index) => {
    const role = shuffledRoles[index];

    return {
      ...template,
      isHuman: false,
      role,
      team: roleToTeam(role),
      isAlive: true,
    };
  });

  return [human, ...aiPlayers];
}

export function clonePlayersWithIds(
  players: Player[],
  idsByOriginalId: Record<string, string>,
): Player[] {
  return players.map((player) => ({
    ...player,
    id: idsByOriginalId[player.id] ?? player.id,
  }));
}
