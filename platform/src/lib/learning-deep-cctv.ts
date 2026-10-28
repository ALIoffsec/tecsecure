import type { Localized, LearningReference, LearningSection } from "./learning-demo";

const l = (uz: string): Localized => ({ uz, ru: uz, en: uz });

export const cctvDeepSections: LearningSection[] = [
  {
    title: l("4. ONVIF va o‘zaro muvofiqlik standartlari"),
    content: l(
      "ONVIF (Open Network Video Interface Forum) IP kameralar, NVR va VMS o‘rtasida ochiq, vendor-neytral integratsiya protokolini belgilaydi. Standart bo‘lmasa, har bir ishlab chiqaruvchi o‘z yopiq SDK’sini talab qiladi va tizim bitta brendga bog‘lanib qoladi (vendor lock-in), kelajakda arzonroq yoki yaxshiroq qurilma qo‘shish qiyinlashadi. ONVIF Profile’lar aniq funksional kafolatlarni belgilaydi: Profile S video oqimi, PTZ va audio asosiy interoperatsiyasini qamrab oladi; Profile T Profile S’ni almashtirib H.264/H.265, metadata va tahlil (analytics) oqimini kengaytiradi; Profile G mahalliy va markazlashgan yozib saqlashni (recording va retrieval) standartlashtiradi; Profile A kirish nazorati (access control) integratsiyasini, masalan eshik qulflari va hodisa jurnalini belgilaydi.\n\nSenior muhandis xarid shartnomasida faqat \"ONVIF compliant\" degan umumiy iborani emas, aniq profil raqamini talab qilishi kerak — chunki ikkita qurilma bir xil profil darajasida bo‘lmasa, PTZ boshqaruvi yoki hodisa xabarnomasi ishlamasligi mumkin. Amalda muvofiqlikni tasdiqlash uchun ONVIF Device Manager yoki shunga o‘xshash tekshiruv vositasi bilan discovery, media profile va event service’larni sinab ko‘rish tavsiya etiladi. Muhim xato — faqat marketing hujjatiga ishonib, haqiqiy firmware versiyasida qaysi profil funksiyalari amalga oshirilganini tekshirmaslik; ko‘p hollarda qurilma \"ONVIF\" deb e’lon qilingan bo‘lsa-da, faqat qisman profil funksiyasini qo‘llab-quvvatlaydi."
    ),
    example: l(
      "Xarid texnik topshirig‘ida talab: \"Kamera ONVIF Profile S va Profile T’ga mos bo‘lishi shart (H.265, metadata events).\"\nTekshiruv: ONVIF Device Manager → Capabilities → Media2/Events xizmatlarini tasdiqlash."
    ),
    exampleExplanation: l(
      "Misol shartnoma va tekshiruv bosqichini ko‘rsatadi: profil raqamini aniq yozish keyinchalik boshqa vendor qurilmasini qo‘shishni osonlashtiradi va xaridorni \"umumiy muvofiqlik\" degan noaniq va’dadan himoya qiladi. Har doim haqiqiy qurilmada profil xizmatlarini qo‘lda tekshiring, chunki marketing hujjati bilan amaliy xatti-harakat farq qilishi mumkin; sinovni ishlab chiqarishga joriy etishdan oldin, alohida test tarmog‘ida bajaring va natijani loyiha hujjatiga biriktiring."
    ),
    question: {
      prompt: l("Kirish nazorati (access control) integratsiyasini standartlashtiradigan ONVIF profili qaysi?"),
      answers: ["profile a", "profile-a", "a profili"]
    }
  },
  {
    title: l("5. Kamera joylashuvi va qamrov dizayni"),
    content: l(
      "Kamera joylashuvini rejalashtirish shunchaki \"devorga o‘rnatish\" emas, balki qamrov zonalarini matematik va vizual tahlil qilishni talab qiladi. Qo‘shni kameralar orasida qamrov qoplanishi (overlap) bo‘lishi kerak, aks holda bir kamera ishdan chiqqanda yoki burchak o‘zgarganda ko‘r nuqta (blind spot) paydo bo‘ladi; ayniqsa kirish-chiqish nuqtalari, mulkiy chegaralar va baland qiymatli zonalarda ikkita mustaqil kameraning bir-birini qoplashi tavsiya etiladi. Montaj balandligi muhim muvozanat talab qiladi: juda past o‘rnatish vandalizm va to‘siqqa, juda baland o‘rnatish esa yuz identifikatsiyasi uchun yetarli piksel zichligini yo‘qotishga olib keladi; odatda yuz tanish uchun operatsion masofada metrga necha piksel to‘g‘ri kelishini (pixels per meter/foot) hisoblash kerak.\n\nYorug‘lik sharoiti alohida e’tibor talab qiladi: kameraning lux reytingi minimal yoritilganlikni bildiradi, lekin IR (infra-qizil) ta’minotchi diapazoni cheklangan — IR nur uzoqlashgani sari tarqaladi va tungi tasvir \"oqarib\" ketishi (overexposure) yoki soyada yo‘qolishi mumkin. Orqa yorug‘lik (backlight) va yaltirash (glare) — masalan, kamera to‘g‘ridan to‘g‘ri quyosh botishiga yoki kirish eshigi ustidagi chiroqqa qarab turishi — WDR (Wide Dynamic Range) sozlamasisiz tasvirni ishlatib bo‘lmas holga keltiradi. Tajribali dizayner kunning turli vaqtida (quyosh chiqishi/botishi, tungi IR) sayt tashrifi yoki simulyatsiya orqali yorug‘lik yo‘nalishini tekshiradi, shuningdek daraxt o‘sishi, qor va mavsumiy o‘zgarishlarni hisobga oladi."
    ),
    example: l(
      "Piksel zichligi tekshiruvi: talab 40 piksel/metr (yuz tanish uchun).\nKamera 1080p, gorizontal FOV 60° masofada 20 metrda taxminiy zichlikni hisoblang: 1920 px / (2 × 20 × tan(30°)) ≈ 83 px/m → talabga mos."
    ),
    exampleExplanation: l(
      "Hisob kamera piksel zichligi talabga javob berishini tekshirish usulini ko‘rsatadi; agar natija talabdan past bo‘lsa, obyektivni torroq qiling, kamerani masofaga yaqinlashtiring yoki yuqoriroq piksel sonli sensor tanlang. Haqiqiy loyihada bu qo‘lda hisobni yakuniy qaror sifatida emas, dastlabki taxmin sifatida qabul qiling va albatta ishlab chiqaruvchining rasmiy FOV/piksel zichligi kalkulyatori hamda sayt o‘lchovlari bilan tasdiqlang, chunki obyektiv distorsiyasi natijani o‘zgartirishi mumkin."
    ),
    question: {
      prompt: l("Ikki kamera bir-birining yozib olish zonasini qisman qoplashi qanday ataladi?"),
      answers: ["overlap", "qoplanish", "qamrov qoplanishi"]
    }
  },
  {
    title: l("6. VMS/NVR tanlovi va saqlash siyosati dizayni"),
    content: l(
      "Video boshqaruv tizimi (VMS) yoki NVR tanlovi tarmoq topologiyasi va tashkilot ehtiyojiga bog‘liq: mahalliy (edge/standalone) NVR bitta obyekt uchun sodda va tarmoqdan mustaqil ishlaydi, markazlashgan (enterprise) VMS esa ko‘plab filiallarni bitta boshqaruv konsolida birlashtiradi, lekin markaziy server ishdan chiqishi butun tizimni to‘xtatib qo‘yishi mumkin — shu sababli failover (zaxira server, klaster yoki har bir filialda mustaqil yozib saqlash + markaziy monitoring) arxitekturasini rejalashtirish kerak. Saqlash muddati (retention) sof texnik qaror emas — u biznes talabi (nizolarni tekshirish uchun yetarli vaqt), xarajat (diskning narxi saqlash kunlari bilan chiziqli o‘sadi) va huquqiy/me’yoriy talablar o‘rtasidagi muvozanatdir; ortiqcha uzoq saqlash nafaqat xarajatni, balki maxfiylik va ma’lumot javobgarligi xavfini ham oshiradi, juda qisqa saqlash esa tergov imkoniyatini yo‘qotadi.\n\nIshonchlilik uchun RAID darajasi muhim tanlov: RAID 0 faqat tezlik beradi, zaxira emas — bitta disk ishdan chiqsa hamma narsa yo‘qoladi; RAID 1 oyna nusxalash orqali ishonchlilikni oshiradi, lekin sig‘imni ikki baravar kamaytiradi; RAID 5/6 parite orqali sig‘im va ishonchlilik o‘rtasida muvozanat beradi, biroq katta hajmli yozuv-og‘ir (write-heavy) CCTV ish yukida qayta qurish (rebuild) vaqti uzoq va qo‘shimcha disk ishdan chiqish xavfi yuqori bo‘lishi mumkin. Shuningdek disk CCTV uchun maxsus ishlab chiqarilgan (surveillance-rated, doimiy yozuvga mo‘ljallangan) bo‘lishi kerak — oddiy desktop disk doimiy 24/7 yozuv yukiga chidamli emas. Yakuniy dizaynda failover vaqti (RTO), ma’lumot yo‘qotish chegarasi (RPO) va monitoring/alert mexanizmini hujjatlashtirish senior darajadagi talab hisoblanadi."
    ),
    example: l(
      "Talab: 30 kun saqlash, 16 kamera, har biri 4 Mbps.\nUmumiy bitrate: 16 × 4 = 64 Mbps.\nRAID 5 (n disk, 1 parite) tanlanganda foydali sig‘im = (n−1) × disk hajmi; rebuild vaqtini va spare disk siyosatini hujjatlashtiring."
    ),
    exampleExplanation: l(
      "Misol umumiy bitrate va RAID sig‘imi hisobini bog‘laydi, lekin haqiqiy loyihada disk ishlab chiqaruvchisi va NVR vendor kalkulyatori bilan tasdiqlash shart, chunki overhead, filesystem, audio va motion-based o‘zgaruvchan yozuv haqiqiy hisobni o‘zgartiradi. Shuningdek rebuild vaqtida disk massivi zaiflashganini va shu davrda ikkinchi disk ishdan chiqish xavfini hisobga oling; katta massivlarda RAID 6 yoki zaxira (spare) disk siyosatini ko‘rib chiqish tavsiya etiladi."
    ),
    question: {
      prompt: l("Faqat tezlik beradigan, lekin zaxiralashni ta’minlamaydigan RAID darajasi qaysi?"),
      answers: ["raid 0", "raid0"]
    }
  },
  {
    title: l("7. IP kameralar uchun kiberxavfsizlik mustahkamlash"),
    content: l(
      "IP kameralar tarmoqqa ulangan kompyuter qurilmalari bo‘lib, ular xavfsizlik devori (firewall) ortida bo‘lsa ham hujum maqsadiga aylanishi mumkin. Eng ko‘p uchraydigan zaifliklardan biri — standart login/parolni (default credentials) o‘zgartirmaslik; avtomatlashtirilgan skanerlar butun internetni standart parollarga qidiradi va topilgan kameralarni botnet (masalan DDoS hujumlari) uchun ishlatadi. Firmware yangilanishlarini rejali tarzda, lekin sinovdan o‘tkazmasdan darhol ishlab chiqarishga qo‘llamaslik kerak — yangilanish jurnalini o‘qib, xavfsizlik tuzatishi (security patch) bilan funksional o‘zgarishni farqlash, keyin test muhitida tekshirib, keyin bosqichma-bosqich joriy etish tavsiya etiladi.\n\nTarmoq segmentatsiyasi (VLAN) muhim himoya qatlami: kameralar alohida, izolyatsiyalangan VLAN’da bo‘lishi va faqat kerakli portlar (masalan VMS serveriga) orqali aloqa qilishi kerak — shunda bitta buzilgan kamera butun korporativ tarmoqqa kirish nuqtasiga aylanmaydi. Foydalanilmaydigan xizmatlarni o‘chirish (UPnP, Telnet, FTP, ba’zan hatto HTTP agar HTTPS mavjud bo‘lsa) hujum yuzasini (attack surface) kamaytiradi; UPnP ayniqsa xavfli, chunki u routerda avtomatik port forwarding ochib, kamerani bilmasdan internetga ochiq qilib qo‘yishi mumkin. Boshqaruv kirishini (management access) parol o‘rniga yoki qo‘shimcha ravishda sertifikatga asoslangan autentifikatsiya (mutual TLS yoki client certificate) bilan cheklash, va eng muhimi — kamera boshqaruv interfeysini hech qachon to‘g‘ridan-to‘g‘ri ochiq internetga chiqarmaslik, undan ko‘ra VPN orqali kirishni talab qilish senior amaliyotdir."
    ),
    example: l(
      "Mustahkamlash checklist:\n[ ] Standart parol almashtirildi\n[ ] Firmware versiyasi va patch jurnali hujjatlashtirilgan\n[ ] Kameralar alohida VLAN’da (masalan VLAN 50)\n[ ] UPnP, Telnet, FTP o‘chirilgan\n[ ] Boshqaruv interfeysi faqat VPN orqali ochiq"
    ),
    exampleExplanation: l(
      "Checklist audit paytida tez tekshirish uchun mo‘ljallangan; har bir band uchun dalil (skrinshot, konfiguratsiya eksporti, firmware versiyasi jurnali) saqlang, shunda keyingi audit vaqtida o‘zgarishlar tarixini kuzatish mumkin bo‘ladi. Kamera boshqaruv panelini hech qachon to‘g‘ridan-to‘g‘ri internetga ochmang, standart parolni darhol almashtiring va har qanday konfiguratsiya o‘zgarishini faqat oldindan rejalashtirilgan, ruxsat etilgan texnik xizmat oynasida bajaring."
    ),
    question: {
      prompt: l("Router’da bilmasdan port forwarding ochib yuborishi mumkin bo‘lgan, ko‘pincha o‘chirish tavsiya etiladigan xizmat qaysi?"),
      answers: ["upnp", "upnp xizmati"]
    }
  },
  {
    title: l("8. Muvofiqlik va maxfiylik tamoyillari"),
    content: l(
      "CCTV tizimi shaxsiy ma’lumot (video orqali aniqlanadigan shaxslar) yig‘adigan tizim sifatida umumiy maxfiylik-by-design (privacy by design) tamoyillariga rioya qilishi kerak, hatto aniq bitta davlat qonuniga murojaat qilmasdan ham. Asosiy tamoyil — maqsad cheklovi (purpose limitation): kamera faqat e’lon qilingan xavfsizlik maqsadi uchun ishlatilishi, boshqa maqsadlar (masalan xodimlarni kuzatish) uchun qayta ishlatilmasligi kerak, aks holda bu ishonchni buzadi va huquqiy xavf tug‘diradi. Saqlash muddati cheklovi (storage minimization) — ma’lumotni zarur bo‘lgandan ortiq saqlamaslik; uzoq saqlash nafaqat xarajat, balki buzilish holatida oshgan zarar maydoni (exposure) demakdir.\n\nXususiy hududlarni niqoblash (privacy masking) texnik yechim: kamera qamrovida qo‘shni uy derazasi, hovli yoki jamoat hojatxonasi kabi joylar bo‘lsa, dinamik yoki statik maskalash zonasi qo‘llanilishi kerak — bu nafaqat axloqiy, balki ko‘p joyda huquqiy talab. Kirish-chiqish jurnali auditi (access-log auditing) muhim nazorat: kim, qachon, qaysi kamera yozuvini ko‘rgani yoki eksport qilgani jurnalga yozilishi kerak, shunda noqonuniy ko‘rish (masalan shaxsiy qiziqish uchun yozuvni tomosha qilish) aniqlanadi va javobgarlik ta’minlanadi. Umumiy tamoyil sifatida: har qanday loyihada mahalliy qonunchilik talablari farqlanishi mumkinligini unutmang va amalga oshirishdan oldin tashkilot yuridik maslahatchisi yoki muvofiqlik bo‘limi bilan maslahatlashish senior muhandisning javobgarligidir."
    ),
    example: l(
      "Audit jurnali yozuvi (namuna):\n2024-xx-xx 14:32 — user: operator_12 — action: export — camera: entrance-02 — range: 10:00–10:15 — reason: incident_report_441"
    ),
    exampleExplanation: l(
      "Bu yozuv kim, nima uchun va qaysi vaqt oralig‘idagi yozuvni eksport qilganini kuzatish imkonini beradi, bu esa suiiste’molni aniqlash va javobgarlikni ta’minlaydi. Haqiqiy tizimda bunday jurnal o‘zgartirilmaydigan (immutable/WORM) saqlanishi va mahalliy maxfiylik qonunchiligiga mos tartibga solinishi kerak."
    ),
    question: {
      prompt: l("Kim qachon qaysi video yozuvini ko‘rgani yoki eksport qilganini qayd etadigan nazorat mexanizmi nima deb ataladi?"),
      answers: ["access-log audit", "kirish jurnali auditi", "access log"]
    }
  },
  {
    title: l("9. Kirish nazorati va signalizatsiya tizimlari bilan integratsiya"),
    content: l(
      "CCTV tizimining haqiqiy qiymati u boshqa xavfsizlik tizimlari bilan integratsiya qilinganda ortadi. Hodisaga asoslangan yozib olish (event-driven recording) — doimiy uzluksiz yozish o‘rniga yoki unga qo‘shimcha ravishda, harakat sezgichi, eshik ochilishi yoki signalizatsiya zonasi faollashganda yuqori sifatli/yuqori chastotali yozishga o‘tish — xotira sarfini kamaytiradi va tahlilni soddalashtiradi, chunki tergovchi aniq hodisa atrofidagi vaqtga tezroq o‘tishi mumkin. Kirish/chiqish (I/O) kontaktlar — kamera yoki NVR’dagi fizik kirish/chiqish portlari — tashqi sensorlar (eshik kontaktlari, harakat detektorlari, yong‘in signalizatsiyasi) bilan bog‘lanib, hodisa yuz berganda kamerani darhol kerakli burchakka burish (PTZ preset) yoki qo‘shimcha yoritishni yoqish kabi avtomatik harakatlarni ishga tushirishi mumkin.\n\nEng yuqori qiymat kirish nazorati tizimi (access control, masalan badge/karta o‘quvchi) jurnallarini video dalillar bilan korrelyatsiya qilishdan kelib chiqadi: agar badge jurnalida \"xodim X 14:30’da orqa eshikdan kirdi\" deb yozilgan bo‘lsa, lekin video tahlil shu vaqtda eshikdan ikkita kishi kirganini ko‘rsatsa (tailgating — orqasidan ergashib kirish), bu nomuvofiqlik avtomatik signalizatsiya yoki keyinchalik audit orqali aniqlanishi mumkin. Bunday korrelyatsiya uchun vaqt sinxronizatsiyasi (barcha qurilmalar bitta NTP manbasidan vaqt olishi) kritik ahamiyatga ega — agar kamera va kirish nazorati jurnali vaqtlari bir necha daqiqaga farq qilsa, korrelyatsiya noto‘g‘ri xulosaga olib kelishi mumkin. Integratsiya loyihasida qaysi tizim \"master\" hisoblanishini (masalan markaziy VMS barcha hodisalarni yig‘ib, vaqt tamg‘asini normallashtiradi) aniq belgilash kerak."
    ),
    example: l(
      "I/O trigger qoidasi (konfiguratsiya namunasi):\nINPUT: door_contact_03 = OPEN\nACTION: camera_entrance_03 → preset(2), record_mode = continuous_30s, alert = send_to_vms"
    ),
    exampleExplanation: l(
      "Bu qoida eshik ochilganda kamerani oldindan belgilangan burchakka burib, 30 soniya uzluksiz yozishga o‘tkazadi va VMS’ga signal yuboradi. Ishlab chiqarishga qo‘llashdan oldin soxta signal (false trigger) chastotasini sinab ko‘ring, aks holda tizim keraksiz ogohlantirishlar bilan to‘lib ketishi mumkin."
    ),
    question: {
      prompt: l("Kirish nazorati jurnalidagi vaqtni video jurnal bilan to‘g‘ri solishtirish uchun barcha qurilmalarda nima bir xil bo‘lishi shart?"),
      answers: ["vaqt sinxronizatsiyasi", "ntp", "vaqt"]
    }
  },
  {
    title: l("10. Texnik xizmat, hayot sikli va vendor qo‘llab-quvvatlash rejalashtiruvi"),
    content: l(
      "CCTV tizimi o‘rnatilgandan so‘ng ham faol boshqaruvni talab qiladi — bu ko‘pincha loyihalashda e’tibordan chetda qoladigan, lekin uzoq muddatli ishonchlilik uchun hal qiluvchi bosqich. Har bir qurilma (kamera, NVR, switch) uchun ishlab chiqaruvchining qo‘llab-quvvatlash hayot sikli (support lifecycle) — ya’ni firmware yangilanishlari qachongacha chiqarilishi va texnik yordam qachon to‘xtashi (end-of-support) — hujjatlashtirilishi kerak; qo‘llab-quvvatlash tugagan qurilma xavfsizlik yamalarisiz qoladi va bu kiberxavfsizlik xavfini oshiradi. Rejali almashtirish (lifecycle replacement) byudjeti oldindan rejalashtirilishi kerak, aks holda tashkilot kutilmagan vaqtda butun partiya qurilmani birdaniga almashtirishga majbur bo‘ladi.\n\nFizik texnik xizmat ham muhim: linza (lens) changlanishi, o‘rgimchak to‘ri yoki yomg‘ir izlari tasvir sifatini sezilarli pasaytiradi, shuning uchun muntazam tozalash jadvali (odatda mavsumiy yoki har chorakda, muhitga qarab) belgilanishi kerak; tashqi kameralarda namlik kirishi, korroziya va kabel izolyatsiyasi degradatsiyasini tekshirish ham jadvalga kiradi. Konfiguratsiya zaxirasi (configuration backup) — har bir kamera va NVR sozlamalarining nusxasi — uskuna ishdan chiqqanda tezda tiklanishni ta’minlaydi; zaxirasiz almashtirish soatlab qayta sozlash vaqtini talab qilishi mumkin. Senior darajadagi rejalashtiruv jadvalda uchta ustunni birlashtiradi: profilaktik texnik xizmat sanasi, firmware/qo‘llab-quvvatlash muddati va moliyaviy almashtirish rejasi — bu uch ma’lumotni alohida kuzatish tizim ishonchliligini pasaytiradi, chunki muammolar faqat ishdan chiqqanda ma’lum bo‘ladi."
    ),
    example: l(
      "Asset reyestri qatori (namuna):\nCamera ID: ENT-03 | Model: X | O‘rnatilgan: 2022-03 | Firmware EOL: 2027-03 | Keyingi linza tozalash: 2026-01 | Almashtirish byudjeti rejasi: 2027 Q1"
    ),
    exampleExplanation: l(
      "Bu qator bitta qurilma bo‘yicha texnik xizmat, qo‘llab-quvvatlash muddati va moliyaviy rejani bir joyda ko‘rsatadi, bu esa butun tizim uchun proaktiv boshqaruvga imkon beradi. Haqiqiy loyihada bu ma’lumotni markazlashgan asset reyestrida yuritish, har yili ko‘rib chiqish va firmware EOL sanasi yaqinlashganda avtomatik ogohlantirish sozlash tavsiya etiladi, shunda almashtirish byudjeti kutilmagan xarajat sifatida emas, oldindan rejalashtirilgan loyiha sifatida boshqariladi."
    ),
    question: {
      prompt: l("Ishlab chiqaruvchi firmware yangilanishi va texnik yordamni to‘xtatadigan muddat qanday ataladi?"),
      answers: ["end of support", "qo‘llab-quvvatlash tugashi", "eol"]
    }
  }
];

export const cctvDeepReferences: LearningReference[] = [
  { label: l("ONVIF: rasmiy sahifa"), href: "https://www.onvif.org/" },
  { label: l("Security Industry Association (SIA): rasmiy sahifa"), href: "https://www.securityindustry.org/" }
];
