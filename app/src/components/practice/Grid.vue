<template>
  <div class="flex h-40 flex-wrap content-start justify-center overflow-y-auto">
    <CountrySquare
      v-for="(cca2, index) in unit.countries"
      :key="cca2"
      :country="geoStore.mapCountry[cca2]"
      :stats="unit.countryStats[cca2]"
      :discovered="index < unit.discovered"
    />
  </div>
</template>

<script setup lang="ts">
import CountrySquare from "@/components/practice/CountrySquare.vue";
import { useGeoStore } from "@/stores/geo";
import type { PracticeUnit } from "@/types/practice";

const geoStore = useGeoStore();

const props = defineProps<{
  unit: PracticeUnit;
}>();
</script>
