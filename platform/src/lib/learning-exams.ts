export type ExamQuestion = { id: string; text: string; options: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation: string };
export type ExamDef = {
  slug: string;
  title: string;
  credential: string;
  acronym: string;
  accent: string;
  summary: string;
  feeTec: number;
  minutes: number;
  passPercent: number;
  requiredModules: string[];
  requiredLabs: string[];
  topics: string[];
  questions: ExamQuestion[];
};
export type PublicExamQuestion = Omit<ExamQuestion, "correct" | "explanation">;

type Row = [string, [string, string, string, string], 0 | 1 | 2 | 3, string];

function build(prefix: string, rows: Row[]): ExamQuestion[] {
  return rows.map(([text, options, correct, explanation], index) => ({ id: `${prefix}${index + 1}`, text, options, correct, explanation }));
}

const network = build("n", [
  ["IP manzillar OSI modelining qaysi qatlamida ishlaydi?", ["Transport", "Network", "Data Link", "Session"], 1, "IP marshrutlash qatlami — Network (3-qatlam)."],
  ["192.168.1.0/24 tarmog‘ida nechta host manzil ishlatish mumkin?", ["254", "256", "255", "252"], 0, "256 manzildan tarmoq va broadcast olib tashlanadi: 254."],
  ["Oddiy (L2) switch kadrni qaysi manzil bo‘yicha uzatadi?", ["IP manzil", "MAC manzil", "Port raqami", "Domen nomi"], 1, "Switch MAC jadvali (CAM) asosida ishlaydi."],
  ["DNS ning asosiy vazifasi nima?", ["IP manzillarni avtomatik tarqatish", "Trafikni shifrlash", "Domen nomini IP manzilga aylantirish", "MAC manzilni topish"], 2, "DNS nomlarni IP ga aylantiradi."],
  ["TCP ning UDP dan asosiy farqi nima?", ["Tezroq ishlaydi", "Ulanish o‘rnatadi va yetkazib berishni kafolatlaydi", "Faqat video uchun", "Manzil talab qilmaydi"], 1, "TCP connection-oriented va ishonchli; UDP esa yo‘q."],
  ["DHCP server mijozga nima beradi?", ["Faqat DNS nomi", "IP manzil, maska, gateway va DNS", "Faqat MAC manzil", "Veb-sahifa"], 1, "DHCP tarmoq sozlamalarini avtomatik tarqatadi."],
  ["Quyidagilardan qaysi biri private (ichki) manzil?", ["8.8.8.8", "172.32.0.5", "10.20.30.40", "193.1.1.1"], 2, "10.0.0.0/8 — RFC 1918 private blok. 172.16–172.31 oralig‘i private, 172.32 emas."],
  ["ARP protokoli nima qiladi?", ["MAC manzildan IP topadi", "IP manzildan MAC manzilni aniqlaydi", "Domenni IP ga aylantiradi", "Paketni shifrlaydi"], 1, "ARP IPv4 manzilga mos MAC ni so‘raydi."],
  ["Default gateway nima uchun kerak?", ["Boshqa tarmoqqa chiqish uchun", "Tarmoq tezligini oshirish uchun", "DNS saqlash uchun", "Parolni tekshirish uchun"], 0, "Boshqa tarmoq manzillariga trafik gateway (router) orqali boradi."],
  ["/27 prefiksga mos subnet maska qaysi?", ["255.255.255.192", "255.255.255.240", "255.255.255.224", "255.255.255.248"], 2, "/27 = 27 bit tarmoq = 255.255.255.224."],
  ["HTTPS odatda qaysi portda ishlaydi?", ["80", "22", "8080", "443"], 3, "HTTPS standart porti 443."],
  ["VLAN asosan nimaga xizmat qiladi?", ["Broadcast domenini mantiqiy ajratishga", "Internet tezligini oshirishga", "DNS ni almashtirishga", "Paketni siqishga"], 0, "VLAN bitta switchni bir nechta mantiqiy tarmoqqa bo‘ladi."],
  ["NAT ning asosiy vazifasi nima?", ["Parolni xeshlash", "Private manzillarni public manzilga tarjima qilish", "MAC manzilni o‘zgartirish", "Domenni ro‘yxatdan o‘tkazish"], 1, "NAT ichki manzillarni tashqi manzil ostida chiqaradi."],
  ["ping buyrug‘i qaysi protokoldan foydalanadi?", ["ICMP", "TCP", "ARP", "SMTP"], 0, "ping ICMP Echo Request/Reply ishlatadi."],
  ["IP paketdagi TTL maydoni nima uchun kerak?", ["Paket hajmini cheklash", "Cheksiz aylanib yurishning oldini olish", "Shifrlash kaliti", "Manba MAC manzili"], 1, "Har bir router TTL ni kamaytiradi; 0 bo‘lsa paket tashlanadi."]
]);

const linux = build("l", [
  ["Joriy ishchi katalogni ko‘rsatadigan buyruq qaysi?", ["ls", "cd", "pwd", "whoami"], 2, "pwd — print working directory."],
  ["chmod 755 fayl uchun qanday ruxsat beradi?", ["rw-r--r--", "rwxr-xr-x", "rwx------", "rwxrwxrwx"], 1, "7=rwx egasi, 5=r-x guruh va boshqalar."],
  ["Foydalanuvchi parol xeshlari odatda qayerda saqlanadi?", ["/etc/shadow", "/etc/hosts", "/var/log/auth.log", "/home"], 0, "/etc/shadow faqat root o‘qiy oladi; /etc/passwd da akkaunt ma’lumotlari."],
  ["Eng kam huquq tamoyili (least privilege) nimani anglatadi?", ["Hammaga admin huquqi berish", "Faqat ish uchun zarur huquqni berish", "Parollarni kamaytirish", "Faqat root ishlatish"], 1, "Har bir akkaunt faqat kerakli minimal huquqqa ega bo‘lishi kerak."],
  ["CIA triadasi nimani anglatadi?", ["Confidentiality, Integrity, Availability", "Control, Identity, Access", "Cipher, Integrity, Authentication", "Compliance, Inspection, Audit"], 0, "Maxfiylik, yaxlitlik va mavjudlik."],
  ["Phishing nima?", ["Tarmoqni skanerlash", "Foydalanuvchini aldab ma’lumot oldirish", "Diskni shifrlash", "Parolni xeshlash"], 1, "Phishing — aldash orqali parol/ma’lumot olish urinishi."],
  ["grep buyrug‘i nima qiladi?", ["Fayl o‘chiradi", "Matn ichidan andoza bo‘yicha qidiradi", "Jarayonni to‘xtatadi", "Tarmoqni tekshiradi"], 1, "grep matnda qator/andozani qidiradi."],
  ["sudo nima uchun ishlatiladi?", ["Boshqa foydalanuvchi (odatda root) huquqi bilan buyruq bajarish", "Parolni ko‘rsatish", "Paket yuklash tezligini oshirish", "Faylni siqish"], 0, "sudo ruxsat etilgan buyruqni boshqa foydalanuvchi nomidan bajaradi."],
  ["Ishlayotgan jarayonlarni ko‘rish uchun qaysi buyruq mos?", ["ps aux", "mkdir", "chmod", "tar"], 0, "ps aux yoki top jarayonlar ro‘yxatini chiqaradi."],
  ["Parollarni saqlashning to‘g‘ri usuli qaysi?", ["Ochiq matnda", "Base64 da", "Tuzli (salt) kuchli xesh bilan (bcrypt/argon2)", "Oddiy MD5 bilan"], 2, "Parollar tuzli, sekin xesh funksiyalar bilan saqlanadi."],
  ["Ko‘p faktorli autentifikatsiya (MFA) nima beradi?", ["Parolni almashtiradi", "Parol buzilsa ham qo‘shimcha himoya qatlami", "Internetni tezlashtiradi", "Fayllarni zaxiralaydi"], 1, "Ikkinchi omil o‘g‘irlangan parol xavfini kamaytiradi."],
  ["Nima uchun tizim yangilanishlarini (patch) o‘z vaqtida o‘rnatish kerak?", ["Dizayn yangilanishi uchun", "Ma’lum zaifliklarni yopish uchun", "Disk joyini ko‘paytirish uchun", "Litsenziya uchun"], 1, "Ko‘p hujumlar allaqachon ma’lum, yamoqlangan zaifliklarga qaratilgan."],
  ["SSH uchun xavfsizroq usul qaysi?", ["Parol bilan, istalgan manzildan", "Kalit (publickey) bilan kirish", "root bilan parolsiz", "Telnet"], 1, "Kalit asosidagi kirish brute-force xavfini kamaytiradi."],
  ["chown buyrug‘i nimani o‘zgartiradi?", ["Fayl ruxsatini", "Fayl egasini", "Fayl nomini", "Fayl hajmini"], 1, "chown — change owner."],
  ["Defence in depth (chuqur himoya) nima?", ["Bitta kuchli firewall", "Bir nechta mustaqil himoya qatlamlari", "Faqat antivirus", "Hamma xizmatni ochish"], 1, "Bir qatlam buzilsa ham boshqalari himoya qiladi."]
]);

