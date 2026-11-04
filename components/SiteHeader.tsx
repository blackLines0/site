"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { useCart } from "./CartContext";
import { useCustomerAuth } from "./CustomerAuthContext";
import { BRANDS, type BrandSlug } from "@/lib/catalog";
import "./site-header.css";

const HOVER_CLOSE_DELAY_MS = 180;

function BrandMenu({ active }: { active?: BrandSlug }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const openedByHover = useRef(false);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Hover only for a real mouse: on a tablet the emulated hover would fire
  // right before the click and the trigger would open then instantly close.
  function onPointerEnter(event: React.PointerEvent) {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    if (!open) openedByHover.current = true;
    setOpen(true);
  }
  function onPointerLeave(event: React.PointerEvent) {
    if (event.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => {
      openedByHover.current = false;
      setOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }

  // The click that lands right after a hover-open keeps the menu open
  // instead of closing it under the cursor.
  function onTriggerClick() {
    const pinOpen = openedByHover.current;
    openedByHover.current = false;
    setOpen((v) => pinOpen || !v);
  }

  return (
    <div className="brand-menu" ref={rootRef} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
      <button
        type="button"
        className={`cut-link brand-menu-trigger${active ? " active" : ""}`}
        aria-expanded={open}
        aria-controls="brand-menu-panel"
        onClick={onTriggerClick}
      >
        Nos marques
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open ? (
        <div className="brand-menu-panel" id="brand-menu-panel">
          <div className="wrap brand-menu-grid">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                className={`brand-menu-item${active === brand.slug ? " current" : ""}`}
                href={`/${brand.slug}`}
                aria-current={active === brand.slug ? "page" : undefined}
                style={{ "--brand-accent": brand.accent } as React.CSSProperties}
                onClick={() => setOpen(false)}
              >
                <span className="brand-menu-name">{brand.nom}</span>
                <span className="brand-menu-tagline">{brand.tagline}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
            <BrandMenu active={active} />
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
            <span className="mobile-nav-label">Nos marques</span>
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                className={linkClass(brand.slug)}
                href={`/${brand.slug}`}
                onClick={() => setMobileNavOpen(false)}
              >
                {brand.nom}
              </Link>
            ))}
            <Link className="cut-link" href="/produits" onClick={() => setMobileNavOpen(false)}>Tous les produits</Link>
            <Link className="cut-link" href="/a-propos" onClick={() => setMobileNavOpen(false)}>À propos</Link>
          </nav>
        ) : null}
      </header>
      <AnnouncementBanner />
    </>
  );
}
