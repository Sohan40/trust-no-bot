import { z } from "zod";

const agentTraitsSchema = z
  .object({
    aggression: z.number().min(0).max(1),
    caution: z.number().min(0).max(1),
    humor: z.number().min(0).max(1),
    logic: z.number().min(0).max(1),
    empathy: z.number().min(0).max(1),
    defensiveness: z.number().min(0).max(1),
    riskTolerance: z.number().min(0).max(1),
    talkativeness: z.number().min(0).max(1),
  })
  .strict();

export const directorIntentSchema = z.enum([
  "accuse",
  "defend",
  "question",
  "observe",
  "deflect",
  "summarize",
]);

export const gameDirectorInputSchema = z
  .object({
    purpose: z.enum(["day_discussion", "question_response"]),
    phase: z.enum(["DAY_DISCUSSION", "PLAYER_QUESTION"]),
    dayNumber: z.number().int().positive(),
    alivePlayers: z
      .array(
        z
          .object({
            id: z.string().min(1),
            displayName: z.string().min(1).max(80),
            isHuman: z.boolean(),
            publicStyle: z.string().max(160),
            traits: agentTraitsSchema,
            suspicion: z.number().min(0).max(1),
          })
          .strict(),
      )
      .min(1)
      .max(7),
    hiddenRoles: z
      .array(
        z
          .object({
            playerId: z.string().min(1),
            displayName: z.string().min(1).max(80),
            role: z.enum(["Mafia", "Detective", "Doctor", "Villager"]),
            team: z.enum(["mafia", "village"]),
            isAlive: z.boolean(),
          })
          .strict(),
      )
      .min(1)
      .max(7),
    recentPublicMessages: z
      .array(
        z
          .object({
            speakerId: z.string().min(1),
            speakerName: z.string().min(1).max(80),
            text: z.string().min(1).max(500),
            phase: z.string().min(1),
            dayNumber: z.number().int().nonnegative(),
          })
          .strict(),
      )
      .max(12),
    publicTranscriptSummary: z.string().max(1500),
    memorySummaries: z
      .array(
        z
          .object({
            playerId: z.string().min(1),
            summary: z.string().max(300),
          })
          .strict(),
      )
      .max(6),
    userAction: z
      .object({
        question: z.string().trim().min(1).max(500),
        targetPlayerId: z.string().min(1).nullable(),
      })
      .strict()
      .nullable(),
    constraints: z.array(z.string().min(1).max(240)).min(1).max(16),
  })
  .strict();

export const gameDirectorOutputSchema = z
  .object({
    publicMessages: z
      .array(
        z
          .object({
            speakerId: z.string().min(1),
            text: z.string().trim().min(1).max(240),
            intent: directorIntentSchema,
          })
          .strict(),
      )
      .min(1)
      .max(6),
    memoryUpdates: z
      .array(
        z
          .object({
            playerId: z.string().min(1),
            publicNote: z.string().trim().max(240).nullable(),
            privateNote: z.string().trim().max(240).nullable(),
          })
          .strict(),
      )
      .max(6),
    suspicionDeltas: z
      .array(
        z
          .object({
            observerId: z.string().min(1),
            targetId: z.string().min(1),
            delta: z.number().min(-0.25).max(0.25),
            reason: z.string().trim().min(1).max(160),
          })
          .strict(),
      )
      .max(12),
    suggestedVotes: z
      .array(
        z
          .object({
            voterId: z.string().min(1),
            targetId: z.string().min(1),
            reason: z.string().trim().min(1).max(160),
          })
          .strict(),
      )
      .max(6),
  })
  .strict();

export type GameDirectorInput = z.infer<typeof gameDirectorInputSchema>;
export type GameDirectorOutput = z.infer<typeof gameDirectorOutputSchema>;
