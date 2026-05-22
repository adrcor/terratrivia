import type { Country, Mode, Pair } from "@/types/common";
import { err, ok, type Result } from "neverthrow";
import { computed, ref } from "vue";

function newPair(c: Country, m: Mode): Pair {
  if (m === "capitals") {
    return {
      prompt: c.name,
      expected: c.capital,
    };
  }
  return {
    prompt: c.flag,
    expected: c.name,
  };
}

export function usePairCursor() {
  const countries = ref<Array<Country> | null>(null);
  const mode = ref<Mode | null>(null);

  const index = ref<number | null>(null);
  const country = computed(() => {
    if (index.value === null || countries.value === null) {
      return null;
    }
    return countries.value[index.value];
  });
  const pair = computed(() => {
    if (country.value === null || mode.value === null) {
      return null;
    }
    return newPair(country.value, mode.value);
  });

  function set(cs: Array<Country>, m: Mode): Result<null, string> {
    countries.value = cs;
    mode.value = m;
    return ok(null);
  }

  function start(): Result<null, string> {
    index.value = 0;
    return ok(null);
  }

  function next(): Result<boolean, string> {
    if (index.value === null || countries.value === null) {
      return err("practice.next: countries list not set");
    }
    index.value++;
    if (index.value === countries.value.length) {
      reset();
      return ok(true);
    }
    return ok(false);
  }

  function reset(): void {
    countries.value = null;
    mode.value = null;
    index.value = null;
  }

  return {
    pair,
    country,
    mode,

    set,
    start,
    reset,
    next,
  };
}
