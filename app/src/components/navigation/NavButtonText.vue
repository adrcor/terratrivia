<template>
  <RouterLink
    :to="to"
    :class="[
      'flex flex-row items-center',
      'weight-bold text-xl',
      'text-neutral-500 transition-colors hover:text-neutral-300 active:text-neutral-200',
      'group/link cursor-pointer',
    ]"
  >
    <div>
      <span class="group-hover/link:underline">{{ text.charAt(0) }}</span
      >{{ text.slice(1) }}
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from "vue-router";

defineProps<{
  to: RouteLocationRaw;
  text: string;
}>();
</script>
