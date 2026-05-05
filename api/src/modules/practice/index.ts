import { type User } from "@/auth";
import { Database } from "@/database/database";
import { Mode, PracticeUnit, Region } from "@/database/schema";
import { Er } from "@/utils/er";
import { toAsync } from "@/utils/nv";
import { zodParse } from "@/utils/parse";
import { Context } from "hono";
import { Kysely } from "kysely";
import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod/v4";

const regionSchema = z.enum(["af", "am", "as", "eu", "oc", "world"]);
const modeSchema = z.enum(["capitals", "flags"]);

const countryStatsSchema = z.object({
  country: z.string(),
  cca2: z.string(),
  answer: z.string(),
  reaction_time: z.int().min(0), // ms
  wpm: z.int().min(0),
  count: z.int().min(0),
});

const practiceUnitSchema = z.object({
  region: regionSchema,
  mode: modeSchema,
  count: z.int().min(0),
  discovered: z.int().min(0),
  countries: z.array(z.string()), // cca2
  countryStats: z.record(z.string(), countryStatsSchema), // cca2 -> CountryStats
});

// ============================================================================
// database
// ============================================================================

function selectPracticeUnit(
  db: Kysely<Database>,
  idUser: string,
  region: Region,
  mode: Mode,
): ResultAsync<PracticeUnit | null, Er<"db_error">> {
  return ResultAsync.fromPromise(
    db
      .selectFrom("practice_units")
      .select("unit")
      .where("id_user", "=", idUser)
      .where("region", "=", region)
      .where("mode", "=", mode)
      .executeTakeFirst(),
    () => Er.new("db_error", "Failed to fetch practice unit"),
  ).map((unit) => unit?.unit || null);
}

function selectAllPracticeUnits(
  db: Kysely<Database>,
  idUser: string,
): ResultAsync<PracticeUnit[], Er<"db_error">> {
  return ResultAsync.fromPromise(
    db.selectFrom("practice_units").select("unit").where("id_user", "=", idUser).execute(),
    () => Er.new("db_error", "Failed to fetch practice units"),
  ).map((units) => units.map((unit) => unit.unit));
}

function insertPracticeUnit(
  db: Kysely<Database>,
  idUser: string,
  unit: PracticeUnit,
): ResultAsync<PracticeUnit, Er<"db_error">> {
  return ResultAsync.fromPromise(
    db
      .insertInto("practice_units")
      .values({
        id_user: idUser,
        region: unit.region,
        mode: unit.mode,
        unit: unit,
      })
      .onConflict((oc) => oc.columns(["id_user", "region", "mode"]).doUpdateSet({ unit: unit }))
      .returning("unit")
      .executeTakeFirstOrThrow(),
    () => Er.new("db_error", "Failed to save practice unit"),
  ).map((unit) => unit.unit);
}

function _deletePracticeUnit(
  db: Kysely<Database>,
  idUser: string,
  region: Region,
  mode: Mode,
): ResultAsync<void, Er<"db_error">> {
  return ResultAsync.fromPromise(
    db
      .deleteFrom("practice_units")
      .where("id_user", "=", idUser)
      .where("region", "=", region)
      .where("mode", "=", mode)
      .execute(),
    () => Er.new("db_error", "Failed to delete practice unit"),
  ).map(() => undefined);
}

// ============================================================================
// handlers
// ============================================================================

interface PracticeCtx {
  h: Context;
  db: Kysely<Database>;
  user: User;
}

export function postPracticeUnit(
  ctx: PracticeCtx & { practiceUnit: unknown },
): ResultAsync<PracticeUnit, Er<"db_error" | "validation_error" | "sync_error">> {
  return toAsync(zodParse(practiceUnitSchema, ctx.practiceUnit)).andThen((parsed) =>
    selectPracticeUnit(ctx.db, ctx.user.id, parsed.region, parsed.mode).andThen((current) => {
      if (current && parsed.count !== current.count + 1) {
        return errAsync(Er.new("sync_error", "Practice unit count mismatch"));
      }
      return insertPracticeUnit(ctx.db, ctx.user.id, parsed);
    }),
  );
}

export function getAllPracticeUnits(ctx: PracticeCtx): ResultAsync<PracticeUnit[], Er<"db_error">> {
  return selectAllPracticeUnits(ctx.db, ctx.user.id);
}

export function deletePracticeUnit(
  ctx: PracticeCtx & { region: unknown; mode: unknown },
): ResultAsync<void, Er<"db_error" | "validation_error">> {
  const region = toAsync(zodParse(regionSchema, ctx.region));
  const mode = toAsync(zodParse(modeSchema, ctx.mode));
  return ResultAsync.combine([region, mode]).andThen(([region, mode]) => {
    return _deletePracticeUnit(ctx.db, ctx.user.id, region, mode);
  });
}
