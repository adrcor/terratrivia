<template>
  <UTooltip
    :delay-duration="100"
    :content="{ side: 'bottom' }"
    :ui="{ content: 'h-fit' }"
    :disable-closing-trigger="true"
  >
    <div
      class="relative m-1 flex size-8 flex-col items-center justify-center rounded-xs select-none"
      :style="{ backgroundColor: color }"
    >
      {{ props.country.cca2.toLowerCase() }}
    </div>
    <template #content>
      <div
        class="flex flex-col gap-2 self-center text-center font-mono text-sm"
      >
        <div class="flex w-full flex-row justify-around gap-4 px-2">
          <span>{{ country.name }}</span>
          <span>({{ score.count }}) {{ scoreTotal(score) }}%</span>
        </div>
        <div class="flex flex-row gap-4">
          <div
            class="flex flex-1 flex-col rounded-sm px-2 py-0.5 text-sm"
            :style="{
              backgroundColor: getColor(reactionScore.score),
            }"
          >
            <div>reaction</div>
            <div class="flex flex-row justify-between gap-4">
              <span>{{ reactionScore.value }}</span>
              <span>{{ reactionScore.score }}%</span>
            </div>
          </div>
          <div
            class="flex flex-1 flex-col rounded-sm px-2 py-0.5 text-sm"
            :style="{
              backgroundColor: getColor(typingScore.score),
            }"
          >
            <div>typing</div>
            <div class="flex flex-row justify-between gap-4">
              <span>{{ typingScore.value }}</span>
              <span>{{ typingScore.score }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
import type { Country } from "@/types/common";
import type { CountryScore } from "@/types/practice";
import { wpm } from "@/utils/cpm";
import { ilerpReactionTime, ilerpWpm, scoreTotal } from "@/utils/score";
import UTooltip from "@nuxt/ui/components/Tooltip.vue";
import { computed } from "vue";

const props = defineProps<{
  country: Country;
  score: CountryScore;
  discovered: boolean;
}>();

function getColor(score: number) {
  if (score == 100) {
    return "var(--color-primary-600)";
  }
  if (score == 0) {
    return "var(--color-neutral-600)";
  }
  if (score < 80) {
    const pct = (score / 80) * 100;
    return `color-mix(in oklch, var(--color-emerald-700) ${Math.max(20, pct)}%, transparent)`;
  }
  const pct = Math.floor((score - 80) * 5);
  return `color-mix(in oklch, var(--color-primary-800) ${100 - pct}%, var(--color-primary-700) ${pct}%)`;
}

const color = computed(() => {
  if (!props.discovered) {
    return "var(--color-neutral-800)";
  }
  return getColor(scoreTotal(props.score));
});

interface DisplayScore {
  value: string;
  score: number;
}

const reactionScore = computed<DisplayScore>(() => {
  if (props.score.count == 0) {
    return {
      value: "0s",
      score: 0,
    };
  }
  return {
    value: formatTime(props.score.reaction_time),
    score: Math.floor(ilerpReactionTime(props.score.reaction_time) * 100),
  };
});

const typingScore = computed<DisplayScore>(() => {
  if (props.score.count == 0) {
    return {
      value: "0wpm",
      score: 0,
    };
  }
  return {
    value: `${wpm(props.score.typing_time, props.score.answer.length)}wpm`,
    score: Math.floor(
      ilerpWpm(wpm(props.score.typing_time, props.score.answer.length)) * 100,
    ),
  };
});

function formatTime(time: number) {
  // format ms time into second with 2 decimal
  return `${(time / 1000).toFixed(2)}s`;
}
</script>
