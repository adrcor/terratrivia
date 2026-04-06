<template>
  <RouterLink
    :to="to"
    :class="[
      'flex flex-row items-center',
      'group/link cursor-pointer',
      'fill-neutral-500 transition-colors hover:fill-neutral-300 active:fill-neutral-200',
    ]"
  >
    <slot />
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from "vue-router";

defineProps<{
  to: RouteLocationRaw;
}>();
</script>
