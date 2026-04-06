import { er, newEr, type Er } from "./errors";
import { ok, ResultAsync } from "neverthrow";

export function fromAuth<T>(
  request: Promise<
    | { data: T; error: null }
    | {
        data: null;
        error: { status: number; statusText: string; message?: string };
      }
  >,
): ResultAsync<NonNullable<T>, Er<"network_error" | "auth_error">> {
  return ResultAsync.fromPromise(
    request,
    (e): Er<"network_error"> =>
      newEr("network_error", e instanceof Error ? e.message : "Network error"),
  ).andThen((res) => {
    if (res.error) {
      return er(
        "auth_error",
        `${res.error.status} ${res.error.statusText}: ${res.error.message ?? "..."}`,
      );
    }
    if (res.data == null) {
      return er("auth_error", "No data returned");
    }
    return ok(res.data as NonNullable<T>);
  });
}
