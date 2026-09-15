"use client";

import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StorefrontFonts } from "@/components/StorefrontFonts";
import { formatPrice, getBrands, getProducts, type ProductFilters } from "@/lib/shop";
import { queryKeys } from "@/lib/queryKeys";
import "../storefront.css";

const SORT_OPTIONS: { value: NonNullable<ProductFilters["sort"]>; label: string }[] = [
  { value: "recent", label: "Plus récents" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
  { value: "note_desc", label: "Mieux notés" },
];

function ProduitsPageInner() {
  const searchParams = useSearchParams();

  const [brandFilter, setBrandFilter] = useState<string | null>(searchParams.get("brand"));
  const [promoOnly, setPromoOnly] = useState(searchParams.get("promo") === "true");
  const [sort, setSort] = useState<NonNullable<ProductFilters["sort"]>>("recent");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: brands = [] } = useQuery({
    queryKey: queryKeys.brands,
    queryFn: getBrands,
  });

  const filters: ProductFilters = {
    brand: brandFilter ?? undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    promo: promoOnly || undefined,
    sort,
  };

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => getProducts(filters),
  });

  return (
    <>
      <StorefrontFonts />
      <SiteHeader />

      <div className="breadcrumb">
        <div className="wrap">
          <Link href="/">Blacklines</Link>
          <span className="sep">/</span>
          <strong>Tous les produits</strong>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">Catalogue complet</div>
              <h2 className="display">Tous les produits</h2>
            </div>
          </div>

          <div className="filters">
            <button className={`chip${brandFilter === null ? " active" : ""}`} onClick={() => setBrandFilter(null)}>
              Toutes les marques
            </button>
            {brands.map((b) => (
              <button
                key={b.slug}
                className={`chip${brandFilter === b.slug ? " active" : ""}`}
                onClick={() => setBrandFilter(b.slug)}
              >
                {b.nom}
              </button>
            ))}
            <button className={`chip${promoOnly ? " active" : ""}`} onClick={() => setPromoOnly((v) => !v)}>
              En promo
            </button>
          </div>

          <div className="catalog-toolbar">
            <div className="catalog-price">
              <input
                type="number"
                placeholder="Prix min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>à</span>
              <input
                type="number"
                placeholder="Prix max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as NonNullable<ProductFilters["sort"]>)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="products">
            {loading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <p style={{ color: "var(--gris)" }}>Aucun produit ne correspond à ces critères.</p>
            ) : (
              products.map((product) => (
                <Link className="card" href={`/${product.brand.slug}/${product.slug}`} key={product.slug}>
                  <div className="card-img">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.nom} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                    <div className="corner" />
                  </div>
                  <div className="card-brand">{product.brand.nom}</div>
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
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

export default function ProduitsPage() {
  return (
    <Suspense fallback={null}>
      <ProduitsPageInner />
    </Suspense>
  );
}
