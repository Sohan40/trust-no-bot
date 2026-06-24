import { describe, expect, it } from "vitest";
import { isSafeDirectorMessage } from "@/lib/ai/safety";
import type { GameDirectorInput } from "@/lib/ai/schemas";

const hiddenRoles: GameDirectorInput["hiddenRoles"] = [
  {
    playerId: "riya",
    displayName: "Riya",
    role: "Mafia",
    team: "mafia",
    isAlive: true,
  },
  {
    playerId: "dev",
    displayName: "Dev",
    role: "Doctor",
    team: "village",
    isAlive: true,
  },
  {
    playerId: "meera",
    displayName: "Meera",
    role: "Villager",
    team: "village",
    isAlive: true,
  },
  {
    playerId: "tara",
    displayName: "Tara",
    role: "Detective",
    team: "village",
    isAlive: false,
  },
];

describe("isSafeDirectorMessage", () => {
  it.each([
    "Riya is Mafia.",
    "Riya is the Mafia.",
    "Riya is Detective.",
    "Dev is the Doctor.",
    "Meera is not Mafia.",
    "Riya checked as Mafia.",
    "Riya is village team.",
    "Riya is mafia team.",
    "Tara is Villager.",
    "I know Riya is Mafia.",
  ])("rejects direct role attribution: %s", (message) => {
    expect(isSafeDirectorMessage(message, hiddenRoles)).toBe(false);
  });

  it.each([
    "Riya feels suspicious.",
    "Riya pushed too hard.",
    "I do not trust Riya yet.",
  ])("allows normal suspicion language: %s", (message) => {
    expect(isSafeDirectorMessage(message, hiddenRoles)).toBe(true);
  });
});
