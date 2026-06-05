# Ropa Unicolor — E-commerce

Tienda online de ropa unicolor con precios mayoristas, construida con Next.js 15.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, API Routes
- **DB:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **Pagos:** Mercado Pago
- **Imágenes:** Cloudinary
- **Emails:** Resend
- **Hosting:** Vercel

---

# Guía de instalación y despliegue (paso a paso)

## 1. Requisitos previos

Antes de empezar, necesitas crear cuentas en estos servicios (gratuitas):

| Servicio | Para qué | Enlace |
|---|---|---|
| **GitHub** | Alojar el código | https://github.com |
| **Vercel** | Hosting de la app | https://vercel.com |
| **Neon** (o Railway/Supabase) | Base de datos PostgreSQL | https://neon.tech |
| **Mercado Pago** | Procesar pagos | https://www.mercadopago.cl |
| **Resend** | Envío de emails | https://resend.com |
| **Cloudinary** | Almacenar imágenes | https://cloudinary.com |

También necesitas tener instalado:
- **Node.js 20+** → https://nodejs.org
- **Git** → https://git-scm.com
- **NPM** (viene con Node.js)

---

## 2. Obtener el código

```bash
# Clonar el repositorio
git clone https://github.com/webexpresschile/Ropacolor.git
cd Ropacolor

# Instalar dependencias
npm install
```

---

## 3. Configurar PostgreSQL (Neon)

1. Ve a https://neon.tech y crea una cuenta
2. Crea un nuevo proyecto (selecciona la región más cercana a Chile)
3. En el dashboard, busca **Connection Details**
4. Copia la **Connection String** (se ve así):
   ```
   postgresql://usuario:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Guarda esta URL en un bloc de notas, la necesitarás después

**Alternativas a Neon:**
- [Railway](https://railway.app) — PostgreSQL gestionado con free tier
- [Supabase](https://supabase.com) — PostgreSQL + autenticación

---

## 4. Configurar Mercado Pago

1. Ve a https://www.mercadopago.cl/developers y crea una cuenta
2. En **Credenciales**, copia el **Access Token de producción** (empieza con `APP_USR-`)
   - También puedes usar credenciales de prueba (`TEST-`) para desarrollo
3. Guarda el token

### Webhook (notificaciones de pago):

En el dashboard de Mercado Pago, configura la URL de notificaciones:
```
https://tudominio.cl/api/webhook/mercadopago
```
Esto permite que cuando un pago se apruebe, Mercado Pago avise automáticamente a tu app.

---

## 5. Configurar Resend (emails)

1. Ve a https://resend.com y crea una cuenta
2. En **API Keys**, crea una nueva API Key
3. Copia la llave (empieza con `re_`)

---

## 6. Configurar Cloudinary (imágenes)

1. Ve a https://cloudinary.com y crea una cuenta
2. Ve a **Dashboard** y copia la **Cloudinary URL**
   - Se ve así: `cloudinary://api_key:api_secret@cloud_name`

---

## 7. Configurar variables de entorno local

Copia el archivo de ejemplo y edítalo con tus datos:

```bash
cp .env.example .env
```

Edita `.env` y completa cada campo:

```env
# Base de datos PostgreSQL (desde Neon/Railway/Supabase)
DATABASE_URL="postgresql://usuario:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="<genera una clave segura>"
NEXTAUTH_URL="http://localhost:3000"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxxxxxxxxx"

# Resend
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Cloudinary
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

> **Para generar NEXTAUTH_SECRET** ejecuta en terminal: `openssl rand -base64 32`
> En Windows puedes usar: https://generate-random.org/api-key-generator

---

## 8. Inicializar base de datos

```bash
# Sincronizar el esquema de base de datos
npx prisma db push

# Poblar datos iniciales (admin, categorías, productos de ejemplo)
npx prisma db seed

