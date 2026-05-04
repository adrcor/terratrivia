<template>
  <UTooltip
    :delay-duration="100"
    :content="{ side: 'bottom' }"
    :ui="{ content: 'h-fit' }"
    :disable-closing-trigger="true"
  >
    <div
      class="m-1 flex size-8 flex-col items-center justify-center rounded-xs select-none"
      :style="{ backgroundColor: color }"
    >
      {{ props.country.cca2.toLowerCase() }}
    </div>
    <template #content>
      <span class="text-center font-mono text-sm whitespace-pre">{{
        tooltip
      }}</span>
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

const color = computed(() => {
  if (!props.discovered) {
    return "var(--color-neutral-800)";
  }
  const score = scoreTotal(props.score);
  if (score == 100) {
    return "var(--color-primary-600)";
  }
  if (score < 80) {
    const pct = (score / 80) * 100;
    return `color-mix(in oklch, var(--color-emerald-700) ${Math.max(30,pct)}%, transparent)`;
  }
  const pct = ((score - 80) / 20) * 100;
  return `color-mix(in oklch, var(--color-primary-800) ${100 - pct}%, var(--color-primary-700) ${pct}%)`;
});

const tooltip = computed(() => {
  var firstLine = props.country.name;
  const reactionPct = Math.floor(
    ilerpReactionTime(props.score.reaction_time) * 100,
  );
  const typingPct = Math.floor(ilerpWpm(wpm(props.score.typing_time, props.score.answer.length)) * 100);
  const totalPct = scoreTotal(props.score);
  return `${firstLine}
  reaction - ${formatTime(props.score.reaction_time)}s | ${reactionPct}%
  typing - ${wpm(props.score.typing_time, props.score.answer.length)}wpm | ${typingPct}%
  total - ${formatTime(props.score.reaction_time + props.score.typing_time)}s | ${totalPct}%`;
});

function formatTime(time: number) {
  // format ms time into second with 2 decimal
  return (time / 1000).toFixed(2);
}
</script>
