import { apiFetch } from "./api";
import { formatPrice } from "./catalog";
export { formatPrice };

export interface Brand {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
}

export interface Category {
  id: string;
  nom: string;
  slug: string;
}

export interface SizeOption {
  id: string;
  label: string;
  description: string | null;
  ordre: number;
}

export interface BrandDetail extends Brand {
  categories: Category[];
  sizeOptions: SizeOption[];
}

export interface ProductVariant {
  id: string;
  stock: number;
  sizeOption: SizeOption;
}

export interface Product {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  prix: number;
  prixPromo: number | null;
  images: string[];
  stock: number;
  statut: "en_stock" | "stock_faible" | "epuise";
  noteMoyenne: number | null;
  nombreAvis: number;
  brand: Brand;
  category: Category | null;
  variants: ProductVariant[];
}

export interface HeroSlide {
  id: string;
  image: string;
  titre: string | null;
  sousTitre: string | null;
  lien: string | null;
  ordre: number;
}

export interface Announcement {
  id: string;
  texte: string;
  codePromo: string | null;
  dateFin: string | null;
}

export interface Review {
  id: string;
  note: number;
  commentaire: string | null;
  createdAt: string;
  customer: { id: string; nom: string };
}

export interface Favorite {
  id: string;
  productId: string;
  product: Product;
}


export function getBrands(): Promise<Brand[]> {
  return apiFetch<Brand[]>("/brands");
}

export function getBrand(slug: string): Promise<BrandDetail> {
  return apiFetch<BrandDetail>(`/brands/${slug}`);
}

export interface ProductFilters {
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  promo?: boolean;
  sort?: "recent" | "prix_asc" | "prix_desc" | "note_desc";
}

export function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.promo) params.set("promo", "true");
  if (filters.sort) params.set("sort", filters.sort);

  const qs = params.toString();
  return apiFetch<Product[]>(`/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${slug}`);
}

export function getHeroSlides(): Promise<HeroSlide[]> {
  return apiFetch<HeroSlide[]>("/hero-slides");
}

export function getAnnouncement(): Promise<Announcement | null> {
  return apiFetch<Announcement | null>("/announcement");
}

export function getReviews(productSlug: string): Promise<Review[]> {
  return apiFetch<Review[]>(`/products/${productSlug}/reviews`);
}

