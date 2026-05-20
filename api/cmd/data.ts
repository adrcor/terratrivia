import { ResultAsync, err, ok } from "neverthrow";
import type { Result } from "neverthrow";
import { z } from "zod";

const API_URL =
  "https://restcountries.com/v3.1/all?fields=name,capital,region,cca2,cca3,flag,borders,unMember";

const ApiCountrySchema = z.object({
  name: z.object({
    common: z.string(),
  }),
  capital: z.array(z.string()),
  region: z.string(),
  cca2: z.string(),
  cca3: z.string(),
  flag: z.string(),
  borders: z.array(z.string()),
  unMember: z.boolean(),
});

type ApiCountry = z.infer<typeof ApiCountrySchema>;

interface Country {
  name: string;
  capital: string;
  region: string;
  cca2: string;
  cca3: string;
  flag: string;
  borders: string[];
}

const COUNTRY_EXCEPTIONS = ["Palestine", "Vatican City", "Guinea-Bissau"];

const CAPITAL_EXCEPTIONS: Record<string, string> = {
  Palestine: "Jerusalem",
  "Sri Lanka": "Colombo",
  Mongolia: "Ulaanbaatar",
  Grenada: "Saint George's",
};

const COUNTRY_RENAMES: Record<string, string> = {
  "DR Congo": "Democratic Republic of the Congo",
};

const REGION_MAP: Record<string, string> = {
  Americas: "am",
  Africa: "af",
  Asia: "as",
  Europe: "eu",
  Oceania: "oc",
};

function fetchCountries(): ResultAsync<ApiCountry[], string> {
  return ResultAsync.fromPromise(
    fetch(API_URL).then((r) => r.json()),
    (error) => `failed to fetch countries: ${error}`,
  ).andThen((json) => {
    const parsed = z.array(ApiCountrySchema).safeParse(json);
    return parsed.success ? ok(parsed.data) : err(`failed to parse countries: ${parsed.error}`);
  });
}

function processCountries(apiCountries: ApiCountry[]): Result<Country[], string> {
  const regions: Record<string, number> = {};
  const selected: Country[] = [];

  for (const country of apiCountries) {
    let name = country.name.common;
    name = COUNTRY_RENAMES[name] ?? name;

    if (!country.unMember && !COUNTRY_EXCEPTIONS.includes(name)) {
      continue;
    }

    regions[country.region] = (regions[country.region] ?? 0) + 1;

    const capital = CAPITAL_EXCEPTIONS[name] ?? country.capital[0] ?? "missing capital";

    const region = REGION_MAP[country.region];
    if (!region) {
      return err(`region ${country.region} not found`);
    }

    selected.push({
      name,
      capital,
      region,
      cca2: country.cca2,
      cca3: country.cca3,
      flag: country.flag,
      borders: country.borders,
    });
  }

  console.log(selected.length, "countries");
  console.log(regions);

  selected.sort((a, b) => a.name.localeCompare(b.name));

  return ok(selected);
}

function writeFile(path: string, data: string): ResultAsync<void, string> {
  return ResultAsync.fromPromise(
    Bun.write(path, data).then(() => {}),
    (error) => `failed to write ${path}: ${error}`,
  );
}

const result = await fetchCountries()
  .andThen((apiCountries) => processCountries(apiCountries))
  .andThen((countries) => writeFile("./data/world.json", JSON.stringify(countries)));

if (result.isErr()) {
  console.error(result.error);
  process.exit(1);
}
