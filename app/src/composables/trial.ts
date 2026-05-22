import { usePairCursor } from "./pair-cursor";
import { useGeoStore } from "@/stores/geo";
import { useStatusStore } from "@/stores/status";
import { useTrialStore } from "@/stores/trial";
import type { InputAnswer, Pair, Region, Mode } from "@/types/common";
import type { TrialAnswer } from "@/types/trial";
import { err, ok, ResultAsync, type Result } from "neverthrow";
import { ref, type Ref } from "vue";

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
  const mode = ref<Mode | null>(null);
  const region = ref<Region | null>(null);
  const metrics = ref<TrialMetrics>(newMetrics());

  const pairCursor = usePairCursor();
  let startingTime = 0;

  const answers: Array<TrialAnswer> = [];

  function start(md: Mode, rg: Region): ResultAsync<null, string> {
    reset();
    useStatusStore().running = true;
    mode.value = md;
    region.value = rg;
    status.value = "countdown";
    countdown.value = 3;
    metrics.value = newMetrics();

    return setCountries(md, rg)
      .asyncAndThen(() =>
        ResultAsync.fromSafePromise(
          (async () => {
            while (status.value === "countdown" && countdown.value! > 0) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              countdown.value!--;
            }
          })(),
        ),
      )
      .andThen(() => {
        if (status.value === "countdown") {
          return realStart();
        }
        return ok(null);
      });
  }

  function setCountries(md: Mode, rg: Region): Result<null, string> {
    return useGeoStore()
      .getShuffledCountries(rg)
      .mapErr((e) => {
        console.error(e);
        return e;
      })
      .andThen((cs) => {
        metrics.value.length = cs.length;
        return pairCursor.set(cs, md);
      });
  }

  function realStart(): Result<null, string> {
    return pairCursor.start().map(() => {
      startingTime = new Date().getTime();
      status.value = "running";
      return null;
    });
  }

  function reset(): void {
    useStatusStore().running = false;
    answers.length = 0;
    status.value = "idle";
    countdown.value = null;
    mode.value = null;
    region.value = null;
    pairCursor.reset();
    startingTime = 0;
    metrics.value = newMetrics();
  }

  function answer(answer: InputAnswer): Result<boolean, string> {
    if (pairCursor.country.value === null) {
      return err("trial.answer: no country");
    }
    const country = pairCursor.country.value;

    if (answer.valid) {
      metrics.value.correct++;
    } else {
      metrics.value.error++;
    }

    answers.push({
      country: country.name,
      cca2: country.cca2,
      answer: answer.answer,
      valid: answer.valid,
      reaction_time: answer.reaction_time,
      typing_time: answer.typing_time,
    });

    return pairCursor.next().andTee((isDone) => {
      if (isDone) {
        done();
      }
    });
  }

  function done(): void {
    useStatusStore().running = false;
    status.value = "done";
    useTrialStore().postResult({
      region: region.value as Region,
      mode: mode.value as Mode,
      correct: metrics.value.correct,
      length: metrics.value.length,
      answers: answers,
      time: new Date().getTime() - startingTime,
      created: new Date().toISOString(),
    });
  }

  return {
    status,
    countdown,
    pair: pairCursor.pair,
    mode,
    metrics,

    start,
    reset,
    answer,
  };
}
