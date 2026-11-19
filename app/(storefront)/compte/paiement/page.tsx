"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { MobileMoneyPayment } from "@/components/MobileMoneyPayment";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import { getCustomerSession } from "@/lib/api";
import { resumeOrderPayment } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "../../storefront.css";

// Pays an online order the customer left unpaid at checkout, from "Mes commandes".
function OrderPayment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = useSearchParams().get("commande") ?? "";
  const { customer, isAuthenticated } = useCustomerAuth();
  const [confirmed, setConfirmed] = useState(false);

  // Read from storage, not the context, which only fills in after mount.
  useEffect(() => {
    if (!getCustomerSession()) router.push("/compte/connexion");
  }, [router]);

  const { data: session, error } = useQuery({
    queryKey: queryKeys.orderPayment(orderId),
    queryFn: () => resumeOrderPayment(orderId),
    enabled: isAuthenticated && Boolean(orderId),
    retry: false,
    // The session does not change: refetching it would only reset the form.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  function handlePaid() {
    queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
    setConfirmed(true);
  }

  let content;
  if (!orderId) {
    content = <p className="account-error">Aucune commande indiquée.</p>;
  } else if (error) {
    content = <p className="account-error">{error instanceof Error ? error.message : "Paiement indisponible"}</p>;
  } else if (!session || !customer) {
    content = <p className="sub">Chargement...</p>;
  } else {
    content = (
      <MobileMoneyPayment
        session={session}
        defaultName={customer.nom}
        defaultPhone={customer.telephone ?? ""}
        onApproved={handlePaid}
      />
    );
  }

  return (
    <div className="account-card">
      <h1 className="display">Payer la commande{orderId ? ` #${orderId.slice(-6).toUpperCase()}` : ""}</h1>
      <p className="sub">
        Indique le nom et le numéro Flooz ou T-Money qui paie : une demande de confirmation arrive sur ce téléphone.
      </p>
      {content}
      <p className="account-switch">
        <Link className="cut-link" href="/compte">Retour à mes commandes</Link>
      </p>
      <OrderConfirmationModal mode={confirmed ? "en_ligne" : null} onClose={() => router.push("/compte")} />
    </div>
  );
}

export default function OrderPaymentPage() {
  return (
    <>
      <StorefrontFonts />
      <SiteHeader />
      <section className="account-page">
        <div className="wrap">
          <Suspense fallback={<div className="account-card"><p className="sub">Chargement...</p></div>}>
            <OrderPayment />
          </Suspense>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
