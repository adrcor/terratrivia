<template>
  <FadeTransition>
    <div
      v-if="practice.status.value === 'idle'"
      key="idle"
      class="flex min-w-96 flex-col items-center justify-center gap-4"
    >
      <Options :show="true" />
      <Metrics :practice="practice" />
      <Grid :unit="practice.unit.value" />
      <div class="weight-bold text-2xl text-neutral-500">
        press <span class="text-neutral-300 underline">tab</span> to start
      </div>
    </div>
    <div
      v-else
      key="active"
      class="flex min-w-96 flex-col items-center justify-center gap-2"
    >
      <Prompt
        :status="practice.status.value"
        :countdown="practice.countdown.value"
        :pair="practice.pair.value"
        :mode="practice.mode.value"
      />
      <GameInput
        :expected="practice.pair.value?.expected || ''"
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
import Grid from "@/components/practice/Grid.vue";
import Metrics from "@/components/practice/Metrics.vue";
import { useKeydown } from "@/composables/keydown";
import { usePractice } from "@/composables/practice";
import type { InputAnswer } from "@/types/common";

const practice = usePractice();

useKeydown({
  Tab: { handler: start, preventDefault: true, stopPropagation: true },
  Escape: reset,
});

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
