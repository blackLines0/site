import type { ProductFilters } from "./shop";

// Centralized so pages hitting the same endpoint (e.g. the homepage and the
// full catalogue both fetching brands) share one cache entry and one
// in-flight request instead of each firing its own.
export const queryKeys = {
  brands: ["brands"] as const,
  brand: (slug: string) => ["brand", slug] as const,
  products: (filters: ProductFilters = {}) => ["products", filters] as const,
  product: (slug: string) => ["product", slug] as const,
  reviews: (productSlug: string) => ["reviews", productSlug] as const,
  favorites: ["favorites"] as const,
  heroSlides: ["hero-slides"] as const,
  announcement: ["announcement"] as const,
  myOrders: ["my-orders"] as const,
};
