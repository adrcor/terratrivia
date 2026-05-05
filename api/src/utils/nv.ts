import { errAsync, okAsync, Result, ResultAsync } from "neverthrow";

export function toAsync<T, E>(result: Result<T, E>): ResultAsync<T, E> {
  return result.match(
    (value) => okAsync(value),
    (error) => errAsync(error),
  );
}
