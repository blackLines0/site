"use client";

import { useEffect, useRef, useState } from "react";
import {
  deliveryLabel,
  detectNetwork,
  formatDeadline,
  formatPrice,
  getPaymentStatus,
  NETWORK_LABELS,
  startPayment,
  type PaymentSession,
} from "@/lib/shop";

const POLL_INTERVAL_MS = 4000;
const SLOW_AFTER_MS = 45000;

type Step = "form" | "confirming" | "approved" | "review" | "failed";

const FAILED_COPY: Record<string, string> = {
  expire: "La demande de paiement a expiré avant d'être validée.",
  annule: "Le paiement a été annulé sur le téléphone.",
  echoue: "Le paiement a échoué ou a été refusé.",
};

export function MobileMoneyPayment({
  session,
  defaultName,
  defaultPhone,
  onApproved,
}: {
  session: PaymentSession;
  defaultName: string;
  defaultPhone: string;
  onApproved: () => void;
}) {
  const [nom, setNom] = useState(defaultName);
  const [telephone, setTelephone] = useState(defaultPhone);
  const [step, setStep] = useState<Step>("form");
  // What the API asked the phone for, shown while waiting.
  const [prompt, setPrompt] = useState<{ label: string; montant: number; uncertain: boolean } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);

  const detected = detectNetwork(telephone);
  const quote = detected ? session.reseaux[detected] : null;
  const livraison = deliveryLabel(session.zoneLivraison, session.fraisLivraison);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  function stopPolling() {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  }

  function pollStatus() {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const res = await getPaymentStatus(session.orderId, session.paymentToken);
        if (res.commande === "payee") {
          setStep("approved");
          onApproved();
          return;
        }
        if (res.aVerifier) {
          setStep("review");
          return;
        }
        if (res.paiement === "echoue" || res.paiement === "expire" || res.paiement === "annule") {
          setFailure(FAILED_COPY[res.paiement]);
          setStep("failed");
          return;
        }
      } catch {
        // transient network error — keep polling
      }
      setIsSlow(Date.now() - startedAtRef.current > SLOW_AFTER_MS);
      pollStatus();
    }, POLL_INTERVAL_MS);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (nom.trim().length < 2) {
      setError("Indique le nom du titulaire du compte mobile money.");
      return;
    }
    if (!detected) {
      setError("Saisis un numéro Flooz (Moov) ou T-Money (Yas) à 8 chiffres.");
      return;
    }

    setSubmitting(true);
    try {
      const started = await startPayment(session.orderId, {
        token: session.paymentToken,
        nom: nom.trim(),
        telephone,
      });
      setPrompt({
        label: NETWORK_LABELS[started.reseau],
        montant: started.montant,
        uncertain: Boolean(started.incertain),
      });
      setStep("confirming");
      setIsSlow(false);
      startedAtRef.current = Date.now();
      pollStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de la demande de paiement");
    } finally {
      setSubmitting(false);
    }
  }

  function backToForm() {
    stopPolling();
    setStep("form");
    setIsSlow(false);
    setFailure(null);
  }

  if (step === "approved") {
    return <p className="mm-status success">Paiement confirmé.</p>;
  }

  if (step === "review") {
    return (
      <p className="mm-status">
        Paiement reçu, mais il doit être vérifié par notre équipe. On te contacte très vite.
      </p>
    );
  }

  if (step === "confirming" && prompt) {
    return (
      <div className="mm-confirming" aria-live="polite">
        <div className="mm-spinner" aria-hidden="true" />
        <p>
          {prompt.uncertain
            ? `La demande ${prompt.label} met du temps à partir. Si tu la reçois, valide-la avec ton code secret ; sinon réessaie dans une minute.`
            : `Vérifie ton téléphone : un message ${prompt.label} te demande de confirmer ${formatPrice(prompt.montant)} avec ton code secret.`}
        </p>
        {isSlow ? (
          <div className="mm-actions">
            <p className="mm-slow">Ça prend plus de temps que prévu, mais le paiement peut encore aboutir.</p>
            <button type="button" className="btn-ghost" onClick={backToForm}>Changer de numéro</button>
          </div>
        ) : null}
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div>
        <p className="mm-status failed">{failure}</p>
        <button type="button" className="btn-primary" onClick={backToForm}>Réessayer</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mm-form">
      <div className="form-row">
        <div className="field full">
          <label>Nom du titulaire du compte</label>
          <input
            type="text"
            placeholder="Prénom Nom"
            autoComplete="name"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            maxLength={80}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="field full">
          <label>Numéro Flooz ou T-Money</label>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="90 00 00 00"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            required
          />
          <span className={`mm-network${detected ? " detected" : ""}`}>
            {detected ? `Réseau : ${NETWORK_LABELS[detected]}` : "Flooz (Moov) ou T-Money (Yas), Togo"}
          </span>
        </div>
      </div>

      <div className="mm-breakdown">
        <div className="summary-row"><span>Commande</span><span>{formatPrice(session.montant - (session.fraisLivraison ?? 0))}</span></div>
        {livraison ? (
          <div className="summary-row">
            <span>Livraison <span className="muted">· {session.zoneLivraison === "hors_lome" ? "hors de Lomé" : "Lomé"}</span></span>
            <span>{livraison}</span>
          </div>
        ) : null}
        {quote && detected ? (
          <>
            <div className="summary-row">
              <span>Frais de réseau <span className="muted">· {NETWORK_LABELS[detected]}</span></span>
              <span>{formatPrice(quote.frais)}</span>
            </div>
            <div className="summary-row total"><span>À confirmer sur ton téléphone</span><span>{formatPrice(quote.total)}</span></div>
          </>
        ) : (
          <div className="summary-row">
            <span>Frais de réseau</span>
            <span className="muted">
              Flooz {formatPrice(session.reseaux.flooz.frais)} · T-Money {formatPrice(session.reseaux.tmoney.frais)}
            </span>
          </div>
        )}
      </div>

      {session.zoneLivraison === "hors_lome" ? (
        <p className="fine-print" style={{ textAlign: "left", marginTop: 0, marginBottom: 14 }}>
          Hors de Lomé, les frais de livraison dépendent de la destination : le livreur te les indique et tu les règles à la réception.
        </p>
      ) : null}
      {error ? <p className="account-error">{error}</p> : null}
      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Envoi." : quote ? `Payer ${formatPrice(quote.total)}` : "Payer"}
      </button>
      <p className="fine-print">
        À payer avant {formatDeadline(session.payerAvant)}. Tu peux aussi le faire plus tard depuis ton compte ;
        passé ce délai, la commande est annulée.
      </p>
    </form>
  );
}
