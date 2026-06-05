import Link from "next/link";
import { XCircle } from "lucide-react";

type Props = { searchParams: Promise<{ orderNo?: string }> };

export default async function CheckoutFailurePage(props: Props) {
  const { orderNo } = await props.searchParams;
  return (
    <div className="section">
      <div className="container-x flex flex-col items-center justify-center py-20 text-center">
        <XCircle className="h-16 w-16 text-red-600" />
        <h1 className="mt-6 font-display text-3xl">Pago rechazado</h1>
        <p className="mt-2 text-sm text-gray-500">
          El pago no pudo ser procesado. Intenta nuevamente o usa otro medio de pago.
        </p>
        {orderNo && (
          <p className="mt-4 text-sm">
            N° de pedido: <span className="font-mono font-medium">{orderNo}</span>
          </p>
        )}
        <Link href="/checkout" className="btn-outline mt-8">
          Intentar nuevamente
        </Link>
      </div>
    </div>
  );
}
