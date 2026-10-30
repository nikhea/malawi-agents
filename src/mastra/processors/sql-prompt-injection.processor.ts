import { RegexFilterProcessor, RegexRule } from "@mastra/core/processors";

const rules: RegexRule[] = [
  // ── Secrets ──────────────────────────────────────────────
  {
    // KEY=value / API_KEY: value  (uppercase env-style names only, no `i`)
    name: "env-style-secrets",
    pattern:
      /\b[A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIAL)[A-Z0-9_]*\s*[=:]\s*["']?[^\s"']{6,}["']?/g,
    replacement: "[REDACTED_SECRET]",
  },
  {
    // user:pass@host in connection strings (postgres://, redis://, https://)
    name: "url-with-credentials",
    pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s@]+@[^\s]+/gi,
    replacement: "[REDACTED_URL]",
  },
  {
    name: "bearer-token",
    pattern: /\bBearer\s+[A-Za-z0-9\-._~+/]{20,}=*/g,
    replacement: "Bearer [REDACTED_TOKEN]",
  },
  {
    // sk-..., sk-proj-..., ghp_..., xoxb-...
    name: "provider-api-key",
    pattern:
      /\b(?:sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g,
    replacement: "[REDACTED_API_KEY]",
  },

  // ── SQL: injection patterns (most specific first) ────────
  {
    name: "sql-union-injection",
    pattern: /\bunion\s+(?:all\s+)?select\b/gi,
    replacement: "[SQL_REDACTED]",
  },
  {
    name: "sql-stacked-queries",
    pattern: /;\s*(?:select|insert|update|delete|drop|alter|truncate)\b/gi,
    replacement: "[SQL_REDACTED]",
  },
  {
    name: "sql-tautology",
    // ' OR 1=1 / " AND '1'='1  — must follow a quote
    pattern: /['"]\s*(?:or|and)\s+['"]?\w+['"]?\s*=\s*['"]?\w+/gi,
    replacement: "[SQL_REDACTED]",
  },
  {
    name: "sql-time-based-injection",
    pattern: /\b(?:pg_sleep|sleep|benchmark|waitfor\s+delay)\s*\(/gi,
    replacement: "[SQL_REDACTED]",
  },
  {
    // comment used to truncate a query: quote/semicolon/space then -- or /* */
    name: "sql-comment-bypass",
    pattern: /(?:['";)]\s*--(?:\s|$)|\/\*[\s\S]*?\*\/)/g,
    replacement: "[SQL_REDACTED]",
  },
  {
    // URL-encoded quote / equals / comment only when paired with a SQL keyword nearby
    name: "sql-encoded-attack",
    pattern:
      /(?:%27|%22|%3D|%2D%2D)[^\s&]{0,40}\b(?:or|and|union|select|drop)\b/gi,
    replacement: "[SQL_REDACTED]",
  },
  {
    name: "sql-in-url-params",
    pattern:
      /[?&](?:id|user|query|search)=[^&\s]*\b(?:select|union|drop|insert|delete)\b[^&\s]*/gi,
    replacement: "[SQL_REDACTED]",
  },

  // ── SQL: actual statements (keyword + required companion) ─
  {
    name: "sql-destructive-commands",
    pattern:
      /\b(?:drop|truncate|alter|create)\s+(?:table|database|schema|index)\b[^;]*/gi,
    replacement: "[SQL_REDACTED]",
  },
  {
    name: "sql-query",
    pattern:
      /\b(?:select\s+[\w*,.\s"`]+?\s+from\s+\S+|insert\s+into\s+\S+|update\s+\S+\s+set\s+[^;]+|delete\s+from\s+\S+)[^;]*/gi,
    replacement: "[SQL_REDACTED]",
  },
];

export const SQLRegexFiliter = new RegexFilterProcessor({
  presets: [
    "pii",
    "secrets",
    "urls",
  ],
  strategy: "block",
  phase: "input",
  rules,
});
