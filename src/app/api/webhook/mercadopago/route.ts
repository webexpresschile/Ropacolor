import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MercadoPagoConfig, Payment } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const paymentId = body.data?.id || body.id

    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 })
    }

    const payment = await new Payment(client).get({ id: paymentId })

    const statusMap: Record<string, string> = {
      approved: "PAGADO",
      rejected: "RECHAZADO",
      cancelled: "CANCELADO",
      refunded: "CANCELADO",
      charged_back: "CANCELADO",
      in_process: "PENDIENTE",
      pending: "PENDIENTE",
      authorized: "PENDIENTE",
    }

    const paymentStatus = statusMap[payment.status!] || "PENDIENTE"
    const orderStatus = paymentStatus === "PAGADO" ? "PAGADO" : undefined

    const externalRef = payment.external_reference as string | undefined

    if (externalRef) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNo: externalRef },
      })

      if (existingOrder) {
        await prisma.payment.update({
          where: { orderId: existingOrder.id },
          data: {
            paymentId: String(paymentId),
            status: paymentStatus,
            method: "Mercado Pago",
            rawResponse: JSON.stringify(payment),
          },
        })

        if (orderStatus) {
          await prisma.order.update({
            where: { id: existingOrder.id },
            data: { status: orderStatus },
          })
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: unknown) {
    console.error("Webhook error:", error)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}
