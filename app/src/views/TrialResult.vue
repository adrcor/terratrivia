<template>
  <TrialResultComponent v-if="trialResult" :trialResult="trialResult" />
  <Spinner v-else />
</template>

<script setup lang="ts">
import Spinner from "@/components/Spinner.vue";
import TrialResultComponent from "@/components/trial/Result.vue";
import { useTrialStore } from "@/stores/trial";
import type { TrialResult } from "@/types/trial";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const trialStore = useTrialStore();
const route = useRoute();

const trialResult = ref<TrialResult | null>(null);

onMounted(async () => {
  if (typeof route.params.id === "string") {
    const result = await trialStore.getResult(route.params.id);
    if (result.isOk()) {
      trialResult.value = result.value;
    }
  }
});
</script>
