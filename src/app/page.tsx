import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { splitImages } from "@/lib/utils";
import { ProductCard } from "@/components/ui/product-card";
import { Truck, Shield, Tag, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    prisma.product.findMany({
      where: { featured: true, active: true },
      include: { variants: true, category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  const heroProduct = featuredProducts[0];
  const heroImage =
    heroProduct && splitImages(heroProduct.images).length > 0
      ? splitImages(heroProduct.images)[0]
      : null;

  const testimonials = [
    {
      quote:
        "La calidad de las poleras es espectacular. Las uso para estampar y mis clientes quedan felices.",
      name: "María José",
      role: "Emprendedora, Santiago",
    },
    {
      quote:
        "Compré al por mayor con dos amigas y nos llegó todo rapidísimo. La talla S queda perfecta.",
      name: "Catalina",
      role: "Diseñadora, Viña del Mar",
    },
    {
      quote:
        "Finalmente encuentro básicos unicolor de calidad. El buzón gris es mi favorito.",
      name: "Sebastián",
      role: "Arquitecto, Concepción",
    },
  ];

  const faqs = [
    {
      q: "¿Cuánto tardan los envíos?",
      a: "Despachamos a todo Chile vía Starken. Los pedidos se despachan en 24-48 hrs hábiles y llegan en 3-7 días según tu región.",
    },
    {
      q: "¿Cómo funcionan los precios mayoristas?",
      a: "Al agregar 3 o más unidades del mismo producto (pueden ser distintas tallas/colores), el precio cambia automáticamente al precio mayorista.",
    },
    {
      q: "¿Puedo cambiar o devolver un producto?",
      a: "Sí. Tienes 10 días corridos desde que recibes tu pedido para cambiar o devolver. El producto debe estar sin uso y con etiquetas.",
    },
    {
      q: "¿Qué talla me recomiendan?",
      a: "Nuestras prendas tienen corte regular. Revisa la guía de tallas en cada producto. Si estás entre tallas, te recomendamos la mayor.",
    },
    {
      q: "¿Hacen envíos a regiones?",
      a: "Sí, enviamos a todo Chile. El costo de envío se calcula al momento del checkout según tu dirección.",
    },
  ];

  const benefits = [
    { icon: Truck, title: "Envío rápido a todo Chile", desc: "Despachamos en 24-48 hrs vía Starken." },
    { icon: Shield, title: "Cambios y devoluciones", desc: "10 días para cambios. Sin complicaciones." },
    { icon: Tag, title: "Precios mayoristas", desc: "Desde 3 unidades, precio especial." },
  ];

  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
        {heroImage && (
          <>
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
          </>
        )}
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
          <h1
            className="font-display text-7xl leading-none tracking-tight text-white sm:text-8xl"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Ropa Unicolor
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-300">
            Poleras, buzos y básicos de calidad para hombres y mujeres.
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Compra al detalle o accede a precios mayoristas desde 3 unidades.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/catalogo" className="btn-primary">
              Ver Catálogo
            </Link>
            <Link href="/catalogo?featured=true" className="btn-outline border-white text-white hover:bg-white hover:text-black">
              Comprar Ahora
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-muted">
        <div className="container-x">
          <p className="eyebrow">Categorías</p>
          <h2 className="mt-2 font-display text-4xl">Categorías destacadas</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="group relative flex aspect-[4/5] items-end overflow-hidden bg-gray-200"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="relative z-10 p-4 text-lg font-medium text-white">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Destacados</p>
              <h2 className="mt-2 font-display text-4xl">Productos destacados</h2>
            </div>
            <Link
              href="/catalogo"
              className="hidden text-sm font-medium uppercase tracking-wider underline underline-offset-4 sm:block"
            >
              Ver todo
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-muted">
        <div className="container-x">
          <p className="eyebrow text-center">Beneficios</p>
          <h2 className="mt-2 text-center font-display text-4xl">¿Por qué elegirnos?</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center bg-black text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <p className="eyebrow text-center">Testimonios</p>
          <h2 className="mt-2 text-center font-display text-4xl">Lo que dicen nuestros clientes</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="border border-line p-6">
                <p className="text-lg leading-relaxed text-gray-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-line pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-muted">
        <div className="container-x mx-auto max-w-2xl">
          <p className="eyebrow text-center">FAQ</p>
          <h2 className="mt-2 text-center font-display text-4xl">Preguntas Frecuentes</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group border border-line bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium">
                  {item.q}
                  <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-gray-600">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
