import { useApi } from "@/composables/api";
import type { Country, Region } from "@/types/common";
import { fromApi } from "@/utils/api";
import { notifyError } from "@/utils/toast";
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

  function sync() {
    return fromApi(apiClient.geo.countries.$get())
      .map((data) => {
        countries.value = data as Array<Country>;
      })
      .mapErr((e) => {
        notifyError(e, "failed to load country data");
        return e;
      });
  }

  function getCountries(region: Region): Result<Array<Country>, string> {
    if (countries.value.length === 0) {
      return err("geo.getCountries: no countries");
    }
    if (region === "world") {
      return ok(countries.value);
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
