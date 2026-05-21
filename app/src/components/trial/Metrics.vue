<template>
  <div
    class="flex flex-row items-center justify-between gap-8 text-xl text-neutral-500"
  >
    <div class="text-right">
      {{ padEmpty(correct + error, 5 - digitLength) }}/{{ length }}
    </div>
    <div class="text-right">
      {{
        correct + error > 0
          ? padEmpty(Math.floor((correct / (correct + error)) * 100), 3)
          : padEmpty(0, 3)
      }}%
    </div>
    <div class="text-right">{{ timer }}s</div>
    <div class="text-right">{{ padEmpty(apm > 0 ? apm : 0, 3) }}/min</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  timer: number;
  correct: number;
  error: number;
  length: number;
}>();

const apm = ref<number>(0);

const digitLength = computed(() => {
  if (props.length < 10) {
    return 1;
  }
  if (props.length < 100) {
    return 2;
  }
  return 3;
});

watch(
  () => props.timer,
  () => {
    apm.value = Math.floor(props.correct / (props.timer / 60));
  },
);

function padEmpty(value: number, length: number) {
  return value.toString().padStart(length, "");
}

// function padZero(value: number, length: number) {
//   return value.toString().padStart(length, "0");
// }
</script>
