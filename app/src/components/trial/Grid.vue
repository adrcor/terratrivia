<template>
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
</template>

<script setup lang="ts">
import CountrySquare from "@/components/game/CountrySquare.vue";
import { useScores } from "@/composables/score";
import { useGeoStore } from "@/stores/geo";
import type {
  KeyMetric,
  TrialAnswer,
  TrialResult,
  TrialResultLocal,
} from "@/types/trial";
import { trialScoreColor } from "@/utils/color";
import { wpm } from "@/utils/cpm";
import { formatSeconds } from "@/utils/time";
import { computed } from "vue";

const geoStore = useGeoStore();
const { reactionScore, totalScore, typingScore } = useScores();

const props = defineProps<{
  trialResult: TrialResult | TrialResultLocal;
  keyMetric: KeyMetric;
}>();

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
        answerScore(b, props.keyMetric) - answerScore(a, props.keyMetric),
    )
    .map((answer) => ({
      cca2: answer.cca2,
      tileColor: trialScoreColor(
        Math.floor(answerScore(answer, props.keyMetric) * 100),
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
