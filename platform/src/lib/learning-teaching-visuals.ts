import type { LearningDiagram, LearningSection, Localized } from "@/lib/learning-demo";

const l = (value: string): Localized => ({ uz: value, ru: value, en: value });

const flow = (caption: string, nodes: string[], links: string[]): LearningDiagram => ({
  kind: "topology",
  caption: l(caption),
  nodes: nodes.map(l),
  links: links.map(l)
});

export const learningTeachingVisuals: Record<string, Record<number, LearningDiagram>> = {
  "firewall-zero-to-hero": {
    0: flow("Firewall himoyasi bir nuqtada emas: hostdan tarmoq va ilovagacha qatlamlar birga ishlaydi.", ["Qurilma\nhost firewall", "Tarmoq\nNGFW", "Ilova\nWAF / API", "Cloud\nsecurity group", "Provider\nedge / DDoS"], ["qurilmada", "segmentda", "workload’da", "internet chetida"]),
    1: flow("Firewall paket xususiyatlarini siyosat bilan solishtiradi; stateful qurilma sessiya holatini ham hisobga oladi.", ["Paket\nIP / port", "Qoida\nmanba-maqsad", "Sessiya\nstate table", "Qaror\nallow / deny", "Jurnal\nrule ID"], ["talaffuz", "moslashtir", "qaror qil", "qayd et"]),
    2: flow("Yaxshi qoida aktiv, manba, manzil va xizmatni aniq belgilaydi va egaga bog‘lanadi.", ["Aktiv\nehtiyoj", "Manba\nkim?", "Maqsad\nqayerga?", "Xizmat\nqaysi port?", "Tasdiq\nowner + muddat"], ["aniqla", "chegarala", "toraytir", "tasdiqla"]),
    3: flow("Windows profili tanlanadi, faol qoida tekshiriladi va natija audit jurnalida kuzatiladi.", ["Windows\nnetwork profile", "Domain /\nPrivate / Public", "Firewall\ninbound rule", "Harakat\nallow / block", "Event log\ntekshiruv"], ["tasnifla", "qo‘llanadi", "natija", "kuzat"]),
    4: flow("Linux’da nftables netfilter’ga qoidalar beradi; UFW/firewalld faqat boshqaruv qatlami bo‘lishi mumkin.", ["Ilova\nsocket", "Netfilter\nkernel", "nftables\nchain", "Rule match\nIP / port", "Verdict\naccept / drop"], ["paket yo‘li", "qoidalar", "tekshir", "yakun"]),
    5: flow("Zonalar orasida faqat zarur yo‘l ochiladi; DMZ ichki tarmoqni himoyalash uchun ajratiladi.", ["Internet\nuntrusted", "Firewall\npolicy", "DMZ\npublic service", "Backend\nspecific port", "LAN\ninternal users"], ["chegara", "ruxsatli", "tor oqim", "ajratilgan"]),
    6: flow("NGFW tarmoq manzilidan tashqari ilova, foydalanuvchi va threat signallarini baholashi mumkin.", ["Trafik\nsession", "App ID\nilova", "Identity\nfoydalanuvchi", "IPS\nsignatura", "Qaror\npolicy"], ["kontekst", "bog‘la", "tekshir", "enforce"]),
    7: flow("WAF HTTP(S) so‘rovini tekshiradi, keyin ruxsat etilgan trafik web ilovaga uzatiladi.", ["Brauzer\nHTTP(S)", "Edge / TLS\nqabul", "WAF\nrequest rules", "Web app\nendpoint", "Audit\nalert / log"], ["so‘rov", "tahlil", "allow", "qayd"]),
    8: flow("Cloud trafik bir nechta qatlamdan o‘tadi; qaysi qoida ishlaganini route va log bilan aniqlang.", ["Internet\nsource", "VPC/VNet\nsecurity group", "Subnet\nNACL / route", "Cloud FW\npolicy", "Workload\nflow log"], ["ingress", "subnet", "inspeksiya", "telemetriya"]),
    9: flow("Abonentdan provider edge’gacha turli egalikdagi qatlamlar bor; muammo egasiga qarab eskalatsiya qilinadi.", ["Abonent\nLAN", "CPE\ncustomer FW", "Provider PE\nACL / VRF", "DDoS edge\nscrubbing", "Internet\nprovider core"], ["abonent yo‘li", "operator chegarasi", "himoya", "uplink"]),
    10: flow("VPN shifrlangan tunnel beradi; MFA’dan keyin ham ichki xizmatga firewall siyosati qo‘llanadi.", ["Foydalanuvchi\nremote", "VPN tunnel\nshifrlash", "Identity\nMFA", "Firewall\nrole policy", "Ilova\nallowed service"], ["ulanadi", "tasdiqlanadi", "cheklanadi", "kirish"]),
    11: flow("Firewall hodisasi SIEM’da boshqa manbalar bilan vaqt bo‘yicha bog‘lanadi.", ["Firewall\nallow / deny", "Syslog\nsecure transport", "SIEM\nnormalize", "Correlation\nqoidasi", "Analyst\ntriage"], ["yubor", "tartibla", "bog‘la", "tekshir"]),
    12: flow("HA zaxira tugun faqat holat va failover yo‘li tekshirilgach xizmatni davom ettiradi.", ["Primary FW\nactive", "Heartbeat\nhealth", "State sync\nsessions", "Standby FW\nready", "Service\nfailover"], ["nazorat", "sinxronla", "tayyorla", "tikla"]),
    13: flow("Muammo qaysi qatlamda ekanini trafik yo‘li, firewall logi va host javobi orqali ajrating.", ["Client\nDNS / route", "Firewall\nrule match", "NAT / path\nikki yo‘nalish", "Server\nlistener / log", "Xulosa\nroot cause"], ["tekshir", "log bilan", "solishtir", "tasdiqla"])
  },
  "kerio-control-zero-to-hero": {
    0: flow("Kerio gateway WAN, LAN va DMZ trafikini siyosat bilan boshqaradi; admin yo‘li alohida himoyalanadi.", ["Internet\nWAN", "Kerio\nfirewall", "LAN\nclients", "DMZ\nservers", "Admin\ntrusted only"], ["kiruvchi", "chiqish", "chegaralangan", "boshqaruv"]),
    1: flow("O‘rnatishdan oldin mos platforma va adapterlar belgilanadi, so‘ng admin va backup tekshiriladi.", ["Talablar\nversiya / litsenziya", "VM/appliance\nmos platforma", "NIC’lar\nWAN + LAN", "Admin\nsecure access", "Backup\nrestore test"], ["tekshir", "o‘rnat", "ajrat", "saqla"]),
    2: flow("Interfeyslar zonaga bog‘lanadi; zonalararo oqim faqat ruxsat berilgan siyosat bo‘yicha yuradi.", ["WAN\nuntrusted", "Kerio\nzone policy", "LAN\ntrusted", "DMZ\nlimited trust", "Mgmt\nadmin only"], ["interface", "policy", "isolation", "separate"]),
    3: flow("Paket manba, manzil va xizmat bo‘yicha qoidaga moslanib, ruxsat yoki rad qilinadi.", ["Client\nsource", "Rule order\nfirst match?", "Service\nport / proto", "Decision\nallow / deny", "Log\nrule ID"], ["traffic", "match", "enforce", "audit"]),
    4: flow("Outbound NAT ichki manzilni WAN chiqishida tarjima qiladi; qaytish sessiyasi ham tekshiriladi.", ["LAN host\n10.40.10.x", "Firewall\nallow policy", "Source NAT\ntranslation", "WAN IP\nuplink", "Response\nstateful return"], ["private", "ruxsat", "tarjima", "qaytish"]),
    5: flow("Port mapping tashqi portni aniq DMZ serverga yo‘naltiradi; firewall policy alohida kerak.", ["Internet\napproved source", "WAN port\nservice only", "Port map\nDNAT", "Policy\nsource + port", "DMZ server\npatched / logged"], ["request", "tarjima", "ruxsat tekshiruvi", "audit"]),
    6: flow("Web filtrlashda so‘rov, kategoriya va TLS talablari tekshiriladi; istisnolar vaqtli bo‘ladi.", ["User\nbrowser", "Web request\nURL / category", "Kerio filter\npolicy", "TLS check\nif approved", "Result\nallow / block"], ["so‘rov", "toifa", "inspeksiya", "qaror"]),
    7: flow("Identity guruhni aniqlaydi; Kerio’dagi guruh qoidasi foydalanuvchiga mos siyosatni qo‘llaydi.", ["User\nindividual ID", "Directory\nAD / LDAP", "Group\nrole mapping", "Kerio rule\nleast privilege", "Audit\nlogin / change"], ["authenticate", "guruhla", "qo‘lla", "qayd"]),
    8: flow("VPN kirishi MFA bilan tasdiqlanadi, so‘ng tunnel ichidagi trafik ham siyosat bilan cheklanadi.", ["Remote user\nmanaged device", "VPN\nencrypted tunnel", "Identity\nMFA", "Kerio policy\nsubnet + role", "Target\nspecific service"], ["connect", "verify", "authorize", "limit"]),
    9: flow("Backup’dan keyin rejalangan yangilash sinovdan o‘tadi; nosozlikda tasdiqlangan rollback qo‘llanadi.", ["Change ticket\nscope / owner", "Backup\nprotected", "Update\napproved window", "Validation\nWAN / VPN / apps", "Rollback\nif failed"], ["tasdiqla", "saqla", "yangila", "tekshir"]),
    10: flow("Client’dan servergacha yo‘lni log, qoida, NAT va server javobi bilan bosqichma-bosqich tekshiring.", ["Client\nIP / DNS", "Kerio log\nrule / action", "Route / NAT\npath", "Server\nlistener / log", "Root cause\nconfirmed"], ["boshlang", "match top", "yo‘lni ko‘r", "dalil bilan"])
  }
};

