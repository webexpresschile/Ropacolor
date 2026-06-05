export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  PAGADO: "bg-green-100 text-green-800",
  PREPARANDO: "bg-blue-100 text-blue-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGADO: "bg-gray-100 text-gray-800",
  CANCELADO: "bg-red-100 text-red-800",
};

export default async function AdminPedidos() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-2xl font-bold">Pedidos</h1>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">N° Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((order) => (
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
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-xs font-medium text-blue-600 underline underline-offset-2"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay pedidos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
