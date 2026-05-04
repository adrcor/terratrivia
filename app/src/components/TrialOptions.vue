<template>
  <div
    class="flex flex-col items-center gap-2 transition-opacity duration-300"
    :class="{ 'opacity-0': !show }"
  >
    <div class="flex flex-row items-center gap-4">
      <UTooltip
        text="mode"
        :kbds="['m']"
        :delay-duration="200"
        :content="{ side: 'right' }"
        :ui="{
          content: 'text-sm bg-neutral-950 outline-1 outline-neutral-700',
          kbdsSize: 'md',
        }"
      >
        <UTabs
          :items="modeItems"
          v-model="
            // syntax highlighting workaround
            settings.mode as Mode
          "
          :content="false"
          color="neutral"
        />
      </UTooltip>
      <UTooltip
        text="region"
        :kbds="['r']"
        :delay-duration="200"
        :content="{ side: 'right' }"
        :ui="{
          content: 'text-sm bg-neutral-950 outline-1 outline-neutral-700',
          kbdsSize: 'md',
        }"
      >
        <UTabs
          :items="regionItems"
          v-model="
            // syntax highlighting workaround
            settings.region as Region
          "
          :content="false"
          color="neutral"
        />
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings";
import { modes, regions, type Mode, type Region } from "@/types/common";
import UTabs from "@nuxt/ui/components/Tabs.vue";
import UTooltip from "@nuxt/ui/components/Tooltip.vue";
import { onMounted, onUnmounted } from "vue";

const settings = useSettingsStore();
const modeItems = modes.map((m) => ({ label: m, value: m }));
const regionItems = regions.map((r) => ({ label: r, value: r }));

const props = defineProps<{
  show: boolean;
}>();

onMounted(() => {
  window.addEventListener("keydown", eventListener);
});

onUnmounted(() => {
  window.removeEventListener("keydown", eventListener);
});

function eventListener(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return;
  }
  if (event.key == "m") {
    nextMode();
  }
  if (event.key == "r") {
    nextRegion();
  }
}

function nextMode() {
  if (!props.show) {
    return;
  }
  const index = modes.indexOf(settings.mode);
  settings.mode = modes[(index + 1) % modes.length] as Mode;
}

function nextRegion() {
  if (!props.show) {
    return;
  }
  const index = regions.indexOf(settings.region);
  settings.region = regions[(index + 1) % regions.length] as Region;
}
</script>
