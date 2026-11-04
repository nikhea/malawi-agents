/**
 * Customer-facing Knowledge pages for the store-wide scope.
 *
 * Every statement here is derived from the store agent's system prompt. Do not
 * add prices, stock, delivery terms, refund windows, or other live or unverified
 * data: those either come from tools or are not published by the store.
 */
export interface StoreKnowledgePage {
  /** Page path below `STORE_KNOWLEDGE_SCOPE`, e.g. `policies/orders-and-payments`. */
  path: string;
  name: string;
  /** Short summary used by keyword search. Keep under 100 tokens. */
  description: string;
  body: string;
}

export const storeKnowledgePages: StoreKnowledgePage[] = [
  {
    path: "store-facts",
    name: "Store facts",
    description:
      "What the Malawi Store assistant can help with, which facts it checks live, and which policies the store has not published.",
    body: `# Malawi Store

This is the shopping assistant for the Malawi Store. It helps signed-in customers
browse products and categories, compare variants, manage a cart and wishlist,
check out, pay, follow orders, and handle their own reviews.

## Checked live for every question

Prices, stock, availability, order status, and payment status come from the store
at the time of the question. This page is not a price list or a stock report.

## Not published to the assistant

The store has not provided delivery, shipping-fee, returns, refund, warranty, or
discount terms. Do not invent them. Say the policy is not available and point the
customer to store support.

## Limits

The assistant helps with shopping and account questions only. It does not give
legal, medical, or financial advice.`,
  },
  {
    path: "policies/orders-and-payments",
    name: "Orders and payments",
    description:
      "How checkout, pending orders, stock reservation, Stripe payment, and payment confirmation work.",
    body: `# Orders and payments

- Checking out creates a pending order and reserves stock for its items. It does
  not take payment.
- Payment is a separate step and starts only when the customer asks to pay.
- A customer can pay through a hosted Stripe checkout link or through the
  storefront's Stripe payment form.
- An order is paid only after the payment provider confirms it. Returning to the
  storefront or seeing a success screen is not proof of payment.
- If stock changed while the customer was shopping, the cart may need adjusting
  before the order can be placed.
- The assistant cannot promise confirmation emails, receipts, tracking updates,
  delivery dates, or follow-ups the store has not confirmed.`,
  },
  {
    path: "policies/cancellations",
    name: "Cancelling an order",
    description:
      "Pending orders can be cancelled. Paid orders cannot be cancelled through the assistant, and no refund policy is published.",
    body: `# Cancelling an order

- A pending order can be cancelled, which releases its stock hold.
- A paid order cannot be cancelled through the assistant.
- No refund or return policy has been published to the assistant. Do not promise
  a refund, exchange, or return window.
- If a customer asks to cancel a paid order or wants a refund, explain that the
  assistant cannot do it and point them to store support.
- Never say an order was cancelled until the cancellation is confirmed.`,
  },
  {
    path: "policies/delivery-and-returns",
    name: "Delivery and returns",
    description:
      "The store has not published delivery, shipping, returns, refund, or warranty terms. Do not estimate them.",
    body: `# Delivery and returns

The Malawi Store has not published delivery, shipping, returns, refund, or
warranty terms to the assistant.

Do not invent or estimate:

- delivery times or dates
- shipping fees or free-shipping thresholds
- tracking availability
- return windows or conditions
- refund amounts or timing

If a customer asks about any of these, say the policy is not available here and
point them to store support. For order status the store does record, use the
order tools instead of guessing.`,
  },
  {
    path: "policies/reviews",
    name: "Reviews",
    description:
      "Customers can create, edit, and delete their own product reviews. Ratings use 1 to 5 stars.",
    body: `# Reviews

- Signed-in customers can write a review for a product, edit their own review,
  and delete their own review.
- Ratings are shown out of 5 stars.
- A customer cannot edit or delete another customer's review through the
  assistant.
- Reviews shown to a customer are the store's published reviews. Quote them as
  written and never invent a rating, reviewer, or date.`,
  },
  {
    path: "help/cart-and-checkout",
    name: "Cart and checkout",
    description:
      "Every cart line needs an exact variant, checkout checks live stock, and checkout creates an unpaid pending order.",
    body: `# Cart and checkout

- Every cart line must point to an exact product variant, such as a size or
  colour. If a line has no variant, ask which variant the customer wants before
  checkout.
- Before checkout, the assistant checks that each exact variant is active, in
  stock, and has at least the quantity in the cart.
- If an item is short on stock, show the item and its current availability, then
  ask whether to reduce the quantity or remove it.
- Checkout creates a pending order and reserves stock. It does not pay for the
  order. Payment is a separate step the customer must ask for.
- If stock runs out during checkout, re-check the cart and variants once, explain
  that availability changed, and ask the customer to adjust the cart or try
  again.`,
  },
  {
    path: "help/account-and-privacy",
    name: "Account and privacy",
    description:
      "Carts, wishlists, orders, and reviews belong to the signed-in customer. The assistant never shows another customer's data or full identifiers.",
    body: `# Account and privacy

- Carts, wishlists, orders, reviews, and profile details belong to the signed-in
  customer. The assistant acts only for that customer.
- The assistant never shows another customer's cart, wishlist, order, review, or
  account details.
- The assistant does not repeat full internal identifiers for orders, payments,
  products, carts, reviews, or accounts. It uses names, statuses, and short
  masked references instead.
- The assistant verifies account details with the store. It does not guess an
  email, address, or profile fact.`,
  },
];
