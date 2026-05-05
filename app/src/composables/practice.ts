import { usePairCursor } from "./pair-cursor";
import { usePracticeStore } from "@/stores/practice";
import { useSettingsStore } from "@/stores/settings";
import { useStatusStore } from "@/stores/status";
import type { Country, InputAnswer, Pair } from "@/types/common";
import type { PracticeAnswer, PracticeUnit } from "@/types/practice";
import { err, errAsync, ok, Result, ResultAsync } from "neverthrow";
import { computed, ref, type Ref } from "vue";

export type PracticeStatus = "idle" | "countdown" | "running";

export interface Practice {
  unit: Ref<PracticeUnit>;
  status: Ref<PracticeStatus>;
  countdown: Ref<number | null>;
  pair: Ref<Pair | null>;
  country: Ref<Country | null>;

  start: () => ResultAsync<null, string>;
  reset: () => void;
  answer: (answer: InputAnswer) => Result<boolean, string>;
}

export function usePractice(): Practice {
  const countdown = ref<number | null>(null);
  const status = ref<PracticeStatus>("idle");

  const pairCursor = usePairCursor();
  const practiceStore = usePracticeStore();

  const settings = useSettingsStore();
  const statusStore = useStatusStore();

  const unit = computed(() =>
    practiceStore.get(settings.mode, settings.region),
  );
  const answers = ref<Array<PracticeAnswer>>([]);

  function start(): ResultAsync<null, string> {
    reset();
    statusStore.running = true;
    status.value = "countdown";
    countdown.value = 3;

    const countries = practiceStore.getShuffledCountries(
      settings.mode,
      settings.region,
    );

    const result = pairCursor.set(countries, settings.mode);
    if (result.isErr()) {
      return errAsync(result.error);
    }

    return ResultAsync.fromSafePromise(
      (async () => {
        while (status.value == "countdown" && countdown.value! > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          countdown.value!--;
        }
      })(),
    ).andThen(() => {
      if (status.value == "countdown") {
        return realStart();
      } else {
        return ok(null);
      }
    });
  }

  function realStart(): Result<null, string> {
    const result = pairCursor.start();
    if (result.isErr()) {
      return err(result.error);
    }
    status.value = "running";
    return ok(null);
  }

  function reset(): void {
    status.value = "idle";
    countdown.value = null;
    pairCursor.reset();
  }

  function answer(answer: InputAnswer): Result<boolean, string> {
    if (pairCursor.country.value === null || pairCursor.pair.value === null) {
      return err("practice.answer: no country");
    }

    answers.value.push({
      cca2: pairCursor.country.value.cca2,
      reaction_time: answer.reaction_time,
      typing_time: answer.typing_time,
      valid: answer.valid,
    });

    return pairCursor.next().andTee((isDone) => {
      if (isDone) {
        done();
      }
    });
  }

  function done(): Result<boolean, string> {
    practiceStore.pushAnswers(settings.mode, settings.region, answers.value);
    answers.value.length = 0;
    statusStore.running = false;
    status.value = "idle";
    return ok(true);
  }

  return {
    unit,
    status,
    countdown,
    country: pairCursor.country,
    pair: pairCursor.pair,

    start,
    reset,
    answer,
  };
}
