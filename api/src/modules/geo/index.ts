import type { Country } from "./types";
import { Er } from "@/utils/er";
import { ResultAsync } from "neverthrow";

export function getCountries() {
  return ResultAsync.fromPromise(Bun.file("data/world.json").json() as Promise<Country[]>, () =>
    Er.new("internal_error", "Failed to read data/world.json"),
  );
}
