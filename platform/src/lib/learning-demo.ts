import type { Locale } from "@/lib/messages";

export type Localized = Record<Locale, string>;
export type Difficulty = "fundamental" | "easy" | "medium" | "hard";
export type Category = "networking" | "systems" | "security" | "physical";

export type LearningDiagram = {
  kind: "cli-modes" | "topology";
  caption: Localized;
  nodes: Localized[];
  links: Localized[];
};

export type LearningReference = {
  label: Localized;
  href: string;
};

export type LearningSection = {
  title: Localized;
  content?: Localized;
  example?: Localized;
  exampleExplanation?: Localized;
  images?: LearningImage[];
  diagram?: LearningDiagram;
  question?: { prompt: Localized; answers: string[] };
};

export type LearningImage = {
  src: string;
  alt: Localized;
  caption: Localized;
  width: number;
  height: number;
};

export type LearningExample = {
  code: Localized;
  explanation: Localized;
};

export type LearningModule = {
  slug: string;
  title: Localized;
  summary: Localized;
  difficulty: Difficulty;
  category: Category;
  hours: number;
  hasLab: boolean;
  labPlan?: Localized;
  references?: LearningReference[];
  sections: LearningSection[];
};

export type LearningPath = {
  slug: string;
  kind: "jobRole" | "skill";
  title: Localized;
  summary: Localized;
  timeEstimate: Localized;
  prerequisites: Localized;
  outcomes: Localized;
  capstone: Localized;
  modules: string[];
};

function l(uz: string): Localized;
function l(uz: string, ru: string, en: string): Localized;
function l(uz: string, ru?: string, en?: string): Localized {
  if (ru === undefined && en === undefined) return { uz, ru: uz, en: uz };
  if (ru === undefined || en === undefined) throw new Error("Provide either one shared value or all three translations.");
  return { uz, ru, en };
}
const lesson = (
  title: Localized,
  content: Localized,
  example: Localized,
  exampleExplanation: Localized,
  extras: Pick<LearningSection, "diagram" | "question"> = {}
): LearningSection => ({ title, content, example, exampleExplanation, ...extras });

