<template>
  <div
    class="flex min-w-96 flex-col items-center justify-center gap-2 text-white"
  >
    <TrialOptions :show="practice.status.value === 'idle'" class="mb-4" />
    <State :unit="practice.state.value" />
    <Prompt :practice="practice" />
    <GameInput
      :expected="practice.pair.value?.expected || ''"
      @answer="onAnswer"
    />
  </div>
</template>

<script setup lang="ts">
import GameInput from "@/components/GameInput.vue";
import Prompt from "@/components/practice/Prompt.vue";
import State from "@/components/practice/State.vue";
import TrialOptions from "@/components/TrialOptions.vue";
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
  practice.answer(answer);
}
</script>
