"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import "../../storefront.css";

export default function InscriptionPage() {
  const router = useRouter();
  const { register } = useCustomerAuth();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email && !telephone) {
      setError("Renseigne au moins un email ou un numéro de téléphone.");
      return;
    }

    setLoading(true);

    try {
      await register({ nom, email: email || undefined, telephone: telephone || undefined, password });
      router.push("/compte");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <section className="account-page">
        <div className="wrap">
          <div className="account-card">
            <h1 className="display">Créer un compte</h1>
            <p className="sub">Pour suivre vos commandes et aller plus vite au prochain achat.</p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Nom</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Téléphone</label>
                <input type="tel" placeholder="+228 90 00 00 00" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>
              <div className="field">
                <label>Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>

              {error ? <p className="account-error">{error}</p> : null}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer mon compte"}
              </button>
            </form>

            <p className="account-switch">
              Déjà un compte ? <Link className="cut-link" href="/compte/connexion">Se connecter</Link>
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
