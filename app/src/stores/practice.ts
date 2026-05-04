import { useGeoStore } from "./geo";
import type { Country, Mode, Region } from "@/types/common";
import type {
  CountryScore,
  PracticeAnswer,
  PracticeState,
  PracticeStats,
  UnitState,
} from "@/types/practice";
import { wpm } from "@/utils/cpm";
import { weightedPick } from "@/utils/random";
import { scoreTotal } from "@/utils/score";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

const VALID_THRESHOLD = 80;
const DISCOVERED_COUNT = 5;

export interface PracticeStore {
  state: Ref<PracticeState>;
}

function newUnitState(region: Region): UnitState {
  const geoStore = useGeoStore();
  const countries = geoStore
    .getCountries(region)
    ._unsafeUnwrap()
    .sort((a: Country, b: Country) => a.cca2.localeCompare(b.cca2));
  const scores: Record<string, CountryScore> = {};

  for (const country of countries) {
    scores[country.cca2] = {
      country: country.name,
      cca2: country.cca2,
      answer: country.capital,
      reaction_time: 0,
      typing_time: 0,
      count: 0,
    };
  }
  return {
    region: "world",
    mode: "capitals",
    count: 0,
    discovered: 5,
    validated: 0,
    list: countries,
    scores: scores,
  };
}

export const usePracticeStore = defineStore("practice", () => {
  const state = useLocalStorage<PracticeState>("practice", {});

  const stats = ref<PracticeStats | null>(null);

  function get(mode: Mode, region: Region): UnitState {
    if (!state.value[`${mode}:${region}`]) {
      state.value[`${mode}:${region}`] = newUnitState(region);
    }
    setStats(state.value[`${mode}:${region}`]!);
    return state.value[`${mode}:${region}`]!;
  }

  function getShuffledCountries(mode: Mode, region: Region) {
    const unit = get(mode, region);
    const pool = unit.list.slice(0, unit.discovered);
    const windowSize = Math.min(3, pool.length - 1);
    const result: Array<Country> = [];
    const recent: Array<string> = [];

    for (let i = 0; i < 10; i++) {
      const candidates = pool.filter((c) => !recent.includes(c.cca2));
      const weights = candidates.map(
        (c) => 20 - 0.19 * scoreTotal(unit.scores[c.cca2]),
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
      const score = unit.scores[answer.cca2];
      const weight = Math.min(score.count, 5);
      const reaction_time = answer.valid ? answer.reaction_time : 5000;
      const typing_time = answer.valid ? answer.typing_time : 5000;

      score.reaction_time = Math.floor(
        (score.reaction_time * weight + reaction_time) / (weight + 1),
      );
      score.typing_time = Math.floor(
        (score.typing_time * weight + typing_time) / (weight + 1),
      );
      score.count++;
    }
    unit.count++;
    answers.length = 0;
    _updateScores(mode, region);
    stats.value = _computeStats(unit);
  }

  function _updateScores(mode: Mode, region: Region): void {
    const unit = get(mode, region);
    let validCount = 0;
    for (const score of Object.values(unit.scores)) {
      if (score.count === 0) {
        continue;
      }
      const value = scoreTotal(score);
      if (value >= VALID_THRESHOLD) {
        validCount++;
      }
    }
    unit.validated = validCount;
    unit.discovered = Math.max(unit.discovered, validCount + DISCOVERED_COUNT);
  }

  function _computeStats(unit: UnitState): PracticeStats {
    const stats: PracticeStats = {
      validated: 0,
      completed: 0,
      average_reaction_time: 0,
      average_wpm: 0,
    };
    let denominator = 0;
    for (const score of Object.values(unit.scores)) {
      if (score.count === 0) {
        continue;
      }
      denominator += 1;
      const scoreValue = scoreTotal(score);
      if (scoreValue >= VALID_THRESHOLD) {
        stats.validated++;
      }
      if (scoreValue === 100) {
        stats.completed++;
      }
      stats.average_reaction_time += score.reaction_time;
      stats.average_wpm += wpm(score.typing_time, score.answer.length);
    }
    stats.average_reaction_time /= denominator;
    stats.average_wpm /= denominator;
    return stats;
  }

  function setStats(unit: UnitState): void {
    const newStats = _computeStats(unit);
    stats.value = newStats;
  }

  function reset(mode: Mode, region: Region): void {
    state.value[`${mode}:${region}`] = newUnitState(region);
    setStats(state.value[`${mode}:${region}`]!);
  }

  return {
    state,
    stats,

    get,
    getShuffledCountries,
    pushAnswers,
    reset,
  };
});
