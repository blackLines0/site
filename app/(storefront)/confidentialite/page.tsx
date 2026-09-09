import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import "../storefront.css";

export const metadata = {
  title: "Confidentialité · Blacklines",
  description: "Comment Blacklines collecte, utilise et protège les données de ses clientes et clients.",
};

export default function ConfidentialitePage() {
  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>Confidentialité</strong>
        </div>
      </div>

      <section className="static-page">
        <div className="wrap">
          <div className="eyebrow">Vie privée</div>
          <h1 className="display">Politique de confidentialité</h1>
          <div className="updated">Dernière mise à jour · Septembre 2026</div>

          <p>
            Cette page explique quelles données Blacklines collecte lorsque tu utilises
            ce site, pourquoi, et comment tu peux en garder le contrôle.
          </p>

          <h2>Données que nous collectons</h2>
          <ul>
            <li>Nom, adresse email et numéro de téléphone, quand tu crées un compte ou passes une commande.</li>
            <li>Adresse de livraison et détails de la commande (articles, montant, moyen de paiement choisi).</li>
            <li>Historique des commandes, si tu as un compte client.</li>
            <li>Avis et notes que tu laisses sur un produit.</li>
          </ul>

          <h2>Comment nous les utilisons</h2>
          <p>
            Ces informations servent uniquement à traiter tes commandes, assurer la
            livraison, gérer ton compte et répondre à tes questions. Nous ne vendons ni
            ne partageons tes données avec des tiers à des fins publicitaires.
          </p>

          <h2>Paiement en ligne</h2>
          <p>
            Lorsque tu choisis le paiement en ligne, un compte client est créé afin de
            suivre ta commande. Ton mot de passe est stocké de façon chiffrée : nous n&apos;y
            avons jamais accès en clair. Le paiement à la livraison, lui, ne nécessite
            aucune création de compte.
          </p>

          <h2>Cookies et stockage local</h2>
          <p>
            Le site utilise le stockage local de ton navigateur pour retenir le contenu
            de ton panier et ta session de connexion, uniquement sur cet appareil. Aucun
            cookie de suivi publicitaire n&apos;est utilisé.
          </p>

          <h2>Tes droits</h2>
          <p>
            Tu peux demander à tout moment l&apos;accès, la correction ou la suppression de
            tes données personnelles en nous contactant. Nous conservons les informations
            de commande le temps nécessaire au suivi légal et comptable, puis les
            supprimons.
          </p>

          <h2>Nous contacter</h2>
          <p>
            Pour toute question sur cette politique ou sur tes données, écris-nous à{" "}
            <a href="mailto:contact@blacklines.tg" className="cut-link">contact@blacklines.tg</a>.
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
