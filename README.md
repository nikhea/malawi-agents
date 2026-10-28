# malawi-agents

Welcome to your new [Mastra](https://mastra.ai/) project! We're excited to see what you'll build.

## Getting Started

Start the development server:

```shell
bun run dev
```

Open [http://localhost:4111](http://localhost:4111) in your browser to access [Mastra Studio](https://mastra.ai/docs/studio/overview). It provides an interactive UI for building and testing your agents, along with a REST API that exposes your Mastra application as a local service. This lets you start building without worrying about integration right away.

You can start editing files inside the `src/mastra` directory. The development server will automatically reload whenever you make changes.

## Malawi Store tools

The project exposes 40 tools built on [`@nikhea/store-sdk`](https://www.npmjs.com/package/@nikhea/store-sdk). Tools are grouped by domain in `src/mastra/tools/` and registered in `src/mastra/index.ts`. Attach them to an agent's `tools` list to let that agent call them.

| File | Tools |
| --- | --- |
| `products.tool.ts` | `list-products`, `get-product`, `create-product`, `update-product`, `delete-product` |
| `categories.tool.ts` | `list-categories`, `get-category`, `create-category`, `update-category`, `delete-category` |
| `variants.tool.ts` | `list-variants`, `create-variant`, `update-variant`, `delete-variant` |
| `cart.tool.ts` | `get-cart`, `add-cart-item`, `set-cart-item-qty`, `remove-cart-item`, `clear-cart` |
| `orders.tool.ts` | `checkout-order`, `list-orders`, `get-order`, `cancel-order` |
| `payments.tool.ts` | `create-payment-intent` |
| `wishlist.tool.ts` | `list-wishlist`, `add-to-wishlist`, `remove-from-wishlist` |
| `reviews.tool.ts` | `get-product-reviews`, `create-review`, `update-review`, `delete-review`, `delete-any-review` |
| `users.tool.ts` | `get-me`, `get-user`, `set-user-role` |
| `inventory.tool.ts` | `get-stock`, `set-stock`, `reserve-stock`, `release-stock`, `confirm-stock` |

Prices are integer tambala: `12500` means K125.00.

Mutating tools set `requireApproval: true`, so an agent pauses for explicit approval before any create, update, delete, checkout, payment, wishlist, review, role, or inventory change. Optional API inputs are passed through `compactPayload`, which drops empty strings instead of forwarding blank query params or body fields.

## Authentication

`malawiAuthMiddleware` protects the agent and workflow API routes:

- `POST /api/agents/:agentId/*`
- `POST /api/workflows/:workflowId/*`

Every request needs a Malawi Store access token:

```http
Authorization: Bearer <malawi-access-token>
```

Optionally send a refresh token so the SDK can renew an expired session:

```http
X-Malawi-Refresh-Token: <malawi-refresh-token>
```

The middleware calls `store.users.me()`, rejects invalid tokens with `401`, and copies the verified user into Mastra's `RequestContext` as `userId`, `userEmail`, `userName`, `userRole`, `accessToken`, and `refreshToken`. It also sets `MASTRA_RESOURCE_ID_KEY`, so memory and threads are scoped to the authenticated user.

Tools declare the same context as `requestContextSchema`, so a tool cannot run without a verified session. Admin-only tools call `requireAdmin()` before touching the API; a customer receives an error instead of an admin request.

### Example

```shell
curl http://localhost:4111/api/agents/<agent-id>/generate \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <malawi-access-token>' \
  -d '{"messages":[{"role":"user","content":"What cooking oil do you sell?"}]}'
```

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
| --- | --- |
| `MALAWI_API_BASE_URL` | Store API base URL, including `/api/v1`. Defaults to `http://localhost:8080/api/v1`. |
| `GROQ_API_KEY` | Model provider key used by the example agent. |

Access and refresh tokens are supplied per request, not stored in the environment.

## Tests

```shell
bun run test        # Vitest, mocks the Store API with fetch stubs
bun run typecheck   # tsc --noEmit
```

## Learn more

To learn more about Mastra, visit our [documentation](https://mastra.ai/docs/). Your bootstrapped project includes example code for [agents](https://mastra.ai/docs/agents/overview), [tools](https://mastra.ai/docs/agents/using-tools), [workflows](https://mastra.ai/docs/workflows/overview), [scorers](https://mastra.ai/docs/evals/overview), and [observability](https://mastra.ai/docs/observability/overview).

If you're new to AI agents, check out our [course](https://mastra.ai/learn) and [YouTube videos](https://youtube.com/@mastra-ai). You can also join our [Discord](https://discord.gg/BTYqqHKUrf) community to get help and share your projects.

## Deploy to the Mastra platform

The [Mastra platform](https://projects.mastra.ai) provides two products for deploying and managing AI applications built with the Mastra framework:

- **Studio**: A hosted visual environment for testing agents, running workflows, and inspecting traces
- **Server**: A production deployment target that runs your Mastra application as an API server

Learn more in the [Mastra platform documentation](https://mastra.ai/docs/mastra-platform/overview).