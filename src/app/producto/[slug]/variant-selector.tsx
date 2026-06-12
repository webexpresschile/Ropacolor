"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { formatCLP } from "@/lib/utils";

type VariantData = {
  id: string;
  color: string;
  size: string;
  stock: number;
  image: string | null;
};

type Props = {
  productId: string;
  name: string;
  slug: string;
  priceNormal: number;
  priceWholesale: number;
  minWholesaleQty: number;
  variants: VariantData[];
  images: string[];
};

const COLOR_MAP: Record<string, string> = {
  Negro: "#000000",
  Blanco: "#FFFFFF",
  Azul: "#2563EB",
  "Azul marino": "#1E3A5F",
  Rojo: "#DC2626",
  Verde: "#16A34A",
  Gris: "#A3A3A3",
  "Gris claro": "#D4D4D4",
  "Gris oscuro": "#525252",
  Beige: "#F5E6D3",
  Crema: "#FEF3C7",
  Mostaza: "#EAB308",
  "Rosado": "#EC4899",
  "Morado": "#7C3AED",
  "Café": "#78350F",
  "Vino": "#991B1B",
  "Celeste": "#93C5FD",
  "Naranjo": "#EA580C",
  "Plateado": "#D1D5DB",
  "Dorado": "#D97706",
  "Arena": "#E6CCB2",
  "Oliva": "#4D7C0F",
  "Lavanda": "#C084FC",
  "Turquesa": "#14B8A6",
  "Terracota": "#C2410C",
};

function getColorBg(color: string): string {
  return COLOR_MAP[color] || COLOR_MAP[color.toLowerCase()] || "#CCCCCC";
}

function isLightColor(color: string): boolean {
  const light = ["Blanco", "Gris claro", "Crema", "Beige", "Arena", "Plateado", "Celeste", "Lavanda"];
  return light.includes(color);
}

export function VariantSelector(props: Props) {
  const cart = useCart();
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const colors = useMemo(
    () => [...new Set(props.variants.map((v) => v.color))],
    [props.variants]
  );

  const sizesForColor = useMemo(() => {
    if (!selectedColor) return [];
    return [
      ...new Set(
        props.variants
          .filter((v) => v.color === selectedColor)
          .map((v) => v.size)
      ),
    ];
  }, [props.variants, selectedColor]);

  const matchingVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return (
      props.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) || null
    );
  }, [props.variants, selectedColor, selectedSize]);

  const variantImageForColor = useMemo(() => {
    if (!selectedColor) return null;
    const v = props.variants.find((v) => v.color === selectedColor && v.image);
    return v?.image || null;
  }, [props.variants, selectedColor]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize("");
  };

  const handleAddToCart = () => {
    if (!matchingVariant) return;
    const image = matchingVariant.image || props.images[0] || "";
    cart.add({
      productId: props.productId,
      variantId: matchingVariant.id,
      name: props.name,
      slug: props.slug,
      image,
      color: selectedColor,
      size: selectedSize,
      priceNormal: props.priceNormal,
      priceWholesale: props.priceWholesale,
      minWholesaleQty: props.minWholesaleQty,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label mb-3">Color</p>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => {
            const bg = getColorBg(color);
            const light = isLightColor(color);
            return (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`h-9 w-9 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? "border-ink scale-110"
                    : "border-gray-300 hover:border-gray-500"
                }`}
                style={{
                  backgroundColor: bg,
                  ...(light && selectedColor !== color
                    ? { borderColor: "#D4D4D4" }
                    : {}),
                }}
                title={color}
                aria-label={color}
              />
            );
          })}
        </div>
      </div>

      {selectedColor && variantImageForColor && (
        <div className="aspect-[4/3] w-full max-w-[200px] overflow-hidden rounded border bg-muted">
          <img
            src={variantImageForColor}
            alt={selectedColor}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {selectedColor && (
        <div>
          <p className="label mb-3">Talla</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((size) => {
              const variant = props.variants.find(
                (v) => v.color === selectedColor && v.size === size
              );
              const outOfStock = variant ? variant.stock === 0 : false;
              return (
                <button
                  key={size}
                  onClick={() => !outOfStock && setSelectedSize(size)}
                  disabled={outOfStock}
                  className={`min-w-[3rem] px-3 py-2 text-sm font-medium border transition-all ${
                    selectedSize === size
                      ? "border-ink bg-ink text-white"
                      : outOfStock
                        ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                        : "border-gray-300 text-ink hover:border-ink"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {matchingVariant && (
        <div className="text-sm">
          {matchingVariant.stock === 0 ? (
            <p className="text-red-600 font-medium">Agotado</p>
          ) : matchingVariant.stock <= 5 ? (
            <p className="text-amber-700">
              Stock disponible: {matchingVariant.stock} unidad
              {matchingVariant.stock !== 1 ? "es" : ""}
            </p>
          ) : (
            <p className="text-green-700">En stock</p>
          )}
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={!matchingVariant || matchingVariant.stock === 0}
        className="btn-primary w-full"
      >
        Agregar al Carrito &mdash;{" "}
        {formatCLP(matchingVariant ? props.priceNormal : 0)}
      </button>
    </div>
  );
}
