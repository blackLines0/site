"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const CART_KEY = "blacklines_cart";

export interface CartLine {
  productId: string;
  slug: string;
  nom: string;
  brandNom: string;
  brandSlug: string;
  image: string | null;
  prixUnitaire: number;
  variantId?: string;
  variantLabel?: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  addLine: (line: Omit<CartLine, "qty">, qty?: number) => void;
  updateQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
}

function lineKey(line: Pick<CartLine, "productId" | "variantId">): string {
  return `${line.productId}:${line.variantId ?? ""}`;
}

function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Starts empty on both server and client's first render so hydration
  // matches, then loads the real cart from localStorage right after mount.
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.prixUnitaire * l.qty, 0);

    return {
      lines,
      count,
      subtotal,
      addLine(line, qty = 1) {
        const key = lineKey(line);
        setLines((prev) => {
          const existing = prev.find((l) => lineKey(l) === key);
          if (existing) {
            return prev.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + qty } : l));
          }
          return [...prev, { ...line, qty }];
        });
      },
      updateQty(key, qty) {
        setLines((prev) =>
          prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.max(1, qty) } : l)),
        );
      },
      removeLine(key) {
        setLines((prev) => prev.filter((l) => lineKey(l) !== key));
      },
      clear() {
        setLines([]);
      },
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

export { lineKey };
