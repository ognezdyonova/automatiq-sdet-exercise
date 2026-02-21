import { fail } from "k6";

export function getRequiredEnv(name: string): string {
  const value = __ENV[name];
  if (!value) {
    fail(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getCity(): string {
  return __ENV.CITY || "Los Angeles";
}
