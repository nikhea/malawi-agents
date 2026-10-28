import { RequestContext } from '@mastra/core/request-context';
import { expect, vi } from 'vitest';
import type { MalawiContext } from '../src/mastra/lib/malawi-context';

export const TEST_BASE_URL = 'https://store.test/api/v1';

export interface RecordedCall {
  url: string;
  init: RequestInit;
}

export type FetchHandler = (
  url: string,
  init: RequestInit,
  call: number,
) => Response | Promise<Response>;

export function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

export function emptyResponse(status = 204): Response {
  return new Response(null, { status });
}

export function recordingFetch(handler?: FetchHandler): {
  fetch: ReturnType<typeof vi.fn>;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];

  const fetchImpl = vi.fn(
    async (input: string | URL | Request, init: RequestInit = {}) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      calls.push({ url, init });
      return handler
        ? handler(url, init, calls.length)
        : jsonResponse({ data: null });
    },
  );

  return { fetch: fetchImpl, calls };
}

/** Installs a recording fetch mock as the global fetch implementation. */
export function stubFetch(handler?: FetchHandler): {
  fetch: ReturnType<typeof vi.fn>;
  calls: RecordedCall[];
} {
  const recorded = recordingFetch(handler);
  vi.stubGlobal('fetch', recorded.fetch);
  return recorded;
}

export function context(
  overrides: Partial<MalawiContext> = {},
): RequestContext<MalawiContext> {
  const values: MalawiContext = {
    userId: 'user-1',
    userEmail: 'aisha@example.mw',
    userName: 'Aisha Banda',
    userRole: 'customer',
    accessToken: 'access-token',
    ...overrides,
  };

  const requestContext = new RequestContext<MalawiContext>();
  requestContext.set('userId', values.userId);
  requestContext.set('userEmail', values.userEmail);
  requestContext.set('userName', values.userName);
  requestContext.set('userRole', values.userRole);
  requestContext.set('accessToken', values.accessToken);
  if (values.refreshToken !== undefined) {
    requestContext.set('refreshToken', values.refreshToken);
  }

  return requestContext;
}

export function adminContext(
  overrides: Partial<MalawiContext> = {},
): RequestContext<MalawiContext> {
  return context({ userRole: 'admin', ...overrides });
}

type ExecutableTool = {
  execute?: (...args: any[]) => unknown;
};

export async function executeTool(
  tool: ExecutableTool,
  input: unknown,
  requestContext: RequestContext<MalawiContext>,
): Promise<unknown> {
  if (!tool.execute) throw new Error('Tool has no execute function');
  return tool.execute(input, { requestContext });
}

type ParseableSchema = {
  safeParse: (value: unknown) => { success: boolean };
};

/** Asserts that a tool result satisfies the tool's declared output schema. */
export function expectValidOutput(schema: unknown, value: unknown): void {
  const parseable = schema as ParseableSchema | undefined;
  if (!parseable?.safeParse) throw new Error('Tool has no output schema');
  expect(parseable.safeParse(value).success).toBe(true);
}

/**
 * Asserts that a tool rejects an unauthenticated request-context and never
 * reaches the Store API.
 */
export async function expectRequestContextRequired(
  tool: ExecutableTool,
  input: unknown,
): Promise<void> {
  const result = (await executeTool(
    tool,
    input,
    new RequestContext<MalawiContext>(),
  )) as { error?: boolean; message?: string };

  expect(result.error).toBe(true);
  expect(result.message).toContain('Request context validation failed');
}

export function headersOf(init: RequestInit): Record<string, string> {
  return (init.headers ?? {}) as Record<string, string>;
}

export function authorizationOf(init: RequestInit): string | undefined {
  return Object.entries(headersOf(init)).find(
    ([key]) => key.toLowerCase() === 'authorization',
  )?.[1];
}

export function bodyOf(init: RequestInit): unknown {
  return typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
}

export function apiUrl(path: string): string {
  return `${TEST_BASE_URL}${path}`;
}
