import { err, Result } from "neverthrow";

export function exhaustiveCheck(value: never): never {
  throw new Error(`exhaustive check failed for value: ${value}`) as never;
}

export function exhaustiveCheckResult(value: never): Result<never, any> {
  return err(`exhaustive check failed for value: ${value}`);
}
