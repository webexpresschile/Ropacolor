import Link from "next/link";
import { Camera, Mail, MapPin } from "lucide-react";

const COL = [
  {
    title: "Tienda",
    items: [
      { href: "/catalogo", label: "Catálogo" },
      { href: "/categoria/poleras", label: "Poleras" },
      { href: "/categoria/polerones", label: "Polerones" },
      { href: "/categoria/buzos", label: "Buzos" },
      { href: "/categoria/pantalones", label: "Pantalones" },
    ],
  },
  {
    title: "Información",
    items: [
      { href: "/mayorista", label: "Programa mayorista" },
      { href: "/envios", label: "Envíos y devoluciones" },
      { href: "/guia-de-tallas", label: "Guía de tallas" },
      { href: "/preguntas", label: "Preguntas frecuentes" },
    ],
  },
  {
    title: "Compañía",
    items: [
      { href: "/nosotros", label: "Nosotros" },
      { href: "/contacto", label: "Contacto" },
      { href: "/admin", label: "Acceso administrativo" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-x py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h3 className="font-display text-3xl">Ropa Unicolor</h3>
            <p className="mt-4 max-w-md text-sm text-gray-600">
              Poleras, buzos y básicos premium para hombres y mujeres. Compras al detalle o por mayor.
              Hecho con foco en calidad, durabilidad y diseño minimalista.
            </p>
            <form className="mt-8 max-w-md">
              <label className="label">Suscríbete a novedades</label>
              <div className="mt-2 flex items-center gap-2 border-b border-ink py-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="tu@correo.cl"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button type="submit" className="text-xs uppercase tracking-[0.18em]">
                  Unirme
                </button>
              </div>
            </form>
            <div className="mt-8 flex items-center gap-3 text-sm text-gray-600">
              <Camera className="h-4 w-4" />
              <a
                href="https://instagram.com/ropaunicolorcl"
                target="_blank"
                rel="noreferrer"
                className="link-underline"
              >
                @ropaunicolorcl
              </a>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Santiago, Chile</span>
            </div>
          </div>

          {COL.map((c) => (
            <div key={c.title} className="lg:col-span-2">
              <h4 className="label">{c.title}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {c.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="text-gray-700 transition-colors hover:text-ink"
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-1">
            <h4 className="label">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/terminos" className="text-gray-700 hover:text-ink">Términos</Link></li>
              <li><Link href="/privacidad" className="text-gray-700 hover:text-ink">Privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-xs text-gray-500 lg:flex-row lg:items-center">
          <p>© {new Date().getFullYear()} Ropa Unicolor. Todos los derechos reservados.</p>
          <p>Hecho con cariño en Chile.</p>
        </div>
      </div>
    </footer>
  );
}
