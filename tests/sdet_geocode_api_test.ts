import http from "k6/http";
import { check, fail } from "k6";

type GeocodeResponse = {
  status: string;
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
};

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
  const city = __ENV.CITY || "Los Angeles";
  const apiKey = __ENV.GOOGLE_API_KEY;

  if (!apiKey) {
    fail("Missing GOOGLE_API_KEY environment variable.");
  }

  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const response = http.get(
    `${url}?address=${encodeURIComponent(city)}&key=${encodeURIComponent(apiKey)}`
  );

  const statusOk = check(response, {
    "response status is 200": (r) => r.status === 200,
  });

  if (!statusOk) {
    fail(`Expected status 200 but received ${response.status}`);
  }

  const body = response.json() as GeocodeResponse;

  if (!body.results || body.results.length === 0) {
    fail(`No geocode results returned for city: ${city}`);
  }

  const latitude = body.results[0].geometry.location.lat;
  const longitude = body.results[0].geometry.location.lng;

  console.log(`City: ${city} Longitude: ${longitude} Latitude: ${latitude}`);
}
