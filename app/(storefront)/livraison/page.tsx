import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import "../storefront.css";

export const metadata = {
  title: "Livraison · Blacklines",
  description: "Livraison à Lomé à 1 000 FCFA, offerte tous les mardis. Hors de Lomé, frais calculés et réglés à la livraison.",
};

// Keep in step with Backend/src/lib/delivery.ts, which prices the orders.
export default function LivraisonPage() {
  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>Livraison</strong>
        </div>
      </div>

      <section className="static-page">
        <div className="wrap">
          <div className="eyebrow">Aide</div>
          <h1 className="display">Livraison</h1>
          <div className="updated">Dernière mise à jour · Novembre 2026</div>

          <p>
            Tu choisis ta zone au moment de commander : le prix de la livraison s&apos;affiche
            dans le récapitulatif, avant que tu valides.
          </p>

          <h2>À Lomé</h2>
          <ul>
            <li><strong>1 000 FCFA</strong>, partout dans Lomé.</li>
            <li><strong>Offerte tous les mardis</strong> : toute commande passée un mardi est livrée gratuitement à Lomé.</li>
          </ul>

          <h2>Hors de Lomé</h2>
          <p>
            Nous livrons aussi en dehors de Lomé. Les frais dépendent de la destination : le
            livreur te les indique et tu les règles directement à la réception.
          </p>

          <h2>Payer sa commande</h2>
          <ul>
            <li>
              <strong>En ligne, par Flooz ou T-Money</strong> : la livraison à Lomé est comprise dans le
              montant payé. Les frais de réseau mobile money s&apos;ajoutent et s&apos;affichent avant que tu
              confirmes sur ton téléphone. Hors de Lomé, seule la livraison reste à régler au livreur.
            </li>
            <li>
              <strong>À la livraison, en espèces</strong> : tu règles la commande et la livraison au livreur.
            </li>
          </ul>

          <h2>Le jour de la livraison</h2>
          <p>
            Notre livreur te contacte au numéro indiqué dans ta commande avant de passer. Pense à
            préparer le montant exact si tu paies en espèces.
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
