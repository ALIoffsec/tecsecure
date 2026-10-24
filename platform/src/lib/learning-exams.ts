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
