"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCart, lineKey } from "@/components/CartContext";
import { cldUrl } from "@/lib/cloudinary";
import { formatPrice } from "@/lib/shop";
import "../storefront.css";

export default function PanierPage() {
  const { lines, subtotal, updateQty, removeLine } = useCart();

  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <div className="steps">
        <div className="wrap">
          <div className="step active"><span className="dot">1</span><span className="label">Panier</span></div>
          <div className="step-sep" />
          <div className="step"><span className="dot">2</span><span className="label">Livraison</span></div>
          <div className="step-sep" />
          <div className="step"><span className="dot">3</span><span className="label">Paiement</span></div>
        </div>
      </div>

      <section className="cart-page">
        <div className="wrap">
          <h1 className="display">Votre panier</h1>
          <div className="cart-grid">
            <div className="cart-list">
              {lines.length === 0 ? (
                <p className="empty-note">Votre panier est vide.</p>
              ) : (
                lines.map((line) => {
                  const key = lineKey(line);
                  return (
                    <div className="cart-item" key={key}>
                      <div className="item-img">
                        {line.image ? (
                          <img src={cldUrl(line.image, 200)} alt={line.nom} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : null}
                      </div>
                      <div className="item-mid">
                        <div className="item-brand">{line.brandNom}</div>
                        <div className="item-name">{line.nom}</div>
                        <div className="item-meta">{line.variantLabel ?? "Format standard"}</div>
                        <button className="item-remove" onClick={() => removeLine(key)}>Retirer</button>
                      </div>
                      <div className="item-right">
                        <div className="item-price">{formatPrice(line.prixUnitaire)}</div>
                        <div className="qty-stepper">
                          <button onClick={() => updateQty(key, line.qty - 1)}>−</button>
                          <span>{line.qty}</span>
                          <button onClick={() => updateQty(key, line.qty + 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <p style={{ marginTop: 26 }}>
                <Link
                  className="cut-link"
                  href="/produits"
                  style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  ← Continuer mes achats
                </Link>
              </p>
            </div>

            <div className="summary">
              <h3>Récapitulatif</h3>
              <div className="summary-row"><span>Sous-total ({lines.length} article{lines.length > 1 ? "s" : ""})</span><span>{formatPrice(subtotal)}</span></div>
              <div className="summary-row"><span>Livraison</span><span className="muted">Calculée à l&apos;étape suivante</span></div>
              <div className="summary-row total"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
              {lines.length ? (
                <Link href="/checkout"><button className="btn-primary">Passer à la livraison</button></Link>
              ) : (
                <Link href="/produits"><button className="btn-primary">Voir les produits</button></Link>
              )}
              <div className="payment-icons">
                <span className="pay-badge">Paiement en ligne</span>
                <span className="pay-badge">Paiement à la livraison</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
