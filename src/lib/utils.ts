export function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export const SIZE_TYPES = {
  letras: { label: "Letras (S-M-L-XL) — Adulto", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  numeros: { label: "Números (2-4-6-8-10-12) — Niño", sizes: ["2", "4", "6", "8", "10", "12"] },
  cm: { label: "Centímetros (90-100-110-120-130) — Bebé", sizes: ["90", "100", "110", "120", "130"] },
} as const;

export type SizeType = keyof typeof SIZE_TYPES;

export function getSizeTypeLabel(sizeType: string): string {
  return SIZE_TYPES[sizeType as SizeType]?.label || "Talla";
}

export function getSizesForType(sizeType: string): string[] {
  const found = SIZE_TYPES[sizeType as SizeType];
  return found ? [...found.sizes] : [...SIZE_TYPES.letras.sizes];
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function splitImages(images: string | null | undefined): string[] {
  if (!images) return [];
  return images
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

export function generateOrderNo(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const r = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RU-${y}${m}${d}-${r}`;
}
