import type { MetadataRoute } from "next";

const BASE_URL = "https://www.blallery.com";

const BRAND_SLUGS = ["capsule-textile", "spicysoul", "rihan-wa-harir"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/produits`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/a-propos`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const brandPages: MetadataRoute.Sitemap = BRAND_SLUGS.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...brandPages];
}
