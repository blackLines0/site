"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BrandCollection } from "@/components/BrandCollection";
import { getBrand } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "./spicy-kids.css";

const FALLBACK_DESCRIPTION =
  "Des vêtements doux et colorés pour les petits de 0 à 12 ans, pensés pour la qualité et le confort.";

const VALUES = [
  { titre: "Authentique", texte: "L'originalité est au cœur de notre approche." },
  { titre: "Rassurant", texte: "Un refuge de douceur pour les petits." },
  { titre: "Créatif", texte: "L'imagination s'épanouit avec Spicy Kids." },
];

export function SpicyKidsContent() {
  const { data: brand } = useQuery({
    queryKey: queryKeys.brand("spicy-kids"),
    queryFn: () => getBrand("spicy-kids"),
  });
  const description = brand?.description ?? null;

  return (
    <div className="spicykids-theme">
      <link
        href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <SiteHeader active="spicy-kids" />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>Spicy Kids</strong>
        </div>
      </div>

      <section className="brand-hero">
        <div className="bubbles" aria-hidden="true">
          <span className="bubble b1" />
          <span className="bubble b2" />
          <span className="bubble b3" />
          <span className="bubble b4" />
        </div>
        <div className="wrap brand-hero-inner">
          <img className="brand-logo" src="/logo-spicy-kids/logo.svg" alt="Spicy Kids" />
          <div className="eyebrow">Marque 05 · La petite sœur de Spicysoul</div>
          <h1 className="display">Là où l&apos;imagination s&apos;épanouit.</h1>
          <p className="lede">{description ?? FALLBACK_DESCRIPTION}</p>
          <div className="hero-ctas">
            <a href="#collection" className="btn-primary">Voir la collection</a>
            <a href="#valeurs" className="btn-ghost">Nos valeurs</a>
          </div>
        </div>
        <svg className="hero-wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 70V36c120-30 240-40 360-22s240 44 360 36 240-44 360-44 240 18 360 34v36Z" />
        </svg>
      </section>

      <div className="strip">
        <div className="wrap">
          <span>Douceur et confort</span>
          <span>Vêtements de 0 à 12 ans</span>
          <span>Livraison Lomé et international</span>
        </div>
      </div>

      <section className="section" id="valeurs">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Nos valeurs</span>
            <h2 className="display">Pensé pour les petits, choisi par les grands</h2>
          </div>
          <div className="value-grid">
            {VALUES.map((value, i) => (
              <div className={`value v${i + 1}`} key={value.titre}>
                <span className="value-num">0{i + 1}</span>
                <h3>{value.titre}</h3>
                <p>{value.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section collection" id="collection">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Spicy Kids</span>
            <h2 className="display">La collection</h2>
          </div>
          <BrandCollection brandSlug="spicy-kids" brandNom="Spicy Kids" />
        </div>
      </section>

      <SiteFooter brand="spicy-kids" />
    </div>
  );
}
