import { useAuthStore } from "./auth";
import { PRESETS, type ScoringSettings } from "./constants";
import { useApi } from "@/composables/api";
import type { Mode, Region } from "@/types/common";
import { fromApi } from "@/utils/api";
import { notifyError } from "@/utils/toast";
import { useDebounceFn, useLocalStorage, watchPausable } from "@vueuse/core";
import { defineStore } from "pinia";
import { nextTick } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  const apiClient = useApi();
  const mode = useLocalStorage<Mode>("mode", "capitals");
  const region = useLocalStorage<Region>("region", "af");

  const scoring = useLocalStorage<ScoringSettings>("scoring", {
    ...PRESETS.standard,
  });

  const debouncedSave = useDebounceFn(_save, 400);
  const { pause, resume } = watchPausable(
    scoring,
    () => {
      if (!useAuthStore().isAuthenticated) return;
      debouncedSave();
    },
    { deep: true },
  );

  function loadFromServer() {
    pause();
    return fromApi(apiClient.user.settings.$get())
      .map((data) => {
        scoring.value = { ...data };
      })
      .mapErr((e) => {
        notifyError(e, "failed to load settings");
        return e;
      })
      .andTee(() => nextTick().then(() => resume()));
  }

  function reset() {
    pause();
    scoring.value = { ...PRESETS.standard };
    nextTick().then(() => resume());
  }

  function _save() {
    return fromApi(
      apiClient.user.settings.$patch({ json: scoring.value }),
    ).mapErr((e) => {
      notifyError(e, "failed to save settings");
      return e;
    });
  }

  return {
    mode,
    region,
    scoring,
    loadFromServer,
    reset,
  };
});
