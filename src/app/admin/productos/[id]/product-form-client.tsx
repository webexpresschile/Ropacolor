"use client";

import { useState } from "react";
import { VariantForm } from "./variant-form";
import { SIZE_TYPES, getSizesForType } from "@/lib/utils";

type VariantShape = {
  color: string;
  size: string;
  stock: number;
  sku: string;
  image: string | null;
};

export function ProductFormClient({
  initialSizeType,
  initialVariants,
}: {
  initialSizeType: string;
  initialVariants?: VariantShape[];
}) {
  const [sizeType, setSizeType] = useState(initialSizeType || "letras");
  const sizes = getSizesForType(sizeType);

  return (
    <>
      <div>
        <label className="label">Formato de Talla</label>
        <select
          name="sizeType"
          value={sizeType}
          onChange={(e) => setSizeType(e.target.value)}
          className="input"
        >
          {Object.entries(SIZE_TYPES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      </div>

      <VariantForm
        availableSizes={sizes}
        initialVariants={initialVariants}
      />
    </>
  );
}
