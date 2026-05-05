import { Er } from "./er";
import { ok, Result } from "neverthrow";
import { ZodType } from "zod/v4";

export function zodParse<T>(schema: ZodType<T>, data: unknown): Result<T, Er<"validation_error">> {
  const result = schema.safeParse(data);
  return result.success ? ok(result.data) : Er.err("validation_error", result.error.message);
}
