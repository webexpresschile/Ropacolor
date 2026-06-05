export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCategorias() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Link
          href="/admin/categorias/nueva"
          className="rounded-md bg-ink px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-black"
        >
          + Nueva Categoría
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Imagen</th>
              <th className="px-4 py-3">Productos</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                <td className="px-4 py-3">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">{cat._count.products}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/categorias/${cat.id}`}
                    className="text-xs font-medium text-blue-600 underline underline-offset-2"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
