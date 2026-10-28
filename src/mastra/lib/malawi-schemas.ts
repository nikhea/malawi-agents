import { z } from 'zod';

/**
 * Output schemas shared by the Malawi Store tools.
 *
 * The API may add fields over time, so the object schemas are loose: unknown
 * fields pass validation instead of turning a successful call into a tool
 * error.
 */

const optionalString = z.string().nullish();

export const productSchema = z.object({
  id: z.string(),
  category_id: optionalString,
  category_name: optionalString,
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price_cents: z.number().int(),
  currency: z.string(),
  image_url: optionalString,
  is_active: z.boolean(),
  created_at: z.string(),
});

export const productVariantViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  price_cents: z.number().int(),
  is_active: z.boolean(),
});

export const productDetailSchema = z.object({
  product: productSchema,
  variants: z.array(productVariantViewSchema),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  parent_id: optionalString,
  image_url: optionalString,
  created_at: z.string(),
});

export const variantSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  name: z.string(),
  sku: z.string(),
  price_cents: z.number().int(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export const cartLineSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  variant_id: optionalString,
  name: z.string(),
  sku: optionalString,
  unit_price_cents: z.number().int(),
  currency: z.string(),
  qty: z.number().int(),
  line_total_cents: z.number().int(),
});

export const cartSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  items: z.array(cartLineSchema),
  subtotal_cents: z.number().int(),
  currency: z.string(),
  updated_at: z.string(),
});

export const orderLineSchema = z.object({
  product_id: z.string(),
  variant_id: optionalString,
  name: z.string(),
  sku: optionalString,
  unit_price_cents: z.number().int(),
  qty: z.number().int(),
  line_total_cents: z.number().int(),
});

export const orderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  status: z.enum(['pending', 'paid', 'cancelled']),
  subtotal_cents: z.number().int(),
  currency: z.string(),
  lines: z.array(orderLineSchema),
  created_at: z.string(),
});

export const paymentSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  stripe_intent_id: z.string(),
  client_secret: z.string(),
  amount_cents: z.number().int(),
  currency: z.string(),
  order_amount_cents: z.number().int(),
  status: z.enum(['pending', 'succeeded', 'failed', 'cancelled']),
  created_at: z.string(),
});

export const wishlistProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  price_cents: z.number().int(),
  currency: z.string(),
  image_url: optionalString,
});

export const wishlistItemSchema = z.object({
  product_id: z.string(),
  product: wishlistProductSchema,
  added_at: z.string(),
});

export const reviewSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  author: z.string(),
  product_id: z.string(),
  rating: z.number().int(),
  title: z.string(),
  body: z.string(),
  created_at: z.string(),
});

export const reviewSummarySchema = z.object({
  average: z.number(),
  count: z.number().int(),
  reviews: z.array(reviewSchema),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'customer']),
  email_verified: z.boolean(),
  created_at: z.string(),
});

export const stockSchema = z.object({
  product_id: z.string(),
  variant_id: optionalString,
  on_hand: z.number().int(),
  reserved: z.number().int(),
  available: z.number().int(),
});

export const statusResponseSchema = z.object({
  status: z.string(),
});

/** Returned by SDK methods that resolve without a body. */
export const successSchema = z.object({
  success: z.literal(true),
});
