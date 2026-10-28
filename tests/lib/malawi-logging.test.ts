import { describe, expect, it, vi } from 'vitest';
import { MASTRA_RESOURCE_ID_KEY } from '@mastra/core/request-context';
import {
  OBSERVABILITY_REQUEST_CONTEXT_KEYS,
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
});
