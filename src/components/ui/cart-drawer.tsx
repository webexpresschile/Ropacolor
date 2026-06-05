"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCLP } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove, totals } = useCart();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 transition-opacity"
          onClick={close}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.18em]">
              Carrito
            </span>
            <span className="text-xs text-gray-400">({items.length})</span>
          </div>
          <button
            onClick={close}
            aria-label="Cerrar carrito"
            className="rounded-full p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">Tu carrito está vacío</p>
            <Link
              href="/catalogo"
              onClick={close}
              className="btn-outline text-xs"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => {
                  const bucket = totals.byProduct[item.productId];
                  const usesWholesale = bucket?.usesWholesale ?? false;
                  const missing = bucket?.missing ?? 0;
                  const lineTotal = usesWholesale
                    ? item.priceWholesale * item.quantity
                    : item.priceNormal * item.quantity;

                  return (
                    <li
                      key={item.variantId}
                      className="flex gap-4 border-b border-line pb-4"
                    >
                      <div className="h-24 w-20 flex-shrink-0 bg-muted">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between text-sm">
                        <div>
                          <Link
                            href={`/producto/${item.slug}`}
                            onClick={close}
                            className="font-medium text-ink hover:underline"
                          >
                            {item.name}
                          </Link>
                          <div className="mt-0.5 text-xs text-gray-500">
                            {item.color} / {item.size}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              aria-label="Reducir cantidad"
                              className="grid h-7 w-7 place-items-center rounded-none border border-line text-gray-600 hover:bg-muted transition-colors"
                              onClick={() =>
                                setQuantity(item.variantId, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Aumentar cantidad"
                              className="grid h-7 w-7 place-items-center rounded-none border border-line text-gray-600 hover:bg-muted transition-colors"
                              onClick={() =>
                                setQuantity(item.variantId, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-medium text-ink">
                              {formatCLP(lineTotal)}
                            </span>
                            <button
                              aria-label="Eliminar"
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              onClick={() => remove(item.variantId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {!usesWholesale && missing > 0 && (
                          <p className="text-[11px] text-gray-500 mt-1">
                            Te faltan {missing} unidad
                            {missing !== 1 ? "es" : ""} para precio mayorista
                          </p>
                        )}

                        {usesWholesale && (
                          <p className="text-[11px] text-green-700 mt-1">
                            Precio mayorista aplicado
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCLP(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Descuento mayorista</span>
                    <span>-{formatCLP(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-1.5 text-base font-medium">
                  <span>Total</span>
                  <span>{formatCLP(totals.total)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/carrito"
                  onClick={close}
                  className="btn-ghost w-full justify-center text-xs"
                >
                  Ver Carrito
                </Link>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="btn-primary w-full justify-center text-xs"
                >
                  Ir a Pagar
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
