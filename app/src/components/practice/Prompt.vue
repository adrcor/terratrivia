<template>
  <div
    class="weight-bold text-2xl text-neutral-300"
    v-if="practice.status.value === 'countdown'"
  >
    {{ practice.countdown.value }}
  </div>
  <div
    class="weight-bold text-2xl text-neutral-300"
    v-else-if="practice.pair.value && settings.mode === 'capitals'"
  >
    {{ practice.pair.value.prompt }}
  </div>
  <div
    class="weight-bold text-8xl text-neutral-300"
    v-else-if="practice.pair.value && settings.mode === 'flags'"
  >
    {{ practice.pair.value.prompt }}
  </div>
  <div class="weight-bold text-2xl text-neutral-500" v-else>
    press <span class="text-neutral-300 underline">tab</span> to start
  </div>
</template>

<script setup lang="ts">
import type { Practice } from '@/composables/practice';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();

const props = defineProps<{
  practice: Practice;
}>();
</script>