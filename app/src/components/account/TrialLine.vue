<template>
  <RouterLink
    :to="`/trial/${result.id}`"
    :class="[
      'flex flex-row items-center justify-between divide-x divide-neutral-800',
      'hover:text-default text-muted transition-colors duration-100 hover:bg-neutral-900',
      'px-4 py-2',
      'first:rounded-t-lg last:rounded-b-lg',
    ]"
  >
    <div class="flex-3 text-center text-sm">
      {{ formatTime(result.created) }}
    </div>
    <div class="flex-3 text-center text-sm">
      {{ result.region }} {{ result.mode }}
    </div>
    <div class="flex-2 text-center">
      {{ Math.floor((result.correct / result.length) * 100) }}%
    </div>
    <div class="flex-2 text-center">{{ (result.time / 1000).toFixed(2) }}s</div>
  </RouterLink>
</template>

<script setup lang="ts">
import type { TrialResultSmall } from "@/types/trial";

function formatTime(iso: string) {
  // format iso string to 01 jan 2026 - 13:31
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

const props = defineProps<{
  result: TrialResultSmall;
}>();
</script>
