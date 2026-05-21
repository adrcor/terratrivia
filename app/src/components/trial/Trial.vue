<template>
  <FadeTransition>
    <Result
      v-if="trial.status.value === 'done' && trialStore.latest"
      :trialResult="trialStore.latest"
    />
    <div
      v-else
      class="flex min-w-96 flex-col items-center justify-center gap-2 text-white"
    >
      <Options :show="trial.status.value === 'idle'" class="mb-4" />
      <Metrics
        :timer="timer.timer.value"
        :correct="trial.metrics.value.correct"
        :error="trial.metrics.value.error"
        :length="trial.metrics.value.length"
      />
      <Prompt
        :status="trial.status.value"
        :countdown="trial.countdown.value"
        :pair="trial.pair.value"
        :mode="trial.mode.value"
      />
      <GameInput
        class="mb-16 w-full"
        :expected="trial.pair.value?.expected || ''"
        @answer="onAnswer"
      />
    </div>
  </FadeTransition>
</template>

<script setup lang="ts">
import FadeTransition from "@/components/FadeTransition.vue";
import GameInput from "@/components/game/GameInput.vue";
import Options from "@/components/game/Options.vue";
import Prompt from "@/components/game/Prompt.vue";
import Metrics from "@/components/trial/Metrics.vue";
import Result from "@/components/trial/Result.vue";
import { useTimer } from "@/composables/timer";
import { useTrial } from "@/composables/trial";
import { useSettingsStore } from "@/stores/settings";
import { useTrialStore } from "@/stores/trial";
import type { InputAnswer } from "@/types/common";
import { onMounted, onUnmounted } from "vue";

const timer = useTimer();
const trial = useTrial();
const trialStore = useTrialStore();
const settings = useSettingsStore();

onMounted(async () => {
  window.addEventListener("keydown", eventListener);
});

onUnmounted(() => {
  window.removeEventListener("keydown", eventListener);
});

function eventListener(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return;
  }
  if (event.key == "Tab") {
    event.preventDefault();
    event.stopPropagation();
    start();
  } else if (event.key == "Escape") {
    reset();
  }
}

async function start() {
  if (trial.status.value == "countdown") {
    return;
  }
  reset();
  await trial.start(settings.mode, settings.region);
  if (trial.status.value === "running") {
    timer.start();
  }
}

function reset() {
  timer.reset();
  trial.reset();
}

function onAnswer(answer: InputAnswer) {
  const result = trial.answer(answer);
  if (result.isErr()) {
    console.error(result.error);
  }
}
</script>
