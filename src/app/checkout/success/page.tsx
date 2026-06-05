import Link from "next/link";
import { CheckCircle } from "lucide-react";

type Props = { searchParams: Promise<{ orderNo?: string }> };

export default async function CheckoutSuccessPage(props: Props) {
  const { orderNo } = await props.searchParams;
  return (
    <div className="section">
      <div className="container-x flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle className="h-16 w-16 text-green-600" />
        <h1 className="mt-6 font-display text-3xl">¡Pago exitoso!</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gracias por tu compra. Te hemos enviado un resumen a tu correo.
        </p>
        {orderNo && (
          <p className="mt-4 text-sm">
            N° de pedido: <span className="font-mono font-medium">{orderNo}</span>
          </p>
        )}
        <Link href="/catalogo" className="btn-outline mt-8">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
