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
    // set latest to local value until we get the api result
    latest.value = result;

    const body = {
      region: result.region,
      mode: result.mode,
      length: result.length,
      correct: result.correct,
      time: result.time,
      answers: result.answers.map((a) => ({
        country: a.country,
        cca2: a.cca2,
        answer: a.answer,
        valid: a.valid,
        reaction_time: a.reactionTime,
        typing_time: a.typingTime,
      })),
    };

    return fromApi(apiClient.trial.results.$post({ json: body } as never))
      .mapErr((e) => "trial.newResult: " + e.message)
      .map((data) => {
        const apiResult = toTrialResult(data as Record<string, unknown>);
        latest.value = apiResult;

        const current = highscores.value.find(
          (h) => h.region === apiResult.region && h.mode === apiResult.mode,
        );
        const isNew =
          !current ||
          current.correct < apiResult.correct ||
          (current.correct === apiResult.correct &&
            current.time > apiResult.time);

        console.log("new highscore", isNew);
        if (isNew) {
          syncHighscores();
        }

        return apiResult;
      });
  }

  function getResult(id: string): ResultAsync<TrialResult, string> {
    return fromApi(apiClient.trial.results[":id"].$get({ param: { id } }))
      .mapErr((e) => "trial.getResult: " + e.message)
      .map((data) => toTrialResult(data as Record<string, unknown>));
  }

  function syncHighscores(): ResultAsync<Array<TrialHighscore>, string> {
    return fromApi(apiClient.trial.highscores.$get())
      .mapErr((e) => "trial.syncHighscores: " + e.message)
      .map((data) => {
        highscores.value = (data as Array<Record<string, unknown>>).map(
          toTrialHighscore,
        );
        return highscores.value;
      });
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

// Server returns snake_case, convert to camelCase for app types
function toTrialResult(data: Record<string, unknown>): TrialResult {
  const answers = (data.answers as Array<Record<string, unknown>>) ?? [];
  return {
    id: data.id as string,
    region: data.region as Region,
    mode: data.mode as Mode,
    correct: data.correct as number,
    length: data.length as number,
    time: data.time as number,
    created: new Date(data.created as string),
    answers: answers.map((a) => ({
      country: a.country as string,
      cca2: a.cca2 as string,
      answer: a.answer as string,
      valid: a.valid as boolean,
      reactionTime: a.reaction_time as number,
      typingTime: a.typing_time as number,
    })),
  };
}

function toTrialHighscore(data: Record<string, unknown>): TrialHighscore {
  return {
    idUser: data.id_user as string,
    region: data.region as Region,
    mode: data.mode as Mode,
    idResult: data.id_result as string,
    correct: data.correct as number,
    length: data.length as number,
    time: data.time as number,
  };
}
