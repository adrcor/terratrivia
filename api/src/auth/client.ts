import type { auth } from "./auth";
import { API_URL } from "@/env";
import { Er } from "@/utils/er";
import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { errAsync, ok, okAsync, ResultAsync } from "neverthrow";

interface AuthContext {
  token: string | undefined;
}

export interface AuthClient {
  context: AuthContext;
  client: ReturnType<typeof createAuthClient>;
}

export function newAuthClient(): AuthClient {
  const context: AuthContext = {
    token: undefined,
  };
  const client = createAuthClient({
    baseURL: API_URL + "/",
    basePath: "/auth",
    plugins: [inferAdditionalFields<typeof auth>()],
    fetchOptions: {
      auth: {
        type: "Bearer",
        token: () => {
          return context.token ?? "";
        },
      },
      onSuccess: (ctx) => {
        context.token = ctx.response.headers.get("set-auth-token") ?? undefined;
      },
    },
  });
  return {
    context,
    client,
  };
}

// --- client helper ---

export function fromAuth<T>(
  request: Promise<
    | { data: T; error: null }
    | { data: null; error: { status: number; statusText: string; message?: string } }
  >,
): ResultAsync<NonNullable<T>, Er<"network_error" | "auth_error">> {
  return ResultAsync.fromPromise(
    request,
    (e): Er<"network_error"> =>
      Er.new("network_error", e instanceof Error ? e.message : "Network error"),
  ).andThen((res) => {
    if (res.error) {
      return Er.err(
        "auth_error",
        `${res.error.status} ${res.error.statusText}: ${res.error.message ?? "..."}`,
      );
    }
    if (res.data == null) {
      return Er.err("auth_error", "No data returned");
    }
    return ok(res.data as NonNullable<T>);
  });
}
