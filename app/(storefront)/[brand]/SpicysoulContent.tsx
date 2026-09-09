"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BrandCollection } from "@/components/BrandCollection";
import { getBrand } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "./spicysoul.css";

const FALLBACK_DESCRIPTION =
  "La beauté de nos tissus se trouve dans les détails visuels, avec des couleurs exceptionnelles pour un style unique et authentique. Découvrez notre collection de tissus de qualité.";

export function SpicysoulContent() {
  const { data: brand } = useQuery({
    queryKey: queryKeys.brand("spicysoul"),
    queryFn: () => getBrand("spicysoul"),
  });
  const description = brand?.description ?? null;

  return (
    <div className="spicysoul-theme">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <SiteHeader active="spicysoul" />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>Spicysoul</strong>
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i}>NEW ARRIVALS ·</span>
          ))}
        </div>
      </div>

      <section className="brand-hero">
        <div className="flower-bg" aria-hidden="true">
          <div className="flower" style={{ width: 340, top: -60, right: -40, opacity: 0.12 }}>
            <svg viewBox="0 0 200 200"><g fill="#FFE737">
              <ellipse cx="100" cy="55" rx="26" ry="52" /><ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(51 100 100)" />
              <ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(102 100 100)" /><ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(153 100 100)" />
              <ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(204 100 100)" /><ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(255 100 100)" />
              <ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(306 100 100)" />
            </g></svg>
          </div>
          <div className="flower" style={{ width: 220, bottom: -30, left: "10%", opacity: 0.08 }}>
            <svg viewBox="0 0 200 200"><g fill="#FFFFFF">
              <ellipse cx="100" cy="55" rx="26" ry="52" /><ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(51 100 100)" />
              <ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(102 100 100)" /><ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(153 100 100)" />
              <ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(204 100 100)" /><ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(255 100 100)" />
              <ellipse cx="100" cy="55" rx="26" ry="52" transform="rotate(306 100 100)" />
            </g></svg>
          </div>
        </div>
        <div className="wrap brand-hero-inner">
          <div className="eyebrow">Marque 02 · Depuis 2019</div>
          <h1 className="display">
            Sp<span className="spicy-wordmark"><span className="bang">!</span></span>cy <span className="hl">Soul</span>
          </h1>
          <p className="lede">{description ?? FALLBACK_DESCRIPTION}</p>
          <div className="hero-ctas">
            <a href="#collection" className="btn-primary">Explorer le catalogue</a>
            <a href="#lookbook" className="btn-ghost">Le lookbook</a>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="wrap">
          <span>Batik et tie-dye togolais</span>
          <span>Séries limitées, drops fréquents</span>
          <span>Livraison Lomé et international</span>
        </div>
      </div>

      <section className="section" id="lookbook">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">L&apos;ambiance</div>
              <h2 className="display">Merci pour la commande</h2>
            </div>
          </div>
          <div className="quote-block">
            <p>
              La beauté de nos tissus se trouve dans les détails visuels, avec des
              couleurs exceptionnelles pour un style unique et authentique.
            </p>
            <div className="tag">SP!CY SOUL</div>
          </div>
          <div className="mood-grid" style={{ marginTop: 14 }} aria-hidden="true">
            <div className="mood-card mc1"><img src="/images/IMG_4307.PNG" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /><span className="label">Rue</span></div>
            <div className="mood-card mc2"><img src="/images/IMG_4308.PNG" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /><span className="label">Studio</span></div>
            <div className="mood-card mc3"><img src="/images/IMG_4311.PNG" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /><span className="label">Nuit</span></div>
            <div className="mood-card mc4"><img src="/images/IMG_4310.PNG" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /><span className="label">Lumière</span></div>
          </div>
        </div>
      </section>

      <section className="section" id="collection" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Spicysoul</div>
              <h2 className="display">La collection</h2>
            </div>
            <Link className="cut-link" href="/produits?brand=spicysoul" style={{ fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>Tout voir</Link>
          </div>
          <BrandCollection brandSlug="spicysoul" brandNom="Spicysoul" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
