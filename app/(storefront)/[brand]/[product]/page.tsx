"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { useCart } from "@/components/CartContext";
import { useCustomerAuth } from "@/components/CustomerAuthContext";
import {
  addFavorite,
  formatPrice,
  getFavorites,
  getProduct,
  getReviews,
  postReview,
  removeFavorite,
} from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import type { BrandSlug } from "@/lib/catalog";
import "../../storefront.css";

function Stars({ note, size = "review" }: { note: number; size?: "review" | "avg" }) {
  const full = Math.round(note);
  return (
    <span className={size === "avg" ? "reviews-stars" : "review-stars"}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ brand: string; product: string }>;
}) {
  const { brand: brandSlug, product: productSlug } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addLine } = useCart();
  const { isAuthenticated } = useCustomerAuth();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("livraison");
  const [activeThumb, setActiveThumb] = useState(0);
  const [added, setAdded] = useState(false);

  const [reviewNote, setReviewNote] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { data: product, isError: failed } = useQuery({
    queryKey: queryKeys.product(productSlug),
    queryFn: async () => {
      const p = await getProduct(productSlug);
      if (p.brand.slug !== brandSlug) throw new Error("Brand mismatch");
      return p;
    },
  });

  useEffect(() => {
    if (!product?.variants.length) return;
    setSelectedVariantId((prev) => {
      if (prev && product.variants.some((v) => v.id === prev)) return prev;
      const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
      return firstInStock.id;
    });
  }, [product]);

  const { data: reviews = [] } = useQuery({
    queryKey: queryKeys.reviews(productSlug),
    queryFn: () => getReviews(productSlug),
  });

  const { data: favorites } = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavorites,
    enabled: isAuthenticated,
  });
  const isFavorite = Boolean(product && favorites?.some((f) => f.productId === product.id));

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      if (isFavorite) {
        await removeFavorite(product.id);
      } else {
        await addFavorite(product.id);
      }
    },
    onMutate: async () => {
      if (!product) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      const previous = queryClient.getQueryData(queryKeys.favorites);
      queryClient.setQueryData<typeof favorites>(queryKeys.favorites, (prev) =>
        isFavorite
          ? prev?.filter((f) => f.productId !== product.id)
          : [...(prev ?? []), { id: `optimistic-${product.id}`, productId: product.id, product }],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.favorites, context.previous);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("No product");
      return postReview(product.slug, { note: reviewNote, commentaire: reviewComment || undefined });
    },
    onSuccess: () => {
      setReviewSuccess(true);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(productSlug) });
    },
    onError: (err) => setReviewError(err instanceof Error ? err.message : "Échec de l'envoi de l'avis"),
  });

  if (failed) notFound();

  if (!product) {
    return (
      <>
        <StorefrontFonts />
        <SiteHeader />
        <section className="product">
          <div className="wrap"><p style={{ padding: "60px 0", color: "var(--gris)" }}>Chargement du produit.</p></div>
        </section>
        <SiteFooter />
      </>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const availableStock = product.variants.length ? selectedVariant?.stock ?? 0 : product.stock;
  const canAdd = availableStock > 0 && (!product.variants.length || Boolean(selectedVariantId));
  const unitPrice = product.prixPromo ?? product.prix;
  const thumbs = product.images.length ? product.images : [];

  const stockClass = product.statut === "epuise" ? "out" : product.statut === "stock_faible" ? "low" : "";
  const stockLabel =
    product.statut === "epuise"
      ? "Rupture de stock"
      : product.statut === "stock_faible"
        ? "Stock limité"
        : "En stock · Expédié sous 48h";

  function handleAddToCart() {
    if (!canAdd || !product) return;
    addLine(
      {
        productId: product.id,
        slug: product.slug,
        nom: product.nom,
        brandNom: product.brand.nom,
        brandSlug: product.brand.slug,
        image: product.images[0] ?? null,
        prixUnitaire: unitPrice,
        variantId: selectedVariant?.id,
        variantLabel: selectedVariant?.sizeOption.label,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function toggleFavorite() {
    if (!product) return;
    if (!isAuthenticated) {
      router.push("/compte/connexion");
      return;
    }
    toggleFavoriteMutation.mutate();
  }

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated) {
      setReviewError("Connecte-toi pour laisser un avis.");
      return;
    }

    setReviewError(null);
    reviewMutation.mutate();
  }

  return (
    <>
      <StorefrontFonts />
      <SiteHeader active={brandSlug as BrandSlug} />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <Link href={`/${product.brand.slug}`}>{product.brand.nom}</Link>
          <span className="sep">/</span>
          <strong>{product.nom}</strong>
        </div>
      </div>

      <section className="product">
        <div className="wrap product-grid">
          <div className="gallery">
            <div className="gallery-main">
              {thumbs[activeThumb] ? (
                <img src={thumbs[activeThumb]} alt={product.nom} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : null}
              <div className="corner" />
            </div>
            {thumbs.length > 1 ? (
              <div className="gallery-thumbs">
                {thumbs.map((src, i) => (
                  <div
                    key={src}
                    className={`thumb${activeThumb === i ? " active" : ""}`}
                    onClick={() => setActiveThumb(i)}
                    style={{ position: "relative" }}
                  >
                    <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product-info">
            <div className="eyebrow"><Link href={`/${product.brand.slug}`}>{product.brand.nom}</Link></div>
            <h1 className="display">{product.nom}</h1>
            <div className="price-row">
              {product.prixPromo ? <span className="price-old">{formatPrice(product.prix)}</span> : null}
              <span className="price">{formatPrice(unitPrice)}</span>
              <span className={`stock ${stockClass}`}>{stockLabel}</span>
            </div>
            {product.nombreAvis > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <Stars note={product.noteMoyenne ?? 0} size="avg" />
                <span className="reviews-count">{product.nombreAvis} avis</span>
              </div>
            ) : null}
            <p className="desc">{product.description ?? `Pièce ${product.brand.nom}, fabriquée à Lomé.`}</p>

            {product.variants.length ? (
              <div className="option-block">
                <div className="option-label"><span>Taille</span></div>
                <div className="size-row">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      className={`size-btn${selectedVariantId === v.id ? " active" : ""}`}
                      disabled={v.stock < 1}
                      onClick={() => setSelectedVariantId(v.id)}
                    >
                      {v.sizeOption.label}
                    </button>
                  ))}
                </div>
                {selectedVariant?.sizeOption.description ? (
                  <p className="size-guide">{selectedVariant.sizeOption.description}</p>
                ) : null}
              </div>
            ) : null}

            <div className="option-block">
              <div className="option-label"><span>Quantité</span></div>
              <div className="qty-stepper">
                <button aria-label="Diminuer" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button
                  aria-label="Augmenter"
                  onClick={() => setQty((q) => Math.min(availableStock || 1, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="buy-row">
              <button className="btn-primary" onClick={handleAddToCart} disabled={!canAdd}>
                {!canAdd ? "Indisponible" : added ? "Ajouté au panier" : "Ajouter au panier"}
              </button>
              <button
                className="btn-icon"
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                onClick={toggleFavorite}
                style={isFavorite ? { color: "#a84a3f", borderColor: "#a84a3f" } : undefined}
              >
                <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 21s-7.5-4.6-10-9.2C.4 8.6 2 5 5.6 5c2 0 3.4 1 4.4 2.4C11 6 12.4 5 14.4 5 18 5 19.6 8.6 22 11.8 19.5 16.4 12 21 12 21z" /></svg>
              </button>
            </div>

            <div className="accordion">
              {[
                { key: "matiere", title: "Matière et entretien", body: "Matière soignée, entretien délicat recommandé pour préserver les couleurs et le motif." },
                { key: "livraison", title: "Livraison et retours", body: "Expédition depuis Lomé sous 48h. Retour possible sous 14 jours si l'article n'a pas été porté." },
                { key: "paiement", title: "Paiement", body: "Paiement en ligne sécurisé à la commande, ou paiement à la livraison." },
              ].map((item) => (
                <div key={item.key} className={`acc-item${openSection === item.key ? " open" : ""}`}>
                  <button
                    className="acc-head"
                    onClick={() => setOpenSection(openSection === item.key ? null : item.key)}
                  >
                    {item.title}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                  <div className="acc-body"><p>{item.body}</p></div>
                </div>
              ))}
            </div>

            <div className="trust-mini">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-4z" /></svg>Paiement sécurisé</span>
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="1" /><path d="M8 7V5a4 4 0 0 1 8 0v2" /></svg>Fabriqué au Togo</span>
            </div>
          </div>
        </div>

        <div className="wrap">
          <div className="reviews-section">
            <div className="reviews-head">
              <h2 className="display" style={{ fontSize: 22 }}>Avis clients</h2>
              {product.nombreAvis > 0 ? (
                <>
                  <span className="reviews-avg">{(product.noteMoyenne ?? 0).toFixed(1)}</span>
                  <Stars note={product.noteMoyenne ?? 0} size="avg" />
                  <span className="reviews-count">sur {product.nombreAvis} avis</span>
                </>
              ) : null}
            </div>

            {reviews.length === 0 ? (
              <p className="review-empty">Aucun avis pour le moment. Sois le premier à donner ton avis.</p>
            ) : (
              reviews.map((review) => (
                <div className="review-item" key={review.id}>
                  <div className="review-top">
                    <span className="review-author">{review.customer.nom}</span>
                    <span className="review-date">{new Date(review.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <Stars note={review.note} />
                  {review.commentaire ? <p>{review.commentaire}</p> : null}
                </div>
              ))
            )}

            <div className="review-form">
              <h4>Laisser un avis</h4>
              {isAuthenticated ? (
                reviewSuccess ? (
                  <p className="review-note">Merci ! Ton avis sera visible après validation.</p>
                ) : (
                  <form onSubmit={handleReviewSubmit}>
                    <div className="star-input">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          type="button"
                          key={n}
                          className={n <= reviewNote ? "filled" : ""}
                          onClick={() => setReviewNote(n)}
                          aria-label={`${n} étoiles`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Ton expérience avec ce produit (facultatif)"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    {reviewError ? <p className="review-error">{reviewError}</p> : null}
                    <button className="btn-primary" type="submit" disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? "Envoi." : "Envoyer mon avis"}
                    </button>
                  </form>
                )
              ) : (
                <p className="review-note">
                  <Link href="/compte/connexion" className="cut-link">Connecte-toi</Link> pour laisser un avis.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
