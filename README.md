# automatiq-sdet-exercise

Basic k6 API testing framework in TypeScript for the Google Geocode API.

## Framework structure

```text
.
├── src
│   ├── assertions
│   │   ├── geocodeAssertions.ts
│   │   └── httpAssertions.ts
│   ├── clients
│   │   └── googleGeocodeClient.ts
│   ├── config
│   │   └── env.ts
│   ├── models
│   │   └── geocode.ts
│   ├── reporting
│   │   └── summary.ts
│   └── services
│       └── geocodeService.ts
├── tests
│   ├── sdet_geocode_api_test.ts
│   └── sdet_geocode_negative_api_test.ts
└── .github/workflows
    ├── ci-quality.yml
    └── run-k6-geocode.yml
```

## Included test behavior

- Test file: `tests/sdet_geocode_api_test.ts`
- Sends a `GET` request to `https://maps.googleapis.com/maps/api/geocode/json`
- Uses reusable k6 assertions to validate HTTP status `200`
- Validates Google Geocode payload status is `OK`
- Extracts longitude and latitude from the response payload
- Prints output in this format:
  - `City: Los Angeles Longitude: -118.2436849 Latitude: 34.0522342`
- Uses a k6 scenario with `1` VU and `1` iteration

### Negative coverage

- Test file: `tests/sdet_geocode_negative_api_test.ts`
- Scenario 1: invalid API key expects payload status `REQUEST_DENIED`
- Scenario 2: unknown city expects payload status `ZERO_RESULTS` (runs when `GOOGLE_API_KEY` is provided)

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) installed locally
- A valid Google Geocode API key/token
- [Node.js](https://nodejs.org/) 20+ for lint/typecheck tooling

## Configure environment variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Edit `.env` and set your real `GOOGLE_API_KEY` and preferred `CITY`.

## Run locally

From the repository root, load `.env` and run:

```bash
set -a; source .env; set +a
k6 run tests/sdet_geocode_api_test.ts
```

You can also use the npm script:

```bash
set -a; source .env; set +a
npm run test:geocode
```

You can also pass values directly without `.env`:

```bash
CITY="Los Angeles" GOOGLE_API_KEY="your_key" k6 run tests/sdet_geocode_api_test.ts
```

Run the negative suite:

```bash
set -a; source .env; set +a
npm run test:geocode:negative
```

Generate local HTML + JUnit + JSON reports:

```bash
set -a; source .env; set +a
npm run test:geocode:report
```

Generated files:

- `reports/sdet_geocode_api_test.html`
- `reports/sdet_geocode_api_test.junit.xml`
- `reports/sdet_geocode_api_test.summary.json`

Run quality gates:

```bash
npm install
npm run check
```

## Run from GitHub Actions

This repository includes `.github/workflows/run-k6-geocode.yml` with `workflow_dispatch`.

1. Open the repository in GitHub.
2. Go to **Actions**.
3. Select **Run k6 Geocode Test**.
4. Click **Run workflow**.
5. Provide:
   - `city` (example: `Los Angeles`)
6. Configure repository secret `GOOGLE_API_KEY` before running:
   - **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**
7. Run the workflow and review logs for test output.
8. Download artifact `k6-geocode-reports` for HTML/JUnit/JSON outputs.

## CI quality gates

- `.github/workflows/ci-quality.yml` runs on `pull_request` and `push`
- Executes:
  - `npm run lint`
  - `npm run typecheck`

## Reporting

- Local: HTML/JUnit/JSON generated via k6 `handleSummary` in `reports/`
- CI: workflow uploads report artifacts and publishes JUnit in GitHub Checks

## Allure

Yes, you can use Allure with k6, but it usually requires a custom xk6 extension or a conversion step from generated results. For this repo, JUnit + HTML is lighter and more stable in CI. If you want, I can add an Allure pipeline next (with extension build or JUnit-to-Allure conversion).

## Notes

- The test fails early if `GOOGLE_API_KEY` is not provided.
- The test fails if no geocode results are returned for the requested city.
- `.env` is ignored by git; do not commit real API keys.
