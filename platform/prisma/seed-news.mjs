import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const owaspList = [
  ["A01:2021 — Broken Access Control", "Foydalanuvchi o‘ziga ruxsat berilmagan ma’lumot yoki amalga kira oladi. Himoya: har bir so‘rovda server tomonida ruxsatni tekshirish, standart holatda taqiqlash, ID orqali boshqa mijoz ma’lumotini ochib bo‘lmasligini sinash."],
  ["A02:2021 — Cryptographic Failures", "Maxfiy ma’lumot shifrlanmaydi yoki zaif algoritm ishlatiladi. Himoya: HTTPS hamma joyda, parollarni bcrypt/argon2 bilan xeshlash, kalitlarni kodda saqlamaslik."],
  ["A03:2021 — Injection", "SQL, buyruq yoki shablon injeksiyasi: kiritilgan ma’lumot kod sifatida bajariladi. Himoya: parametrlangan so‘rovlar/ORM, kiritishni validatsiya qilish, chiqishni to‘g‘ri escape qilish."],
  ["A04:2021 — Insecure Design", "Muammo kodda emas, loyihada: biznes mantig‘i xavfsizlikni hisobga olmagan. Himoya: tahdid modellashtirish, suiiste’mol holatlarini oldindan yozish, limitlar va tekshiruvlar."],
  ["A05:2021 — Security Misconfiguration", "Standart parollar, ortiqcha yoqilgan xizmatlar, batafsil xato xabarlari. Himoya: minimal sozlamalar, xavfsiz sarlavhalar, muhitlarni bir xil va tekshiriladigan qilish."],
  ["A06:2021 — Vulnerable and Outdated Components", "Eskirgan kutubxona yoki freymvorkdagi ma’lum zaifliklar. Himoya: bog‘liqliklar ro‘yxati, muntazam yangilash, npm audit kabi tekshiruvlar."],
  ["A07:2021 — Identification and Authentication Failures", "Zaif parollar, brute-force, sessiyani noto‘g‘ri boshqarish. Himoya: MFA, urinishlar limiti, sessiya muddatini cheklash, chiqishda sessiyani bekor qilish."],
  ["A08:2021 — Software and Data Integrity Failures", "Yangilanish, CI/CD yoki ma’lumot butunligi tekshirilmaydi. Himoya: imzolangan artefaktlar, ishonchli manbalar, deserializatsiyaga ehtiyotkorlik."],
  ["A09:2021 — Security Logging and Monitoring Failures", "Hujum yoki buzilish payti log va ogohlantirish yo‘q. Himoya: kirish, ruxsat va muhim amallarni yozib borish, loglarda maxfiy ma’lumot saqlamaslik, ogohlantirish."],
  ["A10:2021 — Server-Side Request Forgery (SSRF)", "Server hujumchi bergan manzilga so‘rov yuboradi va ichki resursga yetib boradi. Himoya: ruxsat etilgan manzillar ro‘yxati, ichki IP larni bloklash, DNS natijasini tekshirish."]
];

