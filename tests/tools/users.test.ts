import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getMeTool,
  getUserTool,
  setUserRoleTool,
} from '../../src/mastra/tools/users.tool';
import { user } from '../fixtures';
import {
  TEST_BASE_URL,
  apiUrl,
  authorizationOf,
  bodyOf,
  context,
  executeTool,
  jsonResponse,
  stubFetch,
} from '../helpers';

beforeEach(() => {
  vi.stubEnv('MALAWI_API_BASE_URL', TEST_BASE_URL);
});

describe('getMeTool', () => {
  it('gets the authenticated account', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: user }));

    const result = await executeTool(getMeTool, {}, context());

    expect(result).toEqual(user);
    expect(calls[0].url).toBe(apiUrl('/users/me'));
    expect(authorizationOf(calls[0].init)).toBe('Bearer access-token');
  });
});

describe('getUserTool', () => {
  it('gets a user by ID', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: user }));

    const result = await executeTool(getUserTool, { id: 'user-1' }, context());

    expect(result).toEqual(user);
    expect(calls[0].url).toBe(apiUrl('/users/user-1'));
  });
});

describe('setUserRoleTool', () => {
  it('sets a user role as an admin', async () => {
    const admin = { ...user, role: 'admin' as const };
    const { calls } = stubFetch(() => jsonResponse({ data: admin }));

    const result = await executeTool(
      setUserRoleTool,
      { id: 'user-1', role: 'admin' },
      context({ userRole: 'admin' }),
    );

    expect(result).toEqual(admin);
    expect(calls[0].url).toBe(apiUrl('/admin/users/user-1/role'));
    expect(calls[0].init.method).toBe('PATCH');
    expect(bodyOf(calls[0].init)).toEqual({ role: 'admin' });
  });

  it('rejects a customer before calling the API', async () => {
    const { calls } = stubFetch(() => jsonResponse({ data: user }));

    await expect(
      executeTool(
        setUserRoleTool,
        { id: 'user-1', role: 'admin' },
        context(),
      ),
    ).rejects.toThrow(/admin/i);

    expect(calls).toHaveLength(0);
  });
});
