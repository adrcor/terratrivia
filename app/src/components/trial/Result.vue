<template>
  <div
    v-if="trialResult"
    class="flex w-full flex-col items-center justify-center gap-2 text-white"
  >
    <div class="weight-bold text-2xl text-neutral-500">
      {{ trialResult.mode }} - {{ trialResult.region }}
    </div>
    <div class="flex flex-row items-center justify-between gap-4">
      <div class="weight-bold text-2xl text-neutral-500">
        {{ trialResult.correct }}/{{ trialResult.length }} -
      </div>
      <div class="weight-bold text-2xl text-neutral-500">
        {{ Math.floor((trialResult.correct / trialResult.length) * 100) }}% -
      </div>
      <div class="weight-bold text-2xl text-neutral-500">
        {{ formatSeconds(trialResult.time) }}s
      </div>
    </div>
    <div class="mt-8 flex flex-row items-center">
      <UTooltip
        text="metric"
        :kbds="['m']"
        :delay-duration="200"
        :content="{ side: 'right' }"
        :ui="{
          content: 'text-sm bg-neutral-950 outline-1 outline-neutral-700',
          kbdsSize: 'md',
        }"
      >
        <UTabs
          :items="metricItems"
          v-model="keyMetric as KeyMetric"
          :content="false"
          color="neutral"
        />
      </UTooltip>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-1">
      <CountrySquare
        v-for="sq in validSquares"
        :key="sq.cca2"
        v-bind="sq"
        :box-color="trialScoreColor"
      />
    </div>
    <div
      class="flex flex-wrap items-center justify-center gap-1"
      v-if="failedSquares.length"
    >
      <CountrySquare
        v-for="sq in failedSquares"
        :key="sq.cca2"
        v-bind="sq"
        :box-color="trialScoreColor"
      />
    </div>
    <div v-if="!auth.isAuthenticated">
      <p class="mt-4 text-center text-neutral-500">
        login to save your results
      </p>
    </div>
  </div>
  <Spinner v-else />
</template>

<script setup lang="ts">
import Spinner from "@/components/Spinner.vue";
import CountrySquare from "@/components/game/CountrySquare.vue";
import { useAuthStore } from "@/stores/auth";
import { useGeoStore } from "@/stores/geo";
import type { TrialAnswer, TrialResult, TrialResultLocal } from "@/types/trial";
import { trialScoreColor } from "@/utils/color";
import { wpm } from "@/utils/cpm";
import { reactionScore, totalScore, typingScore } from "@/utils/score";
import { formatSeconds } from "@/utils/time";
import UTabs from "@nuxt/ui/components/Tabs.vue";
import UTooltip from "@nuxt/ui/components/Tooltip.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";

type KeyMetric = "total" | "reaction" | "typing";

const geoStore = useGeoStore();
const auth = useAuthStore();

const props = defineProps<{
  trialResult: TrialResult | TrialResultLocal;
}>();

const metricItems = [
  { label: "total", value: "total" },
  { label: "reaction", value: "reaction" },
  { label: "typing", value: "typing" },
];

const keyMetric = ref<KeyMetric>("total");

onMounted(() => {
  window.addEventListener("keydown", eventListener);
});

onUnmounted(() => {
  window.removeEventListener("keydown", eventListener);
});

function eventListener(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return;
  }
  if (event.key == "m") {
    nextMetric();
  }
}

function nextMetric() {
  const index = metricItems.map((m) => m.value).indexOf(keyMetric.value);
  keyMetric.value = metricItems[(index + 1) % metricItems.length]!
    .value as KeyMetric;
}

function answerScore(answer: TrialAnswer, metric: KeyMetric): number {
  switch (metric) {
    case "reaction":
      return reactionScore(answer.reaction_time);
    case "typing":
      return typingScore(answer.typing_time, answer.answer.length);
    case "total":
      return totalScore(
        answer.reaction_time,
        answer.typing_time,
        answer.answer.length,
      );
  }
}

function headerFor(answer: TrialAnswer): string {
  if (props.trialResult.mode === "flags") {
    return `${geoStore.mapCountry[answer.cca2]?.flag || ""} -> ${answer.answer}`;
  }
  return `${answer.country} -> ${answer.answer}`;
}

function validMetrics(answer: TrialAnswer) {
  return [
    {
      label: "reaction",
      value: `${formatSeconds(answer.reaction_time)}s`,
      score: Math.floor(reactionScore(answer.reaction_time) * 100),
    },
    {
      label: "typing",
      value: `${wpm(answer.typing_time, answer.answer.length)}wpm`,
      score: Math.floor(
        typingScore(answer.typing_time, answer.answer.length) * 100,
      ),
    },
    {
      label: "total",
      value: `${formatSeconds(answer.reaction_time + answer.typing_time)}s`,
      score: Math.floor(
        totalScore(
          answer.reaction_time,
          answer.typing_time,
          answer.answer.length,
        ) * 100,
      ),
    },
  ];
}

const validSquares = computed(() =>
  props.trialResult.answers
    .filter((a) => a.valid)
    .sort(
      (a, b) =>
        answerScore(b, keyMetric.value) - answerScore(a, keyMetric.value),
    )
    .map((answer) => ({
      cca2: answer.cca2,
      tileColor: trialScoreColor(
        Math.floor(answerScore(answer, keyMetric.value) * 100),
      ),
      header: headerFor(answer),
      metrics: validMetrics(answer),
    })),
);

const failedSquares = computed(() =>
  props.trialResult.answers
    .filter((a) => !a.valid)
    .sort((a, b) => a.cca2.localeCompare(b.cca2))
    .map((answer) => ({
      cca2: answer.cca2,
      tileColor: trialScoreColor(0),
      header: headerFor(answer),
      metrics: [],
    })),
);
</script>
