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
      {{ formatDateTime(result.created) }}
    </div>
    <div class="flex-3 text-center text-sm">
      {{ result.region }} {{ result.mode }}
    </div>
    <div class="flex-2 text-center">
      {{ Math.floor((result.correct / result.length) * 100) }}%
    </div>
    <div class="flex-2 text-center">{{ formatSeconds(result.time) }}s</div>
  </RouterLink>
</template>

<script setup lang="ts">
import type { TrialResultSmall } from "@/types/trial";
import { formatDateTime, formatSeconds } from "@/utils/time";

const props = defineProps<{
  result: TrialResultSmall;
}>();
</script>
