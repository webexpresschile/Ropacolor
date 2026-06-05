"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, CartTotals } from "./cart-types";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, qty: number) => void;
  clear: () => void;
  totals: CartTotals;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "ropacolor:cart:v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const add = useCallback<CartContextValue["add"]>((item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback<CartContextValue["remove"]>((variantId) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    (variantId, qty) => {
      setItems((prev) =>
        prev
          .map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(0, qty) }
              : i
          )
          .filter((i) => i.quantity > 0)
      );
    },
    []
  );

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo<CartTotals>(() => {
    const byProduct: CartTotals["byProduct"] = {};
    for (const i of items) {
      const bucket = byProduct[i.productId] || {
        qty: 0,
        usesWholesale: false,
        missing: 0,
      };
      bucket.qty += i.quantity;
      byProduct[i.productId] = bucket;
    }
    let subtotal = 0;
    let discount = 0;
    let wholesaleSavings = 0;
    for (const i of items) {
      subtotal += i.priceNormal * i.quantity;
      const bucket = byProduct[i.productId];
      const usesWholesale = bucket.qty >= i.minWholesaleQty;
      if (usesWholesale) {
        const lineWS = i.priceWholesale * i.quantity;
        const lineN = i.priceNormal * i.quantity;
        discount += lineN - lineWS;
        wholesaleSavings += lineN - lineWS;
        bucket.usesWholesale = true;
        bucket.missing = 0;
      } else {
        bucket.missing = i.minWholesaleQty - bucket.qty;
      }
    }
    const total = subtotal - discount;
    return { subtotal, discount, total, wholesaleSavings, byProduct };
  }, [items]);

  const itemCount = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    isOpen,
    open,
    close,
    toggle,
    add,
    remove,
    setQuantity,
    clear,
    totals,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
