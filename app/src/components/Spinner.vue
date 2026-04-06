<template>
  <div
    class="flex items-center justify-center p-8 transition-opacity duration-500"
    :class="visible ? 'opacity-100' : 'opacity-0'"
  >
    <Icon
      icon="anron-gestalt:loader"
      class="size-8 animate-spin text-neutral-500"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onMounted, onUnmounted, ref } from "vue";

const visible = ref(false);
let timeout: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  timeout = setTimeout(() => {
    visible.value = true;
  }, 200);
});

onUnmounted(() => {
  if (timeout) clearTimeout(timeout);
});
</script>