const soc = build("s", [
  ["Windows Security jurnalida muvaffaqiyatsiz kirish qaysi Event ID bilan qayd etiladi?", ["4624", "4625", "4688", "4720"], 1, "4625 — failed logon; 4624 — successful logon."],
  ["Windows da muvaffaqiyatli kirish hodisasi qaysi?", ["4625", "4624", "4634", "1102"], 1, "4624 — An account was successfully logged on."],
  ["Password spray hujumining asosiy belgisi qaysi?", ["Bitta akkauntga minglab parol", "Ko‘p akkauntga oz sondagi (1–2) parol", "Faqat fayl yuklash", "DNS so‘rovlar ko‘pligi"], 1, "Spray akkauntlarni bloklanishdan qochish uchun kam urinishni ko‘p akkauntda sinaydi."],
  ["SIEM tizimi nima qiladi?", ["Fayllarni zaxiralaydi", "Turli manbalardan loglarni yig‘ib, korrelyatsiya va ogohlantirish beradi", "Parol xeshlaydi", "Tarmoqni tezlashtiradi"], 1, "SIEM markazlashgan log tahlili va ogohlantirish tizimi."],
  ["IOC (Indicator of Compromise) ga qaysi misol bo‘la oladi?", ["Zararli IP manzil yoki fayl xeshi", "Foydalanuvchi ismi", "Server rangi", "Printer modeli"], 0, "IOC — kompromet belgisini bildiruvchi iz."],
  ["False positive nima?", ["Haqiqiy hujum o‘tkazib yuborilishi", "Hujum bo‘lmagan hodisaning hujum deb belgilanishi", "Log yo‘qolishi", "Parol buzilishi"], 1, "Noto‘g‘ri signal: aslida zararsiz hodisa."],
  ["Log korrelyatsiyasi nimani anglatadi?", ["Loglarni o‘chirish", "Turli loglardagi hodisalarni bog‘lab, to‘liq manzara yaratish", "Loglarni shifrlash", "Faqat vaqtni tekshirish"], 1, "Masalan: firewall logi + auth logi + endpoint logi bog‘lanadi."],
  ["Incident response jarayonida zararning tarqalishini to‘xtatish qaysi bosqich?", ["Containment (cheklash)", "Preparation", "Lessons learned", "Reporting"], 0, "Containment — hujum tarqalishini cheklash."],
  ["Access logda User-Agent: sqlmap ko‘rinsa bu nimani anglatadi?", ["Oddiy brauzer", "SQL injection avtomatlashtirilgan vositasi ishlatilgan", "Antivirus yangilanishi", "Yangi printer"], 1, "sqlmap — SQL injection ni avtomatlashtiruvchi vosita."],
  ["Bir IP dan ketma-ket ko‘p 500 xato kelib, keyin bitta 200 va katta javob hajmi nimaga ishora qilishi mumkin?", ["Server yangilanishi", "Muvaffaqiyatli injection va ma’lumot sizib chiqishi", "DNS xatosi", "Normal foydalanuvchi"], 1, "Xatolardan keyingi keskin katta javob ma’lumot dump belgisi bo‘lishi mumkin."],
  ["Windows Logon Type 10 nimani bildiradi?", ["Konsoldan kirish", "Tarmoq orqali fayl", "RemoteInteractive (RDP)", "Servis"], 2, "Type 10 — RDP orqali interaktiv kirish."],
  ["Log tahlilida server vaqtini sinxronlash (NTP) nima uchun muhim?", ["Tezlik uchun", "Hodisalar xronologiyasini to‘g‘ri bog‘lash uchun", "Rang uchun", "Litsenziya uchun"], 1, "Turli qurilmalarda vaqt farqi bo‘lsa, hodisalar ketma-ketligi buziladi."],
  ["MITRE ATT&CK nima?", ["Antivirus nomi", "Hujumchi taktika va texnikalari bilimlar bazasi", "Operatsion tizim", "Tarmoq protokoli"], 1, "ATT&CK — real kuzatuvlarga asoslangan taktika/texnikalar katalogi."],
  ["Hodisa tergovida logni o‘zgartirib yubormaslik nima uchun muhim?", ["Joy tejash uchun", "Dalil yaxlitligi va ishonchliligi uchun", "Tezlik uchun", "Qiziqarli bo‘lgani uchun"], 1, "O‘zgartirilgan log dalil sifatida ishonchsiz bo‘ladi."],
  ["Brute-force va password spray farqi nima?", ["Farqi yo‘q", "Brute-force bitta akkauntga ko‘p parol, spray ko‘p akkauntga oz parol", "Brute-force faqat Linux’da", "Spray faqat veb’da"], 1, "Bu farq aniqlash va bloklash strategiyasiga ta’sir qiladi."]
]);

const owasp = build("o", [
  ["OWASP Top 10 ro‘yxatida A01 — eng yuqori toifa qaysi?", ["Broken Access Control", "Cryptographic Failures", "Injection", "Security Misconfiguration"], 0, "2021 ro‘yxatida A01 — Broken Access Control eng ko‘p uchraydigan va og‘ir toifa."],
  ["SQL injection’ning asosiy sababi nima?", ["Zaif parol siyosati", "Ishonchsiz kiritmani to‘g‘ridan-to‘g‘ri so‘rovga qo‘shish", "Eski brauzer", "Sekin server"], 1, "Parametrlashtirilmagan so‘rovlarga foydalanuvchi kiritmasi qo‘shilsa, SQLi yuzaga keladi."],
  ["Parametrlashtirilgan so‘rovlar (prepared statements) nimaga yordam beradi?", ["Saytni tezlashtirishga", "SQL injection’ning oldini olishga", "Diskni tejashga", "Parolni unutishga"], 1, "Kiritma har doim ma’lumot sifatida, kod sifatida emas, qabul qilinadi."],
  ["Stored XSS va reflected XSS o‘rtasidagi farq nima?", ["Farqi yo‘q", "Stored — skript serverda saqlanadi, reflected — so‘rovda qaytariladi", "Stored faqat mobil uchun", "Reflected faqat HTTPS’da bo‘ladi"], 1, "Stored XSS bazaga yoziladi va har safar ko‘rsatiladi; reflected faqat bitta so‘rov javobida chiqadi."],
  ["CSRF hujumi nimaga asoslanadi?", ["Brauzer avtomatik cookie yuborishiga", "Zaif parolga", "DNS xatosiga", "Diskdagi bo‘sh joyga"], 0, "Foydalanuvchi sessiyasidagi cookie’dan foydalanib, uning roziligisiz so‘rov yuboriladi."],
  ["Broken Authentication’ning oddiy namunasi nima?", ["Kuchli parol siyosati", "Sessiya ID’ni URL’da ochiq ko‘rsatish", "HTTPS ishlatish", "MFA yoqilgan"], 1, "Sessiya tokeni URL’da bo‘lsa, log/tarix orqali o‘g‘irlanishi mumkin."],
  ["Xavfsiz sozlash (Security Misconfiguration) ga qaysi holat misol bo‘ladi?", ["Standart admin parolini o‘zgartirmaslik", "Patch o‘rnatish", "Kam huquq berish", "Loglarni yoqish"], 0, "Standart sozlamalar va parollar ko‘pincha ma’lum va osongina buziladi."],
  ["Insecure Deserialization qanday xavf tug‘diradi?", ["Diskni to‘ldiradi", "Ishonchsiz ma’lumotdan obyekt tiklanganda kod bajarilishi mumkin", "Faqat UI buziladi", "Faqat tarmoq sekinlashadi"], 1, "Seriyalashtirilgan ma’lumot nazoratsiz qayta tiklansa, hujumchi mantiqni boshqarishi mumkin."],
  ["API xavfsizligida eng ko‘p uchraydigan muammo qaysi?", ["Haddan tashqari ma’lumot qaytarish (excessive data exposure)", "Juda tezkor javob", "Ko‘p dokumentatsiya", "Ko‘p versiyalash"], 0, "API kerakli maydonlardan ortiqcha ma’lumotni qaytarsa, maxfiylik buziladi."],
  ["Xavfsiz kod yozishda eng muhim tamoyillardan biri nima?", ["Hamma kiritmani ishonchli deb hisoblash", "Hech qachon foydalanuvchi kiritmasiga ishonmaslik va uni tekshirish", "Faqat frontendda tekshirish", "Xatolarni foydalanuvchiga to‘liq ko‘rsatish"], 1, "Server tomonida har doim kiritmani tekshirish va tozalash kerak."],
  ["SSRF (Server-Side Request Forgery) hujumida nima sodir bo‘ladi?", ["Server hujumchi ko‘rsatgan ichki/tashqi manzilga so‘rov yuborishga majburlanadi", "Faqat brauzer buziladi", "Faqat parol xeshlanadi", "Faqat DNS keshi tozalanadi"], 0, "Server foydalanuvchi bergan URL bo‘yicha o‘ziga ishonilgan tarmoq ichida so‘rov yuborsa, ichki xizmatlarga kirish mumkin bo‘ladi."],
  ["Security logging and monitoring failures (A09) nima uchun xavfli?", ["Hujum tezroq bo‘ladi", "Buzilish uzoq vaqt aniqlanmay qolishi mumkin", "Server tezroq ishlaydi", "Diskdan joy tejaladi"], 1, "Yetarli log va ogohlantirishsiz, kompromet haftalab-oylab bilinmay qolishi mumkin."],
  ["Vulnerable and Outdated Components (A06) xavfini kamaytirish uchun nima qilish kerak?", ["Kutubxonalarni hech qachon yangilamaslik", "Bog‘liqliklarni inventarizatsiya qilib, muntazam yangilab borish (SBOM, patch)", "Faqat UI dizaynini yangilash", "Faqat parolni uzaytirish"], 1, "Eski, ma’lum zaifliklarga ega kutubxonalar keng tarqalgan hujum vektori hisoblanadi."],
  ["Content Security Policy (CSP) HTTP sarlavhasi asosan nimaga qarshi himoya qiladi?", ["SQL injection’ga", "XSS orqali tashqi skript bajarilishiga", "DDoS hujumiga", "Parol brute-force’ga"], 1, "CSP brauzerga faqat ishonchli manbalardan skript/resurs yuklashga ruxsat berishni buyuradi, bu XSS ta’sirini kamaytiradi."],
  ["Identification and Authentication Failures (A07) ga qaysi holat misol bo‘ladi?", ["Kuchli parol siyosati va MFA", "Sessiyani tugatmaslik va cheksiz login urinishiga yo‘l qo‘yish", "Loglarni saqlash", "HTTPS ishlatish"], 1, "Brute-force’ga qarshi cheklov va sessiya boshqaruvi bo‘lmasa, hisoblar oson egallanadi."]
]);

