import { newEr, type Er } from "./errors";
import { type ClientResponse } from "hono/client";
import { err, ok, Result, ResultAsync } from "neverthrow";

// Extract all Data from ClientResponse union
type DataOf<T> = T extends ClientResponse<infer D, number, string> ? D : never;

// Filter by shape: Er has { tag, message }
type SuccessOf<T> = T extends { tag: string; message: string } ? never : T;
type ErrorTagOf<T> = T extends { tag: infer K extends string; message: string }
  ? K
  : never;

export function fromApi<T extends Promise<ClientResponse<any, number, "json">>>(
  request: T,
): ResultAsync<
  SuccessOf<DataOf<Awaited<T>>>,
  Er<ErrorTagOf<DataOf<Awaited<T>>> | "network_error">
> {
  type Data = DataOf<Awaited<T>>;
  type Success = SuccessOf<Data>;
  type Err = Er<ErrorTagOf<Data> | "network_error">;

  return ResultAsync.fromPromise(
    request,
    (e): Er<"network_error"> =>
      newEr("network_error", e instanceof Error ? e.message : "Network error"),
  ).andThen((res) =>
    ResultAsync.fromPromise(
      res.json() as Promise<Data>,
      (): Er<"network_error"> =>
        newEr("network_error", "Failed to parse response"),
    ).andThen(
      (data): Result<Success, Err> =>
        "tag" in data ? err(data as unknown as Err) : ok(data as Success),
    ),
  );
}
