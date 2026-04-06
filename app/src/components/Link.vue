<template>
  <!--
    @vue-expect-error 
    @mousedown.prevent not supported in NuxtUI Button but needed
    to avoid form field error blink when clicking on a link
  -->
  <Button
    :icon="icon"
    :to="to"
    :label="label"
    variant="link"
    color="neutral"
    class="cursor-pointer px-1 text-neutral-500"
    :class="{
      'text-sm': size === 'sm',
      'text-lg': size === 'md',
      'text-xl': size === 'lg',
      'text-2xl': size === 'xl',
    }"
    @mousedown.prevent
    :size="size"
  />
</template>

<script setup lang="ts">
import Button from "@nuxt/ui/components/Button.vue";

const props = withDefaults(
  defineProps<{
    icon?: string;
    label?: string;
    to: string;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  {
    size: "md",
  },
);
</script>

<style scoped></style>
