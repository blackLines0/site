"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCart, lineKey } from "@/components/CartContext";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import { cldUrl } from "@/lib/cloudinary";
import { MobileMoneyPayment } from "@/components/MobileMoneyPayment";
import { CardPayment } from "@/components/CardPayment";
import { apiFetch, setCustomerSession } from "@/lib/api";
import { createOrderPayment, formatPrice, validatePromoCode, type PaymentInit } from "@/lib/shop";
import "../storefront.css";

const LIVRAISON = 1500;

interface OrderResponse {
  id: string;
  token?: string;
  customer: { id: string; nom: string; email: string | null; telephone: string | null };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();

  const [mode, setMode] = useState<"en_ligne" | "livraison">("en_ligne");

  const [nom, setNom] = useState(customer?.nom.split(" ").slice(1).join(" ") ?? "");
  const [prenom, setPrenom] = useState(customer?.nom.split(" ")[0] ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [telephone, setTelephone] = useState(customer?.telephone ?? "");
  const [adresse, setAdresse] = useState(customer?.adresse ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; remise: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentInit, setPaymentInit] = useState<PaymentInit | null>(null);
  const [confirmMode, setConfirmMode] = useState<"en_ligne" | "livraison" | null>(null);
  const [justAuthenticated, setJustAuthenticated] = useState(false);

  const livraison = lines.length ? LIVRAISON : 0;
  const remise = promoApplied?.remise ?? 0;
  const total = Math.max(0, subtotal + livraison - remise);

  async function handleApplyPromo() {
    setPromoError(null);
    if (!promoInput.trim()) return;
    setPromoChecking(true);
    try {
      const result = await validatePromoCode(promoInput.trim().toUpperCase(), subtotal);
      setPromoApplied({ code: result.code, remise: result.remise });
    } catch (err) {
      setPromoApplied(null);
      setPromoError(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setPromoChecking(false);
    }
  }

  function handlePaid() {
    clear();
    setConfirmMode("en_ligne");
  }

  function closeConfirmation() {
    setConfirmMode(null);
    router.push(isAuthenticated || justAuthenticated ? "/compte" : "/");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!lines.length) {
      setError("Ton panier est vide.");
      return;
    }

    if (!isAuthenticated) {
      if (mode === "en_ligne" && !password) {
        setError("Choisis un mot de passe pour créer ton compte.");
        return;
      }
      if (mode === "livraison" && !telephone) {
        setError("Le téléphone est requis pour le paiement à la livraison.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const body = {
        client: isAuthenticated
          ? undefined
          : {
              nom: `${prenom} ${nom}`.trim(),
              email: email || undefined,
              telephone: telephone || undefined,
              adresse: adresse || undefined,
              password: mode === "en_ligne" ? password : undefined,
            },
        items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantite: l.qty })),
        moyenPaiement: mode === "en_ligne" ? "Paiement en ligne" : "Paiement à la livraison",
        type: mode,
        promoCode: promoApplied?.code,
      };

      const order = await apiFetch<OrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (order.token) {
        setCustomerSession({ token: order.token, customer: { ...order.customer, adresse: adresse || null } });
        setJustAuthenticated(true);
      }

      if (mode === "livraison") {
        clear();
        setConfirmMode("livraison");
        return;
      }

      setOrderId(order.id);
      const payment = await createOrderPayment(order.id);
      setPaymentInit(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la commande");
    } finally {
      setSubmitting(false);
    }
  }

  const inPaymentStep = mode === "en_ligne" && orderId && paymentInit;