export const learningModules: LearningModule[] = [
  {
    slug: "network-fundamentals",
    title: l("Tarmoq asoslari", "Основы сетей", "Network Fundamentals"),
    summary: l(
      "OSI va TCP/IP modellari, tarmoq protokollari, Wireshark/tcpdump’da paket tahlili, ARP/ICMP/DHCP, marshrutlash, firewall, NAT/PAT va VPN’ni sodda misollar bilan o‘rganing.",
      "Изучите модели OSI и TCP/IP, сетевые протоколы, анализ пакетов в Wireshark/tcpdump, ARP/ICMP/DHCP, маршрутизацию, firewall, NAT/PAT и VPN на простых примерах.",
      "Learn OSI and TCP/IP, network protocols, packet analysis with Wireshark/tcpdump, ARP/ICMP/DHCP, routing, firewalls, NAT/PAT, and VPNs through simple examples."
    ),
    difficulty: "fundamental", category: "networking", hours: 10, hasLab: true,
    sections: [
      {
        title: l("0. Kurs xaritasi va xavfsiz laboratoriya", "0. План курса и безопасная лаборатория", "0. Course roadmap and safe lab"),
        content: l(
          "Ushbu kurs tarmoq asoslarini ketma-ket o‘rgatadi: OSI va TCP/IP modellari, Ethernet/IP/TCP/UDP protokollari, Wireshark va tcpdump’da paket tahlili, ARP/ICMP/DHCP hamda routing, firewall, NAT/PAT va VPN. Har bir mavzu shu sahifaning o‘zida tushuntirishlar, amaliy misollar va tegishli skrinshotlar bilan berilgan.\n\nAmaliyotni faqat o‘zingizga tegishli yoki yozma ruxsat berilgan qurilma va tarmoqlarda bajaring. Tarmoq yozuvlarida login, token, shaxsiy ma’lumot va ichki manzillar chiqishi mumkin; laboratoriya yozuvlarini himoyalang va kerak bo‘lmagach o‘chiring.",
          "Этот курс последовательно объясняет основы сетей: модели OSI и TCP/IP, Ethernet/IP/TCP/UDP, анализ пакетов в Wireshark и tcpdump, ARP/ICMP/DHCP, маршрутизацию, firewall, NAT/PAT и VPN. Каждая тема изложена на этой странице с пояснениями, примерами и соответствующими скриншотами.\n\nПрактикуйте только на собственных устройствах и сетях либо при наличии письменного разрешения. В захватах могут оказаться пароли, токены, личные данные и внутренние адреса; защищайте лабораторные записи и удаляйте их, когда они больше не нужны.",
          "This course teaches networking fundamentals step by step: OSI and TCP/IP, Ethernet/IP/TCP/UDP, packet analysis with Wireshark and tcpdump, ARP/ICMP/DHCP, routing, firewalls, NAT/PAT, and VPNs. Each topic is explained here with clear explanations, practical examples, and relevant screenshots.\n\nPractice only on devices and networks you own or are explicitly authorized to assess. Captures can contain credentials, tokens, personal data, and internal addresses; protect lab captures and delete them when no longer needed."
        ),
        question: { prompt: l("Kursda amaliy tahlil qilinadigan ikkita asosiy model qaysi?", "Какие две основные модели изучаются в курсе?", "Which two core models does this course study?"), answers: ["osi va tcp/ip", "osi tcp/ip", "osi/tcp-ip", "osi and tcp/ip", "tcp/ip and osi", "osi и tcp/ip"] }
      },
      {
        title: l("1. OSI modeli va qatlamlar bo‘yicha nosozlik qidirish", "1. Модель OSI и поиск неисправностей по уровням", "1. OSI model and layer-by-layer troubleshooting"),
        content: l(
          "OSI modeli tarmoq aloqasidagi vazifalarni 7 ta mantiqiy qatlamga ajratadi: fizik, kanal, tarmoq, transport, seans, taqdimot va ilova. Bu qurilma ichida aynan yettita alohida qism bor degani emas; protokollar va nosozliklarni guruhlab tushunish modelidir. Masalan, kabel/signallar L1, Ethernet/MAC L2, IP/marshrutlash L3, TCP/UDP va portlar L4, DNS/HTTP esa L7 bilan bog‘liq.\n\nMuammoni pastdan yuqoriga tekshiring: ulanish holati → lokal IP/maska/shlyuz → marshrutlash → transport/port → nomni aniqlash va ilova. Bitta qatlamdagi muvaffaqiyat yuqori qatlamlar sog‘lomligini kafolatlamaydi.",
          "OSI описывает связь через 7 логических уровней: физический, канальный, сетевой, транспортный, сеансовый, представления и приложений. Это модель классификации протоколов и неисправностей, а не требование иметь семь отдельных частей в устройстве. Кабель/сигнал относится к L1, Ethernet/MAC — к L2, IP/маршрутизация — к L3, TCP/UDP и порты — к L4, DNS/HTTP — к L7.\n\nИщите сбой снизу вверх: состояние канала → локальный IP/маска/шлюз → маршрутизация → транспорт/порт → разрешение имён и приложение. Успех на одном уровне не гарантирует исправность вышестоящих.",
          "OSI describes communication as seven logical layers: physical, data link, network, transport, session, presentation, and application. It is a model for grouping protocols and faults, not a claim that a device contains seven separate components. Cable/signal is L1, Ethernet/MAC L2, IP/routing L3, TCP/UDP and ports L4, and DNS/HTTP L7.\n\nTroubleshoot from the bottom up: link state → local IP/mask/gateway → routing → transport/port → name resolution and application. Success at one layer does not prove higher layers are healthy."
        ),
        example: l("L1: Ethernet link up?\nL2: MAC/VLAN to‘g‘rimi?\nL3: ip addr; ip route\nL4: TCP/UDP port reachable?\nL7: DNS va ilova javob beradimi?"),
        exampleExplanation: l("Misol: foydalanuvchi saytga kira olmasa, avval Wi-Fi/ethernet ulanishini, so‘ng IP va gateway’ni, marshrutni, transport ulanishini, eng oxirida DNS va ilovani tekshiring.", "Пример: если сайт недоступен, проверьте Wi-Fi/Ethernet, затем IP и шлюз, маршрут, транспортное соединение и только потом DNS и приложение.", "Example: if a site is unreachable, check Wi-Fi/Ethernet, then IP and gateway, route, transport connection, and finally DNS and the application."),
        images: [{
          src: "/learning-assets/network-fundamentals/01-osi-model-page-04-image-01.png",
          alt: l("OSI’ning yetti qatlami va har bir qatlamga misol protokollar ko‘rsatilgan diagramma.", "Диаграмма семи уровней OSI и примеров протоколов для каждого уровня.", "Diagram of the seven OSI layers and example protocols for each layer."),
          caption: l("OSI modelining yetti qatlami va ularga misol protokollar.", "Семь уровней модели OSI и примеры протоколов.", "The seven OSI layers and example protocols."),
          width: 710,
          height: 722
        }],
      },
      {
        title: l("2. TCP/IP modeli va kapsullash", "2. Модель TCP/IP и инкапсуляция", "2. TCP/IP model and encapsulation"),
        content: l(
          "TCP/IP modeli tordagi real protokollar stekini odatda 4 qatlamga birlashtiradi: link, internet, transport, application. OSI bilan mosligi taxminiy: bir nechta OSI qatlam vazifalari TCP/IP application qatlamida jamlanishi mumkin. Ilova ma’lumoti pastga uzatilganda transport sarlavhasi, IP sarlavhasi, so‘ng link sarlavhasi bilan o‘raladi (encapsulation); qabul qiluvchi ularni teskari tartibda ajratadi.\n\nHar hopda link-layer manzillari o‘zgarishi mumkin, IP manzillari esa odatda oxirgi manbadan maqsadgacha saqlanadi (NAT kabi istisnolar mavjud). Router link sarlavhasini yechib, IP manzil bo‘yicha keyingi hopni tanlaydi.",
          "Модель TCP/IP объединяет реальные сетевые протоколы обычно в четыре уровня: link, internet, transport и application. Соответствие OSI приблизительное: функции нескольких уровней OSI могут объединяться в application. Двигаясь вниз от приложения, данные оборачиваются заголовком транспорта, IP и затем link (инкапсуляция); получатель снимает их в обратном порядке.\n\nНа каждом переходе link-адреса могут меняться, тогда как IP-адреса обычно сохраняются от исходного узла к целевому (есть исключения, например NAT). Маршрутизатор снимает link-заголовок и выбирает следующий hop по IP.",
          "The TCP/IP model groups the real protocol stack into four layers: link, internet, transport, and application. Its mapping to OSI is approximate; functions from several OSI layers can be grouped into TCP/IP application. As data moves down the stack, transport, IP, and then link headers are added (encapsulation); the receiver removes them in reverse order.\n\nLink addresses can change at each hop, while IP addresses normally remain end-to-end (with exceptions such as NAT). A router removes the link header and chooses the next hop using the IP destination."
        ),
        example: l("Ilova: HTTP so‘rovi\nTransport: TCP segment\nInternet: IP paket\nLink: Ethernet frame\nMuhit: bitlar/signallar"),
        exampleExplanation: l("Bu qatlamlash misoli: HTTP ichidagi ma’lumot TCP ichida, TCP IP ichida, IP esa Ethernet freymi ichida uzatiladi. Har bir qatlam faqat o‘z sarlavhasi va keyingi qatlam xizmatidan foydalanadi.", "Это пример слоёв: данные HTTP передаются внутри TCP, TCP — внутри IP, IP — внутри Ethernet-кадра. Каждый уровень добавляет свой заголовок и использует службу нижележащего уровня.", "This is an encapsulation example: HTTP data travels inside TCP, TCP inside IP, and IP inside an Ethernet frame. Each layer adds its header and uses the service of the layer below.")
      },
      {
        title: l("3. Ethernet, IP, TCP/UDP va ilova protokollari", "3. Ethernet, IP, TCP/UDP и прикладные протоколы", "3. Ethernet, IP, TCP/UDP, and application protocols"),
        content: l(
          "Ethernet freymlarni mahalliy segmentda MAC manzillar yordamida yetkazadi; MAC manzil router orqali boshqa IP tarmoqqa o‘zgarmasdan o‘tmaydi. IPv4 32 bitli manzil va subnet mask/prefiks yordamida tarmoqni aniqlaydi; prefiksdagi 1 bitlar tarmoq qismini bildiradi. Masalan, /24 = 255.255.255.0. 192.168.127.16/24 bilan 192.168.128.16/24 bitta subnetda emas.\n\nTCP ulanishni uch bosqichli SYN → SYN/ACK → ACK handshake bilan ochadi, tartib va qayta uzatishni boshqaradi. UDP ulanish o‘rnatmaydigan datagram tashiydi; ilova yo‘qolishni o‘zi boshqarishi mumkin. Portlar host ichidagi xizmatlarni ajratadi: DNS 53, HTTP 80, HTTPS 443; port raqami o‘zi trafik tarkibini tasdiqlamaydi. Telnet/FTP kabi eski protokollar ma’lumotni shifrlamasdan yuborishi mumkin.",
          "Ethernet доставляет локальные кадры по MAC-адресам; MAC не проходит через маршрутизаторы неизменным к другой IP-сети. IPv4 использует 32-битный адрес и маску/префикс для определения сети; единичные биты префикса указывают сетевую часть. Например, /24 = 255.255.255.0. 192.168.127.16/24 и 192.168.128.16/24 находятся в разных подсетях.\n\nTCP открывает соединение рукопожатием SYN → SYN/ACK → ACK и обеспечивает порядок и повторную передачу. UDP переносит датаграммы без установления соединения; обработка потерь может остаться приложению. Порты различают службы на узле: DNS 53, HTTP 80, HTTPS 443; порт сам по себе не доказывает содержимое трафика. Устаревшие Telnet/FTP могут передавать данные без шифрования.",
          "Ethernet delivers local frames using MAC addresses; a MAC address does not pass unchanged through a router to another IP network. IPv4 uses a 32-bit address and subnet mask/prefix to identify the network; prefix one-bits define the network portion. For example, /24 = 255.255.255.0. 192.168.127.16/24 and 192.168.128.16/24 are different subnets.\n\nTCP opens a connection with SYN → SYN/ACK → ACK and handles ordering and retransmission. UDP carries connectionless datagrams; the application may handle loss. Ports distinguish services on a host: DNS 53, HTTP 80, HTTPS 443; a port alone does not prove the traffic contents. Legacy Telnet/FTP may transmit data without encryption."
        ),
        example: l("IP: 192.168.127.16/24 → tarmoq 192.168.127.0/24\nIP: 192.168.128.16/24 → boshqa tarmoq\nTCP handshake: SYN → SYN/ACK → ACK\nWireshark filter: tcp.port == 443"),
        exampleExplanation: l("Subnetni ajratishda manzilning 32 bitini maska bilan taqqoslang. Bir xil /24 bo‘lishi uchun birinchi uch oktet teng bo‘lishi kerak. `tcp.port == 443` Wireshark display filteri bo‘lib, paketni o‘zgartirmaydi.", "Сопоставьте 32 бита адреса с маской. Для одной /24 первые три октета должны совпадать. `tcp.port == 443` — display-фильтр Wireshark; он не меняет пакеты.", "Compare the address's 32 bits to the mask. For the same /24, the first three octets must match. `tcp.port == 443` is a Wireshark display filter; it does not change packets."),
      },
      {
        title: l("4. Wireshark’da yozib olish va displey filtrlari", "4. Захват в Wireshark и display-фильтры", "4. Capturing and display filters in Wireshark"),
        content: l(
          "Wireshark tarmoq interfeysidan paketlarni jonli yozib oladi yoki avval saqlangan PCAP/PCAPNG faylini tahlil qiladi. To‘g‘ri adapter tanlang va faqat ruxsat etilgan sinov trafikini cheklangan vaqt davomida yozing. Capture filter yozuv boshlanishidan oldin saqlanadigan paketlarni cheklaydi; display filter esa tayyor yozuv ichidan ekranda ko‘rsatiladigan paketlarni tanlaydi.\n\nCapture filter misoli: `host 192.0.2.10`. Display filter misollari: `dns`, `icmp`, `tcp.port == 443`. Yozuvda maxfiy ma’lumot bo‘lishi mumkin; uni himoyalab saqlang va ommaga tarqatmang. Interfeys nomi va yozib olish huquqi operatsion tizim hamda drayverga bog‘liq.",
          "Wireshark захватывает пакеты с интерфейса в реальном времени или открывает готовый PCAP/PCAPNG офлайн. Выберите правильный адаптер и записывайте только разрешённый тестовый трафик ограниченное время. Capture filter ограничивает сохраняемые пакеты до начала записи; display filter выбирает, что показывать из уже сохранённого захвата.\n\nПример capture filter: `host 192.0.2.10`. Примеры display filter: `dns`, `icmp`, `tcp.port == 443`. Захват может содержать секреты: храните его защищённо и не публикуйте. Имена интерфейсов и права захвата зависят от ОС и драйверов.",
          "Wireshark captures packets from an interface live or opens an existing PCAP/PCAPNG offline. Select the correct adapter and capture only authorized test traffic for a limited time. A capture filter limits what is saved before capture starts; a display filter selects what to show from an existing capture.\n\nExample capture filter: `host 192.0.2.10`. Display-filter examples: `dns`, `icmp`, `tcp.port == 443`. Captures may contain secrets: store them securely and never publish them. Interface names and capture privileges depend on the OS and drivers."
        ),
        example: l("Capture filter (BPF): host 192.0.2.10\nDisplay filter: dns\nDisplay filter: tcp.port == 443\nFayl: File → Save As… → lab-capture.pcapng"),
        exampleExplanation: l("Birinchi filter yoziladigan trafikni chegaralaydi, qolganlari yozib olingandan keyin ko‘rinishni qisqartiradi. `192.0.2.10` TEST-NET manzili bo‘lib, o‘z laboratoriyangizdagi host manziliga almashtiring; begonalar trafikini yozib olmang.", "Первый фильтр ограничивает запись, остальные сужают отображение после захвата. `192.0.2.10` — TEST-NET, замените его адресом узла вашей лаборатории; не захватывайте чужой трафик.", "The first filter limits capture; the others narrow the display after capture. `192.0.2.10` is TEST-NET—replace it with a host in your own lab. Do not capture others' traffic."),
        images: [
          {
            src: "/learning-assets/network-fundamentals/04-packet-analysis-part-1-page-02-image-01.png",
            alt: l("Kali Linux ilovalar menyusida Wireshark va tarmoq vositalari ko‘rsatilgan ekran tasviri.", "Снимок меню приложений Kali Linux с Wireshark и сетевыми инструментами.", "Screenshot of the Kali Linux applications menu with Wireshark and networking tools."),
            caption: l("Wireshark’ni ishga tushirish menyusi.", "Меню запуска Wireshark.", "Menu for starting Wireshark."),
            width: 1830,
            height: 1440
          },
          {
            src: "/learning-assets/network-fundamentals/04-packet-analysis-part-1-page-03-image-01.png",
            alt: l("Wireshark capture filter oynasi va tayyor filter iboralari.", "Окно capture-фильтров Wireshark с примерами выражений.", "Wireshark capture-filter dialog with example filter expressions."),
            caption: l("Capture filter yozuv boshlanishidan oldin tanlanadi.", "Capture-фильтр выбирается до начала записи.", "A capture filter is selected before recording starts."),
            width: 2366,
            height: 1156
          },
          {
            src: "/learning-assets/network-fundamentals/04-packet-analysis-part-1-page-04-image-01.png",
            alt: l("Wireshark jonli capture interfeysi ro‘yxati va tanlangan host filter.", "Список интерфейсов live-захвата Wireshark и выбранный фильтр host.", "Wireshark live-capture interface list and selected host filter."),
            caption: l("Tarmoq interfeysi va capture filterini tanlash.", "Выбор сетевого интерфейса и capture-фильтра.", "Selecting a network interface and capture filter."),
            width: 1734,
            height: 954
          },
          {
            src: "/learning-assets/network-fundamentals/04-packet-analysis-part-1-page-05-image-01.png",
            alt: l("Wireshark’da TLS paketlari ro‘yxati va tanlangan paketning protokol tafsilotlari.", "Список TLS-пакетов Wireshark и детали выбранного пакета.", "Wireshark TLS packet list and protocol details for a selected packet."),
            caption: l("Paketlar ro‘yxati, tanlangan paket qatlamlari va baytlar ko‘rinishi.", "Список пакетов, уровни выбранного пакета и байты.", "Packet list, selected packet layers, and byte view."),
            width: 2558,
            height: 1370
          },
          {
            src: "/learning-assets/network-fundamentals/04-packet-analysis-part-1-page-06-image-01.png",
            alt: l("Wireshark’da HTTP display filter qo‘llangandan keyingi paketlar jadvali.", "Таблица пакетов Wireshark после применения HTTP display-фильтра.", "Wireshark packet list after applying an HTTP display filter."),
            caption: l("Yozib olingan trafikdan HTTP paketlarini ajratib ko‘rsatish.", "Фильтрация HTTP-пакетов в захваченном трафике.", "Filtering HTTP packets in a capture."),
            width: 2558,
            height: 1432
          },
          {
            src: "/learning-assets/network-fundamentals/04-packet-analysis-part-1-page-07-image-01.png",
            alt: l("Wireshark’da tanlangan HTTP so‘rovining paket tafsilotlari va xom baytlari.", "Детали HTTP-запроса и необработанные байты в Wireshark.", "Selected HTTP request details and raw bytes in Wireshark."),
            caption: l("HTTP so‘rovi va unga tegishli paket tafsilotlari.", "HTTP-запрос и детали соответствующего пакета.", "HTTP request and its packet details."),
            width: 3344,
            height: 1978
          }
        ],
      },
      {
        title: l("5. TCP oqimini kuzatish va tcpdump", "5. Просмотр TCP-потока и tcpdump", "5. Following TCP streams and using tcpdump"),
        content: l(
          "Paketlar yozib olingandan keyin Wireshark ularni filtrlash, bitta TCP oqimini kuzatish va paket tafsilotlarini tekshirishga yordam beradi. `Follow TCP Stream` aloqaning ketma-ketligini qulay ko‘rsatadi, lekin TLS bilan shifrlangan payload’ni kalitsiz ochib bermaydi. Retransmission yoki out-of-order belgilari o‘z-o‘zidan sababni isbotlamaydi; tarmoq sharoiti va ikkala tomon holatini solishtiring.\n\n`tcpdump` terminalda paketlarni ko‘rish yoki PCAP faylga yozish uchun ishlatiladi. Paketlarni yozib olish maxfiylik xavfini tug‘diradi: interfeys, host, port va yozuv hajmini ruxsat doirasida cheklang; kerak bo‘lsa faqat sarlavhalarni saqlang; PCAP fayllarini maxfiy ma’lumotdek himoyalang.",
          "После захвата Wireshark позволяет фильтровать пакеты, просматривать отдельный TCP-поток и изучать детали. `Follow TCP Stream` упорядочивает обмен, но не раскрывает payload TLS без ключей. Retransmission и out-of-order сами по себе не доказывают причину неисправности; сравните сеть и состояние обеих сторон.\n\n`tcpdump` просматривает пакеты в терминале или сохраняет PCAP. Захват несёт риск для приватности: ограничивайте интерфейс, узел, порт и объём разрешёнными рамками; при необходимости сохраняйте только заголовки; защищайте PCAP как секретные данные.",
          "After capture, Wireshark can filter packets, follow a single TCP stream, and inspect packet details. `Follow TCP Stream` presents the exchange in sequence but cannot reveal TLS payload without keys. Retransmission or out-of-order flags alone do not prove a root cause; compare network conditions and both endpoints.\n\n`tcpdump` inspects packets in a terminal or saves PCAPs. Captures create privacy risks: limit interface, host, port, and volume to authorized scope; capture headers only when appropriate; protect PCAP files as sensitive data."
        ),
        example: l("Wireshark display: tcp.stream eq 0\nWireshark display: tcp.analysis.retransmission\ntcpdump (faqat ruxsatli lab):\nsudo tcpdump -i eth0 -nn -c 20 'host 192.0.2.10'"),
        exampleExplanation: l("`tcp.stream eq 0` tanlangan oqimni ajratadi; stream raqami capture fayliga xos. Ikkinchi filter qayta uzatish deb belgilangan TCP segmentlarini ko‘rsatadi. `-c 20` yozuvni 20 paket bilan to‘xtatadi; `eth0` va TEST-NET manzilini o‘z lab’ingizga moslang.", "`tcp.stream eq 0` выбирает поток, его номер относится к конкретному захвату. Второй фильтр показывает TCP-сегменты с отметкой retransmission. `-c 20` ограничивает захват 20 пакетами; замените `eth0` и TEST-NET адрес узлами вашей лаборатории.", "`tcp.stream eq 0` selects a stream; stream IDs are local to a capture. The second filter shows TCP segments marked as retransmissions. `-c 20` stops after 20 packets; adapt `eth0` and the TEST-NET address to your own lab."),
      },
      {
        title: l("6. ARP, ICMP va DHCP yordamchi protokollari", "6. Вспомогательные протоколы ARP, ICMP и DHCP", "6. ARP, ICMP, and DHCP helper protocols"),
        content: l(
          "ARP mahalliy IPv4 tarmog‘ida ma’lum IP manzilga mos MAC manzilni topadi: so‘rov odatda broadcast bo‘ladi, javobda MAC ko‘rsatiladi. Natija ARP/neighbor keshida vaqtincha saqlanadi. ARP router orqali o‘tmaydi va o‘zi autentifikatsiya qilinmaydi; shu sababli switch siyosati qo‘llaydigan ARP soxtalashtirishdan himoya choralarini ko‘rib chiqing.\n\nICMP IP tarmog‘i uchun nazorat va xato xabarlarini tashiydi; `ping` echo request/reply’dan foydalanadi, ammo firewall javobni bloklashi mumkin — bitta ping muvaffaqiyatsizligi host o‘chganini isbotlamaydi. DHCPv4 client odatda DORA — Discover, Offer, Request, Acknowledge — ketma-ketligida manzil, gateway va DNS sozlamalarini ijara muddati bilan oladi.",
          "ARP ищет MAC-адрес для известного IPv4-адреса в локальной сети: запрос обычно broadcast, ответ содержит MAC. Результат временно хранится в ARP/neighbor-кэше. ARP не проходит через маршрутизатор и не аутентифицирован, поэтому необходимы меры защиты от подмены ARP, поддерживаемые политикой коммутатора.\n\nICMP передаёт служебные и ошибочные сообщения IP-сети; `ping` использует echo request/reply, но ответ может блокироваться firewall — один неудачный ping не доказывает, что узел выключен. Клиент DHCPv4 обычно получает настройки последовательностью DORA: Discover, Offer, Request, Acknowledge; адрес, шлюз и DNS выдаются на срок аренды.",
          "ARP resolves a known IPv4 address to a MAC address on a local network: requests are typically broadcast and replies contain a MAC. Results are cached temporarily. ARP is not routed and is unauthenticated, so controls supported by the switch policy are needed to detect or prevent ARP spoofing.\n\nICMP carries IP-network control and error messages; `ping` uses echo requests/replies, but a firewall may block them, so one failed ping does not prove a host is down. A DHCPv4 client commonly obtains settings in DORA order: Discover, Offer, Request, Acknowledge; address, gateway, and DNS options are leased."
        ),
        example: l("Linux: ip neigh show\nLinux: ping -c 4 192.0.2.1\nWindows: arp -a\nWireshark: arp || icmp || bootp"),
        exampleExplanation: l("Bular kuzatuv/diagnostika buyruqlari va display filterlari; IP manzilini o‘zingizning izolatsiyalangan laboratoriyangizdagi host bilan almashtiring. DHCP paketlari ayrim Wireshark versiyalarida BOOTP nomi bilan ko‘rinadi.", "Это диагностические команды и display-фильтры; замените адрес IP узлом своей изолированной лаборатории. В некоторых версиях Wireshark DHCP-пакеты обозначены как BOOTP.", "These are inspection commands and display filters; replace the IP with a host in your isolated lab. Some Wireshark versions label DHCP packets as BOOTP."),
      },
      {
        title: l("7. Marshrutlash, firewall/ACL, NAT/PAT va VPN", "7. Маршрутизация, firewall/ACL, NAT/PAT и VPN", "7. Routing, firewalls/ACLs, NAT/PAT, and VPNs"),
        content: l(
          "Marshrutlash jadvali manzil prefiksi, next-hop/interfeys va metric’ni ko‘rsatadi. Router eng uzun mos prefiksni tanlaydi; `0.0.0.0/0` esa aniqroq yo‘l topilmaganda qo‘llanadigan standart marshrutdir. Firewall/ACL qoidalari tartib, yo‘nalish, ulanish holati va yashirin deny/allow siyosatiga qarab ishlashi mumkin; qoida satrlarini platformaning standart siyosati bilan birga tekshiring.\n\nNAT ichki manzilni o‘zgartiradi; PAT portlardan foydalanib ko‘p oqimni bitta tashqi IPv4 manzil bilan ulashadi. NATning o‘zi firewall emas. VPN qurilmalar/tarmoqlar orasida shifrlangan tunnel yaratadi; marshrut, peer identifikatori, sertifikat/kalit va jurnalni faqat o‘zingiz boshqaradigan ulanishda tekshiring. VPN maxfiy sozlamalari yoki kalitlarini kursga va skrinshotlarga joylamang.",
          "Таблица маршрутизации содержит префикс назначения, next hop/интерфейс и метрику. Маршрутизатор выбирает самое длинное совпадение префикса; `0.0.0.0/0` — маршрут по умолчанию, если более точного нет. Firewall/ACL оценивает правила с учётом порядка, направления и состояния, иногда с неявным запретом/разрешением; проверяйте строки правил вместе с политикой платформы.\n\nNAT меняет внутренний адрес; PAT различает потоки по портам и использует один внешний IPv4. NAT сам по себе не является firewall. VPN создаёт шифрованный туннель между узлами/сетями; проверяйте маршруты, peer identity, сертификаты/ключи и журналы только на принадлежащем вам соединении. Не размещайте секретную конфигурацию VPN и ключи в курсе или скриншотах.",
          "A routing table stores destination prefixes, next hops/interfaces, and metrics. A router selects the longest matching prefix; `0.0.0.0/0` is the default route when no more-specific route matches. Firewalls/ACLs evaluate rule order, direction, and state, sometimes with implicit deny/allow; inspect rule entries together with the platform's default policy.\n\nNAT changes an internal address; PAT distinguishes flows by ports while sharing one external IPv4 address. NAT alone is not a firewall. A VPN builds an encrypted tunnel between devices/networks; inspect routes, peer identity, certificates/keys, and logs only on connections you own. Do not publish private VPN configuration or keys in course material or screenshots."
        ),
        example: l("Linux: ip route show\nWindows: route print\nLinux firewall (faqat o‘qish): sudo nft list ruleset\nRouting filter: icmp || tcp.port == 443"),
        exampleExplanation: l("`ip route show`, `route print` va `nft list ruleset` joriy holatni o‘qiydi. `nft list ruleset` chiqishi ichki IP va policy ma’lumotini ko‘rsatishi mumkin, shuning uchun uni oshkor qilishdan oldin maxfiy ma’lumotlarini olib tashlang. Router yoki firewall konfiguratsiyasini o‘zgartirish bu misollarning maqsadi emas.", "`ip route show`, `route print` и `nft list ruleset` только читают текущее состояние. Вывод `nft list ruleset` может содержать внутренние IP и политики; очистите секреты перед публикацией. Эти примеры не меняют конфигурацию маршрутизатора/firewall.", "`ip route show`, `route print`, and `nft list ruleset` inspect current state. `nft list ruleset` output may expose internal IPs and policy details; sanitize it before sharing. These examples do not change router or firewall configuration."),
      }
    ]
  },
  {
    slug: "linux-fundamentals",
    title: l("Linux asoslari", "Основы Linux", "Linux Fundamentals"),
    summary: l("Buyruq qatori, fayl tizimi, foydalanuvchilar va xizmatlar.", "Командная строка, файловая система, пользователи и службы.", "Command line, filesystem, users and services."),
    difficulty: "fundamental", category: "systems", hours: 5, hasLab: true,
    sections: [
      {
        title: l("Shell va fayl tizimi", "Оболочка и файловая система", "Shell and filesystem"),
        content: l(
          "Shell buyruqlarni qabul qilib, dasturlarni ishga tushiradi; kataloglar `/` ildizidan boshlanadi. `~` joriy foydalanuvchi uy katalogini anglatadi. Fayllarni avval ro‘yxatlang, so‘ng maqsadli o‘qing; `sudo` bilan noma’lum buyruqni ishga tushirmang.",
          "Оболочка принимает команды и запускает программы; дерево каталогов начинается с корня `/`. `~` обозначает домашний каталог пользователя. Сначала просматривайте список файлов, затем читайте нужные; не запускайте неизвестные команды через `sudo`.",
          "A shell accepts commands and launches programs; the directory tree starts at `/`. `~` represents the current user's home directory. List files before reading them, and do not run unfamiliar commands with `sudo`."
        ),
        example: l("pwd\nls -lah ~/Documents\nmkdir -p ~/lab/network-notes\ncp notes.txt ~/lab/network-notes/", "pwd\nls -lah ~/Documents\nmkdir -p ~/lab/network-notes\ncp notes.txt ~/lab/network-notes/", "pwd\nls -lah ~/Documents\nmkdir -p ~/lab/network-notes\ncp notes.txt ~/lab/network-notes/"),
        exampleExplanation: l(
          "`pwd` joriy yo‘lni chiqaradi, `ls -lah` yashirin fayllarni ham ko‘rsatadi, `mkdir -p` ichma-ich katalog yaratadi, `cp` fayl nusxalaydi. `notes.txt` misol fayl nomi; o‘zingizdagi nom bilan almashtiring.",
          "`pwd` выводит текущий путь, `ls -lah` показывает и скрытые файлы, `mkdir -p` создаёт вложенные каталоги, `cp` копирует файл. `notes.txt` — пример имени, замените его своим.",
          "`pwd` prints the current path, `ls -lah` includes hidden files, `mkdir -p` creates parent directories, and `cp` copies a file. `notes.txt` is a placeholder filename; replace it with your own."
        ),
        question: { prompt: l("Joriy papkani ko‘rsatuvchi buyruq?", "Команда, показывающая текущий каталог?", "Which command prints the current directory?"), answers: ["pwd"] }
      },
      {
        title: l("Foydalanuvchilar va ruxsatlar", "Пользователи и права доступа", "Users and permissions"),
        content: l(
          "Linux ruxsatlari egasi, guruh va boshqalar uchun o‘qish (r), yozish (w), bajarish (x) huquqlarini ajratadi. Masalan, 640 egaga o‘qish/yozish, guruhga faqat o‘qish, boshqalarga esa ruxsat bermaydi. Kerakli eng kam huquq tamoyiliga amal qiling; maxfiy fayllarga 777 bermang.",
          "Права Linux задают чтение (r), запись (w) и выполнение (x) для владельца, группы и остальных. Например, 640 разрешает владельцу чтение и запись, группе — только чтение, остальным — ничего. Соблюдайте принцип минимальных привилегий и не назначайте конфиденциальным файлам права 777.",
          "Linux permissions grant read (r), write (w), and execute (x) to an owner, group, and others. Mode 640 lets the owner read/write, the group read, and denies access to others. Follow least privilege; never make sensitive files world-writable with 777."
        ),
        example: l("chmod 640 report.txt\nchown analyst:security report.txt\nid analyst", "chmod 640 report.txt\nchown analyst:security report.txt\nid analyst", "chmod 640 report.txt\nchown analyst:security report.txt\nid analyst"),
        exampleExplanation: l(
          "`chmod 640` ruxsatlarni o‘zgartiradi; `chown` egasi/guruhni tayinlaydi; `id` foydalanuvchi guruhlarini ko‘rsatadi. Faqat o‘zingiz boshqaradigan laboratoriya fayllarida qo‘llang; egasi yoki guruhni almashtirish administrator huquqini talab qilishi mumkin.",
          "`chmod 640` меняет права, `chown` задаёт владельца и группу, `id` показывает группы пользователя. Используйте только на своих лабораторных файлах; смена владельца может требовать прав администратора.",
          "`chmod 640` changes permissions, `chown` sets owner and group, and `id` lists a user's groups. Use these only on files in your lab; changing ownership may require administrator privileges."
        )
      },
      {
        title: l("Xizmatlar va loglar", "Службы и журналы", "Services and logs"),
        content: l(
          "Xizmatlar fonda tarmoq va tizim vazifalarini bajaradi. Systemd tizimlarida `systemctl status` ishlash holatini, `journalctl` esa jurnal yozuvlarini ko‘rsatadi. Loglar vaqt, jarayon va xato sababini bog‘lashga yordam beradi; vaqt zonasi va tizim soati to‘g‘ri ekanini ham tekshiring.",
          "Службы выполняют фоновые системные и сетевые задачи. В системах с systemd команда `systemctl status` показывает состояние, а `journalctl` — записи журнала. Журналы помогают сопоставить время, процесс и причину ошибки; проверяйте часовой пояс и системное время.",
          "Services perform background system and network tasks. On systemd hosts, `systemctl status` shows service state and `journalctl` displays logs. Logs help correlate time, process, and error cause; also verify the clock and time zone."
        ),
        example: l("systemctl status ssh\njournalctl -u ssh --since today\nsystemctl is-enabled ssh", "systemctl status ssh\njournalctl -u ssh --since today\nsystemctl is-enabled ssh", "systemctl status ssh\njournalctl -u ssh --since today\nsystemctl is-enabled ssh"),
        exampleExplanation: l(
          "Buyruqlar SSH xizmatining holati, bugungi loglari va avtomatik ishga tushish sozlamasini faqat o‘qiydi. Xizmat nomi tarqatmaga qarab `ssh` yoki `sshd` bo‘lishi mumkin.",
          "Команды только читают состояние службы SSH, сегодняшние записи журнала и настройку автозапуска. Имя службы может быть `ssh` или `sshd` в зависимости от дистрибутива.",
          "These commands only inspect SSH service state, today's logs, and whether it starts at boot. The service may be named `ssh` or `sshd`, depending on distribution."
        )
      }
    ]
  },
  {
    slug: "windows-fundamentals",
    title: l("Windows va Active Directory asoslari", "Основы Windows и Active Directory", "Windows and Active Directory Basics"),
    summary: l("Windows arxitekturasi, boshqaruv vositalari va domen muhiti.", "Архитектура Windows, средства управления и доменная среда.", "Windows architecture, admin tools and domain environment."),
    difficulty: "easy", category: "systems", hours: 6, hasLab: true,
    sections: [
      {
        title: l("Windows arxitekturasi", "Архитектура Windows", "Windows architecture"),
        content: l(
          "Windows ish stoli va Windows Server birgalikda yadro, xizmatlar, registr, fayl tizimi va foydalanuvchi sessiyalaridan foydalanadi. Administrator muammolarni hodisalar jurnali, Task Manager va PowerShell bilan tekshiradi. Buyruqni yuqori huquqda bajarishdan oldin nima o‘zgartirishini tekshiring.",
          "Windows для рабочих станций и Windows Server используют ядро, службы, реестр, файловую систему и пользовательские сеансы. Администраторы исследуют проблемы через журнал событий, диспетчер задач и PowerShell. Перед выполнением команды с повышенными правами проверяйте её влияние.",
          "Windows desktop and Windows Server use a kernel, services, registry, filesystem, and user sessions. Administrators investigate issues with Event Viewer, Task Manager, and PowerShell. Check what a command changes before running it elevated."
        ),
        example: l("Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion\nGet-Service | Where-Object Status -eq 'Running' | Select-Object -First 10 Name, Status\nGet-WinEvent -LogName System -MaxEvents 5", "Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion\nGet-Service | Where-Object Status -eq 'Running' | Select-Object -First 10 Name, Status\nGet-WinEvent -LogName System -MaxEvents 5", "Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion\nGet-Service | Where-Object Status -eq 'Running' | Select-Object -First 10 Name, Status\nGet-WinEvent -LogName System -MaxEvents 5"),
        exampleExplanation: l(
          "Misollar Windows versiyasi, ishlayotgan xizmatlar va System jurnalidagi so‘nggi yozuvlarni faqat o‘qiydi. PowerShell’ni oddiy foydalanuvchi sifatida ishga tushirib ko‘ring.",
          "Примеры только читают версию Windows, работающие службы и последние записи журнала System. Сначала запускайте PowerShell от обычного пользователя.",
          "These examples only read the Windows version, running services, and latest System log entries. Try them in a standard, non-elevated PowerShell session."
        )
      },
      {
        title: l("Active Directory kirish", "Введение в Active Directory", "Introduction to Active Directory"),
        content: l(
          "Active Directory Domain Services (AD DS) markazlashgan katalogda foydalanuvchi, kompyuter, guruh va resurs obyektlarini saqlaydi. Domain Controller autentifikatsiya va siyosat xizmatlarini taqdim etadi. OU va guruhlar delegatsiya hamda boshqaruvni tartibga soladi; DNS esa domen xizmatlarini topishda zarur.",
          "Active Directory Domain Services (AD DS) хранит объекты пользователей, компьютеров, групп и ресурсов в централизованном каталоге. Контроллер домена предоставляет аутентификацию и политики. OU и группы помогают организовать управление и делегирование; DNS необходим для обнаружения служб домена.",
          "Active Directory Domain Services (AD DS) stores user, computer, group, and resource objects in a centralized directory. A Domain Controller provides authentication and policy services. OUs and groups organize management and delegation; DNS is essential for locating domain services."
        ),
        example: l("whoami /all\nnltest /dsgetdc:corp.example", "whoami /all\nnltest /dsgetdc:corp.example", "whoami /all\nnltest /dsgetdc:corp.example"),
        exampleExplanation: l(
          "`whoami /all` joriy hisob va guruhlarini ko‘rsatadi. `nltest` dagi `corp.example` o‘rniga o‘zingizning ruxsat berilgan laboratoriya domeningizni yozing; buyruq domen kontrollerini topadi.",
          "`whoami /all` показывает текущую учётную запись и группы. Замените `corp.example` в `nltest` на домен вашей разрешённой лаборатории; команда находит контроллер домена.",
          "`whoami /all` displays the current account and groups. Replace `corp.example` in `nltest` with your authorized lab domain; the command discovers a domain controller."
        )
      },
      {
        title: l("Group Policy asoslari", "Основы групповых политик", "Group Policy basics"),
        content: l(
          "Group Policy (GPO) Windows domenidagi foydalanuvchi va kompyuter sozlamalarini markazlashgan boshqaradi. GPO domen, sayt yoki OU ga bog‘lanishi va xavfsizlik guruhlari orqali filtrlashi mumkin. Avval natijaviy siyosatni hisobotda tekshirib, kichik test OU da sinang; to‘g‘ridan-to‘g‘ri keng doiraga tatbiq qilmang.",
          "Group Policy (GPO) централизованно управляет настройками пользователей и компьютеров в домене Windows. GPO связывают с доменом, сайтом или OU и фильтруют по группам безопасности. Сначала проверьте итоговые параметры в отчёте и испытайте их на небольшой тестовой OU; не применяйте сразу ко всему домену.",
          "Group Policy (GPO) centrally manages user and computer settings in a Windows domain. A GPO can link to a domain, site, or OU and be filtered by security groups. Review resultant settings and test in a small OU before applying changes broadly."
        ),
        example: l("gpresult /scope computer /r\ngpresult /h \"$env:TEMP\\policy-report.html\"", "gpresult /scope computer /r\ngpresult /h \"$env:TEMP\\policy-report.html\"", "gpresult /scope computer /r\ngpresult /h \"$env:TEMP\\policy-report.html\""),
        exampleExplanation: l(
          "`gpresult` amalda qo‘llangan siyosatlarni ko‘rsatadi; HTML hisobot vaqtinchalik katalogda saqlanadi. Bu buyruqlar GPO ni o‘zgartirmaydi.",
          "`gpresult` показывает применённые политики; HTML-отчёт сохраняется во временный каталог. Команды не меняют GPO.",
          "`gpresult` reports applied policies; the HTML report is saved in the temporary directory. These commands do not modify GPOs."
        )
      }
    ]
  },
  {
    slug: "mikrotik-routeros-basics",
    title: l("MikroTik RouterOS asoslari", "Основы MikroTik RouterOS", "MikroTik RouterOS Basics"),
    summary: l("RouterOS interfeysi, firewall/NAT, VLAN va Wi-Fi sozlamalari.", "Интерфейс RouterOS, firewall/NAT, VLAN и Wi-Fi.", "RouterOS interface, firewall/NAT, VLAN and Wi-Fi."),
    difficulty: "easy", category: "networking", hours: 8, hasLab: true,
    sections: [
      {
        title: l("RouterOS va WinBox", "RouterOS и WinBox", "RouterOS and WinBox"),
        content: l(
          "RouterOS router va access-pointlarni boshqaradi. WinBox grafik interfeys, terminal esa RouterOS CLI buyruqlarini beradi. Avval qurilma modeli, RouterOS versiyasi, konfiguratsiya zaxirasi va boshqaruv manzillarini aniqlang. Masofaviy boshqaruvni internetga ochmang; boshqaruvni ishonchli LAN yoki VPN bilan cheklang.",
          "RouterOS управляет маршрутизаторами и точками доступа. WinBox предоставляет графический интерфейс, а терминал — команды RouterOS CLI. Сначала определите модель, версию RouterOS, наличие резервной копии и адреса управления. Не открывайте удалённое управление в интернет; ограничьте его доверенной LAN или VPN.",
          "RouterOS manages routers and access points. WinBox provides a graphical interface; the terminal accepts RouterOS CLI commands. First identify the device model, RouterOS version, backup status, and management addresses. Do not expose management to the internet; restrict it to a trusted LAN or VPN."
        ),
        example: l("/system resource print\n/system package update check-for-updates\n/export file=before-lab", "/system resource print\n/system package update check-for-updates\n/export file=before-lab", "/system resource print\n/system package update check-for-updates\n/export file=before-lab"),
        exampleExplanation: l(
          "Birinchi buyruq resurslarni ko‘rsatadi, ikkinchisi yangilanishni tekshiradi, uchinchisi konfiguratsiya eksportini yaratadi. Export faylida maxfiy ma’lumotlar bo‘lishi mumkin — uni ommaga ulashmang va o‘zgarishdan oldin xavfsiz saqlang.",
          "Первая команда показывает ресурсы, вторая проверяет обновления, третья создаёт экспорт конфигурации. Экспорт может содержать секреты — не публикуйте его и храните безопасно.",
          "The first command shows resources, the second checks for updates, and the third exports configuration. Exports may contain secrets—do not publish them, and store them securely."
        )
      },
      {
        title: l("Firewall va NAT", "Firewall и NAT", "Firewall and NAT"),
        content: l(
          "Firewall trafikni interfeys, manba, manzil va connection holatiga ko‘ra qabul qiladi yoki rad etadi. `input` routerga yo‘naltirilgan, `forward` esa router orqali o‘tadigan trafik uchun. NAT manzilni o‘zgartiradi, lekin o‘zi ruxsat nazoratining o‘rnini bosmaydi. Avval konfiguratsiya zaxirasi oling va qoidalarni laboratoriyada sinang; noto‘g‘ri input qoidasi boshqaruv ulanishini uzishi mumkin.",
          "Firewall разрешает или отклоняет трафик по интерфейсу, источнику, назначению и состоянию соединения. Цепочка `input` относится к самому маршрутизатору, `forward` — к проходящему через него трафику. NAT меняет адреса, но не заменяет контроль доступа. Сначала сохраните конфигурацию и проверьте правила в лаборатории: неверное правило input может заблокировать управление.",
          "A firewall accepts or drops traffic based on interface, source, destination, and connection state. The `input` chain protects the router itself; `forward` handles traffic passing through it. NAT translates addresses but does not replace access control. Back up and test rules in a lab first—an incorrect input rule can lock out management."
        ),
        example: l("/ip firewall filter print stats\n/ip firewall nat print stats\n/ip firewall connection print count-only", "/ip firewall filter print stats\n/ip firewall nat print stats\n/ip firewall connection print count-only", "/ip firewall filter print stats\n/ip firewall nat print stats\n/ip firewall connection print count-only"),
        exampleExplanation: l(
          "Bu RouterOS buyruqlari mavjud filter/NAT qoidalari va faol ulanishlar sonini kuzatadi; konfiguratsiyani o‘zgartirmaydi. Ichki tarmoqdan internetga manzil tarjimasi ko‘pincha `srcnat`/`masquerade` bilan qilinadi, ammo faqat WAN/LAN interfeyslari aniq belgilanganda.",
          "Команды RouterOS показывают существующие правила filter/NAT и число активных соединений; конфигурация не меняется. Для выхода LAN в интернет часто используют `srcnat`/`masquerade`, но только при корректно определённых интерфейсах WAN/LAN.",
          "These RouterOS commands inspect existing filter/NAT rules and active connection counts without changing configuration. LAN internet egress commonly uses `srcnat`/`masquerade`, but only when WAN/LAN interfaces are correctly identified."
        ),
        question: { prompt: l("Ichki tarmoqni internetga chiqarish uchun qaysi NAT turi ishlatiladi? (masquerade/…)", "Какой тип NAT используется для выхода в интернет? (masquerade/…)", "Which NAT action is typically used for internet access? (masquerade/…)"), answers: ["masquerade"] }
      },
      {
        title: l("VLAN va Wi-Fi", "VLAN и Wi-Fi", "VLAN and Wi-Fi"),
        content: l(
          "VLAN qurilmalarni bir fizik switchda alohida mantiqiy tarmoqlarga ajratadi. Access port odatda bitta VLAN uchun, trunk port esa teglar bilan bir nechta VLAN uchun ishlatiladi. Wi-Fi SSID ni VLAN ga bog‘lash orqali xodim, mehmon va IoT qurilmalarini ajrating; ular orasidagi marshrutlashda faqat zarur xizmatlarga ruxsat bering.",
          "VLAN логически разделяет устройства на одном физическом коммутаторе. Access-порт обычно относится к одной VLAN, trunk переносит несколько VLAN с тегами. Свяжите SSID с VLAN, чтобы разделить сотрудников, гостей и IoT; между сегментами разрешайте только необходимые сервисы.",
          "VLANs logically separate devices on one physical switch. An access port usually carries one VLAN; a trunk carries multiple tagged VLANs. Map staff, guest, and IoT SSIDs to separate VLANs and permit only required services between them."
        ),
        example: l("/interface bridge vlan print\n/interface bridge port print\n/interface wifi print", "/interface bridge vlan print\n/interface bridge port print\n/interface wifi print", "/interface bridge vlan print\n/interface bridge port print\n/interface wifi print"),
        exampleExplanation: l(
          "Buyruqlar mavjud VLAN membership, bridge port va Wi-Fi interfeyslarini faqat ko‘rsatadi. VLAN ID, trunk taglash va SSID sozlamalari model hamda RouterOS versiyasiga qarab farq qiladi; o‘zgarishdan oldin ishlab chiqaruvchi qo‘llanmasi va zaxira konfiguratsiyani tekshiring.",
          "Команды только показывают членство VLAN, bridge-порты и Wi-Fi-интерфейсы. VLAN ID, тегирование trunk и настройки SSID зависят от модели и версии RouterOS; перед изменениями проверьте документацию производителя и резервную конфигурацию.",
          "These commands only inspect VLAN membership, bridge ports, and Wi-Fi interfaces. VLAN IDs, trunk tagging, and SSID configuration vary by device and RouterOS version; check vendor documentation and back up configuration before changes."
        )
      }
    ]
  },
  {
    slug: "intro-cybersecurity",
    title: l("Kiberxavfsizlikka kirish", "Введение в кибербезопасность", "Introduction to Cybersecurity"),
    summary: l("CIA triadasi, tahdidlar va himoyaning asosiy tamoyillari.", "Триада CIA, угрозы и базовые принципы защиты.", "CIA triad, threats and core defense principles."),
    difficulty: "fundamental", category: "security", hours: 4, hasLab: false,
    sections: [
      {
        title: l("CIA triadasi", "Триада CIA", "The CIA triad"),
        content: l(
          "Maxfiylik (confidentiality) ma’lumotni faqat vakolatli shaxsga ochadi; yaxlitlik (integrity) ruxsatsiz o‘zgarishdan saqlaydi; mavjudlik (availability) xizmat zarur vaqtda ishlashini ta’minlaydi. Har bir nazoratni biznes xavfi bilan bog‘lang: masalan, zaxira nusxa mavjudlikka, MFA maxfiylikka, o‘zgarishlar jurnali yaxlitlikka yordam beradi.",
          "Конфиденциальность ограничивает данные авторизованными лицами; целостность защищает их от несанкционированных изменений; доступность обеспечивает работу сервиса в нужный момент. Связывайте меры с бизнес-риском: резервные копии помогают доступности, MFA — конфиденциальности, журнал изменений — целостности.",
          "Confidentiality restricts data to authorized people; integrity protects it from unauthorized changes; availability keeps services usable when needed. Map controls to business risks: backups support availability, MFA supports confidentiality, and change logs support integrity."
        ),
        example: l("sha256sum evidence.txt\n# Fayl o‘zgarganini tekshirish:\nsha256sum evidence.txt", "sha256sum evidence.txt\n# Проверка изменения файла:\nsha256sum evidence.txt", "sha256sum evidence.txt\n# Compare this hash with a trusted baseline to detect change"),
        exampleExplanation: l(
          "SHA-256 xeshi yaxlitlikni taqqoslashga yordam beradi, ammo faylni shifrlamaydi va xeshning o‘zi ishonchli manbadan olinganini kafolatlamaydi. Xavfsiz saqlangan boshlang‘ich xesh bilan solishtiring.",
          "Хеш SHA-256 помогает сравнивать целостность, но не шифрует файл и сам по себе не гарантирует доверенность источника. Сравните его с безопасно сохранённым эталонным хешем.",
          "A SHA-256 digest helps compare integrity, but does not encrypt a file or prove the digest source is trustworthy. Compare it with a trusted baseline."
        ),
        question: { prompt: l("CIA dagi “C” nimani anglatadi?", "Что означает «C» в CIA?", "What does the “C” in CIA stand for?"), answers: ["confidentiality", "maxfiylik", "конфиденциальность"] }
      },
      {
        title: l("Keng tarqalgan hujumlar", "Распространённые атаки", "Common attacks"),
        content: l(
          "Tahdidlar phishing, zararli dastur, credential theft, xizmatni ishdan chiqarish, noto‘g‘ri konfiguratsiya va ta’minot zanjiri zaifliklarini qamrab oladi. Hujum vektori — kirish yo‘li; zaiflik — undan foydalanish mumkin bo‘lgan nuqson; ta’sir esa maxfiylik, yaxlitlik yoki mavjudlikka zararidir.\n\nXabar yoki faylni baholaganda jo‘natuvchini alohida kanal orqali tasdiqlang, havola domenini tekshiring va kutilmagan ilovani ishga tushirmang. Hodisani IT/SOC jamoasiga dalillari bilan xabar qiling.",
          "К распространённым угрозам относятся фишинг, вредоносное ПО, кража учётных данных, отказ в обслуживании, ошибки конфигурации и риски цепочки поставок. Вектор атаки — путь доступа; уязвимость — используемый дефект; воздействие наносит ущерб конфиденциальности, целостности или доступности.\n\nПроверяйте отправителя по независимому каналу, домен ссылки и неожиданные вложения. Сообщайте о событии IT/SOC-команде с доказательствами.",
          "Common threats include phishing, malware, credential theft, denial of service, misconfiguration, and supply-chain weaknesses. An attack vector is the access path; a vulnerability is the exploitable flaw; impact harms confidentiality, integrity, or availability.\n\nVerify senders through a separate channel, inspect link domains, and do not open unexpected attachments. Report suspected incidents to IT/SOC with relevant evidence."
        ),
        example: l("Get-FileHash .\\sample.txt -Algorithm SHA256\n# Linux: sha256sum sample.txt", "Get-FileHash .\\sample.txt -Algorithm SHA256\n# Linux: sha256sum sample.txt", "Get-FileHash .\\sample.txt -Algorithm SHA256\n# Linux: sha256sum sample.txt"),
        exampleExplanation: l(
          "Fayl xeshini qayd etish dalilning keyinchalik o‘zgargan-o‘zgarmaganini tekshirishga yordam beradi. Bu buyruq faylni zararli yoki xavfsiz deb aniqlamaydi; faqat xesh hisoblaydi.",
          "Запись хеша помогает проверить, менялись ли доказательства позже. Команда не определяет, безопасен ли файл: она только вычисляет хеш.",
          "Recording a file hash helps detect later changes to evidence. This command does not determine whether a file is malicious; it only computes a digest."
        )
      },
      {
        title: l("Hardening asoslari", "Основы hardening", "Hardening basics"),
        content: l(
          "Hardening — keraksiz hujum yuzasini qisqartirish: ortiqcha xizmat va hisoblarni o‘chirish, yangilash, MFA yoqish, eng kam imtiyoz berish, zaxirani himoyalash va loglarni markazlash. Barcha o‘zgarishlar tasdiqlangan baseline va qaytarish rejasi bilan bajarilsin; yangilanishni avval sinov muhitida tekshiring.",
          "Hardening сокращает поверхность атаки: отключайте ненужные службы и учётные записи, устанавливайте обновления, включайте MFA, предоставляйте минимум прав, защищайте резервные копии и централизуйте журналы. Меняйте систему по утверждённой базовой конфигурации и с планом отката; сначала тестируйте обновления.",
          "Hardening reduces attack surface: remove unnecessary services and accounts, patch systems, enable MFA, apply least privilege, protect backups, and centralize logs. Follow an approved baseline and rollback plan, and test updates before broad deployment."
        ),
        example: l("Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled\n# Linux: sudo ufw status verbose", "Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled\n# Linux: sudo ufw status verbose", "Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled\n# Linux: sudo ufw status verbose"),
        exampleExplanation: l(
          "Birinchi buyruq Microsoft Defender holatini o‘qiydi; ikkinchisi UFW firewall holatini ko‘rsatadi. UFW buyruqdagi `sudo` administrator huquqini so‘raydi; konfiguratsiyani o‘zgartirish uchun bu misoldan foydalanmang.",
          "Первая команда читает состояние Microsoft Defender; вторая показывает состояние UFW. `sudo` для UFW запрашивает права администратора; пример не меняет конфигурацию.",
          "The first command reads Microsoft Defender status; the second displays UFW firewall status. `sudo` requests administrator privileges for UFW; this example does not change configuration."
        )
      }
    ]
  },
  {
    slug: "web-security-owasp",
    title: l("Web xavfsizlik (OWASP)", "Веб-безопасность (OWASP)", "Web Security (OWASP)"),
    summary: l("OWASP Top 10: injection, autentifikatsiya va kirish nazorati.", "OWASP Top 10: инъекции, аутентификация и контроль доступа.", "OWASP Top 10: injection, authentication and access control."),
    difficulty: "medium", category: "security", hours: 10, hasLab: true,
    sections: [
      {
        title: l("Injection hujumlari", "Атаки внедрения", "Injection attacks"),
        content: l(
          "Injection foydalanuvchi kiritgan ma’lumot buyruq yoki so‘rovning bir qismi sifatida noto‘g‘ri talqin qilinganda yuz beradi. SQL, shell va HTML kontekstlarining qoidalari farq qiladi; oddiy belgilarni qora ro‘yxatlash yetarli himoya emas. Parametrli so‘rov, kontekstga mos kodlash va eng kam vakolatli servis hisobidan foydalaning.",
          "Injection возникает, когда пользовательский ввод интерпретируется как часть команды или запроса. Правила SQL, shell и HTML различаются; чёрного списка символов недостаточно. Используйте параметризованные запросы, контекстное кодирование и учётную запись сервиса с минимальными правами.",
          "Injection occurs when untrusted input is interpreted as part of a command or query. SQL, shell, and HTML have different rules; character blacklists are not enough. Use parameterized queries, context-appropriate encoding, and least-privileged service accounts."
        ),
        example: l("const user = await db.user.findFirst({\n  where: { email: submittedEmail }\n});\n// Qiymat so‘rovdan alohida parametr sifatida uzatiladi.", "const user = await db.user.findFirst({\n  where: { email: submittedEmail }\n});\n// Значение передаётся отдельно от запроса.", "const user = await db.user.findFirst({\n  where: { email: submittedEmail }\n});\n// The value is bound separately from query structure."),
        exampleExplanation: l(
          "Bu parametrli ORM so‘rovi; `submittedEmail` SQL sintaksisi sifatida bajarilmaydi. Xom SQL yozsangiz, parametr binding ishlating, stringlarni qo‘shib so‘rov yasamang.",
          "Это параметризованный запрос ORM: `submittedEmail` не исполняется как SQL-синтаксис. В сыром SQL используйте параметры и не собирайте запрос конкатенацией строк.",
          "This ORM query binds the value separately, so `submittedEmail` is not executed as SQL syntax. Use bound parameters for raw SQL; never build queries by concatenating strings."
        )
      },
      {
        title: l("Autentifikatsiya va sessiya", "Аутентификация и сессии", "Authentication and sessions"),
        content: l(
          "Autentifikatsiya foydalanuvchi kimligini tekshiradi; avtorizatsiya esa unga nima qilish mumkinligini belgilaydi. Parollarni ochiq yoki qaytariladigan shaklda saqlamang: Argon2id/bcrypt kabi sekin xeshlash, har parol uchun noyob salt, MFA va login urinishlariga cheklov qo‘llang. Sessiya ID sini login va imtiyoz o‘zgarganda yangilang; cookie’ni Secure, HttpOnly va mos SameSite bilan belgilang.",
          "Аутентификация проверяет личность пользователя, а авторизация определяет разрешённые действия. Не храните пароли в открытом или обратимом виде: применяйте медленное хеширование Argon2id/bcrypt с уникальной солью, MFA и ограничение попыток входа. Обновляйте ID сессии после входа и изменения привилегий; задавайте cookie Secure, HttpOnly и подходящий SameSite.",
          "Authentication verifies who a user is; authorization determines what they may do. Never store plaintext or reversibly encrypted passwords: use slow Argon2id/bcrypt hashing with a unique salt, MFA, and rate limits. Rotate the session ID on login and privilege changes; set cookies Secure, HttpOnly, and an appropriate SameSite value."
        ),
        example: l("res.cookie(\"session\", sessionId, {\n  httpOnly: true,\n  secure: true,\n  sameSite: \"lax\",\n  path: \"/\"\n});", "res.cookie(\"session\", sessionId, {\n  httpOnly: true,\n  secure: true,\n  sameSite: \"lax\",\n  path: \"/\"\n});", "res.cookie(\"session\", sessionId, {\n  httpOnly: true,\n  secure: true,\n  sameSite: \"lax\",\n  path: \"/\"\n});"),
        exampleExplanation: l(
          "Express uslubidagi misol cookie’ni JavaScript’dan yashiradi va HTTPS’ga majbur qiladi. Ishlab chiqarishda sessiyani server tomonda boshqaring, chiqishda bekor qiling va CSRF xavfini framework himoyasi bilan yoping.",
          "Пример для Express скрывает cookie от JavaScript и требует HTTPS. В production храните сессию на сервере, аннулируйте её при выходе и защищайте от CSRF средствами фреймворка.",
          "This Express-style example hides the cookie from JavaScript and requires HTTPS. In production, manage sessions server-side, revoke them on logout, and use framework CSRF protections."
        )
      },
      {
        title: l("Kirish nazorati", "Контроль доступа", "Access control"),
        content: l(
          "Kirish nazorati har bir so‘rovda foydalanuvchining aynan shu obyekt ustidagi vakolatini tekshirishi kerak. Menyudagi tugmani yashirish server himoyasi emas. IDOR/BOLA zaifligi odatda mijoz boshqa foydalanuvchining identifikatorini yuborganda egalik tekshirilmasligidan kelib chiqadi. Deny-by-default va har amal uchun server tomoni tekshiruvini qo‘llang.",
          "Контроль доступа должен проверять полномочия пользователя для конкретного объекта при каждом запросе. Скрытие кнопки в интерфейсе не защищает сервер. IDOR/BOLA часто возникает, когда сервер не проверяет владельца объекта, идентификатор которого прислал клиент. Используйте deny-by-default и серверную проверку каждого действия.",
          "Access control must verify a user's authority over the specific object on every request. Hiding a button in the UI does not protect the server. IDOR/BOLA often occurs when ownership of a client-supplied object ID is not checked. Use deny-by-default and server-side authorization for every action."
        ),
        example: l("const document = await db.document.findFirst({\n  where: {\n    id: requestedId,\n    ownerId: session.userId\n  }\n});\nif (!document) return new Response(\"Not found\", { status: 404 });", "const document = await db.document.findFirst({\n  where: {\n    id: requestedId,\n    ownerId: session.userId\n  }\n});\nif (!document) return new Response(\"Not found\", { status: 404 });", "const document = await db.document.findFirst({\n  where: {\n    id: requestedId,\n    ownerId: session.userId\n  }\n});\nif (!document) return new Response(\"Not found\", { status: 404 });"),
        exampleExplanation: l(
          "So‘rov identifikator va sessiyadagi egalikni birga tekshiradi; boshqa foydalanuvchining ID sini bilish hujjatga kirish bermaydi. Qo‘shimcha rol va tenant shartlarini ham serverda qo‘shing.",
          "Запрос одновременно проверяет ID и владельца из сессии; знание чужого ID не даёт доступа к документу. Дополнительные проверки роли и организации также выполняйте на сервере.",
          "The query checks both the requested ID and session owner; knowing another user's ID does not grant access. Enforce any additional role or tenant restrictions on the server too."
        )
      }
    ]
  },
  {
    slug: "soc-log-analysis",
    title: l("SOC: log tahlili", "SOC: анализ журналов", "SOC: Log Analysis"),
    summary: l("Log manbalari, SIEM ogohlantirishlari va hodisalarni saralash.", "Источники журналов, оповещения SIEM и триаж инцидентов.", "Log sources, SIEM alerts and incident triage."),
    difficulty: "medium", category: "security", hours: 9, hasLab: true,
    sections: [
      {
        title: l("Log manbalari", "Источники журналов", "Log sources"),
        content: l(
          "SOC tahlilchisi endpoint, identifikatsiya, firewall, DNS, proxy, bulut va ilova loglarini yagona vaqt chizig‘ida bog‘laydi. Har bir yozuvda vaqt zonasi, host, foydalanuvchi, manba, natija va korrelyatsiya identifikatori foydali. Log yig‘ishdan oldin maxfiy ma’lumotlarni minimallashtiring, saqlash muddatini belgilang va soat sinxronligini ta’minlang.",
          "Аналитик SOC сопоставляет журналы конечных точек, идентификации, firewall, DNS, proxy, облака и приложений на единой временной шкале. Полезны временная зона, узел, пользователь, источник, результат и идентификатор корреляции. Минимизируйте чувствительные данные, задайте срок хранения и синхронизируйте часы.",
          "A SOC analyst correlates endpoint, identity, firewall, DNS, proxy, cloud, and application logs on one timeline. Useful fields include timezone, host, user, source, outcome, and correlation ID. Minimize sensitive data, set retention, and synchronize clocks before collecting logs."
        ),
        example: l("Get-WinEvent -FilterHashtable @{\n  LogName = 'Security'\n  Id = 4625\n  StartTime = (Get-Date).AddHours(-1)\n} -MaxEvents 20 | Select-Object TimeCreated, Id, MachineName", "Get-WinEvent -FilterHashtable @{\n  LogName = 'Security'\n  Id = 4625\n  StartTime = (Get-Date).AddHours(-1)\n} -MaxEvents 20 | Select-Object TimeCreated, Id, MachineName", "Get-WinEvent -FilterHashtable @{\n  LogName = 'Security'\n  Id = 4625\n  StartTime = (Get-Date).AddHours(-1)\n} -MaxEvents 20 | Select-Object TimeCreated, Id, MachineName"),
        exampleExplanation: l(
          "Ruxsatli Windows labda so‘nggi soatdagi muvaffaqiyatsiz login hodisalarini ko‘rsatadi. Hodisa ID o‘zi hujum dalili emas; manba, hisob va boshqa loglar bilan solishtiring.",
          "В разрешённой лаборатории Windows команда показывает события неудачного входа за последний час. Один ID события не доказывает атаку; сопоставьте источник, учётную запись и другие журналы.",
          "In an authorized Windows lab, this queries failed logon events from the last hour. An event ID alone is not proof of an attack; correlate the source, account, and other logs."
        )
      },
      {
        title: l("SIEM ogohlantirishlari", "Оповещения SIEM", "SIEM alerts"),
        content: l(
          "SIEM qoidalari loglarni birlashtirib, shubhali ketma-ketlikda ogohlantirish yaratadi. Har bir signal uchun qoida maqsadi, vaqt oynasi, muhimlik, istisnolar va dalil manbalarini biling. Threshold noto‘g‘ri tanlansa false positive yoki hodisani o‘tkazib yuborish paydo bo‘ladi; qoidani vakolatli test ma’lumotida baholang va tuningni hujjatlashtiring.",
          "Правила SIEM объединяют журналы и формируют оповещения по подозрительным последовательностям. Для каждого сигнала знайте назначение, временное окно, важность, исключения и источники доказательств. Неверный порог создаёт ложные срабатывания или пропуски; тестируйте правило на разрешённых данных и документируйте настройку.",
          "SIEM rules correlate logs and alert on suspicious sequences. Understand each alert's purpose, time window, severity, exclusions, and evidence sources. Poor thresholds create false positives or missed detections; test with authorized data and document tuning."
        ),
        example: l("source_ip=10.0.0.0/8 AND event_id=4625\n| stats count() as failures by user, source_ip\n| where failures >= 5", "source_ip=10.0.0.0/8 AND event_id=4625\n| stats count() as failures by user, source_ip\n| where failures >= 5", "source_ip=10.0.0.0/8 AND event_id=4625\n| stats count() as failures by user, source_ip\n| where failures >= 5"),
        exampleExplanation: l(
          "Bu SIEM uslubidagi psevdoso‘rov: xususiy manzildan kelgan 4625 hodisalarni foydalanuvchi/manba bo‘yicha sanab, 5 yoki undan ko‘pini ajratadi. Haqiqiy sintaksis mahsulotga bog‘liq; bu qoida yolg‘iz o‘zi incident tasdiqlamaydi.",
          "Это псевдозапрос SIEM: считает события 4625 по пользователю и источнику, выделяя пять и более ошибок. Синтаксис зависит от продукта; правило само по себе не подтверждает инцидент.",
          "This SIEM-style pseudocode counts event 4625 by user and source and flags five or more failures. Real syntax is product-specific; the rule alone does not confirm an incident."
        )
      },
      {
        title: l("Hodisani saralash (triage)", "Триаж инцидентов", "Incident triage"),
        content: l(
          "Triage — signalni tez va izchil baholab, haqiqiy hodisa, prioritet va keyingi egasini aniqlash. Savollar: nimaga ta’sir qildi, qachondan, qaysi hisob/manba, biznes ta’siri qanday, tasdiqlovchi va inkor qiluvchi dalil bormi? Dalillarni o‘zgartirmasdan saqlang; containment choralarini incident commander bilan kelishib bajaring.",
          "Триаж быстро и последовательно определяет, является ли сигнал инцидентом, его приоритет и ответственного. Уточните затронутые ресурсы, время начала, учётную запись/источник, бизнес-влияние и подтверждающие либо опровергающие доказательства. Сохраняйте доказательства неизменными; меры сдерживания согласуйте с руководителем инцидента.",
          "Triage consistently determines whether an alert is a real incident, its priority, and the next owner. Ask what is affected, when it began, which account/source is involved, the business impact, and what evidence supports or refutes it. Preserve evidence and coordinate containment with the incident lead."
        ),
        example: l("Vaqt (UTC) | Host | Hisob | Hodisa | Dalil | Qaror | Mas'ul\n09:15 | WS-04 | user1 | 4625 x 8 | VPN + DC log | Tekshirish | SOC", "Время (UTC) | Узел | Учётная запись | Событие | Доказательство | Решение | Ответственный\n09:15 | WS-04 | user1 | 4625 x 8 | VPN + DC log | Проверить | SOC", "Time (UTC) | Host | Account | Event | Evidence | Decision | Owner\n09:15 | WS-04 | user1 | 4625 x 8 | VPN + DC log | Investigate | SOC"),
        exampleExplanation: l(
          "Bu triage yozuvi xulosani dalildan ajratadi. Haqiqiy loglar bilan ishlaganda parol/token kiritmang, UTC vaqtini saqlang va dalilga kirish izini qayd eting.",
          "Шаблон отделяет вывод от доказательств. В реальной записи не включайте пароли/токены, сохраняйте время UTC и журналируйте доступ к доказательствам.",
          "This triage record separates conclusion from evidence. Never include passwords or tokens in real tickets; preserve UTC timestamps and log evidence access."
        )
      }
    ]
  },
  {
    slug: "wifi-security",
    title: l("Wi-Fi tarmoq xavfsizligi", "Безопасность Wi-Fi сетей", "Wi-Fi Network Security"),
    summary: l(
      "Simsiz tarmoq arxitekturasi, himoya standartlari, xavflarni aniqlash va kirish nuqtalarini mustahkamlash.",
      "Архитектура беспроводных сетей, стандарты защиты, выявление рисков и укрепление точек доступа.",
      "Wireless network architecture, security standards, risk detection, and access-point hardening."
    ),
    difficulty: "medium", category: "security", hours: 6, hasLab: true,
    sections: [
      {
        title: l("Wi-Fi arxitekturasi va inventarizatsiya", "Архитектура Wi-Fi и инвентаризация", "Wi-Fi Architecture and Inventory"),
        content: l(
          "Wi-Fi mijozlari, kirish nuqtasi (AP), SSID, BSSID, kanal va radio diapazoni qanday bog‘lanishini o‘rganing. SSID tarmoq nomi, BSSID esa muayyan radio interfeysning MAC manzilidir; bir SSID bir nechta AP orqali tarqatilishi mumkin.\n\nHimoyani boshlashdan avval tashkilotga tegishli AP va mehmon tarmoqlarini ro‘yxatga oling, egasi va joylashuvini belgilang. Radio muhitini faqat ruxsat berilgan hudud va qurilmalarda kuzating; begona tarmoqlarga ulanmaslik va ularning trafikini yozib olmaslik kerak.",
          "Изучите связь между Wi-Fi-клиентами, точкой доступа (AP), SSID, BSSID, каналом и радиодиапазоном. SSID — имя сети, а BSSID — MAC-адрес конкретного радиоинтерфейса; одна сеть может транслироваться несколькими точками доступа.\n\nПеред защитой составьте реестр принадлежащих организации точек доступа и гостевых сетей, укажите владельца и расположение. Радиосреду наблюдайте только в разрешённой зоне и на разрешённых устройствах; не подключайтесь к чужим сетям и не записывайте их трафик.",
          "Learn how Wi-Fi clients, an access point (AP), SSID, BSSID, channel, and radio band relate. The SSID is the network name; the BSSID identifies a specific radio interface by its MAC address. Multiple APs can advertise the same SSID.\n\nStart with an inventory of organization-owned APs and guest networks, including their owners and locations. Observe the radio environment only within an authorized scope; do not join or capture traffic from networks you do not own or have permission to assess."
        )
      },
      {
        title: l("Autentifikatsiya va shifrlash", "Аутентификация и шифрование", "Authentication and Encryption"),
        content: l(
          "WPA2-AES va WPA3 zamonaviy Wi-Fi himoyasining asosiy variantlaridir. Eskirgan WEP va TKIP’dan foydalanmang. Imkon bo‘lsa WPA3-Personal yoki WPA3-Enterprise’ni tanlang; moslik talab qilinsa WPA2-AES’ni xavfsiz muqobil sifatida ishlating.\n\nTarmoq paroli uzun va noyob bo‘lsin, router boshqaruv paroli esa Wi-Fi parolidan alohida saqlansin. WPS’ni zarurat bo‘lmasa o‘chiring, dasturiy ta’minotni yangilang va mehmon qurilmalarini ichki tizimlardan alohida tarmoqda joylashtiring.",
          "WPA2-AES и WPA3 — основные современные варианты защиты Wi-Fi. Не используйте устаревшие WEP и TKIP. По возможности выбирайте WPA3-Personal или WPA3-Enterprise; если этого требует совместимость, используйте WPA2-AES.\n\nЗадайте длинный уникальный пароль сети, а пароль управления маршрутизатором храните отдельно. Отключите WPS, если он не нужен, обновляйте прошивку и размещайте гостевые устройства в отдельной от внутренних систем сети.",
          "WPA2-AES and WPA3 are the primary modern Wi-Fi security options. Avoid obsolete WEP and TKIP. Prefer WPA3-Personal or WPA3-Enterprise when supported; use WPA2-AES when compatibility requires it.\n\nUse a long, unique network passphrase and a separate administrator password for the router. Disable WPS when it is not needed, keep firmware updated, and isolate guest devices from internal systems."
        ),
        question: {
          prompt: l("Tashkilot yangi qurilmalarni qo‘llasa, qaysi xavfsizlik standartini afzal ko‘rish kerak?", "Какой стандарт защиты предпочтителен, если устройства его поддерживают?", "Which security standard should be preferred when organizational devices support it?"),
          answers: ["wpa3", "WPA3"]
        }
      },
      {
        title: l("Ruxsatli xavfsizlik tekshiruvi", "Разрешённая проверка безопасности", "Authorized Security Assessment"),
        content: l(
          "Simsiz tarmoqni tekshirishdan oldin yozma ruxsat, aniq doira, vaqt oralig‘i va aloqa uchun mas’ul shaxs belgilanadi. Sinovlar tashkilotga tegishli AP yoki maxsus ajratilgan laboratoriya muhitida bajariladi; foydalanuvchilarni tarmoqdan uzish, parolni taxmin qilish yoki begona trafikni yig‘ish o‘quv mashg‘uloti doirasiga kirmaydi.\n\nTekshiruvda konfiguratsiya, shifrlash turi, mehmon tarmog‘i ajratilishi, administrator hisoblari, firmware holati va loglar ko‘rib chiqiladi. Har bir topilmani dalil, ta’sir va tavsiya bilan hujjatlashtiring; natijani faqat vakolatli egaga yuboring.",
          "До проверки беспроводной сети определите письменное разрешение, точную область, временное окно и контактное лицо. Проверки проводятся на принадлежащих организации точках доступа или в выделенной лаборатории; отключение пользователей, подбор паролей и сбор чужого трафика не входят в учебное задание.\n\nПроверьте конфигурацию, тип шифрования, изоляцию гостевой сети, административные учётные записи, состояние прошивки и журналы. Документируйте каждое замечание вместе с доказательством, влиянием и рекомендацией и передавайте отчёт только уполномоченному владельцу.",
          "Before assessing a wireless network, establish written authorization, an exact scope, a time window, and a point of contact. Perform checks only on organization-owned APs or in a dedicated lab; disconnecting users, guessing passwords, or collecting third-party traffic is outside this exercise.\n\nReview configuration, encryption mode, guest-network isolation, administrator accounts, firmware status, and logs. Record each finding with evidence, impact, and a recommendation, and share the report only with the authorized owner."
        )
      },
      {
        title: l("Tahdidlarni aniqlash va javob", "Обнаружение угроз и реагирование", "Threat Detection and Response"),
        content: l(
          "Kutilmagan uzilishlar, autentifikatsiya xatolarining ko‘payishi, noma’lum AP’lar yoki sozlamalarning o‘zgarishi tekshiruvni talab qilishi mumkin. Bitta belgi hujumni isbotlamaydi: AP loglari, boshqaruv tizimi, foydalanuvchi murojaatlari va vaqt ma’lumotlarini solishtirib, noto‘g‘ri signal ehtimolini ham baholang.\n\nHimoya uchun PMF/802.11w imkoniyatini qo‘llab-quvvatlanadigan mijozlarda yoqing, AP’larni markazlashgan boshqaruvga ulang, konfiguratsiya zaxirasini va ogohlantirishlarni sozlang. Hodisa tasdiqlansa, vakolatli jamoaga xabar bering, dalillarni saqlang va ta’sirlangan qurilma hamda hisoblarni tiklash rejasiga muvofiq himoyalang.",
          "Неожиданные отключения, рост ошибок аутентификации, неизвестные точки доступа или изменения настроек могут потребовать проверки. Один признак не доказывает атаку: сопоставьте журналы AP, систему управления, обращения пользователей и временные метки, учитывая возможность ложного срабатывания.\n\nВключите PMF/802.11w на поддерживаемых клиентах, централизованно управляйте точками доступа, настройте резервное копирование конфигурации и оповещения. При подтверждённом инциденте уведомите ответственную команду, сохраните доказательства и защитите затронутые устройства и учётные записи согласно плану восстановления.",
          "Unexpected disconnects, a rise in authentication failures, unknown APs, or configuration changes may warrant investigation. No single signal proves an attack: correlate AP logs, management-system events, user reports, and timestamps, while considering false positives.\n\nEnable PMF/802.11w for supported clients, centrally manage APs, and configure configuration backups and alerts. If an incident is confirmed, notify the authorized team, preserve evidence, and protect affected devices and accounts according to the recovery plan."
        )
      }
    ]
  },
  {
    slug: "active-directory-security",
    title: l("Active Directory xavfsizligi", "Безопасность Active Directory", "Active Directory Security"),
    summary: l(
      "Domen obyektlarini inventarizatsiya qilish, ruxsatlarni nazorat qilish, lateral movement xavfini kamaytirish va hodisalarni aniqlash.",
      "Инвентаризация объектов домена, контроль разрешений, снижение риска lateral movement и обнаружение инцидентов.",
      "Inventory domain objects, control permissions, reduce lateral-movement risk, and detect incidents."
    ),
    difficulty: "medium", category: "security", hours: 8, hasLab: true,
    sections: [
      {
        title: l("Domen va Active Directory tuzilishi", "Домен и структура Active Directory", "Domain and Active Directory Structure"),
        content: l(
          "Active Directory (AD) markazlashgan katalog bo‘lib, foydalanuvchilar, kompyuterlar, guruhlar va siyosatlarni domenlar hamda tashkiliy birliklar (OU) orqali boshqaradi. Domain Controller identifikatsiya va siyosat xizmatlarini taqdim etadi; DNS, Kerberos va LDAP esa ko‘plab domen jarayonlarida qatnashadi.\n\nXavfsiz boshqaruv uchun qaysi tizimlar domen a’zosi, qaysi hisoblar imtiyozli va siyosatlar qayerdan qo‘llanilishini hujjatlashtiring. Domen tuzilmasini bilish ruxsatlarni tekshirish va hodisalarning ta’sir doirasini aniqlashga yordam beradi.",
          "Active Directory (AD) — централизованный каталог для управления пользователями, компьютерами, группами и политиками через домены и подразделения (OU). Контроллер домена предоставляет службы идентификации и политик; DNS, Kerberos и LDAP участвуют во многих процессах домена.\n\nДля безопасного управления документируйте, какие системы входят в домен, какие учётные записи имеют привилегии и откуда применяются политики. Понимание структуры помогает проверять разрешения и определять масштаб инцидентов.",
          "Active Directory (AD) is a centralized directory for managing users, computers, groups, and policies through domains and organizational units (OUs). A Domain Controller provides identity and policy services; DNS, Kerberos, and LDAP support many domain operations.\n\nFor secure administration, document domain-joined systems, privileged accounts, and where policies are applied. Understanding the structure helps review permissions and determine incident scope."
        )
      },
      {
        title: l("Ruxsatli inventarizatsiya va kirish nazorati", "Разрешённая инвентаризация и контроль доступа", "Authorized Inventory and Access Control"),
        content: l(
          "Domen holatini faqat tashkilot topshirig‘i va vakolati doirasida tekshiring. Hisoblar, xavfsizlik guruhlari, OU, Group Policy, delegatsiyalar va umumiy resurslarga berilgan ruxsatlarni ko‘rib chiqing; faol bo‘lmagan hisoblar va egasi noma’lum resurslarni alohida belgilab, egasi bilan tasdiqlang.\n\nKeraksiz imtiyozlarni olib tashlang, rollarga asoslangan guruhlarni qo‘llang va xizmat hisoblari uchun mas’ul egani belgilang. Tekshiruv hisobotida maxfiy ma’lumotlarni oshkor qilmang; faqat zarur dalil va tavsiyalarni kiriting.",
          "Проверяйте состояние домена только по заданию организации и в пределах предоставленных полномочий. Изучите учётные записи, группы безопасности, OU, Group Policy, делегирование и разрешения на общие ресурсы; неактивные учётные записи и ресурсы без владельца отметьте и подтвердите с ответственными.\n\nУдалите избыточные привилегии, применяйте группы на основе ролей и назначьте владельца каждой служебной учётной записи. Не раскрывайте конфиденциальные данные в отчёте: включайте только необходимые доказательства и рекомендации.",
          "Review a domain only under an organizational request and within the authority granted. Examine accounts, security groups, OUs, Group Policy, delegated permissions, and shared-resource access; flag inactive accounts and ownerless resources for confirmation with their owners.\n\nRemove unnecessary privileges, use role-based groups, and assign an owner to each service account. Do not expose sensitive data in the report; include only the evidence and recommendations needed to address findings."
        ),
        question: {
          prompt: l("Foydalanuvchiga faqat vazifasi uchun zarur ruxsatlarni berish tamoyili qanday ataladi?", "Как называется принцип выдачи пользователю только необходимых для работы разрешений?", "What principle limits a user to only the permissions needed for their job?"),
          answers: ["eng kam imtiyoz", "least privilege", "минимальные привилегии", "принцип наименьших привилегий"]
        }
      },
      {
        title: l("Lateral movement xavfi va oldini olish", "Риск lateral movement и его предотвращение", "Lateral-Movement Risk and Prevention"),
        content: l(
          "Lateral movement — tajovuzkorning dastlabki kirishdan keyin tarmoqdagi boshqa tizimlarga o‘tishga urinishini ifodalovchi umumiy atama. Bunga qayta ishlatilgan parollar, ortiqcha vakolatlar, administrator sessiyalarining oddiy ish stansiyalarida qolishi va segmentatsiyaning sustligi yordam berishi mumkin.\n\nXavfni kamaytirish uchun administrator hisoblarini kundalik ishlardan ajrating, boshqaruv qatlamlarini segmentlang, imtiyozlarni muntazam qayta ko‘rib chiqing va xizmat hisoblari sirlarini himoyalang. Barcha tekshiruvlar yozma ruxsatli va nazorat qilinadigan muhitda bajarilsin.",
          "Lateral movement — общий термин для попытки перейти с первоначально затронутой системы на другие системы сети. Этому могут способствовать повторное использование паролей, избыточные права, открытые административные сеансы на обычных рабочих станциях и слабая сегментация.\n\nСнизьте риск, отделив административные учётные записи от повседневной работы, сегментировав уровни управления, регулярно пересматривая привилегии и защищая секреты служебных учётных записей. Все проверки должны проводиться с письменным разрешением и под контролем.",
          "Lateral movement is a general term for attempts to move from an initially accessed system to other systems in a network. Reused passwords, excessive permissions, administrator sessions on everyday workstations, and weak segmentation can increase this risk.\n\nReduce exposure by separating administrator accounts from routine work, segmenting management tiers, reviewing privileges regularly, and protecting service-account secrets. Conduct all assessments only with written authorization in a controlled environment."
        )
      },
      {
        title: l("Kuzatuv, aniqlash va tiklash", "Мониторинг, обнаружение и восстановление", "Monitoring, Detection, and Recovery"),
        content: l(
          "Domain Controller va endpoint loglarida noodatiy kirish vaqti yoki manbasi, ketma-ket autentifikatsiya xatolari, imtiyozli guruhlar tarkibidagi o‘zgarishlar va Group Policy yangilanishlarini kuzating. Ogohlantirishni boshqa manbalar bilan solishtiring: odatiy texnik xizmat ham shunga o‘xshash hodisalarni keltirib chiqarishi mumkin.\n\nHodisa yuz bersa, tasdiqlangan javob rejasiga amal qiling: mas’ul jamoaga xabar bering, loglarni saqlang, ta’sirlangan hisoblarni himoyalang va tizimlarni tashkilotning tiklash jarayoni orqali qaytaring. Har bir bosqichni vaqt va dalillar bilan qayd eting.",
          "Следите в журналах контроллеров домена и конечных точек за необычным временем или источником входа, сериями ошибок аутентификации, изменениями состава привилегированных групп и обновлениями Group Policy. Сопоставляйте оповещения с другими источниками: плановое обслуживание тоже может создавать похожие события.\n\nПри инциденте следуйте утверждённому плану реагирования: уведомите ответственную команду, сохраните журналы, защитите затронутые учётные записи и восстановите системы через процесс организации. Фиксируйте этапы, время и доказательства.",
          "Monitor Domain Controller and endpoint logs for unusual login times or sources, repeated authentication failures, changes to privileged-group membership, and Group Policy updates. Correlate alerts with other sources because routine maintenance can produce similar events.\n\nDuring an incident, follow the approved response plan: notify the responsible team, preserve logs, secure affected accounts, and restore systems through the organization's recovery process. Record each action, timestamp, and relevant evidence."
        )
      }
    ]
  },
  {
    slug: "cisco-ios-fundamentals",
    title: l("Cisco IOS: noldan amaliy darajagacha", "Cisco IOS: от основ до практики", "Cisco IOS: Zero to Hands-on"),
    summary: l(
      "CLI rejimlari va konfiguratsiyadan VLAN, STP, routing, ACL, NAT, DHCP, SSH hamda tizimli nosozlik tahliligacha.",
      "От режимов CLI и конфигурации до VLAN, STP, маршрутизации, ACL, NAT, DHCP, SSH и системной диагностики.",
      "From CLI modes and configuration to VLANs, STP, routing, ACLs, NAT, DHCP, SSH, and systematic troubleshooting."
    ),
    difficulty: "fundamental", category: "networking", hours: 24, hasLab: true,
    labPlan: l(
      "Virtual laboratoriyalar hali ulanmagan. Hozir buyruqlarni o‘qing va sxemani chizing; keyingi bosqichda Packet Tracer, litsenziyalangan IOS image bilan GNS3 va Linux hostlar qo‘shiladi. IOS image’ni faqat Cisco ruxsat bergan manbadan oling. Konfiguratsiya buyruqlarini haqiqiy routerga ruxsatsiz yubormang.",
      "Виртуальные лаборатории пока не подключены. Сейчас изучайте команды и рисуйте схемы; позднее добавим Packet Tracer, GNS3 с лицензированным образом IOS и Linux-хосты. Получайте образ IOS только из разрешённого Cisco источника. Не применяйте команды конфигурации на реальном роутере без разрешения.",
      "Virtual labs are not connected yet. Study the commands and draw the topology first; later we can add Packet Tracer, GNS3 with a properly licensed IOS image, and Linux hosts. Obtain IOS images only through Cisco-authorized channels. Never apply configuration commands to a real router without authorization."
    ),
    references: [
      {
        label: l("Cisco: IPv4 manzillar va subnetlash", "Cisco: IPv4-адресация и подсети", "Cisco: IP addressing and subnetting"),
        href: "https://www.cisco.com/c/en/us/support/docs/ip/routing-information-protocol-rip/13788-3.html"
      },
      {
        label: l("Cisco Catalyst 9200: VLAN konfiguratsiyasi", "Cisco Catalyst 9200: настройка VLAN", "Cisco Catalyst 9200: VLAN configuration"),
        href: "https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9200/software/release/17-15/configuration_guide/vlan/b_1715_vlan_9200_cg.html"
      },
      {
        label: l("Cisco Catalyst: Spanning Tree Protocol", "Cisco Catalyst: Spanning Tree Protocol", "Cisco Catalyst: Spanning Tree Protocol"),
        href: "https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-15/configuration_guide/lyr2/b_1715_lyr2_9300_cg/configuring_spanning_tree_protocol.html"
      },
      {
        label: l("Cisco IOS: IP Access Control List (ACL)", "Cisco IOS: списки контроля доступа IP (ACL)", "Cisco IOS: IP Access Control Lists (ACLs)"),
        href: "https://www.cisco.com/c/en/us/support/docs/security/ios-firewall/23602-confaccesslists.html"
      },
      {
        label: l("Cisco Networking Academy: Packet Tracer", "Cisco Networking Academy: Packet Tracer", "Cisco Networking Academy: Packet Tracer"),
        href: "https://www.netacad.com/cisco-packet-tracer"
      },
      {
        label: l("Cisco: IOS XE 17.x konfiguratsiya qo‘llanmalari", "Cisco: руководства по настройке IOS XE 17.x", "Cisco: IOS XE 17.x configuration guides"),
        href: "https://www.cisco.com/c/en/us/support/ios-nx-os-software/ios-xe-17/products-installation-and-configuration-guides-list.html"
      }
    ],
    sections: [
      lesson(
        l("0. Boshlash: platforma, xavfsizlik va laboratoriya", "0. Начало: платформа, безопасность и лаборатория", "0. Start here: platform, safety, and lab"),
        l(
          "Cisco IOS — Cisco router va ko‘plab switchlarda ishlatiladigan tarmoq operatsion tizimi; IOS XE — zamonaviy, modulli platforma, IOS XR esa alohida arxitektura. Buyruqlar oilasi o‘xshash bo‘lsa ham, mavjud buyruq va interfeys nomlari model hamda versiyaga bog‘liq. Bu darslik umumiy IOS/IOS XE uslubidagi misollar beradi; kurs imtihon savollari yoki biror Cisco kitobining nusxasi emas.\n\nDastlab Packet Tracer simulyatsiyasidan boshlang. Keyin GNS3/EVE-NG’ni faqat litsenziyalangan IOS image bilan ishlating; image’larni tarqatmang. Linux hostdan foydalansangiz, dastlab `ip addr`, `ping` kabi faqat diagnostika buyruqlarini qo‘llang. Quyidagi konfiguratsiya namunalari laboratoriya uchun — ularni ishlayotgan tarmoqqa to‘g‘ridan-to‘g‘ri ko‘chirmang.",
          "Cisco IOS работает на многих маршрутизаторах и коммутаторах Cisco; IOS XE — современная модульная платформа, а IOS XR имеет отдельную архитектуру. Семейства команд похожи, но команды и названия интерфейсов зависят от модели и версии. Это оригинальный курс с общими примерами IOS/IOS XE, а не копия учебника или экзаменационных вопросов.\n\nНачните с симуляции в Packet Tracer. Позже используйте GNS3/EVE-NG только с лицензированным образом IOS и не распространяйте его. На Linux-хосте начинайте с диагностических команд вроде `ip addr` и `ping`. Конфигурационные примеры предназначены для лаборатории — не применяйте их напрямую к работающей сети.",
          "Cisco IOS runs on many Cisco routers and switches; IOS XE is a modern modular platform, while IOS XR has a distinct architecture. Command families overlap, but available commands and interface names vary by model and release. This original course uses common IOS/IOS XE patterns; it does not reproduce a Cisco book or exam bank.\n\nStart with Packet Tracer simulation. Later, use GNS3/EVE-NG only with a properly licensed IOS image; do not redistribute images. Begin Linux host work with read-only diagnostics such as `ip addr` and `ping`. The configuration snippets are for labs only—never paste them into a live network."
        ),
        l("show version\nshow inventory\nshow platform"),
        l("Bu faqat ko‘rish uchun mo‘ljallangan buyruqlar IOS/IOS XE versiyasi, uskuna va platformani tekshiradi. Mavjud CLI buyruqlarini aynan qurilmangiz modeli va versiyasi hujjatlari bilan solishtiring.",
          "Эти команды только читают версию IOS/IOS XE, оборудование и сведения о платформе. Сверяйте CLI и доступные команды с документацией именно для вашей модели и версии.",
          "These read-only commands identify IOS/IOS XE release, hardware, and platform. Match the available CLI and features to documentation for your exact device and release.")
      ),
      lesson(
        l("1. CLI rejimlari va prompt", "1. Режимы CLI и приглашение", "1. CLI modes and prompts"),
        l(
          "IOS buyruqlari rejimga qarab qabul qilinadi. `>` — User EXEC, cheklangan kuzatuv; `#` — Privileged EXEC, kengroq `show` va boshqaruv; `(config)#` — global konfiguratsiya; `(config-if)#` — interfeys konfiguratsiyasi. `enable` yuqori EXEC rejimiga, `configure terminal` global rejimga, `interface ...` interfeys rejimiga o‘tkazadi. `exit` bir pog‘ona orqaga, `end` esa privileged EXEC’ga qaytaradi.",
          "Команды IOS зависят от текущего режима. `>` — ограниченный User EXEC; `#` — Privileged EXEC с расширенными `show` и управлением; `(config)#` — глобальная конфигурация; `(config-if)#` — настройка интерфейса. `enable` входит в Privileged EXEC, `configure terminal` — в глобальный режим, `interface ...` — в режим интерфейса. `exit` возвращает на уровень выше, `end` — в Privileged EXEC.",
          "IOS accepts commands based on the current mode. `>` is limited User EXEC; `#` is Privileged EXEC with broader `show` and management commands; `(config)#` is global configuration; `(config-if)#` is interface configuration. `enable`, `configure terminal`, and `interface ...` enter those modes. `exit` goes back one level; `end` returns to Privileged EXEC."
        ),
        l("Router> enable\nRouter# configure terminal\nRouter(config)# interface GigabitEthernet0/0\nRouter(config-if)# description LAB-LAN\nRouter(config-if)# end"),
        l("Prompt joriy rejimni ko‘rsatadi. `description` laboratoriya interfeysiga izoh qo‘shadi; haqiqiy qurilmaga kirish va uni o‘zgartirish uchun ruxsat talab qilinadi.",
          "Prompt показывает текущий режим. `description` меняет описание лабораторного интерфейса; для реального устройства нужны разрешение и доступ.",
          "The prompt identifies the active mode. `description` changes the lab interface label; a real device requires authorized access."),
          {
            diagram: {
              kind: "cli-modes",
              caption: l("CLI rejimlari: har bir buyruq qaysi prompt’da ishlashini aniqlang.", "Режимы CLI: проверяйте prompt перед вводом команды.", "CLI modes: check the prompt before entering a command."),
              nodes: [
                l("User EXEC\nRouter>", "User EXEC\nRouter>", "User EXEC\nRouter>"),
                l("Privileged EXEC\nRouter#", "Privileged EXEC\nRouter#", "Privileged EXEC\nRouter#"),
                l("Global config\nRouter(config)#", "Global config\nRouter(config)#", "Global config\nRouter(config)#"),
                l("Interface config\nRouter(config-if)#", "Interface config\nRouter(config-if)#", "Interface config\nRouter(config-if)#")
              ],
              links: [l("enable", "enable", "enable"), l("configure terminal", "configure terminal", "configure terminal"), l("interface Gi0/0", "interface Gi0/0", "interface Gi0/0")]
            }
          }
      ),
      lesson(
        l("2. CLI yordami, qisqartmalar va buyruqlar tarixi", "2. Справка CLI, сокращения и история", "2. CLI help, abbreviations, and history"),
        l(
          "`?` shu nuqtada mavjud buyruq va parametrlarni ko‘rsatadi; joriy rejimda `show ip ?` deb sinab ko‘ring. Buyruqni faqat qisqartma yagona ma’noli bo‘lsa qisqartiring. `Tab` buyruqni to‘ldiradi, ↑ oldingi buyruqni chiqaradi, `Ctrl+A/E` kursorni satr boshi/oxiriga olib boradi. `do show ...` global konfiguratsiyadan EXEC buyrug‘ini bajaradi; tugmalar platformaga qarab farq qilishi mumkin.",
          "`?` показывает команды и аргументы, доступные в текущей позиции; попробуйте `show ip ?`. Команду можно сокращать лишь тогда, когда префикс однозначен. `Tab` завершает имя, ↑ возвращает предыдущую команду, `Ctrl+A/E` перемещает курсор. В глобальной конфигурации `do show ...` запускает EXEC-команду. Сочетания клавиш могут различаться по платформам.",
          "`?` lists commands and arguments available at the current position; try `show ip ?`. A command may be abbreviated only when the prefix is unambiguous. `Tab` completes a token, ↑ recalls history, and `Ctrl+A/E` moves to line start/end. `do show ...` runs an EXEC `show` command from global configuration. Shortcuts vary slightly across platforms."
        ),
        l("Router# show ip ?\nRouter# show running-config\nRouter# configure terminal\nRouter(config)# do show ip interface brief"),
        l("Yordam va `show` buyruqlari holatni o‘qiydi. `do` konfiguratsiya rejimidan chiqmasdan interfeys manzillarini tekshirishga imkon beradi.",
          "Справка и `show` читают состояние. `do` позволяет посмотреть адреса интерфейсов, не покидая режима конфигурации.",
          "Help and `show` commands inspect state. `do` lets you check interface addresses without leaving configuration mode.")
      ),
      lesson(
        l("3. Running-config, startup-config va yuklanish jarayoni", "3. Running-config, startup-config и загрузка", "3. Running config, startup config, and boot"),
        l(
          "`running-config` — RAM’da hozir ishlayotgan konfiguratsiya; `startup-config` — qayta yuklanganda o‘qiladigan NVRAM nusxasi. Faqat sinovdan o‘tgan o‘zgarishlarni saqlang. Imkon bo‘lsa xavfsiz zaxira nusxa oling va oldindan qaytarish rejasini belgilang.",
          "`running-config` — текущая конфигурация в RAM; `startup-config` хранится в NVRAM и загружается после перезапуска. Сохраняйте только проверенные изменения. По возможности создайте безопасную резервную копию и заранее определите способ отката.",
          "`running-config` is the active configuration in RAM; `startup-config` is the saved configuration read after reboot. Save only verified changes. Make a secure backup when possible and know the rollback plan first."
        ),
        l("show running-config\nshow startup-config\n! Сохранить только после проверки:\ncopy running-config startup-config"),
        l("Saqlash amaldagi o‘zgarishlarni qayta yuklangandan keyin ham saqlab qoladi. `copy running-config startup-config` qurilma holatini o‘zgartiradi; uni laboratoriyada tekshiruv va qaytarish rejasi bilan bajaring.",
          "Сохранение закрепит все текущие изменения после перезагрузки. Команда записи меняет конфигурацию — выполняйте её в лаборатории после проверки и плана отката.",
          "Saving makes the current changes persistent across reboot. The copy command changes device state; use it in a lab, after verification and with a rollback plan.")
      ),
      lesson(
        l("4. Interfeyslar va IPv4 manzillash", "4. Настройка интерфейсов и IPv4", "4. Interfaces and IPv4 addressing"),
        l(
          "Interfeysni sozlashdan oldin uning aniq nomi, holati va qurilma qo‘llab-quvvatlashini tekshiring. IPv4 manzili va niqob ulangan quyi tarmoqqa mos bo‘lishi kerak. `shutdown` interfeysni o‘chiradi, shuning uchun ehtiyotsiz ishlatmang. Router’ning LAN manzili odatda shu subnet uchun standart shlyuz bo‘ladi.",
          "Перед настройкой проверьте точное имя интерфейса, его состояние и возможности модели. IPv4-адрес и маска должны соответствовать подключённой подсети. `shutdown` отключает интерфейс — не применяйте его случайно. LAN-адрес маршрутизатора обычно служит шлюзом по умолчанию.",
          "Before configuring an interface, verify its exact name, state, and model support. The IPv4 address and mask must match the attached subnet. `shutdown` disables an interface, so do not use it accidentally. A router's LAN address commonly serves as that subnet's default gateway."
        ),
        l("show ip interface brief\nconfigure terminal\ninterface GigabitEthernet0/0\n description LAB-LEFT-LAN\n ip address 192.0.2.1 255.255.255.0\n no shutdown\nend"),
        l("192.0.2.0/24 — hujjatlarda namuna uchun ajratilgan TEST-NET diapazoni. Bu misolni faqat simulyator yoki ajratilgan laboratoriyada qo‘llang. Interfeys nomlari qurilmaga qarab farq qiladi.",
          "192.0.2.0/24 — тестовый диапазон для документации. Применяйте пример только в симуляторе или изолированной лаборатории. Имена интерфейсов отличаются между моделями.",
          "192.0.2.0/24 is a documentation-only TEST-NET range. Apply this example only in a simulator or isolated lab. Interface names vary across devices.")
      ),
      lesson(
        l("5. Ikki router: marshrutlash va ping", "5. Два маршрутизатора: маршруты и ping", "5. Two routers: routes and ping"),
        l(
          "Router tarmoqlar orasida paket uzatishi uchun har bir interfeys to‘g‘ri IP subnet’ga tayinlanadi. Ikki router orasidagi alohida transit tarmoq next-hop’ni belgilaydi. Bevosita ulangan tarmoqlar marshrutlash jadvaliga avtomatik kiradi; masofadagi tarmoqlar uchun statik yoki dinamik marshrut kerak.",
          "Для пересылки пакетов между сетями интерфейсы маршрутизатора назначают в правильные подсети. Отдельная транзитная сеть задаёт next-hop между двумя маршрутизаторами. Подключённые сети появляются в таблице автоматически; удалённые требуют статического или динамического маршрута.",
          "To route between networks, place each router interface in the correct subnet. A separate transit subnet provides a next hop between routers. Connected networks enter the routing table automatically; remote networks require static or dynamic routes."
        ),
        l("! R1: link to R2\ninterface GigabitEthernet0/1\n ip address 203.0.113.1 255.255.255.252\n no shutdown\n! R1: remote LAN via R2\nip route 198.51.100.0 255.255.255.0 203.0.113.2\nshow ip route\nping 203.0.113.2"),
        l("203.0.113.0/30 va 198.51.100.0/24 — hujjatlarda namuna uchun ajratilgan TEST-NET diapazonlari. Statik marshrut borish yo‘lini belgilaydi, R2’da qaytish marshruti ham kerak. `ping`ni faqat ruxsat etilgan laboratoriya hostlariga yuboring.",
          "203.0.113.0/30 и 198.51.100.0/24 — тестовые TEST-NET сети для документации. Статический маршрут добавляет путь туда; на R2 также нужен обратный маршрут. Отправляйте `ping` только лабораторным узлам.",
          "203.0.113.0/30 and 198.51.100.0/24 are documentation-only TEST-NET ranges. The static route provides the forward path; R2 also needs a return route. Ping only authorized lab hosts.")
      ),
      lesson(
        l("6. Layer 2 switch’da VLAN va access portlar", "6. VLAN и access-порты коммутатора уровня 2", "6. VLANs and access ports on a Layer 2 switch"),
        l(
          "VLAN switch’da alohida broadcast domenini yaratadi. Host ulangan access port bitta VLAN’ga biriktiriladi. Avval VLAN yarating, keyin faqat kerakli sinov portlarini tayinlang. O‘zgarishdan oldin boshqaruv porti, uplink va VLAN a’zoligini tekshiring; juda keng interfeys diapazoni ulanishni uzishi mumkin.",
          "VLAN создаёт отдельный broadcast-домен. Access-порт для конечного устройства назначают одной VLAN. Сначала создайте VLAN, затем назначайте только тестовые пользовательские порты. До изменения проверьте management-порт, uplink и членство VLAN: слишком широкий диапазон интерфейсов может оборвать связь.",
          "A VLAN creates a separate broadcast domain. An endpoint access port belongs to one VLAN. Create the VLAN first, then assign only the intended test host ports. Verify management ports, uplinks, and VLAN membership before changes; an overly broad interface range may disconnect the switch."
        ),
        l("show vlan brief\nconfigure terminal\nvlan 10\n name USERS\ninterface GigabitEthernet1/0/3\n description LAB-PC-A\n switchport mode access\n switchport access vlan 10\n spanning-tree portfast\nend\nshow vlan brief"),
        l("Bu konfiguratsiya VLAN 10 yaratadi, bitta host portini tayinlaydi va PortFast’ni faqat hostga qaragan portda yoqadi. Switch’da tasdiqlangan STP BPDU Guard siyosatiga ham rioya qiling. Uplink’da PortFast ishlatmang; sintaksis model va IOS versiyasiga bog‘liq.",
          "Создаёт VLAN 10, назначает один порт узла и включает PortFast только на host-порту. Следуйте утверждённой политике защиты STP BPDU. Не включайте PortFast на uplink; синтаксис зависит от модели и версии IOS.",
          "Creates VLAN 10, assigns one endpoint port, and enables PortFast only for that host-facing port. Follow the approved STP BPDU-guard policy too. Never use PortFast on uplinks; syntax varies by switch and IOS release.")
      ),
      lesson(
        l("7. Switchlar orasidagi trunk ulanishi", "7. Trunk-соединение между коммутаторами", "7. Trunk links between switches"),
        l(
          "Trunk Ethernet freym’larida VLAN teglaridan foydalanib, bir nechta VLAN’ni bitta ulanish orqali olib o‘tadi. Ulanishning ikki uchidagi trunk sozlamalari va ruxsat etilgan VLAN ro‘yxatlari mos bo‘lishi kerak. Native VLAN nomuvofiqligi ogohlantirish va noto‘g‘ri segmentatsiyaga olib kelishi mumkin. Imkon bo‘lsa, ishlatilmaydigan VLAN’larni trunk’dan olib tashlang.",
          "Trunk передаёт несколько VLAN по одному каналу, используя VLAN-теги. Trunk-параметры и список разрешённых VLAN должны совпадать на обоих концах. Несовпадение native VLAN вызывает предупреждения и неверную сегментацию. Удаляйте неиспользуемые VLAN из trunk, если это поддерживается.",
          "A trunk carries multiple VLANs over one link using VLAN tags. Trunk mode and allowed VLAN lists must match at both ends. Native-VLAN mismatches can cause warnings and segmentation errors. Prune unused VLANs where supported."
        ),
        l("show interfaces trunk\nshow interfaces GigabitEthernet1/0/24 switchport\nconfigure terminal\ninterface GigabitEthernet1/0/24\n switchport mode trunk\n switchport trunk allowed vlan 10,20\nend"),
        l("24-port kerakli uplink ekanini tasdiqlagandan keyingina uni o‘zgartiring. Yangi VLAN qo‘shishdan oldin ikki uchdagi ruxsat etilgan ro‘yxatlarni moslang; uzilish xavfi sababli avval laboratoriyada sinang.",
          "Убедитесь, что порт 24 действительно является нужным uplink. Добавляйте VLAN только после согласования списка на обоих концах; изменение может разорвать связь, поэтому сначала проверьте в лаборатории.",
          "Confirm port 24 is the intended uplink before changing it. Match both ends' allowed VLAN lists before adding a VLAN; test in a lab because mismatches can interrupt traffic.")
      ),
      lesson(
        l("8. STP: Layer 2 halqalaridan himoyalanish", "8. STP: защита от петель уровня 2", "8. STP: preventing Layer 2 loops"),
        l(
          "Bitta VLAN’da Layer 2’ning bir nechta yo‘li bir vaqtda faol bo‘lsa, broadcast halqasi yuzaga kelishi mumkin. Spanning Tree Protocol root bridge’ni tanlaydi, ortiqcha portlarni bloklaydi va zaxira yo‘llarni saqlaydi. Talabga mos rapid-PVST/MST dizaynini tanlang, root joylashuvini rejalang va topologiya o‘zgarishlarini kuzating.",
          "Если несколько путей уровня 2 одновременно активны в одной VLAN, возникает broadcast-петля. Spanning Tree выбирает root bridge, блокируя лишние порты и сохраняя их как резерв. Выберите подходящую модель rapid-PVST/MST и заранее спланируйте корневой коммутатор; отслеживайте изменения топологии.",
          "Multiple simultaneously active Layer 2 paths in one VLAN can create a broadcast loop. Spanning Tree elects a root bridge and blocks redundant ports while keeping backup paths. Choose an appropriate rapid-PVST/MST design, plan the root location, and monitor topology changes."
        ),
        l("show spanning-tree\nshow spanning-tree vlan 10\n! Only on the planned lab root switch:\nspanning-tree vlan 10 root primary"),
        l("`root primary` topologiyani o‘zgartirishi mumkin. Kutilgan root tanlanganini `show spanning-tree vlan 10` bilan tekshiring. Ishlayotgan tarmoqda o‘zgartirishdan oldin ta’sirini baholang va zaxira root’ni belgilang.",
          "Команда `root primary` меняет выбор root и влияет на топологию. Проверьте фактический root через `show spanning-tree vlan 10`; изменение в сети требует подтверждённого плана и резервного root.",
          "`root primary` can change the topology. Verify the elected root with `show spanning-tree vlan 10`. Plan a backup root and assess the impact before applying outside a lab.")
      ),
      lesson(
        l("9. VLAN’lar orasida marshrutlash (router-on-a-stick)", "9. Маршрутизация между VLAN (router-on-a-stick)", "9. Inter-VLAN routing (router-on-a-stick)"),
        l(
          "Layer 2 VLAN’lari alohida bo‘lgani uchun turli subnet’lar o‘zaro bevosita marshrutlana olmaydi. Router-on-a-stick trunk interfeysida har bir VLAN uchun subinterfeys, 802.1Q tegi va shlyuz IP manzilini sozlaydi. Switch trunk’i kerakli VLAN ID’lariga ruxsat berishi, qurilma esa Layer 3 portni qo‘llashi kerak.",
          "Поскольку VLAN уровня 2 изолированы, разные подсети напрямую не общаются. Router-on-a-stick создаёт subinterface для каждой VLAN на trunk, задаёт тег 802.1Q и адрес шлюза. Trunk на коммутаторе должен разрешать необходимые VLAN; используйте совместимый порт L3.",
          "Layer 2 VLANs are isolated and cannot route between subnets on their own. Router-on-a-stick creates one router subinterface per VLAN on a trunk, with 802.1Q tagging and a gateway IP. The switch trunk must allow those VLANs; use a supported Layer 3 port."
        ),
        l("! Router-ийн lab trunk\ninterface GigabitEthernet0/0\n no shutdown\ninterface GigabitEthernet0/0.10\n encapsulation dot1Q 10\n ip address 192.0.2.1 255.255.255.0\ninterface GigabitEthernet0/0.20\n encapsulation dot1Q 20\n ip address 198.51.100.1 255.255.255.0"),
        l("Manzillar hujjatlar uchun ajratilgan TEST-NET diapazonlaridir. Router porti va switch uplink’i VLAN 10/20’ni tashuvchi laboratoriya trunk’i bo‘lishi kerak; bu konfiguratsiyani ishlayotgan LAN’ga ko‘chirmang.",
          "Адреса — TEST-NET только для документации. Физический порт роутера и uplink коммутатора должны быть lab trunk с VLAN 10/20; не копируйте конфигурацию в рабочую сеть.",
          "The IPs are documentation-only TEST-NET ranges. The router port and switch uplink must both be lab trunks carrying VLANs 10/20; do not paste this into production.")
      ),
      lesson(
        l("10. Statik marshrutlar va standart marshrut", "10. Статическая и маршрутизация по умолчанию", "10. Static routes and the default route"),
        l(
          "Statik marshrut manzil tarmog‘i/prefiksi va next-hop yoki chiqish interfeysini belgilaydi. Aniqroq marshrut topilmasa, standart marshrut ishlatiladi. Next-hop bevosita yetib boriladigan qo‘shnining manzili bo‘lishi kerak. Qaytish marshrutini, interfeys holatini va marshrutlash jadvalini ham tekshiring.",
          "Статический маршрут указывает сеть назначения и next-hop либо выходной интерфейс. Маршрут по умолчанию используется, если нет более конкретного маршрута. Next-hop должен быть адресом непосредственно доступного соседа. Проверяйте обратный путь, состояние интерфейса и таблицу маршрутизации.",
          "A static route specifies a destination network and a next hop or exit interface. A default route is used when no more-specific route matches. The next hop must be directly reachable. Verify the return route, interface state, and routing table."
        ),
        l("! R1 дээрх lab зам\nip route 198.51.100.0 255.255.255.0 203.0.113.2\n! Lab дахь default route жишээ\nip route 0.0.0.0 0.0.0.0 203.0.113.2\nshow ip route static\nshow ip route 198.51.100.10"),
        l("Misolda TEST-NET manzillari ishlatilgan. Noto‘g‘ri standart marshrut boshqa aniq yo‘nalishi bo‘lmagan barcha trafikni xato next-hop’ga yuborishi mumkin; tarmoq mas’uli bilan kelishib, laboratoriyada sinang.",
          "Используются TEST-NET адреса. Неверный маршрут по умолчанию перенаправит весь неизвестный трафик; проверьте его в лаборатории и согласуйте со владельцем.",
          "This uses TEST-NET addresses. A wrong default route redirects all otherwise-unmatched traffic; review with the network owner and test in a lab.")
      ),
      lesson(
        l("11. OSPF’ning dastlabki konfiguratsiyasi", "11. Первая конфигурация OSPF", "11. Your first OSPF configuration"),
        l(
          "OSPF — link-state dinamik marshrutlash protokoli: router’lar Hello xabarlarini almashib qo‘shnichilik o‘rnatadi, area topologiyasini o‘rganadi va SPF hisoblaydi. Qo‘shnilar orasida IP ulanishi, bir xil area hamda mos parametrlar bo‘lishi kerak. Router ID’larni rejalang, qo‘shnichilik kerak bo‘lmagan LAN interfeyslarini passive qiling; `network` buyrug‘ida wildcard mask ishlatiladi.",
          "OSPF — динамический link-state протокол: маршрутизаторы обмениваются Hello, формируют соседство, изучают топологию area и вычисляют SPF. Соседям нужны IP-связность, совпадающая area и совместимые параметры. Планируйте Router ID, используйте passive-interface на LAN без соседей; в команде `network` используется wildcard mask.",
          "OSPF is a link-state routing protocol: routers exchange Hellos, form adjacencies, learn an area's topology, and calculate SPF routes. Neighbors need IP reachability, matching areas, and compatible settings. Plan a stable router ID, use passive interfaces on endpoint LANs, and note that `network` uses a wildcard mask."
        ),
        l("router ospf 10\n router-id 1.1.1.1\n passive-interface GigabitEthernet0/0\n network 192.0.2.0 0.0.0.255 area 0\n network 203.0.113.0 0.0.0.3 area 0\nend\nshow ip ospf neighbor\nshow ip route ospf"),
        l("Laboratoriyadagi router ID’lar takrorlanmasin. OSPF faqat mos keluvchi interfeyslarga ta’sir qiladi. Qo‘shnichilik o‘rnatilmasa, ikki tomondagi area, hello/dead taymerlari, interfeys holati va subnet’ni tekshiring.",
          "Router ID лабораторных маршрутизаторов должны быть уникальными. OSPF влияет только на подходящие интерфейсы. Если соседство не формируется, проверьте area, интервалы hello/dead, интерфейс и подсеть на обеих сторонах.",
          "Use unique lab router IDs. OSPF advertises only matching interfaces. If an adjacency does not form, check both peers' area, hello/dead intervals, interface state, and subnet.")
      ),
      lesson(
        l("12. ACL: trafikni filtrlash qoidalari", "12. ACL: фильтрация трафика", "12. ACLs: filtering traffic"),
        l(
          "ACL qoidalari yuqoridan pastga qarab tekshiriladi va birinchi mos kelgan qoida qo‘llanadi; oxirida yashirin `deny` mavjud. Standard ACL manba IP’ni, extended ACL esa manba/manzil, protokol va portni filtrlashi mumkin. Noto‘g‘ri interfeys yoki yo‘nalish (in/out) foydalanuvchilarni uzib qo‘yishi mumkin. Avval ruxsat beriladigan va bloklanadigan oqimlar hamda tekshiruv nuqtasini rejalang.",
          "ACL проверяет строки сверху вниз по первому совпадению; в конце есть неявный `deny`. Standard ACL фильтрует source IP; extended ACL — источник, назначение, протокол и порт. Неверный интерфейс или направление (in/out) может блокировать пользователей. Сначала спроектируйте разрешённые/запрещённые потоки и точку проверки.",
          "ACLs evaluate entries top-down using the first match, followed by an implicit `deny`. Standard ACLs filter source IP; extended ACLs can match source, destination, protocol, and port. A wrong interface or direction can block users. Design the allowed and denied flows before applying an ACL."
        ),
        l("! Add explicitly permitted flows first\nip access-list extended LAB-WEB-ONLY\n permit tcp 192.0.2.0 0.0.0.255 host 198.51.100.10 eq 443\n deny ip any any log\n! Apply only to a lab interface\ninterface GigabitEthernet0/1\n ip access-group LAB-WEB-ONLY in\nend\nshow access-lists"),
        l("Bu misol ko‘rsatilgan HTTPS oqimidan boshqa barcha paketlarni, jumladan kerakli boshqa xizmatlarni ham bloklaydi. TEST-NET manzillari bilan ajratilgan simulyatorda sinang. ACL’ni qo‘llashdan oldin boshqaruv va qaytish trafikiga ta’sirini baholang.",
          "Пример блокирует весь трафик, кроме указанного HTTPS; нужные другие сервисы тоже будут запрещены. Используйте TEST-NET и изолированную симуляцию. До применения проверьте управление устройством и обратный трафик.",
          "This example blocks everything except the specified HTTPS flow; other required traffic is also denied. Use TEST-NET addresses in an isolated simulator. Account for management and return traffic before applying an ACL.")
      ),
      lesson(
        l("13. NAT/PAT va DHCP", "13. NAT/PAT и DHCP", "13. NAT/PAT and DHCP"),
        l(
          "NAT ichki xususiy IP manzillarini tashqi manzilga o‘giradi; PAT portlardan foydalanib ko‘plab seanslarni bitta tashqi manzil orqali uzatadi. `inside` va `outside` rollarini to‘g‘ri interfeyslarga belgilang. DHCP pool subnet, gateway va DNS sozlamalarini tarqatadi; relay kerak bo‘lsa, uni faqat rejalashtirilgan Layer 3 interfeysida sozlang.",
          "NAT преобразует частные адреса; PAT мультиплексирует множество соединений через один адрес по портам. Роли `inside` и `outside` задаются правильным интерфейсам. DHCP выдаёт подсеть, шлюз и DNS; relay настраивают только на предусмотренном L3-интерфейсе.",
          "NAT translates private addresses; PAT multiplexes many sessions through one address using ports. Assign `inside` and `outside` to the correct interfaces. DHCP provides subnet, gateway, and DNS options; configure a relay only on the planned Layer 3 interface."
        ),
        l("! Isolated router lab only\nip dhcp excluded-address 192.0.2.1 192.0.2.20\nip dhcp pool LAB-USERS\n network 192.0.2.0 255.255.255.0\n default-router 192.0.2.1\n dns-server 198.51.100.53\nip nat inside source list 10 interface GigabitEthernet0/1 overload\naccess-list 10 permit 192.0.2.0 0.0.0.255\nshow ip nat translations"),
        l("Manzillar hujjatlar uchun ajratilgan TEST-NET diapazonlaridan olingan. NAT ishlashi uchun tegishli interfeyslarga `ip nat inside` va `ip nat outside` ham belgilang. DHCP/NAT hostlar va xizmatlar ulanishiga ta’sir qiladi, shuning uchun faqat ajratilgan laboratoriyada sinang.",
          "Используются TEST-NET адреса. Для NAT также назначьте соответствующие `ip nat inside/outside` обоим интерфейсам. DHCP и NAT влияют на доступность хостов и сервисов — проверяйте только в изолированной лаборатории.",
          "These are documentation-only TEST-NET ranges. NAT also requires the appropriate `ip nat inside/outside` roles on both interfaces. DHCP and NAT affect host connectivity; test only in an isolated lab.")
      ),
      lesson(
        l("14. Xavfsiz boshqaruv: SSH va lokal foydalanuvchilar", "14. Безопасное управление: SSH и локальная учётная запись", "14. Secure management: SSH and local users"),
        l(
          "Boshqaruv tekisligini foydalanuvchi trafikidan ajrating. Shifrlanmagan Telnet o‘rniga SSHv2’dan foydalaning; noyob maxfiy kalit, eng kam imtiyoz, boshqaruv ACL/VPN’i, kirish urinishlari nazorati va jurnal yuritishni sozlang. Maxfiy ma’lumotlarni kod, skrinshot, murojaat yoki ochiq repozitoriyga kiritmang. Ishlab turgan qurilmada o‘zgarish qilish uchun ruxsat, out-of-band kirish va qaytarish rejasi zarur.",
          "Отделите плоскость управления от пользовательского трафика. Используйте SSHv2 вместо незашифрованного Telnet; задайте уникальный secret, минимальные привилегии, ACL/VPN для управления, защиту от перебора и журналирование. Никогда не публикуйте секреты в примерах, скриншотах, тикетах и репозиториях. Для производственного устройства нужны разрешение, out-of-band доступ и план отката.",
          "Separate the management plane from user traffic. Use SSHv2 instead of plaintext Telnet; apply a unique secret, least privilege, management ACL/VPN, login protection, and audit logs. Never publish secrets in examples, screenshots, tickets, or repositories. Production changes require approval, out-of-band access, and a rollback plan."
        ),
        l("! Lab example — never use a real password\nhostname R1-LAB\nip domain name lab.example\nusername labadmin privilege 15 secret REPLACE-WITH-LAB-ONLY-SECRET\ncrypto key generate rsa modulus 2048\nip ssh version 2\nline vty 0 4\n login local\n transport input ssh\n exec-timeout 5 0\nend\nshow ip ssh\nshow users"),
        l("Misolda `lab.example` domeni va almashtiriladigan maxfiy qiymat bor; haqiqiy hisob ma’lumotlarini oshkor qilmang. RSA va foydalanuvchi buyruqlarini faqat o‘z simulyatoringizda sinang. Kalit o‘lchami va VTY liniyalari sonini qurilma hujjatlaridan tekshiring.",
          "Пример содержит домен lab и заменяемый секрет; не используйте реальные учётные данные. Проверяйте RSA/user в собственном симуляторе. Допустимый ключ и число VTY-линий зависят от платформы.",
          "The example uses a lab domain and a placeholder secret; never use real credentials. Test key generation and users in your own simulator. Key limits and VTY line counts vary by platform.")
      ),
      lesson(
        l("15. L1’dan ilova darajasigacha nosozliklarni aniqlash", "15. Диагностика: от L1 до приложения", "15. Troubleshooting from L1 to the application"),
        l(
          "Muammoni taxmin bilan emas, Layer 1→3→4→7 tartibida tekshiring: fizik ulanish, interfeys/VLAN, IP/niqob/shlyuz, marshrut/ACL, so‘ng DNS/ilova. Har safar bitta taxminni sinab, aloqa ishlagan oxirgi bosqich va uzilish nuqtasini qayd eting. `show` qurilma holatini, `ping`/`traceroute` yetib borishni tekshiradi; ICMP javobi yo‘qligi xizmat ishlamayapti degani emas.",
          "Проверяйте по слоям L1→3→4→7, а не наугад: физика/link, интерфейс/VLAN, IP/маска/шлюз, маршруты/ACL, затем DNS/приложение. Проверяйте по одной гипотезе и фиксируйте первый успешный шаг и место отказа. `show` проверяет состояние; `ping`/`traceroute` — доступность. Отсутствие ICMP-ответа не доказывает отказ сервиса.",
          "Troubleshoot systematically from Layer 1 to 7: physical/link, interface/VLAN, IP/mask/gateway, routes/ACLs, then DNS/application. Test one hypothesis at a time and record the first successful hop and failure point. `show` inspects device state; `ping`/`traceroute` test reachability. Missing ICMP replies do not prove an application is down."
        ),
        l("show interfaces status\nshow interfaces counters errors\nshow vlan brief\nshow interfaces trunk\nshow ip interface brief\nshow ip route\nshow access-lists\nping 203.0.113.2\ntraceroute 198.51.100.10"),
        l("Buyruqlarni ketma-ket bajaring va natijani ehtiyotkor saqlang: unda IP hamda maxfiy metadata bo‘lishi mumkin. Tekshiruvni ruxsat etilgan laboratoriya, TEST-NET yoki o‘zingizning ajratilgan topologiyangiz bilan cheklang.",
          "Сохраняйте вывод при последовательной проверке; он может содержать IP и другие чувствительные данные. Ограничьте цель лабораторией, TEST-NET или собственной изолированной топологией.",
          "Run in order and protect output because it may expose IPs and sensitive metadata. Limit targets to an authorized lab or your own isolated topology.")
      ),
      lesson(
        l("16. O‘zgarishlarni boshqarish, zaxira va tiklash", "16. Цикл изменений, резервная копия и восстановление", "16. Change control, backup, and recovery"),
        l(
          "Yaxshi muhandis o‘zgarishdan oldin maqsad, tarmoq egasining roziligi, topologiya, bog‘liqliklar, boshqaruvga kirish, ish oynasi, boshlang‘ich holat va qaytarish qadamlarini qayd etadi. O‘zgarishni kichik doirada sinang, `show` natijalari va test trafiki bilan tasdiqlagandan keyingina saqlang. Muammo bo‘lsa, oldindan belgilangan qaytarish rejasini bajaring va natijani hujjatlashtiring.",
          "Перед изменением инженер фиксирует цель, согласование владельца, топологию, зависимости, доступ управления, окно работ, исходное состояние и откат. Испытывает изменение на ограниченном участке; сохраняет конфигурацию только после проверки `show` и тестового трафика. При ошибке выполняет подготовленный откат и документирует результат.",
          "Before a change, record its purpose, owner approval, topology, dependencies, management access, maintenance window, baseline, and rollback. Test with limited scope; save only after verifying `show` output and test traffic. If it fails, use the prepared rollback and document evidence."
        ),
        l("show clock\nshow users\nshow running-config | section interface\nshow ip interface brief\nshow ip route\n! Save only after lab verification\ncopy running-config startup-config"),
        l("Oxirgi buyruq konfiguratsiyani qayta yuklashdan keyin ham saqlaydi. Ishlayotgan qurilmada uni faqat ruxsat, tekshiruv va tayyor qaytarish rejasi bo‘lganda bajaring.",
          "Последняя команда сохраняет конфигурацию для перезапуска. На работающем устройстве применяйте её только после одобрения, проверки и подготовки отката.",
          "The last command persists the configuration across reboot. On a live device, use it only after approval, verification, and rollback preparation.")
      ),
      lesson(
        l("17. Yakuniy laboratoriya: kichik ofis tarmog‘i", "17. Итоговая лабораторная работа: сеть небольшого офиса", "17. Capstone lab: a small-office network"),
        l(
          "Yakuniy loyiha uchun PC-A/VLAN 10, PC-B/VLAN 20, ikkita access switch va bitta router’dan iborat ajratilgan topologiya chizing. 192.0.2.0/24 va 198.51.100.0/24 TEST-NET segmentlarini, router trunk’i yoki ikkita Layer 3 interfeysni rejalang. VLAN, uplink, shlyuz, OSPF/statik marshrut va sinov ACL’larini avval sxemada tekshirib, keyin simulyatorda bosqichma-bosqich quring.",
          "Выпускной проект: нарисуйте изолированную топологию PC-A/VLAN10, PC-B/VLAN20, двух access-коммутаторов и маршрутизатора. Спланируйте TEST-NET сегменты 192.0.2.0/24 и 198.51.100.0/24, trunk или два L3-интерфейса. Сначала проверьте VLAN, uplink, gateway, route и тестовые ACL на схеме, затем соберите в симуляторе по этапам.",
          "Capstone: draw an isolated topology with PC-A/VLAN 10, PC-B/VLAN 20, two access switches, and one router. Plan TEST-NET segments 192.0.2.0/24 and 198.51.100.0/24 and a trunk or two Layer 3 ports. Validate VLANs, uplinks, gateways, routes, and test ACLs on paper, then build incrementally in a simulator."
        ),
        l("! Checklist only; not a ready-to-run script:\n1. Verify VLANs and port membership\n2. Check VLANs allowed on each uplink/trunk\n3. Confirm gateway interfaces are up/up\n4. Ensure all subnets appear in the routing table\n5. Ping PC-A to its gateway and PC-B to its gateway\n6. Test explicitly permitted and denied traffic against the ACL\n7. Save a sanitized running-config and topology report"),
        l("Avval Packet Tracer’da quring va interfeys nomlarini topologiyadan tekshiring. Litsenziyalangan image qo‘llab-quvvatlasa, keyin GNS3’da takrorlang; Linux host’larni keyingi bosqichda ulang. Tasdiqlangan loyiha va himoya choralarisiz laboratoriyani internet yoki ishlab turgan tarmoqqa ulamang.",
          "Сначала постройте лабораторию в Packet Tracer и проверьте имена интерфейсов. Затем повторите в GNS3 только если это позволяет ваш лицензированный образ; подключите Linux-хосты позднее. Не соединяйте lab с интернетом или рабочей сетью без утверждённого плана и защиты.",
          "Build in Packet Tracer first and verify interface names in the topology. Rebuild in GNS3 only if your licensed image supports it; attach Linux hosts in a later phase. Do not connect the lab to the internet or production networks without an approved design and safeguards."),
          {
            diagram: {
              kind: "topology",
              caption: l("Yakuniy Packet Tracer/GNS3 topologiyasi: IP’lar faqat simulyatsiya uchun TEST-NET.", "Итоговая топология для Packet Tracer/GNS3: TEST-NET-адреса — только для симуляции.", "Capstone Packet Tracer/GNS3 topology: TEST-NET addresses are for simulation only."),
              nodes: [
                l("PC-A\nVLAN 10", "PC-A\nVLAN 10", "PC-A\nVLAN 10"),
                l("SW1\nLayer 2", "SW1\nLayer 2", "SW1\nLayer 2"),
                l("R1\nIOS router", "R1\nIOS router", "R1\nIOS router"),
                l("SW2\nLayer 2", "SW2\nLayer 2", "SW2\nLayer 2"),
                l("PC-B\nVLAN 20", "PC-B\nVLAN 20", "PC-B\nVLAN 20")
              ],
              links: [
                l("192.0.2.0/24", "192.0.2.0/24", "192.0.2.0/24"),
                l("VLAN 10 trunk", "VLAN 10 trunk", "VLAN 10 trunk"),
                l("VLAN 20 trunk", "VLAN 20 trunk", "VLAN 20 trunk"),
                l("198.51.100.0/24", "198.51.100.0/24", "198.51.100.0/24")
              ]
            }
          }
      )
    ]
  },
  {
    slug: "cctv-system-design",
    title: l("CCTV tizimini loyihalash", "Проектирование CCTV", "CCTV System Design"),
    summary: l("Kamera turlari, xotira/bandwidth hisobi va PoE kabel tarmog‘i.", "Типы камер, расчёт хранилища/полосы и PoE-кабелирование.", "Camera types, storage/bandwidth sizing and PoE cabling."),
    difficulty: "easy", category: "physical", hours: 5, hasLab: false,
    sections: [
      {
        title: l("Kamera turlari", "Типы камер", "Camera types"),
        content: l(
          "CCTV loyihasida kamera turi kuzatish maqsadi, yorug‘lik, masofa, ob-havo va maxfiylik talabiga qarab tanlanadi. Turret/dome ichki va tashqi hududga, bullet uzoq yo‘nalishga, PTZ esa operator boshqaradigan keng maydonga mos kelishi mumkin. IP rating, WDR, IR, ko‘rish burchagi va piksel zichligini tekshiring; kamera qo‘shni xususiy hududlarni ortiqcha yozmasin.",
          "Тип CCTV-камеры выбирают по цели наблюдения, освещённости, расстоянию, погоде и требованиям приватности. Turret/dome подходят для ряда внутренних и наружных зон, bullet — для направленного обзора, PTZ — для большой площади под управлением оператора. Проверьте IP-рейтинг, WDR, ИК-подсветку, угол и плотность пикселей; не захватывайте лишние частные зоны.",
          "Choose CCTV cameras according to monitoring goals, lighting, distance, weather, and privacy requirements. Turret/dome models suit many indoor/outdoor areas, bullet models provide directional views, and PTZ cameras cover large operator-controlled areas. Check IP rating, WDR, IR, field of view, and pixel density; avoid recording neighboring private areas."
        ),
        example: l("Ko‘rish burchagi (°) ≈ 2 × arctan(sensor_width / (2 × focal_length))\nMasalan: sensor 5.6 mm, obyektiv 4 mm", "Угол обзора (°) ≈ 2 × arctan(ширина_сенсора / (2 × фокусное_расстояние))\nНапример: сенсор 5,6 мм, объектив 4 мм", "Horizontal field of view ≈ 2 × atan(sensor_width / (2 × focal_length))\nExample: 5.6 mm sensor width, 4 mm lens"),
        exampleExplanation: l(
          "Formula taxminiy gorizontal ko‘rish burchagini beradi (misolda taxminan 70°). Yakuniy qamrovni ishlab chiqaruvchi kalkulyatori, montaj balandligi va obyektiv parametrlari bilan tekshiring.",
          "Формула даёт приблизительный горизонтальный угол обзора (в примере около 70°). Проверьте покрытие калькулятором производителя, высотой монтажа и параметрами объектива.",
          "The formula estimates horizontal field of view (about 70° in this example). Confirm coverage with the manufacturer's calculator, mounting height, and lens specifications."
        )
      },
      {
        title: l("Xotira va bandwidth", "Хранилище и пропускная способность", "Storage and bandwidth"),
        content: l(
          "Bitrate yozuv hajmini belgilaydi; kamera soni, yozish soati, saqlash kuni va audio ham ta’sir qiladi. Taxminiy decimal hisob: GB = bitrate(Mbps) × soniya × kameralar / 8 000. Zaxira, filesystem/NVR overhead va motion recording o‘zgaruvchanligini qo‘shing. Tarmoqda barcha stream bitrate’lari, playback va kelajak kengayishini hisobga oling.",
          "Битрейт определяет объём записи; важны также число камер, часов записи, дней хранения и аудио. Приближённо в десятичных единицах: GB = битрейт(Mbps) × секунды × камеры / 8 000. Добавьте запас, накладные расходы файловой системы/NVR и изменчивость записи по движению. Для сети учтите битрейты потоков, просмотр и расширение.",
          "Bitrate drives recording size; camera count, recording hours, retention days, and audio matter too. Approximate decimal storage: GB = bitrate (Mbps) × seconds × cameras / 8,000. Add headroom and account for NVR/filesystem overhead and variable motion recording. Network capacity must also cover all streams, playback, and growth."
        ),
        example: l("Kamera: 4 Mbps\nYozuv: 24 soat/kun × 30 kun\nHisob: 4 × 86 400 × 30 / 8 000 = 1 296 GB\n4 kamera: taxminan 5 184 GB (zaxirasiz)", "Камера: 4 Mbps\nЗапись: 24 ч/день × 30 дней\nРасчёт: 4 × 86 400 × 30 / 8 000 = 1 296 GB\n4 камеры: около 5 184 GB (без запаса)", "Per camera: 4 Mbps\nRecording: 24 h/day × 30 days\nCalculation: 4 × 86,400 × 30 / 8,000 = 1,296 GB\n4 cameras: about 5,184 GB before headroom"),
        exampleExplanation: l(
          "Bu soddalashtirilgan uzluksiz yozuv taxmini; HDD ning foydali sig‘imi, RAID, audio, NVR format va real bitrate natijani o‘zgartiradi. Sotib olishdan oldin NVR ishlab chiqaruvchisi kalkulyatori va yozuv testidan foydalaning.",
          "Это упрощённая оценка непрерывной записи; полезная ёмкость HDD, RAID, аудио, формат NVR и реальный битрейт изменят результат. Перед покупкой используйте калькулятор производителя NVR и тест записи.",
          "This is a simplified continuous-recording estimate. Usable HDD capacity, RAID, audio, NVR format, and actual bitrate change the result. Use the NVR vendor's calculator and a recording test before purchase."
        )
      },
      {
        title: l("PoE va kabel tarmog‘i", "PoE и кабельная сеть", "PoE and cabling"),
        content: l(
          "PoE Ethernet kabeli orqali ma’lumot va quvvatni birga uzatadi. Switch budjeti barcha portlarning qurilma quvvat talabi yig‘indisidan va xavfsizlik zaxirasidan katta bo‘lsin; PTZ va IR yoqilgandagi maksimal sarfni hisoblang. Kabel yo‘lini, masofani, tashqi muhit himoyasini, grounding va surge protection’ni montaj standartiga mos tekshiring.",
          "PoE передаёт данные и питание по Ethernet. Бюджет коммутатора должен превышать суммарную потребляемую мощность устройств с запасом; учитывайте максимум PTZ и ИК-подсветки. Проверьте маршрут, длину, наружную защиту, заземление и защиту от перенапряжения по стандартам монтажа.",
          "PoE carries data and power over Ethernet. The switch power budget must exceed the sum of device requirements with headroom; account for peak PTZ and IR draw. Check cable routes and distances, outdoor protection, grounding, and surge protection to applicable installation standards."
        ),
        example: l("Switch PoE budjeti: 120 W\nKamera: 8 × 12 W = 96 W\nHisobiy zaxira: 120 − 96 = 24 W\nNatija: qurilmalar spetsifikatsiyasini va port limitini tekshiring", "Бюджет PoE-коммутатора: 120 W\nКамеры: 8 × 12 W = 96 W\nЗапас: 120 − 96 = 24 W\nПроверьте спецификацию устройств и лимит каждого порта", "PoE switch budget: 120 W\nCameras: 8 × 12 W = 96 W\nRemaining headroom: 120 − 96 = 24 W\nCheck device specifications and per-port limits"),
        exampleExplanation: l(
          "Faqat umumiy budjet yetishi kifoya emas: har bir portning IEEE PoE standarti, kabel sifati va ishga tushishdagi maksimal quvvatini ham tekshiring. Kabel uzunligi va tashqi montaj bo‘yicha mahalliy me’yorlarga amal qiling.",
          "Недостаточно проверить только общий бюджет: проверьте IEEE PoE-стандарт каждого порта, качество кабеля и пиковую мощность при запуске. Соблюдайте местные нормы длины кабеля и наружного монтажа.",
          "Total budget alone is not sufficient: check each port's IEEE PoE standard, cable quality, and peak startup draw. Follow local standards for cable length and outdoor installation."
        )
      }
    ]
  },
  {
    slug: "firewall-zero-to-hero",
    title: l("Firewall’lar: noldan amaliy mutaxassislikkacha", "Межсетевые экраны: от основ до практики", "Firewalls: Zero to Hands-on"),
    summary: l(
      "Windows va Linux host firewall’laridan tarmoq, NGFW, WAF, cloud hamda ISP/provider edge himoyasigacha.",
      "От host firewall Windows и Linux до сетевых экранов, NGFW, WAF, cloud и защиты на стороне провайдера.",
      "From Windows and Linux host firewalls to network firewalls, NGFW, WAF, cloud, and ISP/provider edge controls."
    ),
    difficulty: "fundamental", category: "security", hours: 24, hasLab: true,
    labPlan: l(
      "Izolyatsiyalangan virtual laboratoriyada host va tarmoq siyosatini rejalang, trafikni ruxsat/deny bilan tekshiring, log va rollback’ni hujjatlashtiring. Real tarmoqqa o‘zgarish kiritmang.",
      "В изолированной виртуальной лаборатории спланируйте host- и сетевые политики, проверьте разрешённый/заблокированный трафик и задокументируйте журналы и откат. Не меняйте реальные сети.",
      "In an isolated virtual lab, plan host and network policies, test allowed/denied traffic, and document logs and rollback. Do not change production networks."
    ),
    references: [
      { label: l("Microsoft: Windows Firewall", "Microsoft: Брандмауэр Windows", "Microsoft: Windows Firewall"), href: "https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/" },
      { label: l("nftables hujjatlari", "Документация nftables", "nftables documentation"), href: "https://wiki.nftables.org/" },
      { label: l("AWS Network Firewall", "AWS Network Firewall", "AWS Network Firewall"), href: "https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html" },
      { label: l("Azure Firewall", "Azure Firewall", "Azure Firewall"), href: "https://learn.microsoft.com/en-us/azure/firewall/overview" },
      { label: l("DMZ sxemasi: bitta firewall (Pbroks13, Wikimedia Commons, public domain)", "Схема DMZ: один firewall (Pbroks13, Wikimedia Commons, общественное достояние)", "DMZ diagram: single firewall (Pbroks13, Wikimedia Commons, public domain)"), href: "https://commons.wikimedia.org/wiki/File:DMZ_network_diagram_1_firewall.svg" },
      { label: l("DMZ sxemasi: ikki firewall (Pbroks13, Wikimedia Commons, public domain)", "Схема DMZ: два firewall (Pbroks13, Wikimedia Commons, общественное достояние)", "DMZ diagram: dual firewall (Pbroks13, Wikimedia Commons, public domain)"), href: "https://commons.wikimedia.org/wiki/File:DMZ_network_diagram_2_firewall.svg" }
    ],
    sections: [
      { title: l("1. Firewall asoslari va himoya qatlamlari", "1. Основы firewall и уровни защиты", "1. Firewall fundamentals and defense layers") },
      { title: l("2. Paket, stateful/stateless va qoida tartibi", "2. Пакеты, stateful/stateless и порядок правил", "2. Packets, stateful/stateless, and rule order") },
      { title: l("3. Siyosatni loyihalash va least privilege", "3. Проектирование политики и least privilege", "3. Policy design and least privilege") },
      { title: l("4. Windows Defender Firewall", "4. Брандмауэр Windows Defender", "4. Windows Defender Firewall") },
      { title: l("5. Linux host firewall: nftables va boshqaruv vositalari", "5. Linux host firewall: nftables и средства управления", "5. Linux host firewall: nftables and management tools") },
      {
        title: l("6. Tarmoq firewall, zona va DMZ", "6. Сетевой firewall, зоны и DMZ", "6. Network firewalls, zones, and DMZ"),
        images: [{
          src: "/learning-assets/firewall-academy/dmz-single-firewall.png",
          alt: l("Internet, firewall, DMZ serverlari va ichki tarmoqni ko‘rsatuvchi ochiq litsenziyali sxema.", "Схема общественного достояния: интернет, firewall, серверы DMZ и внутренняя сеть.", "Public-domain diagram showing the internet, firewall, DMZ servers, and internal network."),
          caption: l("Bir firewall uch zona orasidagi trafikni boshqaradi. Sxema: Pbroks13, Wikimedia Commons, public domain.", "Один firewall управляет трафиком между тремя зонами. Схема: Pbroks13, Wikimedia Commons, общественное достояние.", "One firewall controls traffic between three zones. Diagram by Pbroks13, Wikimedia Commons, public domain."),
          width: 1920,
          height: 1230
        }]
      },
      { title: l("7. NGFW, UTM, IPS va inspeksiya", "7. NGFW, UTM, IPS и инспекция", "7. NGFW, UTM, IPS, and inspection") },
      { title: l("8. WAF va API himoyasi", "8. WAF и защита API", "8. WAF and API protection") },
      { title: l("9. Cloud firewall va IaC", "9. Cloud firewall и IaC", "9. Cloud firewalls and IaC") },
      { title: l("10. ISP/provider edge, CGNAT va DDoS", "10. ISP/provider edge, CGNAT и DDoS", "10. ISP/provider edge, CGNAT, and DDoS") },
      { title: l("11. NAT, port-forward va VPN", "11. NAT, port-forward и VPN", "11. NAT, port forwarding, and VPN") },
      { title: l("12. Log, monitoring va SIEM", "12. Журналы, мониторинг и SIEM", "12. Logging, monitoring, and SIEM") },
      {
        title: l("13. HA, backup va o‘zgarishlarni boshqarish", "13. HA, резервное копирование и управление изменениями", "13. HA, backups, and change management"),
        images: [{
          src: "/learning-assets/firewall-academy/dmz-dual-firewall.png",
          alt: l("DMZ ikkita firewall bilan ajratilgan ochiq litsenziyali tarmoq sxemasi.", "Схема общественного достояния: DMZ разделена двумя firewall.", "Public-domain network diagram with a DMZ separated by two firewalls."),
          caption: l("Ikki firewall’li DMZ qatlamlararo siyosatni ko‘rsatadi; bu o‘z-o‘zidan HA klasteri degani emas. Sxema: Pbroks13, Wikimedia Commons, public domain.", "DMZ с двумя firewall показывает разделение политик; это не означает кластер HA. Схема: Pbroks13, Wikimedia Commons, общественное достояние.", "A dual-firewall DMZ shows layered policy boundaries; it is not automatically an HA cluster. Diagram by Pbroks13, Wikimedia Commons, public domain."),
          width: 1920,
          height: 1230
        }]
      },
      { title: l("14. Troubleshooting va yakuniy laboratoriya", "14. Поиск неисправностей и итоговая лабораторная", "14. Troubleshooting and capstone lab") }
    ]
  },
  {
    slug: "kerio-control-zero-to-hero",
    title: l("Kerio Control: noldan amaliy boshqaruvgacha", "Kerio Control: от основ до администрирования", "Kerio Control: Zero to Administration"),
    summary: l(
      "Kerio Control gateway’ini xavfsiz rejalash, sozlash, qoidalar, NAT, web filter, VPN, log va nosozlik tahlili.",
      "Безопасное планирование Kerio Control, политики, NAT, web-фильтрация, VPN, журналы и устранение неполадок.",
      "Safely plan and administer Kerio Control gateways, rules, NAT, web filtering, VPN, logs, and troubleshooting."
    ),
    difficulty: "fundamental", category: "networking", hours: 18, hasLab: true,
    labPlan: l(
      "Faqat izolyatsiyalangan virtual lab’da WAN/LAN/DMZ topologiyasi yarating. Har bir o‘zgarishdan oldin zaxira oling; internetga ochiq yoki ishlab turgan Kerio qurilmasida tajriba qilmang.",
      "Создайте топологию WAN/LAN/DMZ только в изолированной виртуальной лаборатории. Перед изменениями делайте резервную копию; не экспериментируйте на доступном из интернета или рабочем Kerio.",
      "Build a WAN/LAN/DMZ topology only in an isolated virtual lab. Back up before every change; do not experiment on an internet-facing or production Kerio appliance."
    ),
    references: [
      { label: l("GFI Kerio Control mahsulot hujjatlari", "Документация продукта GFI Kerio Control", "GFI Kerio Control product documentation"), href: "https://www.gfi.com/products-and-solutions/network-security-solutions/kerio-control/technical-documentation" },
      { label: l("GFI Kerio Control qo‘llab-quvvatlash", "Поддержка GFI Kerio Control", "GFI Kerio Control support"), href: "https://support.gfi.com/" },
      { label: l("DMZ sxemasi: bitta firewall (Pbroks13, Wikimedia Commons, public domain)", "Схема DMZ: один firewall (Pbroks13, Wikimedia Commons, общественное достояние)", "DMZ diagram: single firewall (Pbroks13, Wikimedia Commons, public domain)"), href: "https://commons.wikimedia.org/wiki/File:DMZ_network_diagram_1_firewall.svg" },
      { label: l("DMZ sxemasi: ikki firewall (Pbroks13, Wikimedia Commons, public domain)", "Схема DMZ: два firewall (Pbroks13, Wikimedia Commons, общественное достояние)", "DMZ diagram: dual firewall (Pbroks13, Wikimedia Commons, public domain)"), href: "https://commons.wikimedia.org/wiki/File:DMZ_network_diagram_2_firewall.svg" }
    ],
    sections: [
      { title: l("1. Kerio Control va xavfsiz laboratoriya", "1. Kerio Control и безопасная лаборатория", "1. Kerio Control and a safe lab") },
      { title: l("2. O‘rnatish, dastlabki kirish va admin himoyasi", "2. Установка, первый вход и защита администратора", "2. Installation, initial access, and admin security") },
      {
        title: l("3. Interfeys, zona va tarmoq rejalash", "3. Интерфейсы, зоны и планирование сети", "3. Interfaces, zones, and network planning"),
        images: [{
          src: "/learning-assets/firewall-academy/dmz-single-firewall.png",
          alt: l("Internet, firewall, DMZ serverlari va ichki tarmoqni ko‘rsatuvchi ochiq litsenziyali sxema.", "Схема общественного достояния: интернет, firewall, серверы DMZ и внутренняя сеть.", "Public-domain diagram showing the internet, firewall, DMZ servers, and internal network."),
          caption: l("WAN, DMZ va ichki zonani solishtiring; bu umumiy arxitektura sxemasi, Kerio Control interfeysi skrinshoti emas. Sxema: Pbroks13, Wikimedia Commons, public domain.", "Сравните WAN, DMZ и внутреннюю зону; это общая архитектурная схема, а не скриншот интерфейса Kerio Control. Pbroks13, Wikimedia Commons, общественное достояние.", "Compare the WAN, DMZ, and internal zone. This is a generic architecture diagram, not a Kerio Control UI screenshot. Pbroks13, Wikimedia Commons, public domain."),
          width: 1920,
          height: 1230
        }]
      },
      { title: l("4. Firewall qoidalari va eng kam ruxsat", "4. Правила firewall и минимально необходимые разрешения", "4. Firewall rules and least privilege") },
      { title: l("5. Outbound NAT va internetga chiqish", "5. Исходящий NAT и доступ в интернет", "5. Outbound NAT and internet access") },
      {
        title: l("6. Port mapping va DMZ xizmatlari", "6. Перенаправление портов и службы DMZ", "6. Port mapping and DMZ services"),
        images: [{
          src: "/learning-assets/firewall-academy/dmz-dual-firewall.png",
          alt: l("DMZ ikkita firewall bilan ajratilgan ochiq litsenziyali tarmoq sxemasi.", "Схема общественного достояния: DMZ разделена двумя firewall.", "Public-domain network diagram with a DMZ separated by two firewalls."),
          caption: l("Ikki firewall DMZ chegaralarini alohida nazorat qilishi mumkin. Rasm Kerio konfiguratsiyasining tayyor namunasi emas: aniq qoidalarni o‘z versiyangiz hujjatidan tekshiring. Pbroks13, Wikimedia Commons, public domain.", "Два firewall могут отдельно контролировать границы DMZ. Это не готовая конфигурация Kerio: проверяйте правила в документации своей версии. Pbroks13, Wikimedia Commons, общественное достояние.", "Two firewalls can separately control DMZ boundaries. This is not a ready-made Kerio configuration; verify rules against your version's documentation. Pbroks13, Wikimedia Commons, public domain."),
          width: 1920,
          height: 1230
        }]
      },
      { title: l("7. Web filter va xavfsiz istisnolar", "7. Web-фильтрация и безопасные исключения", "7. Web filtering and safe exceptions") },
      { title: l("8. Foydalanuvchi, guruh va administrator rollari", "8. Пользователи, группы и роли администратора", "8. Users, groups, and administrator roles") },
      { title: l("9. Remote-access va site-to-site VPN", "9. Remote-access и site-to-site VPN", "9. Remote-access and site-to-site VPN") },
      { title: l("10. Log, backup, yangilash va yakuniy lab", "10. Журналы, резервное копирование, обновление и итоговая лабораторная", "10. Logs, backups, updates, and capstone lab") },
      { title: l("11. Kerio Control troubleshooting", "11. Устранение неполадок Kerio Control", "11. Kerio Control troubleshooting") }
    ]
  }
];

