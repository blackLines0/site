import { notFound } from "next/navigation";
import { CapsuleTextileContent } from "./CapsuleTextileContent";
import { SpicysoulContent } from "./SpicysoulContent";
import { RihanWaHarirContent } from "./RihanWaHarirContent";
import { BRAND_SLUGS } from "@/lib/catalog";

export function generateStaticParams() {
  return BRAND_SLUGS.map((slug) => ({ brand: slug }));
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;

  switch (brand) {
    case "capsule-textile":
      return <CapsuleTextileContent />;
    case "spicysoul":
      return <SpicysoulContent />;
    case "rihan-wa-harir":
      return <RihanWaHarirContent />;
    default:
      notFound();
  }
}
