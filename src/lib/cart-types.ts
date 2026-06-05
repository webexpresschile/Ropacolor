export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  color: string;
  size: string;
  priceNormal: number;
  priceWholesale: number;
  minWholesaleQty: number;
  quantity: number;
};

export type CartTotals = {
  subtotal: number;
  discount: number;
  total: number;
  wholesaleSavings: number;
  byProduct: Record<
    string,
    { qty: number; usesWholesale: boolean; missing: number }
  >;
};
