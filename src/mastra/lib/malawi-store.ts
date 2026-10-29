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
 * Local-development credentials.
 *
 * Setting MALAWI_TOKEN (and optionally MALAWI_REFRESH_TOKEN) in .env lets tools
 * run without a real Authorization header — Studio's tool playground and
 * scratch scripts never pass through the HTTP auth flow. Production builds
 * ignore these values, so a deployed instance still requires a real token.
 */
export function devFallbackCredentials(): {
  token?: string;
  refreshToken?: string;
} {
  if (process.env.NODE_ENV === 'production') return {};
  return {
    token: process.env.MALAWI_TOKEN?.trim() || undefined,
    refreshToken: process.env.MALAWI_REFRESH_TOKEN?.trim() || undefined,
  };
}

/**
 * Builds a Malawi Store client for one tool execution.
 *
 * The client is scoped to the authenticated user by copying the access token
 * from the request context, falling back to the development token when the
 * context has none. Rotated tokens are written back into the context so later
 * tool calls in the same request reuse the fresh session.
 */
export function createMalawiStore(
  requestContext?: RequestContext<MalawiContext>,
): MalawiStore {
  const fallback = devFallbackCredentials();
  return new MalawiStore({
    baseUrl: malawiApiBaseUrl(),
    token: requestContext?.get('accessToken') || fallback.token,
    refreshToken: requestContext?.get('refreshToken') || fallback.refreshToken,
    onTokenChange: ({ token, refreshToken }) => {
      if (!requestContext) return;
      if (token !== undefined) requestContext.set('accessToken', token);
      if (refreshToken !== undefined) {
        requestContext.set('refreshToken', refreshToken);
      }
    },
  });
}
