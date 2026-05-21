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
        v-for="answer in validAnswers"
        :key="answer.cca2"
        :cca2="answer.cca2"
        :score="answerScore(answer, keyMetric)"
      >
        <span class="text-center font-mono text-sm whitespace-pre">{{
          tooltip(answer)
        }}</span>
      </CountrySquare>
    </div>
    <div
      class="flex flex-wrap items-center justify-center gap-1"
      v-if="failedAnswers"
    >
      <CountrySquare
        v-for="answer in failedAnswers"
        :key="answer.cca2"
        :cca2="answer.cca2"
        :score="0"
      >
        <span class="text-center font-mono text-sm whitespace-pre">{{
          tooltipFailed(answer)
        }}</span>
      </CountrySquare>
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
import CountrySquare from "@/components/trial/CountrySquare.vue";
import Spinner from "@/components/Spinner.vue";
import { useAuthStore } from "@/stores/auth";
import { useGeoStore } from "@/stores/geo";
import type { TrialAnswer, TrialResult, TrialResultLocal } from "@/types/trial";
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

const validAnswers = computed(() => {
  return props.trialResult.answers
    .filter((a) => a.valid)
    .sort(
      (a, b) => answerScore(b, keyMetric.value) - answerScore(a, keyMetric.value),
    );
});

function tooltip(answer: TrialAnswer) {
  const firstLine =
    props.trialResult.mode === "flags"
      ? `${geoStore.mapCountry[answer.cca2]?.flag || ""} -> ${answer.answer}`
      : `${answer.country} -> ${answer.answer}`;
  const reaction = reactionScore(answer.reaction_time);
  const typing = typingScore(answer.typing_time, answer.answer.length);
  const total = (reaction + typing) / 2;
  return `${firstLine}
  reaction - ${formatSeconds(answer.reaction_time)}s | ${Math.floor(reaction * 100)}%
  typing - ${wpm(answer.typing_time, answer.answer.length)}wpm | ${Math.floor(typing * 100)}%
  total - ${formatSeconds(answer.reaction_time + answer.typing_time)}s | ${Math.floor(total * 100)}%`;
}

function tooltipFailed(answer: TrialAnswer) {
  if (props.trialResult.mode === "flags") {
    return `${geoStore.mapCountry[answer.cca2]?.flag || ""} -> ${answer.answer}`;
  }
  return `${answer.country} -> ${answer.answer}`;
}

const failedAnswers = computed(() => {
  return props.trialResult.answers
    .filter((a) => !a.valid)
    .sort((a, b) => a.cca2.localeCompare(b.cca2));
});
</script>