  return (
    <>
      <StorefrontFonts />
      <header>
        <div className="wrap header-inner">
          <Link className="logo-group" href="/">
            <img className="logo-mark" src="/logoblack.png" alt="Blacklines" />
            <span className="wordmark">Blacklines</span>
          </Link>
          <div className="header-actions">
            <span className="secure-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="1.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Paiement sécurisé
            </span>
          </div>
        </div>
      </header>

      <div className="steps">
        <div className="wrap">
          <div className="step done"><span className="dot">✓</span><span className="label">Panier</span></div>
          <div className="step-sep" />
          <div className={`step${inPaymentStep ? " done" : " active"}`}><span className="dot">{inPaymentStep ? "✓" : "2"}</span><span className="label">Livraison</span></div>
          <div className="step-sep" />
          <div className={`step${inPaymentStep ? " active" : ""}`}><span className="dot">3</span><span className="label">Paiement</span></div>
        </div>
      </div>

      {inPaymentStep ? (
        <section className="checkout">
          <div className="wrap checkout-grid">
            <div>
              <div className="form-section">
                <h2 className="display">Paiement</h2>
                <p style={{ fontSize: 13.5, color: "var(--gris)", marginBottom: 22 }}>
                  Commande créée. Choisis ton opérateur mobile money, ou paie par carte ci-dessous.
                </p>
                <MobileMoneyPayment orderId={orderId} checkoutToken={paymentInit.checkoutToken} onApproved={handlePaid} />
                <CardPayment checkoutId={paymentInit.checkoutId} publicKey={paymentInit.publicKey} onApproved={handlePaid} />
              </div>
            </div>

            <div className="summary">
              <h3>Votre commande</h3>
              <div className="summary-row"><span>Total à payer</span><span>{formatPrice(paymentInit.amount)}</span></div>
              <p className="fine-print">Le paiement est confirmé automatiquement dès sa validation.</p>
            </div>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit}>
          <section className="checkout">
            <div className="wrap checkout-grid">
              <div>
                <div className="form-section">
                  <h2 className="display">Comment veux-tu payer</h2>
                  <div className="pay-options">
                    <label className={`pay-option${mode === "en_ligne" ? " selected" : ""}`} onClick={() => setMode("en_ligne")}>
                      <input type="radio" name="mode" checked={mode === "en_ligne"} readOnly />
                      <div className="pay-label">
                        <div className="pay-name">Paiement en ligne</div>
                        <div className="pay-desc">Mobile Money ou carte bancaire, un compte est créé pour suivre ta commande</div>
                      </div>
                    </label>
                    <label className={`pay-option${mode === "livraison" ? " selected" : ""}`} onClick={() => setMode("livraison")}>
                      <input type="radio" name="mode" checked={mode === "livraison"} readOnly />
                      <div className="pay-label">
                        <div className="pay-name">Paiement à la livraison</div>
                        <div className="pay-desc">Tu payes en espèces à la réception, aucun compte requis</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="display">Adresse de livraison</h2>
                  {isAuthenticated ? (
                    <p style={{ fontSize: 13.5, color: "var(--gris)", marginBottom: 16 }}>
                      Connecté en tant que <strong>{customer?.nom}</strong>.
                    </p>
                  ) : null}
                  <div className="form-row">
                    <div className="field"><label>Prénom</label><input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required disabled={isAuthenticated} /></div>
                    <div className="field"><label>Nom</label><input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required disabled={isAuthenticated} /></div>
                  </div>
                  <div className="form-row">
                    <div className="field full">
                      <label>Email{mode === "en_ligne" ? "" : " (facultatif)"}</label>
                      <input type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isAuthenticated} required={mode === "en_ligne" && !isAuthenticated} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field full">
                      <label>Téléphone{mode === "livraison" ? "" : " (facultatif)"}</label>
                      <input type="tel" placeholder="+228 90 00 00 00" value={telephone} onChange={(e) => setTelephone(e.target.value)} disabled={isAuthenticated} required={mode === "livraison" && !isAuthenticated} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field full"><label>Adresse</label><input type="text" placeholder="Quartier, rue, repère" value={adresse} onChange={(e) => setAdresse(e.target.value)} required /></div>
                  </div>
                  {!isAuthenticated && mode === "en_ligne" ? (
                    <div className="form-row">
                      <div className="field full">
                        <label>Mot de passe</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                        <span style={{ fontSize: 12, color: "var(--gris)" }}>
                          Si un compte existe déjà avec cet email, ce mot de passe doit correspondre. Sinon, un compte est créé pour toi afin de suivre ta commande.
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {mode === "livraison" ? (
                  <div className="form-section">
                    <h2 className="display">Paiement à la livraison</h2>
                    <p style={{ fontSize: 13.5, color: "var(--gris)" }}>
                      Prépare le montant exact en espèces. Notre livreur te contactera au
                      numéro indiqué avant de passer.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="summary">
                <h3>Votre commande</h3>
                {lines.length === 0 ? (
                  <p style={{ fontSize: 13.5, color: "var(--gris)", marginBottom: 16 }}>
                    Ton panier est vide. <Link className="cut-link" href="/produits">Voir les produits</Link>
                  </p>
                ) : (
                  lines.map((line) => (
                    <div className="summary-item" key={lineKey(line)}>
                      <div className="thumb">{line.image ? <img src={cldUrl(line.image, 200)} alt={line.nom} /> : null}</div>
                      <div>
                        <div className="name">{line.nom}</div>
                        <div className="meta">{line.brandNom} · {line.variantLabel ?? "Format standard"} · Qté {line.qty}</div>
                      </div>
                      <div className="price">{formatPrice(line.prixUnitaire * line.qty)}</div>
                    </div>
                  ))
                )}

                <div className="promo">
                  <input type="text" placeholder="Code promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                  <button type="button" onClick={handleApplyPromo} disabled={promoChecking}>
                    {promoChecking ? "..." : "Appliquer"}
                  </button>
                </div>
                {promoError ? <p className="account-error">{promoError}</p> : null}
                {promoApplied ? <p className="fine-print" style={{ textAlign: "left" }}>Code {promoApplied.code} appliqué.</p> : null}

                <div className="summary-row"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
                <div className="summary-row"><span>Livraison · Lomé</span><span>{formatPrice(livraison)}</span></div>
                {remise > 0 ? (
                  <div className="summary-row"><span>Remise</span><span>−{formatPrice(remise)}</span></div>
                ) : null}
                <div className="summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>

                {error ? <p className="account-error">{error}</p> : null}

                <button className="btn-primary" type="submit" disabled={submitting || lines.length === 0}>
                  {submitting ? "Traitement." : mode === "en_ligne" ? "Continuer vers le paiement" : "Confirmer la commande"}
                </button>
                <p className="fine-print">
                  {mode === "en_ligne"
                    ? "Tu choisiras mobile money ou carte à l'étape suivante."
                    : "Tu payeras en espèces directement au livreur."}
                </p>
              </div>
            </div>
          </section>
        </form>
      )}

      <footer>
        <div className="wrap">
          <div className="footer-bottom">
            <span>© 2026 Blacklines SARL, Lomé, Togo</span>
            <span><Link href="/confidentialite">Confidentialité</Link></span>
          </div>
        </div>
      </footer>

      <OrderConfirmationModal mode={confirmMode} onClose={closeConfirmation} />
    </>
  );
}
