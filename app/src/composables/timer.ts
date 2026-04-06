import { ref, type Ref } from "vue";

export interface Timer {
  timer: Ref<number>;
  start: () => void;
  reset: () => void;
}

export function useTimer(): Timer {
  const timer = ref(0);
  const timerInterval = ref<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  function start() {
    clearInterval(timerInterval.value);
    timer.value = 0;
    timerInterval.value = setInterval(() => {
      timer.value++;
    }, 1000);
  }

  function reset() {
    timer.value = 0;
    clearInterval(timerInterval.value);
    timerInterval.value = undefined;
  }

  return {
    timer,
    start,
    reset,
  };
}
