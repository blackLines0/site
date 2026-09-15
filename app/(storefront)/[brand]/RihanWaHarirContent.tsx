"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BrandCollection } from "@/components/BrandCollection";
import { getBrand } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "./rihan-wa-harir.css";

const FALLBACK_DESCRIPTION =
  "Bakhour, encens, huiles, musc et perles : des produits choisis pour la médecine prophétique et le soin du corps comme de l'esprit.";

export function RihanWaHarirContent() {
  const { data: brand } = useQuery({
    queryKey: queryKeys.brand("rihan-wa-harir"),
    queryFn: () => getBrand("rihan-wa-harir"),
  });
  const description = brand?.description ?? null;

  return (
    <div className="rihan-theme">
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <SiteHeader active="rihan-wa-harir" />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>Rihan Wa Harir</strong>
        </div>
      </div>

      <section className="brand-hero">
        <div className="wrap">
          <img className="brand-logo" src="/logo-rihan/logo.svg" alt="Rihan Wa Harir" />
          <div className="eyebrow">Marque 03 · Depuis 2019</div>
          <h1 className="display">Une caresse <em>pour l&apos;âme.</em></h1>
          <p className="lede">{description ?? FALLBACK_DESCRIPTION}</p>
          <div className="hero-ctas">
            <a href="#boutique" className="btn-primary">Découvrir la boutique</a>
            <a href="#categories" className="btn-ghost">Nos catégories</a>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="wrap">
          <span>Bakhour et encens artisanaux</span>
          <span>Huiles et musc naturels</span>
          <span>Livraison Lomé et international</span>
        </div>
      </div>

      <section className="section" id="categories">
        <div className="wrap">
          <div className="section-narrow">
            <span className="eyebrow">Nos catégories</span>
            <h2 className="display">Ce que porte la boutique</h2>
            <p>
              Une sélection pensée pour la médecine prophétique et le bien-être,
              chaque produit choisi pour sa pureté plutôt que pour son éclat.
            </p>
          </div>
          <div className="cat-grid">
            <div className="cat">
              <svg className="cat-icon" viewBox="0 0 40 40" fill="none" stroke="#1F4A3A" strokeWidth="1.4"><path d="M20 6 C28 12 30 22 20 34 C10 22 12 12 20 6 Z" /><path d="M20 14v14" strokeWidth="1" /></svg>
              <h3>Bakhour &amp; Encens</h3>
              <p>Bakhour Al Haramain, encens oud, résines traditionnelles.</p>
            </div>
            <div className="cat">
              <svg className="cat-icon" viewBox="0 0 40 40" fill="none" stroke="#1F4A3A" strokeWidth="1.4"><path d="M14 6h12l-2 10a10 10 0 1 1-8 0Z" /></svg>
              <h3>Huiles &amp; Musc</h3>
              <p>Huile de nigelle, musc blanc, essences pures sans alcool.</p>
            </div>
            <div className="cat">
              <svg className="cat-icon" viewBox="0 0 40 40" fill="none" stroke="#1F4A3A" strokeWidth="1.4"><circle cx="20" cy="8" r="3" /><circle cx="30" cy="16" r="3" /><circle cx="32" cy="26" r="3" /><circle cx="24" cy="33" r="3" /><circle cx="12" cy="30" r="3" /><circle cx="8" cy="18" r="3" /></svg>
              <h3>Perles &amp; Chapelets</h3>
              <p>Sebha 99 perles, ambre et bois précieux, pour le dhikr quotidien.</p>
            </div>
            <div className="cat">
              <svg className="cat-icon" viewBox="0 0 40 40" fill="none" stroke="#1F4A3A" strokeWidth="1.4"><path d="M8 20a12 12 0 0 1 24 0" /><path d="M8 20h24v6a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" /></svg>
              <h3>Médecine Prophétique</h3>
              <p>Miel de sidr, habba sawda, produits de la sunna.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="boutique" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-narrow">
            <span className="eyebrow">Rihan Wa Harir</span>
            <h2 className="display">La boutique</h2>
          </div>
          <BrandCollection brandSlug="rihan-wa-harir" brandNom="Rihan Wa Harir" />
        </div>
      </section>

      <div className="contact-strip">
        <div className="wrap">
          <span className="eyebrow">Une question, une commande</span>
          <div className="phone">+228 93 02 08 00</div>
        </div>
      </div>

      <SiteFooter brand="rihan-wa-harir" />
    </div>
  );
}
