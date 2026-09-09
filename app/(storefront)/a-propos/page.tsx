import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import "../storefront.css";

export const metadata = {
  title: "À propos · Blacklines",
  description: "L'histoire et la mission de Blacklines, maison togolaise derrière Capsule Textile, Spicysoul et Rihan Wa Harir.",
};

export default function AProposPage() {
  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>À propos</strong>
        </div>
      </div>

      <section className="static-page">
        <div className="wrap">
          <div className="eyebrow">Notre histoire</div>
          <h1 className="display">Une ligne, deux vocations</h1>

          <p>
            Blacklines est une maison togolaise fondée à Lomé en 2019. Elle porte
            aujourd&apos;hui trois marques, Capsule Textile, Spicysoul et Rihan Wa Harir,
            tout en accompagnant d&apos;autres structures dans leur développement
            stratégique. Cette double vocation se lit jusque dans le tracé du logo :
            cinq traits, brisés au même angle de 18°, celui des bandes tissées
            togolaises.
          </p>

          <h2>Ce que nous portons</h2>
          <p>
            <strong>Capsule Textile</strong> valorise le tissage togolais dans sa forme
            la plus brute, en transmettant matières, motifs et gestes d&apos;atelier en
            atelier. <strong>Spicysoul</strong> habille une garde-robe qui porte
            l&apos;énergie d&apos;une Afrique en mouvement, couleur, coupe et caractère.{" "}
            <strong>Rihan Wa Harir</strong> réunit bakhour, encens, huiles et perles au
            service de la médecine prophétique et du soin du corps comme de
            l&apos;esprit.
          </p>

          <h2>Notre engagement</h2>
          <ul>
            <li>Valoriser le savoir-faire artisanal togolais.</li>
            <li>Créer des emplois durables et équitables à Lomé.</li>
            <li>Construire une communauté unie autour de l&apos;artisanat.</li>
            <li>Préserver notre patrimoine culturel pour les générations futures.</li>
          </ul>

          <h2>Fabriqué au Togo</h2>
          <p>
            Chaque pièce est conçue et fabriquée au Togo, au sein du portefeuille de
            marques Blacklines. Notre équipe, basée à Lomé, reste disponible pour
            toute question sur une commande, une pièce ou une collaboration.
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
