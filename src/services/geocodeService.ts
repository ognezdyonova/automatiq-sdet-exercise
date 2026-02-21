import { fail } from "k6";
import type { Coordinates, GeocodeResponse } from "../models/geocode.ts";
import { assertGeocodeApiStatus } from "../assertions/geocodeAssertions.ts";

export function extractCoordinates(body: GeocodeResponse, city: string): Coordinates {
  assertGeocodeApiStatus(body, "OK", `city "${city}"`);

  if (!body.results || body.results.length === 0) {
    fail(`No geocode results returned for city: ${city}`);
  }

  const firstResult = body.results[0];
  const location = firstResult?.geometry?.location;

  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    fail(`Invalid geocode payload for city: ${city}`);
  }

  return {
    latitude: location.lat,
    longitude: location.lng,
  };
}
