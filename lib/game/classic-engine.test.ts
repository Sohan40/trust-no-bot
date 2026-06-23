import { describe, expect, it } from "vitest";
import {
  applyNightKill,
  chooseNightActions,
  resolveNightActions,
} from "@/lib/game/actions";
import { toVisibleGameState } from "@/lib/game/public-state";
import { assignClassicRoles } from "@/lib/game/roles";
import { advanceGamePhase } from "@/lib/game/state-machine";
import { checkWinCondition } from "@/lib/game/win-conditions";
import {
  collectDayVotes,
  eliminatePlayer,
  GameRuleError,
  resolveVotes,
} from "@/lib/game/voting";
import type { AgentTraits, Game, Player } from "@/lib/game/types";

const traits: AgentTraits = {
  aggression: 0.5,
  caution: 0.5,
  humor: 0.5,
  logic: 0.5,
  empathy: 0.5,
  defensiveness: 0.5,
  riskTolerance: 0.5,
  talkativeness: 0.5,
};

describe("Classic Mode role assignment", () => {
  it("assigns one human Villager plus the expected AI roles", () => {
    const players = assignClassicRoles("classic-test-seed");
    const roles = players.map((player) => player.role);

    expect(new Set(players.map((player) => player.id)).size).toBe(7);
    expect(players.filter((player) => player.isHuman)).toHaveLength(1);
    expect(players.find((player) => player.isHuman)?.role).toBe("Villager");
    expect(roles.filter((role) => role === "Mafia")).toHaveLength(1);
    expect(roles.filter((role) => role === "Detective")).toHaveLength(1);
    expect(roles.filter((role) => role === "Doctor")).toHaveLength(1);
    expect(roles.filter((role) => role === "Villager")).toHaveLength(4);
  });
});

describe("Classic Mode night actions", () => {
  it("chooses the same seeded targets regardless of persisted player order", () => {
    const players = createPlayers();
    const shuffledPlayers = [
      players[3],
      players[0],
      players[4],
      players[1],
      players[2],
    ];

    expect(chooseNightActions(shuffledPlayers, "stable-seed", 2)).toEqual(
      chooseNightActions(players, "stable-seed", 2),
    );
  });
  it("lets a doctor save prevent the Mafia kill", () => {
    const players = createPlayers();
    const resolution = resolveNightActions(players, [
      {
        actorId: "mafia",
        targetId: "human",
        nightNumber: 1,
        actionType: "mafia_kill",
      },
      {
        actorId: "doctor",
        targetId: "human",
        nightNumber: 1,
        actionType: "doctor_save",
      },
    ]);

    expect(resolution.killedPlayerId).toBeNull();
    expect(applyNightKill(players, resolution.killedPlayerId)).toEqual(players);
  });

  it("returns a deterministic private detective result", () => {
    const players = createPlayers();
    const resolution = resolveNightActions(players, [
      {
        actorId: "detective",
        targetId: "mafia",
        nightNumber: 1,
        actionType: "detective_check",
      },
    ]);

    expect(resolution.detectiveResult).toEqual({
      detectiveId: "detective",
      targetId: "mafia",
      isMafia: true,
    });
  });

  it("ends with a Mafia win when the human dies before normal parity", () => {
    const game = {
      ...createGame("NIGHT_ACTIONS"),
      seed: "human-kill-0",
      players: [
        createPlayer("villager-b", "Villager", true),
        createPlayer("mafia", "Mafia", true),
        createPlayer("human", "Villager", true, true),
        createPlayer("doctor", "Doctor", false),
        createPlayer("villager-a", "Villager", true),
        createPlayer("detective", "Detective", false),
      ],
    };

    const transition = advanceGamePhase(game);

    expect(
      transition.game.players.find((player) => player.id === "human")?.isAlive,
    ).toBe(false);
    expect(checkWinCondition(transition.game.players)).toBeNull();
    expect(transition.game.status).toBe("completed");
    expect(transition.game.phase).toBe("GAME_OVER");
    expect(transition.game.winner).toBe("mafia");
  });
});

