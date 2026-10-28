import { describe, expect, it } from 'vitest';
import {
  duckdbMemoryLimit,
  duckdbPath,
  mastraDatabaseUrl,
  mastraLogLevel,
  observabilityServiceName,
  redisPubSubKeyPrefix,
  redisStreamIdleTtlMs,
  redisUrl,
} from '../../src/mastra/lib/malawi-config';

describe('mastra runtime configuration', () => {
  it('prefers MASTRA_DATABASE_URL over DATABASE_URL', () => {
    expect(
      mastraDatabaseUrl({
        MASTRA_DATABASE_URL: 'postgresql://mastra@db/mastra',
        DATABASE_URL: 'postgresql://store@db/store',
      }),
    ).toBe('postgresql://mastra@db/mastra');

    expect(
      mastraDatabaseUrl({
        DATABASE_URL: 'postgresql://store@db/store',
      }),
    ).toBe('postgresql://store@db/store');
  });

  it('fails clearly when no PostgreSQL URL is configured', () => {
    expect(() => mastraDatabaseUrl({})).toThrow(
      'MASTRA_DATABASE_URL (or DATABASE_URL) must be set',
    );
  });

  it('defaults Redis and DuckDB settings for local development', () => {
    expect(redisUrl({})).toBe('redis://localhost:6379');
    expect(redisPubSubKeyPrefix({})).toBe('mastra:topic');
    expect(redisStreamIdleTtlMs({})).toBe(7 * 24 * 60 * 60 * 1000);
    expect(duckdbPath({})).toBe('mastra.duckdb');
    expect(duckdbMemoryLimit({})).toBe('2GB');
    expect(observabilityServiceName({})).toBe('malawi-agents');
  });

  it('honours explicit environment overrides', () => {
    expect(redisUrl({ REDIS_URL: 'redis://redis.internal:6380/1' })).toBe(
      'redis://redis.internal:6380/1',
    );
    expect(redisPubSubKeyPrefix({ REDIS_PUBSUB_KEY_PREFIX: 'malawi' })).toBe(
      'malawi',
    );
    expect(redisStreamIdleTtlMs({ REDIS_STREAM_IDLE_TTL_MS: '60000' })).toBe(
      60000,
    );
    expect(duckdbPath({ DUCKDB_PATH: '/var/lib/malawi/observability.duckdb' })).toBe(
      '/var/lib/malawi/observability.duckdb',
    );
    expect(duckdbMemoryLimit({ DUCKDB_MEMORY_LIMIT: '512MB' })).toBe('512MB');
    expect(observabilityServiceName({ MASTRA_SERVICE_NAME: 'malawi-api' })).toBe(
      'malawi-api',
    );
  });

  it('rejects an invalid Redis stream TTL', () => {
    expect(() => redisStreamIdleTtlMs({ REDIS_STREAM_IDLE_TTL_MS: '-1' })).toThrow(
      'REDIS_STREAM_IDLE_TTL_MS must be a non-negative integer',
    );
  });

  it('normalises log levels', () => {
    expect(mastraLogLevel('debug')).toBe('debug');
    expect(mastraLogLevel('warn')).toBe('warn');
    expect(mastraLogLevel('error')).toBe('error');
    expect(mastraLogLevel('verbose')).toBe('info');
    expect(mastraLogLevel(undefined)).toBe('info');
  });
});