export const supplementalLessonExamples: Record<string, LearningExample[]> = {
  "wifi-security": [
    {
      code: l(
        "netsh wlan show interfaces\nnetsh wlan show networks mode=bssid",
        "netsh wlan show interfaces\nnetsh wlan show networks mode=bssid",
        "netsh wlan show interfaces\nnetsh wlan show networks mode=bssid"
      ),
      explanation: l(
        "Windows’dagi bu diagnostika buyruqlari ulangan interfeys va ko‘rinayotgan Wi-Fi tarmoqlarini ko‘rsatadi. Faqat o‘zingizga tegishli yoki tekshirishga ruxsat berilgan hududda foydalaning; paket tutish yoki foydalanuvchini uzish amallarini bajarmaydi.",
        "Эти диагностические команды Windows показывают подключённый интерфейс и видимые Wi-Fi-сети. Используйте их только в своей сети или разрешённой зоне; команды не перехватывают трафик и не отключают пользователей.",
        "These Windows diagnostics show the connected interface and visible Wi-Fi networks. Use them only on your own network or in an authorized area; they do not capture traffic or disconnect users."
      )
    },
    {
      code: l(
        "netsh wlan show interfaces\n# Router boshqaruv panelida tekshiring:\n# WPA3 (afzal) yoki WPA2-AES\n# WPS: o‘chirilgan\n# Mehmon SSID: ichki LAN'dan ajratilgan",
        "netsh wlan show interfaces\n# В панели управления роутером проверьте:\n# WPA3 (предпочтительно) или WPA2-AES\n# WPS: отключён\n# Гостевой SSID: отделён от внутренней LAN",
        "netsh wlan show interfaces\n# In your AP administration console verify:\n# WPA3 preferred, or WPA2-AES\n# WPS disabled\n# Guest SSID isolated from internal LAN"
      ),
      explanation: l(
        "Birinchi buyruq joriy ulanishni tekshiradi; izohlar access-point boshqaruv panelida qo‘lda tekshiriladigan sozlamalar. Shifrlash rejimini mijoz qurilmadagi buyruq o‘zgartirmaydi.",
        "Первая команда проверяет текущее подключение; комментарии — параметры для ручной проверки в панели точки доступа. Команда на клиенте не меняет режим шифрования.",
        "The first command inspects the current connection; the comments list settings to verify in the AP console. A client-side command cannot change the AP's encryption mode."
      )
    },
    {
      code: l(
        "$scope = [pscustomobject]@{\n  NetworkOwner = 'IT lab'\n  ApprovedSSID = 'LAB-OWNED'\n  StartUTC = '2026-01-01T09:00:00Z'\n  EndUTC = '2026-01-01T10:00:00Z'\n  Contact = 'lab-admin@example.test'\n}\n$scope | ConvertTo-Json",
        "$scope = [pscustomobject]@{\n  NetworkOwner = 'IT lab'\n  ApprovedSSID = 'LAB-OWNED'\n  StartUTC = '2026-01-01T09:00:00Z'\n  EndUTC = '2026-01-01T10:00:00Z'\n  Contact = 'lab-admin@example.test'\n}\n$scope | ConvertTo-Json",
        "$scope = [pscustomobject]@{\n  NetworkOwner = 'IT lab'\n  ApprovedSSID = 'LAB-OWNED'\n  StartUTC = '2026-01-01T09:00:00Z'\n  EndUTC = '2026-01-01T10:00:00Z'\n  Contact = 'lab-admin@example.test'\n}\n$scope | ConvertTo-Json"
      ),
      explanation: l(
        "Bu o‘zgartirilishi kerak bo‘lgan laboratoriya doirasi shabloni, tarmoqqa ta’sir qilmaydi. Haqiqiy sinovdan oldin egasi yozma ravishda tasdiqlagan SSID, vaqt oralig‘i, aloqa shaxsi va taqiqlangan amallarni ko‘rsating.",
        "Это шаблон области лабораторной проверки, который нужно заменить своими данными; он не взаимодействует с сетью. До теста письменно согласуйте SSID, время, контакт и запрещённые действия с владельцем.",
        "This is a lab-scope worksheet template, not a network operation. Before testing, document the owner-approved SSID, time window, contact, and prohibited actions."
      )
    },
    {
      code: l(
        "Get-WinEvent -LogName 'Microsoft-Windows-WLAN-AutoConfig/Operational' -MaxEvents 20 |\n  Select-Object TimeCreated, Id, LevelDisplayName, Message",
        "Get-WinEvent -LogName 'Microsoft-Windows-WLAN-AutoConfig/Operational' -MaxEvents 20 |\n  Select-Object TimeCreated, Id, LevelDisplayName, Message",
        "Get-WinEvent -LogName 'Microsoft-Windows-WLAN-AutoConfig/Operational' -MaxEvents 20 |\n  Select-Object TimeCreated, Id, LevelDisplayName, Message"
      ),
      explanation: l(
        "Ruxsatli Windows qurilmasidagi Wi-Fi AutoConfig hodisalarini o‘qiydi; xatoni alohida hujum deb xulosa qilmang. Vaqt, AP boshqaruv jurnali va foydalanuvchi xabari bilan solishtiring.",
        "Читает события Wi-Fi AutoConfig на разрешённом устройстве Windows; не считайте отдельную ошибку доказательством атаки. Сопоставьте время с журналами точки доступа и обращениями пользователей.",
        "Reads Wi-Fi AutoConfig events from an authorized Windows device; an isolated error does not prove an attack. Correlate timestamps with AP management logs and user reports."
      )
    }
  ],
  "active-directory-security": [
    {
      code: l(
        "Get-ADDomain | Select-Object DNSRoot, DomainMode, PDCEmulator\nGet-ADDomainController -Filter * |\n  Select-Object HostName, Site, IPv4Address",
        "Get-ADDomain | Select-Object DNSRoot, DomainMode, PDCEmulator\nGet-ADDomainController -Filter * |\n  Select-Object HostName, Site, IPv4Address",
        "Get-ADDomain | Select-Object DNSRoot, DomainMode, PDCEmulator\nGet-ADDomainController -Filter * |\n  Select-Object HostName, Site, IPv4Address"
      ),
      explanation: l(
        "RSAT ActiveDirectory moduli o‘rnatilgan va ruxsatingiz bor Windows sessiyasida domen rejimi hamda DC’larni ko‘rsatadi. Bu so‘rovlar katalogni o‘zgartirmaydi; laboratoriyadagi misol domen bilan almashtiring.",
        "Показывает режим домена и контроллеры домена в Windows с модулем RSAT ActiveDirectory и соответствующими полномочиями. Запросы не меняют каталог; используйте имя своей лабораторной среды.",
        "In an authorized Windows session with the RSAT ActiveDirectory module, displays domain mode and domain controllers. These queries do not change the directory; use your lab domain."
      )
    },
    {
      code: l(
        "Get-ADUser -Filter * -Properties Enabled, LastLogonDate |\n  Select-Object -First 20 Name, SamAccountName, Enabled, LastLogonDate",
        "Get-ADUser -Filter * -Properties Enabled, LastLogonDate |\n  Select-Object -First 20 Name, SamAccountName, Enabled, LastLogonDate",
        "Get-ADUser -Filter * -Properties Enabled, LastLogonDate |\n  Select-Object -First 20 Name, SamAccountName, Enabled, LastLogonDate"
      ),
      explanation: l(
        "Vakolatli inventarizatsiyada cheklangan 20 hisob va tanlangan atributlarni ko‘rsatadi. Real muhitda `-SearchBase` bilan qidiruvni zarur OU doirasida cheklang; natijani maxfiy ma’lumot kabi saqlang.",
        "В разрешённой инвентаризации выводит до 20 записей и выбранные атрибуты. В реальной среде ограничьте поиск необходимым OU с помощью `-SearchBase`; защищайте результат как чувствительные данные.",
        "For an authorized inventory, displays up to 20 accounts and selected attributes. In production, scope the query to the required OU with `-SearchBase` and protect the output as sensitive data."
      )
    },
    {
      code: l(
        "Get-ADGroupMember -Identity 'Domain Admins' -Recursive |\n  Select-Object Name, SamAccountName, ObjectClass",
        "Get-ADGroupMember -Identity 'Domain Admins' -Recursive |\n  Select-Object Name, SamAccountName, ObjectClass",
        "Get-ADGroupMember -Identity 'Domain Admins' -Recursive |\n  Select-Object Name, SamAccountName, ObjectClass"
      ),
      explanation: l(
        "Faqat vakolatli auditda imtiyozli guruh a’zolarini ko‘rib chiqish uchun. Natijani tasdiqlangan administratorlar ro‘yxati va biznes egasi bilan solishtiring; a’zolarni o‘zgartirish yoki chiqarib tashlash bu misolda bajarilmaydi.",
        "Используйте только для разрешённого аудита состава привилегированной группы. Сверьте результат с утверждённым списком администраторов и владельцем бизнеса; пример не меняет членство.",
        "Use only in an authorized audit to review privileged-group membership. Compare with the approved administrator list and business owner; this example does not change membership."
      )
    },
    {
      code: l(
        "Get-WinEvent -FilterHashtable @{\n  LogName = 'Security'\n  Id = 4625, 4728\n  StartTime = (Get-Date).AddHours(-24)\n} -MaxEvents 50 | Select-Object TimeCreated, Id, MachineName",
        "Get-WinEvent -FilterHashtable @{\n  LogName = 'Security'\n  Id = 4625, 4728\n  StartTime = (Get-Date).AddHours(-24)\n} -MaxEvents 50 | Select-Object TimeCreated, Id, MachineName",
        "Get-WinEvent -FilterHashtable @{\n  LogName = 'Security'\n  Id = 4625, 4728\n  StartTime = (Get-Date).AddHours(-24)\n} -MaxEvents 50 | Select-Object TimeCreated, Id, MachineName"
      ),
      explanation: l(
        "Oxirgi 24 soatdagi muvaffaqiyatsiz login va global security guruhiga a’zo qo‘shish hodisalarini qidiradi. Kerakli audit siyosati yoqilgan bo‘lishi shart; hodisalarni boshqa loglar bilan tasdiqlang.",
        "Ищет за последние 24 часа ошибки входа и события добавления участника в глобальную группу безопасности. Для этого должны быть включены соответствующие политики аудита; подтвердите событие другими журналами.",
        "Searches the last 24 hours for failed logons and additions to a global security group. The required audit policy must be enabled; corroborate events with other logs."
      )
    }
  ]
};

