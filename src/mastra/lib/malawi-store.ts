import type { RequestContext } from '@mastra/core/request-context';
import { MalawiStore } from '@malawistore/store-sdk';
import type { MalawiContext } from './malawi-context';

export const DEFAULT_MALAWI_API_BASE_URL = 'http://localhost:8080/api/v1';

/** Resolves the Malawi Store API base URL from the environment. */
export function malawiApiBaseUrl(): string {
  const configured = process.env.MALAWI_API_BASE_URL?.trim();
  return configured || DEFAULT_MALAWI_API_BASE_URL;
}

/**
 * Builds a Malawi Store client for one tool execution.
 *
 * The client is scoped to the authenticated user by copying the access token
 * from the request context. Rotated tokens are written back into the context so
 * later tool calls in the same request reuse the fresh session.
 */
export function createMalawiStore(
  requestContext?: RequestContext<MalawiContext>,
): MalawiStore {
  return new MalawiStore({
    baseUrl: malawiApiBaseUrl(),
    token: requestContext?.get('accessToken'),
    refreshToken: requestContext?.get('refreshToken'),
    onTokenChange: ({ token, refreshToken }) => {
      if (!requestContext) return;
      if (token !== undefined) requestContext.set('accessToken', token);
      if (refreshToken !== undefined) {
        requestContext.set('refreshToken', refreshToken);
      }
    },
  });
}
