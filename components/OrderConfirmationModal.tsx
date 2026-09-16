"use client";

import { useEffect } from "react";

const COPY = {
  en_ligne: {
    title: "Paiement confirmé",
    body: "Merci ! Ta commande a été validée et le paiement effectué avec succès.",
  },
  livraison: {
    title: "Commande confirmée",
    body: "Merci ! Ta commande est enregistrée, tu payeras en espèces à la livraison.",
  },
} as const;

export function OrderConfirmationModal({
  mode,
  onClose,
}: {
  mode: "en_ligne" | "livraison" | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!mode) return;
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (!mode) return null;
  const copy = COPY[mode];

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true">
      <div className="confirm-card">
        <button className="confirm-close" aria-label="Fermer" onClick={onClose}>
          ×
        </button>
        <svg className="confirm-check" viewBox="0 0 80 80" fill="none">
          <circle className="confirm-check-circle" cx="40" cy="40" r="36" strokeWidth="4" />
          <path className="confirm-check-mark" d="M24 41 L35 52 L57 28" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="display confirm-title">{copy.title}</h2>
        <p className="confirm-body">{copy.body}</p>
      </div>
    </div>
  );
}
