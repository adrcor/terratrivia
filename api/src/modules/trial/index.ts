import type { User } from "@/auth";
import type { Database } from "@/database/database";
import type { Mode, Region, TrialResult } from "@/database/schema";
import { Er } from "@/utils/er";
import { generateId } from "@/utils/id";
import type { Context } from "hono";
import { Kysely } from "kysely";
import { ok, ResultAsync } from "neverthrow";
import { z } from "zod/v4";

// ============================================================================
// validation
// ============================================================================

const trialAnswerSchema = z.object({
  country: z.string(),
  cca2: z.string(),
  answer: z.string(),
  valid: z.boolean(),
  reaction_time: z.int(),
  typing_time: z.int(),
});

const newTrialResultSchema = z.object({
  region: z.enum(["af", "am", "as", "eu", "oc", "world"]),
  mode: z.enum(["capitals", "flags"]),
  length: z.int().min(1),
  correct: z.int().min(0),
  time: z.int().min(0),
  answers: z.array(trialAnswerSchema),
});

type NewTrialResultInput = z.infer<typeof newTrialResultSchema>;

// ============================================================================
// queries
// ============================================================================

function addResult(
  db: Kysely<Database>,
  idUser: string,
  input: NewTrialResultInput,
): ResultAsync<TrialResult, Er<"db_error">> {
  return ResultAsync.fromPromise(
    db
      .insertInto("trial_results")
      .values({
        id: generateId("trial"),
        id_user: idUser,
        region: input.region,
        mode: input.mode,
        length: input.length,
        correct: input.correct,
        time: input.time,
        answers: JSON.stringify(input.answers) as any,
      })
      .returningAll()
      .executeTakeFirstOrThrow(),
    () => Er.new("db_error", "Failed to insert trial result"),
  );
}

function getResult(
  db: Kysely<Database>,
  idUser: string,
  id: string,
): ResultAsync<TrialResult, Er<"not_found">> {
  return ResultAsync.fromPromise(
    db
      .selectFrom("trial_results")
      .selectAll()
      .where("id_user", "=", idUser)
      .where("id", "=", id)
      .executeTakeFirstOrThrow(),
    () => Er.new("not_found", "Trial result not found"),
  );
}

function getAllResults(
  db: Kysely<Database>,
  idUser: string,
): ResultAsync<Omit<TrialResult, "answers">[], Er<"db_error">> {
  return ResultAsync.fromPromise(
    db
      .selectFrom("trial_results")
      .select(["id", "id_user", "region", "mode", "length", "correct", "time", "created"])
      .where("id_user", "=", idUser)
      .execute(),
    () => Er.new("db_error", "Failed to fetch trial results"),
  );
}

function getHighscore(db: Kysely<Database>, idUser: string, region: Region, mode: Mode) {
  return ResultAsync.fromPromise(
    db
      .selectFrom("trial_highscores")
      .selectAll()
      .where("id_user", "=", idUser)
      .where("region", "=", region)
      .where("mode", "=", mode)
      .executeTakeFirst(),
    () => Er.new("db_error", "Failed to fetch highscore"),
  );
}

function setHighscore(
  db: Kysely<Database>,
  result: TrialResult,
): ResultAsync<void, Er<"db_error">> {
  return ResultAsync.fromPromise(
    db
      .insertInto("trial_highscores")
      .values({
        id_user: result.id_user!,
        region: result.region,
        mode: result.mode,
        id_result: result.id,
        length: result.length,
        correct: result.correct,
        time: result.time,
      })
      .onConflict((oc) =>
        oc.columns(["id_user", "region", "mode"]).doUpdateSet({
          id_result: result.id,
          length: result.length,
          correct: result.correct,
          time: result.time,
        }),
      )
      .execute()
      .then(() => undefined),
    () => Er.new("db_error", "Failed to set highscore"),
  );
}

function getAllHighscores(db: Kysely<Database>, idUser: string) {
  return ResultAsync.fromPromise(
    db.selectFrom("trial_highscores").selectAll().where("id_user", "=", idUser).execute(),
    () => Er.new("db_error", "Failed to fetch highscores"),
  );
}

// ============================================================================
// handlers
// ============================================================================

interface TrialCtx {
  h: Context;
  db: Kysely<Database>;
  user: User;
}

export function postResult(ctx: TrialCtx) {
  return parseBody(ctx.h).andThen((input) =>
    addResult(ctx.db, ctx.user.id, input).andThen((result) =>
      getHighscore(ctx.db, ctx.user.id, input.region, input.mode).andThen((current) => {
        const isNew =
          !current ||
          current.correct < result.correct ||
          (current.correct === result.correct && current.time > result.time);

        if (isNew) {
          return setHighscore(ctx.db, result).map(() => result);
        }
        return ok(result);
      }),
    ),
  );
}

export function getResultById(ctx: TrialCtx & { id: string }) {
  return getResult(ctx.db, ctx.user.id, ctx.id);
}

export function getResults(ctx: TrialCtx) {
  return getAllResults(ctx.db, ctx.user.id);
}

export function getHighscores(ctx: TrialCtx) {
  return getAllHighscores(ctx.db, ctx.user.id);
}

// ============================================================================
// helpers
// ============================================================================

function parseBody(h: Context): ResultAsync<NewTrialResultInput, Er<"validation_error">> {
  return ResultAsync.fromPromise(h.req.json(), () =>
    Er.new("validation_error", "Invalid JSON body"),
  ).andThen((body) => {
    const parsed = newTrialResultSchema.safeParse(body);
    if (!parsed.success) {
      return Er.err("validation_error", parsed.error.message);
    }
    return ok(parsed.data);
  });
}
