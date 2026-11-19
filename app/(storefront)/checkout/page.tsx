"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCart, lineKey } from "@/components/CartContext";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import { cldUrl } from "@/lib/cloudinary";
import { MobileMoneyPayment } from "@/components/MobileMoneyPayment";
import { apiFetch, setCustomerSession } from "@/lib/api";
import {
  deliveryLabel,
  formatPrice,
  getDeliveryQuote,
  getNetworkFees,
  validatePromoCode,
  type DeliveryZone,
  type PaymentSession,
} from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "../storefront.css";

interface OrderResponse {
  id: string;
  montantTotal: number;
  token?: string;
  // Online orders only: what this checkout needs to send the mobile money prompt.
  paiement?: PaymentSession;
  customer: { id: string; nom: string; email: string | null; telephone: string | null };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();

  const [mode, setMode] = useState<"en_ligne" | "livraison">("en_ligne");
  const [zone, setZone] = useState<DeliveryZone>("lome");

  const [nom, setNom] = useState(customer?.nom.split(" ").slice(1).join(" ") ?? "");
  const [prenom, setPrenom] = useState(customer?.nom.split(" ")[0] ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [telephone, setTelephone] = useState(customer?.telephone ?? "");
  const [adresse, setAdresse] = useState(customer?.adresse ?? "");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; remise: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);

  const [payment, setPayment] = useState<PaymentSession | null>(null);
  const [confirmMode, setConfirmMode] = useState<"en_ligne" | "livraison" | null>(null);
  const [justAuthenticated, setJustAuthenticated] = useState(false);

  const { data: networkFees } = useQuery({ queryKey: queryKeys.networkFees, queryFn: getNetworkFees });

  // Today's fee from the API, which prices the order on its own clock.
  const { data: delivery } = useQuery({
    queryKey: queryKeys.delivery,
    queryFn: getDeliveryQuote,
    refetchInterval: 5 * 60 * 1000,
  });

  const remise = promoApplied?.remise ?? 0;
  const livraison = zone === "lome" && lines.length ? (delivery?.lome.frais ?? 0) : 0;
  const total = Math.max(0, subtotal - remise) + livraison;
  // What the total leaves out, paid later or on top.
  const totalExcludes = [mode === "en_ligne" ? "frais de réseau" : null, zone === "hors_lome" ? "livraison" : null]
    .filter(Boolean)
    .join(" et ");

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
        zoneLivraison: zone,
        promoCode: promoApplied?.code,
        newsletter: newsletter || undefined,
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

