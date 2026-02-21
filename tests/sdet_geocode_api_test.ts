import { geocodeByCity } from "../src/clients/googleGeocodeClient.ts";
import { getCity, getRequiredEnv } from "../src/config/env.ts";
import type { GeocodeResponse } from "../src/models/geocode.ts";
import { extractCoordinates } from "../src/services/geocodeService.ts";
import { assertHttpStatus } from "../src/assertions/httpAssertions.ts";
import { buildSummaryOutputs } from "../src/reporting/summary.ts";

export const options = {
  scenarios: {
    geocode_single_run: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1,
    },
  },
};

export default function () {
  const city = getCity();
  const apiKey = getRequiredEnv("GOOGLE_API_KEY");
  const response = geocodeByCity(city, apiKey);
  assertHttpStatus(response, 200);

  const body = response.json() as GeocodeResponse;
  const { latitude, longitude } = extractCoordinates(body, city);

  console.log(`City: ${city} Longitude: ${longitude} Latitude: ${latitude}`);
}

export function handleSummary(data: unknown) {
  return buildSummaryOutputs("sdet_geocode_api_test", data);
}
