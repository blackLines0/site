"use client";

import { useState } from "react";
import Link from "next/link";
import { cldUrl } from "@/lib/cloudinary";
import { formatPrice, type Loyalty, type LoyaltyReward } from "@/lib/shop";

// Stamps read well up to a couple of rows; a longer card shows as a gauge.
const MAX_STAMPS = 20;

function rewardText(programme: NonNullable<Loyalty["programme"]>): string {
  return programme.recompense === "bon_achat"
    ? `un bon d'achat de ${formatPrice(programme.montantBon ?? 0)}`
    : programme.produit?.nom ?? "un cadeau";
}

function Stamps({ valeur, objectif }: { valeur: number; objectif: number }) {
  return (
    <div className="loyalty-stamps" role="img" aria-label={`${valeur} commande${valeur > 1 ? "s" : ""} sur ${objectif}`}>
      {Array.from({ length: objectif }, (_, i) => {
        const done = i < valeur;
        const last = i === objectif - 1;
        return (
          <span
            key={i}
            className={`loyalty-stamp${done ? " done" : ""}${last ? " last" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {done ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            ) : last ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="9" width="18" height="12" rx="1" /><path d="M12 9v12M3 13h18" /><path d="M12 9c-1.5-3-5-4-5-1.5S10 9 12 9Zm0 0c1.5-3 5-4 5-1.5S14 9 12 9Z" /></svg>
            ) : (
              <span className="loyalty-stamp-n">{i + 1}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function Gauge({ valeur, objectif }: { valeur: number; objectif: number }) {
  const pct = Math.min(100, Math.round((valeur / objectif) * 100));
  return (
    <div className="loyalty-gauge" role="progressbar" aria-valuemin={0} aria-valuemax={objectif} aria-valuenow={valeur}>
      <div className="loyalty-gauge-fill" style={{ "--pct": `${Math.max(pct, 2)}%` } as React.CSSProperties} />
    </div>
  );
}

function RewardRow({ reward }: { reward: LoyaltyReward }) {
  const [copied, setCopied] = useState(false);

  if (reward.type === "produit") {
    return (
      <div className="loyalty-reward">
        <div>
          <div className="loyalty-reward-title">Cadeau : {reward.produit ?? "produit offert"}</div>
          <div className="loyalty-reward-meta">
            {reward.remisLe
              ? `Remis le ${new Date(reward.remisLe).toLocaleDateString("fr-FR")}`
              : "Notre équipe te contacte pour te le remettre"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`loyalty-reward${reward.utilise ? " used" : ""}`}>
      <div>
        <div className="loyalty-reward-title">Bon d&apos;achat de {formatPrice(reward.montantBon ?? 0)}</div>
        <div className="loyalty-reward-meta">
          {reward.utilise ? "Déjà utilisé" : "À saisir dans « Code promo » au moment de payer"}
        </div>
      </div>
      {reward.code && !reward.utilise ? (
        <button
          type="button"
          className="loyalty-code"
          onClick={() => {
            navigator.clipboard?.writeText(reward.code!).then(() => setCopied(true)).catch(() => {});
          }}
          title="Copier le code"
        >
          {copied ? "Copié !" : reward.code}
        </button>
      ) : null}
    </div>
  );
}

export function LoyaltyCard({ loyalty }: { loyalty: Loyalty }) {
  const { programme, progression, recompenses } = loyalty;
  if (!programme && recompenses.length === 0) return null;

  return (
    <section className="loyalty">
      <h2 className="display" style={{ fontSize: 20, marginBottom: 16 }}>Ma carte fidélité</h2>

      {programme && progression ? (
        <div className="loyalty-card">
          <div className="loyalty-head">
            <div>
              <div className="display loyalty-name">{programme.nom}</div>
              <div className="loyalty-goal">
                {programme.type === "nombre_commandes"
                  ? `${programme.objectif} commandes = ${rewardText(programme)}`
                  : `${formatPrice(programme.objectif)} d'achats = ${rewardText(programme)}`}
              </div>
            </div>
            {programme.produit?.image ? (
              <Link href={programme.produit.url} className="loyalty-prize">
                <img src={cldUrl(programme.produit.image, 160)} alt={programme.produit.nom} />
              </Link>
            ) : null}
          </div>

          {programme.type === "nombre_commandes" && programme.objectif <= MAX_STAMPS ? (
            <Stamps valeur={progression.valeur} objectif={programme.objectif} />
          ) : (
            <Gauge valeur={progression.valeur} objectif={programme.objectif} />
          )}

          <p className="loyalty-status">
            {programme.type === "nombre_commandes" ? (
              <>
                <strong>{progression.valeur} / {programme.objectif}</strong> commandes · encore{" "}
                <strong>{programme.objectif - progression.valeur}</strong> pour gagner {rewardText(programme)}
              </>
            ) : (
              <>
                <strong>{formatPrice(progression.valeur)}</strong> sur {formatPrice(programme.objectif)} · encore{" "}
                <strong>{formatPrice(programme.objectif - progression.valeur)}</strong> pour gagner {rewardText(programme)}
              </>
            )}
          </p>
          <p className="loyalty-note">Chaque commande payée ou livrée compte. Une nouvelle carte commence après chaque récompense.</p>
        </div>
      ) : null}

      {recompenses.length > 0 ? (
        <div className="loyalty-rewards">
          <h3>Mes récompenses</h3>
          {recompenses.map((reward) => (
            <RewardRow key={reward.id} reward={reward} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
