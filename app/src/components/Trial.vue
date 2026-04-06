<template>
  <TrialResult
    v-if="trial.status.value === 'done' && trialStore.latest"
    :trialResult="trialStore.latest"
  />
  <div
    class="flex min-w-96 flex-col items-center justify-center gap-2 text-white"
    v-else
  >
    <TrialOptions :show="trial.status.value === 'idle'" class="mb-4" />
    <TrialMetrics
      :timer="timer.timer.value"
      :correct="trial.metrics.value.correct"
      :error="trial.metrics.value.error"
      :length="trial.metrics.value.length"
    />
    <div
      class="weight-bold text-2xl text-neutral-300"
      v-if="trial.pair.value && trial.mode.value === 'capitals'"
    >
      {{ trial.pair.value.prompt }}
    </div>
    <div
      class="weight-bold text-8xl text-neutral-300"
      v-else-if="trial.pair.value && trial.mode.value === 'flags'"
    >
      {{ trial.pair.value.prompt }}
    </div>
    <div
      class="weight-bold text-2xl text-neutral-300"
      v-else-if="trial.status.value === 'countdown'"
    >
      {{ trial.countdown.value }}
    </div>
    <div class="weight-bold text-2xl text-neutral-500" v-else>
      press <span class="text-neutral-300 underline">tab</span> to start
    </div>
    <GameInput
      ref="refInput"
      class="mb-16 w-full"
      :expected="trial.pair.value?.expected || ''"
      @answer="onAnswer"
    />
  </div>
</template>

<script setup lang="ts">
import GameInput from "@/components/GameInput.vue";
import TrialMetrics from "@/components/TrialMetrics.vue";
import TrialOptions from "@/components/TrialOptions.vue";
import TrialResult from "@/components/trial/TrialResult.vue";
import { useTimer } from "@/composables/timer";
import { useTrial } from "@/composables/trial";
import { useGeoStore } from "@/stores/geo";
import { useTrialStore } from "@/stores/trial";
import type { InputAnswer } from "@/types/trial";
import { onMounted, onUnmounted } from "vue";

const geo = useGeoStore();

const timer = useTimer();
const trial = useTrial();
const trialStore = useTrialStore();

onMounted(async () => {
  geo.sync();
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
  const result = await trial.start(trialStore.mode, trialStore.region);
  if (result.isOk()) {
    timer.start();
  }
}

function reset() {
  timer.reset();
  trial.reset();
}

function onAnswer(answer: InputAnswer) {
  trial.answer(answer);
}
</script>
