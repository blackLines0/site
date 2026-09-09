// The three brands keep their own hand-built page and design (see
// app/(storefront)/[brand]/*Content.tsx) — only their copy (description,
// categories, products) is fetched live from the API via lib/shop.ts.
export type BrandSlug = "capsule-textile" | "spicysoul" | "rihan-wa-harir";

export const BRAND_SLUGS: BrandSlug[] = ["capsule-textile", "spicysoul", "rihan-wa-harir"];

export function formatPrice(prix: number): string {
  return `${prix.toLocaleString("fr-FR")} FCFA`;
}
