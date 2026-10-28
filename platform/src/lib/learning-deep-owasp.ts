import type { Localized, LearningSection, LearningReference } from "./learning-demo";

const l = (uz: string): Localized => ({ uz, ru: uz, en: uz });

export const owaspDeepSections: LearningSection[] = [
  {
    title: l("4. Kriptografik nosozliklar (Cryptographic Failures)"),
    content: l(
      "Kriptografik nosozlik — ma’lumotni saqlashda yoki uzatishda noto‘g‘ri yoki yetarli bo‘lmagan himoya qo‘llanilishi natijasida maxfiylik yoki butunlik buzilishini anglatadi. Bu muammo ko‘pincha “shifrlash yo‘q” darajasida emas, balki noto‘g‘ri tanlov darajasida yuz beradi: eskirgan algoritm (MD5, SHA-1, DES, RC4), o‘z-o‘zidan yozilgan shifr sxemasi, qisqa kalit uzunligi, qattiq kodlangan yoki versiya nazoratida saqlangan kalitlar, TLS’ni eski versiyalarda qoldirish yoki sertifikatni to‘g‘ri tekshirmaslik.\n\nMa’lumotni uch holatda ko‘rib chiqish kerak: harakatda (in transit), tinch holatda (at rest) va xotirada ishlatilayotganda. Harakatdagi ma’lumot uchun TLS 1.2+ majburiy bo‘lsin, zaif shifr to‘plamlari o‘chirilsin va HSTS qo‘llanilsin. Tinch holatdagi ma’lumot uchun AES-GCM kabi autentifikatsiyalangan shifrlash ishlatiladi; ma’lumotlar bazasi darajasidagi shifrlash disk o‘g‘irlanishidan himoya qiladi, lekin ilova darajasidagi SQL injection’dan himoya qilmaydi — bu ikkalasi bir-birini almashtirmaydi.\n\nKalit boshqaruvi ko‘pincha eng zaif bo‘g‘in bo‘ladi: kalitlarni kod ichida, konfiguratsiya faylida yoki git tarixida saqlash, kalitlarni hech qachon aylantirmaslik (rotation), yoki bitta kalitdan butun tizim uchun foydalanish xavf tug‘diradi. Maxsus kalit boshqaruv xizmati (KMS/HSM) orqali kalitlarni generatsiya qilish, saqlash, aylantirish va huquqni cheklashni avtomatlashtirish lozim. Parollarni shifrlash emas, balki Argon2id kabi moslashtirilgan xeshlash funksiyasi bilan himoyalash kerak, chunki shifrlangan parolni kalit chiqsa qayta tiklash mumkin, to‘g‘ri xeshlangan parolni esa yo‘q.\n\nSenior darajadagi muhandis uchun muhim savol — “nima uchun aynan shu algoritm va rejim tanlandi” va “kalit chiqib ketsa qanday ta’sir zanjiri yuzaga keladi”. Kriptografiyani o‘zingiz ixtiro qilmang; yaxshi tekshirilgan kutubxona va standart protokollardan foydalaning."
    ),
    example: l(
      "// Node.js: tinch holatdagi maydonni autentifikatsiyalangan shifrlash bilan himoyalash\nconst { createCipheriv, randomBytes } = require(\"crypto\");\nconst iv = randomBytes(12);\nconst cipher = createCipheriv(\"aes-256-gcm\", encryptionKeyFromKms, iv);\nconst ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);\nconst authTag = cipher.getAuthTag();\n// iv, ciphertext va authTag alohida saqlanadi; kalit KMS’dan olinadi, kodda yozilmaydi."
    ),
    exampleExplanation: l(
      "Misolda AES-256-GCM autentifikatsiyalangan shifrlash ishlatilgan — bu nafaqat maxfiylikni, balki ma’lumot o‘zgartirilmaganini ham tekshiradi. Shifrlash kaliti kodga qattiq yozilmagan, balki tashqi kalit boshqaruv xizmatidan olinadi. Bu faqat konfiguratsiya namunasi; haqiqiy kalitlarni hech qachon manba kodida saqlamang."
    ),
    question: {
      prompt: l("Ma’lumotni ham shifrlaydigan, ham o‘zgartirilmaganini tasdiqlaydigan shifrlash rejimi odatda qanday nomlanadi?"),
      answers: ["autentifikatsiyalangan shifrlash", "authenticated encryption", "aes-gcm"]
    }
  },
  {
    title: l("5. Noto‘g‘ri dizayn (Insecure Design)"),
    content: l(
      "Insecure Design — bu aniq kod xatosi emas, balki tizim arxitekturasi va biznes-mantiq darajasidagi xavfsizlik kamchiligidir. Masalan, parolni tiklash funksiyasi faqat email orqali tekshirilib, hisob egasining boshqa tasdiqlovchi omilini talab qilmasa, kod to‘g‘ri yozilgan bo‘lishi mumkin, lekin dizayn tajovuzkorga imkoniyat beradi. Bunday muammolarni faqat kodni tuzatish bilan yo‘qotib bo‘lmaydi — qayta loyihalash kerak bo‘ladi.\n\nSecure-by-design tamoyili loyihalash bosqichidayoq xavfsizlikni hisobga olishni talab qiladi. Bu threat modeling — tizimning trust boundary’lari, actor’lari, ma’lumot oqimi va suiiste’mol stsenariylarini (abuse cases) aniqlash — orqali amalga oshiriladi. STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) kabi metodologiyalar fikrni tizimlashtiradi, lekin ular formal jarayon emas, balki muhokama uchun asos bo‘lishi kerak.\n\nResurs cheklovlarini loyihalashda ham dizayn xatolari uchraydi: fayl yuklash hajmi cheklanmagan, API uchun rate limiting yo‘q, yoki bitta foydalanuvchi cheksiz miqdorda resurs yarata oladi — bularning barchasi denial-of-service yoki xarajat asosidagi hujumlarga olib keladi. Shuningdek, “fail open” dizayn — xavfsizlik tekshiruvi ishlamay qolganda tizim ruxsat berish tomoniga o‘tishi — juda xavfli, chunki xatolik avtomatik ravishda ruxsatga aylanadi; to‘g‘ri yondashuv “fail closed”dir.\n\nSecure design pattern’lar — masalan, har bir yozuv uchun egalikni tekshiruvchi reference architecture, markazlashgan avtorizatsiya qatlami, standart xavfsiz konfiguratsiya shablonlari — takroriy xatolarni kamaytiradi. Dizaynni ko‘rib chiqish jarayoni (design review) kod ko‘rib chiqishdan oldin, talablar bosqichida boshlanishi kerak."
    ),
    example: l(
      "Threat model yozuvi (jadval shakli):\nAsset: parolni tiklash funksiyasi\nActor: anonim tashqi foydalanuvchi\nAbuse case: email’ga kirish huquqisiz hisobni egallash\nMitigation: vaqtinchalik token + muddat + bitta martalik foydalanish + urinishlarni cheklash"
    ),
    exampleExplanation: l(
      "Bu misol kod emas, balki threat modeling yozuvi namunasi — dizayn bosqichida xavfni qanday hujjatlashtirish kerakligini ko‘rsatadi. Bunday jadval real tizim nomlari yoki haqiqiy zaifliklarni oshkor qilmasdan, umumiy metodologiya sifatida ishlatiladi."
    ),
    question: {
      prompt: l("Tizim trust boundary, actor va abuse case’larini loyihalash bosqichida tahlil qilish jarayoni qanday ataladi?"),
      answers: ["threat modeling", "tahdidlarni modellashtirish"]
    }
  },
  {
    title: l("6. Xavfsizlik konfiguratsiyasidagi xatolar (Security Misconfiguration)"),
    content: l(
      "Security misconfiguration — ilova, server, konteyner yoki bulut xizmatining noto‘g‘ri yoki ortiqcha darajada ochiq sozlanganligi natijasida yuzaga keladigan keng tarqalgan muammolar guruhi. Bunga standart (default) login ma’lumotlarini o‘zgartirmaslik, ishlab chiqarish muhitida debug rejimini yoqib qo‘yish, stack trace’larni foydalanuvchiga to‘liq ko‘rsatish, keraksiz portlar va xizmatlarni faol qoldirish hamda keraksiz HTTP metodlarini (masalan PUT, TRACE) yoqiq qoldirish kiradi.\n\nBulutga asoslangan infratuzilmada bu muammo yangi shaklga ega: ommaviy (public) qilib qo‘yilgan S3/Blob saqlash konteynerlari, haddan tashqari keng IAM rolllari, cheklanmagan xavfsizlik guruhlari (0.0.0.0/0 qoidalari) va yoqilgan, ammo kuzatilmaydigan metadata endpoint’lari. Infrastructure-as-Code (Terraform, CloudFormation) yordamida konfiguratsiyani versiya nazoratida saqlash va har o‘zgarishni ko‘rib chiqish, qo‘lda konsol orqali sozlashga qaraganda xatoni kamaytiradi.\n\nXavfsiz standart holat (secure by default) tamoyili muhim: yangi yaratilgan resurs standart holatda eng kam ruxsatga ega bo‘lishi, kerakli funksiyalarni ongli ravishda yoqish talab qilinishi kerak — aksincha emas. Xato xabarlarini ishlab chiqarishda umumiy ko‘rinishda ko‘rsatib, batafsil diagnostika faqat ichki loglarga yozilishi lozim, aks holda tajovuzkor stack trace orqali texnologiya versiyasi va ichki yo‘llar haqida ma’lumot oladi.\n\nMuntazam konfiguratsiya auditi (CIS Benchmarks kabi mezonlarga asoslangan) va avtomatlashtirilgan skanerlash (cloud security posture management) ishlab chiqarish va rivojlanish muhitlari o‘rtasidagi farqni kamaytiradi. Konfiguratsiya o‘zgarishlarini ham kod o‘zgarishi kabi ko‘rib chiqish (review) jarayonidan o‘tkazish tavsiya etiladi."
    ),
    example: l(
      "# Terraform: ommaviy o‘qishni aniq taqiqlaydigan S3 konfiguratsiyasi\nresource \"aws_s3_bucket_public_access_block\" \"data\" {\n  bucket                  = aws_s3_bucket.data.id\n  block_public_acls       = true\n  block_public_policy     = true\n  ignore_public_acls      = true\n  restrict_public_buckets = true\n}"
    ),
    exampleExplanation: l(
      "Bu Infrastructure-as-Code namunasi saqlash konteynerini tasodifan ommaviy qilib qo‘yishning oldini oladi va o‘zgarishni versiya nazoratida ko‘rib chiqish imkonini beradi. Haqiqiy resurs identifikatorlari va hisob ma’lumotlari ko‘rsatilmagan; bu faqat konfiguratsiya namunasi."
    ),
    question: {
      prompt: l("Standart holatda resurs eng kam ruxsatga ega bo‘lishi kerak degan tamoyil qanday ataladi?"),
      answers: ["secure by default", "xavfsiz standart holat"]
    }
  },
  {
    title: l("7. Zaif va eskirgan komponentlar (Vulnerable and Outdated Components)"),
    content: l(
      "Zamonaviy ilovalar o‘z kodidan ko‘ra ko‘proq uchinchi tomon kutubxonalar, freymvorklar va konteyner baza image’laridan iborat bo‘ladi. Ushbu komponentlarning har biri — hatto tranzitiv (bilvosita) bog‘liqliklar ham — xavfsizlik zaifliklari bilan kelishi mumkin. Muammo shundaki, ko‘p jamoalar o‘z qaram bo‘lgan komponentlar ro‘yxatini to‘liq bilmaydi, versiyalarni yangilamaydi yoki yangi oshkor qilingan zaiflik haqida xabardor bo‘lmaydi.\n\nDependency management intizomi bir nechta elementdan iborat: qaram bo‘lgan komponentlarni va ularning aniq versiyalarini qulflash (lockfile), avtomatlashtirilgan zaiflik skanerlashni (SCA — Software Composition Analysis) CI quvuriga qo‘shish, va yangilanishlarni muntazam, lekin nazorat ostida qo‘llash. Software Bill of Materials (SBOM) — bu ilovada ishlatilgan barcha komponentlar, ularning versiyalari va litsenziyalarining rasmiy ro‘yxati; u yangi zaiflik e’lon qilinganda qaysi mahsulotlar ta’sirlanganini tezda aniqlash imkonini beradi.\n\nYangilanish siyosati muvozanatni talab qiladi: har bir yangilanishni darhol qo‘llash beqarorlik xavfini keltirib chiqarishi mumkin, ammo yangilanishlarni oylab kechiktirish ma’lum zaifliklarni ochiq qoldiradi. Tanqidiy (critical) darajadagi zaifliklar uchun qisqa muddatli patch oynasi, kam xavfli yangilanishlar uchun rejalashtirilgan muntazam tsikl belgilanadi. Eskirgan, qo‘llab-quvvatlanmaydigan (end-of-life) komponentlarni aniqlash va ularni almashtirish rejasini yuritish ham shu intizomning bir qismi.\n\nMuhim amaliy jihat — faqat “zaiflik bor” degan ogohlantirishga emas, balki haqiqiy ekspluatatsiya qilish imkoniyati, ta’sir doirasi va kompensatsion nazoratlarning mavjudligiga qarab ustuvorlik berish. Buni risk-based patch management deyiladi, u sof CVSS ball asosida ishlashdan ko‘ra samaraliroq."
    ),
    example: l(
      "// package.json: versiyani qat’iy qulflash (semver darajasini cheklash)\n{\n  \"dependencies\": {\n    \"express\": \"4.19.2\"\n  }\n}\n// CI bosqichi: npm audit --omit=dev --audit-level=high"
    ),
    exampleExplanation: l(
      "Bu misol aniq versiyani qulflash va CI ichida avtomatik zaiflik skanerlashni ko‘rsatadi. `audit-level=high` sozlamasi past darajadagi ogohlantirishlar bilan band bo‘lmay, muhim zaifliklarga ustuvorlik berishga yordam beradi. Haqiqiy loyihada bu buyruqni mavjud paket menejeringizga moslang."
    ),
    question: {
      prompt: l("Ilovada ishlatilgan barcha komponentlar va versiyalarning rasmiy ro‘yxati qanday ataladi?"),
      answers: ["sbom", "software bill of materials"]
    }
  },
  {
    title: l("8. Dasturiy ta’minot va ma’lumot yaxlitligi nosozliklari (Software and Data Integrity Failures)"),
    content: l(
      "Bu toifa ma’lumot yoki kod manbasi va yaxlitligi to‘g‘ri tekshirilmasdan ishonib qabul qilinishi bilan bog‘liq xavflarni qamrab oladi. Ikki muhim misol: CI/CD quvuri ishonchi va insecure deserialization. CI/CD quvurida build jarayoni, yordamchi vositalar (plugin’lar) va tashqi paket manbalari ko‘pincha avtomatik ravishda ishonch bilan ishga tushiriladi; agar ulardan biri buzilsa, zararli kod ishlab chiqarish muhitiga kirib ketishi mumkin. Shuning uchun build serverlariga kirish nazorati, imzolangan commit’lar, va “pipeline-as-code”ni ham ko‘rib chiqishdan o‘tkazish muhim.\n\nYangilanishlarni va artefaktlarni raqamli imzo (code signing) bilan tasdiqlamasdan tarqatish xavfli: tajovuzkor yetkazib berish kanalini yoki paket manbasini buzsa, imzosiz yangilanish qurilmalarga osongina o‘rnatilishi mumkin. Imzolash kaliti xavfsiz saqlanishi, build jarayoni esa reproducible (takrorlanadigan) bo‘lishi kerak — shunda mustaqil tarzda artefaktning manba kodga mos ekanligini tasdiqlash mumkin bo‘ladi.\n\nInsecure deserialization — ishonchsiz manbadan kelgan serializatsiya qilingan ma’lumotni, uning tarkibini tekshirmasdan, dasturiy ob’ektga qayta tiklash. Ba’zi tillarda (masalan Java, PHP, Python pickle) bu jarayon o‘zboshimchalik bilan kod bajarilishiga olib kelishi mumkin, chunki deserializatsiya paytida ob’ekt konstruktorlari yoki maxsus metodlar avtomatik chaqiriladi. Xavfsiz yondashuv — ishonchsiz ma’lumot uchun faqat JSON kabi formatlarni, qat’iy sxema bilan ishlatish va tilning “xavfli” deserializatsiya funksiyalaridan umuman foydalanmaslik.\n\nYaxlitlikni ta’minlashning umumiy tamoyili: har qanday tashqi manbadan kelgan kod yoki ma’lumot — bo‘lsin u dependency, build artefakt yoki foydalanuvchi so‘rovi — kriptografik tasdiqlanmaguncha ishonchsiz deb hisoblanishi kerak."
    ),
    example: l(
      "# Imzolangan artefaktni tekshirish g‘oyasi (sintetik)\ncosign verify --key cosign.pub registry.example.com/app:1.4.2\n# Muvaffaqiyatli bo‘lsa, deploy quvuri davom etadi; aks holda to‘xtatiladi."
    ),
    exampleExplanation: l(
      "Bu buyruq konteyner image’ining raqamli imzosini, uni ishga tushirishdan oldin tekshirish g‘oyasini ko‘rsatadi. Bu faqat konseptual namuna; haqiqiy kalit va registry manzillarini maxfiy saqlang va faqat o‘z infratuzilmangizda qo‘llang."
    ),
    question: {
      prompt: l("Serializatsiya qilingan ma’lumotni tekshirmasdan ob’ektga tiklash natijasida yuzaga keladigan zaiflik qanday ataladi?"),
      answers: ["insecure deserialization", "xavfli deserializatsiya"]
    }
  },
  {
    title: l("9. Xavfsizlik jurnalini yuritish va monitoring nosozliklari (Security Logging and Monitoring Failures)"),
    content: l(
      "Agar hujum sodir bo‘lganda uni aniqlab bo‘lmasa, boshqa barcha himoya choralari ham kechikib ishlaydi. Logging and monitoring failures — yetarli hodisalar qayd qilinmagani, loglar saqlanmagani yoki ularga hech kim qaramasligi natijasida hujumlarning uzoq vaqt fosh bo‘lmay qolishiga olib keladi. Ilova xavfsizligi nuqtai nazaridan qayd qilinishi kerak bo‘lgan asosiy hodisalar: muvaffaqiyatsiz va muvaffaqiyatli autentifikatsiya urinishlari, avtorizatsiya rad etilishi, muhim ma’lumotlarga kirish, administrator amallari va kirish nazorati konfiguratsiyasidagi o‘zgarishlar.\n\nLog yozuvlarida nimani saqlash kerakligi bilan bir qatorda, nimani saqlamaslik ham muhim: parollar, to‘liq kredit karta raqamlari, token’lar va boshqa maxfiy ma’lumotlarni log’ga yozish — bu o‘zi yangi ma’lumot sizib chiqish nuqtasiga aylanadi. Log yozuvlarini markazlashtirish (SIEM) va ularni foydalanuvchi ma’lumotlariga asoslanib o‘zgartirib bo‘lmaydigan (tamper-evident) shaklda saqlash tavsiya etiladi.\n\nLog injection — foydalanuvchi kiritgan ma’lumot tozalanmasdan log yozuviga qo‘shilishi natijasida, masalan yangi qator belgisi orqali soxta log yozuvlari kiritilishi yoki log tahlil qiluvchi tizimni chalg‘itish mumkin bo‘lgan holat. Log yozishdan oldin foydalanuvchi ma’lumotini tozalash yoki strukturaviy (structured, masalan JSON) formatda yozish bu xavfni kamaytiradi.\n\nFaqat log yig‘ish yetarli emas — signal shovqindan ajratilishi va haqiqiy anomaliyalar bo‘yicha signal (alert) ishlab chiqilishi kerak. Masalan, bir hisobga bir necha daqiqa ichida ko‘plab muvaffaqiyatsiz login urinishlari, odatiy bo‘lmagan vaqtda yoki geografik joydan muvaffaqiyatli login, yoki avtorizatsiya darajasining to‘satdan oshishi (privilege escalation) kabi naqshlarga avtomatik signal o‘rnatilishi lozim. Signalga javob berish jarayoni (incident response runbook) oldindan tayyorlangan bo‘lishi, aks holda aniqlash signal bo‘lsa-da, javob kech beriladi."
    ),
    example: l(
      "// Strukturaviy xavfsizlik logi (JSON) — log injection xavfini kamaytiradi\n{\n  \"event\": \"auth.failed_login\",\n  \"userId\": \"u_48213\",\n  \"ip\": \"203.0.113.10\",\n  \"attemptCount\": 6,\n  \"timestamp\": \"2025-01-01T10:15:02Z\"\n}"
    ),
    exampleExplanation: l(
      "Strukturaviy JSON formati foydalanuvchi kiritgan qiymatlarni alohida maydonlarga joylashtiradi, shuning uchun ular log formatini buzib, soxta qatorlar qo‘sha olmaydi. Bu faqat log yozuvi namunasi; haqiqiy IP va foydalanuvchi identifikatorlari sintetikdir."
    ),
    question: {
      prompt: l("Foydalanuvchi kiritgan ma’lumot tozalanmay log yozuviga qo‘shilishi orqali soxta yozuv kiritish imkonini beruvchi zaiflik qanday ataladi?"),
      answers: ["log injection", "jurnalga kiritish hujumi"]
    }
  },
  {
    title: l("10. Server tomonidan so‘rov qalbakilashtirish (Server-Side Request Forgery, SSRF)"),
    content: l(
      "SSRF — serverga tashqi manba (odatda URL) orqali tajovuzkor tomonidan boshqariladigan HTTP so‘rovini, server nomidan, serverning o‘zi joylashgan tarmoq pozitsiyasidan yuborishga majburlash hujumi. Bu odatda ilova rasm/fayl olish, webhook tasdiqlash yoki URL oldindan ko‘rish (preview) kabi funksiyalarda “foydalanuvchi bergan manzilga server o‘zi so‘rov yuboradi” mantig‘i mavjud bo‘lganda yuzaga keladi. Tajovuzkor tashqi ko‘rinadigan manzil o‘rniga serverning ichki tarmog‘idagi manzillarni (masalan 127.0.0.1, ichki admin panel yoki boshqa mikroservis) kiritadi.\n\nSSRF’ning ayniqsa xavfli nishoni — bulut muhitidagi metadata endpoint’lari (masalan 169.254.169.254 manzilidagi instance metadata xizmati). Bu endpoint ko‘pincha hech qanday autentifikatsiyasiz, faqat tarmoq joylashuviga (serverning o‘zidan kelishiga) ishonib, vaqtinchalik hisob ma’lumotlari yoki boshqaruv tokenlarini qaytaradi. Agar ilova tajovuzkor bergan URL’ga erkin so‘rov yuborsa va bu so‘rov metadata xizmatiga yo‘naltirilsa, natija — bulutdagi resurslarga imtiyozli kirish huquqini qo‘lga kiritish bo‘lishi mumkin.\n\nSSRF’ga qarshi himoya bir nechta qatlamda quriladi: ilova darajasida — foydalanuvchi bergan manzilni ro‘yxatga olingan (allowlist) domenlar bilan solishtirish, DNS orqali IP’ga aylantirilgandan keyin ham ichki/xususiy IP diapazonlarini (RFC 1918, link-local) rad etish, va redirectlarni cheklash (chunki birinchi so‘rov ruxsat etilgan bo‘lib, keyin ichki manzilga yo‘naltirilishi mumkin). Tarmoq darajasida — chiqish trafigini segmentlash (egress filtering), metadata xizmatiga faqat kerakli xizmatlardan kirish huquqini berish, va zamonaviy bulut provayderlarida IMDSv2 kabi so‘rov-javob token talab qiluvchi metadata protokollaridan foydalanish tavsiya etiladi.\n\nFaqat domen nomini tekshirish yetarli emas, chunki DNS rebinding orqali tekshiruv paytidagi va haqiqiy so‘rov paytidagi IP manzil farq qilishi mumkin; shuning uchun tekshiruv so‘rov amalga oshirilayotgan paytdagi haqiqiy ulanish IP’siga nisbatan qayta tasdiqlanishi kerak."
    ),
    example: l(
      "// Xavfsiz yondashuv: tashqi URL olib kelishdan oldin ichki IP diapazonlarini rad etish\nfunction isPrivateOrReserved(ip) {\n  return /^(127\\.|10\\.|169\\.254\\.|192\\.168\\.|172\\.(1[6-9]|2[0-9]|3[0-1])\\.)/.test(ip);\n}\n// So‘rov yuborishdan oldin resolved IP shu funksiya bilan tekshiriladi;\n// mos kelsa so‘rov rad etiladi va hodisasi log qilinadi."
    ),
    exampleExplanation: l(
      "Bu misol tashqi URL’dan resurs olishdan oldin, so‘rov yo‘naltiriladigan haqiqiy IP manzilni ichki/zaxira diapazonlarga qarshi tekshirish g‘oyasini ko‘rsatadi. Bu to‘liq SSRF himoyasi emas — ishlab chiqarishda allowlist, redirect nazorati va tarmoq segmentatsiyasi bilan birga qo‘llanishi kerak."
    ),
    question: {
      prompt: l("Bulut muhitida, autentifikatsiyasiz vaqtinchalik hisob ma’lumotlarini qaytaradigan va SSRF uchun keng tarqalgan nishon bo‘lgan ichki endpoint qanday ataladi?"),
      answers: ["metadata endpoint", "instance metadata service", "metadata xizmati"]
    }
  },
  {
    title: l("11. Xavfsiz SDLC va test metodologiyasi"),
    content: l(
      "Xavfsizlikni dasturiy ta’minot hayot siklining oxirida, faqat testdan o‘tkazish bosqichida qo‘shish — eng qimmat va eng kam samarali yondashuv. Secure SDLC xavfsizlikni talablar, dizayn, kodlash, test, joylashtirish va qo‘llab-quvvatlash bosqichlarining har biriga singdiradi. Dizayn bosqichida threat modeling o‘tkazish — trust boundary, actor va abuse case’larni aniqlash — keyinchalik kod darajasida tuzatib bo‘lmaydigan arxitektura xatolarining oldini oladi.\n\nTest metodologiyasida uchta asosiy yondashuv bir-birini to‘ldiradi. SAST (Static Application Security Testing) manba kodni, uni ishga tushirmasdan, zaifliklar uchun tahlil qiladi; u erta bosqichda ishlaydi va CI’ga osongina integratsiya qilinadi, lekin runtime kontekstni bilmagani uchun ko‘p yolg‘on signal (false positive) berishi mumkin. DAST (Dynamic Application Security Testing) ishlayotgan ilovaga tashqi so‘rovlar yuborib, haqiqiy javoblarni tahlil qiladi; bu runtime muammolarni topadi, lekin kodning qaysi qatori sabab ekanini ko‘rsatmaydi va faqat sinovdan o‘tkazilgan yo‘llarni qamrab oladi. Qo‘lda kod ko‘rib chiqish (manual review) va qo‘lda penetration test esa ikkalasining ham o‘tkazib yuborishi mumkin bo‘lgan biznes-mantiq xatolarini, murakkab avtorizatsiya stsenariylarini aniqlashga qodir — bu avtomatlashtirib bo‘lmaydigan fikrlash talab qiladi.\n\nSoftware Composition Analysis (SCA) alohida kategoriya sifatida qaram komponentlardagi ma’lum zaifliklarni aniqlaydi va ko‘pincha SAST bilan birga ishlatiladi. Bu vositalarning hech biri yolg‘iz yetarli emas; ular bir-birini to‘ldiruvchi qatlamlar (defense in depth testing) sifatida qaraladi.\n\nResponsible disclosure va bug bounty dasturlari tashkilotdan tashqaridagi tadqiqotchilarga zaifliklarni xavfsiz, yozma ruxsat asosida xabar qilish kanalini ta’minlaydi: aniq scope, ruxsat etilgan test usullari, javob berish muddati va oshkor qilish siyosati (masalan 90 kunlik koordinatsiyalashgan disclosure) belgilanadi. Tashkilot `security.txt` fayli yoki maxsus murojaat sahifasi orqali xabar qilish yo‘lini ochiq ko‘rsatishi, xabar bergan tadqiqotchiga huquqiy ta’qib emas, minnatdorchilik bilan javob berishi — ishonchli xavfsizlik madaniyatining belgisidir."
    ),
    example: l(
      "# CI quvuri bosqichlari ketma-ketligi (konseptual)\n1) SAST: manba kodni statik tahlil\n2) SCA: dependency zaiflik skanerlash\n3) Unit/integration testlar\n4) DAST: staging muhitida dinamik skanerlash\n5) Qo‘lda xavfsizlik ko‘rib chiqish (yuqori xavfli o‘zgarishlar uchun)"
    ),
    exampleExplanation: l(
      "Bu konseptual quvur turli test turlarining qaysi bosqichda eng samarali ishlashini ko‘rsatadi. Har bir loyiha o‘z xavf darajasiga qarab bosqichlarni moslashtiradi; bu sintetik namuna, haqiqiy vosita nomlari yoki sozlamalarni ifodalamaydi."
    ),
    question: {
      prompt: l("Ishlayotgan ilovaga tashqi so‘rovlar yuborib, javoblarni tahlil qilish orqali zaiflik qidiradigan test turi qanday ataladi?"),
      answers: ["dast", "dynamic application security testing"]
    }
  }
];

export const owaspDeepReferences: LearningReference[] = [
  { label: l("OWASP Top 10 loyihasi"), href: "https://owasp.org/www-project-top-ten/" },
  { label: l("OWASP Software Component Verification Standard"), href: "https://owasp.org/www-project-software-component-verification-standard/" }
];
