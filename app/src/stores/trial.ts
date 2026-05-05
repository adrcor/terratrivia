import { useApi } from "@/composables/api";
import type {
  TrialResultLocal,
  TrialResult,
  TrialHighscore,
  TrialResultSmall,
} from "@/types/trial";
import { fromApi } from "@/utils/api";
import { useLocalStorage } from "@vueuse/core";
import { okAsync, type ResultAsync } from "neverthrow";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTrialStore = defineStore("store", () => {
  const apiClient = useApi();
  const results = useLocalStorage<Array<TrialResultSmall>>("results", []);
  const highscores = useLocalStorage<Array<TrialHighscore>>("highscores", []);
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

  function postResult(
    result: TrialResultLocal,
  ): ResultAsync<TrialResult, string> {
    latest.value = result;

    return fromApi(apiClient.trial.results.$post({ json: result }))
      .mapErr((e) => "trial.newResult: " + e.message)
      .andTee((data) => {
        latest.value = data;
        results.value.push(data);
        cacheResults[data.id] = data;
        if (isNewHighscore(data)) {
          syncHighscores();
        }
      });
  }

  function getResult(id: string): ResultAsync<TrialResult, string> {
    if (cacheResults[id]) {
      return okAsync(cacheResults[id]);
    }
    return fromApi(apiClient.trial.results[":id"].$get({ param: { id } }))
      .mapErr((e) => "trial.getResult: " + e.message)
      .andTee((data) => {
        cacheResults[id] = data;
      });
  }

  function syncResults(): ResultAsync<Array<TrialResultSmall>, string> {
    return fromApi(apiClient.trial.results.$get())
      .mapErr((e) => "trial.getResults: " + e.message)
      .andTee((data) => {
        results.value = data;
      });
  }

  function syncHighscores(): ResultAsync<Array<TrialHighscore>, string> {
    return fromApi(apiClient.trial.highscores.$get())
      .mapErr((e) => "trial.syncHighscores: " + e.message)
      .andTee((data) => {
        highscores.value = data;
      });
  }

  function clear(): void {
    results.value = [];
    highscores.value = [];
    latest.value = null;
    cacheResults = {};
  }

  return {
    results,
    highscores,
    latest,

    postResult,
    getResult,
    syncResults,
    syncHighscores,
    clear,
  };
});
