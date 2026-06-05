export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

export default async function AdminCupones() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cupones</h1>
        <Link
          href="/admin/cupones/nuevo"
          className="rounded-md bg-ink px-4 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-black"
        >
          + Nuevo Cupón
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Usos máx.</th>
              <th className="px-4 py-3">Usados</th>
              <th className="px-4 py-3">Vencimiento</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-mono text-sm font-medium">{coupon.code}</td>
                <td className="px-4 py-3 text-gray-500">
                  {coupon.type === "FIXED" ? "Fijo" : "%"}
                </td>
                <td className="px-4 py-3">
                  {coupon.type === "FIXED" ? formatCLP(coupon.value) : `${coupon.value}%`}
                </td>
                <td className="px-4 py-3">{coupon.maxUses}</td>
                <td className="px-4 py-3">{coupon.usedCount}</td>
                <td className="px-4 py-3 text-gray-500">
                  {coupon.expiry
                    ? new Date(coupon.expiry).toLocaleDateString("es-CL")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium " +
                      (coupon.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800")
                    }
                  >
                    {coupon.active ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/cupones/${coupon.id}`}
                    className="text-xs font-medium text-blue-600 underline underline-offset-2"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No hay cupones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
