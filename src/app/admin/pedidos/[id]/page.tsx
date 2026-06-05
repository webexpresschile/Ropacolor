export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  PAGADO: "bg-green-100 text-green-800",
  PREPARANDO: "bg-blue-100 text-blue-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGADO: "bg-gray-100 text-gray-800",
  CANCELADO: "bg-red-100 text-red-800",
};

const statuses = ["PENDIENTE", "PAGADO", "PREPARANDO", "ENVIADO", "ENTREGADO", "CANCELADO"];

export default async function AdminPedidoDetalle(props: Props) {
  const { id } = await props.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: { include: { product: true } }, payment: true },
  });

  if (!order) notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    await prisma.order.update({ where: { id }, data: { status } });
    revalidatePath(`/admin/pedidos/${id}`);
    redirect(`/admin/pedidos/${id}`);
  }

  return (
    <div className="container-x py-8">
      <Link href="/admin/pedidos" className="text-xs text-gray-500 underline underline-offset-2 hover:text-ink">&larr; Volver a pedidos</Link>
      <h1 className="mt-4 text-2xl font-bold">Pedido {order.orderNo}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Cliente</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Nombre</dt><dd>{order.customer.name} {order.customer.lastName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">RUT</dt><dd>{order.customer.rut || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd>{order.customer.email}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Teléfono</dt><dd>{order.customer.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Dirección</dt><dd>{order.customer.address}, {order.customer.city}, {order.customer.region}</dd></div>
            </dl>
          </div>

          <div className="rounded-lg border border-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Productos</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase text-gray-500">
                  <th className="pb-2 text-left">Producto</th>
                  <th className="pb-2 text-left">Var.</th>
                  <th className="pb-2 text-right">Cant.</th>
                  <th className="pb-2 text-right">P. Unit</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-medium">{item.product.name}</td>
                    <td className="py-2 text-gray-500">{item.color} / {item.size}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCLP(item.priceUnit)}</td>
                    <td className="py-2 text-right font-medium">{formatCLP(item.priceTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.comments && (
            <div className="rounded-lg border border-line p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-2">Comentarios</h2>
              <p className="text-sm text-gray-600">{order.comments}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Estado</h2>
            <form action={updateStatus} className="flex items-center gap-4">
              <select name="status" defaultValue={order.status} className="input flex-1">
                {statuses.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
              <button type="submit" className="btn-primary text-xs">Actualizar</button>
            </form>
            <div className="mt-4">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>{order.status}</span>
            </div>
          </div>

          <div className="rounded-lg border border-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Resumen financiero</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd>{formatCLP(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-green-700"><dt>Descuento</dt><dd>-{formatCLP(order.discount)}</dd></div>}
              {order.couponCode && <div className="flex justify-between"><dt className="text-gray-500">Cupón</dt><dd>{order.couponCode}</dd></div>}
              <div className="flex justify-between border-t border-line pt-2 text-base font-medium"><dt>Total</dt><dd>{formatCLP(order.total)}</dd></div>
            </dl>
          </div>

          <div className="rounded-lg border border-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Pago</h2>
            {order.payment ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Estado</dt><dd><span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.payment.status] || "bg-gray-100"}`}>{order.payment.status}</span></dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Método</dt><dd>{order.payment.method || "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Preference ID</dt><dd className="font-mono text-xs">{order.payment.preferenceId || "—"}</dd></div>
                {order.payment.paymentId && <div className="flex justify-between"><dt className="text-gray-500">Payment ID</dt><dd className="font-mono text-xs">{order.payment.paymentId}</dd></div>}
              </dl>
            ) : (
              <p className="text-sm text-gray-400">Sin información de pago</p>
            )}
          </div>

          <div className="text-xs text-gray-400">
            <p>Creado: {new Date(order.createdAt).toLocaleString("es-CL")}</p>
            <p>Actualizado: {new Date(order.updatedAt).toLocaleString("es-CL")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
