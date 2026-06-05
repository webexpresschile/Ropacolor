export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCuponEdit(props: Props) {
  const { id } = await props.params;
  const isNew = id === "nuevo";

  const coupon = !isNew ? await prisma.coupon.findUnique({ where: { id } }) : null;
  if (!isNew && !coupon) notFound();

  async function save(formData: FormData) {
    "use server";
    const code = (formData.get("code") as string).toUpperCase();
    const type = formData.get("type") as string;
    const value = parseInt(formData.get("value") as string) || 0;
    const maxUses = parseInt(formData.get("maxUses") as string) || 100;
    const expiryStr = formData.get("expiry") as string;
    const active = formData.get("active") === "on";

    const data = {
      code, type, value, maxUses,
      expiry: expiryStr ? new Date(expiryStr) : null,
      active,
    };

    if (isNew) {
      await prisma.coupon.create({ data });
    } else {
      await prisma.coupon.update({ where: { id }, data });
    }
    revalidatePath("/admin/cupones");
    redirect("/admin/cupones");
  }

  const formatDate = (d: Date | null | undefined) => {
    if (!d) return "";
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="container-x py-8">
      <h1 className="mb-8 text-2xl font-bold">{isNew ? "Nuevo Cupón" : `Editar: ${coupon!.code}`}</h1>
      <form action={save} className="max-w-xl space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Código</label>
            <input name="code" defaultValue={coupon?.code || ""} className="input font-mono uppercase" required />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select name="type" defaultValue={coupon?.type || "PERCENT"} className="input">
              <option value="PERCENT">Porcentaje (%)</option>
              <option value="FIXED">Fijo (CLP)</option>
            </select>
          </div>
          <div>
            <label className="label">Valor</label>
            <input name="value" type="number" defaultValue={coupon?.value || 0} className="input" required />
          </div>
          <div>
            <label className="label">Usos máximos</label>
            <input name="maxUses" type="number" defaultValue={coupon?.maxUses || 100} className="input" />
          </div>
          <div>
            <label className="label">Fecha expiración <span className="text-gray-400 normal-case">(opcional)</span></label>
            <input name="expiry" type="date" defaultValue={formatDate(coupon?.expiry)} className="input" />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 text-sm">
              <input name="active" type="checkbox" defaultChecked={coupon?.active ?? true} /> Activo
            </label>
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">{isNew ? "Crear" : "Guardar"}</button>
          <Link href="/admin/cupones" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
