<template>
  <RouterLink
    v-if="to"
    :to="`/trial/${to}`"
    class="group flex min-w-24 flex-1 shrink-0 flex-col items-center justify-center"
  >
    <div
      class="weight-bold text-2xl text-neutral-500 transition-colors group-hover:text-neutral-300"
    >
      {{ label }}
    </div>
    <div
      class="weight-bold text-xl text-neutral-500 transition-colors group-hover:text-neutral-300"
    >
      {{ score ? `${score}%` : "--" }}
    </div>
    <div
      class="weight-bold text-xl text-neutral-500 transition-colors group-hover:text-neutral-300"
    >
      {{ time ? `${formatSecondsInt(time)}s` : "--" }}
    </div>
  </RouterLink>
  <div
    v-else
    class="flex min-w-24 flex-1 shrink-0 flex-col items-center justify-center select-none"
  >
    <div class="weight-bold text-2xl text-neutral-500">{{ label }}</div>
    <div class="weight-bold text-xl text-neutral-500">
      {{ score ? `${score}%` : "--" }}
    </div>
    <div class="weight-bold text-xl text-neutral-500">
      {{ time ? `${formatSecondsInt(time)}s` : "--" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatSecondsInt } from "@/utils/time";
import { computed } from "vue";

const props = defineProps<{
  label: string;
  numerator: number;
  denominator: number;
  time: number;
  to: string | null;
}>();

const score = computed(() => {
  return Math.floor((props.numerator / props.denominator) * 100);
});
</script>
