<template>
  <div
    v-if="practice.status.value === 'idle'"
    class="flex min-w-96 flex-col items-center justify-center gap-2"
  >
    <TrialOptions class="mb-4" :show="true" />
    <State :unit="practice.state.value" />
  </div>
  <div v-else class="flex min-w-96 flex-col items-center justify-center gap-2">
    <Prompt :practice="practice" />
    <GameInput
      :expected="practice.pair.value?.expected || ''"
      @answer="onAnswer"
    />
  </div>
</template>

<script setup lang="ts">
import GameInput from "@/components/GameInput.vue";
import TrialOptions from "@/components/TrialOptions.vue";
import Prompt from "@/components/practice/Prompt.vue";
import State from "@/components/practice/State.vue";
import { usePractice } from "@/composables/practice";
import type { InputAnswer } from "@/types/common";
import { onMounted, onUnmounted } from "vue";

const practice = usePractice();

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
  if (practice.status.value == "countdown") {
    return;
  }
  const result = await practice.start();
  if (result.isErr()) {
    console.error(result.error);
  }
}

function reset() {
  practice.reset();
}

function onAnswer(answer: InputAnswer) {
  const result = practice.answer(answer);
  if (result.isErr()) {
    console.error(result.error);
  } else if (result.value) {
    reset();
  }
}
</script>
