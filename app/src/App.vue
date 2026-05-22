<template>
  <UApp>
    <div
      :class="[
        'flex flex-col items-center',
        'min-h-screen select-none',
        'weight-default bg-neutral-950 pl-4 font-mono text-white',
      ]"
    >
      <div class="flex h-full w-full max-w-4xl flex-1 flex-col gap-8 px-8">
        <NavigationBar />
        <div
          class="flex h-full w-full flex-1 flex-col items-center justify-center"
        >
          <RouterView />
        </div>
        <Footer />
      </div>
    </div>
    <MergeModal v-model:open="mergeOpen" />
  </UApp>
</template>

<script setup lang="ts">
import MergeModal from "@/components/MergeModal.vue";
import NavigationBar from "@/components/navigation/NavigationBar.vue";
import { useAuthStore } from "@/stores/auth";
import { hasPendingData } from "@/utils/merge";
import { syncAll } from "@/utils/sync";
import Footer from "@/views/Footer.vue";
import UApp from "@nuxt/ui/components/App.vue";
import { ref, watch } from "vue";

const auth = useAuthStore();
const mergeOpen = ref(false);

watch(
  () => auth.isAuthenticated,
  (next, prev) => {
    if (next && !prev && hasPendingData()) {
      mergeOpen.value = true;
    } else {
      syncAll();
    }
  },
  { immediate: true },
);
</script>
