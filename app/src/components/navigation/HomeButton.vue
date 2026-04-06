<template>
  <RouterLink
    to="/"
    :class="[
      'mr-16 flex flex-row items-center',
      'weight-bold text-3xl',
      'text-neutral-500 transition-colors hover:text-neutral-300 active:text-neutral-200',
      'group/link cursor-pointer',
    ]"
    @mousedown.prevent
  >
    <TerraIcon class="mr-4 size-12 opacity-80 group-hover:opacity-100" />
    <div class="hidden md:block">
      <span class="group-hover/link:underline">t</span>erratrivia
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import TerraIcon from "@/components/icons/Terra.vue";
import { RouterLink } from "vue-router";
</script>
