<template>
  <div class="flex flex-col items-center justify-center">
    <div
      class="flex w-full flex-row items-center justify-center gap-8 rounded-lg"
    >
      <Highscore
        key="total"
        label="capitals"
        :numerator="totalCapitalCorrect"
        :denominator="totalLength"
        :time="totalCapitalTime"
        :to="null"
      />
      <div class="mx-4 my-2 w-1 self-stretch rounded-full bg-neutral-500"></div>
      <div class="flex flex-wrap gap-2">
        <Highscore
          v-for="highscore in capitalHighscores"
          :key="highscore.region"
          :label="highscore.region"
          :numerator="highscore.numerator"
          :denominator="highscore.denominator"
          :time="highscore.time"
          :to="highscore.id_result"
        />
      </div>
    </div>

    <div class="my-4 h-1 w-full rounded-full bg-neutral-500"></div>

    <div
      class="flex w-full flex-row items-center justify-center gap-8 rounded-lg"
    >
      <Highscore
        key="total"
        label="flags"
        :numerator="totalFlagCorrect"
        :denominator="totalLength"
        :time="totalFlagTime"
        :to="null"
      />
      <div class="mx-4 my-2 w-1 self-stretch rounded-full bg-neutral-500"></div>
      <div class="flex flex-wrap gap-2">
        <Highscore
          v-for="highscore in flagHighscores"
          :key="highscore.region"
          :label="highscore.region"
          :numerator="highscore.numerator"
          :denominator="highscore.denominator"
          :time="highscore.time"
          :to="highscore.id_result"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Highscore from "./Highscore.vue";
import { useTrialStore } from "@/stores/trial";
import type { Region } from "@/types/trial";
import { regionLengths, regions } from "@/types/trial";
import { computed, onMounted } from "vue";

const trialStore = useTrialStore();

interface Highscore {
  region: Region;
  numerator: number;
  denominator: number;
  time: number;
  id_result: string | null;
}

const totalLength = regions.reduce(
  (acc, region) => acc + regionLengths[region],
  0,
);

const totalCapitalCorrect = computed(() => {
  return trialStore.highscores
    .filter((h) => h.mode === "capitals")
    .reduce((acc, h) => acc + h.correct, 0);
});

const totalCapitalTime = computed(() => {
  const filtered = trialStore.highscores.filter((h) => h.mode === "capitals");
  if (filtered.length != regions.length) {
    return 0;
  }
  return filtered.reduce((acc, h) => acc + h.time, 0) / filtered.length;
});

const capitalHighscores = computed<Array<Highscore>>(() => {
  return regions.map((region) => {
    const highscore = trialStore.highscores.find(
      (h) => h.mode === "capitals" && h.region === region,
    );
    if (!highscore) {
      return {
        region,
        numerator: 0,
        denominator: regionLengths[region],
        time: 0,
        id_result: null,
      };
    }
    return {
      region,
      numerator: highscore.correct,
      denominator: regionLengths[region],
      time: highscore.time,
      id_result: highscore.id_result,
    };
  });
});

const totalFlagCorrect = computed(() => {
  return trialStore.highscores
    .filter((h) => h.mode === "flags")
    .reduce((acc, h) => acc + h.correct, 0);
});

const totalFlagTime = computed(() => {
  const filtered = trialStore.highscores.filter((h) => h.mode === "flags");
  if (filtered.length != regions.length) {
    return 0;
  }
  return filtered.reduce((acc, h) => acc + h.time, 0) / filtered.length;
});

const flagHighscores = computed<Array<Highscore>>(() => {
  return regions.map((region) => {
    const highscore = trialStore.highscores.find(
      (h) => h.mode === "flags" && h.region === region,
    );
    if (!highscore) {
      return {
        region,
        numerator: 0,
        denominator: regionLengths[region],
        time: 0,
        id_result: null,
      };
    }
    return {
      region,
      numerator: highscore.correct,
      denominator: regionLengths[region],
      time: highscore.time,
      id_result: highscore.id_result,
    };
  });
});

onMounted(async () => {
  await trialStore.syncHighscores();
});
</script>
