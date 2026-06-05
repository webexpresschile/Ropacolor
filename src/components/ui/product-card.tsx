"use client";

import Link from "next/link";
import { splitImages, formatCLP } from "@/lib/utils";

type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  priceNormal: number;
  priceWholesale: number;
  images: string | null;
  shortDesc: string;
  category: { slug: string; name: string };
  variants: Array<{ stock: number }>;
};

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const images = splitImages(product.images);
  const firstImage = images[0];
  const outOfStock = product.variants.every((v) => v.stock === 0);
  const hasWholesale =
    product.priceWholesale > 0 && product.priceWholesale < product.priceNormal;

  return (
    <Link href={`/producto/${product.slug}`} className="card group">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-xs uppercase tracking-wider">
            Sin imagen
          </div>
        )}

        {outOfStock && (
          <span className="absolute left-2 top-2 bg-black/70 text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1">
            Agotado
          </span>
        )}

        {hasWholesale && (
          <span className="absolute right-2 top-2 bg-ink text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1">
            Mayorista
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center gap-2">
          <span className="chip">{product.category.name}</span>
        </div>

        <h3 className="text-sm font-medium text-ink leading-snug">
          {product.name}
        </h3>

        {product.shortDesc && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {product.shortDesc}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          {hasWholesale ? (
            <>
              <span className="text-sm font-medium text-ink">
                {formatCLP(product.priceWholesale)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatCLP(product.priceNormal)}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-ink">
              {formatCLP(product.priceNormal)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