const check = (prompt: string, ...answers: string[]): NonNullable<LearningSection["question"]> => ({
  prompt: l(prompt),
  answers
});

export const learningTeachingChecks: Record<string, Record<number, NonNullable<LearningSection["question"]>>> = {
  "network-fundamentals": {
    1: check("OSI modelida router odatda qaysi qatlamda marshrutlash qarorini qabul qiladi?", "network", "tarmoq", "layer 3", "l3", "3"),
    2: check("TCP/IP transport qatlamida TCP ma’lumot birligi odatda nima deyiladi?", "segment", "tcp segment"),
    3: check("Ulanish o‘rnatmasdan datagram yuboradigan transport protokoli qaysi?", "udp"),
    4: check("Wireshark’da TCP port 443 trafigini ko‘rsatadigan display filter qanday yoziladi?", "tcp.port == 443"),
    5: check("tcpdump’da yozib olish uchun tarmoq interfeysini tanlaydigan parametr qaysi?", "-i", "-i interface"),
    6: check("Mahalliy IPv4 manziliga mos MAC manzilni topishda qaysi protokol ishlatiladi?", "arp"),
    7: check("Xususiy IPv4 manzilni tashqi manzilga tarjima qilish texnologiyasi nima?", "nat", "pat", "nat/pat")
  },
  "linux-fundamentals": {
    1: check("Linux’da fayl va katalog ruxsatlarini o‘zgartirish buyrug‘i qaysi?", "chmod"),
    2: check("systemd jurnalidagi xizmat loglarini ko‘rish uchun qaysi buyruq ishlatiladi?", "journalctl")
  },
  "windows-fundamentals": {
    0: check("Windows’da jarayonlar, xotira va drayverlarni boshqaradigan asosiy tizim qismi nima?", "kernel", "yadro"),
    1: check("Markazlashgan foydalanuvchi va kompyuter boshqaruvi uchun Windows’da qaysi katalog xizmati ishlatiladi?", "active directory", "ad"),
    2: check("Domen qurilmalariga markaziy konfiguratsiya siyosatini tarqatadigan Windows mexanizmi nima?", "group policy", "gpo")
  },
  "mikrotik-routeros-basics": {
    0: check("MikroTik routerlarida ishlaydigan operatsion tizim nomi nima?", "routeros"),
    2: check("MikroTik’da VLAN interfeyslarini ko‘prikda bir-biridan ajratish uchun qaysi bridge xususiyati yoqiladi?", "vlan filtering", "vlan-filtering")
  },
  "intro-cybersecurity": {
    1: check("Soxta xabar yoki sayt orqali foydalanuvchini aldab ma’lumot olish hujumi nima deyiladi?", "phishing"),
    2: check("Keraksiz xizmatlarni o‘chirish, yangilash va eng kam ruxsat berish amaliyoti umumiy nima deb ataladi?", "hardening", "mustahkamlash")
  },
  "web-security-owasp": {
    0: check("SQL injection xavfini kamaytirish uchun SQL so‘roviga qiymatlarni qanday uzatish kerak?", "parameterized query", "parameterized queries", "prepared statement", "prepared statements", "parametrli so‘rov"),
    1: check("Foydalanuvchi tizimga kirganini keyingi so‘rovlarda bog‘lab turadigan mexanizm nima?", "session", "sessiya"),
    2: check("Serverda foydalanuvchi qaysi amalni bajarishi mumkinligini tekshiruvchi nazorat nima?", "authorization", "avtorizatsiya")
  },
  "soc-log-analysis": {
    0: check("Windows tizimida login va xavfsizlik hodisalari ko‘p uchraydigan jurnal qaysi?", "security event log", "windows security log", "security log"),
    1: check("SIEM ogohlantirishini tekshirishda avval uni dalillar bilan tasdiqlash yoki rad etish bosqichi nima?", "triage", "saralash"),
    2: check("Hodisani ta’siri va shoshilinchligiga qarab ustuvorlashtirish jarayoni nima deyiladi?", "triage", "saralash", "prioritization")
  },
  "wifi-security": {
    0: check("Simsiz tarmoqni foydalanuvchilar ko‘radigan nomi qanday ataladi?", "ssid"),
    2: check("Wi-Fi xavfsizlik sinovini boshlashdan oldin yozma ravishda belgilanishi kerak bo‘lgan ruxsat chegarasi nima deyiladi?", "scope", "qamrov"),
    3: check("Bir nechta kirish nuqtalaridan kelgan shubhali hodisalarni markaziy kuzatishga qaysi turdagi tizim yordam beradi?", "wids", "wireless intrusion detection system", "wireless ids")
  },
  "active-directory-security": {
    0: check("Windows domenida foydalanuvchi va kompyuter obyektlarini markaziy saqlaydigan katalog xizmati nima?", "active directory", "ad"),
    2: check("Hujumchining bir tizimdan boshqasiga o‘tishini cheklashda foydali asosiy ruxsat tamoyili nima?", "least privilege", "eng kam ruxsat"),
    3: check("Domen boshqaruvchisidagi autentifikatsiya va siyosat hodisalarini tahlil qilish uchun qaysi manba muhim?", "security event log", "windows security log", "security log")
  },
  "cisco-ios-fundamentals": {
    0: check("Cisco IOS laboratoriyasida noto‘g‘ri sozlamalar real tarmoqqa ta’sir qilmasligi uchun qayerda ishlash kerak?", "izolyatsiyalangan lab", "laboratoriya", "packet tracer", "gns3"),
    1: check("Cisco IOS’da konfiguratsiya buyruqlarini kiritish uchun qaysi rejimga o‘tiladi?", "global configuration", "global config", "configure terminal"),
    2: check("IOS CLI’da buyruq variantlari va parametrlarini ko‘rsatadigan tugma qaysi?", "?", "question mark"),
    3: check("Hozir ishlayotgan, ammo hali saqlanmagan konfiguratsiya qayerda turadi?", "running-config", "running config"),
    4: check("Cisco IOS’da interfeysga IPv4 manzil berishdan oldin qaysi konfiguratsiya rejimiga kiriladi?", "interface configuration", "interface config", "interface"),
    5: check("Ikki router orasida paket yo‘lini tekshirish uchun ishlatiladigan asosiy ICMP buyrug‘i qaysi?", "ping"),
    6: check("VLAN ichidagi oddiy oxirgi qurilmaga ulanadigan switch port rejimi nima?", "access"),
    7: check("Bir fizik switch porti orqali bir nechta VLAN’ni olib o‘tuvchi rejim nima?", "trunk"),
    8: check("Layer 2 halqalaridan saqlashda ortiqcha ulanishlarni boshqaradigan protokol nima?", "spanning tree", "stp"),
    9: check("Router-on-a-stick yordamida VLAN’lar o‘rtasidagi trafik qaysi switch porti orqali o‘tadi?", "trunk"),
    10: check("Boshqa aniq marshrut topilmasa, trafikni chiqaradigan marshrut nima deyiladi?", "default route", "standart marshrut"),
    11: check("Cisco қурилмаларида ички маршрутларни динамик алмашиш протоколи сифатида курсда қайси протокол созланади?", "ospf"),
    12: check("Cisco IOS’da кирувчи ёки чиқувчи пакетларни шартлар бўйича рухсатлаш/рад этиш рўйхати нима?", "acl", "access control list"),
    13: check("Бир умумий ташқи IPv4 манзил орқали кўп ички қурилмалар уланишида портларни ҳам таржима қиладиган усул нима?", "pat", "nat overload"),
    14: check("Cisco qurilmasini shifrlangan masofaviy boshqarish uchun qaysi protokol sozlanadi?", "ssh"),
    15: check("Tarmoq muammosini bosqichma-bosqich ajratishda birinchi tekshiriladigan eng quyi qatlam qaysi?", "layer 1", "l1", "physical", "fizik qatlam"),
    16: check("IOS konfiguratsiyasini qayta yuklangandan keyin ham saqlash uchun qaysi konfiguratsiya fayliga yoziladi?", "startup-config", "startup config"),
    17: check("Yakuniy kichik ofis laboratoriyasida VLAN’лар ўртасидаги алоқани текшириш учун муҳим буйруқ қайси?", "ping")
  },
  "cctv-system-design": {
    0: check("Tarmoq orqali video uzatadigan zamonaviy kameraning keng tarqalgan turi nima?", "ip camera", "ip kamera"),
    1: check("Video saqlash hajmini hisoblashda bitrate’dan tashqari qaysi vaqt o‘lchovi majburiy kerak?", "retention", "saqlash muddati"),
    2: check("Ethernet kabeli orqali qurilmaga elektr va ma’lumotni birga uzatish texnologiyasi nima?", "poe")
  },
  "firewall-zero-to-hero": {
    0: check("Bitta kompyuterning kiruvchi va chiquvchi trafikini qaysi firewall turi boshqaradi?", "host firewall", "host"),
    1: check("Qaytish paketini sessiya holati asosida taniydigan firewall qanday ataladi?", "stateful", "stateful firewall"),
    2: check("Faqat ish uchun zarur bo‘lgan ruxsatlarni berish tamoyili nima?", "least privilege", "eng kam ruxsat"),
    3: check("Windows’dagi Public profil odatda qaysi tarmoqda qo‘llanadi?", "public", "public network"),
    4: check("Linux’da kernel packet filter qoidalarini zamonaviy boshqaruvchi vositalardan biri qaysi?", "nftables"),
    5: check("Internetga qaragan serverlarni ichki LAN’dan ajratib turuvchi zona nima?", "dmz"),
    6: check("NGFW’da ma’lum hujum naqshlarini aniqlab to‘sishga yordam beradigan modul nima?", "ips"),
    7: check("HTTP so‘rovlarini web ilova qoidalari bo‘yicha tekshiruvchi himoya nima?", "waf", "web application firewall"),
    8: check("Cloud’da VM yoki interfeysga biriktiriladigan virtual trafik qoidalari ko‘pincha nima deb ataladi?", "security group", "security groups"),
    9: check("Provayder chetida hajmli hujum trafikini kamaytirish xizmati qanday ataladi?", "ddos mitigation", "ddos protection", "ddos"),
    10: check("Masofadan xavfsiz tunnel orqali ulanish texnologiyasi nima?", "vpn"),
    11: check("Loglarni markaziy yig‘ish va o‘zaro bog‘lashga qaysi turdagi tizim yordam beradi?", "siem"),
    12: check("Asosiy firewall ishdan chiqsa, xizmatni zaxira qurilma davom ettirish qobiliyati nima?", "ha", "high availability", "yuqori mavjudlik"),
    13: check("Nosozlikda firewall qarori va qoida ID’sini ko‘rsatadigan asosiy dalil nima?", "firewall log", "log", "jurnal")
  },
  "kerio-control-zero-to-hero": {
    0: check("Kerio topologiyasida internet provayderiga qaragan interfeys zonasi nima?", "wan"),
    1: check("Kerio sozlamasini o‘zgartirishdan oldin konfiguratsiyani qayerga saqlash kerak?", "backup", "zaxira", "zaxira nusxa"),
    2: check("Ichki foydalanuvchilar segmenti odatda qaysi zonada bo‘ladi?", "lan"),
    3: check("Faqat zarur manba, manzil va portga ruxsat berish tamoyili nima?", "least privilege", "eng kam ruxsat"),
    4: check("LAN’dan internetga chiqishda ichki manzilni WAN manziliga tarjima qilish nima?", "nat", "source nat", "masquerade"),
    5: check("Port mapping bilan internetga chiqarilgan serverni qaysi ajratilgan zonada saqlash ma’qul?", "dmz"),
    6: check("Saytlarni toifa yoki URL bo‘yicha cheklovchi Kerio funksiyasi nima?", "web filter", "web filtering"),
    7: check("Remote VPN hisobini qo‘shimcha tasdiqlash uchun tavsiya qilinadigan omil nima?", "mfa"),
    8: check("VPN tunnelidan keyin ichki xizmatga kirishni yana qaysi qurilma siyosati cheklaydi?", "firewall", "firewall policy", "firewall rule"),
    9: check("Konfiguratsiyaning maxfiy ma’lumot bo‘lishi mumkin bo‘lgan nusxasini qanday saqlash kerak?", "backup", "backup configuration", "zaxira"),
    10: check("Marshrut, firewall log, NAT va server javobini tekshirib sababni topish nima deyiladi?", "troubleshooting", "nosozlikni aniqlash", "diagnostics")
  }
};
