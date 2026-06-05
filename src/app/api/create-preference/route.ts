import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { generateOrderNo } from "@/lib/utils"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

type CartItemInput = {
  productId: string
  name: string
  color: string
  size: string
  quantity: number
  priceUnit: number
  priceNormal: number
  priceWholesale: number
  minWholesaleQty: number
}

export async function POST(request: Request) {
  try {
    const { items, customer, couponCode } = await request.json()

    if (!items?.length || !customer) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // Calculate totals with wholesale logic (counting all variants of same product)
    const byProduct: Record<string, { qty: number; minWholesaleQty: number; priceNormal: number; priceWholesale: number }> = {}

    for (const item of items) {
      const bucket = byProduct[item.productId] || {
        qty: 0,
        minWholesaleQty: item.minWholesaleQty ?? 3,
        priceNormal: item.priceNormal ?? item.priceUnit,
        priceWholesale: item.priceWholesale ?? item.priceUnit,
      }
      bucket.qty += item.quantity
      byProduct[item.productId] = bucket
    }

    const orderItems = items.map((item: CartItemInput) => {
      const bucket = byProduct[item.productId]
      const usesWholesale = bucket.qty >= bucket.minWholesaleQty
      const priceUnit = usesWholesale ? bucket.priceWholesale : bucket.priceNormal
      return {
        productId: item.productId,
        name: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        priceUnit,
        priceTotal: priceUnit * item.quantity,
        minWholesaleQty: bucket.minWholesaleQty,
        priceNormal: bucket.priceNormal,
        priceWholesale: bucket.priceWholesale,
      }
    })

    const subtotal = orderItems.reduce((sum: number, i: { priceNormal: number; quantity: number }) => sum + i.priceNormal * i.quantity, 0)
    const discount = subtotal - orderItems.reduce((sum: number, i: { priceTotal: number }) => sum + i.priceTotal, 0)

    // Validate coupon if provided
    let couponDiscount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (coupon && coupon.active && coupon.usedCount < coupon.maxUses && (!coupon.expiry || new Date(coupon.expiry) > new Date())) {
        couponDiscount = coupon.type === "FIXED" ? coupon.value : Math.floor(subtotal * coupon.value / 100)
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
      }
    }

    const total = Math.max(0, subtotal - discount - couponDiscount)
    const orderNo = generateOrderNo()

    // Create or find customer
    let dbCustomer = await prisma.customer.findUnique({ where: { email: customer.email } })
    if (!dbCustomer) {
      dbCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          lastName: customer.lastName,
          rut: customer.rut || null,
          email: customer.email,
          phone: customer.phone,
          region: customer.region,
          city: customer.city,
          address: customer.address,
        },
      })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNo,
        customerId: dbCustomer.id,
        subtotal,
        discount: discount + couponDiscount,
        total,
        couponCode: couponCode || null,
        comments: customer.comments || null,
        items: {
          create: orderItems.map((i: { productId: string; color: string; size: string; quantity: number; priceUnit: number; priceTotal: number }) => ({
            productId: i.productId,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            priceUnit: i.priceUnit,
            priceTotal: i.priceTotal,
          })),
        },
      },
    })

    // Decrement stock
    for (const item of items) {
      const variant = await prisma.productVariant.findFirst({
        where: {
          productId: item.productId,
          color: item.color,
          size: item.size,
        },
      })
      if (variant) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } },
        })
      }
    }

    // Create payment record
    await prisma.payment.create({
      data: { orderId: order.id, status: "PENDIENTE" },
    })

    // Create Mercado Pago preference
    const mpItems = orderItems.map((i: { productId: string; name: string; color: string; size: string; quantity: number; priceUnit: number }) => ({
      id: i.productId,
      title: `${i.name} - ${i.color} / ${i.size}`,
      quantity: i.quantity,
      unit_price: i.priceUnit,
      currency_id: "CLP",
    }))

    const preference = await new Preference(client).create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/checkout/success?orderNo=${orderNo}`,
          failure: `${process.env.NEXTAUTH_URL}/checkout/failure?orderNo=${orderNo}`,
          pending: `${process.env.NEXTAUTH_URL}/checkout/pending?orderNo=${orderNo}`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhook/mercadopago`,
        external_reference: orderNo,
      },
    })

    await prisma.payment.update({
      where: { orderId: order.id },
      data: { preferenceId: preference.id },
    })

    return NextResponse.json({
      preferenceId: preference.id,
      preferenceUrl: preference.init_point,
      orderNo,
    })
  } catch (error: unknown) {
    console.error("Error creating preference:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
