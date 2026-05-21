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
      {{ props.cca2.toLowerCase() }}
    </div>
    <template #content>
      <slot />
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
import UTooltip from "@nuxt/ui/components/Tooltip.vue";
import { computed } from "vue";

const props = defineProps<{
  cca2: string;
  percent: number;
}>();

const color = computed(() => {
  const score = Math.floor((1 - props.percent) * 100);
  if (score == 100) {
    return "var(--color-primary-600)";
  }
  return `color-mix(in oklch, var(--color-orange-800) ${100 - score}%, var(--color-emerald-700) ${score}%)`;
});
</script>