export const learningPaths: LearningPath[] = [
  {
    slug: "it-support-networking",
    kind: "jobRole",
    title: l("IT qo‘llab-quvvatlash va tarmoq muhandisi", "IT-поддержка и сетевой инженер", "IT Support and Network Engineer"),
    summary: l("Tarmoq, operatsion tizimlar va MikroTik asoslari. Bu yo‘nalish mustaqil mashq uchun tayyorlaydi, ishga qabul yoki seniorlikni kafolatlamaydi.", "Основы сетей, операционных систем и MikroTik. Курс готовит к самостоятельной практике, но не гарантирует трудоустройство или уровень senior.", "Networking, operating-system, and MikroTik fundamentals. This path prepares you for independent practice; it does not guarantee employment or senior-level competence."),
    timeEstimate: l("Taxminan 60–80 soat: modul materiallari, takrorlash, mustaqil amaliyot va yakuniy loyiha. Bu platformada o‘lchangan natija emas.", "Около 60–80 часов: материалы модулей, повторение, самостоятельная практика и итоговый проект. Это не измеренная статистика платформы.", "About 60–80 hours for module material, review, independent practice, and the final project. This is an estimate, not measured platform data."),
    prerequisites: l("Oldindan IT tajribasi shart emas; kompyuterda fayl va buyruq satri bilan ishlashni o‘rganishga tayyor bo‘ling.", "Предварительный опыт в IT не требуется; будьте готовы освоить работу с файлами и командной строкой.", "No prior IT experience required; be ready to learn file and command-line basics."),
    outcomes: l("IP manzil va marshrutni tekshirish; Linux/Windows jurnalidan nosozlik izlash; oddiy VLAN/Wi‑Fi segmentatsiyasi va RouterOS sozlamasini xavfsiz rejalash.", "Проверять IP-адреса и маршруты; искать сбои в журналах Linux/Windows; планировать базовую VLAN/Wi‑Fi сегментацию и настройки RouterOS.", "Inspect IP addressing and routes; troubleshoot using Linux/Windows logs; plan basic VLAN/Wi‑Fi segmentation and RouterOS configuration."),
    capstone: l("Uy/ofis laboratoriyasi uchun tarmoq sxemasi, manzillash jadvali, segmentatsiya rejasi, xavfsiz o‘qish buyruqlari va nosozliklarni aniqlash hisobotini tayyorlang. Rubrika: to‘g‘rilik, segmentlar orasidagi ruxsatlar, zaxira/qaytarish rejasi va takrorlanadigan tekshiruvlar.", "Подготовьте схему домашней/офисной лаборатории, адресный план, сегментацию, безопасные команды чтения и отчёт по диагностике. Критерии: корректность, доступ между сегментами, резервирование/откат и повторяемые проверки.", "Produce a home/office lab topology, addressing plan, segmentation rules, safe read-only commands, and troubleshooting report. Rubric: correctness, inter-segment access, backup/rollback, and repeatable checks."),
    modules: ["network-fundamentals", "linux-fundamentals", "windows-fundamentals", "mikrotik-routeros-basics", "wifi-security"]
  },
  {
    slug: "soc-analyst",
    kind: "jobRole",
    title: l("SOC tahlilchisi", "Аналитик SOC", "SOC Analyst"),
    summary: l("Kiberxavfsizlik asoslari va loglar bilan ishlash. Bu o‘quv yo‘nalishi; SOC ish tajribasi yoki senior malakasini bermaydi.", "Основы кибербезопасности и анализ журналов. Это учебный курс, а не опыт работы в SOC или квалификация senior.", "Cybersecurity fundamentals and log analysis. This is a learning path, not SOC job experience or senior qualification."),
    timeEstimate: l("Taxminan 80–110 soat: darslar, log tahlili mashqlari va yakuniy hodisa hisoboti. Laboratoriya natijasi o‘quvchining o‘z muhitiga bog‘liq.", "Около 80–110 часов: уроки, анализ журналов и итоговый отчёт об инциденте. Практика зависит от среды учащегося.", "About 80–110 hours for lessons, log-analysis exercises, and a final incident report. Hands-on time depends on the learner’s own lab."),
    prerequisites: l("Yo‘l tarmoq, Linux va Windows asoslarini o‘z ichiga oladi; boshlashdan oldin tajriba shart emas.", "В курс включены основы сетей, Linux и Windows; предварительный опыт не обязателен.", "Networking, Linux, and Windows foundations are included; no prior experience required."),
    outcomes: l("Shubhali hodisaga vaqt chizig‘i tuzish; log manbalarini ajratish; dalillar va taxminlarni farqlash; xavfni baholab, eskalatsiya tavsiyasini yozish.", "Составлять хронологию события; различать источники журналов, факты и гипотезы; оценивать риск и оформлять рекомендацию по эскалации.", "Build an event timeline; distinguish log sources, evidence, and hypotheses; assess risk and write an escalation recommendation."),
    capstone: l("Faqat berilgan yoki o‘zingiz yaratgan sintetik loglardan foydalanib hodisa tahlili yozing: xulosa, vaqt chizig‘i, dalillar, noaniqliklar va containment tavsiyasi. Rubrika: dalilga tayanish, vaqt ketma-ketligi, noaniqlikni ochiq ko‘rsatish va xavfsiz tavsiyalar.", "Используя только предоставленные или собственные синтетические журналы, подготовьте разбор инцидента: вывод, хронология, доказательства, неопределённости и рекомендации по локализации. Критерии: опора на данные, последовательность, явное описание неопределённостей и безопасные рекомендации.", "Using only provided or self-generated synthetic logs, write an incident analysis with a conclusion, timeline, evidence, uncertainties, and containment recommendations. Rubric: evidence-based reasoning, chronology, explicit uncertainty, and safe recommendations."),
    modules: ["network-fundamentals", "intro-cybersecurity", "linux-fundamentals", "windows-fundamentals", "active-directory-security", "web-security-owasp", "soc-log-analysis"]
  },
  {
    slug: "network-admin-mikrotik",
    kind: "skill",
    title: l("MikroTik tarmoq administratori", "Администратор сети MikroTik", "MikroTik Network Administrator"),
    summary: l("RouterOS konfiguratsiyasi va tekshiruv usullari. Ishlab chiqarish tarmog‘ida o‘zgarish qilish malakasi alohida amaliy tajriba talab qiladi.", "Настройка RouterOS и методы проверки. Изменение production-сетей требует отдельного практического опыта.", "RouterOS configuration and verification techniques. Production changes require separate supervised experience."),
    timeEstimate: l("Taxminan 30–40 soat: ikkita modul, mustaqil konfiguratsiya mashqlari va loyiha.", "Около 30–40 часов: два модуля, самостоятельные упражнения по конфигурации и проект.", "About 30–40 hours for two modules, independent configuration practice, and a project."),
    prerequisites: l("Tarmoq asoslari birinchi modulda beriladi; RouterOS qurilmasi shart emas, ammo xavfsiz virtual yoki zaxira qurilma foydali.", "Основы сетей рассматриваются в первом модуле; RouterOS-устройство не обязательно, но безопасный виртуальный стенд или запасное устройство полезны.", "Networking fundamentals are included first; a RouterOS device is optional, though a safe virtual or spare device helps."),
    outcomes: l("Interfeys va route holatini o‘qish; NAT/firewall qoidasini izohlash; VLAN va Wi‑Fi segmentatsiyasini chizish; o‘zgarishdan oldin backup va tekshiruv rejasini tuzish.", "Читать состояние интерфейсов и маршрутов; объяснять NAT/firewall правила; проектировать VLAN/Wi‑Fi сегментацию; планировать резервирование и проверку до изменений.", "Inspect interface and route state; explain NAT/firewall rules; design VLAN/Wi‑Fi segmentation; plan backup and verification before changes."),
    capstone: l("Sintetik filial tarmog‘i uchun RouterOS konfiguratsiya rejasi va faqat o‘qish tekshiruvlari ro‘yxatini topshiring. Rubrika: manzillash, VLAN, minimal ruxsat, backup, rollback va foydalanuvchi ta’sirini tushuntirish.", "Подготовьте план RouterOS для синтетической сети филиала и список проверок только для чтения. Критерии: адресация, VLAN, минимальные разрешения, backup/rollback и объяснение влияния на пользователей.", "Submit a RouterOS plan for a synthetic branch network plus read-only verification checks. Rubric: addressing, VLANs, least access, backup, rollback, and user-impact explanation."),
    modules: ["network-fundamentals", "mikrotik-routeros-basics"]
  },
  {
    slug: "firewall-engineering-zero-to-hero",
    kind: "skill",
    title: l("Firewall muhandisligi: noldan amaliyotgacha", "Инженерия firewall: от основ до практики", "Firewall Engineering: Zero to Hands-on"),
    summary: l(
      "Umumiy firewall arxitekturasi va Kerio Control boshqaruvini amaliy o‘quv yo‘nalishida o‘rganing.",
      "Изучите архитектуру firewall и администрирование Kerio Control в практическом учебном направлении.",
      "Learn firewall architecture and Kerio Control administration in a practical learning path."
    ),
    timeEstimate: l("Taxminan 90–120 soat: asosiy tarmoq, firewall/Kerio darslari, mustaqil dizayn va xavfsiz sinov rejasi.", "Около 90–120 часов: сети, firewall/Kerio, самостоятельное проектирование и план безопасных испытаний.", "About 90–120 hours for networking, firewall/Kerio lessons, independent design, and a safe test plan."),
    prerequisites: l("Tarmoq asoslari yo‘l boshida kiritilgan; Kerio qurilmasi yoki litsenziya majburiy emas. Bu yo‘l ishlab chiqarish tizimidagi tajribani almashtirmaydi.", "Основы сетей включены в начало курса; устройство или лицензия Kerio не обязательны. Курс не заменяет опыт работы с production.", "Networking foundations are included first; a Kerio appliance or license is not required. This path does not replace production experience."),
    outcomes: l("Firewall zonalari va oqimlarni xaritalash; NAT, VPN va qoidalar ketma-ketligini izohlash; loglardan nosozlik topish; backup/rollback va o‘zgarish rejasini yozish.", "Картировать зоны и потоки firewall; объяснять NAT, VPN и порядок правил; диагностировать сбои по журналам; составлять план изменений и отката.", "Map firewall zones and flows; explain NAT, VPN, and rule order; troubleshoot from logs; write change, backup, and rollback plans."),
    capstone: l("Faqat izolyatsiyalangan yoki qog‘ozdagi sintetik ofis uchun segmented tarmoq dizaynini yarating: zonalar, qoidalar jadvali, VPN taxmini, testlar va rollback. Rubrika: talablar izchilligi, default-deny, minimal ruxsat, sinov dalillari va rollback.", "Спроектируйте сегментированную сеть для изолированного или учебного офиса: зоны, таблица правил, VPN, тесты и откат. Критерии: соответствие требованиям, default-deny, минимальные разрешения, доказательства тестирования и rollback.", "Design a segmented network for an isolated or paper-based synthetic office: zones, rule matrix, VPN assumptions, tests, and rollback. Rubric: requirements traceability, default-deny, least privilege, test evidence, and rollback."),
    modules: ["network-fundamentals", "firewall-zero-to-hero", "kerio-control-zero-to-hero"]
  },
  {
    slug: "cisco-ios-zero-to-hero",
    kind: "skill",
    title: l("Cisco IOS: noldan amaliy darajagacha", "Cisco IOS: от основ до практики", "Cisco IOS: Zero to Hands-on"),
    summary: l(
      "CLI va boshlang‘ich sozlamalardan VLAN, STP, routing, ACL va yakuniy laboratoriya loyihasigacha.",
      "От CLI и начальной настройки до VLAN, STP, маршрутизации, ACL и итоговой лабораторной работы.",
      "From the CLI and initial setup to VLANs, STP, routing, ACLs, and a capstone lab."
    ),
    timeEstimate: l("Taxminan 55–70 soat: tarmoq va Cisco modullari, Packet Tracer yoki shaxsiy lab mashqlari, yakuniy hujjat.", "Около 55–70 часов: сетевой и Cisco-модули, упражнения в Packet Tracer или собственной лаборатории, итоговая документация.", "About 55–70 hours for networking and Cisco modules, Packet Tracer or personal lab exercises, and final documentation."),
    prerequisites: l("Boshlang‘ich tarmoq tushunchalari birinchi modulda beriladi; real Cisco qurilmasi kerak emas. Virtual simulyator alohida o‘rnatilishi mumkin.", "Основы сетей включены в первый модуль; реальное Cisco-оборудование не требуется. Симулятор можно установить отдельно.", "Networking basics are included first; physical Cisco equipment is not required. A simulator may need to be installed separately."),
    outcomes: l("IOS CLI rejimlarini farqlash; VLAN/trunk, STP, routing va ACL rejasini o‘qish; konfiguratsiyani saqlash va sinash; nosozlik bo‘yicha dalilli hisobot yozish.", "Различать режимы IOS CLI; читать план VLAN/trunk, STP, маршрутизации и ACL; сохранять и проверять конфигурацию; документировать диагностику.", "Distinguish IOS CLI modes; interpret VLAN/trunk, STP, routing, and ACL plans; save and verify configurations; document troubleshooting evidence."),
    capstone: l("Packet Tracer yoki qog‘oz modeli orqali ikki bo‘limli tarmoqni loyihalang. Topshiriq: diagramma, VLAN/IP jadvali, routing/ACL ni asoslash, test matritsasi va qaytarish qadamlari. Fizik Cisco lab platformaga ulanmagan.", "Спроектируйте сеть из двух отделов в Packet Tracer или на схеме. Сдайте диаграмму, VLAN/IP таблицу, обоснование routing/ACL, тест-матрицу и шаги отката. Физическая Cisco-лаборатория к платформе не подключена.", "Design a two-department network in Packet Tracer or on paper. Submit a diagram, VLAN/IP table, routing/ACL rationale, test matrix, and rollback steps. No physical Cisco lab is connected to this platform."),
    modules: ["network-fundamentals", "cisco-ios-fundamentals"]
  },
  {
    slug: "wireless-network-security",
    kind: "skill",
    title: l("Simsiz tarmoq xavfsizligi", "Безопасность беспроводных сетей", "Wireless Network Security"),
    summary: l("Wi‑Fi xavfsizlik standartlari, ruxsatli baholash va access point konfiguratsiyasini mustahkamlash.", "Стандарты Wi‑Fi, разрешённая оценка и усиление конфигурации точек доступа.", "Wi-Fi security standards, authorized assessment, and access-point hardening."),
    timeEstimate: l("Taxminan 25–35 soat: ikki modul, konfiguratsiya taqqoslash, mustaqil audit ro‘yxati va loyiha.", "Около 25–35 часов: два модуля, сравнение конфигураций, самостоятельный чек-лист аудита и проект.", "About 25–35 hours for two modules, configuration comparisons, an independent audit checklist, and a project."),
    prerequisites: l("Tarmoq asoslari yo‘l boshida beriladi; faqat o‘zingiz boshqaradigan access point yoki simulyatsiyadan foydalaning.", "Основы сетей включены; используйте только собственную точку доступа или симулятор.", "Networking basics are included; use only an access point you control or a simulator."),
    outcomes: l("WPA2/3 va autentifikatsiya tanlovlarini tushuntirish; mehmon/korporativ SSID ni ajratish; ruxsatli audit doirasini belgilash; xavfsiz konfiguratsiya ro‘yxatini tuzish.", "Объяснять WPA2/3 и варианты аутентификации; разделять гостевой и корпоративный SSID; определять границы разрешённой проверки; составлять чек-лист защиты.", "Explain WPA2/3 and authentication choices; separate guest and corporate SSIDs; define an authorized assessment scope; produce a hardening checklist."),
    capstone: l("Uy/ofis Wi‑Fi dizayni va xavf tahlilini topshiring: SSID/VLAN, boshqaruv, guest isolation, yangilash va incident response. Rubrika: minimal ochiq xizmat, ruxsat doirasi, test reja va hujjatlashtirish.", "Подготовьте дизайн и оценку рисков Wi‑Fi: SSID/VLAN, управление, изоляция гостей, обновления и реагирование. Критерии: минимум открытых сервисов, границы разрешения, план тестирования и документация.", "Submit a home/office Wi-Fi design and risk assessment covering SSID/VLAN, management, guest isolation, updates, and incident response. Rubric: minimal exposure, authorized scope, test plan, and documentation."),
    modules: ["network-fundamentals", "wifi-security"]
  },
  {
    slug: "active-directory-security",
    kind: "skill",
    title: l("Active Directory himoyasi", "Защита Active Directory", "Active Directory Defense"),
    summary: l("Active Directory himoya tamoyillari, ruxsatlarni ko‘rib chiqish va xavfsiz audit rejalash.", "Принципы защиты Active Directory, проверка прав и планирование безопасного аудита.", "Active Directory defense, access review, and safe audit planning."),
    timeEstimate: l("Taxminan 25–35 soat: Windows va AD darslari, xavfsiz tekshiruvlar va yakuniy hardening rejasi.", "Около 25–35 часов: Windows/AD, безопасные проверки и итоговый план hardening.", "About 25–35 hours for Windows/AD lessons, safe checks, and a final hardening plan."),
    prerequisites: l("Windows asoslari birinchi modulda bor; domen muhiti yoki administrator huquqi talab qilinmaydi.", "Основы Windows включены в первый модуль; домен и права администратора не требуются.", "Windows basics are included first; a domain environment or administrator access is not required."),
    outcomes: l("OU, GPO, DNS va guruhlar rolini tushuntirish; imtiyozlarni ko‘rib chiqish; o‘zgarishlarni test OU da sinash; xavfsiz tekshiruv va rollbackni hujjatlashtirish.", "Объяснять роли OU, GPO, DNS и групп; проверять привилегии; тестировать изменения в тестовой OU; документировать безопасную проверку и откат.", "Explain OU, GPO, DNS, and group roles; review privileges; test changes in a test OU; document safe verification and rollback."),
    capstone: l("Sintetik korxona domeni uchun xavfsizlik baseline va GPO o‘zgarish taklifini yozing. Rubrika: least privilege, ta’sir ko‘lami, sinov/rollback, audit yozuvlari va dalillarga tayangan tavsiyalar.", "Подготовьте baseline безопасности и предложение GPO для синтетического домена. Критерии: least privilege, масштаб воздействия, тест/откат, аудит и рекомендации на основе доказательств.", "Write a security baseline and GPO change proposal for a synthetic domain. Rubric: least privilege, impact scope, test/rollback, audit trail, and evidence-based recommendations."),
    modules: ["windows-fundamentals", "active-directory-security"]
  },
  {
    slug: "cctv-physical-security",
    kind: "skill",
    title: l("CCTV va jismoniy xavfsizlik", "CCTV и физическая безопасность", "CCTV and Physical Security"),
    summary: l("CCTV loyihalash, saqlash va tarmoq talablarini baholash. Sayt ko‘rigi va amaliy montaj tajribasini almashtirmaydi.", "Проектирование CCTV, оценка хранения и сети. Не заменяет осмотр объекта и практический монтаж.", "CCTV design and storage/network estimation. Does not replace a site survey or supervised installation."),
    timeEstimate: l("Taxminan 25–35 soat: tarmoq asoslari, CCTV moduli, saqlash hisoblari va loyiha hujjatlari.", "Около 25–35 часов: основы сетей, CCTV, расчёт хранения и проектная документация.", "About 25–35 hours for networking basics, CCTV, storage calculations, and design documentation."),
    prerequisites: l("Oldindan tajriba shart emas; kamera soni, ko‘rish zonasi va saqlash kunlari kabi talablarni aniqlashga tayyor bo‘ling.", "Опыт не обязателен; будьте готовы собирать требования по количеству камер, зонам обзора и сроку хранения.", "No prior experience required; be ready to gather camera-count, coverage, and retention requirements."),
    outcomes: l("Kamera joylashuvini sxemalash; bitrate/storage va PoE ehtiyojini taxminlash; maxfiylik/saqlash xavflarini aniqlash; site-survey savollarini tuzish.", "Намечать расположение камер; оценивать bitrate/storage и PoE; выявлять риски приватности и хранения; составлять вопросы для site survey.", "Sketch camera placement; estimate bitrate/storage and PoE; identify privacy/retention risks; prepare site-survey questions."),
    capstone: l("Sintetik kichik obyekt uchun kamera coverage, saqlash taxmini, tarmoq/PoE sxemasi va maxfiylik tekshiruvini topshiring. Rubrika: hisobdagi birliklar, ko‘r nuqtalar, retention taxmini, tarmoq ajratilishi va cheklovlarni ochiq ko‘rsatish.", "Подготовьте coverage, оценку хранения, сетевую/PoE схему и privacy-чек для синтетического объекта. Критерии: единицы расчёта, слепые зоны, срок хранения, сегментация и явные ограничения.", "Submit coverage, storage estimate, network/PoE diagram, and privacy review for a synthetic site. Rubric: calculation units, blind spots, retention assumptions, segmentation, and disclosed limitations."),
    modules: ["network-fundamentals", "cctv-system-design"]
  }
];

