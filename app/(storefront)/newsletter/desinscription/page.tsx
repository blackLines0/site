"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { unsubscribeNewsletter } from "@/lib/shop";
import "../../storefront.css";

// The link at the bottom of every newsletter. A click confirms it, so a mail
// scanner opening the link never unsubscribes anyone.
function Unsubscribe() {
  const token = useSearchParams().get("t") ?? "";
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setState("pending");
    try {
      await unsubscribeNewsletter(token);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Désinscription impossible");
      setState("error");
    }
  }

  return (
    <div className="account-card">
      <h1 className="display">Newsletter</h1>
      {state === "done" ? (
        <p className="sub">C&apos;est fait : tu ne recevras plus la newsletter Blacklines. Tu peux te réabonner depuis ton compte.</p>
      ) : (
        <>
          <p className="sub">Tu ne recevras plus notre sélection mensuelle de nouveautés.</p>
          {!token ? <p className="account-error">Lien de désinscription incomplet.</p> : null}
          {error ? <p className="account-error">{error}</p> : null}
          <button className="btn-primary" type="button" onClick={confirm} disabled={!token || state === "pending"}>
            {state === "pending" ? "Désinscription..." : "Me désinscrire"}
          </button>
        </>
      )}
      <p className="account-switch">
        <Link className="cut-link" href="/">Retour à la boutique</Link>
      </p>
    </div>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <>
      <StorefrontFonts />
      <SiteHeader />
      <section className="account-page">
        <div className="wrap">
          <Suspense fallback={<div className="account-card"><p className="sub">Chargement...</p></div>}>
            <Unsubscribe />
          </Suspense>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
