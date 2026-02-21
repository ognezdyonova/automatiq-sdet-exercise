import { check, fail } from "k6";
import type { Response } from "k6/http";

export function assertHttpStatus(
  response: Response,
  expectedStatus: number,
  label = `response status is ${expectedStatus}`
): void {
  const statusOk = check(response, {
    [label]: (r) => r.status === expectedStatus,
  });

  if (!statusOk) {
    fail(`Expected HTTP status ${expectedStatus} but received ${response.status}`);
  }
}
