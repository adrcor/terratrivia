import { Er } from "@/utils/er";
import type { Context } from "hono";
import { okAsync, Result, ResultAsync } from "neverthrow";

const errorStatusMap = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation_error: 400,
  db_error: 500,
  internal_error: 500,
} as const;

type ErrorKey = keyof typeof errorStatusMap;

type BaseCtx = { h: Context };

function outputData<T>(h: Context, data: T) {
  return h.json(data, 200);
}

function outputError<K extends string>(h: Context, error: Er<K>) {
  const status = errorStatusMap[error.tag as ErrorKey] ?? 500;
  if (status === 500) {
    return h.json(Er.new("internal_error", "Internal server error"), 500);
  }
  return h.json(error, status);
}

export function serve<CTX, CTXERR extends string, OUT, OUTERR extends string>(
  h: Context,
  middlewares: (h: Context) => ResultAsync<CTX, Er<CTXERR>>,
  handler: (ctx: CTX) => ResultAsync<OUT, Er<OUTERR>> | Result<OUT, Er<OUTERR>>,
) {
  return middlewares(h)
    .andThen(handler)
    .match(
      (data: OUT) => outputData(h, data),
      (error: Er<CTXERR | OUTERR>) => outputError(h, error),
    );
}

// ============================================================================
// middlewares
// ============================================================================

export function newMiddleware(h: Context): ResultAsync<BaseCtx, never> {
  return okAsync({ h });
}
