<template>
  <div class="flex h-40 flex-wrap content-start justify-center overflow-y-auto">
    <CountrySquare
      v-for="sq in squares"
      :key="sq.cca2"
      v-bind="sq"
      :box-color="practiceScoreColor"
    />
  </div>
</template>

<script setup lang="ts">
import CountrySquare from "@/components/game/CountrySquare.vue";
import { useGeoStore } from "@/stores/geo";
import type { CountryStats, PracticeUnit } from "@/types/practice";
import { practiceScoreColor } from "@/utils/color";
import { countryScore, reactionScore, wpmScore } from "@/utils/score";
import { formatSeconds } from "@/utils/time";
import { computed } from "vue";

const geoStore = useGeoStore();

const props = defineProps<{
  unit: PracticeUnit;
}>();

function metricsFor(stats: CountryStats) {
  if (stats.count === 0) {
    return [
      { label: "reaction", value: "0s", score: 0 },
      { label: "typing", value: "0wpm", score: 0 },
      { label: "total", value: "0x", score: 0 },
    ];
  }
  return [
    {
      label: "reaction",
      value: `${formatSeconds(stats.reaction_time)}s`,
      score: Math.floor(reactionScore(stats.reaction_time) * 100),
    },
    {
      label: "typing",
      value: `${stats.wpm}wpm`,
      score: Math.floor(wpmScore(stats.wpm) * 100),
    },
    {
      label: "total",
      value: `${stats.count}x`,
      score: countryScore(stats),
    },
  ];
}

const squares = computed(() =>
  props.unit.countries.map((cca2, index) => {
    const stats = props.unit.countryStats[cca2];
    const discovered = index < props.unit.discovered;
    return {
      cca2,
      tileColor: discovered
        ? practiceScoreColor(countryScore(stats))
        : "var(--color-neutral-800)",
      header: geoStore.mapCountry[cca2]?.name ?? "",
      metrics: metricsFor(stats),
    };
  }),
);
</script>
