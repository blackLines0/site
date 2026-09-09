"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import "../../storefront.css";

export default function ConnexionPage() {
  const router = useRouter();
  const { login } = useCustomerAuth();
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifiant, password);
      router.push("/compte");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la connexion");
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
            <h1 className="display">Connexion</h1>
            <p className="sub">Accédez à votre compte Blacklines.</p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email ou téléphone</label>
                <input type="text" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} required />
              </div>
              <div className="field">
                <label>Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {error ? <p className="account-error">{error}</p> : null}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <p className="account-switch">
              Pas encore de compte ? <Link className="cut-link" href="/compte/inscription">Créer un compte</Link>
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
