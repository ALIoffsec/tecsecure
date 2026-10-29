import type { LearningExample, Localized } from "@/lib/learning-demo";

const l = (uz: string, ru: string, en: string): Localized => ({ uz, ru, en });
const example = (
  code: string,
  codeRu: string,
  codeEn: string,
  explanation: string,
  explanationRu: string,
  explanationEn: string
): LearningExample => ({
  code: l(code, codeRu, codeEn),
  explanation: l(explanation, explanationRu, explanationEn)
});

export const firewallKerioTerminalExamples: Record<string, LearningExample[]> = {
  "firewall-zero-to-hero": [
    example(
      "Windows (PowerShell):\nGet-NetFirewallProfile | Select-Object Name, Enabled\n\nLinux:\nsudo nft list ruleset",
      "Windows (PowerShell):\nGet-NetFirewallProfile | Select-Object Name, Enabled\n\nLinux:\nsudo nft list ruleset",
      "Windows (PowerShell):\nGet-NetFirewallProfile | Select-Object Name, Enabled\n\nLinux:\nsudo nft list ruleset",
      "Windows buyruqlari firewall profilining yoqilganini, Linux buyrug‘i esa amaldagi nftables qoidalarini faqat ko‘rsatadi. Faqat o‘zingiz boshqaradigan qurilmada ishlating; qoidani o‘zgartirmaydi.",
      "Команда Windows только показывает, включён ли профиль firewall, а команда Linux — только текущие правила nftables. Запускайте это лишь на устройстве, которым управляете сами; правила при этом не изменяются.",
      "The Windows command only shows whether the firewall profile is enabled, and the Linux command only lists the current nftables rules. Run this only on a device you control yourself; it does not change any rule."
    ),
    example(
      "Windows:\nGet-NetTCPConnection -State Established |\n  Select-Object -First 10 LocalAddress, LocalPort, RemoteAddress, RemotePort, State\n\nLinux:\nss -tn state established",
      "Windows:\nGet-NetTCPConnection -State Established |\n  Select-Object -First 10 LocalAddress, LocalPort, RemoteAddress, RemotePort, State\n\nLinux:\nss -tn state established",
      "Windows:\nGet-NetTCPConnection -State Established |\n  Select-Object -First 10 LocalAddress, LocalPort, RemoteAddress, RemotePort, State\n\nLinux:\nss -tn state established",
      "Bu joriy hostdagi o‘rnatilgan TCP ulanishlaridan namuna ko‘rsatadi. Sessiya ro‘yxati stateful firewall’ning ichki jadvali emas, faqat endpoint kuzatuvidir; manzillarni oshkor qiluvchi natijani himoyalang.",
      "Это показывает выборку установленных TCP-соединений на текущем хосте. Список сессий — не внутренняя таблица stateful firewall, а лишь наблюдение на уровне конечного узла; защищайте вывод, раскрывающий адреса.",
      "This shows a sample of established TCP connections on the current host. The session list is not the internal table of a stateful firewall — it is only endpoint-level observation; protect output that exposes addresses."
    ),
    example(
      "$rulePlan = [pscustomobject]@{\n  Id = 'APP-DB-01'\n  Source = '10.20.10.0/24'\n  Destination = '10.20.20.10'\n  Protocol = 'TCP'\n  Port = 5432\n  Action = 'Allow + log'\n  Owner = 'app-team'\n}\n$rulePlan | Format-List",
      "$rulePlan = [pscustomobject]@{\n  Id = 'APP-DB-01'\n  Source = '10.20.10.0/24'\n  Destination = '10.20.20.10'\n  Protocol = 'TCP'\n  Port = 5432\n  Action = 'Allow + log'\n  Owner = 'app-team'\n}\n$rulePlan | Format-List",
      "$rulePlan = [pscustomobject]@{\n  Id = 'APP-DB-01'\n  Source = '10.20.10.0/24'\n  Destination = '10.20.20.10'\n  Protocol = 'TCP'\n  Port = 5432\n  Action = 'Allow + log'\n  Owner = 'app-team'\n}\n$rulePlan | Format-List",
      "Bu PowerShell obyekti qoida talabini terminalda hujjatlashtiradi, firewall’ga qoida qo‘shmaydi. IP va portlar namuna; haqiqiy tarmoq o‘zgarishi uchun egasi tasdig‘i, ikkinchi tekshiruv va rollback zarur.",
      "Этот объект PowerShell лишь документирует запрос на правило в терминале и не добавляет правило в firewall. IP-адреса и порты — примерные; для реального изменения сети нужны подтверждение владельца, повторная проверка и план отката.",
      "This PowerShell object only documents a rule request in the terminal and does not add a rule to the firewall. The IPs and ports are examples; an actual network change requires owner approval, a second review, and a rollback plan."
    ),
    example(
      "Get-NetFirewallProfile |\n  Format-Table Name, Enabled, DefaultInboundAction, DefaultOutboundAction\nGet-NetFirewallRule -PolicyStore ActiveStore |\n  Select-Object -First 15 DisplayName, Enabled, Direction, Action",
      "Get-NetFirewallProfile |\n  Format-Table Name, Enabled, DefaultInboundAction, DefaultOutboundAction\nGet-NetFirewallRule -PolicyStore ActiveStore |\n  Select-Object -First 15 DisplayName, Enabled, Direction, Action",
      "Get-NetFirewallProfile |\n  Format-Table Name, Enabled, DefaultInboundAction, DefaultOutboundAction\nGet-NetFirewallRule -PolicyStore ActiveStore |\n  Select-Object -First 15 DisplayName, Enabled, Direction, Action",
      "Bular Windows Defender Firewall’ning faol profillari va qoidalarini o‘qiydi, sozlamani o‘zgartirmaydi. Natija ichki tarmoq tafsilotlarini ochishi mumkin; ommaga ulashmang.",
      "Эти команды только читают активные профили и правила Windows Defender Firewall, не изменяя настройки. Результат может раскрыть детали внутренней сети — не публикуйте его.",
      "These commands only read the active profiles and rules of Windows Defender Firewall without changing any setting. The output may reveal internal network details — do not share it publicly."
    ),
    example(
      "sudo nft list ruleset\nsudo ufw status verbose\nsudo firewall-cmd --list-all",
      "sudo nft list ruleset\nsudo ufw status verbose\nsudo firewall-cmd --list-all",
      "sudo nft list ruleset\nsudo ufw status verbose\nsudo firewall-cmd --list-all",
      "Faqat Linux distributivingizda ishlatilayotgan firewall boshqaruv vositasiga tegishli buyruqni bajaring. Ular mavjud holatni ko‘rsatadi; bir hostda bir nechta boshqaruv vositasi qoidalarni boshqarsa, avval administrator bilan aniqlashtiring.",
      "Выполняйте только ту команду, которая относится к инструменту управления firewall, фактически используемому в вашем дистрибутиве Linux. Они лишь показывают текущее состояние; если на одном хосте правилами управляют сразу несколько инструментов, сначала уточните это у администратора.",
      "Run only the command that matches the firewall management tool actually used on your Linux distribution. They only show the current state; if more than one management tool governs rules on the same host, clarify this with the administrator first."
    ),
    example(
      "Windows:\nGet-NetRoute -AddressFamily IPv4 | Sort-Object RouteMetric |\n  Select-Object -First 12 DestinationPrefix, NextHop, InterfaceAlias, RouteMetric\n\nLinux:\nip route",
      "Windows:\nGet-NetRoute -AddressFamily IPv4 | Sort-Object RouteMetric |\n  Select-Object -First 12 DestinationPrefix, NextHop, InterfaceAlias, RouteMetric\n\nLinux:\nip route",
      "Windows:\nGet-NetRoute -AddressFamily IPv4 | Sort-Object RouteMetric |\n  Select-Object -First 12 DestinationPrefix, NextHop, InterfaceAlias, RouteMetric\n\nLinux:\nip route",
      "Marshrut jadvali paket firewall’ga qaysi yo‘ldan kelishi va qayerga ketishini tushunishga yordam beradi. Bu firewall qoidasi ruxsat berdi degani emas; qaytish marshrutini ham tekshiring.",
      "Таблица маршрутизации помогает понять, по какому пути пакет приходит к firewall и куда уходит дальше. Это не означает, что правило firewall разрешило трафик; проверяйте также обратный маршрут.",
      "The routing table helps you understand which path a packet takes to reach the firewall and where it goes next. This does not mean a firewall rule has allowed the traffic; check the return route as well."
    ),
    example(
      "Windows:\nGet-NetFirewallRule -PolicyStore ActiveStore |\n  Select-Object -First 20 DisplayName, Profile, Direction, Action, Enabled\n\nLinux:\nsudo nft list ruleset",
      "Windows:\nGet-NetFirewallRule -PolicyStore ActiveStore |\n  Select-Object -First 20 DisplayName, Profile, Direction, Action, Enabled\n\nLinux:\nsudo nft list ruleset",
      "Windows:\nGet-NetFirewallRule -PolicyStore ActiveStore |\n  Select-Object -First 20 DisplayName, Profile, Direction, Action, Enabled\n\nLinux:\nsudo nft list ruleset",
      "Bu misollar host firewall qoidalarini o‘qishga mo‘ljallangan; ular NGFW’ning App-ID yoki IPS siyosatini ko‘rsatmaydi. Appliance’da faqat o‘sha ishlab chiqaruvchi va aniq versiyaning rasmiy CLI/GUI qo‘llanmasidan foydalaning.",
      "Эти примеры предназначены для чтения правил хостового firewall; они не отображают политику App-ID или IPS в NGFW. На аппаратном шлюзе используйте только официальную CLI/GUI-документацию именно того производителя и версии.",
      "These examples are meant for reading host-based firewall rules; they do not show an NGFW's App-ID or IPS policy. On an appliance, use only the official CLI/GUI documentation for that exact vendor and version."
    ),
    example(
      "curl.exe -I https://example.com",
      "curl.exe -I https://example.com",
      "curl.exe -I https://example.com",
      "Faqat ruxsatli test qurilmasidan oddiy HTTPS HEAD so‘rovini yuborib, javob sarlavhalarini ko‘rsatadi; zaiflik testi bajarmaydi. O‘z tashkilotingizdagi WAF sinovi uchun egasi tasdiqlagan test endpoint’idan foydalaning.",
      "Отправляет простой HTTPS HEAD-запрос только с разрешённого тестового устройства и показывает заголовки ответа; тест на уязвимости не выполняется. Для проверки WAF в своей организации используйте тестовый endpoint, одобренный его владельцем.",
      "Sends a simple HTTPS HEAD request only from an authorized test device and shows the response headers; it does not perform a vulnerability test. For WAF testing in your own organization, use a test endpoint approved by its owner."
    ),
    example(
      "AWS CLI (faqat o‘z hisobingizda):\naws ec2 describe-security-groups --group-ids sg-0123456789abcdef0 --query \"SecurityGroups[].IpPermissions\" --output json\n\nAzure CLI:\naz network nsg rule list --resource-group rg-lab --nsg-name nsg-lab --output table\n\nGoogle Cloud CLI:\ngcloud compute firewall-rules list --format=\"table(name,network,direction,disabled)\"",
      "AWS CLI (только в собственном аккаунте):\naws ec2 describe-security-groups --group-ids sg-0123456789abcdef0 --query \"SecurityGroups[].IpPermissions\" --output json\n\nAzure CLI:\naz network nsg rule list --resource-group rg-lab --nsg-name nsg-lab --output table\n\nGoogle Cloud CLI:\ngcloud compute firewall-rules list --format=\"table(name,network,direction,disabled)\"",
      "AWS CLI (only in your own account):\naws ec2 describe-security-groups --group-ids sg-0123456789abcdef0 --query \"SecurityGroups[].IpPermissions\" --output json\n\nAzure CLI:\naz network nsg rule list --resource-group rg-lab --nsg-name nsg-lab --output table\n\nGoogle Cloud CLI:\ngcloud compute firewall-rules list --format=\"table(name,network,direction,disabled)\"",
      "Bu buyruqlar faqat o‘z cloud accountingizdagi qoidalarni o‘qiydi; autentifikatsiya va kerakli read-only IAM roli bo‘lishi kerak. Placeholder ID/resurs nomlarini lab’ingizdagiga almashtiring. Inventarizatsiya tarmoq arxitekturasini oshkor qilishi mumkin, natijani himoyalang.",
      "Эти команды только читают правила в вашем собственном облачном аккаунте; необходима аутентификация и достаточная read-only IAM-роль. Замените placeholder-идентификаторы/имена ресурсов на реальные значения из вашей лабораторной среды. Инвентаризация может раскрыть архитектуру сети — защищайте результат.",
      "These commands only read rules in your own cloud account; authentication and a sufficient read-only IAM role are required. Replace the placeholder IDs/resource names with the ones from your lab environment. The inventory output may reveal network architecture — protect the result."
    ),
    example(
      "Windows:\ntracert -d 192.0.2.10\n\nLinux:\ntraceroute -n -m 12 192.0.2.10",
      "Windows:\ntracert -d 192.0.2.10\n\nLinux:\ntraceroute -n -m 12 192.0.2.10",
      "Windows:\ntracert -d 192.0.2.10\n\nLinux:\ntraceroute -n -m 12 192.0.2.10",
      "192.0.2.10 TEST-NET hujjatlashtirish manzili; uni provayder yoki tarmoq egasi tasdiqlagan lab manzili bilan almashtiring. Yo‘ldagi javob bermagan hop albatta firewall bloklaganini anglatmaydi.",
      "192.0.2.10 — это документационный адрес TEST-NET; замените его на лабораторный адрес, подтверждённый провайдером или владельцем сети. Отсутствие ответа от промежуточного узла не обязательно означает, что его заблокировал firewall.",
      "192.0.2.10 is a TEST-NET documentation address; replace it with a lab address confirmed by the provider or network owner. A non-responding hop along the path does not necessarily mean a firewall is blocking it."
    ),
    example(
      "Windows PowerShell:\nGet-VpnConnection\nGet-NetIPConfiguration\n\nLinux:\nip route",
      "Windows PowerShell:\nGet-VpnConnection\nGet-NetIPConfiguration\n\nLinux:\nip route",
      "Windows PowerShell:\nGet-VpnConnection\nGet-NetIPConfiguration\n\nLinux:\nip route",
      "Mahalliy qurilmadagi VPN profili nomi, interfeys va marshrutlarni ko‘rsatishga yordam beradi; maxfiy kalit/parollarni ko‘rsatmaydi. Ulanish ma’lumotlarini ommaviy ulashmang; VPN server siyosatini boshqaruv konsolida tekshiring.",
      "Помогает увидеть имя VPN-профиля, интерфейс и маршруты на локальном устройстве; секретные ключи и пароли не отображаются. Не публикуйте данные о подключении; политику VPN-сервера проверяйте в консоли управления.",
      "Helps you see the VPN profile name, interface, and routes on the local device; it does not display secret keys or passwords. Do not share connection details publicly; check VPN server policy in the management console."
    ),
    example(
      "Get-WinEvent -FilterHashtable @{\n  LogName = 'Microsoft-Windows-Windows Firewall With Advanced Security/Firewall'\n  StartTime = (Get-Date).AddHours(-2)\n} -MaxEvents 30 |\n  Select-Object TimeCreated, Id, LevelDisplayName, Message",
      "Get-WinEvent -FilterHashtable @{\n  LogName = 'Microsoft-Windows-Windows Firewall With Advanced Security/Firewall'\n  StartTime = (Get-Date).AddHours(-2)\n} -MaxEvents 30 |\n  Select-Object TimeCreated, Id, LevelDisplayName, Message",
      "Get-WinEvent -FilterHashtable @{\n  LogName = 'Microsoft-Windows-Windows Firewall With Advanced Security/Firewall'\n  StartTime = (Get-Date).AddHours(-2)\n} -MaxEvents 30 |\n  Select-Object TimeCreated, Id, LevelDisplayName, Message",
      "Bu buyruq oxirgi ikki soatdagi Windows Firewall hodisalaridan 30 tagacha yozuvni o‘qiydi. Kerakli audit log yoqilgan bo‘lishi kerak; natijadagi host/IP ma’lumotlarini maxfiy saqlang.",
      "Эта команда читает до 30 записей событий Windows Firewall за последние два часа. Требуется, чтобы соответствующий audit-лог был включён; храните данные о хостах/IP из результата конфиденциально.",
      "This command reads up to 30 Windows Firewall event records from the last two hours. The relevant audit log must be enabled; keep the host/IP details in the output confidential."
    ),
    example(
      "Get-NetAdapter |\n  Format-Table Name, Status, LinkSpeed\nGet-NetIPConfiguration",
      "Get-NetAdapter |\n  Format-Table Name, Status, LinkSpeed\nGet-NetIPConfiguration",
      "Get-NetAdapter |\n  Format-Table Name, Status, LinkSpeed\nGet-NetIPConfiguration",
      "Buyruqlar faqat Windows host interfeyslari va IP sozlamalarini ko‘rsatadi; HA klasteri sog‘lomligini isbotlamaydi. Appliance klasteri uchun vendor monitoring va failover holatini tekshiring, failover’ni faqat tasdiqlangan lab’da sinang.",
      "Команды показывают только интерфейсы и IP-настройки хоста Windows; они не доказывают работоспособность HA-кластера. Для кластера на базе appliance проверяйте мониторинг производителя и состояние failover, а сам failover тестируйте только в утверждённой лабораторной среде.",
      "The commands only show the Windows host's interfaces and IP settings; they do not prove an HA cluster is healthy. For an appliance cluster, check vendor monitoring and failover status, and test failover only in an approved lab environment."
    ),
    example(
      "Windows:\nTest-NetConnection -ComputerName 192.0.2.10 -Port 443 -InformationLevel Detailed\n\nLinux:\nnc -vz -w 3 192.0.2.10 443",
      "Windows:\nTest-NetConnection -ComputerName 192.0.2.10 -Port 443 -InformationLevel Detailed\n\nLinux:\nnc -vz -w 3 192.0.2.10 443",
      "Windows:\nTest-NetConnection -ComputerName 192.0.2.10 -Port 443 -InformationLevel Detailed\n\nLinux:\nnc -vz -w 3 192.0.2.10 443",
      "Manzilni o‘zingiz boshqaradigan izolyatsiyalangan lab hosti bilan almashtiring. Bu bitta TCP portga ulanishni tekshiradi; muvaffaqiyatsizlik firewall’dan tashqari DNS, route, server yoki provider muammosidan ham bo‘lishi mumkin.",
      "Замените адрес на изолированный лабораторный хост, которым управляете сами. Это проверяет подключение к одному TCP-порту; неудача может быть вызвана не только firewall, но и проблемами DNS, маршрутизации, сервера или провайдера.",
      "Replace the address with an isolated lab host you control yourself. This checks connectivity to a single TCP port; a failure can stem not only from a firewall but also from DNS, routing, server, or provider issues."
    )
  ],
  "kerio-control-zero-to-hero": [
    example(
      "Windows:\nipconfig /all\nroute print\n\nLinux:\nip addr\nip route",
      "Windows:\nipconfig /all\nroute print\n\nLinux:\nip addr\nip route",
      "Windows:\nipconfig /all\nroute print\n\nLinux:\nip addr\nip route",
      "Klient qurilmadagi IP, gateway, DNS va marshrutni ko‘rsatadi. Kerio topologiyasini tushunish uchun WAN/LAN manzillarini faqat ruxsatli administrator hujjatlari bilan solishtiring.",
      "Показывает IP-адрес, шлюз, DNS и маршруты на клиентском устройстве. Для понимания топологии Kerio сверяйте WAN/LAN-адреса только с документацией, предоставленной уполномоченным администратором.",
      "Shows the IP address, gateway, DNS, and routes on the client device. To understand the Kerio topology, compare WAN/LAN addresses only against documentation provided by an authorized administrator."
    ),
    example(
      "Windows PowerShell:\nGet-NetAdapter | Format-Table Name, Status, LinkSpeed, MacAddress\n\nLinux:\nip -br link",
      "Windows PowerShell:\nGet-NetAdapter | Format-Table Name, Status, LinkSpeed, MacAddress\n\nLinux:\nip -br link",
      "Windows PowerShell:\nGet-NetAdapter | Format-Table Name, Status, LinkSpeed, MacAddress\n\nLinux:\nip -br link",
      "Bu buyruqlar fizik/virtual NIC holatini ko‘rsatadi va sozlamani o‘zgartirmaydi. VM lab’da WAN hamda LAN adapterlari alohida virtual tarmoqqa ulanganini hypervisor’dan ham tekshiring.",
      "Эти команды показывают состояние физического/виртуального сетевого адаптера и не изменяют настройки. В виртуальной лаборатории также проверяйте в гипервизоре, что адаптеры WAN и LAN подключены к отдельным виртуальным сетям.",
      "These commands show the state of the physical/virtual NIC and do not change any setting. In a VM lab, also verify in the hypervisor that the WAN and LAN adapters are connected to separate virtual networks."
    ),
    example(
      "Windows:\nGet-NetIPConfiguration\nGet-NetRoute -AddressFamily IPv4 | Select-Object -First 15 DestinationPrefix, NextHop, InterfaceAlias\n\nLinux:\nip addr\nip route",
      "Windows:\nGet-NetIPConfiguration\nGet-NetRoute -AddressFamily IPv4 | Select-Object -First 15 DestinationPrefix, NextHop, InterfaceAlias\n\nLinux:\nip addr\nip route",
      "Windows:\nGet-NetIPConfiguration\nGet-NetRoute -AddressFamily IPv4 | Select-Object -First 15 DestinationPrefix, NextHop, InterfaceAlias\n\nLinux:\nip addr\nip route",
      "Klientdan ko‘rinadigan konfiguratsiya Kerio interfeysining admin konsolidagi qiymatlar bilan mos bo‘lishi kerak. Buyruqlar faqat o‘qiydi; real qurilmada IP yoki route’ni administrator ruxsatisiz o‘zgartirmang.",
      "Конфигурация, видимая клиенту, должна соответствовать значениям в админ-консоли Kerio. Команды только читают данные; не изменяйте IP-адрес или маршрут на реальном устройстве без разрешения администратора.",
      "The configuration visible to the client should match the values in the Kerio admin console. The commands only read data; do not change an IP address or route on a real device without administrator permission."
    ),
    example(
      "$rulePlan = [pscustomobject]@{\n  FromZone = 'LAN'\n  ToZone = 'DMZ'\n  Source = '10.40.10.0/24'\n  Destination = '10.40.20.10'\n  Service = 'TCP/443'\n  Action = 'Allow + log'\n  BusinessOwner = 'web-team'\n  ReviewDate = '2026-12-01'\n}\n$rulePlan | Format-List",
      "$rulePlan = [pscustomobject]@{\n  FromZone = 'LAN'\n  ToZone = 'DMZ'\n  Source = '10.40.10.0/24'\n  Destination = '10.40.20.10'\n  Service = 'TCP/443'\n  Action = 'Allow + log'\n  BusinessOwner = 'web-team'\n  ReviewDate = '2026-12-01'\n}\n$rulePlan | Format-List",
      "$rulePlan = [pscustomobject]@{\n  FromZone = 'LAN'\n  ToZone = 'DMZ'\n  Source = '10.40.10.0/24'\n  Destination = '10.40.20.10'\n  Service = 'TCP/443'\n  Action = 'Allow + log'\n  BusinessOwner = 'web-team'\n  ReviewDate = '2026-12-01'\n}\n$rulePlan | Format-List",
      "Bu qoida loyihasini ko‘rib chiqish uchun chiqaradi, Kerio’ga hech narsa yozmaydi. Namuna manzillarini faqat izolyatsiyalangan lab’da almashtiring; tasdiq, qoida tartibi va rollback’ni admin konsolida rejalang.",
      "Это выводит проект правила для рассмотрения и ничего не записывает в Kerio. Заменяйте примерные адреса только в изолированной лабораторной среде; согласование, порядок правил и план отката планируйте в админ-консоли.",
      "This outputs a rule draft for review and writes nothing to Kerio. Replace the example addresses only in an isolated lab; plan approval, rule ordering, and a rollback in the admin console."
    ),
    example(
      "Windows:\nGet-NetIPConfiguration\nTest-NetConnection -ComputerName 192.0.2.20 -Port 443\n\nLinux:\nip route\nnc -vz -w 3 192.0.2.20 443",
      "Windows:\nGet-NetIPConfiguration\nTest-NetConnection -ComputerName 192.0.2.20 -Port 443\n\nLinux:\nip route\nnc -vz -w 3 192.0.2.20 443",
      "Windows:\nGet-NetIPConfiguration\nTest-NetConnection -ComputerName 192.0.2.20 -Port 443\n\nLinux:\nip route\nnc -vz -w 3 192.0.2.20 443",
      "TCP sinovini faqat o‘zingiz boshqaradigan lab serveriga bajaring. Tashqi internetga chiqish uchun DNS, route, Kerio allow policy, source NAT va qaytish yo‘li birgalikda ishlashi kerak; bitta test sababni yakka o‘zi isbotlamaydi.",
      "Выполняйте TCP-тест только к лабораторному серверу, которым управляете сами. Для выхода во внешний интернет должны согласованно работать DNS, маршрут, разрешающая политика Kerio, source NAT и обратный путь; один тест сам по себе не доказывает причину.",
      "Run the TCP test only against a lab server you control yourself. Reaching the external internet requires DNS, routing, Kerio's allow policy, source NAT, and the return path to all work together; a single test alone does not prove the cause."
    ),
    example(
      "Tashqi lab klientidan (faqat o‘z DMZ serveringiz):\nTest-NetConnection -ComputerName 198.51.100.20 -Port 443 -InformationLevel Detailed\n\nLinux:\ncurl --connect-timeout 3 -I https://198.51.100.20",
      "С внешнего лабораторного клиента (только ваш собственный DMZ-сервер):\nTest-NetConnection -ComputerName 198.51.100.20 -Port 443 -InformationLevel Detailed\n\nLinux:\ncurl --connect-timeout 3 -I https://198.51.100.20",
      "From an external lab client (only your own DMZ server):\nTest-NetConnection -ComputerName 198.51.100.20 -Port 443 -InformationLevel Detailed\n\nLinux:\ncurl --connect-timeout 3 -I https://198.51.100.20",
      "198.51.100.20 TEST-NET namunasi; uni o‘zingiz izolyatsiyalagan topologiyadagi tashqi lab endpoint’i bilan almashtiring. Port mapping, firewall ruxsati, server listener va host firewall alohida tekshiriladi; production manzilida ruxsatsiz sinamang.",
      "198.51.100.20 — это пример адреса TEST-NET; замените его на внешний лабораторный endpoint в вашей изолированной топологии. Port mapping, разрешение firewall, listener на сервере и host firewall проверяются отдельно; не тестируйте production-адрес без разрешения.",
      "198.51.100.20 is a TEST-NET example address; replace it with an external lab endpoint in your own isolated topology. Port mapping, firewall permission, the server listener, and the host firewall are each checked separately; do not test a production address without authorization."
    ),
    example(
      "Resolve-DnsName example.com\ncurl.exe -I https://example.com",
      "Resolve-DnsName example.com\ncurl.exe -I https://example.com",
      "Resolve-DnsName example.com\ncurl.exe -I https://example.com",
      "DNS javobi bilan HTTPS javobini alohida tekshirib, web filter sababmi yoki nom yechish/ilova sababmi ajratishga yordam beradi. Haqiqiy filter sinovi uchun faqat tashkilot tasdiqlagan test domenidan foydalaning.",
      "Проверка DNS-ответа и HTTPS-ответа по отдельности помогает понять, вызвана ли проблема веб-фильтром или разрешением имён/приложением. Для реальной проверки фильтра используйте только тестовый домен, одобренный организацией.",
      "Checking the DNS response and the HTTPS response separately helps distinguish whether the issue is caused by a web filter or by name resolution/the application. For a real filter test, use only a test domain approved by the organization."
    ),
    example(
      "Windows:\nwhoami /user\nwhoami /groups\n\nLinux:\nid",
      "Windows:\nwhoami /user\nwhoami /groups\n\nLinux:\nid",
      "Windows:\nwhoami /user\nwhoami /groups\n\nLinux:\nid",
      "Joriy klient foydalanuvchisi va guruhlarini lokal ko‘rsatadi; bu Kerio’dagi LDAP/AD bog‘lanishi muvaffaqiyatli ekanini kafolatlamaydi. Natijada hisob nomi bo‘lishi mumkin, uni ommaga ulashmang.",
      "Локально показывает текущего пользователя клиента и его группы; это не гарантирует, что привязка LDAP/AD в Kerio выполнена успешно. В результате может присутствовать имя учётной записи — не публикуйте его.",
      "Locally shows the current client user and their groups; it does not guarantee that the LDAP/AD binding in Kerio succeeded. The output may include an account name — do not share it publicly."
    ),
    example(
      "Windows:\nGet-NetIPConfiguration\nGet-NetRoute -AddressFamily IPv4 |\n  Select-Object DestinationPrefix, NextHop, InterfaceAlias\n\nLinux:\nip route",
      "Windows:\nGet-NetIPConfiguration\nGet-NetRoute -AddressFamily IPv4 |\n  Select-Object DestinationPrefix, NextHop, InterfaceAlias\n\nLinux:\nip route",
      "Windows:\nGet-NetIPConfiguration\nGet-NetRoute -AddressFamily IPv4 |\n  Select-Object DestinationPrefix, NextHop, InterfaceAlias\n\nLinux:\nip route",
      "VPN ulanganidan keyin klient ko‘radigan interfeys va yo‘nalishlarni solishtiring. Buyruq tunnel kalitlari yoki Kerio VPN siyosatini o‘zgartirmaydi; subnet overlap va split-tunnel talqinini admin bilan tekshiring.",
      "Сравните интерфейсы и маршруты, которые видит клиент после подключения VPN. Команда не изменяет ключи туннеля или политику VPN в Kerio; пересечение подсетей и трактовку split-tunnel проверяйте вместе с администратором.",
      "Compare the interfaces and routes the client sees after the VPN connects. The command does not change tunnel keys or Kerio's VPN policy; check subnet overlap and split-tunnel interpretation together with the administrator."
    ),
    example(
      "$changeChecklist = [pscustomobject]@{\n  ApprovedWindow = '2026-10-20 22:00-23:00'\n  BackupVerified = $false\n  RollbackOwner = 'network-admin'\n  TestClient = 'LAB-CLIENT-01'\n  PostChecks = 'WAN, LAN, VPN, DNS, logs'\n}\n$changeChecklist | Format-List",
      "$changeChecklist = [pscustomobject]@{\n  ApprovedWindow = '2026-10-20 22:00-23:00'\n  BackupVerified = $false\n  RollbackOwner = 'network-admin'\n  TestClient = 'LAB-CLIENT-01'\n  PostChecks = 'WAN, LAN, VPN, DNS, logs'\n}\n$changeChecklist | Format-List",
      "$changeChecklist = [pscustomobject]@{\n  ApprovedWindow = '2026-10-20 22:00-23:00'\n  BackupVerified = $false\n  RollbackOwner = 'network-admin'\n  TestClient = 'LAB-CLIENT-01'\n  PostChecks = 'WAN, LAN, VPN, DNS, logs'\n}\n$changeChecklist | Format-List",
      "Bu faqat o‘zgarishdan oldingi checklist namunasidir. Haqiqiy sana va mas’ullarni to‘ldiring; backup tasdiqlanmaguncha o‘zgarish boshlamang. Kerio’ni qo‘llab-quvvatlanadigan admin Web UI va aynan o‘rnatilgan versiya hujjatlari orqali boshqaring.",
      "Это лишь пример чек-листа перед изменением. Заполните реальные даты и ответственных; не начинайте изменение, пока резервная копия не подтверждена. Управляйте Kerio только через поддерживаемый веб-интерфейс администратора и документацию именно установленной версии.",
      "This is only a pre-change checklist example. Fill in the actual dates and responsible people; do not start the change until the backup is verified. Manage Kerio only through its supported admin Web UI and the documentation for the exact installed version."
    ),
    example(
      "Windows:\nResolve-DnsName example.com\nTest-NetConnection -ComputerName 192.0.2.20 -Port 443 -InformationLevel Detailed\ntracert -d 192.0.2.20\n\nLinux:\ngetent hosts example.com\nip route get 192.0.2.20\nnc -vz -w 3 192.0.2.20 443",
      "Windows:\nResolve-DnsName example.com\nTest-NetConnection -ComputerName 192.0.2.20 -Port 443 -InformationLevel Detailed\ntracert -d 192.0.2.20\n\nLinux:\ngetent hosts example.com\nip route get 192.0.2.20\nnc -vz -w 3 192.0.2.20 443",
      "Windows:\nResolve-DnsName example.com\nTest-NetConnection -ComputerName 192.0.2.20 -Port 443 -InformationLevel Detailed\ntracert -d 192.0.2.20\n\nLinux:\ngetent hosts example.com\nip route get 192.0.2.20\nnc -vz -w 3 192.0.2.20 443",
      "192.0.2.20 TEST-NET manzilini o‘z lab serveringiz bilan almashtiring. DNS namunasi example.com nomi qanday yechilishini alohida ko‘rsatadi; route va TCP testi lab manziliga boradi. Kerio logidagi rule/action hamda server logini vaqt bo‘yicha solishtiring.",
      "Замените адрес TEST-NET 192.0.2.20 на свой лабораторный сервер. Пример DNS отдельно показывает, как разрешается имя example.com; проверка маршрута и TCP выполняется к лабораторному адресу. Сопоставляйте по времени правило/действие в логе Kerio и лог сервера.",
      "Replace the 192.0.2.20 TEST-NET address with your own lab server. The DNS example separately shows how the name example.com resolves; the route and TCP checks target the lab address. Correlate the rule/action in the Kerio log with the server log by time."
    )
  ]
};
