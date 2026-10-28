/** Runtime configuration for the Mastra process, isolated from heavy adapters. */

export type MastraLogLevel = 'debug' | 'info' | 'warn' | 'error';

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

/**
 * PostgreSQL connection string for Mastra's main storage.
 *
 * `MASTRA_DATABASE_URL` is preferred so the agent runtime can use a different
 * database from the store API. `DATABASE_URL` is accepted as a fallback.
 */
export function mastraDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const url = firstNonEmpty(env.MASTRA_DATABASE_URL, env.DATABASE_URL);
  if (!url) {
    throw new Error(
      'MASTRA_DATABASE_URL (or DATABASE_URL) must be set to a PostgreSQL connection string.',
    );
  }
  return url;
}

/** Redis connection string used by the distributed pub/sub backend. */
export function redisUrl(env: NodeJS.ProcessEnv = process.env): string {
  return firstNonEmpty(env.REDIS_URL) ?? 'redis://localhost:6379';
}

/** Validated Pino log level; unknown values fall back to `info`. */
export function mastraLogLevel(value?: string): MastraLogLevel {
  return value === 'debug' || value === 'warn' || value === 'error'
    ? value
    : 'info';
}

/** DuckDB file used for traces, logs, metrics, scores, and feedback. */
export function duckdbPath(env: NodeJS.ProcessEnv = process.env): string {
  return firstNonEmpty(env.DUCKDB_PATH) ?? 'mastra.duckdb';
}

/** DuckDB memory ceiling. DuckDB's own default is too aggressive for an app server. */
export function duckdbMemoryLimit(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return firstNonEmpty(env.DUCKDB_MEMORY_LIMIT) ?? '2GB';
}

/** Service name attached to exported traces. */
export function observabilityServiceName(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return firstNonEmpty(env.MASTRA_SERVICE_NAME) ?? 'malawi-agents';
}

/** Prefix for Redis Streams keys used by Mastra pub/sub. */
export function redisPubSubKeyPrefix(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return firstNonEmpty(env.REDIS_PUBSUB_KEY_PREFIX) ?? 'mastra:topic';
}

/**
 * Idle TTL for Redis streams. Finished runs clean up their own topics, but
 * open-ended topics rely on this backstop. Defaults to seven days.
 */
export function redisStreamIdleTtlMs(
  env: NodeJS.ProcessEnv = process.env,
): number {
  const raw = firstNonEmpty(env.REDIS_STREAM_IDLE_TTL_MS);
  if (!raw) return 7 * 24 * 60 * 60 * 1000;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(
      `REDIS_STREAM_IDLE_TTL_MS must be a non-negative integer, got "${raw}".`,
    );
  }
  return parsed;
}
