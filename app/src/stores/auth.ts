import { API_URL } from "@/env";
import { fromAuth } from "@/utils/auth";
import { newEr, type Er } from "@/utils/errors";
import { notifyError } from "@/utils/toast";
import { useLocalStorage } from "@vueuse/core";
import { createAuthClient } from "better-auth/vue";
import { ResultAsync } from "neverthrow";
import { defineStore } from "pinia";
import { computed } from "vue";

type CachedUser = { id: string; email: string } | null;

const authClient = createAuthClient({
  baseURL: API_URL,
  basePath: "/auth",
});

export const useAuthStore = defineStore("auth", () => {
  const user = useLocalStorage<CachedUser>("auth_user", null, {
    serializer: {
      read: (v) => (v ? JSON.parse(v) : null),
      write: (v) => JSON.stringify(v),
    },
  });

  const id = computed(() => user.value?.id ?? null);
  const email = computed(() => user.value?.email ?? null);
  const isAuthenticated = computed(() => id.value != null);

  function sync() {
    // getSession returns { data: null, error: null } when unauthenticated — a
    // successful response that should clear the cache. fromAuth can't model
    // that, so build the ResultAsync directly here.
    return ResultAsync.fromPromise(
      authClient.getSession(),
      (e): Er<"network_error"> =>
        newEr(
          "network_error",
          e instanceof Error ? e.message : "Network error",
        ),
    )
      .map((res) => {
        if (res.data?.user) {
          user.value = { id: res.data.user.id, email: res.data.user.email };
        } else if (!res.error) {
          user.value = null;
        }
      })
      .mapErr((e) => {
        notifyError(e, "failed to verify session");
        return e;
      });
  }

  function signIn(emailArg: string, password: string) {
    return fromAuth(authClient.signIn.email({ email: emailArg, password })).map(
      (data) => {
        user.value = { id: data.user.id, email: data.user.email };
      },
    );
  }

  function signUp(emailArg: string, password: string) {
    return fromAuth(
      authClient.signUp.email({
        email: emailArg,
        password,
        name: emailArg,
      }),
    ).map((data) => {
      user.value = { id: data.user.id, email: data.user.email };
    });
  }

  function signOut() {
    return fromAuth(authClient.signOut()).map(() => {
      user.value = null;
    });
  }

  function changePassword(currentPassword: string, newPassword: string) {
    return fromAuth(
      authClient.changePassword({ currentPassword, newPassword }),
    ).map(() => undefined);
  }

  function resetPassword(newPassword: string, token: string) {
    return fromAuth(authClient.resetPassword({ newPassword, token })).map(
      () => undefined,
    );
  }

  function requestPasswordReset(emailArg: string, redirectTo: string) {
    return fromAuth(
      authClient.requestPasswordReset({ email: emailArg, redirectTo }),
    ).map(() => undefined);
  }

  return {
    id,
    email,
    isAuthenticated,
    sync,
    signIn,
    signUp,
    signOut,
    changePassword,
    resetPassword,
    requestPasswordReset,
  };
});
