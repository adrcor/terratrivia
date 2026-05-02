import type { Mode, Region } from "@/types/common";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { type Ref } from "vue";

export interface Settings {
  mode: Ref<Mode | null>;
  region: Ref<Region | null>;
}

export const useSettingsStore = defineStore("settings", () => {
  const mode = useLocalStorage<Mode>("mode", "capitals");
  const region = useLocalStorage<Region>("region", "af");

  return {
    mode,
    region,
  };
});
