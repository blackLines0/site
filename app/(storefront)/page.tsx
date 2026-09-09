"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { HeroGallery } from "@/components/HeroGallery";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { BRAND_SLUGS, type BrandSlug } from "@/lib/catalog";
import { formatPrice, getBrands, getProducts } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "./storefront.css";

export default function HomePage() {
  const [filter, setFilter] = useState<BrandSlug | "all">("all");
  const { data: brands = [] } = useQuery({
    queryKey: queryKeys.brands,
    queryFn: getBrands,
  });
  const { data: recentProducts = [] } = useQuery({
    queryKey: queryKeys.products({ sort: "recent" }),
    queryFn: () => getProducts({ sort: "recent" }),
  });
  const products = recentProducts.slice(0, 8);

  const visibleProducts =
    filter === "all" ? products : products.filter((p) => p.brand.slug === filter);

  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <div className="eyebrow">Blacklines · Boutique officielle</div>
            <h1 className="display">
              Trois marques.
              <br />
              <em>Une seule ligne.</em>
            </h1>
            <p className="lede">
              Capsule Textile, Spicysoul et Rihan Wa Harir réunies dans une boutique
              unique : le savoir-faire togolais, assemblé comme sur un métier à tisser.
            </p>
            <div className="hero-ctas">
              <a href="#nouveautes" className="btn-primary">Découvrir la collection</a>
              <a href="#pillars" className="btn-ghost">Voir les trois marques</a>
            </div>
          </div>
          <HeroGallery />
        </div>
      </section>

      <div className="strip">
        <div className="wrap">
          <span>Livraison Lomé et international</span>
          <span>Paiement en ligne ou à la livraison</span>
          <span>Production togolaise depuis 2019</span>
        </div>
      </div>

      <section className="section" id="pillars">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Trois marques, une maison</div>
              <h2 className="display">Ce que porte la boutique</h2>
            </div>
          </div>
          <div className="pillars">
            {brands.map((brand, i) => (
              <div className="pillar" key={brand.slug}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display">{brand.nom}</h3>
                <p>{brand.description}</p>
                <Link className="go" href={`/${brand.slug}`}>
                  Voir la marque
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="19" x2="19" y2="5" />
                    <polyline points="9 5 19 5 19 15" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="nouveautes" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Nouveautés</div>
              <h2 className="display">Dernières pièces</h2>
            </div>
            <Link
              className="cut-link"
              href="/produits"
              style={{ fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}
            >
              Tout voir
            </Link>
          </div>
          <div className="filters">
            <button
              className={`chip${filter === "all" ? " active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Toutes les marques
            </button>
            {BRAND_SLUGS.map((slug) => (
              <button
                key={slug}
                className={`chip${filter === slug ? " active" : ""}`}
                onClick={() => setFilter(slug)}
              >
                {brands.find((b) => b.slug === slug)?.nom ?? slug}
              </button>
            ))}
          </div>
          <div className="products">
            {visibleProducts.length === 0 ? (
              <p style={{ color: "var(--gris)" }}>Aucun produit pour le moment.</p>
            ) : (
              visibleProducts.map((product) => (
                <Link className="card" href={`/${product.brand.slug}/${product.slug}`} key={product.slug}>
                  <div className="card-img">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.nom} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                    <div className="corner" />
                  </div>
                  <div className="card-brand">{product.brand.nom}</div>
                  <div className="card-name">{product.nom}</div>
                  <div className="card-price">
                    {product.prixPromo ? (
                      <>
                        <span style={{ textDecoration: "line-through", opacity: 0.5, marginRight: 8, fontWeight: 500 }}>
                          {formatPrice(product.prix)}
                        </span>
                        {formatPrice(product.prixPromo)}
                      </>
                    ) : (
                      formatPrice(product.prix)
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="story">
        <div className="wrap story-inner">
          <div className="story-figure">
            <img src="/images/IMG_4306.PNG" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <span className="cap">Malaika Nabila, directrice, consultante créative</span>
          </div>
          <div>
            <div className="eyebrow">Direction créative</div>
            <h2 className="display">Une ligne, deux vocations</h2>
            <p>
              Blacklines porte ses propres marques togolaises tout en accompagnant
              d&apos;autres structures dans leur développement stratégique. Cette
              double vocation se lit jusque dans le tracé du logo : cinq traits,
              brisés au même angle de 18°, celui des bandes tissées togolaises.
            </p>
          </div>
        </div>
      </section>

      <div className="trust">
        <div className="wrap">
          <div className="trust-item">
            <div className="eyebrow">Paiement</div>
            <p>Paiement en ligne sécurisé ou paiement à la livraison, selon ta préférence.</p>
          </div>
          <div className="trust-item">
            <div className="eyebrow">Production</div>
            <p>Pièces conçues et fabriquées au Togo, au sein du portefeuille de marques Blacklines depuis 2019.</p>
          </div>
          <div className="trust-item">
            <div className="eyebrow">Service</div>
            <p>Une équipe basée à Lomé pour répondre à toute question sur une commande ou une pièce.</p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
