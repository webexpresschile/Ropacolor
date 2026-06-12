import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { splitImages } from "@/lib/utils";
import { ImageGallery } from "./image-gallery";
import { VariantSelector } from "./variant-selector";
import { WholesaleInfo } from "./wholesale-info";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDesc,
  };
}

export default async function ProductoPage(props: Props) {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true, category: true },
  });
  if (!product) notFound();

  const images = splitImages(product.images);
  // Collect unique variant images to show in gallery
  const variantImages = product.variants
    .map((v) => v.image)
    .filter((img): img is string => !!img);
  const allImages = [...new Set([...images, ...variantImages])];

  const hasWholesale =
    product.priceWholesale > 0 &&
    product.priceWholesale < product.priceNormal;

  return (
    <div className="section">
      <div className="container-x">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="w-full lg:w-3/5">
            <ImageGallery images={allImages} name={product.name} />
          </div>

          <div className="flex w-full flex-col gap-6 lg:w-2/5">
            <div>
              <p className="eyebrow">{product.category.name}</p>
              <h1 className="mt-2 font-display text-3xl">{product.name}</h1>
            </div>

            <VariantSelector
              productId={product.id}
              name={product.name}
              slug={product.slug}
              priceNormal={product.priceNormal}
              priceWholesale={product.priceWholesale}
              minWholesaleQty={product.minWholesaleQty}
              images={images}
              variants={product.variants.map((v) => ({
                id: v.id,
                color: v.color,
                size: v.size,
                stock: v.stock,
                image: v.image,
              }))}
              sizeType={product.sizeType}
            />

            {hasWholesale && (
              <WholesaleInfo
                priceNormal={product.priceNormal}
                priceWholesale={product.priceWholesale}
                minWholesaleQty={product.minWholesaleQty}
              />
            )}

            <div className="space-y-2 text-sm leading-relaxed text-gray-600">
              {product.longDesc.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
