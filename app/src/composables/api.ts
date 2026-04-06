import { API_URL } from "@/env";
import type { ApiType } from "@api/api";
import { hc } from "hono/client";

const apiClient = hc<ApiType>(API_URL, {
  init: {
    credentials: "include",
  },
});

export function useApi() {
  return apiClient;
}
