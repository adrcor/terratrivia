import { useApi } from "@/composables/api";
import type {
  TrialResultLocal,
  TrialResult,
  Region,
  Mode,
  TrialHighscore,
} from "@/types/trial";
import { regions } from "@/types/trial";
import { fromApi } from "@/utils/api";
import { useLocalStorage } from "@vueuse/core";
import { type ResultAsync } from "neverthrow";
import { defineStore } from "pinia";
import { ref } from "vue";

const apiClient = useApi();

export const useTrialStore = defineStore("store", () => {
  const highscores = useLocalStorage<Array<TrialHighscore>>("highscores", []);
  const latest = ref<TrialResult | TrialResultLocal | null>(null);

  const mode = useLocalStorage<Mode>("mode", "capitals");
  const region = useLocalStorage<Region>("region", "am");
  if (!regions.includes(region.value)) {
    region.value = "am";
  }

  function newResult(
    result: TrialResultLocal,
  ): ResultAsync<TrialResult, string> {
    latest.value = result;

    return fromApi(apiClient.trial.results.$post({ json: result }))
      .mapErr((e) => "trial.newResult: " + e.message)
      .map((data) => {
        const apiResult = data;
        latest.value = apiResult;

        const current = highscores.value.find(
          (h) => h.region === apiResult.region && h.mode === apiResult.mode,
        );
        const isNew =
          !current ||
          current.correct < apiResult.correct ||
          (current.correct === apiResult.correct &&
            current.time > apiResult.time);

        if (isNew) {
          syncHighscores();
        }

        return apiResult;
      });
  }

  function getResult(id: string): ResultAsync<TrialResult, string> {
    return fromApi(
      apiClient.trial.results[":id"].$get({ param: { id } }),
    ).mapErr((e) => "trial.getResult: " + e.message);
  }

  function syncHighscores(): ResultAsync<Array<TrialHighscore>, string> {
    return fromApi(apiClient.trial.highscores.$get()).mapErr(
      (e) => "trial.syncHighscores: " + e.message,
    );
  }

  return {
    highscores,
    latest,
    mode,
    region,

    newResult,
    getResult,
    syncHighscores,
  };
});
