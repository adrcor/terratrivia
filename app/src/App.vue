<template>
  <UApp>
    <div
      :class="[
        'flex flex-col items-center',
        'min-h-screen',
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
  </UApp>
</template>

<script setup lang="ts">
import { useGeoStore } from "@/stores/geo";
import { useTrialStore } from "@/stores/trial";
import NavigationBar from "@/components/navigation/NavigationBar.vue";
import { useAuthStore } from "@/stores/auth";
import Footer from "@/views/Footer.vue";
import UApp from "@nuxt/ui/components/App.vue";
import { onMounted } from "vue";

const authStore = useAuthStore();
const trialStore = useTrialStore();
const geoStore = useGeoStore();

onMounted(async () => {
  await authStore.sync();
  geoStore.sync();
  trialStore.syncHighscores();
  trialStore.syncResults();
});
</script>
