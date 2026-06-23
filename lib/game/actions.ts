import { seededPick } from "@/lib/game/random";
import type { NightAction, Player, PlayerId } from "@/lib/game/types";

export type NightResolution = {
  actions: NightAction[];
  killedPlayerId: PlayerId | null;
  protectedPlayerId: PlayerId | null;
  detectiveResult: {
    detectiveId: PlayerId;
    targetId: PlayerId;
    isMafia: boolean;
  } | null;
};

export function chooseNightActions(
  players: Player[],
  seed: string,
  nightNumber: number,
): NightAction[] {
  const alivePlayers = [...players]
    .sort((left, right) =>
      left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
    )
    .filter((player) => player.isAlive);
  const mafia = alivePlayers.find((player) => player.role === "Mafia");
  const doctor = alivePlayers.find((player) => player.role === "Doctor");
  const detective = alivePlayers.find((player) => player.role === "Detective");
  const actions: NightAction[] = [];

  if (mafia) {
    const target = seededPick(
      alivePlayers.filter((player) => player.team !== "mafia"),
      `${seed}:night:${nightNumber}:mafia`,
    );

    if (target) {
      actions.push({
        actorId: mafia.id,
        targetId: target.id,
        nightNumber,
        actionType: "mafia_kill",
      });
    }
  }

  if (doctor) {
    const target = seededPick(
      alivePlayers,
      `${seed}:night:${nightNumber}:doctor`,
    );

    if (target) {
      actions.push({
        actorId: doctor.id,
        targetId: target.id,
        nightNumber,
        actionType: "doctor_save",
      });
    }
  }

  if (detective) {
    const target = seededPick(
      alivePlayers.filter((player) => player.id !== detective.id),
      `${seed}:night:${nightNumber}:detective`,
    );

    if (target) {
      actions.push({
        actorId: detective.id,
        targetId: target.id,
        nightNumber,
        actionType: "detective_check",
      });
    }
  }

  return actions;
}

export function resolveNightActions(
  players: Player[],
  actions: NightAction[],
): NightResolution {
  const mafiaKill = actions.find((action) => action.actionType === "mafia_kill");
  const doctorSave = actions.find(
    (action) => action.actionType === "doctor_save",
  );
  const detectiveCheck = actions.find(
    (action) => action.actionType === "detective_check",
  );
  const protectedPlayerId = doctorSave?.targetId ?? null;
  const killedPlayerId =
    mafiaKill?.targetId && mafiaKill.targetId !== protectedPlayerId
      ? mafiaKill.targetId
      : null;
  const detectiveTarget = players.find(
    (player) => player.id === detectiveCheck?.targetId && player.isAlive,
  );

  return {
    actions: actions.map((action) => ({
      ...action,
      result:
        action.actionType === "mafia_kill"
          ? { killedPlayerId }
          : action.actionType === "doctor_save"
            ? { protectedPlayerId }
            : {
                targetTeam:
                  detectiveTarget?.team === "mafia" ? "mafia" : "village",
              },
    })),
    killedPlayerId,
    protectedPlayerId,
    detectiveResult:
      detectiveCheck?.targetId && detectiveTarget
        ? {
            detectiveId: detectiveCheck.actorId,
            targetId: detectiveCheck.targetId,
            isMafia: detectiveTarget.team === "mafia",
          }
        : null,
  };
}

export function applyNightKill(
  players: Player[],
  killedPlayerId: PlayerId | null,
): Player[] {
  if (!killedPlayerId) {
    return players;
  }

  return players.map((player) =>
    player.id === killedPlayerId ? { ...player, isAlive: false } : player,
  );
}
