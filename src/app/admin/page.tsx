export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

function getDayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 86400000);
  return { start, end };
}

export default async function AdminDashboard() {
  const today = getDayRange();

  const [totalOrders, salesAgg, ordersToday, recentOrders, criticalStock, topProductsGroup] =
    await Promise.all([
      prisma.order.count({ where: { status: "PAGADO" } }),
      prisma.order.aggregate({
        where: { status: "PAGADO" },
        _sum: { subtotal: true },
      }),
      prisma.order.count({
        where: { status: "PAGADO", createdAt: { gte: today.start, lt: today.end } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.productVariant.findMany({
        where: { stock: { lt: 5 } },
        include: { product: true },
        orderBy: { stock: "asc" },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

  const topProductIds = topProductsGroup.map((g) => g.productId);
  const topProducts = topProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true },
      })
    : [];

  const topMap = new Map(topProducts.map((p) => [p.id, p.name]));
  const topList = topProductsGroup.map((g) => ({
    name: topMap.get(g.productId) ?? "Desconocido",
    qty: g._sum.quantity ?? 0,
  }));

  const totalSales = salesAgg._sum.subtotal ?? 0;

  const statusStyles: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    PAGADO: "bg-green-100 text-green-800",
    PREPARANDO: "bg-blue-100 text-blue-800",
    ENVIADO: "bg-purple-100 text-purple-800",
    ENTREGADO: "bg-gray-100 text-gray-800",
    CANCELADO: "bg-red-100 text-red-800",
  };

  return (
    <div className="container-x py-8">
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-line p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Ventas del día
          </p>
          <p className="mt-2 text-3xl font-bold">{ordersToday}</p>
          <p className="mt-1 text-sm text-gray-500">pedidos pagados hoy</p>
        </div>
        <div className="rounded-lg border border-line p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Ventas totales
          </p>
          <p className="mt-2 text-3xl font-bold">{formatCLP(totalSales)}</p>
          <p className="mt-1 text-sm text-gray-500">{totalOrders} pedidos pagados</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-xs text-gray-500 underline underline-offset-2">
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">N° Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{order.orderNo}</td>
                  <td className="px-4 py-3">
                    {order.customer.name} {order.customer.lastName}
                  </td>
                  <td className="px-4 py-3">{formatCLP(order.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium " +
                        (statusStyles[order.status] ?? "bg-gray-100 text-gray-800")
                      }
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("es-CL")}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No hay pedidos recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Stock crítico</h2>
          <div className="rounded-lg border border-line">
            {criticalStock.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">Sin stock crítico</p>
            ) : (
              <ul className="divide-y divide-line">
                {criticalStock.map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{v.product.name}</p>
                      <p className="text-xs text-gray-500">
                        {v.color} / {v.size}
                      </p>
                    </div>
                    <span className="font-semibold text-red-600">{v.stock}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Productos más vendidos</h2>
          <div className="rounded-lg border border-line">
            {topList.length === 0 ? (
              <p className="p-6 text-sm text-gray-400">Sin ventas aún</p>
            ) : (
              <ul className="divide-y divide-line">
                {topList.map((item, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500">{item.qty} uds.</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
