import type { DatasetRequestContext } from "./types";

/**
 * Shared fixture identities and IDs.
 *
 * Product, category, cart, and order records mirror the live storefront
 * snapshot so an expected tool argument points at a real row. Prices are
 * integer USD cents: 3824 means $38.24.
 *
 * Pending and foreign orders are explicit fixtures because the snapshot only
 * contains paid and cancelled orders for this customer.
 */

/**
 * Live customer token, read at import time.
 *
 * `MALAWI_TOKEN` is the same token local scripts use. It is a temporary
 * session token, so reseed the datasets after refreshing it in `.env`.
 */
export const ACCESS_TOKEN =
  process.env.MALAWI_TOKEN ?? process.env.MALAWI_ACCESS_TOKEN ?? "";

/** Admin token for admin-only tools. Falls back to the customer token, which
 * will be rejected by requireAdmin unless MALAWI_ADMIN_TOKEN is set. */
export const ADMIN_ACCESS_TOKEN =
  process.env.MALAWI_ADMIN_TOKEN ?? ACCESS_TOKEN;

export const customerContext: DatasetRequestContext = {
  userId: "1c6a3ea5-fba3-4707-b7b4-b146362916d2",
  userEmail: "shadrach.hezekyah@forliion.com",
  userName: "shadrach hezekyah",
  userRole: "customer",
  accessToken: ACCESS_TOKEN,
};

/**
 * Placeholder admin identity. Replace with a real admin account and set
 * MALAWI_ADMIN_TOKEN before running admin experiments against live storage.
 */
export const adminContext: DatasetRequestContext = {
  userId: "user_admin_fixture",
  userEmail: "admin@malawistore.mw",
  userName: "Store Admin",
  userRole: "admin",
  accessToken: ADMIN_ACCESS_TOKEN,
};

/** Second customer used only for cross-account scenarios. */
export const secondCustomerContext: DatasetRequestContext = {
  userId: "user_cust_002",
  userEmail: "madalitso.zimba@example.mw",
  userName: "Madalitso Zimba",
  userRole: "customer",
  accessToken: ACCESS_TOKEN,
};

export const IDs = {
  cart: {
    id: "28497084-27e4-4597-9694-db7a4a0cf6dd",
    tunicSLine: "3c60fce9-3c54-48e1-8fcf-3355b8cce6ac",
    shirtXsLine: "6f76ad1b-a218-4451-9514-20db065e0e56",
  },
  products: {
    tunic: "a96d37af-ef9f-4a25-9593-a644a51b7815",
    crossbody: "78453afa-f87d-46b3-ba8b-7f36e455232d",
    midiDress: "ac27b281-a6e2-431c-968f-3247c0416d62",
    bomber: "cdd56269-0f83-45b4-9a8c-8f3be4d432a3",
    sundress: "4d0f5d0e-4760-402f-b635-47269f6be8bb",
    poplinShirt: "63bc9a7a-2299-4db5-8096-cf6477623682",
    missing: "00000000-0000-4000-8000-000000000000",
  },
  categories: {
    accessories: "1ad67315-95c7-400d-9af0-85a43f93d1bc",
    bottoms: "edc87af0-a359-4f4d-9f88-fba59495252d",
    dresses: "2f11dedb-ec0d-4cbf-9a77-fc601e84b316",
    outerwear: "0bbfb033-0407-4d3e-97b8-535d91d28ad3",
    tops: "451d8390-86e9-4658-b283-c0a8b8d73afd",
    missing: "00000000-0000-4000-8000-000000000001",
  },
  variants: {
    tunicS: "864d167b-db2f-4b56-a1d3-1d299f5debdc",
    tunicXl: "112d912a-4f6d-4a96-a7e3-885cecb86515",
    tunicL: "835de05f-92b6-4a2a-8c4c-b67ff730efd0",
    shirtXs: "cd873deb-a205-47b2-8f8f-31613a642cb3",
    crossbodyOneSize: "618b6911-34dd-4b57-9ba7-a031560742cb",
    bomberXs: "6fbb96bc-549e-4ab5-8a11-c696e36c3a02",
    missing: "00000000-0000-4000-8000-000000000002",
  },
  orders: {
    paid: "eb21a863-4675-470b-91d8-bfabb7b13404",
    paidMulti: "497e15e7-83f3-46ad-9fcb-4ccb28132bb4",
    paidMixed: "75714588-8144-4925-a970-049beafa7494",
    cancelled: "d7e804f2-589c-478d-b27e-7a7ccb959956",
    cancelledSecond: "cbd940ee-97ce-4417-ad84-1434c5e378fe",
    cancelledThird: "a3f03d8d-3d04-4fea-bb16-6bd32e29f5bd",
    /** Fixture: a pending order for checkout/cancel scenarios. */
    pending: "2b6f9c4a-1d7e-4f3a-9c58-6e0b8d2a4f17",
    /** Fixture: an order owned by another customer. */
    foreign: "5a1c7e9b-3f2d-4a68-b0c9-8d4e1f7a2b63",
    missing: "00000000-0000-4000-8000-000000000003",
  },
  reviews: {
    own: "rev_5001",
    anotherCustomer: "rev_5002",
    missing: "rev_9999",
  },
  users: {
    other: "user_cust_002",
    admin: "user_admin_fixture",
    missing: "user_99999",
  },
} as const;

export const SLUGS = {
  tunic: "balaka-embroidered-tunic",
  poplinShirt: "thyolo-oversized-poplin-shirt",
  midiDress: "blantyre-puff-sleeve-midi-dress",
  dressesCategory: "dresses",
  outerwearCategory: "outerwear",
} as const;

export const SKUS = {
  tunicS: "balaka-embroidered-tunic-s",
  tunicL: "balaka-embroidered-tunic-l",
  tunicM: "balaka-embroidered-tunic-m",
  shirtXs: "thyolo-oversized-poplin-shirt-xs",
} as const;
