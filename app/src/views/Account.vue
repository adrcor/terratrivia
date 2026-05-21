<template>
  <div class="flex w-full flex-1 flex-col items-center gap-8">
    <UTabs
      :items="tabs"
      v-model="
        // syntax highlighting workaround
        activeTab as Tab
      "
      variant="link"
      size="xl"
      color="neutral"
    />
    <Banner v-if="activeTab === 'highscores'" />
    <History v-if="activeTab === 'history'" />
    <Settings v-if="activeTab === 'settings'" />
  </div>
</template>

<script setup lang="ts">
import Banner from "@/components/account/Banner.vue";
import History from "@/components/account/History.vue";
import Settings from "@/components/account/Settings.vue";
import UTabs from "@nuxt/ui/components/Tabs.vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

type Tab = "highscores" | "history" | "settings";

const tabs = [
  { label: "highscores", value: "highscores" as Tab },
  { label: "history", value: "history" as Tab },
  { label: "settings", value: "settings" as Tab },
];

const route = useRoute();
const router = useRouter();

const isTab = (value: unknown): value is Tab =>
  tabs.some((tab) => tab.value === value);

const activeTab = computed<Tab>({
  get: () => (isTab(route.query.tab) ? route.query.tab : "highscores"),
  set: (tab) => {
    router.push({ query: { ...route.query, tab } });
  },
});
</script>
