import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Video kuzatuv", slug: "video-kuzatuv" },
  { name: "Tarmoq uskunalari", slug: "tarmoq-uskunalari" },
  { name: "Xavfsizlik", slug: "xavfsizlik" }
];

// Narxsiz, "so‘rov bo‘yicha" katalog: aniq model va narx buyurtma bo‘yicha tanlanadi.
const items = [
  ["video-kuzatuv", "cctv-ip-kamera-tanlovi", "IP videokamera tanlovi", "Obyekt turi, yoritilganlik va saqlash muddatiga qarab IP kamera tanlash va o‘rnatish."],
  ["video-kuzatuv", "cctv-nvr-saqlash", "NVR va video saqlash tizimi", "Kameralar soni va arxiv muddatiga mos NVR hamda disk hajmini hisoblash."],
  ["tarmoq-uskunalari", "tarmoq-router-switch", "Router va switch to‘plami", "Ofis yoki obyekt uchun marshrutizator, PoE switch va kabel infratuzilmasi."],
  ["tarmoq-uskunalari", "tarmoq-wifi-qamrov", "Wi‑Fi qamrov loyihasi", "Xonalar va foydalanuvchilar soniga qarab nuqtalar joylashuvi va uskuna tanlovi."],
  ["xavfsizlik", "xavfsizlik-firewall", "Firewall va tarmoq himoyasi", "Kichik va o‘rta biznes uchun firewall tanlash, sozlash va qoidalarni hujjatlashtirish."],
  ["xavfsizlik", "xavfsizlik-nazorat-kirish", "Kirishni nazorat qilish tizimi", "Eshik nazorati, kartalar va hisobot yuritish uchun uskunalar to‘plami."]
];

// Bir martalik: admin o‘chirgan yoki o‘zgartirgan mahsulotlar qayta tiklanmasligi uchun.
const markerKey = "seed.catalog.v1";
if (!process.argv.includes("--force") && (await prisma.siteSetting.findUnique({ where: { key: markerKey } }))) {
  console.log("Catalog seed already applied, skipping (use --force to re-run)");
  await prisma.$disconnect();
  process.exit(0);
}

for (const category of categories) {
  await prisma.productCategory.upsert({ where: { slug: category.slug }, update: {}, create: category });
}

for (const [categorySlug, slug, name, description] of items) {
  const category = await prisma.productCategory.findUnique({ where: { slug: categorySlug } });
  await prisma.product.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name,
      description,
      categoryId: category.id,
      priceMinor: null,
      stockStatus: "ON_REQUEST",
      warrantyDescription: "Kafolat muddati tanlangan uskuna va taklifda alohida ko‘rsatiladi.",
      status: "PUBLISHED"
    }
  });
}

await prisma.siteSetting.upsert({ where: { key: markerKey }, update: {}, create: { key: markerKey, value: new Date().toISOString() } });
console.log(`Catalog ready: ${items.length} items`);
await prisma.$disconnect();
