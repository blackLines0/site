"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BrandCollection } from "@/components/BrandCollection";
import { getBrand } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "./artmoir.css";

const FALLBACK_DESCRIPTION =
  "L'élégance de la haute fantaisie et la créativité brute de la céramique : bracelets, ustensiles et pièces uniques.";

const PHONE = "+228 93 44 40 40";

export function ArtmoirContent() {
  const { data: brand } = useQuery({
    queryKey: queryKeys.brand("artmoir"),
    queryFn: () => getBrand("artmoir"),
  });
  const description = brand?.description ?? null;

  return (
    <div className="artmoir-theme">
      {/* Georgia is the brand typeface but ships on neither Android nor Linux;
          Gelasio is its metric-compatible substitute. */}
      <link href="https://fonts.googleapis.com/css2?family=Gelasio:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      <SiteHeader active="artmoir" />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>Artmoi&apos;R</strong>
        </div>
      </div>

      <section className="brand-hero">
        <div className="wrap">
          <img className="brand-logo" src="/logo-artmoir/logo-white.png" alt="Artmoi'R, Haute Fantaisie et Céramique" />
          <div className="eyebrow">Marque 04 · Lomé, Togo</div>
          <h1 className="display">Des pièces uniques, raffinées et authentiques.</h1>
          <p className="lede">{description ?? FALLBACK_DESCRIPTION}</p>
          <div className="hero-ctas">
            <a href="#boutique" className="btn-primary">Découvrir la boutique</a>
            <a href="#univers" className="btn-ghost">Notre univers</a>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="wrap">
          <span>Haute fantaisie</span>
          <span>Céramique artisanale</span>
          <span>Livraison Lomé et international</span>
        </div>
      </div>

      <section className="section" id="projet">
        <div className="wrap project">
          <div className="project-mark">
            <img src="/logo-artmoir/symbol-terracotta.png" alt="" />
          </div>
          <div>
            <span className="eyebrow">Le projet</span>
            <h2 className="display">La mode et la céramique, une même exigence</h2>
            <p>
              Artmoi&apos;R est une marque de mode et de céramique qui allie l&apos;élégance
              de la haute fantaisie à la créativité brute de la céramique. Nous créons des
              bracelets, des ustensiles et des pièces uniques, à la fois raffinées et
              authentiques, pour une clientèle exigeante.
            </p>
          </div>
        </div>
      </section>

      <section className="section univers" id="univers">
        <div className="wrap">
          <div className="section-narrow">
            <span className="eyebrow">Notre univers</span>
            <h2 className="display">Ce que façonne l&apos;atelier</h2>
          </div>
          <div className="cat-grid">
            <div className="cat">
              <svg className="cat-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="24" cy="24" rx="19" ry="14" />
                <ellipse cx="24" cy="24" rx="13" ry="8.5" />
                <circle cx="24" cy="10" r="2.6" />
                <circle cx="24" cy="38" r="2.6" />
                <circle cx="5" cy="24" r="2.6" />
                <circle cx="43" cy="24" r="2.6" />
              </svg>
              <h3>Bracelets</h3>
              <p>La haute fantaisie, à porter au quotidien comme aux grandes occasions.</p>
            </div>
            <div className="cat">
              <svg className="cat-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 20h36c0 11-7 19-18 19S6 31 6 20Z" />
                <path d="M17 39h14" />
                <path d="M30 20 39 7" />
              </svg>
              <h3>Ustensiles</h3>
              <p>Des objets de céramique façonnés pour trouver leur place à table.</p>
            </div>
            <div className="cat">
              <img className="cat-icon" src="/logo-artmoir/symbol-terracotta.png" alt="" />
              <h3>Pièces uniques</h3>
              <p>Des créations singulières, pensées pour une clientèle exigeante.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="boutique">
        <div className="wrap">
          <div className="section-narrow">
            <span className="eyebrow">Artmoi&apos;R</span>
            <h2 className="display">La boutique</h2>
          </div>
          <BrandCollection brandSlug="artmoir" brandNom="Artmoi'R" />
        </div>
      </section>

      <div className="contact-strip">
        <div className="wrap">
          <span className="eyebrow">Une question, une commande</span>
          <div className="phone">{PHONE}</div>
          <div className="city">Lomé, Togo</div>
        </div>
      </div>

      <SiteFooter brand="artmoir" />
    </div>
  );
}