export function postReview(
  productSlug: string,
  input: { note: number; commentaire?: string },
): Promise<Review> {
  return apiFetch<Review>(`/products/${productSlug}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getFavorites(): Promise<Favorite[]> {
  return apiFetch<Favorite[]>("/me/favorites");
}

export function addFavorite(productId: string): Promise<Favorite> {
  return apiFetch<Favorite>("/me/favorites", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export function removeFavorite(productId: string): Promise<void> {
  return apiFetch<void>(`/me/favorites/${productId}`, { method: "DELETE" });
}

export function validatePromoCode(
  code: string,
  montantTotal: number,
): Promise<{ remise: number; code: string }> {
  return apiFetch("/promo-codes/validate", {
    method: "POST",
    body: JSON.stringify({ code, montantTotal }),
  });
}

export type PaymentNetwork = "flooz" | "tmoney";

export const NETWORK_LABELS: Record<PaymentNetwork, string> = {
  flooz: "Flooz (Moov)",
  tmoney: "T-Money (Yas)",
};

// Display only: the API decides. Keep in sync with Backend/src/lib/phone.ts.
const NETWORK_PREFIXES: Record<PaymentNetwork, string[]> = {
  flooz: ["78", "79", "94", "95", "96", "97", "98", "99"],
  tmoney: ["70", "71", "72", "73", "90", "91", "92", "93"],
};

export function detectNetwork(raw: string): PaymentNetwork | null {
  const match = /^(?:(?:\+|00)?228)?(\d{8})$/.exec(raw.replace(/[\s.\-()]/g, ""));
  if (!match) return null;
  const prefix = match[1].slice(0, 2);
  if (NETWORK_PREFIXES.flooz.includes(prefix)) return "flooz";
  if (NETWORK_PREFIXES.tmoney.includes(prefix)) return "tmoney";
  return null;
}

export type PaymentAttemptStatus = "en_attente" | "reussi" | "echoue" | "expire" | "annule";

export interface NetworkQuote {
  frais: number;
  total: number;
}

// What a checkout needs to pay one order, from the order creation or from
// the account ("payer plus tard"). Amounts are the API's, never recomputed here.
export type DeliveryZone = "lome" | "hors_lome";

export interface PaymentSession {
  orderId: string;
  paymentToken: string;
  // The order total, delivery in Lomé included.
  montant: number;
  zoneLivraison: DeliveryZone | null;
  // Null outside Lomé: the courier collects it at delivery.
  fraisLivraison: number | null;
  payerAvant: string;
  reseaux: Record<PaymentNetwork, NetworkQuote>;
}

// The network fee rates in percent, for the summary before the order exists.
export function getNetworkFees(): Promise<Record<PaymentNetwork, number>> {
  return apiFetch("/payments/fees");
}

export function resumeOrderPayment(orderId: string): Promise<PaymentSession> {
  return apiFetch(`/customers/me/orders/${orderId}/payment`, { method: "POST", body: JSON.stringify({}) });
}

export function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export interface PaymentStarted {
  paymentId: string;
  statut: PaymentAttemptStatus;
  reseau: PaymentNetwork;
  // What the phone asks for: the order total plus `frais`.
  montant: number;
  frais: number;
  // PayGate did not answer clearly: a prompt may or may not be on its way.
  incertain?: boolean;
}

export function startPayment(
  orderId: string,
  input: { token: string; nom: string; telephone: string },
): Promise<PaymentStarted> {
  return apiFetch(`/orders/${orderId}/payment`, { method: "POST", body: JSON.stringify(input) });
}

export interface PaymentStatus {
  commande: string;
  paiement: PaymentAttemptStatus | null;
  // Paid, but the order could not take it (amount, already paid): the team follows up.
  aVerifier: boolean;
}

export function getPaymentStatus(orderId: string, token: string): Promise<PaymentStatus> {
  return apiFetch(`/orders/${orderId}/payment/status`, { method: "POST", body: JSON.stringify({ token }) });
}

export interface LoyaltyReward {
  id: string;
  programme: string;
  type: "bon_achat" | "produit";
  montantBon: number | null;
  produit: string | null;
  code: string | null;
  utilise: boolean;
  remisLe: string | null;
  createdAt: string;
}

export interface Loyalty {
  programme: {
    nom: string;
    type: "nombre_commandes" | "montant_depense";
    objectif: number;
    recompense: "bon_achat" | "produit";
    montantBon: number | null;
    produit: { nom: string; image: string | null; url: string } | null;
  } | null;
  progression: { valeur: number; objectif: number; cartesCompletees: number } | null;
  recompenses: LoyaltyReward[];
}

export function getLoyalty(): Promise<Loyalty> {
  return apiFetch("/customers/me/fidelite");
}

export interface NewsletterStatus {
  abonne: boolean;
  email: string | null;
}

export function getNewsletterStatus(): Promise<NewsletterStatus> {
  return apiFetch("/customers/me/newsletter");
}

export function setNewsletterStatus(abonne: boolean): Promise<NewsletterStatus> {
  return apiFetch("/customers/me/newsletter", { method: "PUT", body: JSON.stringify({ abonne }) });
}

export function unsubscribeNewsletter(token: string): Promise<{ ok: true }> {
  return apiFetch("/newsletter/unsubscribe", { method: "POST", body: JSON.stringify({ token }) });
}

export interface DeliveryQuote {
  lome: { frais: number; tarif: number; gratuitAujourdhui: boolean };
  horsLome: { frais: null };
}

// Today's delivery fees, from the API's clock (the one the order is priced on).
export function getDeliveryQuote(): Promise<DeliveryQuote> {
  return apiFetch("/delivery");
}

// How the delivery of an order reads in a summary.
export function deliveryLabel(zone: DeliveryZone | null, frais: number | null): string | null {
  if (zone === "lome") return frais ? formatPrice(frais) : "Offerte (mardi)";
  if (zone === "hors_lome") return "Payée au livreur";
  return null;
}
