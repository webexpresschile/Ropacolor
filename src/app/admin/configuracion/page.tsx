export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export default async function AdminConfiguracion() {
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const orderCount = await prisma.order.count();

  return (
    <div className="container-x py-8">
      <h1 className="mb-8 text-2xl font-bold">Configuración</h1>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="rounded-lg border border-line p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Tienda
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nombre</dt>
              <dd className="font-medium">Ropa Unicolor</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Instagram</dt>
              <dd className="font-medium">@ropaunicolor</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Mayorista mín.</dt>
              <dd className="font-medium">3 unidades</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-line p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Resumen
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Productos</dt>
              <dd className="font-medium">{productCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Categorías</dt>
              <dd className="font-medium">{categoryCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Pedidos</dt>
              <dd className="font-medium">{orderCount}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
