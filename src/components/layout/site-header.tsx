"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/categoria/poleras", label: "Poleras" },
  { href: "/categoria/polerones", label: "Polerones" },
  { href: "/categoria/buzos", label: "Buzos" },
  { href: "/mayorista", label: "Mayorista" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, open: openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-white transition-shadow",
        scrolled && "shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20">
        <button
          aria-label="Abrir menú"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="font-display text-xl tracking-tight lg:text-2xl">
          Ropa Unicolor
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[12px] uppercase tracking-[0.18em]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "link-underline transition-colors",
                pathname === n.href ? "text-ink" : "text-gray-600 hover:text-ink"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Buscar"
            className="rounded-full p-2 hover:bg-muted"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            aria-label="Carrito"
            className="relative rounded-full p-2 hover:bg-muted"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-medium text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="container-x flex h-16 items-center justify-between">
            <span className="font-display text-xl">Menú</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="container-x flex flex-col gap-6 py-8 text-2xl font-display">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="border-b border-line pb-4"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 grid place-items-start bg-black/30" onClick={() => setSearchOpen(false)}>
          <div
            className="container-x mt-24 rounded-none bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form action="/catalogo" method="get" className="flex items-center gap-3 border-b border-ink pb-2">
              <Search className="h-5 w-5" />
              <input
                name="q"
                autoFocus
                placeholder="Buscar poleras, buzos, polerones..."
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gray-500">
              Sugerencias
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Polera oversize", "Polerón hoodie", "Jogger", "Negro", "Mujer"].map((s) => (
                <Link
                  key={s}
                  href={`/catalogo?q=${encodeURIComponent(s)}`}
                  className="chip"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
