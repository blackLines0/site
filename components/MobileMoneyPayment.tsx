"use client";

import { useEffect, useRef, useState } from "react";
import { chargeMobileMoney, getFedapayModes, getPaymentStatus, type FedapayMode } from "@/lib/shop";

const COUNTRY = "tg";
const POLL_INTERVAL_MS = 4000;
const SLOW_AFTER_MS = 45000;

type Step = "form" | "confirming" | "approved" | "failed";

export function MobileMoneyPayment({
  orderId,
  checkoutToken,
  onApproved,
}: {
  orderId: string;
  checkoutToken: string;
  onApproved: () => void;
}) {
  const [modes, setModes] = useState<FedapayMode[]>([]);
  const [mode, setMode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    getFedapayModes()
      .then((byCountry) => {
        const options = byCountry[COUNTRY] ?? [];
        setModes(options);
        setMode((prev) => prev || options[0]?.mode || "");
      })
      .catch(() => setModes([]));
  }, []);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  function pollStatus() {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const res = await getPaymentStatus(orderId, checkoutToken);
        if (res.status === "reussi") {
          setStep("approved");
          onApproved();
          return;
        }
        if (res.status === "echoue") {
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

    if (!mode || !phoneNumber) {
      setError("Choisis un opérateur et renseigne ton numéro.");
      return;
    }

    setSubmitting(true);
    try {
      await chargeMobileMoney(orderId, { reference: checkoutToken, mode, phoneNumber, country: COUNTRY });
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

  function handleCancel() {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    setStep("form");
    setIsSlow(false);
  }

  if (step === "approved") {
    return <p className="mm-status success">Paiement confirmé.</p>;
  }

  if (step === "confirming") {
    return (
      <div className="mm-confirming">
        <div className="mm-spinner" aria-hidden="true" />
        <p>
          Vérifie ton téléphone : un message {modes.find((m) => m.mode === mode)?.operateur ?? "mobile money"} te
          demande de confirmer le paiement avec ton code secret.
        </p>
        {isSlow ? (
          <>
            <p className="mm-slow">Ça prend plus de temps que prévu, mais le paiement peut encore aboutir.</p>
            <button type="button" className="btn-ghost" onClick={handleCancel}>Annuler et modifier</button>
          </>
        ) : null}
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div>
        <p className="mm-status failed">Le paiement a échoué ou a été refusé.</p>
        <button type="button" className="btn-primary" onClick={() => setStep("form")}>Réessayer</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mm-form">
      <div className="form-row">
        <div className="field full">
          <label>Opérateur</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            {modes.map((m) => (
              <option key={m.mode} value={m.mode}>{m.operateur}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="field full">
          <label>Numéro mobile money</label>
          <input
            type="tel"
            placeholder="90 00 00 00"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
      </div>
      {error ? <p className="account-error">{error}</p> : null}
      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Envoi." : "Payer par mobile money"}
      </button>
    </form>
  );
}
