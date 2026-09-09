"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BrandCollection } from "@/components/BrandCollection";
import { getBrand } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "./capsule-textile.css";

const FALLBACK_DESCRIPTION =
  "Capsule Textile valorise le savoir-faire artisanal togolais, crée des emplois durables et préserve un patrimoine culturel, un tissu à la fois.";

export function CapsuleTextileContent() {
  const { data: brand } = useQuery({
    queryKey: queryKeys.brand("capsule-textile"),
    queryFn: () => getBrand("capsule-textile"),
  });
  const description = brand?.description ?? null;

  return (
    <div className="capsule-theme">
      <link
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <SiteHeader active="capsule-textile" />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>Capsule Textile</strong>
        </div>
      </div>

      <section className="brand-hero">
        <div className="wrap brand-hero-inner">
          <img className="flower-symbol" src="/logo-capsule/SYMBOL.png" alt="Capsule Textile" />
          <div>
            <div className="eyebrow">Marque 01 · Depuis 2019</div>
            <h1 className="display">Le fil qui relie tradition et modernité.</h1>
            <p className="lede">{description ?? FALLBACK_DESCRIPTION}</p>
            <div className="hero-ctas">
              <a href="#collection" className="btn-primary">Voir la collection</a>
              <a href="#missions" className="btn-ghost">Notre mission</a>
            </div>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="wrap">
          <img src="/logo-capsule/LOGOMARK.png" alt="Capsule" style={{ height: 16, width: "auto" }} />
          <span>Savoir-faire artisanal africain</span>
          <span>Livraison Lomé et international</span>
        </div>
      </div>

      <section className="section" id="missions">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Notre mission</div>
              <h2 className="display">Quatre engagements de vie</h2>
            </div>
          </div>
          <div className="mission-grid">
            <div className="mission"><span className="num">01</span><p>Valoriser le savoir-faire artisanal africain.</p></div>
            <div className="mission"><span className="num">02</span><p>Créer des emplois durables et équitables.</p></div>
            <div className="mission"><span className="num">03</span><p>Construire une communauté unie autour de l&apos;artisanat.</p></div>
            <div className="mission"><span className="num">04</span><p>Préserver notre patrimoine culturel pour les générations futures.</p></div>
          </div>

          <div className="materials">
            <div>
              <div className="eyebrow">La matière</div>
              <h2 className="display">Unique et authentique</h2>
              <p>
                En tissant des liens entre tradition et modernité, chaque pièce
                Capsule Textile porte la couleur de son atelier, indigo, rouge,
                orange, jaune, dans une trame pensée pour durer.
              </p>
            </div>
            <div className="swatch-strip" aria-hidden="true">
              <div className="swatch sw1" /><div className="swatch sw2" /><div className="swatch sw3" /><div className="swatch sw4" />
              <div className="swatch sw5" /><div className="swatch sw6" /><div className="swatch sw7" /><div className="swatch sw8" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="collection" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Capsule Textile</div>
              <h2 className="display">La collection</h2>
            </div>
            <Link className="cut-link" href="/produits?brand=capsule-textile" style={{ fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>Tout voir</Link>
          </div>
          <BrandCollection brandSlug="capsule-textile" brandNom="Capsule Textile" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