# (Opcional) Explorar la base de datos visualmente
npx prisma studio
```

**Datos de seed:**

| Tipo | Datos |
|---|---|
| Admin | admin@ropaunicolor.cl / admin123 |
| Categorías | Poleras, Buzos, Polerones, Pantalones, Accesorios |
| Productos | Polera Oversize, Polerón Hoodie, Joggers Classic |
| Cupones | BIENVENIDA10 (10%), UNICOLOR5000 ($5.000) |

---

## 9. Probar en desarrollo local

```bash
npm run dev
```

Abre http://localhost:3000

| Ruta | Descripción |
|---|---|
| `/` | Home con hero, categorías, productos destacados |
| `/catalogo` | Catálogo con filtros (categoría, color, talla) |
| `/producto/polera-oversize-algodon` | Detalle de producto con selector de variantes |
| `/carrito` | Carrito de compras persistente |
| `/checkout` | Formulario de pago con Mercado Pago |
| `/admin` | Panel administrativo (login: admin@ropaunicolor.cl / admin123) |
| `/admin/login` | Página de inicio de sesión |

---

## 10. Desplegar en Vercel

### 10.1 Subir código a GitHub

```bash
# Inicializar git (si no lo está)
git init
git add .
git commit -m "Initial commit: Ropa Unicolor e-commerce"

# Conectar con GitHub (crea un repositorio vacío primero)
git remote add origin https://github.com/TU_USUARIO/ropacolor.git
git branch -M main
git push -u origin main
```

### 10.2 Importar en Vercel

1. Ve a https://vercel.com/new
2. Haz clic en **Continue with GitHub**
3. Selecciona el repositorio `ropacolor`
4. Vercel detectará automáticamente que es un proyecto Next.js

### 10.3 Configurar variables de entorno en Vercel

En la pantalla de configuración del proyecto, agrega **todas** estas variables:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Tu URL de PostgreSQL de Neon |
| `NEXTAUTH_SECRET` | La misma clave que usaste localmente |
| `NEXTAUTH_URL` | `https://tudominio.vercel.app` (lo sabrás después del deploy) |
| `MERCADOPAGO_ACCESS_TOKEN` | Tu Access Token de producción |
| `RESEND_API_KEY` | Tu API Key de Resend |
| `CLOUDINARY_URL` | Tu URL de Cloudinary |

> **Nota sobre NEXTAUTH_URL:** Puedes dejarlo vacío temporalmente y actualizarlo después del primer deploy, cuando Vercel te asigne la URL.

### 10.4 Desplegar

Haz clic en **Deploy**. Vercel construirá y publicará tu sitio.

Una vez terminado, Vercel te dará una URL tipo:
```
https://ropacolor.vercel.app
```

### 10.5 Actualizar NEXTAUTH_URL

1. Ve al dashboard de Vercel → tu proyecto → **Settings** → **Environment Variables**
2. Actualiza `NEXTAUTH_URL` con la URL de Vercel: `https://ropacolor.vercel.app`
3. Ve a la pestaña **Deployments**, busca el último deploy, haz clic en **•••** → **Redeploy**

### 10.6 Configurar dominio personalizado (opcional)

