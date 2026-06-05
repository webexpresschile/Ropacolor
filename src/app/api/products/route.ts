import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error: unknown) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

type VariantInput = {
  color: string
  size: string
  stock?: number
  sku: string
  image?: string
  active?: boolean
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        shortDesc: data.shortDesc,
        longDesc: data.longDesc,
        categoryId: data.categoryId,
        brand: data.brand || "Ropa Unicolor",
        tags: data.tags || "",
        priceNormal: data.priceNormal,
        priceWholesale: data.priceWholesale,
        minWholesaleQty: data.minWholesaleQty ?? 3,
        active: data.active ?? true,
        featured: data.featured ?? false,
        images: data.images || "",
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        openGraph: data.openGraph,
        variants: data.variants?.length
          ? {
              create: data.variants.map((v: VariantInput) => ({
                color: v.color,
                size: v.size,
                stock: v.stock ?? 0,
                sku: v.sku,
                image: v.image,
                active: v.active ?? true,
              })),
            }
          : undefined,
      },
      include: { category: true, variants: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating product:", error)
    const message = error instanceof Error ? error.message : "Error al crear producto"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
