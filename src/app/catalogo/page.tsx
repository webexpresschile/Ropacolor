import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ui/product-card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  talla?: string;
  color?: string;
  min?: string;
  max?: string;
  featured?: string;
}>;

export default async function CatalogoPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const { q, categoria, talla, color, min, max, featured } = searchParams;

  const where: Record<string, unknown> = { active: true };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { shortDesc: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  if (categoria) {
    where.category = { slug: categoria };
  }

  if (talla) {
    where.variants = { some: { size: talla, active: true } };
  }

  if (color) {
    where.variants = { some: { color, active: true } };
  }

  if (min || max) {
    const priceFilter: Record<string, number> = {};
    if (min) priceFilter.gte = parseInt(min);
    if (max) priceFilter.lte = parseInt(max);
    where.priceNormal = priceFilter;
  }

  if (featured === "true") {
    where.featured = true;
  }

  const [products, categories, allVariants] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.productVariant.findMany({
      where: { active: true, product: { active: true } },
      select: { color: true, size: true },
    }),
  ]);

  const colors = [...new Set(allVariants.map((v) => v.color))].sort();
  const sizes = [...new Set(allVariants.map((v) => v.size))].sort((a, b) => {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="section">
      <div className="container-x">
        {q && (
          <div className="mb-8">
            <p className="eyebrow">Búsqueda</p>
            <h1 className="mt-1 font-display text-3xl">
              Resultados para &ldquo;{q}&rdquo;
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {products.length} producto{products.length !== 1 ? "s" : ""} encontrado
              {products.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {!q && (
          <div className="mb-8">
            <p className="eyebrow">Catálogo</p>
            <h1 className="mt-1 font-display text-3xl">Todos los productos</h1>
            <p className="mt-2 text-sm text-gray-500">
              {products.length} producto{products.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest">
                Categorías
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/catalogo"
                    className={`text-sm transition-colors hover:text-black ${
                      !categoria ? "font-medium text-black" : "text-gray-500"
                    }`}
                  >
                    Todas
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/catalogo?categoria=${cat.slug}`}
                      className={`text-sm transition-colors hover:text-black ${
                        categoria === cat.slug
                          ? "font-medium text-black"
                          : "text-gray-500"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest">
                Color
              </h3>
              <ul className="mt-4 space-y-2">
                {colors.map((c) => (
                  <li key={c}>
                    <Link
                      href={`/catalogo?color=${encodeURIComponent(c)}${categoria ? `&categoria=${categoria}` : ""}`}
                      className={`text-sm transition-colors hover:text-black ${
                        color === c ? "font-medium text-black" : "text-gray-500"
                      }`}
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest">
                Talla
              </h3>
              <ul className="mt-4 space-y-2">
                {sizes.map((s) => (
                  <li key={s}>
                    <Link
                      href={`/catalogo?talla=${encodeURIComponent(s)}${categoria ? `&categoria=${categoria}` : ""}`}
                      className={`text-sm transition-colors hover:text-black ${
                        talla === s ? "font-medium text-black" : "text-gray-500"
                      }`}
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-sm text-gray-500">
                  No encontramos productos con esos filtros.
                </p>
                <Link href="/catalogo" className="btn-outline mt-6">
                  Limpiar filtros
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
