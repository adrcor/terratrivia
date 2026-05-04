<template>
  <div class="flex w-full flex-row items-center justify-center gap-8">
    <SingleMetric
      icon="anron-gestalt:hashtag"
      :label="`${practice.state.value.count}`"
      tooltip="completed tests"
    />
    <SingleMetric
      icon="anron-gestalt:verified"
      :label="`${practice.state.value.validated}/${practice.state.value.list.length}`"
      tooltip="validated countries"
    />
    <SingleMetric
      icon="anron-gestalt:lightning"
      :label="`${practiceStore.stats?.completed ?? 0}/${practice.state.value.list.length}`"
      tooltip="completed countries"
    />
    <SingleMetric
      icon="anron-gestalt:speed"
      :label="`${Math.floor(practiceStore.stats?.average_reaction_time ?? 0)}ms`"
      tooltip="average reaction time"
    />
    <SingleMetric
      icon="anron-gestalt:keyboard"
      :label="`${Math.floor(practiceStore.stats?.average_wpm ?? 0)}wpm`"
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
