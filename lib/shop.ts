import { apiFetch } from "./api";
export { formatPrice } from "./catalog";

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

export interface FedapayMode {
  mode: string;
  operateur: string;
}

export function getFedapayModes(): Promise<Record<string, FedapayMode[]>> {
  return apiFetch("/fedapay/modes");
}

export interface PaymentInit {
  checkoutId: number;
  checkoutToken: string;
  redirectUrl: string;
  publicKey: string;
  amount: number;
  currency: string;
}

export function createOrderPayment(orderId: string): Promise<PaymentInit> {
  return apiFetch(`/orders/${orderId}/payment`, { method: "POST", body: JSON.stringify({}) });
}

export function chargeMobileMoney(
  orderId: string,
  input: { reference: string; mode: string; phoneNumber: string; country: string },
): Promise<{ status: string }> {
  return apiFetch(`/orders/${orderId}/payment/mobile-money`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getPaymentStatus(
  orderId: string,
  reference: string,
): Promise<{ status: "en_attente" | "reussi" | "echoue"; orderStatut: string }> {
  return apiFetch(`/orders/${orderId}/payment/status?reference=${encodeURIComponent(reference)}`);
}
