<template>
  <div
    v-if="trialResult"
    class="flex w-full flex-col items-center justify-center gap-2 text-white"
  >
    <Summary :trial-result="trialResult" />
    <div class="mt-8 flex flex-row items-center">
      <ShortcutTooltip text="metric" kbd="m" @trigger="nextMetric">
        <UTabs
          :items="metricItems"
          v-model="keyMetric as KeyMetric"
          :content="false"
          color="neutral"
        />
      </ShortcutTooltip>
    </div>
    <Grid :trial-result="trialResult" :key-metric="keyMetric" />
    <div v-if="!auth.isAuthenticated">
      <p class="mt-4 text-center text-neutral-500">
        login to save your results
      </p>
    </div>
  </div>
  <Spinner v-else />
</template>

<script setup lang="ts">
import ShortcutTooltip from "@/components/ShortcutTooltip.vue";
import Spinner from "@/components/Spinner.vue";
import Grid from "@/components/trial/Grid.vue";
import Summary from "@/components/trial/Summary.vue";
import { useAuthStore } from "@/stores/auth";
import type {
  KeyMetric,
  TrialResult,
  TrialResultLocal,
} from "@/types/trial";
import UTabs from "@nuxt/ui/components/Tabs.vue";
import { ref } from "vue";

const auth = useAuthStore();

defineProps<{
  trialResult: TrialResult | TrialResultLocal;
}>();

const metricItems = [
  { label: "total", value: "total" },
  { label: "reaction", value: "reaction" },
  { label: "typing", value: "typing" },
];

const keyMetric = ref<KeyMetric>("total");

function nextMetric() {
  const index = metricItems.map((m) => m.value).indexOf(keyMetric.value);
  keyMetric.value = metricItems[(index + 1) % metricItems.length]!
    .value as KeyMetric;
}
</script>
