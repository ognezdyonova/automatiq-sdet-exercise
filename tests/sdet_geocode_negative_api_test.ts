import { geocodeByCity } from "../src/clients/googleGeocodeClient.ts";
import { getRequiredEnv } from "../src/config/env.ts";
import type { GeocodeResponse } from "../src/models/geocode.ts";
import { assertGeocodeApiStatus } from "../src/assertions/geocodeAssertions.ts";
import { assertHttpStatus } from "../src/assertions/httpAssertions.ts";
import { buildSummaryOutputs } from "../src/reporting/summary.ts";

const includeZeroResultsScenario = Boolean(__ENV.GOOGLE_API_KEY);

export const options = {
  scenarios: {
    invalid_api_key_single_run: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1,
      exec: "invalidApiKeyScenario",
    },
    ...(includeZeroResultsScenario
      ? {
          unknown_city_single_run: {
            executor: "shared-iterations",
            vus: 1,
            iterations: 1,
            exec: "unknownCityScenario",
          },
        }
      : {}),
  },
};

export function invalidApiKeyScenario() {
  const city = __ENV.CITY || "Los Angeles";
  const response = geocodeByCity(city, "invalid-key-for-negative-test");

  assertHttpStatus(response, 200);

  const body = response.json() as GeocodeResponse;
  assertGeocodeApiStatus(body, "REQUEST_DENIED", "invalid API key scenario");
}

export function unknownCityScenario() {
  const apiKey = getRequiredEnv("GOOGLE_API_KEY");
  const city = __ENV.UNKNOWN_CITY || "ThisCityShouldNotExist-999999";
  const response = geocodeByCity(city, apiKey);

  assertHttpStatus(response, 200);

  const body = response.json() as GeocodeResponse;
  assertGeocodeApiStatus(body, "ZERO_RESULTS", `unknown city "${city}" scenario`);
}

export function handleSummary(data: unknown) {
  return buildSummaryOutputs("sdet_geocode_negative_api_test", data);
}