describe("Classic Mode voting and elimination", () => {
  it("rejects votes outside the voting phase", () => {
    const game = createGame("DAY_DISCUSSION");

    expect(() =>
      collectDayVotes(game, {
        voterId: "human",
        targetId: "mafia",
        dayNumber: 1,
      }),
    ).toThrow(GameRuleError);
  });

  it("rejects votes from dead players or against dead targets", () => {
    const game = {
      ...createGame("VOTING"),
      players: createPlayers().map((player) =>
        player.id === "human" ? { ...player, isAlive: false } : player,
      ),
    };

    expect(() =>
      collectDayVotes(game, {
        voterId: "human",
        targetId: "mafia",
        dayNumber: 1,
      }),
    ).toThrow("Only alive players can vote.");
  });

  it("returns no elimination on tied votes", () => {
    expect(
      resolveVotes([
        { voterId: "human", targetId: "mafia", dayNumber: 1 },
        { voterId: "mafia", targetId: "human", dayNumber: 1 },
      ]),
    ).toBeNull();
  });

  it("cannot eliminate an already dead player", () => {
    const players = createPlayers().map((player) =>
      player.id === "mafia" ? { ...player, isAlive: false } : player,
    );

    expect(() => eliminatePlayer(players, "mafia")).toThrow(
      "Cannot eliminate a dead or missing player.",
    );
  });
});

describe("Classic Mode win conditions", () => {
  it("gives villagers the win when Mafia is eliminated", () => {
    const players = createPlayers().map((player) =>
      player.id === "mafia" ? { ...player, isAlive: false } : player,
    );

    expect(checkWinCondition(players)).toBe("villagers");
  });

  it("gives Mafia the win when Mafia reaches parity", () => {
    const players = [
      createPlayer("mafia", "Mafia", true),
      createPlayer("human", "Villager", true, true),
      createPlayer("doctor", "Doctor", false),
    ];

    expect(checkWinCondition(players)).toBe("mafia");
  });
});

describe("Classic Mode public-state filtering", () => {
  it("hides AI role/team data and non-recipient private messages before game over", () => {
    const game = {
      ...createGame("VOTING"),
      messages: [
        {
          id: "public",
          speakerId: "system" as const,
          speakerName: "Room",
          phase: "VOTING" as const,
          phaseLabel: "Day 1 Vote",
          dayNumber: 1,
          visibility: "system" as const,
          text: "Public update.",
        },
        {
          id: "detective-private",
          speakerId: "system" as const,
          speakerName: "Room",
          phase: "VOTING" as const,
          phaseLabel: "Day 1 Vote",
          dayNumber: 1,
          visibility: "private" as const,
          text: "Mafia clue.",
          metadata: { recipientPlayerId: "detective" },
        },
      ],
    };

    const visible = toVisibleGameState(game, "human");

    expect(visible.privateInfo.role).toBe("Villager");
    expect(visible.messages).toHaveLength(1);
    expect(visible.publicPlayers.find((player) => player.id === "mafia")?.role).toBeUndefined();
    expect(visible.publicPlayers.find((player) => player.id === "mafia")?.team).toBeUndefined();
  });

  it("reveals all roles after game over", () => {
    const game = {
      ...createGame("GAME_OVER"),
      status: "completed" as const,
      winner: "villagers" as const,
    };

    const visible = toVisibleGameState(game, "human");

    expect(visible.publicPlayers.find((player) => player.id === "mafia")?.role).toBe("Mafia");
    expect(visible.game.winner).toBe("villagers");
  });
});

function createGame(phase: Game["phase"]): Game {
  return {
    id: "game",
    mode: "classic",
    status: phase === "GAME_OVER" ? "completed" : "active",
    phase,
    phaseLabel: phase,
    dayNumber: 1,
    seed: "seed",
    winner: phase === "GAME_OVER" ? "villagers" : null,
    humanPlayerId: "human",
    players: createPlayers(),
    messages: [],
    votes: [],
    nightActions: [],
  };
}

function createPlayers(): Player[] {
  return [
    createPlayer("human", "Villager", true, true),
    createPlayer("mafia", "Mafia", true),
    createPlayer("detective", "Detective", true),
    createPlayer("doctor", "Doctor", true),
    createPlayer("villager", "Villager", true),
  ];
}

function createPlayer(
  id: string,
  role: Player["role"],
  isAlive: boolean,
  isHuman = false,
): Player {
  return {
    id,
    displayName: id,
    isHuman,
    role,
    team: role === "Mafia" ? "mafia" : "village",
    isAlive,
    publicStyle: "plain",
    traits,
    memorySummary: "test",
    suspicion: 0.1,
  };
}
