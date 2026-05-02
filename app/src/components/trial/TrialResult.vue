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
        {{ (trialResult.time / 1000).toFixed(2) }}s
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
      <UTooltip
        v-for="answer in validAnswers"
        :key="answer.cca2"
        :delay-duration="100"
        :text="tooltip(answer)"
        :content="{ side: 'bottom' }"
        :ui="{ content: 'h-fit' }"
        :disable-closing-trigger="true"
      >
        <CountrySquare
          :cca2="answer.cca2"
          :percent="
            {
              reaction: ilerp(
                REACTION_LOW,
                REACTION_HIGH,
                answer.reaction_time,
              ),
              typing: ilerp(
                -WPM_HIGH,
                -WPM_LOW,
                -wpm(answer.typing_time, answer.answer.length),
              ),
              total:
                (ilerp(REACTION_LOW, REACTION_HIGH, answer.reaction_time) +
                  ilerp(
                    -WPM_HIGH,
                    -WPM_LOW,
                    -wpm(answer.typing_time, answer.answer.length),
                  )) /
                2,
            }[keyMetric]
          "
        />
        <template #content>
          <span class="text-center font-mono text-sm whitespace-pre">{{
            tooltip(answer)
          }}</span>
        </template>
      </UTooltip>
    </div>
    <div
      class="flex flex-wrap items-center justify-center gap-1"
      v-if="failedAnswers"
    >
      <UTooltip
        v-for="answer in failedAnswers"
        :key="answer.cca2"
        :delay-duration="100"
        :content="{ side: 'bottom' }"
        :ui="{ content: 'h-fit' }"
        :disable-closing-trigger="true"
      >
        <CountrySquare :cca2="answer.cca2" :percent="1" />
        <template #content>
          <span class="text-center font-mono text-sm whitespace-pre">{{
            tooltipFailed(answer)
          }}</span>
        </template>
      </UTooltip>
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
import CountrySquare from "@/components/CountrySquare.vue";
import Spinner from "@/components/Spinner.vue";
import { useAuthStore } from "@/stores/auth";
import { useGeoStore } from "@/stores/geo";
import type { TrialAnswer, TrialResult, TrialResultLocal } from "@/types/trial";
import { wpm } from "@/utils/cpm";
import { ilerp } from "@/utils/lerp";
import UTabs from "@nuxt/ui/components/Tabs.vue";
import UTooltip from "@nuxt/ui/components/Tooltip.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";

type KeyMetric = "total" | "reaction" | "typing";

const WPM_LOW = 30;
const WPM_HIGH = 150;
const REACTION_LOW = 500;
const REACTION_HIGH = 2000;

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

const validAnswers = computed(() => {
  const answers = props.trialResult.answers
    .filter((a) => a.valid)
    .sort((a, b) => {
      switch (keyMetric.value) {
        case "reaction":
          return a.reaction_time - b.reaction_time;
        case "typing":
          return (
            -wpm(a.typing_time, a.answer.length) +
            wpm(b.typing_time, b.answer.length)
          );
        case "total":
          return (
            ilerp(REACTION_LOW, REACTION_HIGH, a.reaction_time) +
            ilerp(-WPM_HIGH, -WPM_LOW, -wpm(a.typing_time, a.answer.length)) -
            (ilerp(REACTION_LOW, REACTION_HIGH, b.reaction_time) +
              ilerp(-WPM_HIGH, -WPM_LOW, -wpm(b.typing_time, b.answer.length)))
          );
      }
    });
  return answers;
});

// const totalTypingTime = computed(() => {
//   return validAnswers.value?.reduce((acc, a) => acc + a.typing_time, 0) || 0;
// });

// const totalReactionTime = computed(() => {
//   return validAnswers.value?.reduce((acc, a) => acc + a.reaction_time, 0) || 0;
// });

// const maxTotalTime = computed(() => {
//   return Math.min(
//     validAnswers.value?.reduce(
//       (acc, a) => Math.max(acc, a.reaction_time + a.typing_time),
//       0,
//     ) || 10000,
//     10000,
//   );
// });

function tooltip(answer: TrialAnswer) {
  var firstLine = "";
  if (props.trialResult.mode === "flags") {
    firstLine = `${geoStore.mapCountry[answer.cca2]?.flag || ""} -> ${answer.answer}`;
  } else {
    firstLine = `${answer.country} -> ${answer.answer}`;
  }
  const reactionPct = ilerp(REACTION_LOW, REACTION_HIGH, answer.reaction_time);
  const typingPct = ilerp(
    -WPM_HIGH,
    -WPM_LOW,
    -wpm(answer.typing_time, answer.answer.length),
  );
  const totalPct = (reactionPct + typingPct) / 2;
  return `${firstLine}
  reaction - ${formatTime(answer.reaction_time)}s | ${Math.round((1 - reactionPct) * 100)}%
  typing - ${wpm(answer.typing_time, answer.answer.length)}wpm | ${Math.round((1 - typingPct) * 100)}%
  total - ${formatTime(answer.reaction_time + answer.typing_time)}s | ${Math.round((1 - totalPct) * 100)}%`;
}

function tooltipFailed(answer: TrialAnswer) {
  var firstLine = "";
  if (props.trialResult.mode === "flags") {
    firstLine = `${geoStore.mapCountry[answer.cca2]?.flag || ""} -> ${answer.answer}`;
  } else {
    firstLine = `${answer.country} -> ${answer.answer}`;
  }
  return `${firstLine}`;
}

function formatTime(time: number) {
  // format ms time into second with 2 decimal
  return (time / 1000).toFixed(2);
}

const failedAnswers = computed(() => {
  return props.trialResult.answers
    .filter((a) => !a.valid)
    .sort((a, b) => a.cca2.localeCompare(b.cca2));
});
</script>
