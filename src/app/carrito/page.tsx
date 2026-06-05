"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCLP } from "@/lib/utils";

export default function CarritoPage() {
  const { items, setQuantity, remove, totals, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container-x">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <h1 className="mt-6 font-display text-2xl">Tu carrito está vacío</h1>
            <p className="mt-2 text-sm text-gray-500">
              Agrega productos para empezar tu compra
            </p>
            <Link href="/catalogo" className="btn-outline mt-8">
              Ir al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container-x">
        <div className="mb-8">
          <p className="eyebrow">Carrito</p>
          <h1 className="mt-1 font-display text-3xl">
            Tu Carrito ({itemCount})
          </h1>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1">
            <div className="hidden border-b border-line pb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500 md:grid md:grid-cols-[1fr_120px_120px_100px_40px] md:gap-4">
              <span>Producto</span>
              <span className="text-center">Cantidad</span>
              <span className="text-center">Precio</span>
              <span className="text-center">Total</span>
              <span />
            </div>

            <ul className="divide-y divide-line">
              {items.map((item) => {
                const bucket = totals.byProduct[item.productId];
                const usesWholesale = bucket?.usesWholesale ?? false;
                const lineTotal = usesWholesale
                  ? item.priceWholesale * item.quantity
                  : item.priceNormal * item.quantity;

                return (
                  <li key={item.variantId} className="py-5">
                    <div className="grid grid-cols-[80px_1fr] gap-4 md:grid-cols-[80px_1fr_120px_120px_100px_40px] md:items-center">
                      <div className="aspect-[3/4] w-20 bg-muted row-span-3 md:row-auto">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="md:hidden">
                        <Link
                          href={`/producto/${item.slug}`}
                          className="font-medium text-ink hover:underline text-sm"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.color} / {item.size}
                        </p>
                      </div>

                      <div className="hidden md:block">
                        <Link
                          href={`/producto/${item.slug}`}
                          className="font-medium text-ink hover:underline text-sm"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.color} / {item.size}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 justify-self-center">
                        <button
                          aria-label="Reducir"
                          className="grid h-8 w-8 place-items-center border border-line text-gray-600 hover:bg-muted transition-colors"
                          onClick={() =>
                            setQuantity(item.variantId, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Aumentar"
                          className="grid h-8 w-8 place-items-center border border-line text-gray-600 hover:bg-muted transition-colors"
                          onClick={() =>
                            setQuantity(item.variantId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-center text-sm hidden md:block">
                        {usesWholesale ? (
                          <div>
                            <span className="font-medium text-ink">
                              {formatCLP(item.priceWholesale)}
                            </span>
                            <span className="ml-1 text-xs text-gray-400 line-through">
                              {formatCLP(item.priceNormal)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-ink">
                            {formatCLP(item.priceNormal)}
                          </span>
                        )}
                      </div>

                      <div className="text-center text-sm font-medium hidden md:block">
                        {formatCLP(lineTotal)}
                      </div>

                      <div className="flex items-center gap-3 md:flex-col md:items-center">
                        <button
                          aria-label="Eliminar"
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          onClick={() => remove(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="col-span-2 md:hidden">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            {usesWholesale ? (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {formatCLP(item.priceWholesale)}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  {formatCLP(item.priceNormal)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium">
                                {formatCLP(item.priceNormal)}
                              </span>
                            )}
                            <span className="ml-2 text-gray-500">
                              x{item.quantity}
                            </span>
                          </div>
                          <span className="font-medium">
                            {formatCLP(lineTotal)}
                          </span>
                        </div>
                      </div>

                      {usesWholesale && (
                        <div className="col-span-full mt-1">
                          <p className="text-[11px] text-green-700">
                            Precio mayorista aplicado
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/catalogo"
              className="btn-ghost mt-6 inline-flex text-xs gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Seguir comprando
            </Link>
          </div>

          <div className="w-full lg:w-80">
            <div className="border border-line p-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4">
                Resumen
              </h3>

              <div className="space-y-3 text-sm">
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

                <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                  <span>Total</span>
                  <span>{formatCLP(totals.total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary mt-6 w-full">
                Ir a Pagar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
