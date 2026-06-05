"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCLP } from "@/lib/utils";

const REGIONS = [
  "Metropolitana", "Valparaíso", "Biobío", "La Araucanía", "Los Lagos",
  "Coquimbo", "Maule", "O'Higgins", "Los Ríos", "Arica y Parinacota",
  "Tarapacá", "Antofagasta", "Atacama", "Aysén", "Magallanes", "Ñuble",
];

type FormData = {
  name: string; lastName: string; rut: string; email: string;
  phone: string; region: string; city: string; address: string; comments: string;
};

const initialForm: FormData = {
  name: "", lastName: "", rut: "", email: "", phone: "",
  region: "", city: "", address: "", comments: "",
};

export default function CheckoutPage() {
  const { items, totals } = useCart();
  const [form, setForm] = useState<FormData>(initialForm);
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon }),
      });
      const data = await res.json();
      if (data.valid) {
        const disc = data.type === "FIXED" ? data.value : Math.floor(totals.subtotal * data.value / 100);
        setCouponDiscount(disc);
        setAppliedCode(data.code);
        setCoupon("");
      } else {
        setError(data.error || "Cupón inválido");
      }
    } catch {
      setError("Error al validar cupón");
    }
  };

  const wholesaleTotal = totals.total;
  const finalTotal = Math.max(0, wholesaleTotal - couponDiscount);
  const isFormValid = form.name && form.lastName && form.email && form.phone && form.region && form.city && form.address;

  const handlePay = async () => {
    if (!isFormValid || items.length === 0) return;
    setLoading(true);
    setError("");

    const orderItems = items.map((item) => {
      const bucket = totals.byProduct[item.productId];
      const usesWholesale = bucket?.usesWholesale ?? false;
      return {
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        priceUnit: usesWholesale ? item.priceWholesale : item.priceNormal,
        priceNormal: item.priceNormal,
        priceWholesale: item.priceWholesale,
        minWholesaleQty: item.minWholesaleQty,
      };
    });

    try {
      const res = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          customer: { ...form, couponCode: appliedCode || null, couponDiscount },
          couponCode: appliedCode || null,
        }),
      });

      const data = await res.json();
      if (data.preferenceUrl) {
        window.location.href = data.preferenceUrl;
      } else {
        setError(data.error || "Error al crear preferencia de pago");
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container-x">
        <div className="mb-8">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-1 font-display text-3xl">Finalizar Compra</h1>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          <form className="flex-1 space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="border border-line p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-5">Información personal</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label">Nombre</label>
                  <input id="name" type="text" className="input" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="lastName" className="label">Apellido</label>
                  <input id="lastName" type="text" className="input" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="rut" className="label">RUT <span className="text-gray-400 normal-case font-normal tracking-normal">(opcional)</span></label>
                  <input id="rut" type="text" className="input" value={form.rut} onChange={(e) => updateField("rut", e.target.value)} />
                </div>
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input id="email" type="email" className="input" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="phone" className="label">Teléfono</label>
                  <input id="phone" type="tel" className="input" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="border border-line p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-5">Dirección de envío</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="region" className="label">Región</label>
                  <select id="region" className="input" value={form.region} onChange={(e) => updateField("region", e.target.value)} required>
                    <option value="">Seleccionar región</option>
                    {REGIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className="label">Ciudad / Comuna</label>
                  <input id="city" type="text" className="input" value={form.city} onChange={(e) => updateField("city", e.target.value)} required />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="address" className="label">Dirección</label>
                <input id="address" type="text" className="input" value={form.address} onChange={(e) => updateField("address", e.target.value)} required />
              </div>
            </div>

            <div className="border border-line p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-5">Comentarios</h2>
              <textarea id="comments" className="input min-h-[80px] resize-y pt-2" value={form.comments} onChange={(e) => updateField("comments", e.target.value)} placeholder="Notas adicionales para tu pedido..." />
            </div>
          </form>

          <div className="w-full lg:w-96">
            <div className="border border-line p-6 space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest">Resumen del pedido</h3>

              <ul className="divide-y divide-line text-sm">
                {items.map((item) => {
                  const bucket = totals.byProduct[item.productId];
                  const usesWholesale = bucket?.usesWholesale ?? false;
                  const price = usesWholesale ? item.priceWholesale : item.priceNormal;
                  return (
                    <li key={item.variantId} className="flex justify-between py-3">
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-ink">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.color} / {item.size} x{item.quantity}</p>
                        {usesWholesale && <p className="text-[11px] text-green-700">Mayorista</p>}
                      </div>
                      <span className="font-medium whitespace-nowrap">{formatCLP(price * item.quantity)}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCLP(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Dto. mayorista</span>
                    <span>-{formatCLP(totals.discount)}</span>
                  </div>
                )}
                {appliedCode && (
                  <div className="flex justify-between text-blue-700">
                    <span>Cupón ({appliedCode})</span>
                    <span>-{formatCLP(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                  <span>Total</span>
                  <span>{formatCLP(finalTotal)}</span>
                </div>
              </div>

              <div className="border border-line p-4">
                <label htmlFor="coupon" className="label mb-2 block">Cupón de descuento</label>
                <div className="flex gap-2">
                  <input id="coupon" type="text" className="input flex-1" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Ingresa tu cupón" />
                  <button onClick={handleApplyCoupon} disabled={!coupon.trim() || !!appliedCode} className="btn-outline whitespace-nowrap text-[10px] px-4">Aplicar</button>
                </div>
                {appliedCode && <p className="mt-2 text-xs text-green-700">Cupón &ldquo;{appliedCode}&rdquo; aplicado</p>}
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button onClick={handlePay} disabled={!isFormValid || loading} className="btn-primary w-full">
                {loading ? "Procesando..." : "Pagar con Mercado Pago"}
              </button>

              <Link href="/carrito" className="btn-ghost w-full justify-center text-xs gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Volver al carrito
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
