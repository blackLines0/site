"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { QuickAddButton } from "@/components/QuickAddButton";
import { getBrand, getProducts, formatPrice } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";

export function BrandCollection({ brandSlug, brandNom }: { brandSlug: string; brandNom: string }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: brandDetail } = useQuery({
    queryKey: queryKeys.brand(brandSlug),
    queryFn: () => getBrand(brandSlug),
  });
  const categories = brandDetail?.categories ?? [];

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.products({ brand: brandSlug, category: activeCategory ?? undefined }),
    queryFn: () => getProducts({ brand: brandSlug, category: activeCategory ?? undefined }),
  });

  return (
    <>
      <div className="filters">
        <button
          className={`chip${activeCategory === null ? " active" : ""}`}
          onClick={() => setActiveCategory(null)}
        >
          Toutes les pièces
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip${activeCategory === c.slug ? " active" : ""}`}
            onClick={() => setActiveCategory(c.slug)}
          >
            {c.nom}
          </button>
        ))}
      </div>
      <div className="products">
        {loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <p style={{ color: "var(--gris)" }}>Aucun produit disponible pour le moment.</p>
        ) : (
          products.map((product) => (
            <Link className="card" href={`/${brandSlug}/${product.slug}`} key={product.slug}>
              <div className="card-img">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.nom}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
                <div className="corner" />
                <QuickAddButton product={product} />
              </div>
              <div className="card-brand">{brandNom}</div>
              <div className="card-name">{product.nom}</div>
              <div className="card-price">
                {product.prixPromo ? (
                  <>
                    <span style={{ textDecoration: "line-through", opacity: 0.5, marginRight: 8, fontWeight: 500 }}>
                      {formatPrice(product.prix)}
                    </span>
                    {formatPrice(product.prixPromo)}
                  </>
                ) : (
                  formatPrice(product.prix)
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
