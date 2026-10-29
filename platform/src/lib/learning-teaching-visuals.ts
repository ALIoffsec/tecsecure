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

const check = (
  prompt: string,
  options: [string, string, string, string] | [string, string, string],
  correctIndex: number,
  ...extraAnswers: string[]
): NonNullable<LearningSection["question"]> => ({
  prompt: l(prompt),
  answers: [options[correctIndex], ...extraAnswers],
  options: options.map(l)
});

export const learningTeachingChecks: Record<string, Record<number, NonNullable<LearningSection["question"]>>> = {
  "network-fundamentals": {
    1: check("OSI modelida router odatda qaysi qatlamda marshrutlash qarorini qabul qiladi?", ["Network", "Data link", "Transport", "Physical"], 0, "tarmoq", "layer 3", "l3", "3"),
    2: check("TCP/IP transport qatlamida TCP ma’lumot birligi odatda nima deyiladi?", ["Segment", "Datagram", "Frame", "Paket"], 0, "tcp segment"),
    3: check("Ulanish o‘rnatmasdan datagram yuboradigan transport protokoli qaysi?", ["UDP", "TCP", "ICMP", "IP"], 0),
    4: check("Wireshark’da TCP port 443 trafigini ko‘rsatadigan display filter qanday yoziladi?", ["tcp.port == 443", "ip.addr == 443", "http.port == 443", "tcp.srcport != 443"], 0),
    5: check("tcpdump’da yozib olish uchun tarmoq interfeysini tanlaydigan parametr qaysi?", ["-i", "-n", "-v", "-X"], 0, "-i interface"),
    6: check("Mahalliy IPv4 manziliga mos MAC manzilni topishda qaysi protokol ishlatiladi?", ["ARP", "DHCP", "DNS", "ICMP"], 0),
    7: check("Xususiy IPv4 manzilni tashqi manzilga tarjima qilish texnologiyasi nima?", ["NAT", "Routing", "VLAN", "Firewall qoidasi"], 0, "pat", "nat/pat")
  },
  "linux-fundamentals": {
    1: check("Linux’da fayl va katalog ruxsatlarini o‘zgartirish buyrug‘i qaysi?", ["chmod", "chown", "chgrp", "ls -l"], 0),
    2: check("systemd jurnalidagi xizmat loglarini ko‘rish uchun qaysi buyruq ishlatiladi?", ["journalctl", "dmesg", "syslog", "tail -f /var/log/messages"], 0)
  },
  "windows-fundamentals": {
    0: check("Windows’da jarayonlar, xotira va drayverlarni boshqaradigan asosiy tizim qismi nima?", ["Kernel", "Shell", "Registry", "Explorer"], 0, "yadro"),
    1: check("Markazlashgan foydalanuvchi va kompyuter boshqaruvi uchun Windows’da qaysi katalog xizmati ishlatiladi?", ["Active Directory", "DNS Server", "DHCP Server", "Group Policy"], 0, "ad"),
    2: check("Domen qurilmalariga markaziy konfiguratsiya siyosatini tarqatadigan Windows mexanizmi nima?", ["Group Policy", "Active Directory", "Registry Editor", "Task Scheduler"], 0, "gpo")
  },
  "mikrotik-routeros-basics": {
    0: check("MikroTik routerlarida ishlaydigan operatsion tizim nomi nima?", ["RouterOS", "Cisco IOS", "JunOS", "pfSense"], 0),
    2: check("MikroTik’da VLAN interfeyslarini ko‘prikda bir-biridan ajratish uchun qaysi bridge xususiyati yoqiladi?", ["VLAN filtering", "Bridge port isolation", "Spanning tree", "Fast forward"], 0, "vlan-filtering")
  },
  "intro-cybersecurity": {
    1: check("Soxta xabar yoki sayt orqali foydalanuvchini aldab ma’lumot olish hujumi nima deyiladi?", ["Phishing", "Malware", "DDoS", "Brute-force"], 0),
    2: check("Keraksiz xizmatlarni o‘chirish, yangilash va eng kam ruxsat berish amaliyoti umumiy nima deb ataladi?", ["Hardening", "Patching only", "Penetration testing", "Monitoring"], 0, "mustahkamlash")
  },
  "web-security-owasp": {
    0: check("SQL injection xavfini kamaytirish uchun SQL so‘roviga qiymatlarni qanday uzatish kerak?", ["parameterized query", "String concatenation", "Dynamic SQL without binding", "Disabling SQL logging"], 0, "parameterized queries", "prepared statement", "prepared statements", "parametrli so‘rov"),
    1: check("Foydalanuvchi tizimga kirganini keyingi so‘rovlarda bog‘lab turadigan mexanizm nima?", ["Session", "Cache", "DNS record", "Local storage"], 0, "sessiya"),
    2: check("Serverda foydalanuvchi qaysi amalni bajarishi mumkinligini tekshiruvchi nazorat nima?", ["Authorization", "Authentication", "Encryption", "Logging"], 0, "avtorizatsiya")
  },
  "soc-log-analysis": {
    0: check("Windows tizimida login va xavfsizlik hodisalari ko‘p uchraydigan jurnal qaysi?", ["Security event log", "Application log", "System log", "Setup log"], 0, "windows security log", "security log"),
    1: check("SIEM ogohlantirishini tekshirishda avval uni dalillar bilan tasdiqlash yoki rad etish bosqichi nima?", ["Triage", "Containment", "Eradication", "Recovery"], 0, "saralash"),
    2: check("Hodisani ta’siri va shoshilinchligiga qarab ustuvorlashtirish jarayoni nima deyiladi?", ["Prioritization", "Automation", "Escalation only", "Archiving"], 0, "triage", "saralash")
  },
  "wifi-security": {
    0: check("Simsiz tarmoqni foydalanuvchilar ko‘radigan nomi qanday ataladi?", ["SSID", "BSSID", "Channel", "MAC address"], 0),
    2: check("Wi-Fi xavfsizlik sinovini boshlashdan oldin yozma ravishda belgilanishi kerak bo‘lgan ruxsat chegarasi nima deyiladi?", ["Scope", "Timeline only", "Budget", "Report format"], 0, "qamrov"),
    3: check("Bir nechta kirish nuqtalaridan kelgan shubhali hodisalarni markaziy kuzatishga qaysi turdagi tizim yordam beradi?", ["WIDS", "Firewall", "VPN gateway", "SIEM"], 0, "wireless intrusion detection system", "wireless ids")
  },
  "active-directory-security": {
    0: check("Windows domenida foydalanuvchi va kompyuter obyektlarini markaziy saqlaydigan katalog xizmati nima?", ["Active Directory", "DNS", "DHCP", "Group Policy"], 0, "ad"),
    2: check("Hujumchining bir tizimdan boshqasiga o‘tishini cheklashda foydali asosiy ruxsat tamoyili nima?", ["Least privilege", "Zero trust", "Defense in depth", "Separation of duties"], 0, "eng kam ruxsat"),
    3: check("Domen boshqaruvchisidagi autentifikatsiya va siyosat hodisalarini tahlil qilish uchun qaysi manba muhim?", ["Security event log", "System log", "Application log", "Setup log"], 0, "windows security log", "security log")
  },
  "cisco-ios-fundamentals": {
    0: check("Cisco IOS laboratoriyasida noto‘g‘ri sozlamalar real tarmoqqa ta’sir qilmasligi uchun qayerda ishlash kerak?", ["Izolyatsiyalangan lab", "Jonli production tarmog‘i", "Ofis Wi-Fi tarmog‘i", "Mijoz routeri"], 0, "laboratoriya", "packet tracer", "gns3"),
    1: check("Cisco IOS’da konfiguratsiya buyruqlarini kiritish uchun qaysi rejimga o‘tiladi?", ["Global configuration", "Privileged EXEC", "User EXEC", "Interface configuration"], 0, "global config", "configure terminal"),
    2: check("IOS CLI’da buyruq variantlari va parametrlarini ko‘rsatadigan tugma qaysi?", ["?", "Tab", "Ctrl+Z", "!"], 0, "question mark"),
    3: check("Hozir ishlayotgan, ammo hali saqlanmagan konfiguratsiya qayerda turadi?", ["running-config", "startup-config", "NVRAM", "Flash"], 0, "running config"),
    4: check("Cisco IOS’da interfeysga IPv4 manzil berishdan oldin qaysi konfiguratsiya rejimiga kiriladi?", ["Interface configuration", "Global configuration", "Router configuration", "Line configuration"], 0, "interface config", "interface"),
    5: check("Ikki router orasida paket yo‘lini tekshirish uchun ishlatiladigan asosiy ICMP buyrug‘i qaysi?", ["Ping", "Traceroute", "Telnet", "SSH"], 0),
    6: check("VLAN ichidagi oddiy oxirgi qurilmaga ulanadigan switch port rejimi nima?", ["Access", "Trunk", "Dynamic desirable", "Voice"], 0),
    7: check("Bir fizik switch porti orqali bir nechta VLAN’ni olib o‘tuvchi rejim nima?", ["Trunk", "Access", "Dynamic auto", "Native"], 0),
    8: check("Layer 2 halqalaridan saqlashda ortiqcha ulanishlarni boshqaradigan protokol nima?", ["Spanning tree", "VLAN Trunking Protocol", "HSRP", "Link Aggregation"], 0, "stp"),
    9: check("Router-on-a-stick yordamida VLAN’lar o‘rtasidagi trafik qaysi switch porti orqali o‘tadi?", ["Trunk", "Access", "Voice", "Native VLAN only"], 0),
    10: check("Boshqa aniq marshrut topilmasa, trafikni chiqaradigan marshrut nima deyiladi?", ["Default route", "Static route", "Directly connected route", "Summary route"], 0, "standart marshrut"),
    11: check("Cisco қурилмаларида ички маршрутларни динамик алмашиш протоколи сифатида курсда қайси протокол созланади?", ["OSPF", "RIP", "BGP", "EIGRP"], 0),
    12: check("Cisco IOS’da кирувчи ёки чиқувчи пакетларни шартлар бўйича рухсатлаш/рад этиш рўйхати нима?", ["ACL", "NAT", "VLAN", "QoS policy"], 0, "acl", "access control list"),
    13: check("Бир умумий ташқи IPv4 манзил орқали кўп ички қурилмалар уланишида портларни ҳам таржима қиладиган усул нима?", ["PAT", "Static NAT", "ACL", "VLAN trunking"], 0, "pat", "nat overload"),
    14: check("Cisco qurilmasini shifrlangan masofaviy boshqarish uchun qaysi protokol sozlanadi?", ["SSH", "Telnet", "HTTP", "FTP"], 0),
    15: check("Tarmoq muammosini bosqichma-bosqich ajratishda birinchi tekshiriladigan eng quyi qatlam qaysi?", ["Physical", "Data link", "Network", "Transport"], 0, "layer 1", "l1", "fizik qatlam"),
    16: check("IOS konfiguratsiyasini qayta yuklangandan keyin ham saqlash uchun qaysi konfiguratsiya fayliga yoziladi?", ["startup-config", "running-config", "NVRAM backup file", "Flash image"], 0, "startup config"),
    17: check("Yakuniy kichik ofis laboratoriyasida VLAN’лар ўртасидаги алоқани текшириш учун муҳим буйруқ қайси?", ["Ping", "Show vlan brief", "Traceroute", "Telnet"], 0)
  },
  "cctv-system-design": {
    0: check("Tarmoq orqali video uzatadigan zamonaviy kameraning keng tarqalgan turi nima?", ["IP camera", "Analog camera", "PTZ controller", "NVR"], 0, "ip kamera"),
    1: check("Video saqlash hajmini hisoblashda bitrate’dan tashqari qaysi vaqt o‘lchovi majburiy kerak?", ["Retention", "Resolution", "Frame rate", "Compression"], 0, "saqlash muddati"),
    2: check("Ethernet kabeli orqali qurilmaga elektr va ma’lumotni birga uzatish texnologiyasi nima?", ["PoE", "VLAN", "QoS", "NAT"], 0)
  },
  "firewall-zero-to-hero": {
    0: check("Bitta kompyuterning kiruvchi va chiquvchi trafikini qaysi firewall turi boshqaradi?", ["Host firewall", "Network firewall (NGFW)", "WAF", "Cloud security group"], 0, "host"),
    1: check("Qaytish paketini sessiya holati asosida taniydigan firewall qanday ataladi?", ["Stateful firewall", "Stateless firewall", "Proxy firewall", "Packet sniffer"], 0, "stateful"),
    2: check("Faqat ish uchun zarur bo‘lgan ruxsatlarni berish tamoyili nima?", ["Least privilege", "Zero trust", "Defense in depth", "Fail-open"], 0, "eng kam ruxsat"),
    3: check("Windows’dagi Public profil odatda qaysi tarmoqda qo‘llanadi?", ["Public", "Private", "Domain", "Guest"], 0, "public network"),
    4: check("Linux’da kernel packet filter qoidalarini zamonaviy boshqaruvchi vositalardan biri qaysi?", ["nftables", "iptables (legacy)", "UFW", "firewalld"], 0),
    5: check("Internetga qaragan serverlarni ichki LAN’dan ajratib turuvchi zona nima?", ["DMZ", "VLAN", "VPN", "Subnet"], 0),
    6: check("NGFW’da ma’lum hujum naqshlarini aniqlab to‘sishga yordam beradigan modul nima?", ["IPS", "WAF", "NAT", "VPN"], 0),
    7: check("HTTP so‘rovlarini web ilova qoidalari bo‘yicha tekshiruvchi himoya nima?", ["WAF", "IPS", "SIEM", "DMZ"], 0, "waf", "web application firewall"),
    8: check("Cloud’da VM yoki interfeysga biriktiriladigan virtual trafik qoidalari ko‘pincha nima deb ataladi?", ["Security group", "Routing table", "DNS zone", "Load balancer"], 0, "security group", "security groups"),
    9: check("Provayder chetida hajmli hujum trafikini kamaytirish xizmati qanday ataladi?", ["DDoS mitigation", "Firewall logging", "VPN concentrator", "Load balancing"], 0, "ddos mitigation", "ddos protection", "ddos"),
    10: check("Masofadan xavfsiz tunnel orqali ulanish texnologiyasi nima?", ["VPN", "VLAN", "NAT", "DMZ"], 0),
    11: check("Loglarni markaziy yig‘ish va o‘zaro bog‘lashga qaysi turdagi tizim yordam beradi?", ["SIEM", "IPS", "WAF", "DNS sinkhole"], 0),
    12: check("Asosiy firewall ishdan chiqsa, xizmatni zaxira qurilma davom ettirish qobiliyati nima?", ["HA", "Load balancing", "VPN failover", "DNS round robin"], 0, "ha", "high availability", "yuqori mavjudlik"),
    13: check("Nosozlikda firewall qarori va qoida ID’sini ko‘rsatadigan asosiy dalil nima?", ["Firewall log", "DHCP lease", "ARP table", "Routing table"], 0, "firewall log", "log", "jurnal")
  },
  "kerio-control-zero-to-hero": {
    0: check("Kerio topologiyasida internet provayderiga qaragan interfeys zonasi nima?", ["WAN", "LAN", "DMZ", "Loopback"], 0),
    1: check("Kerio sozlamasini o‘zgartirishdan oldin konfiguratsiyani qayerga saqlash kerak?", ["Backup", "Syslog server", "DNS cache", "Browser history"], 0, "zaxira", "zaxira nusxa"),
    2: check("Ichki foydalanuvchilar segmenti odatda qaysi zonada bo‘ladi?", ["LAN", "WAN", "DMZ", "Internet"], 0),
    3: check("Faqat zarur manba, manzil va portga ruxsat berish tamoyili nima?", ["Least privilege", "Zero trust", "Defense in depth", "Fail-open"], 0, "eng kam ruxsat"),
    4: check("LAN’dan internetga chiqishda ichki manzilni WAN manziliga tarjima qilish nima?", ["NAT", "VLAN", "ACL", "Routing"], 0, "source nat", "masquerade"),
    5: check("Port mapping bilan internetga chiqarilgan serverni qaysi ajratilgan zonada saqlash ma’qul?", ["DMZ", "LAN", "WAN", "VPN pool"], 0),
    6: check("Saytlarni toifa yoki URL bo‘yicha cheklovchi Kerio funksiyasi nima?", ["Web filter", "Firewall policy", "Port mapping", "VPN policy"], 0, "web filtering"),
    7: check("Remote VPN hisobini qo‘shimcha tasdiqlash uchun tavsiya qilinadigan omil nima?", ["MFA", "Longer username", "Static IP only", "Shared password"], 0),
    8: check("VPN tunnelidan keyin ichki xizmatga kirishni yana qaysi qurilma siyosati cheklaydi?", ["Firewall", "DNS server", "Switch port", "Load balancer"], 0, "firewall policy", "firewall rule"),
    9: check("Konfiguratsiyaning maxfiy ma’lumot bo‘lishi mumkin bo‘lgan nusxasini qanday saqlash kerak?", ["Backup", "Public share", "Email attachment", "USB left on desk"], 0, "backup configuration", "zaxira"),
    10: check("Marshrut, firewall log, NAT va server javobini tekshirib sababni topish nima deyiladi?", ["Troubleshooting", "Hardening", "Patching", "Provisioning"], 0, "nosozlikni aniqlash", "diagnostics")
  }
};
