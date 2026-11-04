import type {
  KnowledgeUpsertPageInput,
  KnowledgeUpsertPageResult,
} from '@mastra/core/knowledge';
import { describe, expect, it } from 'vitest';
import { storeKnowledgePages } from '../../src/mastra/Knowledge/store.pages';
import {
  STORE_FACTS_PAGE,
  STORE_KNOWLEDGE_SCOPE,
  STORE_KNOWLEDGE_SCOPE_PATTERN,
  storeKnowledgeScopes,
} from '../../src/mastra/Knowledge/store.scopes';
import {
  seedStoreKnowledge,
  type StoreKnowledgeWriter,
} from '../../src/mastra/Knowledge/seed.store-knowledge';

describe('store knowledge scopes', () => {
  const storeScope =
    storeKnowledgeScopes[STORE_KNOWLEDGE_SCOPE_PATTERN];

  it('declares a store scope pattern that binds the store address', () => {
    expect(storeScope).toBeDefined();
    expect(storeScope.description).toBeTruthy();
    expect(storeScope.displayLabel).toBe('Malawi Store');
    expect(STORE_KNOWLEDGE_SCOPE).toBe('store:malawi');
  });

  it('lets a run holding the scope read but not write', () => {
    expect(storeScope.access).toEqual([{ principal: 'self', role: 'viewer' }]);
  });

  it('pins the store facts page into every run', () => {
    expect(storeScope.pinnedContext).toEqual([
      `${STORE_KNOWLEDGE_SCOPE_PATTERN}#${STORE_FACTS_PAGE}`,
    ]);
    expect(storeScope.pages?.map((page) => page.key)).toContain(
      STORE_FACTS_PAGE,
    );
  });

  it('keeps Memory identity scopes and no unused tenant scope', () => {
    expect(Object.keys(storeKnowledgeScopes).sort()).toEqual(
      [
        STORE_KNOWLEDGE_SCOPE_PATTERN,
        'resource:$resourceId',
        'thread:$threadId',
      ].sort(),
    );
  });
});

describe('store knowledge pages', () => {
  it('uses unique, valid paths', () => {
    const paths = storeKnowledgePages.map((page) => page.path);

    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path).toMatch(/^[a-z0-9][a-z0-9/-]*$/);
      expect(path).not.toContain('#');
      expect(path).not.toContain('%');
    }
  });

  it('includes the pinned store facts page', () => {
    expect(storeKnowledgePages.map((page) => page.path)).toContain(
      STORE_FACTS_PAGE,
    );
  });

  it('has a name, description, and body for every page', () => {
    for (const page of storeKnowledgePages) {
      expect(page.name.trim()).not.toBe('');
      expect(page.description.trim()).not.toBe('');
      expect(page.body.trim().length).toBeGreaterThan(80);
    }
  });

  it('does not leak internal tool names', () => {
    const body = storeKnowledgePages.map((page) => page.body).join('\n');

    expect(body).not.toMatch(/checkout-order|create-checkout-session|get-cart/);
    expect(body).not.toMatch(/knowledge_search|knowledge_read/);
  });
});

describe('seedStoreKnowledge', () => {
  it('writes every page to the store scope as the host', async () => {
    const writes: KnowledgeUpsertPageInput[] = [];
    const writer: StoreKnowledgeWriter = {
      async upsertPage(input) {
        writes.push(input);
        return {
          page: { id: input.path },
          status: writes.length === 1 ? 'created' : 'unchanged',
        } as unknown as KnowledgeUpsertPageResult;
      },
    };

    const results = await seedStoreKnowledge(writer);

    expect(writes).toHaveLength(storeKnowledgePages.length);
    expect(writes.every((write) => write.scope === STORE_KNOWLEDGE_SCOPE)).toBe(
      true,
    );
    expect(writes.every((write) => write.author === 'host')).toBe(true);
    expect(results[0]).toEqual({
      path: storeKnowledgePages[0].path,
      status: 'created',
    });
    expect(results[1]).toEqual({
      path: storeKnowledgePages[1].path,
      status: 'unchanged',
    });
  });
});
