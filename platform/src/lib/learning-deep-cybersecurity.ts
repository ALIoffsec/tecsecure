import type { Localized, LearningReference, LearningSection } from "./learning-demo";

const l = (uz: string): Localized => ({ uz, ru: uz, en: uz });

export const cybersecurityDeepSections: LearningSection[] = [
  {
    title: l("4. Threat modeling va STRIDE: hujumchi nuqtai nazaridan fikrlash"),
    content: l(
      "Threat modeling — tizimni ishga tushirishdan oldin yoki uni qayta ko‘rib chiqishda, qanday tahdidlar mavjudligini tizimli tarzda aniqlash jarayoni. Birinchi qadam — data flow diagram chizish: foydalanuvchi, komponent, ma’lumot oqimi va ishonch chegaralarini (trust boundary) belgilash. Har bir chegara — hujumchi ko‘proq imkoniyat olishi mumkin bo‘lgan joy, masalan, tashqi tarmoqdan ichki serverga, yoki oddiy foydalanuvchidan admin paneliga o‘tish nuqtasi.\n\nSTRIDE modeli har bir komponent uchun olti toifadagi tahdidni tekshirishga undaydi: Spoofing (shaxsni soxtalashtirish), Tampering (ma’lumotni ruxsatsiz o‘zgartirish), Repudiation (harakatni inkor qilish imkoniyati, ya’ni audit log yo‘qligi), Information disclosure (maxfiy ma’lumotning oshkor bo‘lishi), Denial of service (xizmatni ishdan chiqarish) va Elevation of privilege (imtiyozni oshirish). Har bir harf tegishli xavfsizlik xususiyatiga (autentifikatsiya, yaxlitlik, nonrepudiation, maxfiylik, mavjudlik, avtorizatsiya) ziddir.\n\nAttack surface — tizimga tashqi ta’sir qilish mumkin bo‘lgan barcha kirish nuqtalari: ochiq portlar, API endpointlar, foydalanuvchi kiritadigan maydonlar, uchinchi tomon kutubxonalar, hatto fizik portlar. Senior muhandis har bir yangi xususiyat qo‘shilganda attack surface kengayishini hisobga oladi va “eng kam imtiyoz”, “defaultni yopiq holatda qoldirish” kabi tamoyillar bilan uni cheklaydi. Threat modeling bir martalik hujjat emas — arxitektura o‘zgarganda qayta ko‘rib chiqiladi, va har bir aniqlangan tahdid uchun mitigatsiya, qoldiq xavf va kim javobgarligini yozib qo‘yish kerak. Model o‘zi hujumni oldini olmaydi; u faqat ustuvorliklarni aniqlashga yordam beradi, amalga oshirish esa muhandislik va test orqali tasdiqlanishi shart."
    ),
    example: l(
      "Data flow: Browser --(HTTPS)--> API Gateway --(internal mTLS)--> Orders Service --(SQL)--> Database\nTrust boundary #1: Internet -> API Gateway\nTrust boundary #2: API Gateway -> internal network\nSTRIDE eslatma (Orders Service): Tampering — so‘rov parametri serverda qayta tekshirilmasa, narx o‘zgartirilishi mumkin."
    ),
    exampleExplanation: l(
      "Bu sintetik arxitektura diagrammasi real loyihaga tegishli emas, faqat ishonch chegaralarini ko‘rsatish uchun. Har bir chegarada STRIDE savollarini berish amaliyotini ko‘rsatadi: masalan, mijoz tomonidan yuborilgan narx server tomonida qayta tasdiqlanishi kerak. Haqiqiy tizim uchun threat modelni vakolatli arxitektura jamoasi bilan birga, hujjatlashtirilgan holda o‘tkazing."
    ),
    question: { prompt: l("STRIDE’dagi “T” qaysi tahdid toifasini anglatadi?"), answers: ["tampering", "ma'lumotni o'zgartirish", "tampering (data alteration)"] }
  },
  {
    title: l("5. Risk boshqaruvi va CVSS bahosi mantig‘i"),
    content: l(
      "Xavfsizlik cheksiz resurs bilan shug‘ullanmaydi, shuning uchun risk boshqaruvi ustuvorlikni belgilaydi. Klassik formula: risk ≈ ehtimollik (likelihood) × ta’sir (impact). Ehtimollikka hujumchining motivatsiyasi, zaiflikdan foydalanish qulayligi, mavjud nazoratlar ta’sir qiladi; ta’sirga esa ma’lumot sezgirligi, xizmat kritikligi va tiklanish narxi kiradi. Risk qabul qilish (accept), kamaytirish (mitigate), o‘tkazish (transfer, masalan sug‘urta) yoki butunlay oldini olish (avoid) — to‘rtta asosiy javob strategiyasi.\n\nCVSS (Common Vulnerability Scoring System) zaiflikning texnik jiddiyligini standartlashtirilgan 0–10 shkalada ifodalaydi. Base metric guruhi Attack Vector (tarmoqdan yoki faqat lokal), Attack Complexity, Privileges Required, User Interaction, Scope hamda Confidentiality/Integrity/Availability ta’sirini baholaydi. Masalan, autentifikatsiyasiz, tarmoq orqali, foydalanuvchi aralashuvisiz ishga tushiriladigan uzoqdan kod bajarish zaifligi odatda yuqori bazaviy ball oladi, chunki Attack Vector=Network va Privileges Required=None hujumni osonlashtiradi.\n\nLekin CVSS base ball yagona qaror mezoni bo‘lmasligi kerak: Temporal metrikalar (exploit mavjudmi, patch chiqqanmi) va Environmental metrikalar (sizning tizimingizda bu komponent qanchalik muhim, qanday kompensatsion nazoratlar bor) haqiqiy ustuvorlikni belgilaydi. Yuqori CVSS balli zaiflik, agar u internetdan izolyatsiyalangan, tarmoq segmentida, kompensatsion nazorat ostida bo‘lsa, past amaliy risk tug‘dirishi mumkin — va aksincha. Senior xavfsizlik muhandisi CVSS’ni boshlang‘ich nuqta sifatida, biznes kontekst bilan birga qo‘llaydi, hech qachon yagona raqamga ko‘r-ko‘rona tayanmaydi."
    ),
    example: l(
      "CVSS v3.1 vektor namunasi:\nAV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H  -> Base Score ~9.8 (Critical)\nTa'sir izohi: tarmoqdan, past murakkablik, imtiyoz/foydalanuvchi aralashuvi talab qilinmaydi, to'liq C/I/A ta'siri."
    ),
    exampleExplanation: l(
      "Bu umumiy, sintetik CVSS vektor misoli bo‘lib, haqiqiy mahsulot yoki CVE’ga tegishli emas. Maqsad — vektor harflarining ma’nosini ko‘rsatish. Haqiqiy zaiflikni baholashda rasmiy CVSS kalkulyatori va tashkilot kontekstidan foydalaning, faqat bazaviy balga asoslanib shoshilinch qaror qabul qilmang."
    ),
    question: { prompt: l("CVSS’da Attack Vector=Network nimani anglatadi?"), answers: ["tarmoq orqali hujum qilish mumkin", "exploitable over the network", "uzoqdan tarmoq orqali"] }
  },
  {
    title: l("6. Identity va access management: MFA, eng kam imtiyoz, Zero Trust"),
    content: l(
      "Identity and Access Management (IAM) — kim ekanligingizni tasdiqlash (autentifikatsiya) va nimaga ruxsatingiz borligini aniqlash (avtorizatsiya) jarayonlarini boshqaradi. Faqat parolga tayanish zaif, chunki parollar o‘g‘irlanadi, qayta ishlatiladi yoki phishing orqali qo‘lga kiritiladi. Multi-factor authentication (MFA) “bilasiz” (parol), “egasiz” (telefon, apparat token) va “sizsiz” (biometrika) omillaridan kamida ikkitasini talab qilib, bitta omil buzilganda ham hisobni himoya qiladi. Lekin MFA ham mukammal emas: SIM swap, MFA fatigue (push bildirishnomalarini ketma-ket yuborib foydalanuvchini toliqtirish) va session token o‘g‘irlash orqali chetlab o‘tish mumkin, shuning uchun phishing-resistant usullar (FIDO2/WebAuthn apparat kalitlari) tavsiya etiladi.\n\nEng kam imtiyoz (least privilege) tamoyili — har bir hisob yoki xizmat faqat vazifasini bajarish uchun zarur bo‘lgan minimal huquqqa ega bo‘lishi kerakligini bildiradi. Amalda bu role-based access control (RBAC) yoki attribute-based access control (ABAC) orqali amalga oshiriladi, muntazam huquq auditi (access review) bilan birga olib boriladi, chunki vaqt o‘tishi bilan foydalanuvchilarda “privilege creep” — kerak bo‘lmagan to‘plangan huquqlar paydo bo‘ladi.\n\nZero Trust arxitekturasi “ichki tarmoq ishonchli” degan eski farazni rad etadi: har bir so‘rov, u tarmoq ichidan kelsa ham, qayta tasdiqlanishi, foydalanuvchi va qurilma holati baholanishi, va faqat zarur resursga minimal muddatga ruxsat berilishi kerak. Asosiy tamoyillar: “never trust, always verify”, mikrosegmentatsiya, doimiy monitoring va kontekstga asoslangan qaror (foydalanuvchi joylashuvi, qurilma sog‘ligi, vaqt). Zero Trust bitta mahsulot emas, balki arxitektura falsafasi bo‘lib, uni amalga oshirish bosqichma-bosqich, mavjud tizimlarni hisobga olgan holda rejalashtiriladi."
    ),
    example: l(
      "Shartli RBAC siyosati (sintetik):\nrole: \"support-readonly\"\npermissions: [\"tickets:read\"]\nrole: \"support-admin\"\npermissions: [\"tickets:read\", \"tickets:write\", \"users:read\"]\n# Eslatma: \"users:write\" hech bir support rolga berilmagan — eng kam imtiyoz."
    ),
    exampleExplanation: l(
      "Bu sintetik RBAC konfiguratsiyasi faqat eng kam imtiyoz tamoyilini ko‘rsatadi; haqiqiy IAM tizimi mahsulotga xos sintaksis va qo‘shimcha shartlardan foydalanadi. Huquqlarni o‘zgartirishdan oldin har doim vakolatli jamoa bilan kelishilgan o‘zgarish jarayonidan (change management) o‘ting."
    ),
    question: { prompt: l("Vaqt o‘tishi bilan foydalanuvchida keraksiz huquqlar to‘planib qolishi qanday ataladi?"), answers: ["privilege creep", "imtiyoz to'planishi", "ortiqcha huquq to'planishi"] }
  },
  {
    title: l("7. Kriptografiya asoslari: simmetrik, asimmetrik, xeshlash va TLS"),
    content: l(
      "Simmetrik shifrlashda (masalan, AES) bitta maxfiy kalit ham shifrlash, ham deshifrlash uchun ishlatiladi — tez, lekin kalitni xavfsiz almashish muammosi bor. Asimmetrik (ochiq kalit) kriptografiya (masalan, RSA yoki ECDSA) juft kalit ishlatadi: ochiq kalit bilan shifrlangan ma’lumotni faqat mos maxfiy kalit ocha oladi, bu kalit almashish muammosini hal qiladi, lekin hisoblash jihatidan ancha sekinroq. Shu sababli amaliy tizimlar gibrid yondashuvdan foydalanadi: asimmetrik kriptografiya bilan simmetrik seans kalitini xavfsiz almashadi, so‘ng tezkor simmetrik shifrlash bilan asosiy ma’lumotni uzatadi.\n\nXeshlash funksiyasi (SHA-256 kabi) ma’lumotni qaytarib bo‘lmaydigan, belgilangan uzunlikdagi “barmoq izi”ga aylantiradi; u shifrlash emas, chunki asl ma’lumotni tiklab bo‘lmaydi, faqat yaxlitlikni tekshirish uchun ishlatiladi. Parolni saqlashda oddiy xeshlash yetarli emas — tezkor GPU hisoblash orqali “brute force” qilish mumkin, shuning uchun bcrypt, scrypt yoki Argon2 kabi maxsus, ataylab sekin va “salt” qo‘shadigan algoritmlar qo‘llaniladi.\n\nTLS handshake (soddalashtirilgan TLS 1.3 oqimi) quyidagicha kechadi: mijoz qo‘llab-quvvatlaydigan shifrlash to‘plamlari va tasodifiy qiymat bilan ClientHello yuboradi; server sertifikat, tanlangan parametrlar bilan javob beradi; ikkala tomon Diffie-Hellman almashinuvi orqali umumiy seans kaliti hosil qiladi, server sertifikati esa ishonchli sertifikat organi (CA) zanjiri orqali tasdiqlanadi. Keng tarqalgan xatolar: o‘z kriptografik algoritmini yozish (“ni roll your own crypto”), eski protokollarni (SSLv3, TLS 1.0) qoldirish, parolni sodda xeshlash bilan saqlash, kalitlarni kodga qattiq yozib qo‘yish (hardcoded secrets) va sertifikat muddati tugashini kuzatmaslik. Kriptografiyada xavfsizlik odatda algoritmning o‘zida emas, balki uning noto‘g‘ri amalga oshirilishida buziladi."
    ),
    example: l(
      "openssl s_client -connect example.invalid:443 -tls1_3\n# Sertifikat zanjiri va tanlangan cipher suite’ni tekshirish uchun\n# Parolni saqlash namunasi (psevdokod): hash = argon2(password, salt, cost_params)"
    ),
    exampleExplanation: l(
      "Bu ruxsat etilgan sintetik domen nomi bilan TLS parametrlarini tekshirish buyrug‘i va parol xeshlash psevdokodi, haqiqiy ishlab chiqarish kaliti yoki paroli emas. Faqat o‘zingizga tegishli yoki vakolatli tizimlarda TLS diagnostikasini bajaring."
    ),
    question: { prompt: l("Parollarni saqlash uchun oddiy SHA-256 o‘rniga nima tavsiya etiladi?"), answers: ["argon2", "bcrypt", "scrypt yoki argon2 kabi maxsus algoritm"] }
  },
  {
    title: l("8. Tarmoq xavfsizligi asoslari: segmentatsiya, firewall, IDS/IPS"),
    content: l(
      "Tarmoq segmentatsiyasi — tarmoqni kichikroq, izolyatsiyalangan qismlarga bo‘lish bo‘lib, bitta segmentdagi buzilish butun tashkilotga yoyilishini cheklaydi (lateral movement’ni qiyinlashtiradi). Odatiy segmentlarga DMZ (tashqi xizmatlar uchun), foydalanuvchi tarmog‘i, server/ma’lumotlar bazasi segmenti va boshqaruv (management) tarmog‘i kiradi; VLAN va mikrosegmentatsiya (har bir ish yuki atrofida nozik chegara) buni texnik jihatdan amalga oshiradi.\n\nFirewall tarmoq yoki host darajasida qoidalar asosida trafikni ruxsat beradi yoki bloklaydi — manba/maqsad manzil, port va protokolga qarab. Zamonaviy next-generation firewall ilova darajasida ham tekshiruv o‘tkazadi. IDS (Intrusion Detection System) trafik yoki hostdagi shubhali faoliyatni kuzatib, ogohlantirish beradi, lekin uni to‘xtatmaydi; IPS (Intrusion Prevention System) esa aniqlangan xavfli trafikni faol bloklaydi — bu esa noto‘g‘ri signal (false positive) qonuniy trafikni to‘sib qo‘yish xavfini oshiradi, shuning uchun IPS qoidalarini ehtiyotkorlik bilan sozlash kerak.\n\nDefense in depth (chuqur himoya) tamoyili — yagona nazoratga tayanmasdan, bir nechta qatlamli himoyani (perimetr firewall, segmentatsiya, endpoint himoyasi, autentifikatsiya, monitoring, zaxira) birgalikda qo‘llashdir, shunda bitta qatlam buzilsa ham, keyingi qatlamlar hujumni ushlab qoladi yoki sekinlashtiradi. Bu tamoyil “bitta devor hamma narsani saqlaydi” degan noto‘g‘ri tasavvurga qarshi turadi: zamonaviy hujumlar ko‘pincha fishing yoki ichki hisobni buzish orqali perimetrni butunlay chetlab o‘tadi, shuning uchun ichki monitoring, segmentatsiya va identity nazorati tashqi himoya qadar muhim. Tarmoq diagrammasi va qoidalar doimiy ravishda hujjatlashtirilib, o‘zgarishlar nazorat ostida kiritilishi kerak, aks holda vaqt o‘tishi bilan “qoida chalkashligi” (rule sprawl) paydo bo‘lib, kim nima uchun ochilganini hech kim eslay olmaydi."
    ),
    example: l(
      "Sintetik firewall qoidasi:\nALLOW tcp from dmz-web to db-segment port 5432\nDENY tcp from user-lan to db-segment any\nALLOW tcp from mgmt-vlan to any port 22 (jump-host orqali)"
    ),
    exampleExplanation: l(
      "Bu o‘quv maqsadidagi sintetik segmentatsiya qoidalari to‘plami bo‘lib, foydalanuvchi tarmog‘idan to‘g‘ridan-to‘g‘ri ma’lumotlar bazasiga kirishni taqiqlaydi va faqat veb-segmentga ruxsat beradi. Haqiqiy firewall siyosatini o‘zgartirishdan oldin tarmoq jamoasi bilan kelishilgan change window va rollback rejasidan foydalaning."
    ),
    question: { prompt: l("Trafikni faqat ogohlantiradigan emas, balki faol bloklaydigan tizim qanday ataladi?"), answers: ["ips", "intrusion prevention system", "ips (intrusion prevention system)"] }
  },
  {
    title: l("9. Hodisaga javob berish sikli: NIST SP 800-61 Rev. 3 bosqichlari"),
    content: l(
      "NIST SP 800-61 Rev. 3 incident response’ni alohida texnik jarayon emas, balki tashkilotning kengroq kiberxavfsizlik risk boshqaruviga integratsiyalashgan uzluksiz tsikl sifatida ko‘radi. Tayyorgarlik (preparation) bosqichida rol va javobgarlik, aloqa kanallari, eskalatsiya chegaralari, huquqiy/maxfiylik aloqalari, zaxira nusxalar, vositalar va mashqlar (tabletop exercise) oldindan tayyorlanadi — hodisa yuz berganda improvizatsiya qilish kech bo‘ladi.\n\nAniqlash va tahlil (detection and analysis) bosqichida signallar — SIEM ogohlantirishi, foydalanuvchi xabari, tashqi bildirishnoma — to‘planadi va tasdiqlanadi: bu haqiqiy hodisami, uning ko‘lami, zarari va boshlanish vaqti qanday? Bu bosqichda dalilni o‘zgartirmasdan saqlash (chain of custody) juda muhim, chunki keyinchalik huquqiy yoki sug‘urta jarayoni uchun kerak bo‘lishi mumkin.\n\nContainment, eradication va recovery bitta bosqich sifatida birlashtirilgan, chunki ular amalda iterativ kechadi: qisqa muddatli containment (masalan, zararlangan hostni tarmoqdan izolyatsiya qilish) zararni cheklaydi, so‘ng sabab — zararli dastur, ochiq zaiflik, buzilgan hisob — bartaraf etiladi (eradication), va tizim nazorat ostida, kuchaytirilgan monitoring bilan ishga qaytariladi (recovery). Bu qarorlar har doim biznes ta’siri bilan muvozanatlanadi: hostni darhol o‘chirish dalilni yo‘qotishi yoki xizmatni to‘xtatishi mumkin, shuning uchun qaror vakolatli incident commander bilan kelishiladi.\n\nHodisadan keyingi faoliyat (post-incident activity) — “lessons learned” — nima ishladi, nima ishlamadi, qanday aniqlash tezroq bo‘lishi mumkin edi, va qanday nazorat kelajakda takrorlanishini oldini oladi, degan savollarga javob beradi. Bu bosqich ko‘pincha e’tibordan chetda qoladi, lekin aynan shu yerda tashkilot haqiqatan ham o‘z mudofaasini yaxshilaydi — hodisa hisoboti, detection qoidalari va runbook’lar shu natijalar asosida yangilanadi."
    ),
    example: l(
      "IR log yozuvi (sintetik):\n[T+00:05] Alert ID IR-2031 — shubhali ko'p marta login xatosi aniqlandi\n[T+00:20] Triage: tasdiqlangan, asset owner xabardor qilindi\n[T+00:35] Containment: host tarmoqdan izolyatsiya qilindi (incident lead tasdig'i bilan)\n[T+2d] Post-incident: lessons learned yig'ilishi rejalashtirildi"
    ),
    exampleExplanation: l(
      "Bu sun’iy vaqt belgilari va identifikatorlar bilan yozilgan namunaviy incident log bo‘lib, haqiqiy voqeaga tegishli emas. U har bir qarorning vaqti, asosi va tasdig‘ini yozib borish amaliyotini ko‘rsatadi. Haqiqiy hodisada barcha containment harakatlari tashkilotning rasmiy incident response rejasiga muvofiq amalga oshirilishi kerak."
    ),
    question: { prompt: l("NIST SP 800-61 bo‘yicha hodisadan keyingi o‘rganish bosqichi qanday ataladi?"), answers: ["lessons learned", "post-incident activity", "hodisadan keyingi faoliyat"] }
  },
  {
    title: l("10. Xavfsizlik operatsiyalari: logging, monitoring va SIEM vazifasi"),
    content: l(
      "Monitoring va logging — xavfsizlik operatsiyalarining “ko‘zi va qulog‘i”. Event (hodisa) — tizimda sodir bo‘lgan har qanday qayd etilgan harakat (login, fayl o‘qish, konfiguratsiya o‘zgarishi); bu hali hech narsani anglatmaydi, shunchaki qayd. Alert (ogohlantirish) — oldindan belgilangan qoida yoki model asosida, qiziqarli deb topilgan event yoki eventlar ketma-ketligi; bu ham avtomatik tizim chiqargan signal bo‘lib, hali tasdiqlanmagan. Incident (hodisa) — tahlilchi tomonidan tasdiqlangan, haqiqiy xavfsizlik buzilishi yoki siyosat buzilishi deb topilgan holat. Bu uch darajani farqlash muhim, chunki har bir alert incidentga aylanmaydi, va har bir incident oson aniqlanadigan alert sifatida ko‘rinmasligi mumkin.\n\nSIEM (Security Information and Event Management) tizimi turli manbalardan (endpoint, tarmoq, identity, bulut, ilova) kelgan loglarni yig‘adi, normalizatsiya qiladi (umumiy maydonlarga — vaqt, foydalanuvchi, host, natija — keltiradi) va qoidalar yoki analitika orqali bog‘liq hodisalarni aniqlaydi. SIEM’ning qiymati faqat ma’lumot yig‘ishda emas, balki turli manbalarni bir vaqt chizig‘ida korrelyatsiya qilib, inson ko‘zi ilg‘amaydigan naqshlarni ko‘rsatishida.\n\nLog retention (saqlash muddati) siyosat, huquqiy talab va tergov ehtiyojiga qarab belgilanadi — juda qisqa muddat tergovni qiyinlashtiradi, juda uzoq muddat esa xarajat va maxfiylik riskini oshiradi. Coverage gap — ba’zi tizim yoki xizmat umuman log yubormasligi — jiddiy ko‘r nuqta yaratadi: “hodisa ko‘rinmadi” degani “hodisa bo‘lmadi” degani emas, balki “biz uni ko‘ra olmadik” degani bo‘lishi mumkin. Shu sababli SOC jamoasi nafaqat alertlarga javob beradi, balki log manbalarining to‘liqligi, soat sinxronligi va parser’lar to‘g‘ri ishlashini ham doimiy tekshiradi."
    ),
    example: l(
      "Hierarchy namunasi (sintetik):\nEvent: user=svc-app1 action=login result=success host=app-03 time=...\nAlert: rule=\"5x failed login in 2min\" matched for user=svc-app1\nIncident: tasdiqlangan — buzilgan service account, containment boshlandi"
    ),
    exampleExplanation: l(
      "Bu sintetik misol event, alert va incident orasidagi farqni ko‘rsatadi; haqiqiy foydalanuvchi nomi yoki host emas. E’tibor bering: alert hali hodisa ekanini isbotlamaydi — tahlilchi uni tasdiqlagandan keyingina incident deb belgilanadi."
    ),
    question: { prompt: l("Tahlilchi tomonidan tasdiqlangan, haqiqiy xavfsizlik buzilishi qanday ataladi?"), answers: ["incident", "hodisa", "tasdiqlangan hodisa"] }
  },
  {
    title: l("11. Governance, risk, compliance: NIST CSF 2.0 va inson omili"),
    content: l(
      "Governance, Risk and Compliance (GRC) xavfsizlikni faqat texnik vosita emas, balki tashkiliy boshqaruv masalasi sifatida ko‘radi. NIST Cybersecurity Framework (CSF) 2.0 oltita funksiyadan iborat: Govern (boshqaruv — strategiya, rol, siyosat va risk qarorlarini belgilash; CSF 2.0’da yangi qo‘shilgan, chunki texnik nazorat yuqori rahbariyat qo‘llab-quvvatlagan boshqaruvsiz samarasiz), Identify (aktivlar, ma’lumot va risklarni aniqlash), Protect (nazoratlarni joriy etish — IAM, hardening, trening), Detect (anomaliya va hodisalarni aniqlash qobiliyati), Respond (hodisaga javob choralari) va Recover (xizmatni tiklash va chidamlilikni oshirish). Bu funksiyalar chiziqli emas, balki doimiy aylanma sifatida bir-biriga ta’sir qiladi: Govern boshqa beshtasiga yo‘nalish beradi, Recover esa Identify’ga qaytib, risklarni qayta baholaydi.\n\nCompliance (standartlarga muvofiqlik — masalan, ISO 27001, PCI DSS, mahalliy qonunlar) bilan haqiqiy xavfsizlik bir xil emas: tashkilot barcha rasmiy talablarga javob bersa ham, real hujumga zaif qolishi mumkin, chunki compliance ko‘pincha minimal, standartlashtirilgan darajani belgilaydi, konkret tahdid landshaftini emas. Shuning uchun yetuk GRC dasturi compliance’ni pol (minimal chegara) sifatida ko‘radi, shift emas.\n\nInson omili va ijtimoiy muhandislik (social engineering) texnik nazoratlarning eng zaif bo‘g‘ini bo‘lib qolmoqda: phishing, pretexting (o‘zini boshqa shaxs sifatida ko‘rsatish), baiting va tailgating (fizik kirishda ortidan ergashish) kabi usullar texnik emas, psixologik ishonchdan foydalanadi — shoshilinchlik, obro‘-e’tibor, qo‘rquv yoki yordam berish istagini qo‘zg‘atadi. Samarali himoya texnik nazorat (phishing filtri, MFA) bilan uzluksiz, jazo bilan qo‘rqitmaydigan xavfsizlik madaniyati va xabar berishni osonlashtiradigan jarayonni birlashtiradi. Xodim shubhali xabarni jazodan qo‘rqmasdan darhol xabar qilishi mumkin bo‘lgan muhit — texnik nazoratning o‘zidan ko‘ra ko‘proq hodisalarni erta aniqlashga yordam beradi."
    ),
    example: l(
      "CSF 2.0 funksiya xaritasi (soddalashtirilgan):\nGovern -> siyosat va risk qarori\nIdentify -> aktiv va risk reyestri\nProtect -> MFA, hardening, trening\nDetect -> SIEM ogohlantirishlari\nRespond -> IR runbook\nRecover -> zaxiradan tiklash va retrospektiva"
    ),
    exampleExplanation: l(
      "Bu NIST CSF 2.0’ning oltita funksiyasini soddalashtirilgan tartibda ko‘rsatuvchi sxema, aylanma jarayonni to‘liq aks ettirmaydi. Haqiqiy tashkilotda har bir funksiya ostida bir nechta kategoriyalar bo‘ladi; rasmiy qo‘llanma uchun NIST’ning o‘zi nashr etgan hujjatga murojaat qiling."
    ),
    question: { prompt: l("NIST CSF 2.0’da yuqori rahbariyat qo‘llab-quvvatlagan risk qarorlarini belgilaydigan yangi funksiya qaysi?"), answers: ["govern", "boshqaruv", "govern (boshqaruv)"] }
  }
];

export const cybersecurityDeepReferences: LearningReference[] = [
  { label: l("CISA: Zero Trust Maturity Model"), href: "https://www.cisa.gov/zero-trust-maturity-model" },
  { label: l("FIRST: Common Vulnerability Scoring System (CVSS)"), href: "https://www.first.org/cvss/" }
];
