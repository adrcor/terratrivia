<template>
  <div
    class="weight-bold text-2xl text-neutral-300"
    v-if="status === 'countdown'"
  >
    {{ countdown }}
  </div>
  <div
    class="weight-bold text-2xl text-neutral-300"
    v-else-if="pair && mode === 'capitals'"
  >
    {{ pair.prompt }}
  </div>
  <div
    class="weight-bold text-8xl text-neutral-300"
    v-else-if="pair && mode === 'flags'"
  >
    {{ pair.prompt }}
  </div>
  <div class="weight-bold text-2xl text-neutral-500" v-else>
    press <span class="text-neutral-300 underline">tab</span> to start
  </div>
</template>

<script setup lang="ts">
import type { Mode, Pair } from "@/types/common";

defineProps<{
  status: "idle" | "countdown" | "running" | "done";
  countdown: number | null;
  pair: Pair | null;
  mode: Mode | null;
}>();
</script>
