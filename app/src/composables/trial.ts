import { useGeoStore } from "@/stores/geo";
import { useStatusStore } from "@/stores/status";
import { useTrialStore } from "@/stores/trial";
import type {
  InputAnswer,
  Pair,
  Region,
  Mode,
  TrialAnswer,
  Country,
} from "@/types/trial";
import { err, ok, ResultAsync, type Result } from "neverthrow";
import { computed, ref, type Ref } from "vue";

type TrialStatus = "idle" | "countdown" | "running" | "done";

export interface TrialMetrics {
  correct: number;
  error: number;
  length: number;
}

function newMetrics(): TrialMetrics {
  return {
    correct: 0,
    error: 0,
    length: 0,
  };
}

export interface Trial {
  status: Ref<TrialStatus>;
  countdown: Ref<number | null>;
  pair: Ref<Pair | null>;
  mode: Ref<Mode | null>;
  metrics: Ref<TrialMetrics>;

  start: (mode: Mode, region: Region) => ResultAsync<null, string>;
  reset: () => void;
  answer: (answer: InputAnswer) => Result<boolean, string>;
}

export function useTrial(): Trial {
  const status = ref<TrialStatus>("idle");
  const countdown = ref<number | null>(null);
  const countries = ref<Array<Country> | null>(null);
  const mode = ref<Mode | null>(null);
  const region = ref<Region | null>(null);
  const metrics = ref<TrialMetrics>(newMetrics());

  const indexPair = ref<number | null>(null);
  let startingTime = 0;

  const pair = computed(() => {
    if (countries.value === null || indexPair.value === null) {
      return null;
    }
    const currentCountry = countries.value[indexPair.value];
    if (currentCountry === undefined) {
      return null;
    }

    if (mode.value === "capitals") {
      return {
        prompt: currentCountry.name,
        expected: currentCountry.capital,
      };
    }
    if (mode.value === "flags") {
      return {
        prompt: currentCountry.flag,
        expected: currentCountry.name,
      };
    }
    return null;
  });

  const answers: Array<TrialAnswer> = [];

  function start(md: Mode, rg: Region): ResultAsync<null, string> {
    reset();
    useStatusStore().running = true;
    mode.value = md;
    region.value = rg;
    status.value = "countdown";
    countdown.value = 3;
    metrics.value = newMetrics();
    setCountries(rg);

    return ResultAsync.fromSafePromise(
      (async () => {
        while (countdown.value! > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          countdown.value!--;
        }
      })(),
    ).andThen(() => realStart());
  }

  function realStart(): Result<null, string> {
    if (countries.value === null || countries.value.length === 0) {
      return err("trial.start: no pairs");
    }
    startingTime = new Date().getTime();
    indexPair.value = 0;
    status.value = "running";
    return ok(null);
  }

  function setCountries(rg: Region): Result<null, string> {
    return useGeoStore()
      .getShuffledCountries(rg)
      .mapErr((e) => {
        console.error(e);
        return e;
      })
      .map((cs) => {
        countries.value = cs;
        metrics.value.length = cs.length;
        return null;
      });
  }

  function reset(): void {
    useStatusStore().running = false;
    answers.length = 0;
    status.value = "idle";
    countdown.value = null;
    indexPair.value = null;
    mode.value = null;
    region.value = null;
    countries.value = null;
    startingTime = 0;
    metrics.value = newMetrics();
  }

  // return true if trial is done
  function answer(answer: InputAnswer): Result<boolean, string> {
    if (indexPair.value === null || countries.value === null) {
      return err("trial.answer: no indexPair or pairs");
    }

    const country = countries.value[indexPair.value];
    if (country === undefined) {
      return err("trial.answer: no country");
    }

    if (answer.valid) {
      metrics.value.correct++;
    } else {
      metrics.value.error++;
    }
    indexPair.value++;

    answers.push({
      country: country.name,
      cca2: country.cca2,
      answer: answer.answer,
      valid: answer.valid,
      reactionTime: answer.reactionTime,
      typingTime: answer.typingTime,
    });

    if (indexPair.value === countries.value.length) {
      return done();
    }
    return ok(false);
  }

  function done(): Result<boolean, string> {
    useStatusStore().running = false;
    status.value = "done";
    useTrialStore().newResult({
      region: region.value as Region,
      mode: mode.value as Mode,
      correct: metrics.value.correct,
      length: metrics.value.length,
      answers: answers,
      time: new Date().getTime() - startingTime,
    });
    return ok(true);
  }

  return {
    status,
    countdown,
    pair,
    mode,
    metrics,

    start,
    reset,
    answer,
  };
}
