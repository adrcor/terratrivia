import { useAuthStore } from "./auth";
import { useApi } from "@/composables/api";
import type {
  TrialResultLocal,
  TrialResult,
  TrialHighscore,
  TrialResultSmall,
} from "@/types/trial";
import { fromApi } from "@/utils/api";
import { notifyError } from "@/utils/toast";
import { useLocalStorage } from "@vueuse/core";
import { err, ok, okAsync } from "neverthrow";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTrialStore = defineStore("store", () => {
  const apiClient = useApi();
  const results = useLocalStorage<Array<TrialResultSmall>>("results", []);
  const highscores = useLocalStorage<Array<TrialHighscore>>("highscores", []);
  const pendingResults = useLocalStorage<Array<TrialResultLocal>>(
    "pending_results",
    [],
  );
  const latest = ref<TrialResult | TrialResultLocal | null>(null);

  let cacheResults: Record<string, TrialResult> = {};

  function isNewHighscore(result: TrialResult): boolean {
    const current = highscores.value.find(
      (h) => h.region === result.region && h.mode === result.mode,
    );
    return (
      !current ||
      current.correct < result.correct ||
      (current?.correct === result.correct && current?.time > result.time)
    );
  }

  function postResult(result: TrialResultLocal) {
    latest.value = result;

    if (!useAuthStore().isAuthenticated) {
      pendingResults.value.push(result);
      if (pendingResults.value.length > 10) {
        pendingResults.value.shift();
      }
      return;
    }

    return fromApi(apiClient.trial.results.$post({ json: result }))
      .andTee((data) => {
        latest.value = data;
        results.value.push(data);
        cacheResults[data.id] = data;
        if (isNewHighscore(data)) {
          syncHighscores();
        }
      })
      .mapErr((e) => {
        notifyError(e, "failed to save trial result");
        return e;
      });
  }

  function getResult(id: string) {
    if (cacheResults[id]) {
      return okAsync(cacheResults[id] as TrialResult);
    }
    return fromApi(apiClient.trial.results[":id"].$get({ param: { id } }))
      .andTee((data) => {
        cacheResults[id] = data;
      })
      .mapErr((e) => {
        notifyError(e, "failed to load trial result");
        return e;
      });
  }

  async function uploadPending() {
    while (pendingResults.value.length > 0) {
      const r = await fromApi(
        apiClient.trial.results.$post({ json: pendingResults.value[0]! }),
      );
      if (r.isErr()) return err(r.error);
      pendingResults.value.shift();
    }
    return ok(undefined);
  }

  function syncResults() {
    return fromApi(apiClient.trial.results.$get()).andTee((data) => {
      results.value = data;
    });
  }

  function syncHighscores() {
    return fromApi(apiClient.trial.highscores.$get()).andTee((data) => {
      highscores.value = data;
    });
  }

  function clear(): void {
    results.value = [];
    highscores.value = [];
    pendingResults.value = [];
    latest.value = null;
    cacheResults = {};
  }

  return {
    results,
    highscores,
    pendingResults,
    latest,

    postResult,
    getResult,
    uploadPending,
    syncResults,
    syncHighscores,
    clear,
  };
});
