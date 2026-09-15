import Link from "next/link";
import type { BrandSlug } from "@/lib/catalog";

// Only Instagram is live per brand for now — the other networks stay as
// visual placeholders (href="#") until those accounts exist.
const INSTAGRAM_URLS: Record<BrandSlug, string> = {
  "capsule-textile": "https://www.instagram.com/capsuletextile/",
  spicysoul: "https://www.instagram.com/spicysouul/",
  "rihan-wa-harir": "https://www.instagram.com/rihanwaharir/",
};

function socialLinks(brand?: BrandSlug) {
  return [
  {
    name: "Instagram",
    href: brand ? INSTAGRAM_URLS[brand] : "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M15 3v10.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M15 3c0 2.5 2 4.5 4.5 4.5" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 8.5h2.5V5H14c-2 0-3.5 1.6-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5l.7-3.5H14V8.5z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6.5 17.5 4 20l2.6-2.4A8 8 0 1 1 6.5 17.5z" />
        <path d="M9 9c0 3.5 2.5 6 6 6" strokeLinecap="round" />
      </svg>
    ),
  },
  ];
}

export function SiteFooter({ brand }: { brand?: BrandSlug } = {}) {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="wordmark">Blacklines</span>
            <p>Une entreprise togolaise engagée dans la valorisation du savoir-faire et de la production locale.</p>
            <div className="footer-social">
              {socialLinks(brand).map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="footer-social-icon"
                  {...(social.href !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-col">
            <h4>Boutique</h4>
            <Link href="/produits">Tous les produits</Link>
            <Link href="/capsule-textile">Capsule Textile</Link>
            <Link href="/spicysoul">Spicysoul</Link>
            <Link href="/rihan-wa-harir">Rihan Wa Harir</Link>
          </div>
          <div className="footer-col">
            <h4>Aide</h4>
            <a href="#">Livraison</a>
            <a href="#">Retours et échanges</a>
            <a href="#">Moyens de paiement</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <h4>Blacklines</h4>
            <Link href="/a-propos">À propos</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <a href="#">blacklines.tg</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Blacklines SARL, Lomé, Togo</span>
          <span>
            <Link href="/confidentialite">Confidentialité</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