export const sectionId = (moduleSlug: string, index: number) => `${moduleSlug}:${index}`;
export const getModule = (slug: string) => learningModules.find((item) => item.slug === slug);
export const getPath = (slug: string) => learningPaths.find((item) => item.slug === slug);

export const difficultyOrder: Difficulty[] = ["fundamental", "easy", "medium", "hard"];
export const categoryOrder: Category[] = ["networking", "systems", "security", "physical"];

export type LearningText = {
  eyebrow: string; title: string; intro: string; openDashboard: string; browseCatalog: string;
  statPaths: string; statModules: string; statSections: string;
  pathsTitle: string; jobRole: string; skillPath: string; modulesTitle: string; all: string;
  createPath: string; pathName: string; pathSummary: string; pathNamePlaceholder: string; pathSummaryPlaceholder: string;
  selectModules: string; savePath: string; cancel: string; removePath: string;
  pathSaved: string; pathNameRequired: string; selectAtLeastOne: string; pathSaveFailed: string; yourPath: string;
  free: string; modulePrice: string; sectionPrice: string; bundlePrice: string; unlockModule: string;
  unlockSection: string; bundleDiscount: string; tecBalance: string; tecShort: string;
  lockedLesson: string; signInToPurchase: string; purchaseSuccess: string; purchaseFailed: string;
  purchasing: string; goToWallet: string; purchaseUnavailable: string;
  modulesCount: string; sectionsCount: string; hours: string; hasLab: string;
  referencesTitle: string;
  start: string; continueLearning: string; open: string; progress: string; completed: string;
  difficulty: Record<Difficulty, string>; category: Record<Category, string>;
  pathIncludes: string; backToCatalog: string;
  timeEstimateLabel: string; prerequisitesLabel: string; outcomesLabel: string; capstoneLabel: string; deliveryDisclaimer: string;
  tableOfContents: string; sectionBody: string; exampleTitle: string; markComplete: string; sectionDone: string; next: string; previous: string;
  question: string; answerPlaceholder: string; check: string; correct: string; wrong: string;
  labTitle: string; labDescription: string; labSoon: string; moduleDone: string;
  dashboardTitle: string; learnerName: string; learnerRole: string; points: string; level: string;
  statDoneSections: string; statDoneModules: string; statActivePaths: string;
  resumeTitle: string; resumeEmpty: string; myPaths: string; badges: string; certificates: string;
  certificateLocked: string; certificateReady: string; resetProgress: string; resetConfirm: string; storedLocally: string;
  badgeFirstStep: string; badgeFirstModule: string; badgeHalfway: string; badgeFinisher: string;
};

