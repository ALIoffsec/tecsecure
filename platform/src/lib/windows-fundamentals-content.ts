import type { LearningDiagram, LearningInteractivePractice, LearningSection, Localized } from "@/lib/learning-demo";

type PracticeTask = [id: string, command: string, prompt: string, output: string];

const l = (value: string): Localized => ({ uz: value, ru: value, en: value });

const flow = (caption: string, nodes: string[], links: string[]): LearningDiagram => ({
  kind: "topology",
  caption: l(caption),
  nodes: nodes.map(l),
  links: links.map(l)
});

const practice = (instructions: string, tasks: PracticeTask[]): LearningInteractivePractice => ({
  platform: "windows",
  instructions: l(instructions),
  tasks: tasks.map(([id, command, prompt, output]) => ({ id, command, prompt: l(prompt), output: l(output) }))
});

const lesson = (
  title: string,
  content: string,
  example: string,
  exampleExplanation: string,
  question: string,
  answers: string[],
  interactivePractice: LearningInteractivePractice,
  diagram: LearningDiagram
): LearningSection => ({
  title: l(title),
  content: l(content),
  example: l(example),
  exampleExplanation: l(exampleExplanation),
  question: { prompt: l(question), answers },
  interactivePractice,
  diagram
});

export const windowsFundamentalsSections: LearningSection[] = [
  lesson(
    "0. Windows tizimi va xavfsiz boshqaruv",
    `Windows client va Windows Server umumiy NT arxitekturasidan foydalanadi. User mode’da ilovalar, xizmatlar va boshqaruv vositalari ishlaydi; kernel mode’da yadro, drayverlar va xotira boshqaruvi qurilma resurslariga vositachilik qiladi. Jarayon, thread, service va logon session tushunchalarini farqlash nosozlikni to‘g‘ri qatlamda qidirishga yordam beradi.\n\nWindows Registry sozlama ma’lumotlar bazasi, NTFS esa fayl tizimi va ruxsatlar modelidir. Event Log tizim, ilova va xavfsizlik hodisalarini qayd etadi. PowerShell obyektlar bilan ishlaydigan boshqaruv shell’i; buyruqni administrator sifatida ishlatishdan oldin uning ta’sirini va scope’ini aniqlang. Bu kursdagi konsol kompyuteringizga buyruq yubormaydi, faqat sintetik natijani ko‘rsatadi.`,
    "Get-ComputerInfo -Property WindowsProductName, WindowsVersion\nGet-Process | Select-Object -First 5 ProcessName, Id\nGet-Service -Name Spooler",
    "Birinchi so‘rov operatsion tizim nashri va versiyasini, ikkinchisi jarayon namunasini, uchinchisi xizmat holatini o‘qiydi. Haqiqiy tizimda `Get-ComputerInfo`, `Get-Process` va `Get-Service` — tekshiruv cmdlet’lari; bu dars terminalida natijalar oldindan tayyorlangan.",
    "Ilovalar va foydalanuvchi jarayonlarini qurilma resurslaridan ajratib boshqaradigan Windows’ning eng past asosiy qatlami nima?",
    ["kernel", "yadro", "windows kernel"],
    practice("Windows arxitekturasiga oid faqat o‘qish buyruqlarini sinang. Bu simulyator PowerShell’ni ishga tushirmaydi.", [
      ["os-version", "Get-ComputerInfo -Property WindowsProductName, WindowsVersion", "Windows nashri va versiyasini aniqlang.", "WindowsProductName : Windows Server 2025 Datacenter\nWindowsVersion     : 24H2\nLab ma’lumoti: sintetik."],
      ["service-state", "Get-Service -Name Spooler", "Namuna xizmatining holatini ko‘ring.", "Status   Name      DisplayName\n------   ----      -----------\nRunning  Spooler   Print Spooler\nLab ma’lumoti: sintetik."]
    ]),
    flow("Windows ilovasi va xizmatlari yadro orqali qurilma resurslaridan foydalanadi.", ["Ilova\nuser mode", "Service\nuser mode", "System call", "Kernel\ndrivers", "Hardware\nCPU / RAM"], ["API", "request", "tekshir", "boshqar"])
  ),
  lesson(
    "1. PowerShell, jarayonlar, xizmatlar va jurnallar",
    `PowerShell buyruqlari cmdlet ko‘rinishida Verb-Noun nomlanadi. Natija ko‘pincha matn emas, xususiyatlari bo‘lgan .NET obyektlaridir; pipeline (|) obyektni keyingi cmdlet’ga uzatadi. Shu sababli Get-Service | Where-Object Status -eq 'Running' faqat ekranda qator qidirmaydi, obyekt xususiyatini tekshiradi.\n\nNosozlikni tekshirishda avval scope va vaqtni belgilang, keyin xizmat holati, jarayon va Event Viewer yozuvlarini o‘zaro solishtiring. Hodisa ID’si yoki bitta error yozuvi yakuniy root cause emas: host, vaqt, foydalanuvchi va takrorlanish holatini ko‘ring. O‘zgartiruvchi cmdlet (Stop-Service, Set-Service, Remove-Item) bu o‘quv laboratoriyasida mavjud emas.`,
    "Get-Service -Name Spooler\nGet-WinEvent -LogName System -MaxEvents 3\nGet-Command Get-Service",
    "Xizmat cmdlet’i xizmat holatini qaytaradi; `Get-WinEvent` jurnal yozuvlarini vaqt tartibida tekshirishga yordam beradi; `Get-Command` buyruq sintaksisini aniqlaydi. Real jurnalda shaxsiy yoki infratuzilma ma’lumoti bo‘lishi mumkin.",
    "PowerShell’da xizmat yoki jarayon qiymatlarini keyingi cmdlet’ga uzatish mexanizmi nima deyiladi?",
    ["pipeline", "quvur", "pipeline operator"],
    practice("Faqat tasdiqlangan o‘qish buyruqlari sintetik chiqish qaytaradi; tizim holati o‘zgarmaydi.", [
      ["service-list", "Get-Service -Name Spooler", "Xizmat holati va nomini ko‘ring.", "Status   Name      DisplayName\n------   ----      -----------\nRunning  Spooler   Print Spooler\nLab ma’lumoti: sintetik."],
      ["system-events", "Get-WinEvent -LogName System -MaxEvents 3", "System jurnalidan uchta namuna yozuvni o‘qing.", "TimeCreated           Id  LevelDisplayName  Message\n2026-10-28 10:15:12   7036 Information      Spooler entered running state\n2026-10-28 10:12:04   6005 Information      Event Log service started\n2026-10-28 10:10:33   12  Information      Operating system started\nLab ma’lumoti: sintetik."]
    ]),
    flow("Kuzatuv buyruqlari dalil beradi; mutatsion amallar uchun alohida tasdiq va change nazorati kerak.", ["Scope\nhost + time", "Get-Service\nholat", "Get-WinEvent\nhodisa", "Taqqoslash\nvaqt / ID", "Xulosa\ndalil"], ["aniqla", "o‘qi", "bog‘la", "tekshir"])
  ),
  lesson(
    "2. Hisoblar, guruhlar, SID va UAC",
    `Windows xavfsizlik modeli foydalanuvchi va guruhlarni SID (Security Identifier) orqali taniydi. Guruhga berilgan huquqni a’zolar meros qilib olishi mumkin; shu bois access review’da bevosita va ichma-ich guruh a’zoligini hisobga oling. Lokal hisob faqat shu mashinada, domen hisobi esa AD DS tomonidan markazlashgan tarzda tasdiqlanadi.\n\nUAC administrator hisobiga ham odatiy ishlar uchun cheklangan token beradi va yuqori huquqli amaldan oldin rozilik so‘raydi. UAC domen ruxsatlarini almashtirmaydi va zararli dasturni to‘liq to‘xtatish kafolati emas. Kundalik ishni standart hisobda bajaring; alohida admin identifikatsiyasi va vaqtinchalik elevated sessiyadan foydalaning.`,
    "whoami /all\nGet-LocalUser\nGet-LocalGroupMember -Group Users",
    "`whoami /all` joriy identifikator va token guruhlarini, `Get-LocalUser` lokal hisoblar holatini, `Get-LocalGroupMember` esa tanlangan lokal guruh a’zolarini ko‘rsatadi. Hisobni o‘chiruvchi yoki guruh a’zoligini o‘zgartiruvchi amallar bu simulyatorda yopiq.",
    "Foydalanuvchi yoki guruhni Windows xavfsizlik tizimida yagona tanituvchi identifikator nima?",
    ["sid", "security identifier"],
    practice("Lokal hisob va guruhlar bo‘yicha sintetik inventarni ko‘ring; parol va hisob yaratish amallari simulator’da yo‘q.", [
      ["current-token", "whoami /all", "Joriy hisob va token guruhlarini tekshiring.", "USER INFORMATION\nUser Name: TECSECURE\\student\nSID: S-1-5-21-1000-1000-1000-1105\nGroups: Users, Remote Desktop Users\nIntegrity Level: Medium\nLab ma’lumoti: sintetik."],
      ["local-users", "Get-LocalUser", "Lokal hisoblarning enabled holatini ko‘ring.", "Name       Enabled  Description\nAdministrator False  Built-in administrator\nstudent       True   Training account\nGuest         False  Built-in guest\nLab ma’lumoti: sintetik."]
    ]),
    flow("SID hisobni, guruh a’zoligi huquqlarni, UAC esa yuqori huquqli jarayonni chegaralaydi.", ["Identity\nSID", "Membership\nuser + groups", "Access token\nintegrity", "UAC\nelevation", "Resource\naccess check"], ["tani", "hisobla", "chegarala", "tekshir"])
  ),
  lesson(
    "3. NTFS ruxsatlari va umumiy papkalar",
    `NTFS ACL fayl yoki katalogga qaysi security principal qanday amal bajarishini belgilaydi. Ruxsatlar meros bo‘lishi va Allow/Deny ACE’lari birgalikda ta’sir qilishi mumkin; samarali ruxsatni baholashda foydalanuvchi SID’i, guruhlar, meros va tarmoq orqali kirish yo‘lini ko‘ring. Deny’ni noto‘g‘ri qo‘llash kutilmagan bloklashga olib kelishi mumkin.\n\nSMB share ruxsati va NTFS ruxsati alohida qatlamlar. Tarmoqdan murojaatda amaliy natija odatda ikkala qatlamning cheklovlari kesishmasidir. Eng kam ruxsat bilan guruhga berish, egani belgilash va davriy access review qilish xavfsizroq. ACL’ni ommaviy o‘zgartirishdan oldin backup, test va rollback rejasini tayyorlang.`,
    "Get-Acl C:\\Lab\\reports\\monthly.csv\nGet-SmbShare",
    "`Get-Acl` NTFS owner va access rule’larni, `Get-SmbShare` esa e’lon qilingan share’larni faqat o‘qiydi. Haqiqiy fayl serverida share ruxsatini NTFS ACL’dan alohida tekshiring; bu yerda ko‘rsatilgan yo‘l va nomlar sintetik.",
    "Tarmoq orqali SMB share’ga kirishda odatda qaysi ikki ruxsat qatlami birgalikda hisobga olinadi?",
    ["share va ntfs", "share permissions va ntfs permissions", "smb va ntfs ruxsatlari"],
    practice("Faqat namuna ACL va SMB share’larni ko‘ring; ruxsatlarni o‘zgartirish imitatsiya qilinmaydi.", [
      ["file-acl", "Get-Acl C:\\Lab\\reports\\monthly.csv", "Fayl egasi va ruxsat yozuvlarini ko‘ring.", "Path: C:\\Lab\\reports\\monthly.csv\nOwner: TECSECURE\\FileAdmins\nAccess:\n  TECSECURE\\Finance-Readers Allow ReadAndExecute\n  TECSECURE\\FileAdmins Allow Modify\n  Inheritance: Enabled\nLab ma’lumoti: sintetik."],
      ["shares", "Get-SmbShare", "SMB share nomi, yo‘li va roli bilan tanishing.", "Name       Path                         Description\nFinance    C:\\Shares\\Finance             Read-only finance lab\nPublic     C:\\Shares\\Public              Training files only\nLab ma’lumoti: sintetik."]
    ]),
    flow("SMB yo‘li uchun share ACL va diskdagi NTFS ACL ikkalasi ham tekshiriladi.", ["User\ntoken", "SMB share\npermission", "NTFS ACL\nfile path", "Effective\nintersection", "Audit\nowner / log"], ["authenticate", "tekshir", "hisobla", "qayd et"])
  ),
  lesson(
    "4. Windows tarmog‘i, DNS va domenni topish",
    `Domen client AD DS xizmatlarini DNS orqali topadi. Domain controller’ni aniqlashda DNS’dagi SRV yozuvlari (masalan, _ldap._tcp.dc._msdcs.<domain>) muhim; oddiy A yozuvi domen xizmatlari joylashuvini to‘liq ifodalamaydi. IP, subnet, default gateway, DNS server va vaqt sinxronlashini tekshirish domain join yoki login muammosini tahlil qilishning boshlang‘ich nuqtasidir.\n\nDomain join oldidan Windows nashri mosligini, korporativ DNS’dan javob kelishini, vaqt farqini, yozma ruxsatni va mashina account quota/delegation’ni tekshiring. Join o‘zi konfiguratsiya o‘zgartirishidir, shu bois ushbu kursda bajarilmaydi. Muammoni DNS, transport/firewall, vaqt va hisob ruxsatlari bo‘yicha alohida qatlamlarga ajrating.`,
    "ipconfig /all\nResolve-DnsName _ldap._tcp.dc._msdcs.corp.example -Type SRV\nw32tm /query /status",
    "`ipconfig /all` adapter va DNS sozlamalarini, SRV lookup esa laboratoriya domeni controller discovery yozuvlarini ko‘rsatadi. `corp.example` hujjatlashtirish uchun namuna nom; ushbu terminal tashqi DNS so‘rovi yubormaydi.",
    "AD DS domenidagi xizmatlarni topish uchun client’lar odatda qaysi nomlash xizmatidan foydalanadi?",
    ["dns"],
    practice("Tarmoq diagnostikasi sintetik manzillar va namuna domenida ishlaydi; real DNS yoki domen tarmog‘iga ulanmaydi.", [
      ["ip-config", "ipconfig /all", "Adapter, gateway va DNS server namunasini ko‘ring.", "Ethernet adapter Lab:\n  IPv4 Address. . . . . . : 192.0.2.25\n  Subnet Mask . . . . . . : 255.255.255.0\n  Default Gateway . . . . : 192.0.2.1\n  DNS Servers . . . . . . : 192.0.2.53\nLab ma’lumoti: sintetik."],
      ["dc-discovery", "Resolve-DnsName _ldap._tcp.dc._msdcs.corp.example -Type SRV", "AD DS LDAP SRV discovery natijasini tahlil qiling.", "NameTarget           Port  Priority  Weight\nad01.corp.example    389   0         100\nad02.corp.example    389   0         100\nLab ma’lumoti: sintetik."]
    ]),
    flow("Client DNS SRV orqali domain controller’ni topadi; vaqt, IP va reachability ham tekshiriladi.", ["Windows client\nIP / time", "DNS resolver", "SRV record\nLDAP / Kerberos", "Domain controller", "Join / logon\npreconditions"], ["so‘ra", "aniqla", "bog‘lan", "tekshir"])
  ),
  lesson(
    "5. Active Directory tuzilishi: forest, domain, OU va DC",
    `AD DS tarmoq obyektlarini saqlaydi va ularni boshqarish hamda qidirish xizmatlarini beradi. **Forest** eng yuqori umumiy schema, configuration va trust boundary’ni belgilaydi; forest ichida bir yoki bir nechta **domain** bo‘lishi mumkin. Domain o‘zining naming context, identity va siyosat doirasiga ega. Keraksiz ko‘p domain yaratish boshqaruv va replikatsiya murakkabligini oshiradi.\n\n**Domain Controller (DC)** katalog nusxasiga xizmat qiladi, autentifikatsiya va katalog so‘rovlarini bajaradi. **OU** obyektlarni delegatsiya va GPO scope uchun tartiblaydi, lekin mustaqil xavfsizlik boundary emas. **Group** ruxsatlarni foydalanuvchilarga samarali taqsimlaydi. Global catalog, site va subnet mapping ko‘p joyli infratuzilmada qidiruv va DC tanlashga yordam beradi.`,
    "Get-ADForest\nGet-ADDomain\nGet-ADOrganizationalUnit -Filter *",
    "Bu Active Directory PowerShell moduliga tegishli o‘qish so‘rovlari bo‘lib, forest, joriy domain va OU obyektlarini ko‘rish uchun ishlatiladi. Kurs simulyatorida javoblar oldindan tayyorlangan va haqiqiy domenga so‘rov yuborilmaydi.",
    "OU odatda qaysi ikki maqsad uchun ishlatiladi?",
    ["delegatsiya va gpo", "delegatsiya va siyosat", "delegation and gpo"],
    practice("AD DS obyektlari bo‘yicha sintetik katalog javoblarini ko‘ring. Hisob yaratish yoki katalogni o‘zgartirish yo‘q.", [
      ["forest", "Get-ADForest", "Forest va global katalog sozlamalari namunasini ko‘ring.", "RootDomain: corp.example\nForestMode: Windows2016Forest\nGlobalCatalogs: AD01.corp.example, AD02.corp.example\nLab ma’lumoti: sintetik."],
      ["domain", "Get-ADDomain", "Domain SID va naming context bilan tanishing.", "DNSRoot: corp.example\nNetBIOSName: CORP\nDomainMode: Windows2016Domain\nPDCEmulator: AD01.corp.example\nLab ma’lumoti: sintetik."],
      ["ous", "Get-ADOrganizationalUnit -Filter *", "OU’lar GPO va delegatsiya uchun qanday joylashtirilganini ko‘ring.", "Name                 DistinguishedName\nWorkstations         OU=Workstations,DC=corp,DC=example\nUsers                OU=Users,DC=corp,DC=example\nService Accounts     OU=Service Accounts,DC=corp,DC=example\nLab ma’lumoti: sintetik."]
    ]),
    flow("Forest/domain trust modelini, DC katalog nusxasini, OU scope’ini, group esa access membership’ni ifodalaydi.", ["Forest\nschema + config", "Domain\nidentity scope", "Domain Controller\nAD DS", "OU\npolicy / delegation", "Group\naccess"], ["tashkil et", "xizmat", "tartibla", "ruxsat ber"])
  ),
  lesson(
    "6. AD autentifikatsiyasi: Kerberos, LDAP va vaqt",
    `Domain logon jarayonida client DNS orqali KDC xizmatini topadi; Windows domain controller tarkibidagi Key Distribution Center Kerberos ticket’larini beradi. Client avval TGT oladi, so‘ng ma’lum xizmatga murojaat qilish uchun service ticket so‘rashi mumkin. Ticket-based autentifikatsiya har xizmatga parol yuborish zaruratini kamaytiradi, lekin endpoint va ticket xavfsizligini bekor qilmaydi.\n\nLDAP katalog obyektlarini so‘rash/protokol qatlamidir; Kerberos esa autentifikatsiya protokoli. SPN xizmat identifikatorini account bilan bog‘laydi; noto‘g‘ri SPN yoki DNS/time skew autentifikatsiya xatosiga sabab bo‘lishi mumkin. NTLM ayrim moslik holatlarida uchrashi mumkin, ammo Kerberos afzal; legacy fallback va NTLM ishlatilishini audit qiling. Boshqa hisob nomidan ticket olish yoki credential dump qilish bu kurs doirasiga kirmaydi.`,
    "whoami /upn\nklist\nnltest /dsgetdc:corp.example",
    "`whoami /upn` hisobning UPN nomini, `klist` joriy logon sessiyasidagi Kerberos ticket metama’lumotini, `nltest` esa controller discovery holatini tekshiradi. Natija maxfiy identifikatorlarni ochishi mumkin; real logni ulashishdan avval tozalang.",
    "Kerberos’da xizmatlarga kirishdan oldin client oladigan boshlang‘ich ticket qanday ataladi?",
    ["tgt", "ticket-granting ticket"],
    practice("Autentifikatsiya buyrug‘i namuna sessiyada ishlaydi; haqiqiy hisob yoki ticketga tegmaydi.", [
      ["upn", "whoami /upn", "Joriy namuna hisobining UPN’ini aniqlang.", "student@corp.example\nLab ma’lumoti: sintetik."],
      ["tickets", "klist", "Sessiyadagi sintetik Kerberos ticket turlarini ko‘ring.", "Current LogonId is 0:0x3e7\nCached Tickets: (2)\n#0> krbtgt/CORP.EXAMPLE @ CORP.EXAMPLE\n#1> cifs/files01.corp.example @ CORP.EXAMPLE\nLab ma’lumoti: sintetik."]
    ]),
    flow("DNS KDC’ni topadi; Kerberos ticket beradi, LDAP katalog obyektlarini o‘qiydi.", ["Client\nDNS + time", "KDC\nAS exchange", "TGT\nclient cache", "Service ticket\nSPN", "Service\nLDAP / SMB"], ["discover", "authenticate", "request", "authorize"])
  ),
  lesson(
    "7. Group Policy: scope, precedence va natijaviy sozlama",
    `Group Policy Management Console’da GPO’ni site, domain yoki OU bilan bog‘lanadi. GPO link order, inheritance, Block Inheritance, Enforced va security filtering natijaga ta’sir qiladi. Odatda Local → Site → Domain → OU (LSDOU) tartibida qo‘llanadi; ichma-ich OU va conflict bo‘lsa, natijani taxmin qilmay, Resultant Set of Policy bilan tekshiring.\n\nComputer Configuration va User Configuration alohida policy’lar. Security filtering va WMI filter scope’ni toraytiradi; juda keng GPO katta ta’sir doirasiga ega. O‘zgarishni kichik test OU’da sinang, change owner, oldingi qiymat, tasdiq va rollback usulini hujjatlashtiring. gpupdate /force majburiy refresh bo‘lib, foydalanuvchi tajribasiga ta’sir qilishi mumkin; ushbu simulator’da faqat o‘qish buyruqlari mavjud.`,
    "gpresult /scope computer /r\nGet-GPResultantSetOfPolicy -ReportType Html -Path C:\\Lab\\rsop.html",
    "`gpresult` kompyuterga tatbiq qilingan GPO ro‘yxatini ko‘rsatadi; RSoP hisobotining yo‘li misol sifatida berilgan. Simulyator fayl yaratmaydi. Haqiqiy hisobotda policy va foydalanuvchi nomlari bo‘lishi mumkin.",
    "GPO’ning asosiy qo‘llanish ketma-ketligi qaysi qisqartma bilan eslab qolinadi?",
    ["lsdou", "local site domain ou"],
    practice("GPO va RSoP natijalari faqat o‘quv namunasidan ko‘rsatiladi; policy o‘zgartirish yo‘q.", [
      ["effective-policy", "gpresult /scope computer /r", "Kompyuter scope’ida qo‘llangan siyosatlarni tekshiring.", "COMPUTER SETTINGS\nApplied Group Policy Objects\n  Workstation-Baseline\n  Defender-Endpoint\nThe computer is a part of the following security groups\n  CORP\\Workstations\nLab ma’lumoti: sintetik."],
      ["resultant-policy", "Get-GPResultantSetOfPolicy -ReportType Html -Path C:\\Lab\\rsop.html", "RSoP hisobotida policy precedence natijasini ko‘ring.", "Report: C:\\Lab\\rsop.html (virtual; diskka yozilmadi)\nWinning GPO: Workstation-Baseline\nScope: OU=Workstations,DC=corp,DC=example\nLab ma’lumoti: sintetik."]
    ]),
    flow("GPO link’lari scope va precedence’ni belgilaydi; RSoP haqiqiy natijani tasdiqlaydi.", ["Local", "Site", "Domain", "Parent OU", "Child OU\nresultant policy"], ["L", "S", "D", "OU"])
  ),
  lesson(
    "8. Replikatsiya, saytlar va xavfsiz operatsion amaliyot",
    `AD DS multi-master replikatsiya orqali katalog o‘zgarishlarini DC’lar orasida tarqatadi. AD Sites va subnet mapping client’ni tarmoq topologiyasiga yaqin DC’ga yo‘naltiradi; DNS SRV, vaqt sinxronlash va site link schedule sog‘lom ishlashga ta’sir qiladi. Bir DC’da muvaffaqiyatli o‘zgarish ko‘rish butun forest’da replikatsiya tugaganini isbotlamaydi.\n\nFSMO role’lar ayrim forest/domain operatsiyalariga yagona owner belgilaydi. Replikatsiya muammosida avval DNS, vaqt, network path va event log dalillarini yig‘ing; repadmin yoki dcdiag natijalarini scope bilan cheklang. Restore yoki role seizure kabi o‘zgarishlar tasdiqlangan runbook, system-state backup va change approval talab qiladi. Tiered administration, MFA, LAPS, alohida admin account, monitoring va muntazam restore sinovi himoyaning muhim qatlamlaridir.`,
    "dcdiag /test:dns\nrepadmin /replsummary\nGet-ADDomainController -Filter *",
    "Ushbu buyruqlar AD DS holatini diagnostika qilish yoki controller’larni sanash uchun o‘qish/tekshiruv rejimida ishlatiladi. Majburiy replication, metadata cleanup, role transfer/seizure va restore bu amaliyotga kiritilmagan.",
    "Imtiyozli amallarda faqat vazifa uchun zarur huquqni berish tamoyili nima?",
    ["least privilege", "eng kam ruxsat", "minimal huquq"],
    practice("AD DS sog‘lig‘i va controller’lar ro‘yxatini sintetik ko‘rinishda tahlil qiling; real replikatsiya ishlamaydi.", [
      ["dns-health", "dcdiag /test:dns", "DNS diagnostikasidagi namuna statuslarni o‘qing.", "Testing server: AD01.corp.example\n  Auth: PASS\n  Basic: PASS\n  Records registration: PASS\nLab ma’lumoti: sintetik."],
      ["replication-health", "repadmin /replsummary", "Replikatsiya xatosi va kechikishlar summary’sini ko‘ring.", "Source DSA       largest delta  fails/total  %% error\nAD01             00m:42s        0 / 8       0\nAD02             00m:39s        0 / 8       0\nLab ma’lumoti: sintetik."],
      ["domain-controllers", "Get-ADDomainController -Filter *", "Sayt va DC nomlari ro‘yxatini tahlil qiling.", "HostName             Site\nAD01.corp.example    HQ\nAD02.corp.example    Branch-01\nLab ma’lumoti: sintetik."]
    ]),
    flow("Monitoring dalil beradi; tasdiqlangan backup va runbook tiklash amallarini boshqaradi.", ["DNS / time\npre-check", "DC health\ndiagnostic", "Replication\nsummary", "Backup\nrestore tested", "Approved\nchange / recovery"], ["tekshir", "solishtir", "himoya qil", "tasdiqla"])
  )
];
