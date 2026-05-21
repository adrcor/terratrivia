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
          <span>({{ stats.count }}) {{ countryScore(stats) }}%</span>
        </div>
        <div class="flex flex-row gap-4">
          <div
            class="flex flex-1 flex-col rounded-sm px-2 py-0.5 text-sm"
            :style="{
              backgroundColor: getColor(reactionDisplay.score),
            }"
          >
            <div>reaction</div>
            <div class="flex flex-row justify-between gap-4">
              <span>{{ reactionDisplay.value }}</span>
              <span>{{ reactionDisplay.score }}%</span>
            </div>
          </div>
          <div
            class="flex flex-1 flex-col rounded-sm px-2 py-0.5 text-sm"
            :style="{
              backgroundColor: getColor(typingDisplay.score),
            }"
          >
            <div>typing</div>
            <div class="flex flex-row justify-between gap-4">
              <span>{{ typingDisplay.value }}</span>
              <span>{{ typingDisplay.score }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
import { VALID_THRESHOLD } from "@/stores/constants";
import type { Country } from "@/types/common";
import type { CountryStats } from "@/types/practice";
import { countryScore, reactionScore, wpmScore } from "@/utils/score";
import { formatSeconds } from "@/utils/time";
import UTooltip from "@nuxt/ui/components/Tooltip.vue";
import { computed } from "vue";

const props = defineProps<{
  country: Country;
  stats: CountryStats;
  discovered: boolean;
}>();

function getColor(value: number) {
  if (value == 100) {
    return "var(--color-primary-600)";
  }
  if (value == 0) {
    return "var(--color-neutral-600)";
  }
  if (value < VALID_THRESHOLD) {
    const pct = (value / VALID_THRESHOLD) * 100;
    return `color-mix(in oklch, var(--color-emerald-700) ${Math.max(20, pct)}%, transparent)`;
  }
  const pct = Math.floor(
    ((value - VALID_THRESHOLD) / (100 - VALID_THRESHOLD)) * 100,
  );
  return `color-mix(in oklch, var(--color-primary-800) ${100 - pct}%, var(--color-primary-700) ${pct}%)`;
}

const color = computed(() => {
  if (!props.discovered) {
    return "var(--color-neutral-800)";
  }
  return getColor(countryScore(props.stats));
});

interface DisplayScore {
  value: string;
  score: number;
}

const reactionDisplay = computed<DisplayScore>(() => {
  if (props.stats.count == 0) {
    return {
      value: "0s",
      score: 0,
    };
  }
  return {
    value: `${formatSeconds(props.stats.reaction_time)}s`,
    score: Math.floor(reactionScore(props.stats.reaction_time) * 100),
  };
});

const typingDisplay = computed<DisplayScore>(() => {
  if (props.stats.count == 0) {
    return {
      value: "0wpm",
      score: 0,
    };
  }
  return {
    value: `${props.stats.wpm}wpm`,
    score: Math.floor(wpmScore(props.stats.wpm) * 100),
  };
});
</script>
