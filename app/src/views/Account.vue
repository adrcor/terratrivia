<template>
  <div class="flex w-full flex-col items-center gap-2">
    <h1 class="weight-bold mb-2 text-2xl">trial highscores</h1>
    <Banner />
    <h1 class="weight-bold mt-16 mb-2 text-2xl">account</h1>
    <Settings />
  </div>
</template>

<script setup lang="ts">
import Banner from "@/components/account/Banner.vue";
import Settings from "@/components/account/Settings.vue";
</script>
