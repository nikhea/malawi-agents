import {
  MASTRA_RESOURCE_ID_KEY,
  MASTRA_THREAD_ID_KEY,
} from '@mastra/core/request-context';
import type { RequestContext } from '@mastra/core/request-context';
import { MALAWI_CONTEXT_KEYS } from './malawi-context';
import type { MalawiContext } from './malawi-context';

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
): void {
  observe?.log('info', 'tool.started', {
    toolId,
    ...toolLogContext(requestContext),
  });
}
