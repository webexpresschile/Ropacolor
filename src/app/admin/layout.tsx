import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: "250px 1fr" }}>
      <aside className="border-r border-line bg-muted p-6">
        <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Admin
        </p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-white hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-line px-8 py-4">
          <p className="text-sm font-semibold">Ropa Unicolor Admin</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">{session.user?.email}</span>
            <Link href="/api/auth/signout" className="text-xs text-gray-500 underline underline-offset-2 hover:text-ink">
              Cerrar sesión
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
