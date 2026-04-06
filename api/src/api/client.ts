import { ApiType } from ".";
import { API_URL } from "@/env";
import { Er } from "@/utils/er";
import { ClientResponse, hc } from "hono/client";
import { err, ok, Result, ResultAsync } from "neverthrow";

interface ApiContext {
  token: string | undefined;
}

interface ApiClient {
  context: ApiContext;
  client: ReturnType<typeof hc<ApiType>>;
}

export function newApiClient(): ApiClient {
  const context: ApiContext = {
    token: undefined,
  };
  return {
    context,
    client: hc<ApiType>(API_URL, {
      headers: () => ({
        Authorization: context.token ? `Bearer ${context.token}` : "",
      }),
    }),
  };
}

// --- client helper ---

type DataOf<T> = T extends ClientResponse<infer D, number, string> ? D : never;

type SuccessOf<T> = T extends { tag: string; message: string } ? never : T;
type ErrorTagOf<T> = T extends { tag: infer K extends string; message: string } ? K : never;

export function fromApi<T extends Promise<ClientResponse<object, number, "json">>>(
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
      Er.new("network_error", e instanceof Error ? e.message : "Network error"),
  ).andThen((res) =>
    ResultAsync.fromPromise(
      res.json() as Promise<Data>,
      (): Er<"network_error"> => Er.new("network_error", "Failed to parse response"),
    ).andThen(
      (data): Result<Success, Err> =>
        "tag" in data ? err(data as unknown as Err) : ok(data as Success),
    ),
  );
}
