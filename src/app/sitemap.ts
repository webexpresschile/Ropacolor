import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ropaunicolor.cl";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/carrito`, changeFrequency: "never", priority: 0.3 },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const { prisma } = await import("@/lib/prisma");

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    productPages = products.map((p) => ({
      url: `${baseUrl}/producto/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: p.updatedAt,
    }));

    categoryPages = categories.map((c) => ({
      url: `${baseUrl}/categoria/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      lastModified: c.updatedAt,
    }));
  } catch {
    // Build without DB connection
  }

  return [...staticPages, ...productPages, ...categoryPages];
}