const activeDirectory = build("a", [
  ["Active Directory’da foydalanuvchilarni guruhlash va siyosat qo‘llash uchun asosiy konteyner nima?", ["Forest", "Organizational Unit (OU)", "Site", "Schema"], 1, "OU — foydalanuvchi, kompyuter va GPO’larni tashkiliy tartibda guruhlash birligi."],
  ["Kerberos autentifikatsiyasida TGT nimani bildiradi?", ["Tizim jurnali", "Ticket-Granting Ticket — xizmat biletlarini olish uchun dastlabki bilet", "Parol xeshi", "Domain controller IP manzili"], 1, "TGT KDC’dan olinadi va keyin xizmat biletlarini (TGS) so‘rash uchun ishlatiladi."],
  ["Group Policy Object (GPO) qaysi tartibda qo‘llanadi?", ["OU, Domain, Site, Local", "Local, Site, Domain, OU", "Domain, Local, OU, Site", "Site, OU, Local, Domain"], 1, "LSDOU tartibi: Local → Site → Domain → OU, oxirgi (OU) ustunlik qiladi."],
  ["Eng kam huquq (least privilege) AD muhitida qanday qo‘llaniladi?", ["Barcha xodimga Domain Admin berish", "Har bir akkauntga faqat ishi uchun zarur guruh a’zoligi berish", "Parolni hech qachon o‘zgartirmaslik", "Barcha OU’ni bitta qilib birlashtirish"], 1, "Ortiqcha imtiyoz lateral harakat va buzilish xavfini oshiradi."],
  ["Privileged Access Workstation (PAW) nima uchun ishlatiladi?", ["Oddiy email o‘qish uchun", "Administrator hisoblarini xavfli ish stantsiyalaridan ajratish uchun", "O‘yin o‘ynash uchun", "Printer sozlash uchun"], 1, "Admin seansi faqat ishonchli, izolyatsiyalangan stantsiyadan amalga oshirilishi tavsiya etiladi."],
  ["Golden Ticket hujumi nimaga asoslanadi?", ["Zaif Wi-Fi parol", "krbtgt hisobining xesh kaliti o‘g‘irlanishi", "DNS keshi", "Antivirus signaturasi"], 1, "krbtgt xeshi egallansa, hujumchi istalgan foydalanuvchi nomidan cheksiz TGT yarata oladi."],
  ["AD’da parol siyosatini sinflarga ajratib qo‘llash uchun nima ishlatiladi?", ["Fine-Grained Password Policy (FGPP)", "DNS zone", "DHCP scope", "Firewall rule"], 0, "FGPP turli guruhlar uchun turlicha parol qattiqligini belgilash imkonini beradi."],
  ["Domain controller’lar orasidagi ma’lumot sinxronizatsiyasi nima deb ataladi?", ["Replication", "Aggregation", "Caching", "Mirroring (RAID)"], 0, "AD replikatsiyasi o‘zgarishlarni barcha DC’larga tarqatadi."],
  ["Audit siyosatida muvaffaqiyatsiz kirish hodisasi qaysi Windows Event ID bilan qayd etiladi?", ["4624", "4625", "4720", "4738"], 1, "4625 — An account failed to log on."],
  ["AD muhitida eng muhim zaxira (backup) obyekti nima?", ["Faqat foydalanuvchi fayllari", "System State / Active Directory ma’lumotlar bazasi (NTDS.dit)", "Faqat printer drayverlari", "Faqat tarmoq diagrammasi"], 1, "NTDS.dit butun katalog ma’lumotini saqlaydi; uni yo‘qotish butun domenni falokatga olib keladi."],
  ["Kerberoasting hujumi nimaga qaratilgan?", ["Foydalanuvchi MFA kodiga", "Xizmat hisoblari (SPN) biletlarini oflayn tanlab ko‘rish (brute-force)", "DNS keshiga", "Printer drayveriga"], 1, "Xizmat bileti xizmat hisobi parolidan olingan kalit bilan shifrlangani uchun zaif parol oflayn buzilishi mumkin."],
  ["Pass-the-Hash hujumida hujumchi nimadan foydalanadi?", ["Foydalanuvchining ochiq matndagi paroli", "NTLM xesh qiymati, parolni bilmasdan autentifikatsiya qilish uchun", "Faqat IP manzil", "Faqat printer nomi"], 1, "NTLM protokolida xeshning o‘zi orqali autentifikatsiya qilish mumkin, shu sababli xesh o‘g‘irlanishi parol kabi xavfli."],
  ["Tier model (Tier 0/1/2) AD xavfsizligida nima uchun qo‘llaniladi?", ["Printerlarni guruhlash uchun", "Yuqori imtiyozli hisoblarni pastroq ishonch darajasidagi tizimlardan izolyatsiya qilish uchun", "Faqat Wi-Fi kanalini ajratish uchun", "Faqat litsenziya hisoblash uchun"], 1, "Domain Admin kabi Tier 0 hisoblar oddiy ish stantsiyalarida ishlatilmasligi kerak — aks holda credential theft xavfi oshadi."],
  ["LDAP so‘rovlarini himoyalashda nima tavsiya etiladi?", ["Hamisha anonim bind’ga ruxsat berish", "LDAPS (shifrlangan LDAP) ishlatish va anonim bind’ni cheklash", "Faqat HTTP ishlatish", "Parolni LDAP’da ochiq saqlash"], 1, "Shifrlanmagan LDAP orqali qidiruv so‘rovlari va ba’zi ma’lumotlar tarmoqda ochiq ko‘rinishi mumkin."],
  ["AdminSDHolder obyekti AD’da nima uchun ishlatiladi?", ["Faqat printer sozlamalarini saqlash uchun", "Yuqori imtiyozli guruh a’zolarining ruxsatlarini himoyalab, ularni avtomatik qayta tiklash uchun", "Faqat DNS keshini tozalash uchun", "Faqat Wi-Fi kalitini saqlash uchun"], 1, "AdminSDHolder himoyalangan guruhlar (masalan Domain Admins) ruxsatlarini davriy ravishda standart holatga qaytarib turadi."]
]);

