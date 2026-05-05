<template>
  <div class="flex w-full flex-row items-center justify-center gap-8">
    <SingleMetric
      icon="anron-gestalt:hashtag"
      :label="`${practice.unit.value.count}`"
      tooltip="completed tests"
    />
    <SingleMetric
      icon="anron-gestalt:verified"
      :label="`${practiceStore.summary?.validated ?? 0}/${practice.unit.value.countries.length}`"
      tooltip="validated countries"
    />
    <SingleMetric
      icon="anron-gestalt:lightning"
      :label="`${practiceStore.summary?.completed ?? 0}/${practice.unit.value.countries.length}`"
      tooltip="completed countries"
    />
    <SingleMetric
      icon="anron-gestalt:atom"
      :label="`${(practiceStore.summary?.average_score ?? 0).toFixed(1)}%`"
      tooltip="global score"
    />
    <SingleMetric
      icon="anron-gestalt:speed"
      :label="`${Math.floor(practiceStore.summary?.average_reaction_time ?? 0)}ms`"
      tooltip="average reaction time"
    />
    <SingleMetric
      icon="anron-gestalt:keyboard"
      :label="`${Math.floor(practiceStore.summary?.average_wpm ?? 0)}wpm`"
      tooltip="average typing speed"
    />
  </div>
</template>

<script setup lang="ts">
import SingleMetric from "@/components/practice/SingleMetric.vue";
import type { Practice } from "@/composables/practice";
import { usePracticeStore } from "@/stores/practice";

const practiceStore = usePracticeStore();

const props = defineProps<{
  practice: Practice;
}>();
</script>
