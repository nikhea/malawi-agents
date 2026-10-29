import { z } from 'zod';
import { createLoggedTool } from '../lib/malawi-logging';
import { malawiContextSchema, requireAdmin } from '../lib/malawi-context';
import { cleanInputObject } from '../lib/malawi-input';
import { createMalawiStore } from '../lib/malawi-store';
import { userSchema } from '../lib/malawi-schemas';

const requestContextSchema = malawiContextSchema;

export const getMeTool = createLoggedTool({
  id: 'get-me',
  description:
    'Get the authenticated customer\'s own account details, including name, email, role, and email verification status.',
  inputSchema: cleanInputObject({}),
  outputSchema: userSchema,
  requestContextSchema,
  execute: async (_input, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    return store.users.me();
  },
});

export const getUserTool = createLoggedTool({
  id: 'get-user',
  description:
    'Get a Malawi Store user by ID. Requires an authenticated session with permission to read that account.',
  inputSchema: cleanInputObject({
    id: z.string().describe('User ID'),
  }),
  outputSchema: userSchema,
  requestContextSchema,
  execute: async ({ id }, { requestContext, observe }) => {
    const store = createMalawiStore(requestContext);
    return store.users.get(id);
  },
});

export const setUserRoleTool = createLoggedTool({
  id: 'set-user-role',
  description:
    'Change a user\'s role to admin or customer. Admin only. Use only when an administrator explicitly requests a role change.',
  requireApproval: true,
  inputSchema: cleanInputObject({
    id: z.string().describe('User ID'),
    role: z.enum(['admin', 'customer']).describe('New role'),
  }),
  outputSchema: userSchema,
  requestContextSchema,
  execute: async ({ id, role }, { requestContext, observe }) => {
    requireAdmin(requestContext);
    const store = createMalawiStore(requestContext);
    return store.users.setRole(id, { role });
  },
});

export const usersTools = {
  getMeTool,
  getUserTool,
  setUserRoleTool,
};