const cisco = build("c", [
  ["Cisco IOS’da privileged EXEC rejimiga o‘tish buyrug‘i qaysi?", ["configure terminal", "enable", "exit", "show running-config"], 1, "enable — user EXEC’dan privileged EXEC’ga o‘tkazadi."],
  ["Konfiguratsiyani keyingi qayta yuklashdan keyin ham saqlab qolish uchun qaysi buyruq ishlatiladi?", ["copy running-config startup-config", "show version", "reload", "no shutdown"], 0, "running-config faqat operativ xotirada; startup-config’ga nusxalanmasa yo‘qoladi."],
  ["Trunk port nima uchun ishlatiladi?", ["Faqat bitta VLAN uchun", "Bir nechta VLAN trafigini bitta fizik link orqali olib o‘tish uchun", "Portni o‘chirish uchun", "IP manzil berish uchun"], 1, "Trunk 802.1Q tegi bilan bir nechta VLAN’ni bir havola orqali uzatadi."],
  ["Spanning Tree Protocol (STP) nima uchun kerak?", ["VLAN yaratish uchun", "Layer 2 halqalarining oldini olish uchun", "IP marshrutlash uchun", "DHCP berish uchun"], 1, "STP ortiqcha linklarni bloklab, broadcast storm va halqalarni oldini oladi."],
  ["Router-on-a-stick konfiguratsiyasida nechta fizik interfeys VLAN’lar orasida marshrutlash uchun kifoya?", ["Har bir VLAN uchun alohida", "Bitta trunk interfeys (subinterfeyslar bilan)", "Ikkita", "Nol"], 1, "Bitta fizik port subinterfeyslar orqali bir nechta VLAN gateway bo‘lishi mumkin."],
  ["Access Control List (ACL) qanday vazifani bajaradi?", ["Trafikni shifrlaydi", "Shartlar bo‘yicha paketlarni ruxsat etadi yoki rad etadi", "VLAN yaratadi", "DNS’ni almashtiradi"], 1, "ACL manba/manzil/port shartlariga mos trafikni filtrlaydi."],
  ["OSPF protokoli qaysi toifaga kiradi?", ["Distance-vector", "Link-state", "Path-vector", "Static"], 1, "OSPF link-state protokoli bo‘lib, Dijkstra algoritmi orqali eng qisqa yo‘lni hisoblaydi."],
  ["NAT Overload (PAT) nima qiladi?", ["Har bir ichki IP’ga alohida tashqi IP beradi", "Ko‘p ichki manzilni bitta tashqi IP ostida port raqamlari bilan ajratadi", "IP manzilni o‘chiradi", "VLAN’ni o‘zgartiradi"], 1, "PAT port raqamlari yordamida bir nechta ichki xostni bitta tashqi IP orqali chiqaradi."],
  ["Cisco qurilmasiga xavfsiz masofaviy kirish uchun qaysi protokol tavsiya etiladi?", ["Telnet", "SSH", "FTP", "HTTP"], 1, "SSH trafikni shifrlaydi; Telnet ochiq matnda uzatadi va xavfli hisoblanadi."],
  ["Tarmoq nosozligini bartaraf etishda OSI modeli bo‘yicha qaysi qatlamdan boshlash tavsiya etiladi?", ["Application (7)", "Physical (1)", "Session (5)", "Presentation (6)"], 1, "Pastdan yuqoriga: avval fizik ulanish, kabel va port holatini tekshirish tavsiya etiladi."],
  ["EtherChannel/port-channel nima uchun ishlatiladi?", ["Bir nechta fizik linkni bitta mantiqiy yuqori o‘tkazuvchanlikli linkka birlashtirish uchun", "VLAN’ni o‘chirish uchun", "Faqat DNS uchun", "Faqat parol saqlash uchun"], 0, "Ko‘p linkni jamlash o‘tkazuvchanlikni oshiradi va alohida STP bloklashsiz zahira yo‘l beradi."],
  ["HSRP/VRRP protokollari nima uchun ishlatiladi?", ["Fayllarni siqish uchun", "Default gateway’ning zahira (redundancy) ishlashini ta’minlash uchun", "Faqat VLAN raqamlash uchun", "Faqat DHCP uchun"], 1, "Asosiy router ishdan chiqsa, zahira router virtual gateway IP’ni avtomatik egallaydi."],
  ["Cisco switch’da port security nima vazifani bajaradi?", ["Portga ulanishi mumkin bo‘lgan MAC manzillar sonini yoki ro‘yxatini cheklaydi", "Internet tezligini oshiradi", "VLAN’ni o‘chiradi", "DNS keshini tozalaydi"], 0, "Ruxsatsiz qurilma ulansa, port avtomatik yopilishi yoki ogohlantirish berishi mumkin."],
  ["Syslog serveriga Cisco qurilmasidan jurnal yuborish nima uchun tavsiya etiladi?", ["Diskni tejash uchun emas", "Markazlashgan tahlil va voqeadan keyin dalil saqlash uchun", "Faqat dizayn uchun", "Faqat litsenziya uchun"], 1, "Qurilma lokal xotirasi cheklangan; markaziy log serverida uzoq muddatli va tekshiruvga chidamli yozuv saqlanadi."],
  ["AAA (Authentication, Authorization, Accounting) Cisco qurilmalarida nimani ta’minlaydi?", ["Faqat internet tezligini", "Kim kirganini, nimaga ruxsati borligini va nima qilganini nazorat qilishni", "Faqat VLAN sonini", "Faqat kabel turini"], 1, "AAA markazlashgan autentifikatsiya, avtorizatsiya va hisobga olishni (masalan TACACS+/RADIUS orqali) ta’minlaydi."]
]);

const mikrotik = build("m", [
  ["MikroTik RouterOS’da IP manzil qo‘shish uchun qaysi menyu ishlatiladi?", ["/ip address add", "/interface bridge add", "/system identity set", "/ip firewall nat add"], 0, "/ip address add interfeysga IP manzil biriktiradi."],
  ["RouterOS’da standart yo‘l (default route) qanday belgilanadi?", ["dst-address=0.0.0.0/0 bilan", "dst-address=255.255.255.255 bilan", "Faqat DHCP orqali", "Faqat bridge orqali"], 0, "0.0.0.0/0 — har qanday manzilga mos keluvchi standart marshrutni bildiradi."],
  ["Winbox nima?", ["RouterOS’ni grafik boshqarish vositasi", "Fizik marshrutizator modeli", "Kabel turi", "Wi-Fi antenna turi"], 0, "Winbox — MikroTik qurilmalarini GUI orqali boshqarish dasturi."],
  ["RouterOS’da firewall qoidalari qaysi zanjir (chain) orqali kiruvchi trafikni tekshiradi?", ["output", "input", "srcnat", "dstnat (faqat)"], 1, "input — routerning o‘ziga qaratilgan trafik uchun ishlatiladigan asosiy zanjir."],
  ["Masquerade (NAT) qoidasi odatda qaysi zanjirda sozlanadi?", ["forward", "input", "srcnat", "output"], 2, "srcnat / masquerade LAN’dan WAN’ga chiquvchi trafik manbasini tarjima qiladi."],
  ["Bridge interfeysi nima uchun ishlatiladi?", ["Bir nechta portni bitta Layer 2 segmentga birlashtirish uchun", "IP manzilni o‘chirish uchun", "Faqat Wi-Fi kanalini o‘zgartirish uchun", "DNS serverini sozlash uchun"], 0, "Bridge bir nechta fizik/virtual portni bitta kommutatsiya domenida birlashtiradi."],
  ["RouterOS’da zaxira konfiguratsiya fayli qanday olinadi?", ["/system backup save", "/ip service print", "/interface print", "/system identity print"], 0, "backup save butun konfiguratsiyani faylga saqlaydi."],
  ["Queue (navbat) RouterOS’da nima uchun ishlatiladi?", ["Foydalanuvchilarga tezlikni cheklash/bo‘lish uchun", "IP manzil berish uchun", "VLAN yaratish uchun", "Parolni saqlash uchun"], 0, "Simple queue yoki queue tree orqali bandwidth boshqariladi."],
  ["RouterOS’ga xavfsiz masofaviy kirish uchun qaysi xizmatni o‘chirib qo‘yish tavsiya etiladi?", ["SSH", "Telnet va FTP", "Winbox (har doim)", "API (har doim)"], 1, "Telnet va FTP shifrlanmagan bo‘lgani uchun ishlatilmasa o‘chirilishi kerak."],
  ["RouterOS’da interfeys holatini tezkor tekshirish uchun qaysi buyruq qulay?", ["/interface print stats", "/ip address remove", "/system reset-configuration", "/ip firewall filter remove"], 0, "print stats interfeys trafigi va holatini ko‘rsatadi."],
  ["RouterOS’da standart admin foydalanuvchisining parolini o‘zgartirmaslik nima uchun xavfli?", ["Hech qanday xavf yo‘q", "Ma’lum standart login/parol internet skanerlari orqali tez topiladi va egallanadi", "Faqat tezlikni pasaytiradi", "Faqat Wi-Fi signalini zaiflashtiradi"], 1, "Standart credential’lar ommaviy ma’lum bo‘lgani uchun ularni darhol almashtirish shart."],
  ["RouterOS’da RouterOS versiyasini yangilashdan oldin nima qilish tavsiya etiladi?", ["Hech narsa qilmaslik", "Konfiguratsiya backup olish va release notes’ni o‘qib chiqish", "Darhol qayta yuklash", "Firewall qoidalarini o‘chirish"], 1, "Backup va release notes xatarli o‘zgarishlardan va nosozlikdan tez tiklanish imkonini beradi."],
  ["Wireless interfeysda \"security-profile\" nima uchun sozlanadi?", ["Faqat SSID nomini berish uchun", "Wi-Fi autentifikatsiya va shifrlash (masalan WPA2/WPA3) parametrlarini belgilash uchun", "Faqat kanal kengligini o‘zgartirish uchun", "Faqat IP manzil berish uchun"], 1, "Security profile WPA2/WPA3-PSK yoki enterprise autentifikatsiya va shifrlash turini belgilaydi."],
  ["RouterOS’da \"address-list\" firewall qoidalarida nima uchun qulay?", ["Bir nechta IP/tarmoqni nomli guruhga jamlab, qoidalarda qayta ishlatish uchun", "Faqat VLAN yaratish uchun", "Faqat DNS keshini tozalash uchun", "Faqat interfeys nomini o‘zgartirish uchun"], 0, "Address-list orqali qoidalarni soddalashtirish va keyinchalik yangilash osonlashadi."],
  ["RouterOS’da \"/system scheduler\" nima uchun ishlatiladi?", ["Faqat wireless signalini kuchaytirish uchun", "Belgilangan vaqtda avtomatik skript yoki buyruqni bajarish uchun", "Faqat IP manzilni o‘chirish uchun", "Faqat parolni unutish uchun"], 1, "Scheduler orqali backup olish yoki monitoring skriptlari muntazam avtomatik ishga tushiriladi."]
]);

