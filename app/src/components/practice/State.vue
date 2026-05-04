<template>
  <div class="flex h-40 flex-wrap content-start justify-center overflow-y-auto">
    <CountryState
      v-for="(cca2, index) in unit.countries"
      :key="cca2"
      :country="geoStore.mapCountry[cca2]"
      :score="unit.scores[cca2]"
      :discovered="index < unit.discovered"
    />
  </div>
</template>

<script setup lang="ts">
import CountryState from "@/components/practice/CountryState.vue";
import { useGeoStore } from "@/stores/geo";
import type { UnitState } from "@/types/practice";

const geoStore = useGeoStore();

const props = defineProps<{
  unit: UnitState;
}>();
</script>
