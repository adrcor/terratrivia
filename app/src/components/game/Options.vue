<template>
  <div
    class="flex flex-col items-center gap-2 transition-opacity duration-300"
    :class="{ 'opacity-0': !show }"
  >
    <div class="flex flex-row items-center gap-4">
      <ShortcutTooltip text="mode" kbd="m" :enabled="show" @trigger="nextMode">
        <UTabs
          :items="modeItems"
          v-model="
            // syntax highlighting workaround
            settings.mode as Mode
          "
          :content="false"
          color="neutral"
        />
      </ShortcutTooltip>
      <ShortcutTooltip
        text="region"
        kbd="r"
        :enabled="show"
        @trigger="nextRegion"
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
      </ShortcutTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShortcutTooltip from "@/components/ShortcutTooltip.vue";
import { useSettingsStore } from "@/stores/settings";
import { modes, regions, type Mode, type Region } from "@/types/common";
import UTabs from "@nuxt/ui/components/Tabs.vue";

const settings = useSettingsStore();
const modeItems = modes.map((m) => ({ label: m, value: m }));
const regionItems = regions.map((r) => ({ label: r, value: r }));

defineProps<{
  show: boolean;
}>();

function nextMode() {
  const index = modes.indexOf(settings.mode);
  settings.mode = modes[(index + 1) % modes.length] as Mode;
}

function nextRegion() {
  const index = regions.indexOf(settings.region);
  settings.region = regions[(index + 1) % regions.length] as Region;
}
</script>