const firewall = build("f", [
  ["Host-based firewall nimani boshqaradi?", ["Butun tarmoq segmentini", "Faqat bitta qurilmaning kiruvchi/chiquvchi trafigini", "Faqat internet provayderini", "Faqat Wi-Fi kanalini"], 1, "Host firewall (masalan Windows Defender Firewall) bitta qurilma darajasida ishlaydi."],
  ["Stateful firewall stateless’dan nima bilan farq qiladi?", ["Farqi yo‘q", "Stateful sessiya holatini kuzatib, qaytish paketlarini avtomatik taniydi", "Stateless tezroq shifrlaydi", "Stateful faqat UDP uchun ishlaydi"], 1, "Stateful firewall ulanish holatini (connection table) saqlab, mos qaytish trafigini ruxsat beradi."],
  ["DMZ (Demilitarized Zone) nima uchun ajratiladi?", ["Ichki foydalanuvchilarni tezlashtirish uchun", "Internetga ochiq xizmatlarni ichki LAN’dan ajratib himoyalash uchun", "Faqat zaxira saqlash uchun", "Wi-Fi mehmon tarmog‘i uchun emas"], 1, "DMZ buzilgan ochiq server orqali to‘g‘ridan-to‘g‘ri ichki tarmoqqa kirishni cheklaydi."],
  ["Eng kam ruxsat (least privilege) qoidasi firewall siyosatida nimani anglatadi?", ["Hammaga hammasini ruxsat berish", "Faqat zarur manba, manzil va xizmatga ruxsat berish, qolganini rad etish", "Faqat portlarni yopish", "Faqat VPN ishlatish"], 1, "Qoidalar aniq, tor va asosli bo‘lishi kerak — \"deny by default, allow by exception\"."],
  ["Web Application Firewall (WAF) nimani tekshiradi?", ["Faqat IP manzilni", "HTTP(S) so‘rov tarkibini ilova qoidalariga mosligini", "Faqat MAC manzilni", "Faqat DNS so‘rovlarini"], 1, "WAF ilova qatlamidagi hujum naqshlarini (SQLi, XSS va h.k.) aniqlaydi."],
  ["Intrusion Prevention System (IPS) firewall bilan birgalikda nimani qo‘shadi?", ["Faqat statistikani", "Ma’lum hujum signaturalarini aniqlab, avtomatik bloklashni", "Faqat parol boshqaruvini", "Faqat backup xizmatini"], 1, "IPS signatura/anomaliya asosida hujumni real vaqtda aniqlaydi va to‘xtatadi."],
  ["High Availability (HA) firewall klasteri nima uchun kerak?", ["Tezlikni oshirish uchun emas, xizmat uzluksizligini ta’minlash uchun", "Faqat narxni oshirish uchun", "Faqat jurnal hajmini kamaytirish uchun", "Faqat litsenziya uchun"], 0, "Asosiy qurilma ishdan chiqsa, zaxira avtomatik davom ettiradi (failover)."],
  ["Firewall qoidalarini davriy audit qilish nima uchun muhim?", ["Eskirgan va keraksiz ruxsatlarni topish uchun", "Faqat hisobot uchun", "Internetni tezlashtirish uchun", "Parolni unutmaslik uchun"], 0, "Vaqt o‘tishi bilan keraksiz \"vaqtincha\" qoidalar qolib, xavf oshiradi (rule creep)."],
  ["SIEM tizimi firewall jurnallari bilan nima qiladi?", ["Ularni darhol o‘chiradi", "Boshqa manba loglari bilan korrelyatsiya qilib, hodisani aniqlaydi", "Faqat ularni arxivlaydi", "Faqat chop etadi"], 1, "SIEM turli manba loglarini birlashtirib, murakkab hujum zanjirini aniqlashga yordam beradi."],
  ["VPN orqali ulangan foydalanuvchiga ham firewall siyosati qo‘llanishi kerakmi?", ["Yo‘q, VPN avtomatik to‘liq ishonchli", "Ha, tunnel ichidagi trafik ham rolga mos siyosat bilan cheklanishi kerak", "Faqat administratorlar uchun kerak", "Faqat mehmon tarmog‘i uchun kerak"], 1, "Zero trust tamoyiliga ko‘ra, VPN ulanish shunchaki tarmoqqa kirish, u avtomatik to‘liq huquq bermaydi."],
  ["Egress (chiquvchi) filtrlash nima uchun muhim?", ["Faqat kiruvchi trafikni tekshirish kifoya", "Buzilgan ichki xostning tashqariga ma’lumot chiqarishi yoki C2 bilan aloqasini cheklash uchun", "Faqat internet tezligini oshirish uchun", "Faqat litsenziya uchun"], 1, "Faqat kiruvchi trafikka e’tibor berish kompromis bo‘lgan xostning tashqi aloqasini nazoratsiz qoldiradi."],
  ["Firewall qoidalarida \"implicit deny\" nimani anglatadi?", ["Hamma trafik avtomatik ruxsat etiladi", "Aniq ruxsat etilmagan trafik sukut bo‘yicha rad etiladi", "Faqat UDP rad etiladi", "Faqat ichki trafik rad etiladi"], 1, "Ro‘yxat oxirida aniq ruxsat topilmagan trafik avtomatik bloklanadi — xavfsiz standart holat."],
  ["Firewall siyosatini o‘zgartirishdan oldin test (change management) jarayoni nima uchun kerak?", ["Hech qanday sabab yo‘q", "Kutilmagan xizmat uzilishi yoki xavfsizlik bo‘shlig‘ini oldini olish uchun", "Faqat hujjat uchun", "Faqat narxni oshirish uchun"], 1, "Tasdiqlanmagan o‘zgarish ishlab chiqarish xizmatini to‘xtatishi yoki nazoratsiz teshik ochishi mumkin."],
  ["NGFW (Next-Generation Firewall) an’anaviy firewall’dan nimasi bilan farq qiladi?", ["Faqat tezroq ishlaydi", "Ilova darajasida tahlil, IPS va foydalanuvchi/identity asoslangan siyosatni qo‘shadi", "Faqat arzonroq", "Faqat Wi-Fi qo‘llab-quvvatlaydi"], 1, "NGFW port/protokoldan tashqari ilova, foydalanuvchi va tahdid razvedkasi asosida qaror qabul qiladi."],
  ["Stateful firewall stateless firewall’dan nimasi bilan farq qiladi?", ["Farqi yo‘q", "Stateful ulanish holatini kuzatib, faqat mos javob trafikka ruxsat beradi", "Stateless tezroq va xavfsizroq", "Stateful faqat UDP’ni qo‘llab-quvvatlaydi"], 1, "Stateful firewall ulanish jadvalini saqlab, faqat ochilgan sessiyaga tegishli javob trafigini o‘tkazadi."]
]);

