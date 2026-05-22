<template>
  <div class="weight-bold text-2xl text-neutral-500">
    {{ trialResult.mode }} - {{ trialResult.region }}
  </div>
  <div class="flex flex-row items-center justify-between gap-4">
    <div class="weight-bold text-2xl text-neutral-500">
      {{ trialResult.correct }}/{{ trialResult.length }} -
    </div>
    <div class="weight-bold text-2xl text-neutral-500">
      {{ Math.floor((trialResult.correct / trialResult.length) * 100) }}% -
    </div>
    <div class="weight-bold text-2xl text-neutral-500">
      {{ formatSeconds(trialResult.time) }}s
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrialResult, TrialResultLocal } from "@/types/trial";
import { formatSeconds } from "@/utils/time";

defineProps<{
  trialResult: TrialResult | TrialResultLocal;
}>();
</script>
