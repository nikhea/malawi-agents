import { PinoLogger } from '@mastra/loggers';
import { DuckDBStore } from '@mastra/duckdb';
import { PostgresStore } from '@mastra/pg';
import { RedisStreamsPubSub } from '@mastra/redis-streams';
import { MastraCompositeStore } from '@mastra/core/storage';
import {
  MastraPlatformExporter,
  MastraStorageExporter,
  Observability,
  SensitiveDataFilter,
} from '@mastra/observability';
import {
  duckdbMemoryLimit,
  duckdbPath,
  mastraDatabaseUrl,
  mastraLogLevel,
  observabilityServiceName,
  redisPubSubKeyPrefix,
  redisStreamIdleTtlMs,
  redisUrl,
} from './malawi-config';
import { OBSERVABILITY_REQUEST_CONTEXT_KEYS } from './malawi-logging';

/** Application logger used by Mastra, exporters, and the Redis pub/sub backend. */
export function createMastraLogger(
  env: NodeJS.ProcessEnv = process.env,
): PinoLogger {
  return new PinoLogger({
    name: 'Mastra',
    level: mastraLogLevel(env.MASTRA_LOG_LEVEL),
    prettyPrint: env.NODE_ENV !== 'production',
  });
}

/**
 * PostgreSQL is the primary store (threads, messages, workflows, memory).
 * DuckDB remains the observability store so traces and logs stay in a
 * columnar file separate from transactional data.
 */
export async function createMastraStorage(
  env: NodeJS.ProcessEnv = process.env,
): Promise<MastraCompositeStore> {
  const duckdb = new DuckDBStore({
    id: 'mastra-observability',
    path: duckdbPath(env),
    memoryLimit: duckdbMemoryLimit(env),
  });

  return new MastraCompositeStore({
    id: 'composite-storage',
    default: new PostgresStore({
      id: 'mastra-storage',
      connectionString: mastraDatabaseUrl(env),
    }),
    domains: {
      observability: duckdb.observability,
    },
  });
}

/**
 * Tracing, structured logging, and metric export.
 *
 * `requestContextKeys` copies the authenticated user identity onto every span,
 * and `logging.level: 'info'` persists tool logs to the DuckDB observability
 * store. The storage exporter writes traces to the same store.
 */
export function createMastraObservability(options: {
  logger?: PinoLogger;
  env?: NodeJS.ProcessEnv;
} = {}): Observability {
  const env = options.env ?? process.env;

  return new Observability({
    configs: {
      default: {
        serviceName: observabilityServiceName(env),
        requestContextKeys: [...OBSERVABILITY_REQUEST_CONTEXT_KEYS],
        logging: { enabled: true, level: 'info' },
        exporters: [
          new MastraStorageExporter({ logger: options.logger }),
          new MastraPlatformExporter({ logger: options.logger }),
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(),
        ],
      },
    },
  });
}

/** Distributed event bus backed by Redis Streams. */
export function createRedisPubSub(options: {
  logger?: PinoLogger;
  env?: NodeJS.ProcessEnv;
} = {}): RedisStreamsPubSub {
  const env = options.env ?? process.env;

  const logger = options.logger
    ? {
        debug: (...args: unknown[]) =>
          options.logger?.debug(args.map(String).join(' ')),
        warn: (...args: unknown[]) =>
          options.logger?.warn(args.map(String).join(' ')),
      }
    : undefined;

  return new RedisStreamsPubSub({
    url: redisUrl(env),
    keyPrefix: redisPubSubKeyPrefix(env),
    streamIdleTtlMs: redisStreamIdleTtlMs(env),
    logger,
  });
}