const kerio = build("k", [
  ["Kerio Control’da WAN interfeysi qanday zonani anglatadi?", ["Ichki ishonchli tarmoq", "Internet provayderiga qaragan tashqi interfeys", "Faqat admin kirishi", "Faqat VPN tunnel"], 1, "WAN — tashqi, ishonchsiz tarmoqqa chiquvchi interfeys."],
  ["Kerio’da konfiguratsiyani o‘zgartirishdan oldin nima qilish tavsiya etiladi?", ["Hech narsa qilmaslik", "Joriy konfiguratsiyadan zaxira (backup) olish", "Barcha qoidalarni o‘chirish", "Internetni o‘chirish"], 1, "Zaxira nusxa xato sozlashda tezkor tiklanish imkonini beradi."],
  ["Kerio’da Source NAT (masquerade) nima uchun ishlatiladi?", ["Ichki manzilni WAN chiqishida tashqi manzilga tarjima qilish uchun", "DNS’ni o‘zgartirish uchun", "VLAN yaratish uchun", "Parolni xeshlash uchun"], 0, "LAN’dagi private manzillar internetga chiqishda WAN IP orqali tarjima qilinadi."],
  ["Port mapping (DNAT) Kerio’da nima qiladi?", ["Tashqi so‘rovni ichki serverga yo‘naltiradi", "Ichki trafikni butunlay bloklaydi", "Faqat VPN uchun ishlatiladi", "Faqat DNS uchun ishlatiladi"], 0, "Tashqi port ichki DMZ serverining aniq portiga yo‘naltiriladi."],
  ["Kerio’da web filtrlash (content filtering) nimani boshqaradi?", ["Faqat IP manzillarni", "Veb-saytlarni toifa yoki URL bo‘yicha cheklashni", "Faqat parolni", "Faqat VLAN’ni"], 1, "Web filter toifalar (masalan ijtimoiy tarmoq, qimor) bo‘yicha kirishni cheklaydi."],
  ["VPN orqali ulangan foydalanuvchini qo‘shimcha tasdiqlash uchun qaysi omil tavsiya etiladi?", ["Faqat parol", "Ko‘p faktorli autentifikatsiya (MFA)", "Faqat login nomi", "Hech qanday qo‘shimcha omil"], 1, "MFA parol o‘g‘irlansa ham, qo‘shimcha himoya qatlamini beradi."],
  ["Kerio jurnali (log) nosozlikni aniqlashda nima uchun muhim?", ["Faqat statistikani ko‘rsatish uchun", "Qaysi qoida ishlagani va trafik yo‘lini dalil bilan ko‘rsatish uchun", "Faqat disk joyini band qilish uchun", "Faqat dizayn uchun"], 1, "Log yozuvlari qoida ID, manba/manzil va harakatni (allow/deny) ko‘rsatadi."],
  ["Kerio’da yangilanishni (update) o‘rnatishdan oldin nima qilish kerak?", ["Darhol o‘rnatish", "Backup olish va tasdiqlangan oyna (change window) rejalashtirish", "Hech qanday tayyorgarlik kerak emas", "Faqat qayta yuklash"], 1, "Rejalangan va sinovdan o‘tgan yangilash nosozlik xavfini kamaytiradi."],
  ["Kerio’da zonalararo (WAN-LAN-DMZ) trafik qanday tartibga solinadi?", ["Avtomatik, qoidasiz", "Siyosat (policy) qoidalari orqali, zonaga mos ruxsat bilan", "Faqat fizik kabel bilan", "Faqat DNS orqali"], 1, "Har bir zona orasidagi trafik uchun aniq siyosat qoidasi belgilanadi."],
  ["Eng kam ruxsat tamoyili Kerio siyosatida qanday qo‘llaniladi?", ["Hamma narsaga ruxsat berib qo‘yiladi", "Faqat zarur manba/manzil/portga ruxsat, qolgani rad etiladi", "Faqat admin uchun qo‘llaniladi", "Faqat VPN uchun qo‘llaniladi"], 1, "Qoidalar tor va asoslangan bo‘lishi kerak, keraksiz ruxsat berilmaydi."],
  ["Kerio Control’da bandwidth limiter nima uchun ishlatiladi?", ["Foydalanuvchi/guruh uchun internet tezligini cheklash yoki ustuvorlashtirish uchun", "Firewall qoidalarini o‘chirish uchun", "Faqat VPN tunnelini o‘chirish uchun", "Faqat DNS’ni o‘zgartirish uchun"], 0, "Bandwidth management muhim xizmatlar (masalan VoIP)ga ustuvorlik berib, boshqa trafikni cheklashi mumkin."],
  ["Kerio’da ikki xil internet provayderi (ISP) bilan ishlashda nima qo‘llaniladi?", ["Faqat bitta ISP ishlatiladi", "Load balancing yoki failover (zaxira kanal)", "Faqat VLAN", "Faqat DHCP"], 1, "Bir nechta WAN link orqali yuklamani taqsimlash yoki uzilishda avtomatik almashish mumkin."],
  ["Kerio’da admin kirish konsoliga (administration) kirishni cheklash nima uchun muhim?", ["Hech qanday ahamiyati yo‘q", "Faqat ishonchli IP/tarmoqdan boshqaruvga ruxsat berib, hujum yuzasini kamaytirish uchun", "Faqat dizayn uchun", "Faqat tezlik uchun"], 1, "Boshqaruv panelini ochiq qoldirish butun tarmoq konfiguratsiyasini xavf ostiga qo‘yadi."],
  ["Kerio’da IPS (Intrusion Prevention System) modulini yoqish nima beradi?", ["Faqat statistik hisobot", "Ma’lum hujum signaturalarini real vaqtda aniqlab bloklash", "Faqat web filtrlash", "Faqat bandwidth cheklash"], 1, "IPS trafikni imzolar bo‘yicha tekshirib, hujum aniqlansa ulanishni to‘xtatadi."],
  ["Kerio’da VPN tunnel turlari orasida IPsec saytlararo (site-to-site) ulanish nima uchun ishlatiladi?", ["Faqat bitta foydalanuvchi uchun", "Ikki ofis tarmog‘ini xavfsiz va doimiy shifrlangan kanal bilan birlashtirish uchun", "Faqat DNS almashish uchun", "Faqat web filtrlash uchun"], 1, "Site-to-site VPN ikki filial tarmog‘ini xuddi bitta tarmoqdek ishlatish imkonini beradi."]
]);

