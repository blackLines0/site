import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { CapsuleTextileContent } from "./CapsuleTextileContent";
import { SpicysoulContent } from "./SpicysoulContent";
import { RihanWaHarirContent } from "./RihanWaHarirContent";
import { ArtmoirContent } from "./ArtmoirContent";
import { SpicyKidsContent } from "./SpicyKidsContent";
import { BRAND_SLUGS } from "@/lib/catalog";

export function generateStaticParams() {
  return BRAND_SLUGS.map((slug) => ({ brand: slug }));
}

type BrandPageProps = {
  params: Promise<{ brand: string }>;
};

const SPICY_KIDS_ASSETS = "/logo-spicy-kids";

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { brand } = await params;
  if (brand !== "spicy-kids") return {};

  return {
    metadataBase: new URL("https://www.blallery.com"),
    title: "Spicy Kids | Blacklines",
    description: "Des vêtements doux et colorés pour les petits de 0 à 12 ans.",
    icons: {
      icon: [
        { url: `${SPICY_KIDS_ASSETS}/logo.svg`, type: "image/svg+xml" },
        { url: `${SPICY_KIDS_ASSETS}/favicon/favicon-32.png`, sizes: "32x32", type: "image/png" },
        { url: `${SPICY_KIDS_ASSETS}/favicon/favicon-16.png`, sizes: "16x16", type: "image/png" },
      ],
      apple: `${SPICY_KIDS_ASSETS}/favicon/apple-touch-icon-180.png`,
    },
    manifest: `${SPICY_KIDS_ASSETS}/site.webmanifest`,
    openGraph: {
      title: "Spicy Kids",
      images: [{ url: `${SPICY_KIDS_ASSETS}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export async function generateViewport({ params }: BrandPageProps): Promise<Viewport> {
  const { brand } = await params;
  return brand === "spicy-kids" ? { themeColor: "#043186" } : {};
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { brand } = await params;

  switch (brand) {
    case "capsule-textile":
      return <CapsuleTextileContent />;
    case "spicysoul":
      return <SpicysoulContent />;
    case "rihan-wa-harir":
      return <RihanWaHarirContent />;
    case "artmoir":
      return <ArtmoirContent />;
    case "spicy-kids":
      return <SpicyKidsContent />;
    default:
      notFound();
  }
}
