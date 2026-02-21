type MetricSummary = {
  values?: Record<string, number>;
};

type K6Summary = {
  metrics?: Record<string, MetricSummary>;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getMetricValue(data: K6Summary, metricName: string, valueName: string): number {
  const metric = data.metrics?.[metricName];
  const value = metric?.values?.[valueName];

  return typeof value === "number" ? value : 0;
}

function buildHtmlReport(testName: string, data: K6Summary): string {
  const checksPassed = getMetricValue(data, "checks", "passes");
  const checksFailed = getMetricValue(data, "checks", "fails");
  const httpReqs = getMetricValue(data, "http_reqs", "count");
  const httpReqDurationAvg = getMetricValue(data, "http_req_duration", "avg");
  const iterations = getMetricValue(data, "iterations", "count");

  const passColor = checksFailed > 0 ? "#7f1d1d" : "#14532d";
  const passText = checksFailed > 0 ? "FAILED" : "PASSED";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>k6 Report - ${testName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; max-width: 760px; }
    .status { display: inline-block; padding: 6px 10px; border-radius: 6px; color: #ffffff; background: ${passColor}; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; }
  </style>
</head>
<body>
  <div class="card">
    <h1>k6 Test Report</h1>
    <p><strong>Test:</strong> ${testName}</p>
    <p><span class="status">${passText}</span></p>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Checks Passed</td><td>${checksPassed}</td></tr>
      <tr><td>Checks Failed</td><td>${checksFailed}</td></tr>
      <tr><td>HTTP Requests</td><td>${httpReqs}</td></tr>
      <tr><td>Avg HTTP Duration (ms)</td><td>${httpReqDurationAvg.toFixed(2)}</td></tr>
      <tr><td>Iterations</td><td>${iterations}</td></tr>
    </table>
  </div>
</body>
</html>`;
}

function buildJunitReport(testName: string, data: K6Summary): string {
  const failures = getMetricValue(data, "checks", "fails");
  const checksPassed = getMetricValue(data, "checks", "passes");
  const checksTotal = checksPassed + failures;
  const durationMs = getMetricValue(data, "iteration_duration", "avg");
  const durationSeconds = durationMs / 1000;
  const suiteName = escapeXml(testName);
  const testcaseName = `${suiteName} checks`;

  const failureTag =
    failures > 0
      ? `<failure message="k6 checks failed">checks_failed=${failures}</failure>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="1" failures="${failures > 0 ? 1 : 0}">
  <testsuite name="${suiteName}" tests="1" failures="${failures > 0 ? 1 : 0}" time="${durationSeconds.toFixed(3)}">
    <testcase name="${testcaseName}" classname="${suiteName}" time="${durationSeconds.toFixed(3)}">
      ${failureTag}
      <system-out>checks_total=${checksTotal} checks_passed=${checksPassed} checks_failed=${failures}</system-out>
    </testcase>
  </testsuite>
</testsuites>`;
}

export function buildSummaryOutputs(testName: string, rawData: unknown): Record<string, string> {
  const data = rawData as K6Summary;
  const reportDir = __ENV.REPORT_DIR || "reports";

  return {
    stdout: `k6 summary for ${testName}: checks_failed=${getMetricValue(data, "checks", "fails")}`,
    [`${reportDir}/${testName}.html`]: buildHtmlReport(testName, data),
    [`${reportDir}/${testName}.junit.xml`]: buildJunitReport(testName, data),
    [`${reportDir}/${testName}.summary.json`]: JSON.stringify(data, null, 2),
  };
}