const cctv = build("v", [
  ["IP kamera analog kameradan nima bilan farq qiladi?", ["IP kamera tasvirni tarmoq orqali raqamli uzatadi", "IP kamera faqat tungi rejimda ishlaydi", "Analog kamera tezroq", "Farqi yo‘q"], 0, "IP kamera Ethernet/Wi-Fi orqali raqamli oqim uzatadi, analog esa koaksial kabel orqali signal beradi."],
  ["PoE (Power over Ethernet) nima uchun qulay?", ["Kamera uchun alohida elektr kabeli kerak emasligi uchun", "Tasvir sifatini oshiradi", "Faqat Wi-Fi tezligini oshiradi", "Faqat ovoz sifatini yaxshilaydi"], 0, "Bitta Ethernet kabeli orqali ham quvvat, ham ma’lumot uzatiladi."],
  ["Video saqlash hajmini hisoblashda qaysi omil majburiy?", ["Faqat kamera rangi", "Bitrate va saqlash muddati (retention)", "Faqat IP manzil soni", "Faqat Wi-Fi signali"], 1, "Hajm = bitrate × vaqt × kamera soni; saqlash muddati (masalan 30 kun) asosiy omil."],
  ["NVR (Network Video Recorder) nima vazifani bajaradi?", ["Faqat elektr ta’minoti", "IP kameralardan video oqimni yozib, saqlaydi", "Faqat Wi-Fi marshrutizatori", "Faqat DNS serveri"], 1, "NVR tarmoq kameralaridan kelgan oqimni qabul qilib, diskka yozadi."],
  ["Kameralarni alohida VLAN’ga ajratish nima uchun tavsiya etiladi?", ["Tasvir sifatini oshirish uchun", "Xavfsizlik uchun — kamera buzilsa ham asosiy tarmoqqa kirish cheklanadi", "Narxni kamaytirish uchun", "Faqat dizayn uchun"], 1, "Segmentatsiya IoT/kamera qurilmalari orqali lateral harakatni cheklaydi."],
  ["Maxfiylik nuqtai nazaridan kamera joylashtirishda nimaga e’tibor berish kerak?", ["Faqat narx", "Jamoat joylari va shaxsiy hudud (masalan qo‘shni hovlisi) chegarasi", "Faqat rang", "Faqat model raqami"], 1, "Qonuniy va etik talablarga ko‘ra kamera shaxsiy hududni suratga olmasligi kerak."],
  ["Standart kamera parolini o‘zgartirmaslik qanday xavf tug‘diradi?", ["Hech qanday xavf yo‘q", "Botnet yoki tashqi hujumchi tomonidan oson egallanishi mumkin", "Faqat tasvir sifati pasayadi", "Faqat elektr sarfi oshadi"], 1, "Standart login/parol bilan qoldirilgan kameralar internet skanerlari tomonidan tez topiladi."],
  ["Kamera tarmog‘ini uzoqdan (remote) ko‘rish uchun eng xavfsiz usul qaysi?", ["Portni to‘g‘ridan-to‘g‘ri internetga ochish", "VPN orqali ulanish", "Standart parol bilan ochiq qoldirish", "Faqat HTTP ishlatish"], 1, "VPN trafikni shifrlaydi va kamera tizimini to‘g‘ridan-to‘g‘ri internetga ochishdan saqlaydi."],
  ["Kamera qamrovini rejalashtirishda \"o‘lik zona\" (blind spot) nima?", ["Kamera yaxshi ko‘radigan joy", "Hech qaysi kamera ko‘rmaydigan nazoratsiz hudud", "Faqat tungi rejim", "Faqat Wi-Fi zonasi"], 1, "Blind spot — joylashtirish xatosi tufayli nazoratsiz qolgan hudud."],
  ["CCTV tizimida jurnal (log) va vaqt tamg‘asi (timestamp) nima uchun muhim?", ["Faqat dizayn uchun", "Voqea vaqtini aniq tasdiqlash va tergovda dalil sifatida ishlatish uchun", "Faqat disk hajmini kamaytirish uchun", "Faqat tasvir ranggini sozlash uchun"], 1, "Aniq vaqt tamg‘asisiz video dalil sifatida ishonchliligini yo‘qotishi mumkin."],
  ["Video analitika (video analytics) tizimi nima qila oladi?", ["Faqat videoni siqadi", "Harakatni aniqlash, chiziqni kesib o‘tish yoki ob’ekt sanashni avtomatlashtiradi", "Faqat parolni saqlaydi", "Faqat elektr sarfini kamaytiradi"], 1, "AI asosidagi analitika operatorga muhim hodisalarni avtomatik ajratib ko‘rsatishga yordam beradi."],
  ["Kamera tizimida parvarish (maintenance) rejasiga nima kiradi?", ["Faqat bir martalik o‘rnatish", "Linza tozalash, mikrofayl/firmware yangilash va saqlash hajmini tekshirish", "Faqat rangni o‘zgartirish", "Faqat Wi-Fi parolini unutish"], 1, "Muntazam parvarishsiz tasvir sifati pasayadi va zaifliklar yamalanmay qoladi."],
  ["Ma’lumotlarni saqlash muddati (retention policy) nimaga asoslanib belgilanadi?", ["Faqat disk narxiga", "Qonuniy talablar, tashkilot siyosati va tergov ehtiyojiga", "Faqat kamera rangiga", "Faqat Wi-Fi tezligiga"], 1, "Retention muddati huquqiy va amaliy talablarga mos tanlanishi kerak, juda qisqa yoki ortiqcha uzun bo‘lmasligi lozim."],
  ["CCTV tizimiga kirish huquqlarini (kim video ko‘ra oladi) cheklash nima uchun muhim?", ["Hech qanday ahamiyati yo‘q", "Shaxsiy ma’lumotni muhofaza qilish va ruxsatsiz kuzatuvning oldini olish uchun", "Faqat disk joyi uchun", "Faqat dizayn uchun"], 1, "Video material shaxsiy ma’lumot hisoblanadi; faqat vakolatli xodim ko‘rishi va bu audit qilinishi kerak."],
  ["CCTV tarmog‘ida kamerani masofadan boshqarish (remote firmware update) nima uchun muammoli bo‘lishi mumkin?", ["Hech qanday muammo yo‘q", "Ishonchsiz manbadan zararli firmware yuklanishi yoki yangilanish uzilib qolsa qurilma ishdan chiqishi mumkin", "Faqat rangni o‘zgartiradi", "Faqat tezlikni oshiradi"], 1, "Firmware yangilanishi faqat ishlab chiqaruvchining rasmiy manbasidan va nazoratli tarzda amalga oshirilishi kerak."]
]);

const windowsFund = build("w", [
  ["Windows’da foydalanuvchi ruxsatlarini boshqarish uchun asosiy vosita nima?", ["Device Manager", "Local Users and Groups / Active Directory", "Disk Cleanup", "Task Scheduler"], 1, "Foydalanuvchi va guruh a’zoligi orqali ruxsatlar boshqariladi."],
  ["Windows Firewall’da \"Public\" profili odatda qanday tarmoqda qo‘llaniladi?", ["Uy yoki ofis ishonchli tarmog‘ida", "Kafe, aeroport kabi ishonchsiz ommaviy tarmoqda", "Faqat domen tarmog‘ida", "Faqat VPN’da"], 1, "Public profilda qattiqroq cheklovlar qo‘llanadi, chunki tarmoq ishonchsiz hisoblanadi."],
  ["Windows’da xavfsizlik hodisalari qayerda qayd etiladi?", ["Disk Management", "Event Viewer — Security log", "Control Panel", "Task Manager"], 1, "Security log kirish, chiqish va audit hodisalarini saqlaydi."],
  ["BitLocker nima uchun ishlatiladi?", ["Internetni tezlashtirish uchun", "Disk ma’lumotlarini shifrlash uchun", "Fayllarni siqish uchun", "Printer sozlash uchun"], 1, "BitLocker butun diskni shifrlab, o‘g‘irlangan qurilmadan ma’lumot o‘qilishini oldini oladi."],
  ["Windows Update’ni muntazam o‘rnatish nima uchun muhim?", ["Dizaynni yangilash uchun", "Ma’lum xavfsizlik zaifliklarini yopish uchun", "Diskni tozalash uchun", "Shrift o‘zgartirish uchun"], 1, "Ko‘p hujumlar allaqachon ma’lum, yamoqlanmagan zaifliklarga qaratiladi."],
  ["User Account Control (UAC) nima qiladi?", ["Internetni bloklaydi", "Administrator huquqi talab qiluvchi amallarda tasdiq so‘raydi", "Faylni siqadi", "Printerni boshqaradi"], 1, "UAC zararli dastur sukut bo‘yicha administrator huquqiga ega bo‘lishini qiyinlashtiradi."],
  ["Windows’da xizmatlarni (services) boshqarish uchun qaysi vosita ishlatiladi?", ["services.msc", "notepad.exe", "calc.exe", "paint.exe"], 0, "services.msc orqali xizmatlarni ishga tushirish, to‘xtatish va sozlash mumkin."],
  ["Guest (mehmon) hisobini yoqib qo‘yish nima uchun xavfli?", ["Hech qanday xavf yo‘q", "Autentifikatsiyasiz yoki kam nazoratli kirish imkonini beradi", "Faqat disk joyini band qiladi", "Faqat rang sxemasini o‘zgartiradi"], 1, "Guest hisobi ko‘pincha kam nazorat bilan tizimga kirish imkonini beradi, shuning uchun odatda o‘chiriladi."],
  ["Windows’da fayl/papka ruxsatlarini tekshirish uchun qaysi oyna ishlatiladi?", ["Properties → Security", "Properties → Details faqat", "Device Manager", "Disk Cleanup"], 0, "Security tab orqali NTFS ruxsatlari (read/write/full control) ko‘riladi va sozlanadi."],
  ["Zaxira nusxalash (backup) siyosatida 3-2-1 qoidasi nimani anglatadi?", ["3 ta parol, 2 ta login, 1 ta server", "3 nusxa, 2 xil muhit, 1 tasi uzoqda (offsite)", "3 soat, 2 kun, 1 hafta", "Hech narsani"], 1, "3 nusxa ma’lumot, 2 xil saqlash muhiti, kamida 1 nusxa boshqa joyda saqlanishi tavsiya etiladi."],
  ["Windows’da Group Policy (GPO) nima uchun ishlatiladi?", ["Faqat fon rasmini o‘zgartirish uchun", "Ko‘plab kompyuterlarga markazlashgan siyosat va sozlamalarni qo‘llash uchun", "Faqat printer o‘rnatish uchun", "Faqat disk tozalash uchun"], 1, "GPO orqali parol siyosati, dastur cheklovlari va xavfsizlik sozlamalari butun domenga qo‘llaniladi."],
  ["Windows Defender’da \"real-time protection\"ni o‘chirib qo‘yish nima uchun xavfli?", ["Hech qanday xavf yo‘q", "Zararli dasturlar fon rejimida aniqlanmasdan ishga tushishi mumkin", "Faqat tezlikni oshiradi", "Faqat disk joyini bo‘shatadi"], 1, "Real-time himoya o‘chirilsa, zararli fayl ishga tushishidan oldin aniqlanmaydi."],
  ["Windows’da \"Least Privilege\" tamoyiliga ko‘ra kundalik ishlar uchun qaysi hisob turi tavsiya etiladi?", ["Administrator hisobi", "Oddiy (standard) foydalanuvchi hisobi", "Guest hisobi", "SYSTEM hisobi"], 1, "Administrator huquqi faqat zarur bo‘lgandagina (UAC orqali) ishlatilishi kerak, kundalik ish uchun emas."],
  ["Windows’da fayl tizimi integrligini va ruxsatsiz o‘zgarishlarni nazorat qilish uchun qanday yondashuv ishlatiladi?", ["Hech qanday nazorat kerak emas", "Audit siyosati va fayl integrligi monitoringi (FIM)", "Faqat ekran himoyachisi", "Faqat fon rasmi"], 1, "Audit log va FIM kritik fayllardagi ruxsatsiz o‘zgarishlarni aniqlashga yordam beradi."],
  ["Windows tizimida xizmat (service) hisobiga administrator huquqini berishdan saqlanish nima uchun muhim?", ["Hech qanday sabab yo‘q", "Xizmat buzilgan taqdirda hujumchi butun tizimga to‘liq huquq olmasligi uchun", "Faqat tezlik uchun", "Faqat dizayn uchun"], 1, "Eng kam imtiyoz tamoyili xizmat kompromis bo‘lganda zararni cheklaydi."]
]);

