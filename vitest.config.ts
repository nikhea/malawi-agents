import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Importing the store agent builds Mastra storage. Tests never connect, but
    // the constructors still need a URL and a DuckDB path.
    env: {
      MASTRA_DATABASE_URL:
        process.env.MASTRA_DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5432/malawi_test',
      DUCKDB_PATH: process.env.DUCKDB_PATH ?? ':memory:',
    },
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
});