const articles = [
  {
    slug: "owasp-top-10-2021-nima",
    title: "OWASP Top 10 (2021): veb-ilovalardagi 10 asosiy xavf",
    excerpt: "Veb-ilova xavfsizligining eng mashhur ro‘yxati: har bir xavf nima va undan qanday himoyalanish kerak.",
    content: `OWASP (Open Worldwide Application Security Project) — veb-ilovalar xavfsizligi bo‘yicha ochiq hamjamiyat. Uning "Top 10" ro‘yxati eng keng tarqalgan xavf toifalarini jamlaydi va xavfsizlik auditlarida boshlang‘ich ma’lumot sifatida ishlatiladi. Quyida 2021-yil nashri keltirilgan; yangi nashrlar chiqqanda ro‘yxat o‘zgarishi mumkin, shuning uchun rasmiy sahifani (owasp.org) tekshirib turing.\n\n${owaspList.map(([t, d]) => `${t}\n${d}`).join("\n\n")}\n\nNima qilish kerak: ilovangizni shu 10 toifa bo‘yicha tekshiring, eng xavflisidan (odatda ruxsat va autentifikatsiya) boshlang. Tecsecure sizning tizimingiz uchun cheklangan va ruxsat berilgan doirada xavfsizlik auditini o‘tkazishi mumkin.`
  },
  {
    slug: "owasp-api-security-top-10-2023",
    title: "OWASP API Security Top 10 (2023): API uchun xavflar",
    excerpt: "Mobil ilova va integratsiyalar ishlatadigan API lar uchun eng muhim xavflar qisqacha.",
    content: `API lar zamonaviy ilovalarning asosi, shuning uchun hujumchilar ularni alohida nishonga oladi. OWASP API Security Top 10 (2023) ning asosiy toifalari:\n\n1. Broken Object Level Authorization — boshqa foydalanuvchi obyektiga ID orqali kirish.\n2. Broken Authentication — zaif yoki noto‘g‘ri tokenlar va kirish mexanizmlari.\n3. Broken Object Property Level Authorization — obyektning ruxsatsiz maydonlarini ko‘rish yoki o‘zgartirish.\n4. Unrestricted Resource Consumption — so‘rovlar va resurslarga limit yo‘q.\n5. Broken Function Level Authorization — oddiy foydalanuvchi admin funksiyasini chaqira oladi.\n6. Unrestricted Access to Sensitive Business Flows — biznes jarayonlarini avtomatlashtirib suiiste’mol qilish.\n7. Server Side Request Forgery — server hujumchi manzilini chaqiradi.\n8. Security Misconfiguration — noto‘g‘ri sozlamalar.\n9. Improper Inventory Management — unutilgan eski API versiyalari.\n10. Unsafe Consumption of APIs — uchinchi tomon API ma’lumotiga ishonib yuborish.\n\nAmaliy maslahat: har bir endpoint uchun "kim, nimaga, qancha marta" savoliga javob yozing va shuni test qiling.`
  },
  {
    slug: "fishing-xatlaridan-himoyalanish",
    title: "Fishing (phishing) xatlarini qanday tanib olish mumkin",
    excerpt: "Soxta xat va havolalar eng ko‘p uchraydigan hujum. Tezkor belgilar va xodimlar uchun qoidalar.",
    content: `Fishing — sizni soxta sahifaga kirib parol yoki to‘lov ma’lumotini kiritishga undaydigan hujum.\n\nGumonli belgilar:\n- Shoshiltiruvchi talab ("hisobingiz bloklanadi", "bugun to‘lang").\n- Jo‘natuvchi manzili kompaniya domeniga o‘xshash, lekin bitta harf farq qiladi.\n- Havola ustiga kursor olib borganda manzil boshqacha chiqadi.\n- Kutilmagan biriktirma yoki parol so‘rovi.\n\nQoidalar:\n1. Havolani bosmang, saytni brauzerda o‘zingiz oching.\n2. Parolni hech qachon xat orqali yubormang.\n3. Muhim hisoblarda ikki bosqichli tasdiqlashni (MFA) yoqing.\n4. Gumonli xatni IT mas’uliga yo‘naltiring, o‘chirishdan oldin.\n\nAgar parol kiritib qo‘ygan bo‘lsangiz, darhol uni almashtiring va IT xodimiga xabar bering.`
  },
  {
    slug: "parol-va-mfa-qoidalari",
    title: "Parollar va ikki bosqichli tasdiqlash (MFA): minimal qoidalar",
    excerpt: "Hisoblarni buzilishdan saqlashning eng oddiy va samarali usullari.",
    content: `Ko‘pchilik buzilishlar zaif yoki takrorlangan parollar tufayli yuz beradi.\n\n- Har bir xizmat uchun alohida, uzun parol (kamida 12–16 belgi) ishlating.\n- Parol menejeridan foydalaning, parolni qog‘ozga yoki umumiy chatga yozmang.\n- Elektron pochta, bank va admin hisoblarda MFA ni yoqing; imkon bo‘lsa SMS o‘rniga ilova yoki hardware kalit.\n- Xodim ketganda uning hisoblarini darhol o‘chiring.\n- Parol sizib chiqqanidan shubha qilsangiz, uni almashtiring.\n\nTashkilot uchun: kirish urinishlariga limit qo‘ying, admin kirishini alohida va qisqa muddatli qiling, kirish loglarini kuzating.`
  },
  {
    slug: "zaxira-nusxa-3-2-1",
    title: "Zaxira nusxa qoidasi 3-2-1: ma’lumotni yo‘qotmaslik",
    excerpt: "Virus, nosozlik yoki xato o‘chirishdan keyin ma’lumotni tiklash uchun oddiy qoida.",
    content: `3-2-1 qoidasi:\n- 3 ta nusxa ma’lumot (asl + 2 zaxira);\n- 2 xil turdagi saqlash vositasi (masalan, server va tashqi disk);\n- 1 ta nusxa boshqa joyda (offsite yoki bulut).\n\nMuhim: zaxira nusxa ishlashini tiklashni sinash orqali tekshiring. Sinalmagan zaxira kafolat emas. Shifrlovchi zararli dasturlardan (ransomware) himoya uchun kamida bitta nusxa tarmoqdan uzilgan yoki o‘zgartirib bo‘lmaydigan bo‘lsin.\n\nTavsiya: nima zaxiralanishini, qancha tez-tez va kim tiklashini yozma reja qilib qo‘ying.`
  },
  {
    slug: "wifi-tarmogini-xavfsiz-sozlash",
    title: "Ofis Wi‑Fi tarmog‘ini xavfsiz sozlash",
    excerpt: "Router va Wi‑Fi sozlamalarida eng ko‘p uchraydigan xatolar va ularning yechimi.",
    content: `Kichik ofislarda Wi‑Fi ko‘pincha standart sozlamada qoladi.\n\nTekshiruv ro‘yxati:\n1. Routerning admin parolini standartdan almashtiring.\n2. WPA2/WPA3 shifrlashdan foydalaning, ochiq tarmoq qoldirmang.\n3. Mehmonlar uchun alohida (guest) tarmoq yarating, ichki tarmoqdan ajrating.\n4. WPS ni o‘chiring.\n5. Router dasturiy ta’minotini yangilab turing.\n6. Kameralar va IoT qurilmalarni alohida tarmoq segmentiga qo‘ying.\n7. Admin panelga tashqaridan kirishni yoping.\n\nQamrov muammosi bo‘lsa, bitta kuchli router o‘rniga bir nechta nuqta to‘g‘ri joylashtirilgani yaxshiroq.`
  },
  {
    slug: "video-kuzatuv-kameralarini-xavfsiz-qilish",
    title: "Video kuzatuv tizimini xavfsiz qilish: kameralar ham hujum nishoni",
    excerpt: "IP kamera va NVR lar internetga ochiq qolsa, osongina buziladi. Nimalarga e’tibor berish kerak.",
    content: `IP kameralar va NVR lar ham tarmoq qurilmasi, ularni ham himoya qilish kerak.\n\n- Standart login va parolni darhol almashtiring.\n- Qurilmalarni internetga to‘g‘ridan-to‘g‘ri ochmang; kerak bo‘lsa VPN ishlating.\n- Kameralarni alohida VLAN yoki tarmoqqa ajrating.\n- Prошивка (firmware) yangilanishlarini muntazam o‘rnating.\n- Keraksiz xizmatlarni (UPnP, telnet) o‘chiring.\n- Arxiv muddati va disk hajmini oldindan hisoblang.\n\nTecsecure video kuzatuv loyihasini hisoblash, o‘rnatish va sozlashda yordam beradi: /request-quote orqali so‘rov qoldiring.`.replace("Prошивка", "Dasturiy ta’minot")
  },
  {
    slug: "kiberxavfsizlik-auditi-nima-beradi",
    title: "Kiberxavfsizlik auditi nima beradi va nimani tekshiradi",
    excerpt: "Audit bosqichlari, natija hujjati va chegaralari: buyurtma berishdan oldin bilish kerak bo‘lganlar.",
    content: `Audit — ruxsat berilgan doirada tizimning zaif joylarini topish va tuzatish rejasini berish jarayoni.\n\nBosqichlar:\n1. Qamrov va yozma ruxsat kelishiladi.\n2. Tekshiruv: konfiguratsiya, ruxsatlar, ma’lumotlar oqimi, ma’lum zaifliklar.\n3. Hisobot: topilmalar, xavf darajasi, tavsiyalar.\n4. Tuzatishdan keyin qayta tekshiruv.\n\nChegaralari: audit tekshiruv vaqtidagi holatni ko‘rsatadi va to‘liq xavfsizlikni kafolatlamaydi. Narx qamrovga bog‘liq va taklifda alohida ko‘rsatiladi.\n\nHisobot tuzilmasi namunasi: /sample-report.`
  }
];

let created = 0;
for (const [index, article] of articles.entries()) {
  const exists = await prisma.newsArticle.findUnique({ where: { slug: article.slug }, select: { id: true } });
  if (exists) continue;
  await prisma.newsArticle.create({
    data: { ...article, status: "PUBLISHED", publishedAt: new Date(Date.now() - index * 60_000) }
  });
  created += 1;
}
console.log(`News ready: ${created} created, ${articles.length - created} already present`);
await prisma.$disconnect();
