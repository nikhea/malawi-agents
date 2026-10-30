import {
  MASTRA_RESOURCE_ID_KEY,
  MASTRA_THREAD_ID_KEY,
} from '@mastra/core/request-context';
import { createTool } from '@mastra/core/tools';
import type { RequestContext } from '@mastra/core/request-context';
import { MALAWI_CONTEXT_KEYS } from './malawi-context';
import type { MalawiContext } from './malawi-context';
import { compactPayload } from './malawi-input';

/**
 * Request-context keys copied onto every observability span.
 *
 * Access and refresh tokens are intentionally excluded: traces must identify
 * the caller without persisting credentials. `SensitiveDataFilter` remains a
 * second line of defence for any token that reaches a span another way.
 */
export const OBSERVABILITY_REQUEST_CONTEXT_KEYS = [
  MALAWI_CONTEXT_KEYS.userId,
  MALAWI_CONTEXT_KEYS.userEmail,
  MALAWI_CONTEXT_KEYS.userName,
  MALAWI_CONTEXT_KEYS.userRole,
  MASTRA_RESOURCE_ID_KEY,
  MASTRA_THREAD_ID_KEY,
] as const;

export type ToolLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Minimal shape of the observability logger exposed as `context.observe`. */
export interface ToolLogSink {
  log(
    level: ToolLogLevel,
    message: string,
    data?: Record<string, unknown>,
  ): void;
}

const SENSITIVE_LOG_KEY =
  /token|secret|password|credential|authorization|api[_-]?key/i;

/** Returns bounded, redacted metadata suitable for persisted observability logs. */
export function summarizeToolData(
  value: unknown,
  key = '',
  depth = 0,
): unknown {
  if (SENSITIVE_LOG_KEY.test(key)) return '[REDACTED]';
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.length > 128 ? `${value.slice(0, 125)}...` : value;
  }
  if (depth >= 3) return '[TRUNCATED]';
  if (Array.isArray(value)) {
    return {
      count: value.length,
      items: value.slice(0, 5).map((item) => summarizeToolData(item, '', depth + 1)),
    };
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 20)
        .map(([entryKey, entryValue]) => [
          entryKey,
          summarizeToolData(entryValue, entryKey, depth + 1),
        ]),
    );
  }
  return typeof value;
}

/**
 * Identity fields attached to tool logs and spans. Only non-secret values are
 * returned, so these logs are safe to persist.
 */
export function toolLogContext(
  requestContext?: RequestContext<MalawiContext>,
): Record<string, unknown> {
  if (!requestContext) return {};

  const context: Record<string, unknown> = {};
  const userId = requestContext.get(MALAWI_CONTEXT_KEYS.userId);
  const userEmail = requestContext.get(MALAWI_CONTEXT_KEYS.userEmail);
  const userName = requestContext.get(MALAWI_CONTEXT_KEYS.userName);
  const userRole = requestContext.get(MALAWI_CONTEXT_KEYS.userRole);

  if (userId !== undefined) context.userId = userId;
  if (userEmail !== undefined) context.userEmail = userEmail;
  if (userName !== undefined) context.userName = userName;
  if (userRole !== undefined) context.userRole = userRole;

  const resourceId = requestContext.getRaw(MASTRA_RESOURCE_ID_KEY);
  if (resourceId !== undefined) context.resourceId = resourceId;

  const threadId = requestContext.getRaw(MASTRA_THREAD_ID_KEY);
  if (threadId !== undefined) context.threadId = threadId;

  return context;
}

/**
 * Emits a structured log through the active tool span. When no tracing context
 * is active, `observe.log` is a no-op, so this is safe to call unconditionally.
 */
export function logToolStart(
  toolId: string,
  observe: ToolLogSink | undefined,
  requestContext?: RequestContext<MalawiContext>,
  input?: unknown,
): void {
  observe?.log('info', 'tool.started', {
    toolId,
    ...toolLogContext(requestContext),
    ...(input === undefined ? {} : { input: summarizeToolData(input) }),
  });
}

export function logToolStage(
  toolId: string,
  stage: string,
  observe: ToolLogSink | undefined,
  requestContext?: RequestContext<MalawiContext>,
  details: Record<string, unknown> = {},
): void {
  observe?.log('info', `tool.${stage}`, {
    toolId,
    ...toolLogContext(requestContext),
    ...details,
  });
}

function errorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { errorName: error.name, errorMessage: error.message.slice(0, 256) };
  }
  return { errorMessage: String(error).slice(0, 256) };
}

/** Adds consistent lifecycle logging to every Mastra tool execution. */
export const createLoggedTool: typeof createTool = (options) => {
  const tool = createTool(options as any) as any;
  const execute = tool.execute;
  if (!execute) return tool;

  tool.execute = async (input: unknown, context: any) => {
    const startedAt = Date.now();
    const cleanInput = compactPayload(input);
    logToolStart(tool.id, context?.observe, context?.requestContext, cleanInput);
    logToolStage(tool.id, 'validated', context?.observe, context?.requestContext, {
      inputKeys:
        cleanInput && typeof cleanInput === 'object' && !Array.isArray(cleanInput)
          ? Object.keys(cleanInput as Record<string, unknown>)
          : [],
    });
    logToolStage(tool.id, 'request.started', context?.observe, context?.requestContext);

    try {
      const output = await execute(input, context);
      logToolStage(tool.id, 'request.completed', context?.observe, context?.requestContext, {
        durationMs: Date.now() - startedAt,
        output: summarizeToolData(output),
      });
      logToolStage(tool.id, 'succeeded', context?.observe, context?.requestContext, {
        durationMs: Date.now() - startedAt,
      });
      return output;
    } catch (error) {
      logToolStage(tool.id, 'failed', context?.observe, context?.requestContext, {
        durationMs: Date.now() - startedAt,
        ...errorDetails(error),
      });
      throw error;
    }
  };

  return tool;
};
