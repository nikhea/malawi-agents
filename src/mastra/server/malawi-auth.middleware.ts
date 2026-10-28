import {
  MASTRA_RESOURCE_ID_KEY,
  type RequestContext,
} from '@mastra/core/request-context';
import type { MiddlewareHandler } from '@mastra/core/server';
import { MalawiStore, isMalawiStoreError } from '@malawistore/store-sdk';
import type { MalawiContext } from '../lib/malawi-context';
import { malawiApiBaseUrl } from '../lib/malawi-store';

const BEARER_PREFIX = 'Bearer ';

/**
 * Authenticates Mastra agent and workflow requests with a Malawi Store access
 * token, then publishes the user and token through Mastra's RequestContext.
 *
 * Tools read the same keys and build a per-request `MalawiStore` client, so
 * every API call runs as the authenticated user.
 */
export const malawiAuthMiddleware: MiddlewareHandler = async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    return next();
  }

  const authorization = c.req.header('Authorization');
  if (!authorization?.startsWith(BEARER_PREFIX)) {
    return c.json(
      {
        error:
          'Missing or invalid Authorization header. Send Authorization: Bearer <malawi-access-token>.',
      },
      401,
    );
  }

  const accessToken = authorization.slice(BEARER_PREFIX.length).trim();
  if (!accessToken) {
    return c.json(
      {
        error:
          'Missing or invalid Authorization header. Send Authorization: Bearer <malawi-access-token>.',
      },
      401,
    );
  }

  const requestContext = c.get('requestContext') as
    | RequestContext<MalawiContext>
    | undefined;

  if (!requestContext) {
    return c.json(
      { error: 'Mastra request context is unavailable for this request.' },
      500,
    );
  }

  const refreshToken =
    c.req.header('X-Malawi-Refresh-Token')?.trim() || undefined;

  const store = new MalawiStore({
    baseUrl: malawiApiBaseUrl(),
    token: accessToken,
    refreshToken,
  });

  let user;
  try {
    user = await store.users.me();
  } catch (error) {
    if (isMalawiStoreError(error) && error.code === 'UNAUTHORIZED') {
      return c.json({ error: 'Invalid or expired Malawi access token.' }, 401);
    }

    return c.json(
      { error: 'Could not verify the Malawi session with the store API.' },
      502,
    );
  }

  requestContext.set('userId', user.id);
  requestContext.set('userEmail', user.email);
  requestContext.set('userName', user.name);
  requestContext.set('userRole', user.role);
  requestContext.set('accessToken', accessToken);
  if (refreshToken !== undefined) {
    requestContext.set('refreshToken', refreshToken);
  }

  // Scope Mastra memory and thread access to the authenticated user.
  requestContext.setRaw(MASTRA_RESOURCE_ID_KEY, user.id);

  await next();
};
