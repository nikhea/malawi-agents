import type { RequestContext } from '@mastra/core/request-context';
import { z } from 'zod';

/**
 * Request-scoped identity established by the Malawi auth middleware.
 *
 * Tools declare this schema as `requestContextSchema`, so Mastra validates the
 * context before `execute()` runs.
 */
export const malawiContextSchema = z.object({
  userId: z.string().describe('Authenticated Malawi Store user ID'),
  userEmail: z.string().describe('Authenticated user email address'),
  userName: z.string().describe('Authenticated user display name'),
  userRole: z.enum(['admin', 'customer']).describe('Authenticated user role'),
  accessToken: z.string().describe('Bearer token used for Malawi Store API calls'),
  refreshToken: z
    .string()
    .optional()
    .describe('Optional refresh token for automatic session renewal'),
});

export type MalawiContext = z.infer<typeof malawiContextSchema>;

/** Canonical request-context keys used by the middleware and every tool. */
export const MALAWI_CONTEXT_KEYS = {
  userId: 'userId',
  userEmail: 'userEmail',
  userName: 'userName',
  userRole: 'userRole',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
} as const;

/**
 * Reads the authenticated user from the request context.
 * Returns `undefined` when the middleware has not populated it.
 */
export function getMalawiContext(
  requestContext?: RequestContext<MalawiContext>,
): MalawiContext | undefined {
  if (!requestContext) return undefined;

  const userId = requestContext.get('userId');
  const accessToken = requestContext.get('accessToken');
  if (!userId || !accessToken) return undefined;

  return {
    userId,
    userEmail: requestContext.get('userEmail'),
    userName: requestContext.get('userName'),
    userRole: requestContext.get('userRole'),
    accessToken,
    refreshToken: requestContext.get('refreshToken'),
  };
}

/**
 * Throws when the authenticated user is not an admin.
 * Use this inside admin-only tools; it enforces authorization server-side
 * rather than relying on the model to choose the right tool.
 */
export function requireAdmin(
  requestContext?: RequestContext<MalawiContext>,
): void {
  if (requestContext?.get('userRole') !== 'admin') {
    throw new Error(
      'This tool requires an admin account. The authenticated user is not an admin.',
    );
  }
}
