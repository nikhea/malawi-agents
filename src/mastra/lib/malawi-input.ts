import { z } from 'zod';

function isBlank(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  );
}

/** Treat whitespace-only strings as omitted optional input values. */
export const blankToUndefined = (value: unknown) =>
  value === null ||
  (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;

/**
 * Recursively drops blank values from a Store API payload.
 *
 * Models often send optional string arguments as `""` instead of omitting
 * them. Passing those through creates empty query params and blank body
 * fields, so strip them before the SDK call. Falsy-but-meaningful values such
 * as `false`, `0`, and empty arrays are preserved.
 */
export function compactPayload<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => compactPayload(item))
      .filter((item) => !isBlank(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, compactPayload(item)] as const)
        .filter(([, item]) => !isBlank(item)),
    ) as T;
  }

  return value;
}

/**
 * Normalize a storefront list response across SDK/API envelope versions.
 *
 * The SDK's paged methods return `{ data, meta }`, while older unpaged
 * methods return the rows directly. Keeping this boundary normalized prevents
 * model-output mappers from accidentally treating the paging envelope as a
 * row array.
 */
export function listRows<T>(value: unknown, resource: string): T[] {
  if (Array.isArray(value)) return value as T[];

  if (
    value !== null &&
    typeof value === 'object' &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }

  throw new Error(`The ${resource} list returned an invalid response shape.`);
}

/** Normalize model-generated arguments before tool-schema validation. */
export function cleanInputObject<T extends z.ZodRawShape>(shape: T) {
  return z.preprocess(compactPayload, z.object(shape));
}

export function cleanInputSchema<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(compactPayload, schema);
}
