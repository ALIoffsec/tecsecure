import type { LearningExample, Localized } from "@/lib/learning-demo";

const l = (uz: string): Localized => ({ uz, ru: uz, en: uz });
const example = (code: string, explanation: string): LearningExample => ({
  code: l(code),
  explanation: l(explanation)
});

export const firewallKerioTerminalExamples: Record<string, LearningExample[]> = {
  "firewall-zero-to-hero": [
    example(
      "Windows (PowerShell):\nGet-NetFirewallProfile | Select-Object Name, Enabled\n\nLinux:\nsudo nft list ruleset",
      "Windows buyruqlari firewall profilining yoqilganini, Linux buyrug‘i esa amaldagi nftables qoidalarini faqat ko‘rsatadi. Faqat o‘zingiz boshqaradigan qurilmada ishlating; qoidani o‘zgartirmaydi."
    ),
    example(
      "Windows:\nGet-NetTCPConnection -State Established |\n  Select-Object -First 10 LocalAddress, LocalPort, RemoteAddress, RemotePort, State\n\nLinux:\nss -tn state established",
      "Bu joriy hostdagi o‘rnatilgan TCP ulanishlaridan namuna ko‘rsatadi. Sessiya ro‘yxati stateful firewall’ning ichki jadvali emas, faqat endpoint kuzatuvidir; manzillarni oshkor qiluvchi natijani himoyalang."
    ),
    example(
      "$rulePlan = [pscustomobject]@{\n  Id = 'APP-DB-01'\n  Source = '10.20.10.0/24'\n  Destination = '10.20.20.10'\n  Protocol = 'TCP'\n  Port = 5432\n  Action = 'Allow + log'\n  Owner = 'app-team'\n}\n$rulePlan | Format-List",
      "Bu PowerShell obyekti qoida talabini terminalda hujjatlashtiradi, firewall’ga qoida qo‘shmaydi. IP va portlar namuna; haqiqiy tarmoq o‘zgarishi uchun egasi tasdig‘i, ikkinchi tekshiruv va rollback zarur."
    ),
    example(
      "Get-NetFirewallProfile |\n  Format-Table Name, Enabled, DefaultInboundAction, DefaultOutboundAction\nGet-NetFirewallRule -PolicyStore ActiveStore |\n  Select-Object -First 15 DisplayName, Enabled, Direction, Action",
      "Bular Windows Defender Firewall’ning faol profillari va qoidalarini o‘qiydi, sozlamani o‘zgartirmaydi. Natija ichki tarmoq tafsilotlarini ochishi mumkin; ommaga ulashmang."
    ),
    example(
      "sudo nft list ruleset\nsudo ufw status verbose\nsudo firewall-cmd --list-all",
      "Faqat Linux distributivingizda ishlatilayotgan firewall boshqaruv vositasiga tegishli buyruqni bajaring. Ular mavjud holatni ko‘rsatadi; bir hostda bir nechta boshqaruv vositasi qoidalarni boshqarsa, avval administrator bilan aniqlashtiring."
    ),
    example(
      "Windows:\nGet-NetRoute -AddressFamily IPv4 | Sort-Object RouteMetric |\n  Select-Object -First 12 DestinationPrefix, NextHop, InterfaceAlias, RouteMetric\n\nLinux:\nip route",
      "Marshrut jadvali paket firewall’ga qaysi yo‘ldan kelishi va qayerga ketishini tushunishga yordam beradi. Bu firewall qoidasi ruxsat berdi degani emas; qaytish marshrutini ham tekshiring."
    ),
    example(
      "Windows:\nGet-NetFirewallRule -PolicyStore ActiveStore |\n  Select-Object -First 20 DisplayName, Profile, Direction, Action, Enabled\n\nLinux:\nsudo nft list ruleset",
      "Bu misollar host firewall qoidalarini o‘qishga mo‘ljallangan; ular NGFW’ning App-ID yoki IPS siyosatini ko‘rsatmaydi. Appliance’da faqat o‘sha ishlab chiqaruvchi va aniq versiyaning rasmiy CLI/GUI qo‘llanmasidan foydalaning."
    ),
    example(
      "curl.exe -I https://example.com",
      "Faqat ruxsatli test qurilmasidan oddiy HTTPS HEAD so‘rovini yuborib, javob sarlavhalarini ko‘rsatadi; zaiflik testi bajarmaydi. O‘z tashkilotingizdagi WAF sinovi uchun egasi tasdiqlagan test endpoint’idan foydalaning."
    ),
    example(
      "AWS CLI (faqat o‘z hisobingizda):\naws ec2 describe-security-groups --group-ids sg-0123456789abcdef0 --query \"SecurityGroups[].IpPermissions\" --output json\n\nAzure CLI:\naz network nsg rule list --resource-group rg-lab --nsg-name nsg-lab --output table\n\nGoogle Cloud CLI:\ngcloud compute firewall-rules list --format=\"table(name,network,direction,disabled)\"",
      "Bu buyruqlar faqat o‘z cloud accountingizdagi qoidalarni o‘qiydi; autentifikatsiya va kerakli read-only IAM roli bo‘lishi kerak. Placeholder ID/resurs nomlarini lab’ingizdagiga almashtiring. Inventarizatsiya tarmoq arxitekturasini oshkor qilishi mumkin, natijani himoyalang."
    ),
    example(
      "Windows:\ntracert -d 192.0.2.10\n\nLinux:\ntraceroute -n -m 12 192.0.2.10",
      "192.0.2.10 TEST-NET hujjatlashtirish manzili; uni provayder yoki tarmoq egasi tasdiqlagan lab manzili bilan almashtiring. Yo‘ldagi javob bermagan hop albatta firewall bloklaganini anglatmaydi."
    ),
    example(
      "Windows PowerShell:\nGet-VpnConnection\nGet-NetIPConfiguration\n\nLinux:\nip route",
      "Mahalliy qurilmadagi VPN profili nomi, interfeys va marshrutlarni ko‘rsatishga yordam beradi; maxfiy kalit/parollarni ko‘rsatmaydi. Ulanish ma’lumotlarini ommaviy ulashmang; VPN server siyosatini boshqaruv konsolida tekshiring."
    ),
    example(
      "Get-WinEvent -FilterHashtable @{\n  LogName = 'Microsoft-Windows-Windows Firewall With Advanced Security/Firewall'\n  StartTime = (Get-Date).AddHours(-2)\n} -MaxEvents 30 |\n  Select-Object TimeCreated, Id, LevelDisplayName, Message",
      "Bu buyruq oxirgi ikki soatdagi Windows Firewall hodisalaridan 30 tagacha yozuvni o‘qiydi. Kerakli audit log yoqilgan bo‘lishi kerak; natijadagi host/IP ma’lumotlarini maxfiy saqlang."
    ),
    example(
      "Get-NetAdapter |\n  Format-Table Name, Status, LinkSpeed\nGet-NetIPConfiguration",
      "Buyruqlar faqat Windows host interfeyslari va IP sozlamalarini ko‘rsatadi; HA klasteri sog‘lomligini isbotlamaydi. Appliance klasteri uchun vendor monitoring va failover holatini tekshiring, failover’ni faqat tasdiqlangan lab’da sinang."
    ),
    example(
      "Windows:\nTest-NetConnection -ComputerName 192.0.2.10 -Port 443 -InformationLevel Detailed\n\nLinux:\nnc -vz -w 3 192.0.2.10 443",
      "Manzilni o‘zingiz boshqaradigan izolyatsiyalangan lab hosti bilan almashtiring. Bu bitta TCP portga ulanishni tekshiradi; muvaffaqiyatsizlik firewall’dan tashqari DNS, route, server yoki provider muammosidan ham bo‘lishi mumkin."
    )
  ],
  "kerio-control-zero-to-hero": [
    example(
      "Windows:\nipconfig /all\nroute print\n\nLinux:\nip addr\nip route",
      "Klient qurilmadagi IP, gateway, DNS va marshrutni ko‘rsatadi. Kerio topologiyasini tushunish uchun WAN/LAN manzillarini faqat ruxsatli administrator hujjatlari bilan solishtiring."
    ),
    example(
      "Windows PowerShell:\nGet-NetAdapter | Format-Table Name, Status, LinkSpeed, MacAddress\n\nLinux:\nip -br link",
      "Bu buyruqlar fizik/virtual NIC holatini ko‘rsatadi va sozlamani o‘zgartirmaydi. VM lab’da WAN hamda LAN adapterlari alohida virtual tarmoqqa ulanganini hypervisor’dan ham tekshiring."
    ),
    example(
      "Windows:\nGet-NetIPConfiguration\nGet-NetRoute -AddressFamily IPv4 | Select-Object -First 15 DestinationPrefix, NextHop, InterfaceAlias\n\nLinux:\nip addr\nip route",
      "Klientdan ko‘rinadigan konfiguratsiya Kerio interfeysining admin konsolidagi qiymatlar bilan mos bo‘lishi kerak. Buyruqlar faqat o‘qiydi; real qurilmada IP yoki route’ni administrator ruxsatisiz o‘zgartirmang."
    ),
    example(
      "$rulePlan = [pscustomobject]@{\n  FromZone = 'LAN'\n  ToZone = 'DMZ'\n  Source = '10.40.10.0/24'\n  Destination = '10.40.20.10'\n  Service = 'TCP/443'\n  Action = 'Allow + log'\n  BusinessOwner = 'web-team'\n  ReviewDate = '2026-12-01'\n}\n$rulePlan | Format-List",
      "Bu qoida loyihasini ko‘rib chiqish uchun chiqaradi, Kerio’ga hech narsa yozmaydi. Namuna manzillarini faqat izolyatsiyalangan lab’da almashtiring; tasdiq, qoida tartibi va rollback’ni admin konsolida rejalang."
    ),
    example(
      "Windows:\nGet-NetIPConfiguration\nTest-NetConnection -ComputerName 192.0.2.20 -Port 443\n\nLinux:\nip route\nnc -vz -w 3 192.0.2.20 443",
      "TCP sinovini faqat o‘zingiz boshqaradigan lab serveriga bajaring. Tashqi internetga chiqish uchun DNS, route, Kerio allow policy, source NAT va qaytish yo‘li birgalikda ishlashi kerak; bitta test sababni yakka o‘zi isbotlamaydi."
    ),
    example(
      "Tashqi lab klientidan (faqat o‘z DMZ serveringiz):\nTest-NetConnection -ComputerName 198.51.100.20 -Port 443 -InformationLevel Detailed\n\nLinux:\ncurl --connect-timeout 3 -I https://198.51.100.20",
      "198.51.100.20 TEST-NET namunasi; uni o‘zingiz izolyatsiyalagan topologiyadagi tashqi lab endpoint’i bilan almashtiring. Port mapping, firewall ruxsati, server listener va host firewall alohida tekshiriladi; production manzilida ruxsatsiz sinamang."
    ),
    example(
      "Resolve-DnsName example.com\ncurl.exe -I https://example.com",
      "DNS javobi bilan HTTPS javobini alohida tekshirib, web filter sababmi yoki nom yechish/ilova sababmi ajratishga yordam beradi. Haqiqiy filter sinovi uchun faqat tashkilot tasdiqlagan test domenidan foydalaning."
    ),
    example(
      "Windows:\nwhoami /user\nwhoami /groups\n\nLinux:\nid",
      "Joriy klient foydalanuvchisi va guruhlarini lokal ko‘rsatadi; bu Kerio’dagi LDAP/AD bog‘lanishi muvaffaqiyatli ekanini kafolatlamaydi. Natijada hisob nomi bo‘lishi mumkin, uni ommaga ulashmang."
    ),
    example(
      "Windows:\nGet-NetIPConfiguration\nGet-NetRoute -AddressFamily IPv4 |\n  Select-Object DestinationPrefix, NextHop, InterfaceAlias\n\nLinux:\nip route",
      "VPN ulanganidan keyin klient ko‘radigan interfeys va yo‘nalishlarni solishtiring. Buyruq tunnel kalitlari yoki Kerio VPN siyosatini o‘zgartirmaydi; subnet overlap va split-tunnel talqinini admin bilan tekshiring."
    ),
    example(
      "$changeChecklist = [pscustomobject]@{\n  ApprovedWindow = '2026-10-20 22:00-23:00'\n  BackupVerified = $false\n  RollbackOwner = 'network-admin'\n  TestClient = 'LAB-CLIENT-01'\n  PostChecks = 'WAN, LAN, VPN, DNS, logs'\n}\n$changeChecklist | Format-List",
      "Bu faqat o‘zgarishdan oldingi checklist namunasidir. Haqiqiy sana va mas’ullarni to‘ldiring; backup tasdiqlanmaguncha o‘zgarish boshlamang. Kerio’ni qo‘llab-quvvatlanadigan admin Web UI va aynan o‘rnatilgan versiya hujjatlari orqali boshqaring."
    ),
    example(
      "Windows:\nResolve-DnsName example.com\nTest-NetConnection -ComputerName 192.0.2.20 -Port 443 -InformationLevel Detailed\ntracert -d 192.0.2.20\n\nLinux:\ngetent hosts example.com\nip route get 192.0.2.20\nnc -vz -w 3 192.0.2.20 443",
      "192.0.2.20 TEST-NET manzilini o‘z lab serveringiz bilan almashtiring. DNS namunasi example.com nomi qanday yechilishini alohida ko‘rsatadi; route va TCP testi lab manziliga boradi. Kerio logidagi rule/action hamda server logini vaqt bo‘yicha solishtiring."
    )
  ]
};
