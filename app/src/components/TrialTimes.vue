<template>
  <div class="flex h-4 w-64 flex-row items-center rounded-full bg-yellow-950">
    <div
      class="h-full rounded-l-full bg-red-500"
      :style="{ width: `${reactionPercentage}%` }"
    ></div>
    <div
      class="h-full rounded-r-full bg-blue-500"
      :style="{ width: `${typingPercentage}%` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const reactionPercentage = computed(() => {
  return Math.floor((props.reaction_time / props.maxTotalTime) * 100);
});

const typingPercentage = computed(() => {
  return Math.floor((props.typing_time / props.maxTotalTime) * 100);
});

const props = defineProps<{
  reaction_time: number;
  typing_time: number;
  maxTotalTime: number;
}>();
</script>
