import { useApi } from "@/composables/api";
import type { Country, Region } from "@/types/trial";
import { fromApi } from "@/utils/api";
import { useLocalStorage } from "@vueuse/core";
import { err, ok, type Result } from "neverthrow";
import { defineStore } from "pinia";
import { computed } from "vue";

const apiClient = useApi();

export const useGeoStore = defineStore("geo", () => {
  const countries = useLocalStorage<Array<Country>>("countries", []);

  const mapCountry = computed(() => {
    return countries.value.reduce(
      (acc, country) => {
        acc[country.cca2] = country;
        return acc;
      },
      {} as Record<string, Country>,
    );
  });

  async function sync() {
    const result = await fromApi(apiClient.geo.countries.$get());
    if (result.isOk()) {
      countries.value = result.value as Array<Country>;
    }
    return result;
  }

  function getCountries(region: Region): Result<Array<Country>, string> {
    if (countries.value.length === 0) {
      return err("geo.getCountries: no countries");
    }
    if (region === "world") {
      return ok(countries.value);
    }
    if (region === "debug") {
      return ok(countries.value.filter((c) => c.region === "eu").slice(0, 10));
    }
    return ok(countries.value.filter((c) => c.region === region));
  }

  function getShuffledCountries(
    region: Region,
  ): Result<Array<Country>, string> {
    return getCountries(region).map((cs) => cs.sort(() => Math.random() - 0.5));
  }

  return {
    mapCountry,
    sync,
    getCountries,
    getShuffledCountries,
  };
});
