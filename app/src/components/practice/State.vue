<template>
  <div class="flex h-40 flex-wrap content-start justify-center overflow-y-auto">
    <CountryState
      v-for="(country, index) in unit.list"
      :key="country.cca2"
      :country="country"
      :score="unit.scores[country.cca2]"
      :discovered="index < unit.discovered"
    />
  </div>
</template>

<script setup lang="ts">
import CountryState from "@/components/practice/CountryState.vue";
import type { UnitState } from "@/types/practice";

const props = defineProps<{
  unit: UnitState;
}>();
</script>
