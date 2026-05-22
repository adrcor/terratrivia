<template>
  <UModal
    v-model:open="open"
    :dismissible="false"
    :close="false"
    title="save your progress?"
  >
    <template #body>
      <div class="flex flex-col gap-2 text-neutral-300">
        <p>
          you have
          <span class="weight-bold text-white">{{ resultsCount }}</span>
          unsaved trial
          {{ resultsCount === 1 ? "result" : "results" }} and
          <span class="weight-bold text-white">{{ unitsCount }}</span>
          local practice
          {{ unitsCount === 1 ? "unit" : "units" }}.
        </p>
        <p>save them to your account?</p>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full flex-row items-center justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          :loading="loading"
          :disabled="loading"
          @click="onReject"
          >discard</UButton
        >
        <UButton
          color="neutral"
          variant="solid"
          :loading="loading"
          :disabled="loading"
          @click="onAccept"
          >save</UButton
        >
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { usePracticeStore } from "@/stores/practice";
import { useTrialStore } from "@/stores/trial";
import { acceptMerge, rejectMerge } from "@/utils/merge";
import UButton from "@nuxt/ui/components/Button.vue";
import UModal from "@nuxt/ui/components/Modal.vue";
import { computed, ref } from "vue";

const open = defineModel<boolean>("open", { default: false });

const trialStore = useTrialStore();
const practiceStore = usePracticeStore();

const loading = ref(false);

const resultsCount = computed(() => trialStore.pendingResults.length);
const unitsCount = computed(() => practiceStore.pendingKeys.length);

async function onAccept() {
  loading.value = true;
  await acceptMerge();
  loading.value = false;
  open.value = false;
}

async function onReject() {
  loading.value = true;
  await rejectMerge();
  loading.value = false;
  open.value = false;
}
</script>