1. Compra un dominio (ej: ropaunicolor.cl) en [Namecheap](https://namecheap.com) o [Nexus](https://nexus.cl)
2. En Vercel: **Settings** → **Domains** → agrega tu dominio
3. Sigue las instrucciones de Vercel para configurar los DNS

---

## 11. Configurar webhook de Mercado Pago (producción)

Una vez que tu sitio esté en vivo, configura el webhook:

1. Ve a https://www.mercadopago.cl/developers → **Webhooks**
2. Agrega una nueva URL de notificación:
   ```
   https://ropacolor.vercel.app/api/webhook/mercadopago
   ```
3. Selecciona el evento **Pagos** (solo `payment`)
4. Guarda

Esto permite que cuando un cliente pague, Mercado Pago notifique a tu app y el pedido se marque como "Pagado" automáticamente.

---

## 12. Post-despliegue: seed en producción

Después del deploy, necesitas poblar la base de datos de producción:

### Opción A: Usar una terminal local

```bash
# Asegúrate de tener la DATABASE_URL de producción en tu .env local
npx prisma db push
npx prisma db seed
```

### Opción B: Usar Vercel CLI

```bash
npm i -g vercel
vercel pull
vercel env pull .env.production
npx prisma db push
npx prisma db seed
```

### Opción C: Usar Prisma Studio conectado a producción

```bash
DATABASE_URL="<url-de-produccion>" npx prisma studio
```

---

## 13. Mantenimiento diario

### Actualizar stock

Desde el admin: `/admin/productos` → Editar producto → Modificar stock de variantes

### Ver pedidos

Desde el admin: `/admin/pedidos` → Ver detalle → Cambiar estado (Pendiente → Pagado → Preparando → Enviado → Entregado)

### Crear cupones

Desde el admin: `/admin/cupones` → Nuevo cupón

### Subir nuevas imágenes

Las imágenes se almacenan en Cloudinary. Actualmente las URLs se ingresan manualmente en el formulario de producto.

---

## 14. Solución de problemas comunes

### Error: "PrismaClient is not configured"

**Causa:** Falta la variable `DATABASE_URL` en el entorno.

**Solución:** Verifica que esté configurada tanto en `.env` local como en Vercel.

### Error: "Can't reach database"

**Causa:** Neon puede suspender la base de datos por inactividad (en free tier).

**Solución:** Ve a Neon dashboard y haz clic en "Resume" o conecta la base de datos con Prisma Studio para reactivarla.

### Error 500 al pagar con Mercado Pago

**Causa:** El Access Token no es válido o no está configurado.

**Solución:** Verifica `MERCADOPAGO_ACCESS_TOKEN` en Vercel. Asegúrate de usar credenciales de **producción** (`APP_USR-`) no de prueba.

### El webhook no actualiza los pedidos

**Causa:** La URL del webhook no es accesible.

**Solución:** Verifica que la URL esté configurada correctamente en Mercado Pago y que el sitio esté funcionando. Prueba manualmente con:
```bash
curl -X POST https://ropacolor.vercel.app/api/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"action":"payment.create","data":{"id":"test"}}'
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── admin/              # Panel administrativo
│   │   ├── login/          #   Página de login
│   │   ├── productos/      #   CRUD productos
│   │   ├── categorias/     #   CRUD categorías
│   │   ├── pedidos/        #   CRUD pedidos
│   │   ├── cupones/        #   CRUD cupones
│   │   ├── configuracion/  #   Configuración
│   │   ├── layout.tsx      #   Layout del admin (protegido)
│   │   └── page.tsx        #   Dashboard
│   ├── api/
│   │   ├── auth/           #   NextAuth
│   │   ├── coupons/        #   Validación de cupones
│   │   ├── create-preference/ # Crear preferencia Mercado Pago
│   │   ├── orders/         #   Listar pedidos
│   │   ├── products/       #   CRUD productos vía API
│   │   └── webhook/        #   Webhook Mercado Pago
│   ├── carrito/            # Página del carrito
│   ├── catalogo/           # Catálogo con filtros
│   ├── categoria/[slug]/   # Página por categoría
│   ├── checkout/           # Checkout + páginas post-pago
│   │   ├── success/        #   Pago exitoso
│   │   ├── failure/        #   Pago rechazado
│   │   └── pending/        #   Pago pendiente
│   ├── producto/[slug]/    # Detalle de producto
│   │   ├── page.tsx
│   │   ├── image-gallery.tsx
│   │   ├── variant-selector.tsx
│   │   └── wholesale-info.tsx
│   ├── layout.tsx          # Layout principal
│   ├── globals.css         # Estilos globales
│   └── page.tsx            # Home
├── components/
│   ├── layout/
│   │   ├── announcement-bar.tsx
│   │   ├── site-header.tsx
│   │   └── site-footer.tsx
│   └── ui/
│       ├── cart-drawer.tsx
│       ├── product-card.tsx
│       └── toaster.tsx
└── lib/
    ├── prisma.ts           # Cliente Prisma
    ├── auth.ts             # Configuración NextAuth
    ├── cart-context.tsx    # Estado global del carrito
    ├── cart-types.ts       # Tipos del carrito
    ├── toast-context.tsx   # Sistema de notificaciones
    └── utils.ts            # Utilidades (formatCLP, slugify, etc.)
prisma/
├── schema.prisma           # Esquema de base de datos
└── seed.ts                 # Datos iniciales
prisma.config.ts            # Configuración Prisma v7
```

---

## Funcionalidades incluidas

- [x] Catálogo con filtros por categoría, color, talla y búsqueda
- [x] Sistema de variantes (color + talla con stock independiente)
- [x] Precios mayoristas automáticos (3+ unidades del mismo producto, cualquier variante)
- [x] Carrito de compras persistente (localStorage)
- [x] Checkout con formulario completo y pago via Mercado Pago
- [x] Webhook de Mercado Pago para actualización automática de pedidos
- [x] Panel administrativo con Dashboard, CRUD de productos, pedidos, cupones
- [x] Control de stock con descuento automático al vender
- [x] Cupones de descuento (fijo o porcentual)
- [x] SEO: Sitemap dinámico, robots.txt, Open Graph, metadatos por página
- [x] Diseño responsive, tipografía moderna, experiencia mobile-first
- [x] Autenticación protegida para el panel admin
