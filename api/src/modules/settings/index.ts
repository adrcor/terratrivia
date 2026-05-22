import { type User } from "@/auth";
import { Database } from "@/database/database";
import { UserSettings } from "@/database/schema";
import { Er } from "@/utils/er";
import { toAsync } from "@/utils/nv";
import { zodParse } from "@/utils/parse";
import { Context } from "hono";
import { Kysely } from "kysely";
import { ResultAsync } from "neverthrow";
import { z } from "zod/v4";

const STANDARD_SETTINGS: UserSettings = {
  reactionTarget: 1000,
  wpmTarget: 100,
  validationScore: 50,
};

const userSettingsSchema = z.object({
  reactionTarget: z.int().min(200).max(5000),
  wpmTarget: z.int().min(10).max(300),
  validationScore: z.int().min(0).max(100),
});

const userSettingsPatchSchema = userSettingsSchema.partial();

// ============================================================================
// database
// ============================================================================

function selectUserSettings(
  db: Kysely<Database>,
  idUser: string,
): ResultAsync<Partial<UserSettings>, Er<"db_error">> {
  return ResultAsync.fromPromise(
    db
      .selectFrom("user_settings")
      .select("settings")
      .where("id_user", "=", idUser)
      .executeTakeFirst(),
    () => Er.new("db_error", "Failed to fetch user settings"),
  ).map((row) => row?.settings ?? {});
}

function upsertUserSettings(
  db: Kysely<Database>,
  idUser: string,
  settings: Partial<UserSettings>,
): ResultAsync<Partial<UserSettings>, Er<"db_error">> {
  return ResultAsync.fromPromise(
    db
      .insertInto("user_settings")
      .values({
        id_user: idUser,
        settings: settings,
      })
      .onConflict((oc) =>
        oc.column("id_user").doUpdateSet({ settings: settings, updated: new Date() }),
      )
      .returning("settings")
      .executeTakeFirstOrThrow(),
    () => Er.new("db_error", "Failed to save user settings"),
  ).map((row) => row.settings);
}

// ============================================================================
// handlers
// ============================================================================

interface SettingsCtx {
  h: Context;
  db: Kysely<Database>;
  user: User;
}

export function getUserSettings(ctx: SettingsCtx): ResultAsync<UserSettings, Er<"db_error">> {
  return selectUserSettings(ctx.db, ctx.user.id).map((stored) => ({
    ...STANDARD_SETTINGS,
    ...stored,
  }));
}

export function patchUserSettings(
  ctx: SettingsCtx & { patch: unknown },
): ResultAsync<UserSettings, Er<"db_error" | "validation_error">> {
  return toAsync(zodParse(userSettingsPatchSchema, ctx.patch)).andThen((patch) =>
    selectUserSettings(ctx.db, ctx.user.id).andThen((stored) => {
      const merged = { ...stored, ...patch };
      return upsertUserSettings(ctx.db, ctx.user.id, merged).map((saved) => ({
        ...STANDARD_SETTINGS,
        ...saved,
      }));
    }),
  );
}
