<template>
  <div
    class="flex h-16 w-full flex-row items-center justify-around gap-2 transition-opacity duration-300"
    :class="{ 'opacity-0': status.running, 'opacity-100': !status.running }"
  >
    <Link
      icon="anron-gestalt:email"
      label="contact"
      to="mailto:contact@terratrivia.app"
      size="sm"
    />
    <Link
      icon="anron-gestalt:github"
      label="github"
      to="https://github.com/adrcor/terratrivia"
      size="sm"
    />
  </div>
</template>

<script setup lang="ts">
import Link from "@/components/Link.vue";
import { useStatusStore } from "@/stores/status";

const status = useStatusStore();
</script>
