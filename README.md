# automatiq-sdet-exercise

Basic k6 API testing framework in TypeScript for the Google Geocode API.

## Test included

- `tests/sdet_geocode_api_test.ts`
  - Sends a `GET` request to `https://maps.googleapis.com/maps/api/geocode/json`
  - Uses k6 `check` to validate HTTP status `200`
  - Extracts longitude and latitude from response JSON
  - Prints output in this format:
    - `City: Los Angeles Longitude: -118.2436849 Latitude: 34.0522342`
  - Runs with k6 scenario settings for `1` VU and `1` iteration

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) installed locally
- A valid Google Geocode API key/token

## Run locally

From the repository root, run:

```bash
CITY="Los Angeles" GOOGLE_API_KEY="<your_google_api_key>" k6 run tests/sdet_geocode_api_test.ts
```

You can also use the npm script:

```bash
CITY="Los Angeles" GOOGLE_API_KEY="<your_google_api_key>" npm run test:geocode
```

## Run from GitHub Actions

This repository includes `.github/workflows/run-k6-geocode.yml` with `workflow_dispatch`.

1. Open the repository in GitHub.
2. Go to **Actions**.
3. Select **Run k6 Geocode Test**.
4. Click **Run workflow**.
5. Provide:
   - `city` (example: `Los Angeles`)
   - `google_api_key` (your Google Geocode API auth token)
6. Run the workflow and review logs for test output.

## Notes

- The test fails early if `GOOGLE_API_KEY` is not provided.
- The test fails if no geocode results are returned for the requested city.
