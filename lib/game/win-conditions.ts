import type { Player, Winner } from "@/lib/game/types";

export function checkWinCondition(players: Player[]): Winner | null {
  const alivePlayers = players.filter((player) => player.isAlive);
  const aliveMafia = alivePlayers.filter((player) => player.team === "mafia");
  const aliveVillage = alivePlayers.filter((player) => player.team === "village");

  if (aliveMafia.length === 0) {
    return "villagers";
  }

  if (aliveMafia.length >= aliveVillage.length) {
    return "mafia";
  }

  return null;
}