export const learningExams: ExamDef[] = [
  {
    slug: "tec-network-foundations",
    title: "Tecsecure Network Foundations",
    credential: "Tecsecure Certified Network Foundations",
    acronym: "TCNF",
    accent: "#3aa9ff",
    summary: "Tarmoq asoslari: OSI, IP, subnet, DNS/DHCP, VLAN, NAT.",
    feeTec: 100,
    minutes: 30,
    passPercent: 70,
    requiredModules: ["network-fundamentals"],
    requiredLabs: ["subnet-vlsm-office"],
    topics: ["OSI va TCP/IP", "IP va subnet", "L2/L3 qurilmalar", "DNS, DHCP, NAT, VLAN"],
    questions: network
  },
  {
    slug: "tec-linux-security-foundations",
    title: "Tecsecure Linux & Security Foundations",
    credential: "Tecsecure Certified Linux & Security Foundations",
    acronym: "TCLS",
    accent: "#3ddc84",
    summary: "Linux asoslari va kiberxavfsizlik tamoyillari.",
    feeTec: 120,
    minutes: 30,
    passPercent: 70,
    requiredModules: ["linux-fundamentals", "intro-cybersecurity"],
    requiredLabs: ["linux-permissions-audit"],
    topics: ["Ruxsatlar va akkauntlar", "Eng kam huquq", "CIA va MFA", "SSH va yangilanishlar"],
    questions: linux
  },
  {
    slug: "tec-soc-foundations",
    title: "Tecsecure SOC Foundations",
    credential: "Tecsecure Certified SOC Foundations",
    acronym: "TCSF",
    accent: "#ff5a4d",
    summary: "Log tahlili, hodisalarni aniqlash va javob berish asoslari.",
    feeTec: 180,
    minutes: 40,
    passPercent: 70,
    requiredModules: ["soc-log-analysis"],
    requiredLabs: ["ssh-bruteforce-auth-log", "windows-password-spray"],
    topics: ["Windows va Linux loglari", "Brute-force va spray", "SIEM va IOC", "Incident response"],
    questions: soc
  },
  {
    slug: "tec-web-security-owasp",
    title: "Tecsecure Web Security (OWASP)",
    credential: "Tecsecure Certified Web Security Associate",
    acronym: "TCWS",
    accent: "#a855f7",
    summary: "OWASP Top 10: injection, XSS, CSRF, buzilgan autentifikatsiya va xavfsiz kod yozish asoslari.",
    feeTec: 150,
    minutes: 35,
    passPercent: 70,
    requiredModules: ["web-security-owasp"],
    requiredLabs: ["web-sqli-access-log"],
    topics: ["OWASP Top 10", "Injection va XSS", "CSRF va sessiya xavfsizligi", "Xavfsiz kod yozish"],
    questions: owasp
  },
  {
    slug: "tec-active-directory-security",
    title: "Tecsecure Active Directory Security",
    credential: "Tecsecure Certified Active Directory Security Specialist",
    acronym: "TCAD",
    accent: "#38bdf8",
    summary: "AD tuzilishi, Kerberos, GPO, eng kam huquq va tipik AD hujumlaridan himoya.",
    feeTec: 180,
    minutes: 40,
    passPercent: 70,
    requiredModules: ["active-directory-security"],
    requiredLabs: ["active-directory-privileged-access-review"],
    topics: ["AD forest/domain/OU", "Kerberos autentifikatsiya", "Group Policy", "Imtiyozli kirishni himoyalash"],
    questions: activeDirectory
  },
  {
    slug: "tec-cisco-ios-fundamentals",
    title: "Tecsecure Cisco IOS Fundamentals",
    credential: "Tecsecure Certified Cisco IOS Associate",
    acronym: "TCIOS",
    accent: "#f97316",
    summary: "Cisco IOS CLI, VLAN/trunk, STP, marshrutlash va ACL asoslari.",
    feeTec: 150,
    minutes: 35,
    passPercent: 70,
    requiredModules: ["cisco-ios-fundamentals"],
    requiredLabs: ["cisco-ios-vlan-evidence-review"],
    topics: ["IOS CLI rejimlari", "VLAN va trunk", "STP va marshrutlash", "ACL va NAT"],
    questions: cisco
  },
  {
    slug: "tec-mikrotik-routeros",
    title: "Tecsecure MikroTik RouterOS",
    credential: "Tecsecure Certified RouterOS Associate",
    acronym: "TCROS",
    accent: "#22c55e",
    summary: "RouterOS CLI/Winbox, IP, NAT, bridge, firewall va navbatlash (queue) asoslari.",
    feeTec: 140,
    minutes: 35,
    passPercent: 70,
    requiredModules: ["mikrotik-routeros-basics"],
    requiredLabs: ["mikrotik-config-review"],
    topics: ["RouterOS asoslari", "NAT va bridge", "Firewall zanjirlari", "Queue va monitoring"],
    questions: mikrotik
  },
  {
    slug: "tec-firewall-fundamentals",
    title: "Tecsecure Firewall Zero to Hero",
    credential: "Tecsecure Certified Firewall Associate",
    acronym: "TCFW",
    accent: "#ef4444",
    summary: "Host/network firewall, stateful inspeksiya, DMZ, WAF/IPS va HA asoslari.",
    feeTec: 160,
    minutes: 35,
    passPercent: 70,
    requiredModules: ["firewall-zero-to-hero"],
    requiredLabs: ["firewall-ruleset-review"],
    topics: ["Firewall turlari", "Stateful inspeksiya", "DMZ va segmentatsiya", "WAF, IPS va HA"],
    questions: firewall
  },
  {
    slug: "tec-kerio-control",
    title: "Tecsecure Kerio Control Zero to Hero",
    credential: "Tecsecure Certified Kerio Control Associate",
    acronym: "TCKC",
    accent: "#eab308",
    summary: "Kerio Control zonalari, NAT, web filter, VPN va siyosat auditi.",
    feeTec: 160,
    minutes: 35,
    passPercent: 70,
    requiredModules: ["kerio-control-zero-to-hero"],
    requiredLabs: ["kerio-policy-order-review"],
    topics: ["Kerio zonalari", "NAT va port mapping", "Web filter va VPN", "Siyosat auditi"],
    questions: kerio
  },
  {
    slug: "tec-cctv-system-design",
    title: "Tecsecure CCTV System Design",
    credential: "Tecsecure Certified CCTV Design Associate",
    acronym: "TCCCTV",
    accent: "#14b8a6",
    summary: "IP kameralar, PoE, saqlash hajmi hisobi, tarmoq segmentatsiyasi va maxfiylik.",
    feeTec: 130,
    minutes: 30,
    passPercent: 70,
    requiredModules: ["cctv-system-design"],
    requiredLabs: ["cctv-capacity-and-privacy-plan"],
    topics: ["IP kamera va PoE", "Saqlash hajmi hisobi", "Tarmoq segmentatsiyasi", "Maxfiylik va huquqiy talablar"],
    questions: cctv
  },
  {
    slug: "tec-windows-fundamentals",
    title: "Tecsecure Windows Fundamentals",
    credential: "Tecsecure Certified Windows Associate",
    acronym: "TCWIN",
    accent: "#60a5fa",
    summary: "Windows foydalanuvchi/guruh boshqaruvi, firewall profili, BitLocker va audit asoslari.",
    feeTec: 120,
    minutes: 30,
    passPercent: 70,
    requiredModules: ["windows-fundamentals"],
    requiredLabs: ["windows-baseline-review"],
    topics: ["Foydalanuvchi va guruhlar", "Firewall profillari", "BitLocker va UAC", "Zaxiralash siyosati"],
    questions: windowsFund
  }
];

export const getExam = (slug: string) => learningExams.find((exam) => exam.slug === slug);

export function toPublicQuestions(exam: ExamDef): PublicExamQuestion[] {
  return exam.questions.map(({ id, text, options }) => ({ id, text, options }));
}

export function gradeExam(exam: ExamDef, answers: Record<string, number>) {
  const results = exam.questions.map((question) => ({ id: question.id, correct: answers[question.id] === question.correct }));
  const correctCount = results.filter((result) => result.correct).length;
  const scorePercent = Math.round((correctCount / exam.questions.length) * 100);
  return { results, correctCount, scorePercent, passed: scorePercent >= exam.passPercent };
}
