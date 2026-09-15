"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
import { getFavorites } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "../storefront.css";

interface OrderHistoryItem {
  id: string;
  statut: string;
  montantTotal: number;
  createdAt: string;
  items: { quantite: number; product: { nom: string } }[];
}

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  payee: "Payée",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export default function ComptePage() {
  const router = useRouter();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    setCheckedAuth(true);
  }, []);

  useEffect(() => {
    if (checkedAuth && !isAuthenticated) {
      router.push("/compte/connexion");
    }
  }, [checkedAuth, isAuthenticated, router]);

  const { data: orders = null } = useQuery({
    queryKey: queryKeys.myOrders,
    queryFn: () => apiFetch<OrderHistoryItem[]>("/customers/me/orders"),
    enabled: isAuthenticated,
  });

  const { data: favorites = null } = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavorites,
    enabled: isAuthenticated,
  });

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (!checkedAuth || !isAuthenticated || !customer) {
    return (
      <>
        <StorefrontFonts />
        <SiteHeader />
        <section className="account-page"><div className="wrap"><p style={{ textAlign: "center", color: "var(--gris)" }}>Chargement...</p></div></section>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <section className="account-page">
        <div className="wrap account-dashboard">
          <div className="account-summary">
            <div>
              <h1 className="display">Bonjour, {customer.nom}</h1>
              <p>{customer.email ?? customer.telephone}</p>
            </div>
            <button className="btn-ghost" onClick={handleLogout} style={{ border: "none", textDecoration: "underline" }}>
              Déconnexion
            </button>
          </div>

          <h2 className="display" style={{ fontSize: 20, marginBottom: 16 }}>Mes commandes</h2>

          {orders === null ? (
            <p style={{ color: "var(--gris)" }}>Chargement...</p>
          ) : orders.length === 0 ? (
            <p style={{ color: "var(--gris)" }}>Aucune commande pour le moment.</p>
          ) : (
            orders.map((order) => (
              <div className="order-history-item" key={order.id}>
                <div>
                  <div className="id">#{order.id.slice(-6).toUpperCase()}</div>
                  <div className="meta">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")} · {order.items.length} article{order.items.length > 1 ? "s" : ""} · {STATUS_LABELS[order.statut] ?? order.statut}
                  </div>
                </div>
                <div className="amount">{formatPrice(order.montantTotal)}</div>
              </div>
            ))
          )}

          <h2 className="display" style={{ fontSize: 20, margin: "40px 0 16px" }}>Mes favoris</h2>

          {favorites === null ? (
            <p style={{ color: "var(--gris)" }}>Chargement...</p>
          ) : favorites.length === 0 ? (
            <p style={{ color: "var(--gris)" }}>Aucun produit enregistré pour le moment.</p>
          ) : (
            <div className="products">
              {favorites.map((favorite) => (
                <Link className="card" href={`/${favorite.product.brand.slug}/${favorite.product.slug}`} key={favorite.id}>
                  <div className="card-img">
                    {favorite.product.images[0] ? (
                      <img src={favorite.product.images[0]} alt={favorite.product.nom} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
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
      </section>

      <SiteFooter />
    </>
  );
}
