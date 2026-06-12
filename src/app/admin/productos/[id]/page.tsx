export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { ProductFormClient } from "./product-form-client";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProductoEdit(props: Props) {
  const { id } = await props.params;
  const isNew = id === "nuevo";

  const product = !isNew
    ? await prisma.product.findUnique({ where: { id }, include: { variants: true, category: true } })
    : null;

  if (!isNew && !product) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function save(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || slugify(name);
    const shortDesc = formData.get("shortDesc") as string;
    const longDesc = formData.get("longDesc") as string;
    const categoryId = formData.get("categoryId") as string;
    const brand = formData.get("brand") as string || "Ropa Unicolor";
    const tags = formData.get("tags") as string;
    const priceNormal = parseInt(formData.get("priceNormal") as string) || 0;
    const priceWholesale = parseInt(formData.get("priceWholesale") as string) || 0;
    const minWholesaleQty = parseInt(formData.get("minWholesaleQty") as string) || 3;
    const active = formData.get("active") === "on";
    const featured = formData.get("featured") === "on";
    const images = formData.get("images") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDescription = formData.get("metaDescription") as string;
    const sizeType = formData.get("sizeType") as string || "letras";

    // Parse variant data from JSON
    let variantData: { color: string; sizes: string[]; stock: number; sku: string; image: string }[] = [];
    try {
      variantData = JSON.parse(formData.get("variantData") as string || "[]");
    } catch {
      variantData = [];
    }

    const productData = {
      name, slug, shortDesc, longDesc, categoryId, brand, tags,
      priceNormal, priceWholesale, minWholesaleQty, active, featured,
      images, metaTitle, metaDescription, sizeType,
    };

    if (isNew) {
      const created = await prisma.product.create({ data: productData });

      // Expand color variants into individual size variants
      for (const v of variantData) {
        if (!v.color || v.sizes.length === 0) continue;
        const skuBase = v.sku || `${slug.toUpperCase()}-${v.color.slice(0, 3).toUpperCase()}`;
        for (const size of v.sizes) {
          await prisma.productVariant.create({
            data: {
              productId: created.id,
              color: v.color,
              size,
              stock: v.stock,
              sku: `${skuBase}-${size}`,
              image: v.image || null,
            },
          });
        }
      }
    } else {
      await prisma.product.update({ where: { id }, data: productData });

      // Replace all variants: delete old, create new
      await prisma.productVariant.deleteMany({ where: { productId: id } });

      for (const v of variantData) {
        if (!v.color || v.sizes.length === 0) continue;
        const skuBase = v.sku || `${slug.toUpperCase()}-${v.color.slice(0, 3).toUpperCase()}`;
        for (const size of v.sizes) {
          await prisma.productVariant.create({
            data: {
              productId: id,
              color: v.color,
              size,
              stock: v.stock,
              sku: `${skuBase}-${size}`,
              image: v.image || null,
            },
          });
        }
      }
    }

    revalidatePath("/admin/productos");
    redirect("/admin/productos");
  }

  return (
    <div className="container-x py-8">
      <h1 className="mb-8 text-2xl font-bold">{isNew ? "Nuevo Producto" : `Editar: ${product!.name}`}</h1>
      <form action={save} className="max-w-2xl space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Nombre</label>
            <input name="name" defaultValue={product?.name || ""} className="input" required />
          </div>
          <div>
            <label className="label">Slug <span className="text-gray-400 normal-case">(dejar vacío para auto)</span></label>
            <input name="slug" defaultValue={product?.slug || ""} className="input" />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select name="categoryId" defaultValue={product?.categoryId || ""} className="input" required>
              <option value="">Seleccionar</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="label">Marca</label>
            <input name="brand" defaultValue={product?.brand || "Ropa Unicolor"} className="input" />
          </div>
          <div>
            <label className="label">Precio normal (CLP)</label>
            <input name="priceNormal" type="number" defaultValue={product?.priceNormal || 0} className="input" required />
          </div>
          <div>
            <label className="label">Precio mayorista (CLP)</label>
            <input name="priceWholesale" type="number" defaultValue={product?.priceWholesale || 0} className="input" />
          </div>
          <div>
            <label className="label">Cant. mín. mayorista</label>
            <input name="minWholesaleQty" type="number" defaultValue={product?.minWholesaleQty || 3} className="input" />
          </div>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm">
              <input name="active" type="checkbox" defaultChecked={product?.active ?? true} /> Activo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="featured" type="checkbox" defaultChecked={product?.featured ?? false} /> Destacado
            </label>
          </div>
        </div>

        <div>
          <label className="label">Descripción corta</label>
          <textarea name="shortDesc" defaultValue={product?.shortDesc || ""} className="input min-h-[60px]" required />
        </div>
        <div>
          <label className="label">Descripción completa</label>
          <textarea name="longDesc" defaultValue={product?.longDesc || ""} className="input min-h-[120px]" />
        </div>
        <div>
          <label className="label">Tags <span className="text-gray-400 normal-case">(separados por coma)</span></label>
          <input name="tags" defaultValue={product?.tags || ""} className="input" />
        </div>
        <div>
          <label className="label">Imágenes generales <span className="text-gray-400 normal-case">(URLs separadas por coma)</span></label>
          <input name="images" defaultValue={product?.images || ""} className="input" />
        </div>

        <ProductFormClient
          initialSizeType={product?.sizeType || "letras"}
          initialVariants={
            product?.variants.map((v) => ({
              color: v.color,
              size: v.size,
              stock: v.stock,
              sku: v.sku,
              image: v.image,
            })) || []
          }
        />

        <div>
          <label className="label">Meta título</label>
          <input name="metaTitle" defaultValue={product?.metaTitle || ""} className="input" />
        </div>
        <div>
          <label className="label">Meta descripción</label>
          <textarea name="metaDescription" defaultValue={product?.metaDescription || ""} className="input min-h-[60px]" />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="btn-primary">{isNew ? "Crear Producto" : "Guardar Cambios"}</button>
          <Link href="/admin/productos" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
