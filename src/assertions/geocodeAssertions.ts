import { check, fail } from "k6";
import type { GeocodeResponse } from "../models/geocode.ts";

export function assertGeocodeApiStatus(
  body: GeocodeResponse,
  expectedStatus: string,
  context: string
): void {
  const statusMatches = check(body, {
    [`geocode API status is ${expectedStatus}`]: (payload) => payload.status === expectedStatus,
  });

  if (!statusMatches) {
    const details = body.error_message ? ` (${body.error_message})` : "";
    fail(
      `Expected geocode API status ${expectedStatus} for ${context}, received ${body.status}${details}`
    );
  }
}
