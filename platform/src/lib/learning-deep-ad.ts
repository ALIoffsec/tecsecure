import type { Localized, LearningSection, LearningReference } from "./learning-demo";

const l = (uz: string): Localized => ({ uz, ru: uz, en: uz });

export const adDeepSections: LearningSection[] = [
  {
    title: l("5. Kerberos autentifikatsiyasi: chuqur tahlil"),
    content: l(
      "Kerberos — Active Directory’ning asosiy autentifikatsiya protokoli bo‘lib, parolni tarmoq orqali uzatmasdan, ishonchli uchinchi tomon (Key Distribution Center, KDC) orqali identifikatsiyani tasdiqlaydi. Domain Controller’da ishlaydigan KDC ikki xizmatdan iborat: Authentication Service (AS) va Ticket Granting Service (TGS).\n\nJarayon quyidagicha boshlanadi: foydalanuvchi kompyuteri AS-REQ so‘rovini yuboradi, unda foydalanuvchi identifikatori va — zamonaviy sozlamalarda — vaqt tamg‘asi foydalanuvchi parolidan olingan kalit bilan shifrlangan holda (pre-authentication) jo‘natiladi. KDC bu pre-auth ma’lumotini tekshiradi va agar to‘g‘ri bo‘lsa, AS-REP bilan javob beradi: bu javobda Ticket Granting Ticket (TGT) va foydalanuvchi kalitidan olingan sessiya kaliti mavjud. TGT esa krbtgt hisobi kaliti bilan shifrlangan bo‘lib, foydalanuvchi uni ochib o‘qiy olmaydi — u faqat uni keyingi so‘rovlarda taqdim etadi.\n\nFoydalanuvchi biror xizmatga (masalan fayl serveriga) murojaat qilmoqchi bo‘lganda, u TGT’ni TGS-REQ ichida ko‘rsatib, kerakli xizmat uchun servis chiptasini (service ticket) so‘raydi. TGS bu chiptani xizmat hisobining kaliti bilan shifrlab qaytaradi (TGS-REP). Foydalanuvchi bu chiptani to‘g‘ridan-to‘g‘ri xizmat serveriga taqdim etadi; server o‘zining kaliti bilan chiptani ochib, foydalanuvchi identifikatorini tasdiqlaydi — bu bosqichda Domain Controller bilan qo‘shimcha aloqa shart emas, bu Kerberos’ning masshtablanishini ta’minlaydi.\n\nBu arxitekturaning muhim xavfsizlik oqibati shundaki: xizmat chiptasi xizmat hisobining parolidan olingan kalit bilan shifrlangani uchun, agar xizmat hisobining paroli zaif bo‘lsa, chiptani oflayn tarzda (hech qanday Domain Controller’ga murojaat qilmasdan) tanlab ko‘rish (brute-force) mumkin bo‘ladi — bu keyingi bo‘limda ko‘rib chiqiladigan Kerberoasting hujumining asosidir. Shuningdek, krbtgt hisobining kaliti butun domen TGT ishonchining markazi hisoblanadi; shu sababli krbtgt parolini davriy va ikki marta ketma-ket (chunki eski parol ham muddatli amal qiladi) almashtirish muhim amaliyot hisoblanadi."
    ),
    example: l(
      "# Faqat o‘qish uchun diagnostik buyruq: domendagi SPN’ga ega xizmat hisoblarini ro‘yxatlash\nGet-ADUser -Filter {ServicePrincipalName -like \"*\"} -Properties ServicePrincipalName |\n  Select-Object Name, ServicePrincipalName"
    ),
    exampleExplanation: l(
      "Bu PowerShell buyrug‘i faqat o‘qish uchun mo‘ljallangan audit so‘rovi bo‘lib, qaysi hisoblarda Service Principal Name mavjudligini ko‘rsatadi — bu Kerberoasting riskini baholash uchun birinchi qadam. Buyruqni faqat o‘zingizga tegishli yoki yozma ruxsat berilgan domenda, hech qanday chiptani ajratib olishga urinmasdan bajaring."
    ),
    question: {
      prompt: l("Foydalanuvchi login qilganda KDC’dan oladigan, keyinchalik xizmat chiptalarini so‘rash uchun ishlatiladigan asosiy chipta qanday ataladi?"),
      answers: ["tgt", "ticket granting ticket"]
    }
  },
  {
    title: l("6. Kerberoasting va AS-REP Roasting: mexanizm va aniqlash"),
    content: l(
      "Kerberoasting — oldingi bo‘limda tasvirlangan Kerberos jarayonidagi qonuniy funksiyadan foydalanib, xizmat hisoblarining parolini oflayn tanlab topishga urinish usuli. Har qanday autentifikatsiyalangan domen foydalanuvchisi, Service Principal Name’ga ega bo‘lgan har qanday xizmat hisobi uchun servis chiptasini so‘rashga haqli — bu Kerberos arxitekturasining normal qismi. Olingan chipta xizmat hisobining parolidan olingan kalit bilan shifrlangani uchun, tajovuzkor bu chiptani o‘z mashinasida, hech qanday qo‘shimcha tarmoq so‘rovisiz, lug‘at yoki brute-force usuli bilan tekshirib ko‘rishi mumkin. Agar xizmat hisobi parol qisqa yoki oddiy bo‘lsa, bu jarayon muvaffaqiyatli bo‘ladi.\n\nAS-REP Roasting esa boshqacha mexanizmga ega: agar foydalanuvchi hisobida Kerberos pre-authentication talabi o‘chirilgan bo‘lsa (odatda eski dastur moslashuvi uchun amalga oshiriladigan konfiguratsiya), tajovuzkor hech qanday parolni bilmasdan ham AS-REQ yubora oladi va AS-REP ichidagi, foydalanuvchi kaliti bilan shifrlangan qismni oflayn tahlil qilishi mumkin. Bu holatda ham zaif parol butun himoyani buzadi.\n\nIkkala hujum ham tarmoq orqali shubhali ko‘p sonli autentifikatsiya urinishi sifatida ko‘rinmaydi, chunki chiptani olish bir martalik, qonuniy ko‘ringan so‘rov; haqiqiy “hujum” qismi tajovuzkor tomonida, oflayn tarzda sodir bo‘ladi. Shu sababli himoya tarmoq monitoringiga emas, oldini olish choralariga asoslanadi: xizmat hisoblari uchun uzun, tasodifiy va davriy aylantiriladigan parollar (yoki parolni avtomatik boshqaradigan Group Managed Service Account — gMSA — ishlatish, chunki gMSA paroli juda uzun va avtomatik aylantiriladi hamda inson tomonidan hech qachon bilinmaydi).\n\nAniqlash tomonida, Domain Controller’da RC4 shifrlash turi bilan (zamonaviy AES o‘rniga) so‘ralgan TGS so‘rovlari odatiy bo‘lmagan signal hisoblanadi, chunki ko‘p eski asboblar RC4’ni afzal ko‘radi; shuningdek bitta hisob tomonidan qisqa vaqt ichida ko‘plab turli SPN’lar uchun chipta so‘ralishi ham shubhali naqsh hisoblanadi. Pre-authentication’ni o‘chirish faqat aniq, hujjatlashtirilgan moslashuv sababi bo‘lgandagina va qo‘shimcha monitoring bilan qoplangan holda qo‘llanilishi kerak."
    ),
    example: l(
      "# Faqat o‘qish: pre-authentication o‘chirilgan hisoblarni aniqlash (audit maqsadida)\nGet-ADUser -Filter {DoesNotRequirePreAuth -eq $true} -Properties DoesNotRequirePreAuth |\n  Select-Object Name, DistinguishedName"
    ),
    exampleExplanation: l(
      "Bu buyruq AS-REP Roasting’ga nisbatan zaif bo‘lishi mumkin bo‘lgan hisoblarni — faqat auditi maqsadida — ro‘yxatlaydi, hech qanday chiptani so‘ramaydi yoki buzishga urinmaydi. Topilgan natijalarni darhol tasdiqlash va zarur bo‘lmasa pre-auth’ni qayta yoqish tavsiya etiladi; haqiqiy hisob nomlarini hisobotlarda oshkor qilmang."
    ),
    question: {
      prompt: l("Xizmat hisobi paroli o‘rniga avtomatik boshqariladigan, uzun va davriy aylantiriladigan maxsus hisob turi qanday ataladi?"),
      answers: ["gmsa", "group managed service account"]
    }
  },
  {
    title: l("7. Pass-the-hash, pass-the-ticket va lateral movement’ga qarshi himoya"),
    content: l(
      "Pass-the-hash — tajovuzkor foydalanuvchining aniq parolini bilmasdan, uning parol xeshini (NTLM xesh) to‘g‘ridan-to‘g‘ri autentifikatsiya uchun ishlatish usuli, chunki ba’zi eski protokollarda server aynan xeshni tekshiradi, parolni emas. Pass-the-ticket esa shunga o‘xshash, lekin Kerberos chiptalari (TGT yoki servis chiptasi) xotiradan olib, boshqa mashinada “qayta ijro etish” (replay) orqali amalga oshiriladi. Ikkala usul ham, agar tajovuzkor bitta mashinada administrator huquqiga ega bo‘lib qolsa, xotiradagi kredensial materiallarni olib, tarmoqdagi boshqa tizimlarga “yon tomonga” (lateral) o‘tishga imkon beradi.\n\nBu hujumlarning asosiy old sharti — imtiyozli hisob kredensiallarining oddiy ish stansiyalarida xotirada qolishi. Agar domen administratori oddiy xodim kompyuteriga masofaviy ulansa, uning kredensial materiali o‘sha mashina xotirasida qoladi va agar mashina allaqachon buzilgan bo‘lsa, bu material olib qo‘yilishi mumkin. Shuning uchun eng muhim himoya tamoyili — tiered administration (qatlamli boshqaruv): imtiyozli hisoblar faqat maxsus, qattiq nazorat qilinadigan boshqaruv stansiyalaridan (Privileged Access Workstation) foydalanadi va hech qachon oddiy ish stansiyalariga ulanmaydi.\n\nCredential Guard — Windows’ning virtualizatsiyaga asoslangan xavfsizlik (VBS) texnologiyasi — NTLM xesh va Kerberos chiptalarini asosiy operatsion tizimdan izolyatsiyalangan maxsus xotira muhitida saqlaydi, shunday qilib hatto administrator huquqiga ega zararli kod ham ularni osongina chiqarib ololmaydi. Bu texnologiyani yoqish zamonaviy uskunalar talabini (UEFI, virtualizatsiya qo‘llab-quvvatlashi) talab qiladi va mos ravishda rejalashtirilishi kerak.\n\nQo‘shimcha chora sifatida: imtiyozli hisoblar uchun interaktiv bo‘lmagan xizmat ko‘rsatish cheklovlari (masalan “Protected Users” guruhi, bu guruh a’zolari uchun NTLM’ni butunlay o‘chiradi va Kerberos’da faqat kuchli shifrlashni talab qiladi), tarmoqni segmentatsiya qilish, va imtiyozli sessiyalarning muddatini qisqartirish (just-in-time administration) lateral movement yuzasini sezilarli kamaytiradi. Monitoring tomonida, bitta hisobning qisqa vaqt ichida ko‘p turli xil mashinalarga administratorlik sifatida ulanishi anomal signal sifatida kuzatilishi kerak."
    ),
    example: l(
      "# Faqat o‘qish: 'Protected Users' guruhi a’zolarini audit qilish\nGet-ADGroupMember -Identity \"Protected Users\" | Select-Object Name, SamAccountName"
    ),
    exampleExplanation: l(
      "Bu buyruq imtiyozli himoya guruhiga kimlar qo‘shilganini tekshiradi — bu faqat kuzatuv (audit) maqsadida; hech qanday hisobni o‘zgartirmaydi. Imtiyozli hisoblarni ushbu guruhga qo‘shishdan oldin, bu guruh NTLM’ni butunlay o‘chirishini va moslik (compatibility) ta’sirini sinab ko‘rish lozim."
    ),
    question: {
      prompt: l("Imtiyozli hisoblar uchun kredensial materialni asosiy OS’dan izolyatsiya qiladigan virtualizatsiya asosidagi Windows xavfsizlik texnologiyasi?"),
      answers: ["credential guard"]
    }
  },
  {
    title: l("8. GPO xavfsizligi va qattiqlashtirish bazaviy darajalari"),
    content: l(
      "Group Policy Object (GPO) — Active Directory’da konfiguratsiyani markazlashgan tarzda minglab kompyuter va foydalanuvchilarga qo‘llashning asosiy vositasi. GPO’lar parol siyosati, audit sozlamalari, dastur cheklovlari, xavfsizlik devori qoidalari va ko‘plab boshqa parametrlarni boshqarishi mumkin. Ammo GPO’lar vaqt o‘tishi bilan boshqarilmaydigan darajada ko‘payib ketishi (GPO sprawl) odatiy muammo: ko‘plab bir-biriga qarama-qarshi yoki eskirgan GPO’lar, ularning qaysi OU’ga qo‘llanilishi va kim tomonidan yaratilgani haqida hujjat yo‘qligi, konfiguratsiyani tushunishni va auditini qiyinlashtiradi.\n\nMicrosoft Security Compliance Toolkit — Microsoft tomonidan tarqatiladigan, turli Windows va server versiyalari uchun tavsiya etilgan xavfsizlik bazaviy sozlamalarini (security baseline) o‘z ichiga olgan GPO shablonlari to‘plami kontseptsiyasi. Bu bazaviy darajalar “noldan boshlash” o‘rniga, keng sinovdan o‘tgan boshlang‘ich nuqta sifatida xizmat qiladi; ularni to‘g‘ridan-to‘g‘ri, hech qanday moslashtirmasdan qo‘llash tavsiya etilmaydi — har tashkilot o‘z muhitiga mos ravishda sinab, moslashtirib joriy etishi kerak.\n\nGPO xavfsizligining muhim jihati — delegatsiya (delegation) nazorati: kim GPO yaratishi, tahrirlashi yoki OU’ga bog‘lashi mumkinligini belgilaydigan ruxsatlar. Agar imtiyozsiz hisobga tasodifan yoki ortiqcha ravishda GPO yaratish/tahrirlash huquqi berilgan bo‘lsa, bu hisob domendagi ko‘plab kompyuterlarga ta’sir qiluvchi o‘zgarish kirita oladi — bu amalda imtiyozni oshirishga (privilege escalation) teng yo‘l hisoblanadi. Shuning uchun GPO delegatsiyasini muntazam ko‘rib chiqish, “kim nimani o‘zgartira oladi” zanjirini AD ruxsatlari kabi jiddiy baholash lozim.\n\nAmaliy tavsiya sifatida: GPO’larni versiya nazorati tushunchasiga yaqinlashtirish (o‘zgarishlarni hujjatlashtirish, muntazam audit, ishlatilmayotgan GPO’larni arxivlash), muhim xavfsizlik sozlamalarini kam sonli, aniq nomlangan GPO’larga markazlashtirish, va har qanday o‘zgarishni avval test OU’sida sinab ko‘rishdan so‘ng ishlab chiqarishga joriy qilish — GPO bilan bog‘liq nosozliklar va boshqaruv yo‘qotilishining oldini oladi."
    ),
    example: l(
      "# Faqat o‘qish: berilgan OU’ga bog‘langan GPO’lar va ularning tartibini ko‘rish\nGet-GPInheritance -Target \"OU=Finance,DC=contoso,DC=local\" |\n  Select-Object -ExpandProperty GpoLinks"
    ),
    exampleExplanation: l(
      "Bu buyruq berilgan tashkiliy birlikka qanday GPO’lar qo‘llanilayotganini va ularning ustuvorlik tartibini ko‘rsatadi — bu GPO sprawl va qarama-qarshi sozlamalarni aniqlashning birinchi qadami. Buyruq hech narsani o‘zgartirmaydi; real domen nomlari namuna sifatida sintetik berilgan."
    ),
    question: {
      prompt: l("Microsoft tomonidan tarqatiladigan, tavsiya etilgan GPO xavfsizlik sozlamalari to‘plami qanday ataladi?"),
      answers: ["security compliance toolkit", "security baseline"]
    }
  },
  {
    title: l("9. Darajalash modeli (Tiering), Enterprise Access Model va LAPS"),
    content: l(
      "Active Directory muhitida barcha imtiyozli hisoblarni bir xil darajada ko‘rib chiqish katta xavf tug‘diradi, chunki agar past darajadagi (masalan oddiy ish stansiyasi) administrator huquqi buzilsa, bu zanjir orqali butun domenni egallashga olib kelishi mumkin. Tiering model (va uning zamonaviy rivojlanmasi — Enterprise Access Model) infratuzilmani darajalarga ajratadi: eng yuqori daraja (Domain Controller’lar va domen ishonchi), o‘rta daraja (serverlar va ilovalar) va eng past daraja (oddiy ish stansiyalari). Qoida shundan iboratki, yuqori darajadagi hisob hech qachon pastroq darajadagi tizimga autentifikatsiya qilmasligi kerak — aks holda kredensial material pastroq, kamroq ishonchli muhitda “sizib chiqadi”.\n\nBu model amalda alohida administrator hisoblari (kundalik ish uchun oddiy hisob, alohida — faqat serverlar uchun, va alohida — faqat Domain Controller’lar uchun imtiyozli hisob), alohida boshqaruv stansiyalari (Privileged Access Workstation) va har daraja uchun alohida xavfsizlik guruhlarini talab qiladi. Privileged Access Management (PAM) yondashuvi bunga qo‘shimcha ravishda “just-in-time” — imtiyozni doimiy emas, balki faqat kerak bo‘lgan vaqt oralig‘ida, tasdiqlash jarayoni orqali berish — tamoyilini qo‘shadi, bu doimiy imtiyozli a’zolik yuzasini kamaytiradi.\n\nLocal Administrator Password Solution (LAPS) — har bir domen a’zosi kompyuterning mahalliy administrator parolini avtomatik ravishda noyob, tasodifiy qiymatga o‘rnatadigan va uni Active Directory’da xavfsiz, faqat vakolatli hisoblar o‘qiy oladigan atributda saqlaydigan Microsoft yechimi. Bu, agar barcha kompyuterlarda bir xil mahalliy administrator paroli ishlatilsa (keng tarqalgan xavfli amaliyot), tajovuzkor bitta mashinada bu parolni topib, uni barcha boshqa mashinalarga pass-the-hash orqali qo‘llab, butun tarmoq bo‘ylab tarqalishining oldini oladi. LAPS parolni muntazam avtomatik aylantiradi va parolni olish huquqi faqat tegishli audit yozuvi bilan birga berilishi kerak.\n\nBu uchala kontseptsiya — tiering, PAM va LAPS — birgalikda “imtiyoz bir joyda buzilsa, u butun domenga avtomatik tarzda tarqalmasin” degan mudofaa chuqurligi (defense in depth) tamoyilini amalga oshiradi."
    ),
    example: l(
      "# Faqat o‘qish: LAPS tomonidan boshqarilayotgan kompyuterlar va parol yangilanish sanasini audit qilish\nGet-ADComputer -Filter * -Properties ms-Mcs-AdmPwdExpirationTime |\n  Select-Object Name, ms-Mcs-AdmPwdExpirationTime"
    ),
    exampleExplanation: l(
      "Bu buyruq LAPS tomonidan boshqariladigan kompyuterlarda parolning keyingi amal qilish muddati qachon tugashini ko‘rsatadi — bu LAPS joriy etilganini tasdiqlash uchun audit so‘rovi, haqiqiy parol qiymatini chiqarmaydi. Parolning o‘zini olish huquqi faqat qat’iy vakolatli hisoblarga cheklangan bo‘lishi kerak."
    ),
    question: {
      prompt: l("Yuqori imtiyozli hisob hech qachon pastroq ishonch darajasidagi tizimga autentifikatsiya qilmasligi kerak degan tamoyilga asoslangan model qanday ataladi?"),
      answers: ["tiering model", "enterprise access model", "darajalash modeli"]
    }
  },
  {
    title: l("10. AD zaxira nusxalash va falokatdan keyin tiklash"),
    content: l(
      "Active Directory — tashkilotning deyarli barcha identifikatsiya va kirish nazoratining asosi bo‘lgani uchun, uning zaxira nusxasi va tiklash rejasi tashkilotning eng muhim falokatga qarshi tayyorgarlik elementlaridan biridir. Har bir Domain Controller’ning system state zaxira nusxasi (AD ma’lumotlar bazasi — NTDS.dit, SYSVOL, registry va boshqa tizim komponentlarini o‘z ichiga oladi) muntazam, avtomatlashtirilgan jadval bo‘yicha olinishi va zaxira nusxaning o‘zi ham tegishli xavfsizlik nazorati (shifrlash, cheklangan kirish) bilan himoyalanishi kerak — chunki zaxira nusxa butun domen ma’lumotlar bazasining nusxasi bo‘lgani uchun, u o‘zi ham yuqori qiymatli nishona hisoblanadi.\n\nAD Recycle Bin — o‘chirilgan obyektlarni (foydalanuvchi, guruh va h.k.) to‘liq atributlari bilan birga, belgilangan muddat davomida saqlab turadigan va osongina tiklash imkonini beruvchi xususiyat. Bu xususiyat yoqilmagan bo‘lsa, o‘chirilgan obyekt “tombstone” holatiga o‘tadi — bu holatda ko‘plab atributlar yo‘qoladi va to‘liq tiklash ancha qiyinlashadi. Tombstone lifetime (odatda standart bo‘yicha o‘nlab kunlarga teng) — o‘chirilgan obyekt ma’lumotlari butunlay yo‘q qilinishidan oldingi vaqt oralig‘ini belgilaydi; bu muddatdan uzoqroq vaqt davomida zaxira nusxa olinmasa, domen takrorlanishi (replication) davomida “lingering object” muammolari yuzaga kelishi mumkin.\n\nTiklashning ikki asosiy stsenariysi farqlanadi: authoritative restore (tiklangan obyekt yoki atributni boshqa Domain Controller’larga “to‘g‘ri” versiya sifatida majburan tarqatish, masalan tasodifan o‘chirilgan OU’ni butun o‘zgartirish tarixi bilan qaytarish) va non-authoritative restore (Domain Controller’ni zaxira nusxadan tiklab, keyin uni boshqa Domain Controller’lardan oddiy replikatsiya orqali yangilash). Qaysi usul kerakligini noto‘g‘ri tanlash yoki vaqtni noto‘g‘ri hisoblash, replikatsiya ziddiyatlariga yoki ma’lumot yo‘qotishga olib kelishi mumkin.\n\nEng muhim amaliy tamoyil — zaxira nusxaning mavjudligi emas, balki uni muntazam ravishda, izolyatsiyalangan test muhitida haqiqatan ham tiklab ko‘rish intizomi (restore testing). Ko‘p tashkilot zaxira nusxa olishni avtomatlashtiradi, lekin tiklashni hech qachon sinab ko‘rmaydi — bu esa haqiqiy falokat vaqtida zaxira nusxaning buzilgan yoki to‘liqsiz ekanligini kechikib aniqlashga olib keladi. Tiklash testini yiliga kamida bir necha marta, haqiqiy jadval bo‘yicha rejalashtirish va natijalarni hujjatlashtirish tavsiya etiladi."
    ),
    example: l(
      "# Faqat o‘qish: AD Recycle Bin xususiyati yoqilganligini tekshirish\nGet-ADOptionalFeature -Filter 'Name -like \"Recycle Bin*\"' |\n  Select-Object Name, EnabledScopes"
    ),
    exampleExplanation: l(
      "Bu buyruq AD Recycle Bin xususiyati domenda yoqilgan-yoqilmaganini va qaysi domenlarga qo‘llanilganini ko‘rsatadi — bu faqat holatni tekshirish, hech qanday obyektni o‘chirmaydi yoki o‘zgartirmaydi. Agar xususiyat o‘chirilgan bo‘lsa, uni yoqishdan oldin tashkilot IT siyosati va Domain Controller funksional darajasi talablarini tekshiring."
    ),
    question: {
      prompt: l("O‘chirilgan AD obyektining ma’lumotlari butunlay yo‘q qilinishidan oldingi belgilangan vaqt oralig‘i qanday ataladi?"),
      answers: ["tombstone lifetime", "tombstone muddati"]
    }
  }
];

export const adDeepReferences: LearningReference[] = [
  { label: l("Microsoft Learn: Kerberos autentifikatsiyasi"), href: "https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview" },
  { label: l("Microsoft Learn: Local Administrator Password Solution (LAPS)"), href: "https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview" }
];
