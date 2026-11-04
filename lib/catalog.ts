// Each brand keeps its own hand-built page and design (see
// app/(storefront)/[brand]/*Content.tsx) — only their copy (description,
// categories, products) is fetched live from the API via lib/shop.ts.
export type BrandSlug = "capsule-textile" | "spicysoul" | "rihan-wa-harir" | "artmoir" | "spicy-kids";

export const BRANDS: { slug: BrandSlug; nom: string; tagline: string; accent: string }[] = [
  { slug: "capsule-textile", nom: "Capsule Textile", tagline: "Le tissage togolais", accent: "#44199E" },
  { slug: "spicysoul", nom: "Spicysoul", tagline: "Batik et tie-dye", accent: "#053085" },
  { slug: "rihan-wa-harir", nom: "Rihan Wa Harir", tagline: "Bakhour, huiles et perles", accent: "#1F4A3A" },
  { slug: "artmoir", nom: "Artmoi'R", tagline: "Haute fantaisie et céramique", accent: "#BB5D42" },
  { slug: "spicy-kids", nom: "Spicy Kids", tagline: "L'univers des petits", accent: "#A472BA" },
];

export const BRAND_SLUGS: BrandSlug[] = BRANDS.map((brand) => brand.slug);

export function formatPrice(prix: number): string {
  return `${prix.toLocaleString("fr-FR")} FCFA`;
}
