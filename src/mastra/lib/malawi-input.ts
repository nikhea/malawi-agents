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
