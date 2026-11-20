import Link from "next/link";
import { cldUrl } from "@/lib/cloudinary";
import { deliveryLabel, formatDeadline, formatPrice, type AccountOrder } from "@/lib/shop";

type Tone = "alert" | "pending" | "done" | "muted";

// Paid at delivery: an online order with no online payment attached.
function paysAtDelivery(order: AccountOrder): boolean {
  return order.canal === "en_ligne" && order.paiementStatut === null;
}

function badge(order: AccountOrder): { label: string; tone: Tone } {
  if (order.statut === "annulee") return { label: "Annulée", tone: "muted" };
  if (order.canal === "boutique") return { label: "Achetée en boutique", tone: "done" };
  if (order.payerAvant) return { label: "À payer", tone: "alert" };
  switch (order.statut) {
    case "payee":
      return { label: "Payée", tone: "pending" };
    case "expediee":
      return { label: "En route", tone: "pending" };
    case "livree":
      return { label: "Livrée", tone: "done" };
    default:
      return { label: paysAtDelivery(order) ? "Confirmée" : "En attente", tone: "pending" };
  }
}

// The steps an order goes through, and the one it is at (past the last once
// delivered). None for an in-store purchase or a cancelled order.
function tracking(order: AccountOrder): { steps: string[]; current: number } | null {
  if (order.statut === "annulee" || order.canal === "boutique") return null;
  if (paysAtDelivery(order)) {
    const current = { en_attente: 0, payee: 0, expediee: 1, livree: 3 }[order.statut];
    return { steps: ["Confirmée", "En route", "Livrée et payée"], current };
  }
  const current = { en_attente: 0, payee: 1, expediee: 2, livree: 4 }[order.statut];
  return { steps: ["Commandée", "Payée", "En route", "Livrée"], current };
}

function zoneText(order: AccountOrder): string | null {
  if (order.zoneLivraison === "lome") return "Livraison à Lomé";
  if (order.zoneLivraison === "hors_lome") return "Livraison hors de Lomé";
  return null;
}

export function AccountOrderCard({ order }: { order: AccountOrder }) {
  const status = badge(order);
  const track = tracking(order);
  const zone = zoneText(order);
  const livraison = deliveryLabel(order.zoneLivraison, order.fraisLivraison);
  const articles = order.items.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <article className={`order-card${status.tone === "muted" ? " is-muted" : ""}`}>
      <div className="order-card-head">
        <div>
          <div className="order-ref">Commande #{order.id.slice(-6).toUpperCase()}</div>
          <div className="order-date">
            {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            {" · "}
            {articles} article{articles > 1 ? "s" : ""}
            {zone ? ` · ${zone}` : null}
          </div>
        </div>
        <span className={`order-pill ${status.tone}`}>{status.label}</span>
      </div>

      <ul className="order-items">
        {order.items.map((item) => (
          <li className="order-item" key={item.id}>
            <Link className="order-item-thumb" href={`/${item.product.brand.slug}/${item.product.slug}`}>
              {item.product.image ? <img src={cldUrl(item.product.image, 160)} alt={item.product.nom} loading="lazy" /> : null}
            </Link>
            <div className="order-item-body">
              <Link className="order-item-name" href={`/${item.product.brand.slug}/${item.product.slug}`}>
                {item.product.nom}
              </Link>
              <div className="order-item-meta">
                {item.product.brand.nom}
                {item.taille ? ` · Taille ${item.taille}` : null}
                {` · ${item.quantite} × ${formatPrice(item.prixUnitaire)}`}
              </div>
            </div>
            <div className="order-item-price">{formatPrice(item.prixUnitaire * item.quantite)}</div>
          </li>
        ))}
      </ul>

      {track ? (
        <ol className="order-track" aria-label="Suivi de la commande">
          {track.steps.map((step, i) => (
            <li
              key={step}
              className={i < track.current ? "done" : i === track.current ? "current" : undefined}
              aria-current={i === track.current ? "step" : undefined}
            >
              <span className="order-track-dot" />
              <span className="order-track-label">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="order-card-foot">
        <dl className="order-totals">
          {order.remise > 0 ? (
            <div><dt>Remise</dt><dd>− {formatPrice(order.remise)}</dd></div>
          ) : null}
          {livraison ? (
            <div><dt>Livraison</dt><dd>{livraison}</dd></div>
          ) : null}
          <div className="total"><dt>Total</dt><dd>{formatPrice(order.montantTotal)}</dd></div>
        </dl>
        {order.payerAvant ? (
          <div className="order-pay">
            <Link className="btn-primary" href={`/compte/paiement?commande=${order.id}`}>
              Payer maintenant
            </Link>
            <span>avant {formatDeadline(order.payerAvant)}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
