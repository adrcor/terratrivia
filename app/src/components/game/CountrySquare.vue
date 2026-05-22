<template>
  <UTooltip
    :delay-duration="100"
    :content="{ side: 'bottom' }"
    :ui="{ content: 'h-fit' }"
    :disable-closing-trigger="true"
  >
    <div
      class="m-1 flex size-8 flex-col items-center justify-center rounded-xs select-none"
      :style="{ backgroundColor: tileColor }"
    >
      {{ cca2.toLowerCase() }}
    </div>
    <template #content>
      <div
        class="flex flex-col gap-2 self-center text-center font-mono text-sm"
      >
        <div class="flex w-full flex-row justify-center px-2">
          <span>{{ header }}</span>
        </div>
        <div class="flex flex-row gap-4" v-if="metrics.length">
          <div
            v-for="m in metrics"
            :key="m.label"
            class="flex flex-1 flex-col rounded-sm px-2 py-0.5 text-sm"
            :style="{ backgroundColor: boxColor(m.score) }"
          >
            <div>{{ m.label }}</div>
            <div class="flex flex-row justify-between gap-4">
              <span>{{ m.value }}</span>
              <span>{{ m.score }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
import UTooltip from "@nuxt/ui/components/Tooltip.vue";

defineProps<{
  cca2: string;
  tileColor: string;
  header: string;
  metrics: Array<{ label: string; value: string; score: number }>;
  boxColor: (score: number) => string;
}>();
</script>
