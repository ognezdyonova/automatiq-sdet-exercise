import http, { Response } from "k6/http";

const GEOCODE_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export function geocodeByCity(city: string, apiKey: string): Response {
  const url = `${GEOCODE_API_URL}?address=${encodeURIComponent(city)}&key=${encodeURIComponent(apiKey)}`;
  return http.get(url);
}
