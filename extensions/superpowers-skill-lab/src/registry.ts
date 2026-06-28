import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ExternalPattern } from "./model.ts";
import { parseJson, validateExternalPattern } from "./model.ts";
import { PACKAGE_REGISTRY_ROOT, REGISTRY_ROOT } from "./paths.ts";

export const REGISTRY_PATH = join(REGISTRY_ROOT, "external-patterns.json");
export const PACKAGE_REGISTRY_PATH = join(PACKAGE_REGISTRY_ROOT, "external-patterns.json");

export function defaultRegistryPath(): string {
  return existsSync(REGISTRY_PATH) ? REGISTRY_PATH : PACKAGE_REGISTRY_PATH;
}

export interface RegistryValidationSummary {
  valid: boolean;
  valid_count: number;
  invalid_count: number;
  errors: string[];
}

export function loadRegistry(registryPath = defaultRegistryPath()): ExternalPattern[] {
  const records = parseJson<ExternalPattern[]>(readFileSync(registryPath, "utf8"), (value) => {
    if (!Array.isArray(value)) return { valid: false, errors: ["registry root must be an array"] };
    const errors: string[] = [];
    value.forEach((entry, index) => {
      const result = validateExternalPattern(entry);
      for (const error of result.errors) errors.push(`entry ${index}: ${error}`);
    });
    return { valid: errors.length === 0, errors };
  }, registryPath);
  return records;
}

export function validateRegistryRecords(records: ExternalPattern[]): RegistryValidationSummary {
  const errors: string[] = [];
  let validCount = 0;
  for (const [index, record] of records.entries()) {
    const result = validateExternalPattern(record);
    if (result.valid) validCount += 1;
    else for (const error of result.errors) errors.push(`entry ${index} (${record?.name ?? "unknown"}): ${error}`);
  }
  return { valid: errors.length === 0, valid_count: validCount, invalid_count: records.length - validCount, errors };
}
