export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCategoriaEdit(props: Props) {
  const { id } = await props.params;
  const isNew = id === "nueva";

  const cat = !isNew ? await prisma.category.findUnique({ where: { id } }) : null;
  if (!isNew && !cat) notFound();

  async function save(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || slugify(name);
    const image = formData.get("image") as string;
    const description = formData.get("description") as string;

    const data = { name, slug, image, description };

    if (isNew) {
      await prisma.category.create({ data });
    } else {
      await prisma.category.update({ where: { id }, data });
    }
    revalidatePath("/admin/categorias");
    redirect("/admin/categorias");
  }

  return (
    <div className="container-x py-8">
      <h1 className="mb-8 text-2xl font-bold">{isNew ? "Nueva Categoría" : `Editar: ${cat!.name}`}</h1>
      <form action={save} className="max-w-xl space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Nombre</label>
            <input name="name" defaultValue={cat?.name || ""} className="input" required />
          </div>
          <div>
            <label className="label">Slug <span className="text-gray-400 normal-case">(dejar vacío para auto)</span></label>
            <input name="slug" defaultValue={cat?.slug || ""} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Imagen URL</label>
          <input name="image" defaultValue={cat?.image || ""} className="input" />
        </div>
        <div>
          <label className="label">Descripción SEO</label>
          <textarea name="description" defaultValue={cat?.description || ""} className="input min-h-[80px]" />
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">{isNew ? "Crear" : "Guardar"}</button>
          <Link href="/admin/categorias" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
