"use client";

import { useState } from "react";

const COLORS = ["Negro", "Blanco", "Azul", "Gris", "Gris claro", "Gris oscuro", "Rojo", "Verde", "Beige", "Crema", "Mostaza", "Rosado", "Morado", "Café", "Vino", "Celeste", "Naranjo", "Oliva", "Lavanda"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type VariantData = {
  color: string;
  sizes: string[];
  stock: number;
  sku: string;
  image: string;
};

export function VariantForm({
  initialVariants,
}: {
  initialVariants?: { color: string; size: string; stock: number; sku: string; image: string | null }[];
}) {
  const [variants, setVariants] = useState<VariantData[]>(() => {
    if (initialVariants && initialVariants.length > 0) {
      // Group existing variants by color
      const grouped: Record<string, { sizes: Set<string>; stock: number; sku: string; image: string }> = {};
      for (const v of initialVariants) {
        if (!grouped[v.color]) {
          grouped[v.color] = {
            sizes: new Set(),
            stock: v.stock,
            sku: v.sku.split("-").slice(0, -1).join("-") || v.sku,
            image: v.image || "",
          };
        }
        grouped[v.color].sizes.add(v.size);
        // Use the max stock across sizes as the default
        grouped[v.color].stock = Math.max(grouped[v.color].stock, v.stock);
      }
      return Object.entries(grouped).map(([color, data]) => ({
        color,
        sizes: Array.from(data.sizes).sort((a, b) => SIZES.indexOf(a) - SIZES.indexOf(b)),
        stock: data.stock,
        sku: data.sku,
        image: data.image,
      }));
    }
    return [];
  });

  function addVariant() {
    setVariants([...variants, { color: "", sizes: [], stock: 0, sku: "", image: "" }]);
  }

  function removeVariant(idx: number) {
    setVariants(variants.filter((_, i) => i !== idx));
  }

  function updateVariant(idx: number, field: keyof VariantData, value: string | string[] | number) {
    const updated = [...variants];
    (updated[idx] as Record<string, string | string[] | number>)[field] = value;
    setVariants(updated);
  }

  function toggleSize(idx: number, size: string) {
    const updated = [...variants];
    const sizes = updated[idx].sizes;
    if (sizes.includes(size)) {
      updated[idx].sizes = sizes.filter((s) => s !== size);
    } else {
      updated[idx].sizes = [...sizes, size].sort((a, b) => SIZES.indexOf(a) - SIZES.indexOf(b));
    }
    setVariants(updated);
  }

  return (
    <div className="border border-line p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Variantes (por color)</h3>
        <button type="button" onClick={addVariant} className="text-xs font-medium uppercase tracking-wider text-blue-600 hover:text-blue-800">
          + Agregar color
        </button>
      </div>

      <input type="hidden" name="variantData" value={JSON.stringify(variants)} />

      <div className="space-y-4">
        {variants.length === 0 && (
          <p className="text-sm text-gray-400 italic">Agrega variantes de color para este producto.</p>
        )}

        {variants.map((v, idx) => (
          <div key={idx} className="border border-line bg-gray-50 p-4 rounded-md">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500">Color</label>
                  <select
                    value={v.color}
                    onChange={(e) => updateVariant(idx, "color", e.target.value)}
                    className="input mt-1"
                    required
                  >
                    <option value="">Seleccionar color</option>
                    {COLORS.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gray-500">Stock (por talla)</label>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(idx, "stock", parseInt(e.target.value) || 0)}
                    className="input mt-1"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="ml-3 mt-5 text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-3">
              <label className="text-[11px] uppercase tracking-wider text-gray-500">Tallas disponibles</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <label
                    key={size}
                    className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      v.sizes.includes(size)
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={v.sizes.includes(size)}
                      onChange={() => toggleSize(idx, size)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500">SKU (base)</label>
                <input
                  type="text"
                  value={v.sku}
                  onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                  className="input mt-1 font-mono text-xs"
                  placeholder="Ej: POL-NEG"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-gray-500">URL imagen del color</label>
                <input
                  type="text"
                  value={v.image}
                  onChange={(e) => updateVariant(idx, "image", e.target.value)}
                  className="input mt-1 text-xs"
                  placeholder="https://..."
                />
              </div>
            </div>
            {v.image && (
              <div className="mt-2">
                <img src={v.image} alt={v.color} className="h-14 w-14 object-cover rounded border" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
