<template>
  <div
    class="m-1 flex size-8 flex-col items-center justify-center select-none"
    :style="{ backgroundColor: color }"
  >
    {{ props.cca2.toLowerCase() }}
  </div>
</template>

<script setup lang="ts">
import { hexaToRGB, mixLinearRGB } from "@/utils/rgb";
import { computed } from "vue";

const props = defineProps<{
  cca2: string;
  percent: number;
}>();

const color = computed(() => {
  const green = "#15803d";
  const red = "#991b1b";
  const color = mixLinearRGB(hexaToRGB(green), hexaToRGB(red), props.percent);
  return `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 1)`;
});
</script>
