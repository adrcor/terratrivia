<template>
  <div class="flex w-full flex-col divide-y divide-neutral-800">
    <div
      :class="[
        'flex flex-row items-center justify-between divide-x divide-neutral-800',
        'px-4 py-2',
        'first:rounded-t-lg last:rounded-b-lg',
        'text-dimmed text-xs',
      ]"
    >
      <div class="flex-3 text-center">date</div>
      <div class="flex-3 text-center">region & mode</div>
      <div class="flex-2 text-center">correct</div>
      <div class="flex-2 text-center">time</div>
    </div>
    <TrialLine
      v-for="result in trialStore.results.slice().reverse()"
      :result="result"
      :key="result.id"
    />
    <div
      v-if="trialStore.results.length === 0"
      class="flex flex-col items-center justify-center"
    >
      <div class="text-dimmed text-center">no results yet</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TrialLine from "@/components/account/TrialLine.vue";
import { useTrialStore } from "@/stores/trial";

const trialStore = useTrialStore();
</script>
