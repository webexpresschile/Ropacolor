export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

export default async function AdminProductos() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-md bg-ink px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-black"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Variantes</th>
              <th className="px-4 py-3">Stock total</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => {
              const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={product.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500">{product.category.name}</td>
                  <td className="px-4 py-3">{product.variants.length}</td>
                  <td className="px-4 py-3">{totalStock}</td>
                  <td className="px-4 py-3">{formatCLP(product.priceNormal)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium " +
                        (product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800")
                      }
                    >
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="text-xs font-medium text-blue-600 underline underline-offset-2"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
