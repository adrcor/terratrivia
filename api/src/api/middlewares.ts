import { auth, type User } from "@/auth";
import { db, type Database } from "@/database/database";
import { Er } from "@/utils/er";
import type { Context } from "hono";
import { Kysely } from "kysely";
import { ok, okAsync, ResultAsync } from "neverthrow";

export interface BaseCtx {
  h: Context;
}

interface AuthCtx {
  user: User;
}

interface DbCtx {
  db: Kysely<Database>;
}

export function withAuth<T extends BaseCtx>(ctx: T): ResultAsync<T & AuthCtx, Er<"unauthorized">> {
  return ResultAsync.fromPromise(auth.api.getSession({ headers: ctx.h.req.raw.headers }), () =>
    Er.new("unauthorized", "Unauthorized"),
  ).andThen((session) => {
    return session?.user
      ? ok({ ...ctx, user: session.user })
      : Er.err("unauthorized", "Unauthorized");
  });
}

export function withDatabase<T>(ctx: T): ResultAsync<T & DbCtx, never> {
  return okAsync({ ...ctx, db });
}
