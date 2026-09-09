"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/catalog";
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
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
