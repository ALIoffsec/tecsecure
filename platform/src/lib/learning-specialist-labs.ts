import type { LabDef } from "./learning-labs";

const task = (id: string, prompt: string, answers: string[], hint: string) => ({ id, prompt, answers, hint });

export const learningSpecialistLabs: LabDef[] = [
  {
    slug: "windows-baseline-review",
    moduleSlug: "windows-fundamentals",
    title: "Windows server holati va kirish hodisalarini tekshirish",
    level: "boshlang‘ich",
    minutes: 25,
    priceTec: 15,
    summary: "Sintetik inventar va Security event qatorlaridan tizim holati, kirish natijasi va xavfsiz keyingi qadamni toping.",
    scenario: "Windows lab serveri uchun qisqa audit eksporti berilgan. Hech qanday sozlamani o‘zgartirmasdan dalilni tahlil qiling.",
    skills: ["Windows inventarizatsiyasi", "Event ID 4624/4625", "dalil va taxminni ajratish"],
    evidence: [{
      name: "windows-audit-synthetic.txt",
      content: "Host: LAB-SRV-02 (synthetic)\nOS: Windows Server 2022\nRole: File Services\nUTC,EventID,Account,LogonType,Source,Result\n09:10:02,4625,svc-files,3,10.20.4.18,Failure\n09:10:09,4625,svc-files,3,10.20.4.18,Failure\n09:12:41,4624,svc-files,3,10.20.4.18,Success\n09:14:00,4624,helpdesk,2,127.0.0.1,Success\nBackup: last restore drill 2026-09-10"
    }],
    tasks: [
      task("host", "Audit qaysi host uchun tuzilgan?", ["lab-srv-02"], "Host qatoridagi nomni o‘qing."),
      task("failure-id", "Muvaffaqiyatsiz kirish hodisasi qaysi Event ID?", ["4625"], "Result=Failure qatorlariga qarang."),
      task("account", "Muvaffaqiyatli kirishdan oldin xatolar qayd etilgan hisob?", ["svc-files"], "Bir xil hisob va manbani timeline’da kuzating."),
      task("next", "Bu dalilning o‘zi buzib kirishni isbotlaydimi? (ha/yo‘q)", ["yo‘q", "yo'q", "no"], "Event’larni change ticket, account owner va boshqa manbalar bilan tasdiqlash kerak.")
    ],
    debrief: "Ketma-ket 4625 va keyingi 4624 tekshiruvni talab qiladi, ammo o‘zi compromise isboti emas. Logon type, source, service owner va rejalashtirilgan ishlarni solishtiring; hisobni bloklash yoki audit siyosatini o‘zgartirishdan oldin incident jarayoniga amal qiling."
  },
  {
    slug: "wifi-site-survey-review",
    moduleSlug: "wifi-security",
    title: "Wi-Fi site survey va mehmon tarmog‘i xavfsizligi",
    level: "boshlang‘ich",
    minutes: 25,
    priceTec: 15,
    summary: "Sintetik radio kuzatuvlarini solishtirib qamrov, kanal to‘qnashuvi va mehmon segmenti xavfini baholang.",
    scenario: "Ofisning ruxsatli site survey jadvali taqdim etilgan. Tarmoqqa ulanmasdan, kuzatuvlar asosida reja tuzing.",
    skills: ["RSSI va qamrov", "kanal bandligi", "SSID segmentatsiyasi"],
    evidence: [{
      name: "wifi-survey-synthetic.csv",
      content: "Area,SSID,Band,Channel,RSSI,Security,Client VLAN\nLobby,STAFF,5 GHz,36,-54 dBm,WPA3-Enterprise,20\nLobby,GUEST,5 GHz,36,-58 dBm,WPA2-AES,90\nMeeting-A,STAFF,5 GHz,36,-79 dBm,WPA3-Enterprise,20\nMeeting-A,GUEST,2.4 GHz,6,-74 dBm,WPA2-AES,90\nConference,STAFF,5 GHz,149,-61 dBm,WPA3-Enterprise,20\nGuest isolation: NOT VERIFIED\nWPS: disabled"
    }],
    tasks: [
      task("weak-rssi", "STAFF signali eng zaif bo‘lgan xona?", ["meeting-a", "meeting a"], "RSSI qiymati -79 dBm bo‘lgan qatorni toping."),
      task("guest-vlan", "Mehmon SSID qaysi VLAN’da?", ["90", "vlan 90"], "Client VLAN ustunini o‘qing."),
      task("overlap", "Lobby’da STAFF va GUEST bir xil kanal ishlatyaptimi? (ha/yo‘q)", ["ha", "yes"], "Ikkala Lobby qatorining Channel qiymatini solishtiring."),
      task("verify", "Guest isolation uchun holat qanday qayd etilgan?", ["not verified", "tekshirilmagan"], "Guest isolation qatoriga qarang.")
    ],
    debrief: "Bir xil kanal bir AP yoki turli AP’larda airtime raqobatiga olib kelishi mumkin, ammo survey jadvali yolg‘iz o‘zi sababni isbotlamaydi. Kanal rejasini radio sharoiti va vendor tavsiyasi bilan tekshiring; mehmon VLAN’i ichki resurslardan ajralganini ruxsatli testda tasdiqlang."
  },
  {
    slug: "cisco-ios-vlan-evidence-review",
    moduleSlug: "cisco-ios-fundamentals",
    title: "Cisco switch’da VLAN va trunk dalillarini o‘qish",
    level: "boshlang‘ich",
    minutes: 25,
    priceTec: 15,
    summary: "Sintetik `show` natijalaridan access VLAN, trunk ruxsatlari va muammoni xavfsiz aniqlang.",
    scenario: "Labdagi foydalanuvchi hosti kerakli VLAN’dagi printerga yetolmayapti. Faqat o‘qish uchun berilgan CLI natijalarini tahlil qiling.",
    skills: ["show vlan brief", "show interfaces trunk", "Layer 2 troubleshooting"],
    evidence: [{
      name: "switch-show-output.txt",
      content: "Switch: SW-LAB-01 (synthetic)\nshow vlan brief\n10 STAFF active Gi1/0/1, Gi1/0/2\n20 PRINTERS active Gi1/0/8\n99 MGMT active\n\nshow interfaces trunk\nPort Gi1/0/24  Mode on  Status trunking  Native VLAN 99\nVlans allowed on trunk: 10,99\n\nEndpoint: printer-01 expected VLAN 20, switch port Gi1/0/8"
    }],
    tasks: [
      task("printer-vlan", "Printer VLAN raqami?", ["20"], "Endpoint qatoridagi expected VLAN’ni o‘qing."),
      task("port-vlan", "Printer porti Gi1/0/8 qaysi VLAN’da ko‘rsatilgan?", ["20"], "show vlan brief bo‘limida Gi1/0/8’ni toping."),
      task("trunk-vlan", "Trunk’da printer VLAN’i ruxsat etilganmi? (ha/yo‘q)", ["yo‘q", "yo'q", "no"], "Allowed VLAN ro‘yxati 20 ni o‘z ichiga oladimi?"),
      task("safe-check", "O‘zgarishdan oldin qaysi narsani tasdiqlash zarur: trunk’ning ikkala uchi yoki faqat bitta port?", ["trunkning ikkala uchi", "ikkala uchi", "both trunk ends"], "Qo‘shni switch va VLAN dizaynini ham tekshiring.")
    ],
    debrief: "Access port VLAN 20’da, lekin trunk allowed list’da 20 yo‘q; bu ehtimoliy sabab. Haqiqiy qurilmada o‘zgarishdan avval ikkala trunk uchi, VLAN mavjudligi, STP holati, change approval va rollback’ni tekshiring."
  },
  {
    slug: "cctv-capacity-and-privacy-plan",
    moduleSlug: "cctv-system-design",
    title: "CCTV saqlash hajmi, PoE va maxfiylik rejasini tuzish",
    level: "boshlang‘ich",
    minutes: 30,
    priceTec: 20,
    summary: "Sintetik talablar asosida disk hajmini hisoblang va yetishmayotgan maxfiylik hamda PoE tekshiruvlarini aniqlang.",
    scenario: "Kichik obyekt uchun 6 kamera, uzluksiz yozuv va 14 kun saqlash rejalashtirilgan. Berilgan taxminiy bitrate va quvvat ma’lumotlarini tekshiring.",
    skills: ["bitrate’dan storage hisoblash", "PoE budjeti", "privacy-by-design"],
    evidence: [{
      name: "cctv-design-brief.txt",
      content: "Cameras: 6\nAverage bitrate per camera: 3 Mbps\nRecording: 24 h/day\nRetention: 14 days\nPoE switch total budget: 120 W\nCamera peak draw: 15 W each\nProposed views: entrance, lobby, office corridor, reception desk\nPrivacy review: reception monitor keyboard area not masked\nStorage estimate formula (decimal GB): Mbps x seconds / 8,000"
    }],
    tasks: [
      task("total-bitrate", "Barcha kameralar uchun birgalikdagi taxminiy bitrate (Mbps)?", ["18"], "3 Mbps ni 6 kameraga ko‘paytiring."),
      task("storage", "Zaxirasiz 14 kunlik decimal saqlash hajmi taxminan necha GB?", ["2722", "2721.6", "2722 gb"], "18 × 86,400 × 14 ÷ 8,000; yaxlitlang."),
      task("poe", "6 kameraning peak quvvati jami necha W?", ["90", "90 w"], "15 W ni 6 ga ko‘paytiring."),
      task("privacy", "Ko‘rib chiqilishi kerak bo‘lgan maxfiylik muammosi nima?", ["keyboard area not masked", "keyboard", "klaviatura hududi"], "Privacy review qatorini o‘qing.")
    ],
    debrief: "Taxminiy talab 2,721.6 decimal GB, PoE yuklamasi 90 W; usable disk sig‘imi, NVR overhead, RAID va headroom alohida qo‘shiladi. Kamera burchagini minimallashtiring, klaviatura kabi nozik zonani maskalang va retention hamda ko‘rish huquqini siyosat bilan belgilang."
  },
  {
    slug: "kerio-policy-order-review",
    moduleSlug: "kerio-control-zero-to-hero",
    title: "Kerio Control qoidalari va trafik yo‘lini ko‘rib chiqish",
    level: "o‘rta",
    minutes: 25,
    priceTec: 20,
    summary: "Sintetik firewall siyosatida rule order, DMZ ruxsati va log talablari bo‘yicha muammolarni aniqlang.",
    scenario: "Yangi Kerio gateway siyosati ishga tushishdan oldin tekshiruvga berildi. Bu faqat sintetik matn; hech qanday appliance yoki tarmoqqa ulanilmaydi.",
    skills: ["rule order", "zone-based access", "least privilege va log"],
    evidence: [{
      name: "kerio-policy-synthetic.txt",
      content: "Rule 1: LAN -> Internet, Any service, Allow, Log=no\nRule 2: GUEST -> LAN, Any service, Allow, Log=no\nRule 3: WAN -> DMZ, HTTPS 443 to portal-01, Allow, Log=yes\nRule 4: WAN -> LAN, Any service, Allow, Log=no\nRule processing: first matching rule wins\nRequired design: guest internet only; portal must not reach staff LAN\nChange status: draft; rollback plan missing"
    }],
    tasks: [
      task("guest", "Guest’dan LAN’ga keng ruxsat qaysi rule raqamida?", ["2", "rule 2"], "GUEST -> LAN qatorini toping."),
      task("wan-lan", "WAN’dan LAN’ga Any service ruxsat qaysi rule’da?", ["4", "rule 4"], "WAN -> LAN qatorini ko‘ring."),
      task("order", "Kerio qoidalarini tekshirishda bu lab qanday matching tartibini ko‘rsatadi?", ["first matching rule wins", "birinchi mos qoida", "first match"], "Rule processing satrini o‘qing."),
      task("rollback", "Draft’ni tasdiqlashdan oldin qaysi hujjat yetishmayapti?", ["rollback plan", "qaytarish rejasi", "rollback"], "Change status qatorini tekshiring.")
    ],
    debrief: "Guest→LAN va WAN→LAN qoidalari least privilege’ga zid; portal uchun faqat zarur inbound HTTPS va kerakli backend oqimlari alohida belgilanishi kerak. O‘zgarishni ishlab chiqarishga ko‘chirmang: owner tasdig‘i, test, log, rollback va vendor versiyasiga mos runbook zarur."
  },
  {
    slug: "computer-science-service-design-review",
    moduleSlug: "computer-science-core",
    title: "Xizmat unumdorligi, SQL yaxlitligi va tiklash maqsadlarini baholash",
    level: "o‘rta",
    minutes: 30,
    priceTec: 20,
    summary: "Sintetik servis kuzatuvlari va schema talablaridan bottleneck, constraint hamda recovery xavfini ajrating.",
    scenario: "Ticket servisida kechikish oshgan. Sizga agregat metrikalar va schema/recovery yozuvi berilgan; production tizimiga ulanmasdan tahlil qiling.",
    skills: ["latency percentile", "database integrity", "RPO/RTO va SLO"],
    evidence: [{
      name: "service-review-synthetic.txt",
      content: "Requests/min: 600\np50 latency: 85 ms\np95 latency: 920 ms\nError rate: 1.8%\nDB query: SELECT * FROM tickets WHERE owner_email = '<value>'\nTickets.owner_email index: absent\nTarget p95 SLO: 300 ms\nTarget RPO: 15 min; target RTO: 2 h\nLast restore drill: not recorded"
    }],
    tasks: [
      task("tail-latency", "Metrika ko‘rsatgan p95 latency necha ms?", ["920", "920 ms"], "p95 satrini o‘qing."),
      task("slo", "p95 target SLO’dan oshyaptimi? (ha/yo‘q)", ["ha", "yes"], "920 ms bilan 300 ms’ni solishtiring."),
      task("query-safety", "owner_email qiymati so‘rovga qanday uzatilishi kerak?", ["parameterized query", "parametrli so‘rov", "prepared statement"], "Qiymatni SQL matniga biriktirmang."),
      task("recovery", "RPO/RTO’ni tasdiqlash uchun qaysi sinov dalili yetishmaydi?", ["restore drill", "restore test", "tiklash sinovi"], "Last restore drill qatorini o‘qing.")
    ],
    debrief: "p95 tail latency SLO’dan yuqori, indeks yo‘qligi esa tekshiriladigan gipoteza — sababni query plan va nazoratli benchmark bilan tasdiqlang. SQL qiymatlarini parametrli uzating; restore drill muvaffaqiyati yozilmaguncha RPO/RTO bajarildi deb hisoblamang."
  }
];
