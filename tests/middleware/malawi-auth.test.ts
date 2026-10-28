import {
  MASTRA_RESOURCE_ID_KEY,
  RequestContext,
} from '@mastra/core/request-context';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MalawiContext } from '../../src/mastra/lib/malawi-context';
import { malawiAuthMiddleware } from '../../src/mastra/server/malawi-auth.middleware';
import { user } from '../fixtures';
import {
  TEST_BASE_URL,
  authorizationOf,
  jsonResponse,
  stubFetch,
} from '../helpers';

type MiddlewareContext = Parameters<typeof malawiAuthMiddleware>[0];
type Next = Parameters<typeof malawiAuthMiddleware>[1];

function fakeContext(options: {
  headers?: Record<string, string>;
  method?: string;
  requestContext?: RequestContext<MalawiContext>;
} = {}) {
  const headers = Object.fromEntries(
    Object.entries(options.headers ?? {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  );
  const requestContext =
    options.requestContext ?? new RequestContext<MalawiContext>();

  const context = {
    req: {
      method: options.method ?? 'POST',
      header: (name: string) => headers[name.toLowerCase()],
    },
    get: (key: string) =>
      key === 'requestContext' ? requestContext : undefined,
    json: (body: unknown, status = 200) => Response.json(body, { status }),
  } as unknown as MiddlewareContext;

  return { context, requestContext };
}

function nextMock(): Next {
  return vi.fn(async () => undefined) as unknown as Next;
}

beforeEach(() => {
  vi.stubEnv('MALAWI_API_BASE_URL', TEST_BASE_URL);
});

describe('malawiAuthMiddleware', () => {
  it('rejects a request without an Authorization header', async () => {
    const fetchMock = stubFetch();
    const { context } = fakeContext();
    const next = nextMock();

    const response = await malawiAuthMiddleware(context, next);

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toMatchObject({
      error: expect.stringContaining('Authorization'),
    });
    expect(next).not.toHaveBeenCalled();
    expect(fetchMock.calls).toHaveLength(0);
  });

  it('rejects a non-Bearer Authorization header', async () => {
    const fetchMock = stubFetch();
    const { context } = fakeContext({
      headers: { Authorization: 'Basic abc' },
    });
    const next = nextMock();

    const response = await malawiAuthMiddleware(context, next);

    expect(response?.status).toBe(401);
    expect(next).not.toHaveBeenCalled();
    expect(fetchMock.calls).toHaveLength(0);
  });

  it('rejects an empty bearer token', async () => {
    const fetchMock = stubFetch();
    const { context } = fakeContext({
      headers: { Authorization: 'Bearer   ' },
    });
    const next = nextMock();

    const response = await malawiAuthMiddleware(context, next);

    expect(response?.status).toBe(401);
    expect(next).not.toHaveBeenCalled();
    expect(fetchMock.calls).toHaveLength(0);
  });

  it('rejects a token the API reports as unauthorized', async () => {
    const { calls } = stubFetch(() =>
      jsonResponse(
        { error: { code: 'UNAUTHORIZED', message: 'expired token' } },
        401,
      ),
    );
    const { context, requestContext } = fakeContext({
      headers: { Authorization: 'Bearer expired-token' },
    });
    const next = nextMock();

    const response = await malawiAuthMiddleware(context, next);

    expect(response?.status).toBe(401);
    await expect(response?.json()).resolves.toMatchObject({
      error: expect.stringContaining('Invalid or expired'),
    });
    expect(calls[0].url).toBe(`${TEST_BASE_URL}/users/me`);
    expect(authorizationOf(calls[0].init)).toBe('Bearer expired-token');
    expect(next).not.toHaveBeenCalled();
    expect(requestContext.get('userId')).toBeUndefined();
  });

  it('returns 502 when the store API cannot be reached', async () => {
    stubFetch(() => {
      throw new Error('connection refused');
    });
    const { context } = fakeContext({
      headers: { Authorization: 'Bearer access-token' },
    });
    const next = nextMock();

    const response = await malawiAuthMiddleware(context, next);

    expect(response?.status).toBe(502);
    await expect(response?.json()).resolves.toMatchObject({
      error: expect.stringContaining('Could not verify'),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('publishes the verified user and token into RequestContext', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: user }));
    const { context, requestContext } = fakeContext({
      headers: {
        Authorization: 'Bearer access-token',
        'X-Malawi-Refresh-Token': 'refresh-token',
      },
    });
    const next = nextMock();

    const response = await malawiAuthMiddleware(context, next);

    expect(response).toBeUndefined();
    expect(calls[0].url).toBe(`${TEST_BASE_URL}/users/me`);
    expect(authorizationOf(calls[0].init)).toBe('Bearer access-token');
    expect(requestContext.get('userId')).toBe(user.id);
    expect(requestContext.get('userEmail')).toBe(user.email);
    expect(requestContext.get('userName')).toBe(user.name);
    expect(requestContext.get('userRole')).toBe(user.role);
    expect(requestContext.get('accessToken')).toBe('access-token');
    expect(requestContext.get('refreshToken')).toBe('refresh-token');
    expect(requestContext.getRaw(MASTRA_RESOURCE_ID_KEY)).toBe(user.id);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('lets CORS preflight requests through without authentication', async () => {
    const fetchMock = stubFetch();
    const { context } = fakeContext({ method: 'OPTIONS' });
    const next = nextMock();

    const response = await malawiAuthMiddleware(context, next);

    expect(response).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(fetchMock.calls).toHaveLength(0);
  });
});
