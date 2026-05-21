import {
  VALID_THRESHOLD,
  NEW_DISCOVER_COUNT,
  REACTION_INVALID,
  WPM_INVALID,
  EXPONENTIAL_WEIGHT,
} from "./constants";
import { useGeoStore } from "./geo";
import { useApi } from "@/composables/api";
import type { Country, Mode, Region } from "@/types/common";
import type {
  CountryStats,
  PracticeAnswer,
  PracticeUnit,
  PracticeUnits,
  UnitSummary,
} from "@/types/practice";
import { fromApi } from "@/utils/api";
import { wpm } from "@/utils/cpm";
import { weightedPick } from "@/utils/random";
import { score } from "@/utils/score";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

export interface PracticeStore {
  units: Ref<PracticeUnits>;
}

function newPracticeUnit(mode: Mode, region: Region): PracticeUnit {
  const geoStore = useGeoStore();
  const countries = geoStore
    .getCountries(region)
    ._unsafeUnwrap()
    .sort((a: Country, b: Country) => a.cca2.localeCompare(b.cca2));
  const countryStats: Record<string, CountryStats> = {};

  for (const country of countries) {
    countryStats[country.cca2] = {
      country: country.name,
      cca2: country.cca2,
      answer: country.capital,
      reaction_time: 0,
      wpm: 0,
      count: 0,
    };
  }
  return {
    region: region,
    mode: mode,
    count: 0,
    discovered: 5,
    countries: countries.map((c) => c.cca2),
    countryStats: countryStats,
  };
}

export const usePracticeStore = defineStore("practice", () => {
  const apiClient = useApi();
  const units = useLocalStorage<PracticeUnits>("practice", {});

  const summary = ref<UnitSummary | null>(null);

  function get(mode: Mode, region: Region): PracticeUnit {
    if (!units.value[`${mode}:${region}`]) {
      units.value[`${mode}:${region}`] = newPracticeUnit(mode, region);
    }
    _computeSummary(units.value[`${mode}:${region}`]!);
    return units.value[`${mode}:${region}`]!;
  }

  function getShuffledCountries(mode: Mode, region: Region) {
    const geoStore = useGeoStore();
    const unit = get(mode, region);
    const pool = unit.countries
      .slice(0, unit.discovered)
      .map((cca2) => geoStore.mapCountry[cca2]);
    const windowSize = Math.min(3, pool.length - 1);
    const result: Array<Country> = [];
    const recent: Array<string> = [];

    for (let i = 0; i < 10; i++) {
      const candidates = pool.filter((c) => !recent.includes(c.cca2));
      const weights = candidates.map(
        (c) => 20 - 0.19 * score(unit.countryStats[c.cca2]),
      );
      const picked = weightedPick(candidates, weights);
      result.push(picked);
      recent.push(picked.cca2);
      if (recent.length > windowSize) recent.shift();
    }
    return result;
  }

  function pushAnswers(
    mode: Mode,
    region: Region,
    answers: Array<PracticeAnswer>,
  ): void {
    const unit = get(mode, region);
    for (const answer of answers) {
      const stats = unit.countryStats[answer.cca2];
      const weight = Math.min(stats.count, EXPONENTIAL_WEIGHT);

      const reaction_time = answer.valid
        ? Math.min(answer.reaction_time, REACTION_INVALID)
        : REACTION_INVALID;
      const answerWpm = answer.valid
        ? wpm(answer.typing_time, stats.answer.length)
        : WPM_INVALID;

      stats.reaction_time = Math.floor(
        (stats.reaction_time * weight + reaction_time) / (weight + 1),
      );
      stats.wpm = Math.floor((stats.wpm * weight + answerWpm) / (weight + 1));
      stats.count++;
    }
    unit.count++;
    answers.length = 0;

    _computeSummary(unit);
    _postUnit(unit);
  }

  function _postUnit(unit: PracticeUnit) {
    return fromApi(apiClient.practice.units.$post({ json: unit })).mapErr(
      (e) => {
        notifyError(e, "failed to save progress");
        return e;
      },
    );
  }

  function _deleteUnit(mode: Mode, region: Region) {
    return fromApi(
      apiClient.practice.units[":region"][":mode"].$delete({
        param: { region: region, mode: mode },
      }),
    ).match(
      () => notifySuccess("practice reset"),
      (e) => notifyError(e, "failed to reset practice"),
    );
  }

  function _computeSummary(unit: PracticeUnit): UnitSummary {
    const newSummary: UnitSummary = {
      validated: 0,
      completed: 0,
      average_score: 0,
      average_reaction_time: 0,
      average_wpm: 0,
    };
    let denominator = 0;
    for (const stats of Object.values(unit.countryStats)) {
      if (stats.count === 0) {
        continue;
      }
      denominator += 1;
      const value = score(stats);
      if (value >= VALID_THRESHOLD) {
        newSummary.validated++;
      }
      if (value === 100) {
        newSummary.completed++;
      }
      newSummary.average_score += value;
      newSummary.average_reaction_time += stats.reaction_time;
      newSummary.average_wpm += stats.wpm;
    }
    if (denominator > 0) {
      newSummary.average_reaction_time /= denominator;
      newSummary.average_wpm /= denominator;
      newSummary.average_score /= unit.countries.length;
    }
    unit.discovered = Math.max(
      unit.discovered,
      newSummary.validated + NEW_DISCOVER_COUNT,
    );
    summary.value = newSummary;
    return newSummary;
  }

  function reset(mode: Mode, region: Region): void {
    const emptyUnit = newPracticeUnit(mode, region);
    units.value[`${mode}:${region}`] = emptyUnit;
    _computeSummary(emptyUnit);
    _deleteUnit(mode, region);
  }

  function clear(): void {
    units.value = {};
    summary.value = null;
  }

  function sync() {
    return fromApi(apiClient.practice.units.$get())
      .andTee(() => clear())
      .map((data) => {
        for (const unit of data) {
          units.value[`${unit.mode}:${unit.region}`] = unit;
        }
      })
      .mapErr((e) => {
        notifyError(e, "failed to load practice");
        return e;
      });
  }

  return {
    units,
    summary,

    get,
    getShuffledCountries,
    pushAnswers,
    reset,
    clear,
    sync,
  };
});
