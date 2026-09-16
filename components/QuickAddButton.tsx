"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";
import type { Product } from "@/lib/shop";

export function QuickAddButton({ product }: { product: Product }) {
  const { addLine } = useCart();
  const [done, setDone] = useState(false);

  // `variants` is only present once the backend includes it on the list
  // endpoint (not guaranteed — frontend and backend deploy independently),
  // so this stays defensive rather than assuming the shape.
  const variants = product.variants ?? [];
  const variant = variants.length ? variants.find((v) => v.stock > 0) ?? variants[0] : null;
  const stock = variants.length ? variant?.stock ?? 0 : product.stock;
  const canAdd = stock > 0;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) return;

    addLine({
      productId: product.id,
      slug: product.slug,
      nom: product.nom,
      brandNom: product.brand.nom,
      brandSlug: product.brand.slug,
      image: product.images[0] ?? null,
      prixUnitaire: product.prixPromo ?? product.prix,
      variantId: variant?.id,
      variantLabel: variant?.sizeOption.label,
    });

    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <button
      className={`quick-add-btn${done ? " done" : ""}`}
      onClick={handleClick}
      disabled={!canAdd}
      aria-label={canAdd ? "Ajouter au panier" : "Indisponible"}
      title={canAdd ? "Ajouter au panier" : "Indisponible"}
    >
      {done ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
          <circle cx="9" cy="21" r="1.4" />
          <circle cx="18" cy="21" r="1.4" />
        </svg>
      )}
    </button>
  );
}
