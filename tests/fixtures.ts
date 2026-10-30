import type {
  Cart,
  Category,
  Order,
  Payment,
  Product,
  ProductDetail,
  Review,
  ReviewSummary,
  Stock,
  User,
  Variant,
  WishlistItem,
} from '@malawistore/store-sdk';

export const product: Product = {
  id: 'prod-1',
  category_id: 'cat-1',
  category_name: 'Cooking Oil',
  name: 'Sunseed Cooking Oil 2L',
  slug: 'sunseed-cooking-oil-2l',
  description: 'Refined sunflower cooking oil.',
  price_cents: 12500,
  currency: 'USD',
  image_url: 'https://cdn.example.mw/oil.jpg',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
};

export const variant: Variant = {
  id: 'var-1',
  product_id: product.id,
  name: '2L bottle',
  sku: 'OIL-2L',
  price_cents: 12500,
  is_active: true,
  available: 24,
  in_stock: true,
  created_at: '2026-10-01T10:00:00Z',
};

export const productDetail: ProductDetail = {
  product,
  variants: [
    {
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price_cents: variant.price_cents,
      is_active: variant.is_active,
      available: variant.available,
      in_stock: variant.in_stock,
    },
  ],
};

export const category: Category = {
  id: 'cat-1',
  name: 'Cooking Oil',
  slug: 'cooking-oil',
  description: 'Cooking oils and fats',
  image_url: 'https://cdn.example.mw/oil-category.jpg',
  created_at: '2026-10-01T10:00:00Z',
};

export const cart: Cart = {
  id: 'cart-1',
  user_id: 'user-1',
  items: [
    {
      id: 'line-1',
      product_id: product.id,
      name: product.name,
      sku: 'OIL-2L',
      unit_price_cents: 12500,
      currency: 'USD',
      qty: 2,
      line_total_cents: 25000,
    },
  ],
  subtotal_cents: 25000,
  currency: 'USD',
  updated_at: '2026-10-01T10:00:00Z',
};

export const order: Order = {
  id: 'order-1',
  user_id: 'user-1',
  status: 'pending',
  subtotal_cents: 25000,
  currency: 'USD',
  lines: [
    {
      product_id: product.id,
      name: product.name,
      sku: 'OIL-2L',
      unit_price_cents: 12500,
      qty: 2,
      line_total_cents: 25000,
    },
  ],
  created_at: '2026-10-01T10:00:00Z',
};

export const payment: Payment = {
  id: 'pay-1',
  order_id: order.id,
  stripe_intent_id: 'pi_123',
  client_secret: 'pi_123_secret_456',
  amount_cents: 1500,
  currency: 'USD',
  order_amount_cents: 25000,
  status: 'pending',
  created_at: '2026-10-01T10:00:00Z',
};

export const wishlistItem: WishlistItem = {
  product_id: product.id,
  product: {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price_cents: product.price_cents,
    currency: product.currency,
    image_url: product.image_url,
  },
  added_at: '2026-10-01T10:00:00Z',
};

export const review: Review = {
  id: 'review-1',
  user_id: 'user-1',
  author: 'Aisha Banda',
  product_id: product.id,
  rating: 5,
  title: 'Great oil',
  body: 'Light and clean.',
  created_at: '2026-10-01T10:00:00Z',
};

export const reviewSummary: ReviewSummary = {
  average: 5,
  count: 1,
  reviews: [review],
  meta: {
    page: 1,
    limit: 12,
    offset: 0,
    total: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
};

export const user: User = {
  id: 'user-1',
  email: 'aisha@example.mw',
  name: 'Aisha Banda',
  role: 'customer',
  email_verified: true,
  created_at: '2026-10-01T10:00:00Z',
};

export const adminUser: User = {
  ...user,
  id: 'admin-1',
  email: 'admin@example.mw',
  name: 'Store Admin',
  role: 'admin',
};

export const stock: Stock = {
  product_id: product.id,
  on_hand: 50,
  reserved: 2,
  available: 48,
};