export const learningUi: Record<Locale, LearningText> = {
  uz: {
    eyebrow: "Tecsecure Academy", title: "IT va kiberxavfsizlik ta’limi",
    intro: "Yo‘nalishlarni bosqichma-bosqich o‘rganing. Bu mustaqil ta’lim va mahalliy mashqlar uchun material; platformada hosted lab yoki ishga tayyorlik kafolati yo‘q.",
    openDashboard: "Mening o‘qishim", browseCatalog: "Katalogni ko‘rish",
    statPaths: "Yo‘nalish", statModules: "Modul", statSections: "Bo‘lim",
    pathsTitle: "O‘quv yo‘nalishlari", jobRole: "Kasbiy yo‘nalish", skillPath: "Ko‘nikma yo‘nalishi", modulesTitle: "Modullar katalogi", all: "Barchasi",
    createPath: "O‘z path’ingizni yarating", pathName: "Path nomi", pathSummary: "Qisqacha maqsad", pathNamePlaceholder: "Masalan: Junior tarmoq administratori", pathSummaryPlaceholder: "Bu yo‘nalishda nimani o‘rganmoqchisiz?",
    selectModules: "Modullarni tanlang", savePath: "Path’ni saqlash", cancel: "Bekor qilish", removePath: "O‘chirish",
    pathSaved: "Shaxsiy path saqlandi.", pathNameRequired: "Path nomini kiriting.", selectAtLeastOne: "Kamida bitta modul tanlang.", pathSaveFailed: "Path saqlanmadi. 20 ta shaxsiy path chekloviga yetgan bo‘lishingiz mumkin.", yourPath: "Shaxsiy path",
    free: "Bepul", modulePrice: "Alohida darslar jami", sectionPrice: "Dars narxi", bundlePrice: "To‘liq modul", unlockModule: "Modulni ochish", unlockSection: "Darsni ochish",
    bundleDiscount: "20% chegirma", tecBalance: "TEC balans", tecShort: "TEC", lockedLesson: "Bu dars pullik. TEC bilan oching yoki bepul darslardan boshlang.",
    signInToPurchase: "TEC bilan ochish uchun tizimga kiring.", purchaseSuccess: "Material ochildi.", purchaseFailed: "Xaridni amalga oshirib bo‘lmadi.",
    purchasing: "Xarid qilinmoqda…", goToWallet: "TEC balansini ko‘rish", purchaseUnavailable: "TEC xaridlari hozircha mavjud emas.",
    modulesCount: "modul", sectionsCount: "bo‘lim", hours: "soat", hasLab: "Amaliy lab",
    start: "Boshlash", continueLearning: "Davom etish", open: "Ochish", progress: "Progress", completed: "Yakunlandi",
    difficulty: { fundamental: "Asosiy", easy: "Oson", medium: "O‘rta", hard: "Qiyin" },
    category: { networking: "Tarmoq", systems: "Tizimlar", security: "Xavfsizlik", physical: "Jismoniy xavfsizlik" },
    pathIncludes: "Yo‘nalish tarkibi", backToCatalog: "Katalogga qaytish",
    timeEstimateLabel: "Taxminiy o‘qish vaqti", prerequisitesLabel: "Boshlash uchun", outcomesLabel: "O‘rganish natijalari", capstoneLabel: "Yakuniy loyiha va baholash mezonlari",
    deliveryDisclaimer: "Vaqt oralig‘i mavjud dars hajmi, takrorlash va mustaqil mashq asosidagi taxmin; haqiqiy natija tajriba va o‘qish sur’atiga qarab farq qiladi. Yakuniy loyiha faqat o‘quv topshirig‘i, mentor bahosi yoki ish tajribasi mavjud emas.",
    tableOfContents: "Mundarija", sectionBody: "Bu bo‘lim uchun dars matni tayyorlanmoqda.", exampleTitle: "Amaliy misol",
    markComplete: "Bo‘limni yakunlash", sectionDone: "Bo‘lim yakunlangan", next: "Keyingi", previous: "Oldingi",
    question: "Savol", answerPlaceholder: "Javobingiz", check: "Tekshirish", correct: "To‘g‘ri javob! Bo‘lim yakunlandi.", wrong: "Noto‘g‘ri, qayta urinib ko‘ring.",
    labTitle: "Amaliy lab", labDescription: "Virtual laboratoriya hozircha mavjud emas. Quyidagi dars misollari simulyatorga tayyorgarlik uchun berilgan.", labSoon: "Muhit tayyorlanmoqda",
    referencesTitle: "Rasmiy hujjatlar va qo‘shimcha manbalar",
    moduleDone: "Modul yakunlandi!",
    dashboardTitle: "O‘quvchi kabineti", learnerName: "O‘quvchi", learnerRole: "Tecsecure Academy talabasi", points: "Ball", level: "Daraja",
    statDoneSections: "Yakunlangan bo‘limlar", statDoneModules: "Yakunlangan modullar", statActivePaths: "Faol yo‘nalishlar",
    resumeTitle: "Qolgan joydan davom eting", resumeEmpty: "Hali o‘qishni boshlamadingiz. Yo‘nalishni tanlang.", myPaths: "Mening yo‘nalishlarim", badges: "Yutuqlar", certificates: "Sertifikatlar",
    certificateLocked: "Yo‘nalish yakunlangach ochiladi", certificateReady: "Tayyor", resetProgress: "Progressni tozalash", resetConfirm: "Barcha o‘qish progressi o‘chirilsinmi?", storedLocally: "Ma’lumotlar faqat shu qurilmada saqlanadi.",
    badgeFirstStep: "Birinchi qadam", badgeFirstModule: "Birinchi modul", badgeHalfway: "Yarim yo‘l", badgeFinisher: "Yo‘nalish egasi"
  },
  ru: {
    eyebrow: "Tecsecure Academy", title: "Обучение IT и кибербезопасности",
    intro: "Изучайте направления шаг за шагом. Это материалы для самостоятельного обучения и локальной практики; hosted-лаборатории и гарантии трудоустройства нет.",
    openDashboard: "Моё обучение", browseCatalog: "Смотреть каталог",
    statPaths: "Направлений", statModules: "Модулей", statSections: "Разделов",
    pathsTitle: "Учебные направления", jobRole: "Профессия", skillPath: "Навык", modulesTitle: "Каталог модулей", all: "Все",
    createPath: "Создать свой путь", pathName: "Название пути", pathSummary: "Краткая цель", pathNamePlaceholder: "Например: младший сетевой администратор", pathSummaryPlaceholder: "Чему вы хотите научиться?",
    selectModules: "Выберите модули", savePath: "Сохранить путь", cancel: "Отмена", removePath: "Удалить",
    pathSaved: "Личный путь сохранён.", pathNameRequired: "Введите название пути.", selectAtLeastOne: "Выберите хотя бы один модуль.", pathSaveFailed: "Не удалось сохранить путь. Возможно, достигнут лимит в 20 личных путей.", yourPath: "Личный путь",
    free: "Бесплатно", modulePrice: "Сумма отдельных уроков", sectionPrice: "Цена урока", bundlePrice: "Весь модуль", unlockModule: "Открыть модуль", unlockSection: "Открыть урок",
    bundleDiscount: "Скидка 20%", tecBalance: "Баланс TEC", tecShort: "TEC", lockedLesson: "Этот урок платный. Откройте его за TEC или начните с бесплатных уроков.",
    signInToPurchase: "Войдите, чтобы открыть за TEC.", purchaseSuccess: "Материал открыт.", purchaseFailed: "Не удалось завершить покупку.",
    purchasing: "Покупка…", goToWallet: "Посмотреть баланс TEC", purchaseUnavailable: "Покупка за TEC пока недоступна.",
    modulesCount: "модулей", sectionsCount: "разделов", hours: "ч", hasLab: "Практическая лаборатория",
    start: "Начать", continueLearning: "Продолжить", open: "Открыть", progress: "Прогресс", completed: "Завершено",
    difficulty: { fundamental: "Базовый", easy: "Лёгкий", medium: "Средний", hard: "Сложный" },
    category: { networking: "Сети", systems: "Системы", security: "Безопасность", physical: "Физическая безопасность" },
    pathIncludes: "Состав направления", backToCatalog: "Назад к каталогу",
    timeEstimateLabel: "Оценка времени", prerequisitesLabel: "Перед началом", outcomesLabel: "Результаты обучения", capstoneLabel: "Итоговый проект и критерии",
    deliveryDisclaimer: "Диапазон рассчитан по объёму уроков, повторению и самостоятельной практике; фактическое время зависит от опыта и темпа. Итоговый проект — учебное задание, без оценки наставника или подтверждения опыта работы.",
    tableOfContents: "Содержание", sectionBody: "Материал этого раздела готовится.", exampleTitle: "Практический пример",
    markComplete: "Завершить раздел", sectionDone: "Раздел завершён", next: "Далее", previous: "Назад",
    question: "Вопрос", answerPlaceholder: "Ваш ответ", check: "Проверить", correct: "Верно! Раздел завершён.", wrong: "Неверно, попробуйте ещё раз.",
    labTitle: "Практическая лаборатория", labDescription: "Виртуальная лаборатория пока недоступна. Примеры уроков помогут подготовиться к симулятору.", labSoon: "Среда готовится",
    referencesTitle: "Официальная документация и дополнительные материалы",
    moduleDone: "Модуль завершён!",
    dashboardTitle: "Кабинет ученика", learnerName: "Ученик", learnerRole: "Студент Tecsecure Academy", points: "Баллы", level: "Уровень",
    statDoneSections: "Завершено разделов", statDoneModules: "Завершено модулей", statActivePaths: "Активные направления",
    resumeTitle: "Продолжите с того же места", resumeEmpty: "Вы ещё не начали обучение. Выберите направление.", myPaths: "Мои направления", badges: "Достижения", certificates: "Сертификаты",
    certificateLocked: "Откроется после завершения направления", certificateReady: "Готово", resetProgress: "Сбросить прогресс", resetConfirm: "Удалить весь учебный прогресс?", storedLocally: "Данные хранятся только на этом устройстве.",
    badgeFirstStep: "Первый шаг", badgeFirstModule: "Первый модуль", badgeHalfway: "Полпути", badgeFinisher: "Выпускник направления"
  },
  en: {
    eyebrow: "Tecsecure Academy", title: "IT and cybersecurity education",
    intro: "Follow structured learning paths. Material supports self-study and local practice; hosted labs and job-readiness guarantees are not provided.",
    openDashboard: "My learning", browseCatalog: "Browse catalog",
    statPaths: "Paths", statModules: "Modules", statSections: "Sections",
    pathsTitle: "Learning paths", jobRole: "Job role path", skillPath: "Skill path", modulesTitle: "Module catalog", all: "All",
    createPath: "Build your own path", pathName: "Path name", pathSummary: "Short goal", pathNamePlaceholder: "For example: Junior network administrator", pathSummaryPlaceholder: "What do you want to learn?",
    selectModules: "Choose modules", savePath: "Save path", cancel: "Cancel", removePath: "Remove",
    pathSaved: "Your learning path is saved.", pathNameRequired: "Enter a path name.", selectAtLeastOne: "Choose at least one module.", pathSaveFailed: "Could not save the path. You may have reached the 20-path limit.", yourPath: "Personal path",
    free: "Free", modulePrice: "Individual lessons total", sectionPrice: "Lesson price", bundlePrice: "Full module", unlockModule: "Unlock module", unlockSection: "Unlock lesson",
    bundleDiscount: "20% off", tecBalance: "TEC balance", tecShort: "TEC", lockedLesson: "This lesson requires TEC. Unlock it or start with free lessons.",
    signInToPurchase: "Sign in to unlock content with TEC.", purchaseSuccess: "Content unlocked.", purchaseFailed: "Purchase could not be completed.",
    purchasing: "Purchasing…", goToWallet: "View TEC balance", purchaseUnavailable: "TEC purchases are not available yet.",
    modulesCount: "modules", sectionsCount: "sections", hours: "h", hasLab: "Hands-on lab",
    start: "Start", continueLearning: "Continue", open: "Open", progress: "Progress", completed: "Completed",
    difficulty: { fundamental: "Fundamental", easy: "Easy", medium: "Medium", hard: "Hard" },
    category: { networking: "Networking", systems: "Systems", security: "Security", physical: "Physical security" },
    pathIncludes: "Path contents", backToCatalog: "Back to catalog",
    timeEstimateLabel: "Estimated study time", prerequisitesLabel: "Before you start", outcomesLabel: "Learning outcomes", capstoneLabel: "Capstone and assessment rubric",
    deliveryDisclaimer: "Time ranges estimate the published lesson material, review, and independent practice; actual time varies with prior experience and pace. The capstone is a learning exercise, not mentor-graded or proof of work experience.",
    tableOfContents: "Contents", sectionBody: "This section's lesson text is being prepared.", exampleTitle: "Worked example",
    markComplete: "Complete section", sectionDone: "Section completed", next: "Next", previous: "Previous",
    question: "Question", answerPlaceholder: "Your answer", check: "Check", correct: "Correct! Section completed.", wrong: "Incorrect, try again.",
    labTitle: "Hands-on lab", labDescription: "A virtual lab is not available yet. The lesson examples are preparation for a simulator.", labSoon: "Environment in preparation",
    referencesTitle: "Official documentation and further reading",
    moduleDone: "Module completed!",
    dashboardTitle: "Learner dashboard", learnerName: "Learner", learnerRole: "Tecsecure Academy student", points: "Points", level: "Level",
    statDoneSections: "Sections completed", statDoneModules: "Modules completed", statActivePaths: "Active paths",
    resumeTitle: "Pick up where you left off", resumeEmpty: "You have not started yet. Choose a path.", myPaths: "My paths", badges: "Achievements", certificates: "Certificates",
    certificateLocked: "Unlocks when the path is completed", certificateReady: "Ready", resetProgress: "Reset progress", resetConfirm: "Delete all learning progress?", storedLocally: "Data is stored only on this device.",
    badgeFirstStep: "First step", badgeFirstModule: "First module", badgeHalfway: "Halfway there", badgeFinisher: "Path finisher"
  }
};
