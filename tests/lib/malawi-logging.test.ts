import { describe, expect, it, vi } from 'vitest';
import { MASTRA_RESOURCE_ID_KEY } from '@mastra/core/request-context';
import { z } from 'zod';
import {
  OBSERVABILITY_REQUEST_CONTEXT_KEYS,
  createLoggedTool,
  logToolStart,
  toolLogContext,
} from '../../src/mastra/lib/malawi-logging';
import { context } from '../helpers';

describe('tool observability logging', () => {
  it('exports the request-context keys copied onto spans', () => {
    expect(OBSERVABILITY_REQUEST_CONTEXT_KEYS).toEqual(
      expect.arrayContaining([
        'userId',
        'userEmail',
        'userName',
        'userRole',
        MASTRA_RESOURCE_ID_KEY,
      ]),
    );
  });

  it('includes authenticated user details but never credentials', () => {
    const requestContext = context({ refreshToken: 'refresh-token' });
    requestContext.setRaw(MASTRA_RESOURCE_ID_KEY, 'user-1');

    const details = toolLogContext(requestContext);

    expect(details).toMatchObject({
      userId: 'user-1',
      userEmail: 'aisha@example.mw',
      userName: 'Aisha Banda',
      userRole: 'customer',
      resourceId: 'user-1',
    });
    expect(details).not.toHaveProperty('accessToken');
    expect(details).not.toHaveProperty('refreshToken');
  });

  it('logs a structured start event through the tool observe sink', () => {
    const requestContext = context();
    requestContext.setRaw(MASTRA_RESOURCE_ID_KEY, 'user-1');
    const observe = { log: vi.fn() };

    logToolStart('list-products', observe, requestContext);

    expect(observe.log).toHaveBeenCalledWith('info', 'tool.started', {
      toolId: 'list-products',
      userId: 'user-1',
      userEmail: 'aisha@example.mw',
      userName: 'Aisha Banda',
      userRole: 'customer',
      resourceId: 'user-1',
    });
  });

  it('does nothing when no observability sink is active', () => {
    expect(() =>
      logToolStart('list-products', undefined, context()),
    ).not.toThrow();
  });

  it('logs validated, request, success, and failure stages with redaction', async () => {
    const observe = { log: vi.fn() };
    const tool = createLoggedTool({
      id: 'logging-fixture',
      description: 'logging fixture',
      inputSchema: z.object({ token: z.string(), value: z.string() }),
      outputSchema: z.object({ ok: z.boolean() }),
      execute: async () => ({ ok: true }),
    });

    await tool.execute?.(
      { token: 'do-not-log', value: 'visible' },
      { observe, requestContext: context() } as any,
    );

    const events = observe.log.mock.calls.map(([, event]) => event);
    expect(events).toEqual([
      'tool.started',
      'tool.validated',
      'tool.request.started',
      'tool.request.completed',
      'tool.succeeded',
    ]);
    expect(observe.log.mock.calls[0][2]).toMatchObject({
      input: { token: '[REDACTED]', value: 'visible' },
    });
  });
});
