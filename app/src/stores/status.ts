import { defineStore } from "pinia";
import { ref } from "vue";

export const useStatusStore = defineStore("status", () => {
  const running = ref(false);

  return {
    running,
  };
});
