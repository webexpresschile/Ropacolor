import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Código requerido" }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 })
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "Cupón inactivo" }, { status: 400 })
    }

    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      return NextResponse.json({ error: "Cupón expirado" }, { status: 400 })
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Cupón agotado" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    })
  } catch (error: unknown) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Error al validar cupón" }, { status: 500 })
  }
}
