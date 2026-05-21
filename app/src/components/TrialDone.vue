<template>
  <div
    class="flex min-w-96 flex-col items-center justify-center gap-2 text-white outline-1"
  >
    <div
      class="flex flex-row items-center justify-between gap-4"
      v-if="trial.latest"
    >
      <div class="weight-bold text-2xl text-neutral-500">
        {{ Math.floor((trial.latest.correct / trial.latest.length) * 100) }}%
      </div>
      <div class="weight-bold text-2xl text-neutral-500">
        {{ (trial.latest.time / 1000).toFixed(2) }}s
      </div>
    </div>
    <div class="flex flex-row items-center justify-between gap-16 text-xl">
      <div class="flex flex-col gap-2">
        <div class="text-center text-neutral-500">reaction time</div>
        <div v-for="entry in reactionTable.slice(0, 3)" :key="entry.prompt">
          {{ entry.prompt }} -> {{ entry.expected }} :
          {{ (entry.value / 1000).toFixed(2) }}s
        </div>
        <div class="flex flex-row flex-wrap">
          <CountrySquare
            :cca2="entry.cca2"
            :percent="0.8"
            v-for="entry in reactionTable.slice(3, -3)"
            :key="entry.prompt"
          />
        </div>
        <div v-for="entry in reactionTable.slice(-3)" :key="entry.prompt">
          {{ entry.prompt }} -> {{ entry.expected }} :
          {{ (entry.value / 1000).toFixed(2) }}s
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div class="text-center text-neutral-500">cpm</div>
        <div v-for="entry in cpmTable.slice(0, 3)" :key="entry.prompt">
          {{ entry.prompt }} -> {{ entry.expected }} : {{ entry.value }}wpm
        </div>
        <div class="text-center text-neutral-500">...</div>
        <div v-for="entry in cpmTable.slice(-3)" :key="entry.prompt">
          {{ entry.prompt }} -> {{ entry.expected }} : {{ entry.value }}wpm
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CountrySquare from "@/components/CountrySquare.vue";
import { useTrialStore } from "@/stores/trial";
import { computed } from "vue";

const trial = useTrialStore();

interface TableEntry {
  prompt: string;
  expected: string;
  value: number;
  cca2: string;
}

const reactionTable = computed<TableEntry[]>(() => {
  if (trial.latest && "answers" in trial.latest) {
    return trial.latest.answers
      .map((answer) => ({
        prompt: answer.country,
        expected: answer.answer,
        value: answer.reaction_time,
        cca2: answer.cca2,
      }))
      .sort((a, b) => a.value - b.value);
  }
  return [];
});

const cpmTable = computed<TableEntry[]>(() => {
  if (trial.latest && "answers" in trial.latest) {
    return trial.latest.answers
      .map((answer) => ({
        prompt: answer.country,
        expected: answer.answer,
        value: Math.floor(
          ((60000 / answer.typing_time) * answer.answer.length) / 5,
        ),
        cca2: answer.cca2,
      }))
      .sort((a, b) => b.value - a.value);
  }
  return [];
});
</script>
