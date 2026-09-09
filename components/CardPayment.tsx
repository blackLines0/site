"use client";

import { useState } from "react";

const FEDAPAY_CHECKOUT_SCRIPT = "https://cdn.fedapay.com/checkout.js?v=2.0";

declare global {
  interface Window {
    FedaPay?: {
      init: (options: {
        public_key: string;
        transaction: { id: number };
        container: string;
        onComplete: (response: { reason: string }) => void;
      }) => void;
      CHECKOUT_COMPLETED?: string;
      DIALOG_DISMISSED?: string;
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadFedapayCheckoutScript(): Promise<void> {
  if (window.FedaPay) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = FEDAPAY_CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger le module de paiement par carte"));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

export function CardPayment({
  checkoutId,
  publicKey,
  onApproved,
}: {
  checkoutId: number;
  publicKey: string;
  onApproved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reveal() {
    setError(null);
    setLoading(true);
    setOpen(true);

    try {
      await loadFedapayCheckoutScript();
      window.FedaPay?.init({
        public_key: publicKey,
        transaction: { id: checkoutId },
        container: "#fedapay-card-container",
        onComplete: (response) => {
          if (response.reason === window.FedaPay?.CHECKOUT_COMPLETED) {
            // Optimistic only — the order is confirmed for real once the
            // webhook flips its payment status, same as mobile money.
            onApproved();
          }
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du chargement");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="cut-link mm-card-link" onClick={reveal}>
        Payer par carte bancaire à la place
      </button>
    );
  }

  return (
    <div className="mm-card-embed">
      {loading ? <p style={{ fontSize: 13, color: "var(--gris)" }}>Chargement du paiement par carte.</p> : null}
      {error ? <p className="account-error">{error}</p> : null}
      <div id="fedapay-card-container" />
    </div>
  );
}