      if (!order.paiement) {
        throw new Error("Commande créée, mais le paiement en ligne n'a pas pu démarrer. Contacte-nous.");
      }
      // The order now holds the items, and can be paid later from the
      // account: keeping the cart would only lead to a second order.
      clear();
      setPayment(order.paiement);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la commande");
    } finally {
      setSubmitting(false);
    }
  }

  const inPaymentStep = mode === "en_ligne" && payment !== null;

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

      {inPaymentStep && payment ? (
        <section className="checkout">
          <div className="wrap checkout-grid">
            <div>
              <div className="form-section">
                <h2 className="display">Paiement</h2>
                <p style={{ fontSize: 13.5, color: "var(--gris)", marginBottom: 22 }}>
                  Commande créée. Indique le nom et le numéro Flooz ou T-Money qui paie : une demande de
                  confirmation arrive sur ce téléphone.
                </p>
                <MobileMoneyPayment
                  session={payment}
                  defaultName={customer?.nom ?? `${prenom} ${nom}`.trim()}
                  defaultPhone={customer?.telephone ?? telephone}
                  onApproved={handlePaid}
                />
              </div>
            </div>

            <div className="summary">
              <h3>Votre commande</h3>
              <div className="summary-row"><span>Commande</span><span>{formatPrice(payment.montant - (payment.fraisLivraison ?? 0))}</span></div>
              {deliveryLabel(payment.zoneLivraison, payment.fraisLivraison) ? (
                <div className="summary-row">
                  <span>Livraison · {payment.zoneLivraison === "hors_lome" ? "hors de Lomé" : "Lomé"}</span>
                  <span>{deliveryLabel(payment.zoneLivraison, payment.fraisLivraison)}</span>
                </div>
              ) : null}
              <div className="summary-row">
                <span>Frais de réseau</span>
                <span className="muted">selon l&apos;opérateur</span>
              </div>
              <p className="fine-print">
                Le montant exact, frais de réseau compris, s&apos;affiche dès que tu saisis ton numéro : c&apos;est
                celui que ton téléphone te demandera de confirmer. Le paiement est confirmé automatiquement.
              </p>
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
                        <div className="pay-desc">Flooz ou T-Money, un compte est créé pour suivre ta commande</div>
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
                  <h2 className="display">Où te livrer</h2>
                  <div className="pay-options">
                    <label className={`pay-option${zone === "lome" ? " selected" : ""}`} onClick={() => setZone("lome")}>
                      <input type="radio" name="zone" checked={zone === "lome"} readOnly />
                      <div className="pay-label">
                        <div className="pay-name">À Lomé</div>
                        <div className="pay-desc">
                          {delivery?.lome.gratuitAujourdhui
                            ? "Livraison offerte aujourd'hui : c'est mardi !"
                            : `${formatPrice(delivery?.lome.tarif ?? 1000)} partout dans Lomé, offerte tous les mardis`}
                        </div>
                      </div>
                    </label>
                    <label className={`pay-option${zone === "hors_lome" ? " selected" : ""}`} onClick={() => setZone("hors_lome")}>
                      <input type="radio" name="zone" checked={zone === "hors_lome"} readOnly />
                      <div className="pay-label">
                        <div className="pay-name">Hors de Lomé</div>
                        <div className="pay-desc">Frais calculés selon la destination et réglés au livreur à la réception</div>
                      </div>
                    </label>
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--gris)", marginTop: 12 }}>
                    <Link className="cut-link" href="/livraison">Comment fonctionne la livraison</Link>
                  </p>
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
                  {(isAuthenticated ? customer?.email : email) ? (
                    <div className="form-row">
                      <label className="newsletter-optin">
                        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
                        <span>
                          Recevoir chaque mois nos nouveautés par email
                          <span className="hint">Désinscription possible à tout moment.</span>
                        </span>
                      </label>
                    </div>
                  ) : null}
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
                      {zone === "hors_lome" ? " Hors de Lomé, il t'indiquera aussi les frais de livraison, à régler en plus." : ""}
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
                <div className="summary-row">
                  <span>Livraison · {zone === "lome" ? "Lomé" : "hors de Lomé"}</span>
                  {zone === "hors_lome" ? (
                    <span className="muted">Au livreur</span>
                  ) : delivery ? (
                    <span>{delivery.lome.frais ? formatPrice(delivery.lome.frais) : "Offerte (mardi)"}</span>
                  ) : (
                    <span className="muted">…</span>
                  )}
                </div>
                {remise > 0 ? (
                  <div className="summary-row"><span>Remise</span><span>−{formatPrice(remise)}</span></div>
                ) : null}
                {mode === "en_ligne" && networkFees ? (
                  <div className="summary-row">
                    <span>Frais de réseau</span>
                    <span className="muted">
                      +{networkFees.flooz.toLocaleString("fr-FR")} % Flooz · +{networkFees.tmoney.toLocaleString("fr-FR")} % T-Money
                    </span>
                  </div>
                ) : null}
                <div className="summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
                {totalExcludes ? (
                  <p className="fine-print" style={{ textAlign: "right", marginTop: -8, marginBottom: 14 }}>Hors {totalExcludes}</p>
                ) : null}

                {error ? <p className="account-error">{error}</p> : null}

                <button className="btn-primary" type="submit" disabled={submitting || lines.length === 0}>
                  {submitting ? "Traitement." : mode === "en_ligne" ? "Continuer vers le paiement" : "Confirmer la commande"}
                </button>
                <p className="fine-print">
                  {mode === "en_ligne"
                    ? "Tu payeras par Flooz ou T-Money à l'étape suivante."
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
