# Evaluation datasets

Evaluation sets for the Malawi fashion storefront, built from the live catalog
snapshot: Balaka Embroidered Tunic, Blantyre Midi Dress, Blantyre Satin Bomber,
Cape Maclear Sundress, Thyolo Poplin Shirt, and the Blantyre Crossbody Bag.
Prices are integer USD cents (3824 means $38.24). Two Mastra datasets per
registered store entity:

| Dataset name               | Items | Ground truth | Purpose                                                     |
| -------------------------- | ----- | ------------ | ----------------------------------------------------------- |
| `store-<entity>-labeled`   | 10    | Yes          | Score tool choice, tool arguments, and reply content        |
| `store-<entity>-unlabeled` | 10    | No           | Capture live behaviour, triage failures, grow ground truth  |

Entities: `products`, `categories`, `variants`, `cart`, `orders`, `payments`,
`wishlist`, `reviews`, `users`, `inventory`. That is 20 datasets and 200 items.

Every dataset is created with `targetType: "agent"` and `targetIds: ["store-agent"]`,
so Studio can start an experiment against the store agent in one click.

## Item shapes

Labeled and unlabeled items share the same input schema, so an unlabeled item can
be promoted to the labeled split without reshaping it.

```ts
// input
{
  prompt: string;                       // what the customer or admin typed
  requestContext: {                     // matches malawiContextSchema
    userId: string;
    userEmail: string;
    userName: string;
    userRole: "admin" | "customer";
    accessToken: string;
  };
}
```

Fixture identities come from `fixtures.ts`:

- **Customer**: the live account `1c6a3ea5-fba3-4707-b7b4-b146362916d2`
  (`shadrach.hezekyah@forliion.com`). Its access token is read from
  `MALAWI_TOKEN` (falling back to `MALAWI_ACCESS_TOKEN`) at seed time.
- **Admin**: a placeholder `user_admin_fixture`. Set `MALAWI_ADMIN_TOKEN` to a
  real admin session before running admin experiments against live storage.

The token is copied into each dataset item's `requestContext`, so dataset
storage holds a session token. Reseed after refreshing `MALAWI_TOKEN` and
treat the dataset tables with the same care as `.env`.

```ts
// groundTruth (labeled only)
{
  outcome: "tool-call" | "answer" | "clarify" | "refuse";
  expectedToolCalls: Array<{
    tool: string;                       // registered Mastra tool ID
    args: Record<string, unknown>;      // exact expected arguments
    why?: string;                       // reviewer note
  }>;
  responseMustInclude: string[];        // case-insensitive facts the reply must contain
  mustNotCall: string[];                // tools that must never run
  notes?: string;                       // partial-credit guidance
}
```

`requestContext` is duplicated on the top-level item so experiments can inject it
without parsing `input`.

Unlabeled items carry review metadata only (`coverageArea`, `style`, `language`).
No expected tool or answer is stored.

## Coverage

Each labeled split covers the entity's full surface: every registered tool, the
primary filters and sorts, pagination, argument validation, authorization, and
business rules. Each unlabeled split adds an extra scenario per tool plus edge
cases: typos, underspecified prompts, policy questions, multilingual phrasing,
and capability gaps.

## Seeding

Datasets live in storage, not in the Mastra config, so they are created by a
script:

```bash
bun src/mastra/datasets/seed.ts                  # create missing datasets, top up items
bun src/mastra/datasets/seed.ts --reset          # delete and recreate all datasets
bun src/mastra/datasets/seed.ts --entity=cart    # one entity, repeatable
```

The script imports `src/mastra/index.ts`, so it uses the same Postgres and Redis
configuration as `bun run dev`. It is safe to rerun: datasets are matched by name
and items use stable `externalId` values. Use `--reset` after editing prompts or
ground truth.

## Which split to use

- **Labeled**: regression checks. Run an experiment before and after a prompt,
  model, or tool change and compare scores.
- **Unlabeled**: exploration. Run the agent over these prompts to find failures,
  then copy a failing prompt into the labeled file with a reviewed ground truth.

## Adding a scenario

1. Pick the entity file, for example `products.datasets.ts`.
2. Add a `labeled(...)` or `unlabeled(...)` entry. Use IDs from `fixtures.ts`.
3. Keep prices in integer USD cents ($38.24 = 3824) and quote replies in dollars.
4. Run `bun src/mastra/datasets/seed.ts --entity=products --reset`.
5. Open Studio -> Datasets and confirm 10 items in each split.
