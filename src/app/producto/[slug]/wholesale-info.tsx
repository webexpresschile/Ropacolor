"use client";

import { formatCLP } from "@/lib/utils";

type Props = {
  priceNormal: number;
  priceWholesale: number;
  minWholesaleQty: number;
};

export function WholesaleInfo({
  priceNormal,
  priceWholesale,
  minWholesaleQty,
}: Props) {
  const savings = priceNormal - priceWholesale;

  return (
    <div className="border border-line p-5 space-y-2">
      <p className="eyebrow text-xs">Precio Mayorista</p>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold text-ink">
          {formatCLP(priceWholesale)}
        </span>
        <span className="text-sm text-gray-400 line-through">
          {formatCLP(priceNormal)}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        Precio mayorista desde {minWholesaleQty} unidades
      </p>

      {savings > 0 && (
        <p className="text-sm font-medium text-green-700">
          Ahorras {formatCLP(savings)} por unidad
        </p>
      )}
    </div>
  );
}
