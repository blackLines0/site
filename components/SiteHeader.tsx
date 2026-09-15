"use client";

import { useState } from "react";
import Link from "next/link";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { useCart } from "./CartContext";
import { useCustomerAuth } from "./CustomerAuthContext";
import type { BrandSlug } from "@/lib/catalog";

export function SiteHeader({ active }: { active?: BrandSlug }) {
  const { count } = useCart();
  const { customer } = useCustomerAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const linkClass = (brand: BrandSlug) =>
    `cut-link${active === brand ? " active" : ""}`;

  return (
    <>
      <header>
        <div className="wrap header-inner">
          <button
            type="button"
            className="menu-toggle"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
          <Link className="logo-group" href="/">
            <img className="logo-mark" src="/logoblack.png" alt="Blacklines" />
            <span className="wordmark">Blacklines</span>
          </Link>
          <nav className="main-nav">
            <Link className={linkClass("capsule-textile")} href="/capsule-textile">Capsule Textile</Link>
            <Link className={linkClass("spicysoul")} href="/spicysoul">Spicysoul</Link>
            <Link className={linkClass("rihan-wa-harir")} href="/rihan-wa-harir">Rihan Wa Harir</Link>
            <Link className="cut-link" href="/produits">Tous les produits</Link>
            <Link className="cut-link" href="/a-propos">À propos</Link>
          </nav>
          <div className="header-actions">
            <Link className="account-link" href="/compte" aria-label="Compte">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
              {customer ? <span className="account-name">{customer.nom.split(" ")[0]}</span> : null}
            </Link>
            <Link className="icon-btn" href="/panier" aria-label="Panier">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
                <circle cx="9" cy="21" r="1.4" />
                <circle cx="18" cy="21" r="1.4" />
              </svg>
              {count ? <span className="cart-count">{count}</span> : null}
            </Link>
          </div>
        </div>
        {mobileNavOpen ? (
          <nav className="mobile-nav">
            <Link className={linkClass("capsule-textile")} href="/capsule-textile" onClick={() => setMobileNavOpen(false)}>Capsule Textile</Link>
            <Link className={linkClass("spicysoul")} href="/spicysoul" onClick={() => setMobileNavOpen(false)}>Spicysoul</Link>
            <Link className={linkClass("rihan-wa-harir")} href="/rihan-wa-harir" onClick={() => setMobileNavOpen(false)}>Rihan Wa Harir</Link>
            <Link className="cut-link" href="/produits" onClick={() => setMobileNavOpen(false)}>Tous les produits</Link>
            <Link className="cut-link" href="/a-propos" onClick={() => setMobileNavOpen(false)}>À propos</Link>
          </nav>
        ) : null}
      </header>
      <AnnouncementBanner />
    </>
  );
}
