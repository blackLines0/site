"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import { AccountOrderCard } from "@/components/AccountOrderCard";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { cldUrl } from "@/lib/cloudinary";
import {
  formatDeadline,
  formatPrice,
  getFavorites,
  getLoyalty,
  getMyOrders,
  getNewsletterStatus,
  setNewsletterStatus,
  type OrderStatus,
} from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "../storefront.css";

// Orders shown before "Voir les autres".
const ORDERS_SHOWN = 4;
const PAID_STATUSES: OrderStatus[] = ["payee", "expediee", "livree"];

const subscribeNothing = () => () => {};

export default function ComptePage() {
  const router = useRouter();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  // The session lives in localStorage: nothing to show before the client has it.
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push("/compte/connexion");
    }
  }, [isClient, isAuthenticated, router]);

  const { data: orders = null } = useQuery({
    queryKey: queryKeys.myOrders,
    queryFn: getMyOrders,
    enabled: isAuthenticated,
  });

  const { data: favorites = null } = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavorites,
    enabled: isAuthenticated,
  });

  const { data: loyalty } = useQuery({
    queryKey: queryKeys.loyalty,
    queryFn: getLoyalty,
    enabled: isAuthenticated,
  });

  const queryClient = useQueryClient();
  const { data: newsletter } = useQuery({
    queryKey: queryKeys.newsletter,
    queryFn: getNewsletterStatus,
    enabled: isAuthenticated,
  });
  const toggleNewsletter = useMutation({
    mutationFn: setNewsletterStatus,
    onSuccess: (status) => queryClient.setQueryData(queryKeys.newsletter, status),
  });

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (!isClient || !isAuthenticated || !customer) {
    return (
      <>
        <StorefrontFonts />
        <SiteHeader />
        <section className="account-page"><div className="wrap"><p style={{ textAlign: "center", color: "var(--gris)" }}>Chargement...</p></div></section>
        <SiteFooter />
      </>
    );
  }

  const prenom = customer.nom.trim().split(/\s+/)[0];
  const placed = orders?.filter((o) => o.statut !== "annulee") ?? [];
  const spent = orders?.filter((o) => PAID_STATUSES.includes(o.statut)).reduce((sum, o) => sum + o.montantTotal, 0) ?? 0;
  const due = orders?.filter((o) => o.payerAvant) ?? [];
  const shownOrders = orders ? (showAllOrders ? orders : orders.slice(0, ORDERS_SHOWN)) : [];
  const hasLoyalty = Boolean(loyalty && (loyalty.programme || loyalty.recompenses.length > 0));

  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <section className="account-hero">
        <div className="wrap">
          <div className="account-hero-top">
            <div>
              <div className="eyebrow">Mon compte</div>
              <h1 className="display">Bonjour, <em>{prenom}</em></h1>
              <p className="account-contact">{[customer.email, customer.telephone].filter(Boolean).join(" · ")}</p>
            </div>
            <button type="button" className="account-logout cut-link" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
          <dl className="account-stats">
            <div>
              <dt>Commandes</dt>
              <dd>{orders ? placed.length : "—"}</dd>
            </div>
            <div>
              <dt>Achats payés</dt>
              <dd>{orders ? formatPrice(spent) : "—"}</dd>
            </div>
            <div>
              <dt>Favoris</dt>
              <dd>{favorites ? favorites.length : "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="account-body">
        <div className="wrap">
          {due.length > 0 ? (
            <div className="account-due">
              <div className="account-due-title">
                {due.length === 1 ? "Une commande attend ton paiement" : `${due.length} commandes attendent ton paiement`}
              </div>
              {due.map((order) => (
                <div className="account-due-row" key={order.id}>
                  <span>
                    <strong>#{order.id.slice(-6).toUpperCase()}</strong> · {formatPrice(order.montantTotal)} · avant{" "}
                    {formatDeadline(order.payerAvant!)}
                  </span>
                  <Link className="btn-primary" href={`/compte/paiement?commande=${order.id}`}>Payer</Link>
                </div>
              ))}
              <p>Passé ce délai, la commande est annulée et ses articles remis en vente.</p>
            </div>
          ) : null}

          <div className={`account-grid${hasLoyalty ? "" : " no-loyalty"}`}>
            <div className="account-orders">
              <div className="account-section-head">
                <h2 className="display">Mes commandes</h2>
              </div>
              {orders === null ? (
                <p className="account-muted">Chargement...</p>
              ) : orders.length === 0 ? (
                <div className="account-empty">
                  <p>Aucune commande pour le moment.</p>
                  <Link className="btn-primary" href="/">Découvrir les marques</Link>
                </div>
              ) : (
                <>
                  {shownOrders.map((order) => (
                    <AccountOrderCard key={order.id} order={order} />
                  ))}
                  {orders.length > ORDERS_SHOWN && !showAllOrders ? (
                    <button type="button" className="account-more" onClick={() => setShowAllOrders(true)}>
                      Voir {orders.length - ORDERS_SHOWN === 1 ? "l'autre commande" : `les ${orders.length - ORDERS_SHOWN} autres commandes`}
                    </button>
                  ) : null}
                </>
              )}
            </div>

            {hasLoyalty && loyalty ? (
              <div className="account-loyalty">
                <LoyaltyCard loyalty={loyalty} />
              </div>
            ) : null}

            <aside className="account-side">
              <div className="account-panel">
                <h3 className="display">Newsletter</h3>
                {newsletter ? (
                  newsletter.email ? (
                    <label className="toggle-row">
                      <span>
                        Chaque début de mois, une sélection de nouveautés choisies pour toi.
                        <span className="hint">Envoyée à {newsletter.email}</span>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        className="toggle"
                        checked={newsletter.abonne}
                        disabled={toggleNewsletter.isPending}
                        onChange={(e) => toggleNewsletter.mutate(e.target.checked)}
                      />
                    </label>
                  ) : (
                    <p className="account-muted">Ajoute une adresse email à ton compte pour recevoir la newsletter.</p>
                  )
                ) : (
                  <p className="account-muted">Chargement...</p>
                )}
                {toggleNewsletter.isError ? (
                  <p className="account-error" style={{ margin: "10px 0 0" }}>
                    {toggleNewsletter.error instanceof Error ? toggleNewsletter.error.message : "Échec de la mise à jour"}
                  </p>
                ) : null}
              </div>

              <div className="account-panel">
                <h3 className="display">Mes informations</h3>
                <dl className="account-info">
                  <div><dt>Nom</dt><dd>{customer.nom}</dd></div>
                  {customer.email ? <div><dt>Email</dt><dd>{customer.email}</dd></div> : null}
                  {customer.telephone ? <div><dt>Téléphone</dt><dd>{customer.telephone}</dd></div> : null}
                  {customer.adresse ? <div><dt>Adresse</dt><dd>{customer.adresse}</dd></div> : null}
                </dl>
              </div>
            </aside>
          </div>

          <div className="account-favorites">
            <div className="account-section-head">
              <h2 className="display">Mes favoris</h2>
              {favorites && favorites.length > 0 ? <span className="account-count">{favorites.length}</span> : null}
            </div>
            {favorites === null ? (
              <p className="account-muted">Chargement...</p>
            ) : favorites.length === 0 ? (
              <div className="account-empty">
                <p>Aucun favori pour l&apos;instant. Touche le cœur d&apos;un produit pour le retrouver ici.</p>
                <Link className="btn-primary" href="/">Parcourir les marques</Link>
              </div>
            ) : (
              <div className="products">
                {favorites.map((favorite) => (
                  <Link className="card" href={`/${favorite.product.brand.slug}/${favorite.product.slug}`} key={favorite.id}>
                    <div className="card-img">
                      {favorite.product.images[0] ? (
                        <img src={cldUrl(favorite.product.images[0], 500)} alt={favorite.product.nom} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : null}
                      <div className="corner" />
                    </div>
                    <div className="card-brand">{favorite.product.brand.nom}</div>
                    <div className="card-name">{favorite.product.nom}</div>
                    <div className="card-price">
                      {favorite.product.prixPromo ? (
                        <>
                          <span style={{ textDecoration: "line-through", opacity: 0.5, marginRight: 8, fontWeight: 500 }}>
                            {formatPrice(favorite.product.prix)}
                          </span>
                          {formatPrice(favorite.product.prixPromo)}
                        </>
                      ) : (
                        formatPrice(favorite.product.prix)
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
