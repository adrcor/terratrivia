<template>
  <div
    class="grid transition-all duration-200"
    :class="{
      'grid-rows-[1fr] opacity-100': message,
      'grid-rows-[0fr] opacity-0': !message,
    }"
  >
    <div class="overflow-hidden text-red-400">
      {{ message || "\u00A0" }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string | boolean;
}>();
</script>
