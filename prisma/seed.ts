import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ropaunicolor.cl" },
    update: {},
    create: {
      email: "admin@ropaunicolor.cl",
      name: "Admin Ropa Unicolor",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin created/verified:", admin.email);

  // Create initial categories
  const categoriesData = [
    { name: "Poleras", slug: "poleras", description: "Poleras unicolor de calce perfecto y algodón de alta calidad.", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600" },
    { name: "Buzos", slug: "buzos", description: "Buzos cómodos y resistentes para el uso diario.", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600" },
    { name: "Polerones", slug: "polerones", description: "Polerones con y sin capucha en una variada paleta de tonos neutros.", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" },
    { name: "Pantalones", slug: "pantalones", description: "Pantalones básicos diseñados para combinar con todo.", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600" },
    { name: "Accesorios", slug: "accesorios", description: "Detalles que complementan tu look minimalista.", image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?q=80&w=600" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories.push(upserted);
  }
  console.log(`${categories.length} categories upserted.`);

  // Create initial products with variants
  const polerasCat = categories.find((c) => c.slug === "poleras")!;
  const poleronesCat = categories.find((c) => c.slug === "polerones")!;
  const buzosCat = categories.find((c) => c.slug === "buzos")!;

  const productsData = [
    {
      name: "Polera Oversize Algodón",
      slug: "polera-oversize-algodon",
      shortDesc: "Polera clásica unicolor corte oversize 100% algodón orgánico.",
      longDesc: "Diseñada para un calce relajado de hombros caídos y una caída limpia. Confeccionada con algodón de 240g de alta durabilidad, suave al tacto y perfecta para cualquier temporada.",
      categoryId: polerasCat.id,
      brand: "Ropa Unicolor",
      tags: "oversize,basicos,poleras",
      priceNormal: 14990,
      priceWholesale: 10990,
      minWholesaleQty: 3,
      active: true,
      featured: true,
      images: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600,https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600",
      metaTitle: "Polera Oversize Algodón - Ropa Unicolor",
      metaDescription: "Compra poleras oversize de alta calidad en Ropa Unicolor. Precios mayoristas desde 3 unidades de cualquier variante.",
      variants: [
        { color: "Negro", size: "S", stock: 15, sku: "POL-OV-BLK-S" },
        { color: "Negro", size: "M", stock: 25, sku: "POL-OV-BLK-M" },
        { color: "Negro", size: "L", stock: 20, sku: "POL-OV-BLK-L" },
        { color: "Negro", size: "XL", stock: 10, sku: "POL-OV-BLK-XL" },
        { color: "Blanco", size: "S", stock: 12, sku: "POL-OV-WHT-S" },
        { color: "Blanco", size: "M", stock: 30, sku: "POL-OV-WHT-M" },
        { color: "Blanco", size: "L", stock: 18, sku: "POL-OV-WHT-L" },
        { color: "Gris", size: "M", stock: 15, sku: "POL-OV-GRY-M" },
        { color: "Gris", size: "L", stock: 15, sku: "POL-OV-GRY-L" },
      ],
    },
    {
      name: "Polerón Premium Hoodie",
      slug: "poleron-premium-hoodie",
      shortDesc: "Polerón con capucha y bolsillo canguro unicolor.",
      longDesc: "Confeccionado en frisa de algodón con interior cepillado súper suave. Mantiene su forma y color lavado tras lavado. El básico definitivo para un look urbano y minimalista.",
      categoryId: poleronesCat.id,
      brand: "Ropa Unicolor",
      tags: "hoodie,polerones,premium",
      priceNormal: 24990,
      priceWholesale: 18990,
      minWholesaleQty: 3,
      active: true,
      featured: true,
      images: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600,https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600",
      metaTitle: "Polerón Premium Hoodie - Ropa Unicolor",
      metaDescription: "Polerón hoodie unicolor en color negro, gris y azul. Precios especiales por mayor.",
      variants: [
        { color: "Negro", size: "S", stock: 10, sku: "HD-PR-BLK-S" },
        { color: "Negro", size: "M", stock: 20, sku: "HD-PR-BLK-M" },
        { color: "Negro", size: "L", stock: 15, sku: "HD-PR-BLK-L" },
        { color: "Gris", size: "M", stock: 12, sku: "HD-PR-GRY-M" },
        { color: "Gris", size: "L", stock: 8, sku: "HD-PR-GRY-L" },
        { color: "Azul", size: "M", stock: 10, sku: "HD-PR-BLU-M" },
      ],
    },
    {
      name: "Joggers Classic Confort",
      slug: "joggers-classic-confort",
      shortDesc: "Buzos de tiro medio y calce jogger con cordón de ajuste.",
      longDesc: "Máxima comodidad para entrenar o estar en casa. Diseñados con rib elástico en tobillos y pretina, y bolsillos laterales de gran tamaño.",
      categoryId: buzosCat.id,
      brand: "Ropa Unicolor",
      tags: "jogger,pantalones,buzo",
      priceNormal: 19990,
      priceWholesale: 14990,
      minWholesaleQty: 3,
      active: true,
      featured: true,
      images: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600",
      metaTitle: "Joggers Classic Confort - Ropa Unicolor",
      metaDescription: "Joggers unicolor de calce perfecto para hombre y mujer.",
      variants: [
        { color: "Negro", size: "M", stock: 20, sku: "JG-CL-BLK-M" },
        { color: "Negro", size: "L", stock: 15, sku: "JG-CL-BLK-L" },
        { color: "Gris", size: "M", stock: 18, sku: "JG-CL-GRY-M" },
      ],
    },
  ];

  for (const prod of productsData) {
    const { variants, ...prodFields } = prod;
    const dbProduct = await prisma.product.upsert({
      where: { slug: prodFields.slug },
      update: prodFields,
      create: prodFields,
    });

    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: { stock: variant.stock, active: true, productId: dbProduct.id },
        create: { ...variant, productId: dbProduct.id },
      });
    }
  }

  // Create some initial coupons
  const couponsData = [
    { code: "BIENVENIDA10", type: "PERCENT", value: 10, maxUses: 100, active: true },
    { code: "UNICOLOR5000", type: "FIXED", value: 5000, maxUses: 50, active: true },
  ];

  for (const coup of couponsData) {
    await prisma.coupon.upsert({
      where: { code: coup.code },
      update: coup,
      create: coup,
    });
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
