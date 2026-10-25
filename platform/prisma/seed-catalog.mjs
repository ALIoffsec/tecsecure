import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Video kuzatuv", slug: "video-kuzatuv" },
  { name: "Tarmoq uskunalari", slug: "tarmoq-uskunalari" },
  { name: "Xavfsizlik", slug: "xavfsizlik" }
];

// Taxminiy boshlang‘ich UZS narxlari; admin katalogdan o‘zgartirishi mumkin.
const items = [
  ["video-kuzatuv", "cctv-ip-kamera-tanlovi", "IP videokamera tanlovi", "Obyekt turi, yoritilganlik va saqlash muddatiga qarab IP kamera tanlash va o‘rnatish.", 125_000_000],
  ["video-kuzatuv", "cctv-nvr-saqlash", "NVR va video saqlash tizimi", "Kameralar soni va arxiv muddatiga mos NVR hamda disk hajmini hisoblash.", 450_000_000],
  ["tarmoq-uskunalari", "tarmoq-router-switch", "Router va switch to‘plami", "Ofis yoki obyekt uchun marshrutizator, PoE switch va kabel infratuzilmasi.", 380_000_000],
  ["tarmoq-uskunalari", "tarmoq-wifi-qamrov", "Wi‑Fi qamrov loyihasi", "Xonalar va foydalanuvchilar soniga qarab nuqtalar joylashuvi va uskuna tanlovi.", 260_000_000],
  ["xavfsizlik", "xavfsizlik-firewall", "Firewall va tarmoq himoyasi", "Kichik va o‘rta biznes uchun firewall tanlash, sozlash va qoidalarni hujjatlashtirish.", 750_000_000],
  ["xavfsizlik", "xavfsizlik-nazorat-kirish", "Kirishni nazorat qilish tizimi", "Eshik nazorati, kartalar va hisobot yuritish uchun uskunalar to‘plami.", 420_000_000]
];

// Bir martalik: admin o‘chirgan yoki o‘zgartirgan mahsulotlar qayta tiklanmasligi uchun.
const markerKey = "seed.catalog.v2";
if (!process.argv.includes("--force") && (await prisma.siteSetting.findUnique({ where: { key: markerKey } }))) {
  console.log("Catalog seed already applied, skipping (use --force to re-run)");
  await prisma.$disconnect();
  process.exit(0);
}

for (const category of categories) {
  await prisma.productCategory.upsert({ where: { slug: category.slug }, update: {}, create: category });
}

for (const [categorySlug, slug, name, description, priceMinor] of items) {
  const category = await prisma.productCategory.findUnique({ where: { slug: categorySlug } });
  await prisma.product.upsert({
    where: { slug },
    update: { priceMinor },
    create: {
      slug,
      name,
      description,
      categoryId: category.id,
      priceMinor,
      stockStatus: "ON_REQUEST",
      warrantyDescription: "Kafolat muddati tanlangan uskuna va taklifda alohida ko‘rsatiladi.",
      status: "PUBLISHED"
    }
  });
}

await prisma.siteSetting.upsert({ where: { key: markerKey }, update: {}, create: { key: markerKey, value: new Date().toISOString() } });
console.log(`Catalog ready: ${items.length} items`);
await prisma.$disconnect();
