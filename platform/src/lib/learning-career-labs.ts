import type { LabDef, LabTask } from "./learning-labs";

type LabCase = Omit<LabDef, "tasks"> & { tasks: LabTask[] };

const task = (id: string, prompt: string, answers: string[], hint: string): LabTask => ({ id, prompt, answers, hint });

const cases: LabCase[] = [
  {
    slug: "linux-service-incident-triage",
    moduleSlug: "linux-systems-administration",
    title: "Linux xizmat uzilishini jurnal va dependency bo‘yicha tahlil qilish",
    level: "boshlang‘ich", minutes: 25, priceTec: 20,
    summary: "Berilgan systemd status va sintetik jurnal asosida ta’sir, xato kodi va xavfsiz keyingi tekshiruvni aniqlang.",
    scenario: "Sintetik app serverda hisobot xizmati ishga tushmayapti. Sizga faqat o‘qish uchun systemctl va journal parchalari berilgan; xizmatni qayta ishga tushirmang.",
    skills: ["systemd status", "journal korrelyatsiyasi", "evidence vs hypothesis"],
    evidence: [{ name: "synthetic-service-status.txt", content: "Unit: report-worker.service\nLoadState: loaded\nActiveState: failed\nResult: exit-code\nExecStart: /opt/report/bin/worker\nStatus: 203/EXEC\nJournal: executable file not found\nDependency: mariadb.service active\nUTC: 2026-03-14T02:11:08Z" }],
    tasks: [
      task("failed-unit", "Qaysi systemd unit ishlamay qolgan?", ["report-worker.service", "report-worker"], "Unit: qatorini o‘qing."),
      task("exit-status", "Qaysi systemd status kodi ko‘rsatilgan?", ["203/exec", "203"], "Status qatoridagi raqamni oling."),
      task("cause", "Jurnalda executable’ga oid qanday sabab qayd etilgan?", ["executable file not found", "file not found", "fayl topilmadi"], "Jurnal yozuvidagi sababni o‘qing."),
      task("safe-next-step", "Birinchi xavfsiz tekshiruvda nima tekshiriladi: binary mavjudligi yoki servisni qayta yuklash?", ["binary mavjudligi", "executable mavjudligi", "file existence"], "Dalil sababni ko‘rsatmoqda; holatni o‘qishdan boshlang.")
    ],
    debrief: "203/EXEC va executable topilmagani o‘zaro mos, ammo paket, mount va permission holati ham tekshiriladi. Owner va change tasdig‘isiz fayl yoki unit’ni o‘zgartirmang; vaqt, dalil va noaniqlikni incident ticket’da saqlang."
  },
  {
    slug: "linux-permission-least-privilege",
    moduleSlug: "linux-systems-administration",
    title: "Linux fayl ruxsatini least-privilege bo‘yicha ko‘rib chiqish",
    level: "boshlang‘ich", minutes: 20, priceTec: 15,
    summary: "Sintetik file metadata’dan maxfiy hisobot kimlarga ochiqligini va xavfsiz maqsadli mode’ni aniqlang.",
    scenario: "Audit paytida finance export fayli barcha lokal foydalanuvchiga o‘qish huquqini berayotgani ko‘rindi. Siz o‘zgarish qilmasdan risk va owner talabini yozing.",
    skills: ["chmod mode", "owner/group", "least privilege"],
    evidence: [{ name: "stat-output.txt", content: "Path: /srv/finance/payroll.csv\nOwner: root\nGroup: finance\nMode: -rw-r--r-- (0644)\nContains: synthetic salary records\nExpected readers: payroll-service and finance operators only" }],
    tasks: [
      task("current-mode", "Faylning joriy octal mode qiymati?", ["0644", "644"], "Mode qatoriga qarang."),
      task("others-right", "Others uchun hozir qanday huquq bor?", ["read", "o‘qish", "o'qish"], "Oxirgi rwx tripletini baholang."),
      task("target-mode", "Owner read/write, finance group read, others none bo‘ladigan mode?", ["0640", "640"], "Owner rw-, group r--, others --- ni birlashtiring."),
      task("approval", "Ruxsatni o‘zgartirishdan oldin qaysi guruh egasi tasdiqlashi kerak?", ["finance", "finance owner"], "Expected readers qatoridan mas’ul guruhni toping.")
    ],
    debrief: "0644 boshqalarga o‘qish imkonini beradi; maqsadli 0640 faqat owner va finance group’ni qamrab oladi. Avval service account membership, backup va access review’ni egasi bilan tasdiqlang."
  },
  {
    slug: "linux-disk-capacity-triage",
    moduleSlug: "linux-systems-administration",
    title: "Disk to‘lishi va inode bosimini ajratish",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Sintetik df/du natijasidan filesystem bottleneck va xavfsiz tekshiruv tartibini aniqlang.",
    scenario: "Monitoring root filesystem uchun ogohlantirish berdi. Hech qanday faylni o‘chirmasdan blok va inode holatini tahlil qiling.",
    skills: ["df", "inode", "storage triage"],
    evidence: [{ name: "df-synthetic.txt", content: "Filesystem  Type  Size  Used  Avail  Use%  Mounted\n/dev/vda1   ext4   40G   37G    3G    93%   /\n/dev/vdb1   xfs    200G  88G   112G   44%   /srv\n\nInodes: / = 24% used\nLargest synthetic path: /var/log/app/archive/ (18G)" }],
    tasks: [
      task("root-use", "Root filesystem ishlatilish foizi?", ["93%", "93"], "Mounted / bo‘lgan qatorni o‘qing."),
      task("inode-use", "Root inode ishlatilishi necha foiz?", ["24%", "24"], "Inodes bo‘limidagi / qiymati."),
      task("likely-pressure", "Asosiy bosim inode emas, qaysi resurs?", ["disk space", "blok hajmi", "disk"], "Inode 24%, blok utilization esa yuqori."),
      task("largest-path", "Berilgan eng katta synthetic katalog?", ["/var/log/app/archive/"], "Largest synthetic path qatorini ko‘ring.")
    ],
    debrief: "Root disk 93% band, inode 24%; ehtimol blok hajmi bo‘yicha bosim bor. Arxivlarni o‘chirishdan oldin retention, application owner, rotation va incident evidence siyosatini tekshiring."
  },
  {
    slug: "linux-backup-rpo-rto-review",
    moduleSlug: "linux-systems-administration",
    title: "Backup siyosatida RPO, RTO va restore dalilini tekshirish",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Sintetik backup jurnalidan ma’lumot yo‘qotish oynasi, restore sinovi va qolgan xavfni baholang.",
    scenario: "Xizmat egasi backup muvaffaqiyatli ekanini aytmoqda. Berilgan yozuvda restore mashqi yo‘q; recovery readiness’ni xolis baholang.",
    skills: ["backup validation", "RPO/RTO", "restore drill"],
    evidence: [{ name: "backup-register.txt", content: "Service: inventory-api (synthetic)\nFull backup: daily 01:00 UTC\nLast successful backup: 2026-10-27 01:00 UTC\nIncremental interval: 15 minutes\nTarget RPO: 30 minutes\nTarget RTO: 4 hours\nLast restore test: NOT RECORDED\nBackup key owner: platform-security" }],
    tasks: [
      task("rpo", "Xizmat uchun belgilangan RPO?", ["30 minutes", "30 daqiqa", "30"], "Target RPO qatorini o‘qing."),
      task("rto", "Maqsadli tiklash vaqti qisqartmasi va qiymati?", ["rto 4 hours", "4 hours", "4 soat", "rto"], "RTO — recovery time objective."),
      task("restore-proof", "Restore test yozuvi bormi?", ["yo‘q", "yo'q", "not recorded", "no"], "Last restore test qatorini baholang."),
      task("owner", "Backup key uchun ko‘rsatilgan owner?", ["platform-security"], "Backup key owner qatorini toping.")
    ],
    debrief: "Backup job muvaffaqiyati tiklashni isbotlamaydi. Restore testni izolyatsiyalangan muhitda rejalang; RPO, RTO, key access va data integrity’ni o‘lchang."
  },
  {
    slug: "windows-logon-event-triage",
    moduleSlug: "windows-active-directory-operations",
    title: "Windows Security logida muvaffaqiyatsiz va muvaffaqiyatli logonni korrelyatsiya qilish",
    level: "boshlang‘ich", minutes: 25, priceTec: 20,
    summary: "Sintetik Event ID 4624/4625 qatorlarini vaqt va manba bo‘yicha tahlil qiling.",
    scenario: "Lab domen controlleridan kichik, sun’iy Event Log eksporti berilgan. Account compromise xulosasiga shoshilmasdan dalilni ajrating.",
    skills: ["Windows Event ID", "timeline", "source correlation"],
    evidence: [{ name: "security-events-synthetic.csv", content: "UTC,EventID,Account,LogonType,Source,Result\n08:00:11,4625,svc-report,3,10.10.2.44,Failure\n08:00:15,4625,svc-report,3,10.10.2.44,Failure\n08:02:09,4624,svc-report,3,10.10.2.44,Success\n08:03:00,4624,helpdesk,2,127.0.0.1,Success\n08:05:41,4625,guest,3,10.10.2.44,Failure" }],
    tasks: [
      task("failure-event", "Muvaffaqiyatsiz logon event ID?", ["4625"], "Failure qatoridagi EventID’ni oling."),
      task("success-event", "Muvaffaqiyatli logon event ID?", ["4624"], "Success qatoridagi EventID’ni oling."),
      task("account", "Shu manbadan keyin muvaffaqiyatli kirgan account?", ["svc-report"], "08:02:09 qatorini solishtiring."),
      task("source", "Hodisalar bilan bog‘liq sintetik source IP?", ["10.10.2.44"], "Ko‘p qatorlarda takrorlangan source.")
    ],
    debrief: "Sintetik qatorlarda muvaffaqiyatsiz urinish ortidan muvaffaqiyat bor, ammo bu hujum isboti emas. Service owner, scheduled job, endpoint, credential policy va qo‘shimcha telemetry’ni vakolatli SOC bilan tasdiqlang."
  },
  {
    slug: "windows-gpo-result-audit",
    moduleSlug: "windows-active-directory-operations",
    title: "Group Policy natijasi va scope farqini topish",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Sintetik GPO auditida computer scope, security filtering va client natijasini taqqoslang.",
    scenario: "Bir workstation’da audit policy kutilgandek emas. Berilgan policy summary’ni ko‘rib, GPO mavjudligi va qo‘llanganligini farqlang.",
    skills: ["Group Policy", "scope", "effective configuration"],
    evidence: [{ name: "gpo-audit-synthetic.txt", content: "GPO: Workstation-Audit-Baseline\nLinked OU: OU=Workstations,DC=lab,DC=test\nLink enabled: Yes\nGPO status: Computer settings enabled\nSecurity filter: GG-Audit-Pilot\nClient membership: GG-Audit-Pilot = No\nClient gpresult: GPO not applied (filtered)\nExpected event policy: Success and Failure" }],
    tasks: [
      task("gpo", "GPO nomi?", ["Workstation-Audit-Baseline"], "Birinchi qator."),
      task("status", "GPO link enabledmi?", ["yes", "ha"], "Link enabled qiymatini o‘qing."),
      task("cause", "Client GPO’ni nega olmayapti?", ["security filter", "filtered", "guruh filtri"], "Membership va gpresult qatorlarini solishtiring."),
      task("membership", "Client qaysi guruhga a’zo emas?", ["GG-Audit-Pilot"], "Security filter nomi.")
    ],
    debrief: "GPO link yoqilgan, computer setting enabled, ammo client security filter’ga a’zo emas. Group membership’i permission/change owner tasdiqlamasdan o‘zgartirmang."
  },
  {
    slug: "active-directory-privileged-access-review",
    moduleSlug: "windows-active-directory-operations",
    title: "Privileged AD access review va dormant account",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic group membership va last-use ma’lumotidan ortiqcha privilege review rejasini tuzing.",
    scenario: "Audit uchun laboratoriya forest’dagi privileged group ro‘yxati berilgan. Accountlarni darhol o‘chirmang; owner va approval’ni aniqlang.",
    skills: ["privileged identity", "access review", "evidence"],
    evidence: [{ name: "privileged-members-synthetic.csv", content: "Account,Group,LastInteractiveLogon,Owner,Ticket\nadm-nora,Domain Admins,2026-10-26,IdentityOps,CHG-410\nsvc-legacy,Domain Admins,2025-03-11,Unknown,None\nadm-ilo,Backup Operators,2026-10-20,BackupTeam,CHG-389\nbreakglass-01,Domain Admins,NEVER,SecurityDuty,Emergency-only sealed" }],
    tasks: [
      task("unknown-owner", "Qaysi privileged account owner’i unknown?", ["svc-legacy"], "Owner ustunini tekshiring."),
      task("no-ticket", "Qaysi account uchun ticket yo‘q?", ["svc-legacy"], "Ticket ustunida None ko‘rsatilgan satr."),
      task("breakglass", "Emergency-only deb belgilangan account?", ["breakglass-01"], "Description shu qatorning oxirida."),
      task("safe-action", "Unknown account bo‘yicha birinchi qadam: tekshirish yoki darhol o‘chirish?", ["tekshirish", "review", "investigate"], "Owner, dependency va approval aniqlanmaguncha destruktiv amal qilmang.")
    ],
    debrief: "svc-legacy yuqori xavfli va ownership noaniq, ammo darhol o‘chirish service interruption keltirishi mumkin. Identity owner, service dependency, approval va time-bound remediation bilan review ticket oching."
  },
  {
    slug: "windows-patch-ring-review",
    moduleSlug: "windows-active-directory-operations",
    title: "Windows patch ring va reboot riskini baholash",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Synthetic patch dashboard’dan compliance gap, reboot window va change evidence’ni aniqlang.",
    scenario: "Server patch hisobotida muhim update o‘rnatilmagan. Service owner bilan pilot va tiklash talabini belgilash kerak.",
    skills: ["patch governance", "change window", "rollback"],
    evidence: [{ name: "patch-ring-synthetic.csv", content: "Host,Role,Update,Status,RebootPending,MaintenanceWindow,Backup\nlab-dc-01,DomainController,KB-SYN-102,Pending,Yes,Sunday 01:00 UTC,SystemState 24h\nlab-web-02,Web,KB-SYN-102,Installed,No,Sunday 01:00 UTC,Image 24h\nlab-db-01,Database,KB-SYN-102,Pending,Yes,None,Snapshot 48h" }],
    tasks: [
      task("pending-count", "Nechta host update pending holatida?", ["2", "two"], "Pending qiymatlarini sanang."),
      task("window-gap", "Qaysi pending hostda maintenance window belgilanmagan?", ["lab-db-01"], "Pending qatorlarni window bilan solishtiring."),
      task("reboot", "Qaysi pending host reboot pending?", ["lab-dc-01", "lab-db-01"], "Ikkala pending satrida ham Yes."),
      task("first-control", "DB patchdan oldin qaysi boshqaruv tasdiqlanishi kerak: change window yoki darhol reboot?", ["change window", "maintenance window"], "Jadvalda maintenance window None.")
    ],
    debrief: "Ikki server pending; database host’da maintenance window yo‘q. Change owner, application dependency, backup freshness va restore evidence aniqlanmaguncha patch/reboot qilmang."
  },
  {
    slug: "network-vlsm-address-plan",
    moduleSlug: "network-engineering-advanced",
    title: "VLSM address plan’da overlap va host hajmini tekshirish",
    level: "boshlang‘ich", minutes: 30, priceTec: 20,
    summary: "Sintetik subnet talablari uchun kerakli prefiks va plan’dagi overlap’ni toping.",
    scenario: "Lab site’ga 192.0.2.0/24 TEST-NET blok ajratilgan. Sales 50 host, IT 25 host, guest 10 host; production IP emas.",
    skills: ["IPv4 subnetting", "VLSM", "address governance"],
    evidence: [{ name: "vlsm-requirements.txt", content: "Parent: 192.0.2.0/24 (documentation only)\nSales: 50 hosts, proposed 192.0.2.0/26\nIT: 25 hosts, proposed 192.0.2.64/27\nGuest: 10 hosts, proposed 192.0.2.96/28\nP2P: 2 hosts, proposed 192.0.2.112/30" }],
    tasks: [
      task("sales-prefix", "50 host uchun berilgan eng kichik mos prefix?", ["/26", "26"], "2^hostbits minus 2 kamida 50 bo‘lishi kerak."),
      task("it-prefix", "25 host uchun berilgan prefix?", ["/27", "27"], "IT proposed qatoriga qarang."),
      task("guest-prefix", "10 host uchun berilgan prefix?", ["/28", "28"], "Guest proposed qatoriga qarang."),
      task("p2p-prefix", "P2P link uchun berilgan prefix?", ["/30", "30"], "Oxirgi qatorni ko‘ring.")
    ],
    debrief: "Taklif etilgan bloklar ketma-ket va overlap’siz. Bu TEST-NET hujjat manzili; real network plan’da reserved range, gateway, DHCP, IPv6 va owner’ni hujjatlashtiring."
  },
  {
    slug: "network-vlan-segmentation-review",
    moduleSlug: "network-engineering-advanced",
    title: "VLAN segmentation flow matrix’ni least-privilege bo‘yicha review",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Sintetik ACL matrix’da ortiqcha any-any ruxsatini topib, zarur flow’ni ajrating.",
    scenario: "Lab ofisda staff, guest, IoT va management VLAN’lar bor. Berilgan flow’lar policy review uchun, qurilmaga qo‘llanmaydi.",
    skills: ["VLAN boundaries", "ACL review", "least privilege"],
    evidence: [{ name: "flow-matrix-synthetic.csv", content: "Source,Destination,Service,Decision,Reason\nStaff,Payroll,HTTPS,Allow,Payroll portal\nGuest,Internal-All,Any,Allow,Convenience\nIoT,Printer,IPP,Allow,Printing\nIoT,Management,SSH,Allow,Temporary setup\nManagement,Switches,SSH,Allow,Admin task" }],
    tasks: [
      task("broad-rule", "Qaysi flow any service bilan Internal-All’ga ruxsat beradi?", ["Guest to Internal-All", "Guest", "Guest,Internal-All"], "Any va Internal-All birga kelgan qatorni toping."),
      task("iot-admin", "IoT qurilmasiga management SSH ruxsati berilganmi?", ["ha", "yes"], "IoT, Management, SSH satrini o‘qing."),
      task("iot-printer", "IoT uchun ko‘rsatilgan zarur xizmat?", ["ipp"], "Printer qatoridagi service qiymati."),
      task("action", "Temporary SSH flow bo‘yicha xavfsiz next step?", ["owner and expiry review", "owner va expiry review", "review owner expiry"], "Temporary rule’ni owner, scope va expiry bilan tekshiring.")
    ],
    debrief: "Guest any-any va IoT-to-management SSH yuqori risk. Ularni darhol production’da o‘chirish o‘rniga flow owner, dependency, intended service, approval va expiry bilan change request tayyorlang."
  },
  {
    slug: "network-dns-incident-timeline",
    moduleSlug: "network-engineering-advanced",
    title: "DNS incidentida cache, resolver va authoritative javobni farqlash",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Sintetik DNS trace’da NXDOMAIN, TTL va resolver vaqtini talqin qiling.",
    scenario: "Test service nomi faqat bir subnetda ishlamayapti. DNS qatorlarini o‘qing; haqiqiy zone’ni o‘zgartirmang.",
    skills: ["DNS resolver", "TTL", "troubleshooting"],
    evidence: [{ name: "dns-trace-synthetic.txt", content: "UTC 09:00:00 client -> resolver 10.1.0.53 query A api.example.test\nUTC 09:00:00 resolver -> client NXDOMAIN (cache age 20s)\nUTC 09:02:00 admin note: authoritative zone updated at 09:01 UTC\nRecord TTL: 300 seconds\nOther subnet resolver: 10.2.0.53 returns 192.0.2.44 (TEST-NET)" }],
    tasks: [
      task("rcode", "Birinchi resolver qanday javob qaytargan?", ["nxdomain"], "Resolver response qatorini toping."),
      task("ttl", "Record TTL necha sekund?", ["300"], "Record TTL qatoriga qarang."),
      task("working-resolver", "Boshqa subnetdagi resolver manzili?", ["10.2.0.53"], "Last line boshidagi resolver’ni o‘qing."),
      task("safe-diagnosis", "Record yangilangach, eski cache qancha vaqtgacha ta’sir qilishi mumkin?", ["ttl", "300 seconds", "300"], "Cache va TTL munosabatini baholang.")
    ],
    debrief: "Bir resolver eski NXDOMAIN cache qilgan bo‘lishi mumkin, ammo delegation, split DNS va client cache ham tekshiriladi. Record o‘zgarishini owner va change log bilan tasdiqlang."
  },
  {
    slug: "network-firewall-change-review",
    moduleSlug: "network-engineering-advanced",
    title: "Firewall change’da broad access va expiry’ni aniqlash",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Sintetik firewall request’larda any-any va muddatsiz istisnoni ajrating.",
    scenario: "Service jamoasi vaqtinchalik port ochishni so‘radi. Qoidalar policy review uchun; ularni amalda qo‘llamang.",
    skills: ["firewall request", "risk assessment", "change control"],
    evidence: [{ name: "firewall-request-synthetic.csv", content: "Rule,Source,Destination,Service,Expiry,Owner\nR-18,AppSubnet,DB-01,TCP/5432,2026-11-15,DataTeam\nR-19,Any,Any,Any,None,Unknown\nR-20,BuildRunner,ArtifactRepo,HTTPS,2026-10-30,DevOps\nR-21,VendorVPN,AdminSubnet,Any,2026-11-01,Procurement" }],
    tasks: [
      task("broad-rule", "Qaysi rule Any source, destination va service’dan foydalanadi?", ["r-19", "19"], "Any uchala maydonda takrorlangan qator."),
      task("no-expiry", "Qaysi rule’da expiry yo‘q?", ["r-19", "19"], "Expiry None qatorini toping."),
      task("vendor-broad", "VendorVPN rule’ida qaysi maydon ortiqcha keng?", ["service", "any service", "any"], "VendorVPN qatoridagi Any’ni aniqlang."),
      task("review-owner", "Unknown owner bo‘lgan rule’ni productionga qo‘llashdan oldin nima kerak?", ["owner and business approval", "owner va biznes tasdig‘i", "owner approval"], "Owner va business need tasdiqlanmagan.")
    ],
    debrief: "R-19 any-any/no expiry, R-21 VendorVPN any service — riskli. Minimal destination/service, named owner, business approval, logging, expiry va rollback’ni talab qiling."
  },
  {
    slug: "network-wifi-radius-auth-triage",
    moduleSlug: "network-engineering-advanced",
    title: "Wi-Fi 802.1X/RADIUS autentifikatsiya xatosini tahlil qilish",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Sintetik AP va RADIUS loglarini solishtirib, sertifikat trust va vaqt muammosini aniqlang.",
    scenario: "Lab foydalanuvchilaridan biri corporate SSID’ga kira olmayapti. Credential sinamang; faqat berilgan lab logini tahlil qiling.",
    skills: ["802.1X", "RADIUS", "certificate validation"],
    evidence: [{ name: "radius-synthetic.log", content: "AP: lab-ap-02 SSID: Staff-Lab\nUTC 10:11:02 RADIUS Access-Request user=student-07\nUTC 10:11:02 RADIUS Access-Reject reason=certificate-chain-untrusted\nUTC 10:12:20 client note: system clock is 2 days behind\nPolicy: EAP-TLS requires trusted issuing CA and valid time" }],
    tasks: [
      task("decision", "RADIUS server javobi?", ["access-reject", "reject"], "Access-Request’dan keyingi response."),
      task("cause", "Logdagi asosiy sabab?", ["certificate-chain-untrusted", "untrusted certificate chain", "sertifikat zanjiri ishonchsiz"], "Reject reason maydoniga qarang."),
      task("time", "Client clock qanchaga orqada?", ["2 days", "2 kun"], "Client note qatorini o‘qing."),
      task("safe-fix", "Qaysi ikki narsani tekshirish kerak?", ["trusted ca and time", "ca va vaqt", "issuing ca and valid time"], "Policy qatoridagi ikki shart.")
    ],
    debrief: "Sertifikat chain trust va noto‘g‘ri vaqt asosiy ehtimol. Foydalanuvchidan parol so‘ramang; CA chain, endpoint time source va certificate expiry’ni IT owner bilan tekshiring."
  },
  {
    slug: "network-packet-loss-timeline",
    moduleSlug: "network-engineering-advanced",
    title: "Packet loss va retransmission vaqt chizig‘ini tuzish",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Sintetik telemetry’da loss, latency va capture cheklovini ajrating.",
    scenario: "Lab service sekinlashuvi uchun interface counter va synthetic capture summary taqdim etilgan. Capture bitta nuqtada olingan.",
    skills: ["packet analysis", "retransmission", "observability limitations"],
    evidence: [{ name: "packet-summary-synthetic.txt", content: "Capture point: client-lab-03\nWindow: 12:00-12:05 UTC\nTCP retransmission flagged: 18\nMedian RTT: 22 ms\np95 RTT: 480 ms\nInterface RX errors: 0\nInterface drops: 0\nRemote server metrics: not available" }],
    tasks: [
      task("retransmissions", "Qancha TCP retransmission flag qayd etilgan?", ["18"], "Summary qatorini o‘qing."),
      task("p95", "p95 RTT qiymati?", ["480 ms", "480"], "p95 qatorini ko‘ring."),
      task("capture-point", "Capture qaysi nuqtada olingan?", ["client-lab-03"], "Capture point qatorini toping."),
      task("limit", "Remote server metric bormi?", ["yo‘q", "no", "not available"], "Oxirgi qatorga qarang.")
    ],
    debrief: "Client capture retransmission ko‘rsatadi, lekin remote metric yo‘q; bitta capture root cause’ni isbotlamaydi. Server telemetry, route, app timing va synchronized clocks bilan korrelyatsiya qiling."
  },
  {
    slug: "soc-authentication-alert-triage",
    moduleSlug: "soc-incident-response-detection",
    title: "SOC authentication alert’ni dalil va confidence bilan triage qilish",
    level: "boshlang‘ich", minutes: 25, priceTec: 20,
    summary: "Synthetic sign-in signalida user, time, source va alternativ izohni ajrating.",
    scenario: "SIEM impossible-travel tipidagi alert chiqardi. Berilgan yozuvlarda VPN egress o‘zgarishi ham qayd etilgan.",
    skills: ["alert triage", "identity logs", "uncertainty"],
    evidence: [{ name: "signin-alert-synthetic.json", content: "alert=AUTH-221\nuser=learner-04\nfirst=2026-10-27T07:02:00Z source=198.51.100.10 result=success\nsecond=2026-10-27T07:08:00Z source=203.0.113.8 result=success\nvpn_change=approved at 06:55Z\nmfa=passed\nendpoint_context=missing" }],
    tasks: [
      task("user", "Synthetic alert qaysi user’ga tegishli?", ["learner-04"], "user field’ni o‘qing."),
      task("mfa", "MFA natijasi qanday?", ["passed", "muvaffaqiyatli"], "mfa field’ni toping."),
      task("alternative", "Ikkinchi source’ga oid benign ehtimoliy izoh?", ["approved vpn change", "vpn egress", "tasdiqlangan vpn"], "vpn_change qatoriga qarang."),
      task("missing-context", "Qaysi endpoint kontekst yetishmaydi?", ["endpoint context", "endpoint"], "Missing deb belgilangan field.")
    ],
    debrief: "Approved VPN change alert’ni izohlashi mumkin, endpoint context esa missing. Identity owner va VPN logi bilan tasdiqlamaguncha false positive yoki compromise deb xulosa qilmang."
  },
  {
    slug: "soc-detection-quality-review",
    moduleSlug: "soc-incident-response-detection",
    title: "Detection qoidasi coverage, false-positive va expiry review",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic detection metadata’dan istisno scope’i va test gap’ini toping.",
    scenario: "SOC qoidasi service account’larni allowlist qiladi. Istisno uzoq muddatli va regression fixture yo‘q.",
    skills: ["detection engineering", "allowlist governance", "test coverage"],
    evidence: [{ name: "detection-review-synthetic.txt", content: "Rule: Privileged-Login-Outside-Window\nData source: identity audit\nAllowlist: svc-* (wildcard)\nOwner: unassigned\nExpiry: none\nTest fixtures: normal=1, suspicious=0\nLast review: 2025-10-01" }],
    tasks: [
      task("wildcard", "Allowlist qaysi pattern bilan barcha svc account’ni qamrab olmoqda?", ["svc-*", "wildcard"], "Allowlist qatoriga qarang."),
      task("owner", "Rule owner tayinlanganmi?", ["yo‘q", "no", "unassigned"], "Owner field qiymati."),
      task("expiry", "Allowlist expiry bormi?", ["yo‘q", "no", "none"], "Expiry field."),
      task("test-gap", "Qaysi fixture yo‘q?", ["suspicious", "suspicious fixture"], "Test fixtures qatoridagi 0 qiymat.")
    ],
    debrief: "Wildcard allowlist unassigned va muddatsiz; suspicious fixture yo‘q. Detection owner, narrow scope, expiry, regression sample va staged deployment bilan qayta ko‘rib chiqilsin."
  },
  {
    slug: "soc-incident-timeline-correlate",
    moduleSlug: "soc-incident-response-detection",
    title: "Bir nechta log manbasidan incident timeline tuzish",
    level: "o‘rta", minutes: 30, priceTec: 25,
    summary: "Synthetic identity, endpoint va proxy event’larini UTC bo‘yicha tartiblang.",
    scenario: "Blue-team mashqida uchta log manbasi berilgan; clock drift yozuvlarini hisobga olib, isbotlangan faktlarni qayd eting.",
    skills: ["timeline", "event correlation", "clock drift"],
    evidence: [{ name: "timeline-synthetic.csv", content: "Source,RawTime,Offset,Event\nIdP,09:00:00Z,+0s,login success user=analyst-lab\nEndpoint,09:01:14Z,-14s,process alert on host=lab-ws-02\nProxy,09:01:40Z,+0s,blocked request category=unknown\nIdP,09:03:00Z,+0s,session revoked by admin" }],
    tasks: [
      task("user", "Sintetik identity account?", ["analyst-lab"], "IdP qatoridagi user field."),
      task("host", "Endpoint alert qaysi hostda?", ["lab-ws-02"], "Endpoint qatorini o‘qing."),
      task("adjusted-time", "14 soniya orqada turgan endpoint event’ning tuzatilgan UTC vaqti?", ["09:01:28z", "09:01:28"], "Raw 09:01:14 ga 14 soniya qo‘shing."),
      task("action", "Session’ni kim bekor qilgan?", ["admin", "administrator"], "Oxirgi IdP qatorini tekshiring.")
    ],
    debrief: "Clock offset hisobga olinganda endpoint event 09:01:28Z. Proxy request blocked; bu data exfiltration bo‘lganini anglatmaydi. Timeline’da raw va corrected vaqt hamda source’ni saqlang."
  },
  {
    slug: "soc-evidence-integrity-manifest",
    moduleSlug: "soc-incident-response-detection",
    title: "Digital evidence manifest va chain-of-custody gaplarini topish",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Sintetik evidence register’dan hash, collector va transfer logidagi bo‘shliqni aniqlang.",
    scenario: "Incident review uchun forensic export manifest’i berilgan. Dalilni qayta yig‘ish yoki o‘zgartirish o‘rniga documentation gap’ini belgilang.",
    skills: ["evidence integrity", "SHA-256", "chain of custody"],
    evidence: [{ name: "evidence-register-synthetic.csv", content: "File,CollectedUTC,Collector,SHA256,Storage,TransferLog\ncapture-01.pcap,10:00Z,analyst-2,ab12...ef90,case-vault,complete\nmemory-01.raw,10:12Z,analyst-2,MISSING,case-vault,complete\nhost-notes.txt,10:20Z,unknown,9f00...a112,shared-drive,missing" }],
    tasks: [
      task("missing-hash", "Qaysi faylda SHA256 yo‘q?", ["memory-01.raw"], "MISSING qiymatni toping."),
      task("unknown-collector", "Qaysi fayl collector’i unknown?", ["host-notes.txt"], "Collector ustunini tekshiring."),
      task("weak-storage", "Qaysi fayl shared-drive’da saqlangan?", ["host-notes.txt"], "Storage ustuniga qarang."),
      task("missing-transfer", "Qaysi fayl uchun transfer log missing?", ["host-notes.txt"], "TransferLog qiymatiga qarang.")
    ],
    debrief: "memory-01.raw’da hash yo‘q; host-notes.txt’da collector/transfer va storage nazorati zaif. Hozirgi holatni saqlang, evidence owner bilan integrity va access logni tekshiring."
  },
  {
    slug: "soc-threat-hunt-scope",
    moduleSlug: "soc-incident-response-detection",
    title: "Threat hunt gipotezasi va vakolatli scope’ni aniqlash",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Hunt request’da ruxsatli data source, vaqt oynasi va savol doirasini aniqlang.",
    scenario: "Tahlilchi suspicious service account bo‘yicha hunt boshlamoqchi. Berilgan request’da prod host tekshiruvi uchun approval hali yo‘q.",
    skills: ["hunt hypothesis", "scope", "authorization"],
    evidence: [{ name: "hunt-request-synthetic.txt", content: "Hypothesis: svc-build accessed an unusual host\nApproved sources: lab identity logs, CI audit logs\nTime window: 2026-10-26 00:00Z to 2026-10-27 00:00Z\nProd endpoint query: NOT APPROVED\nOwner: Detection Engineering\nRequested action: read-only log correlation" }],
    tasks: [
      task("account", "Tekshiriladigan service account?", ["svc-build"], "Hypothesis’ni o‘qing."),
      task("time-window", "Hunt oynasi necha soat?", ["24", "24 hours"], "Bir sutkalik interval."),
      task("approved", "Qaysi ikki manba approved?", ["lab identity logs and ci audit logs", "identity logs and ci audit logs", "lab identity, ci audit"], "Approved sources qatorini ko‘ring."),
      task("prod-scope", "Prod endpoint query approvedmi?", ["yo‘q", "no", "not approved"], "Prod endpoint qatoridagi status.")
    ],
    debrief: "Hunt faqat approved log source’larda read-only. Prod endpoint query uchun alohida written scope/approval kerak; authorization kelmaguncha u ma’lumotni so‘ramang."
  },
  {
    slug: "security-vulnerability-prioritization",
    moduleSlug: "security-engineering-appsec",
    title: "Vulnerability finding’larni exposure va aktiv qiymati bilan ustuvorlash",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "CVSS’dan tashqari internet exposure, known exploitation va biznes ta’sirini baholang.",
    scenario: "Uch synthetic finding turli severity va exposure’ga ega. Fix order taklifini asoslang; hech qanday exploit bajarilmaydi.",
    skills: ["risk-based prioritization", "asset criticality", "mitigation"],
    evidence: [{ name: "findings-synthetic.csv", content: "ID,CVSS,Exposure,Known exploitation,Asset,Compensating control\nF-11,9.8,Internet-facing,Yes,Customer portal,None\nF-12,9.1,Isolated test subnet,No,Disposable lab,Snapshot\nF-13,7.5,Internal,Unknown,Identity sync service,Restricted ingress" }],
    tasks: [
      task("highest-risk", "Birinchi darajali triage talab qiladigan finding?", ["f-11", "11"], "Internet-facing va known exploitation qiymatlarini birga ko‘ring."),
      task("isolated", "Qaysi finding disposable lab asset’iga tegishli?", ["f-12", "12"], "Asset ustunini tekshiring."),
      task("unknown", "Qaysi finding’da exploitation status unknown?", ["f-13", "13"], "Known exploitation column."),
      task("cvss-limit", "CVSS balli yolg‘iz o‘zi biznes riskini to‘liq belgilaydimi?", ["yo‘q", "yo'q", "no"], "Exposure, asset value, controls va context ham ahamiyatli.")
    ],
    debrief: "F-11 immediate triage’da ustun, ammo remediation window va service owner tasdiqlanishi kerak. F-12/F-13 boshqa kontekstga ega; exploitability, exposure va compensating control’ni dalil bilan aniqlang."
  },
  {
    slug: "security-secure-code-review",
    moduleSlug: "security-engineering-appsec",
    title: "Secure code review’da SQL va authorization xatosini aniqlash",
    level: "o‘rta", minutes: 30, priceTec: 25,
    summary: "Berilgan xavfsiz bo‘lmagan pseudo-code parchasida data access va validation bo‘shliqlarini toping.",
    scenario: "Code review mashqi faqat keltirilgan pseudo-code’ga tegishli; hech qanday real sayt yoki endpoint tekshirilmaydi.",
    skills: ["parameterized query", "server-side authorization", "code review"],
    evidence: [{ name: "pseudo-code.txt", content: "GET /profile?id=<request value>\n1 user = db.query(\"SELECT * FROM users WHERE id=\" + request.id)\n2 return user.email, user.role\n3 UI hides admin button for non-admin\n4 server endpoint /admin/export checks only that user is logged in\nNote: no object ownership check shown" }],
    tasks: [
      task("sql-risk", "Qaysi line query string’ga raw request qiymatini qo‘shadi?", ["1", "line 1"], "Line 1 query concatenate qiladi."),
      task("authorization-gap", "Admin export endpoint’da qanday authorization check yetishmaydi?", ["role authorization", "server-side role check", "server-side authorization"], "Login bo‘lish role huquqini isbotlamaydi."),
      task("object-check", "Profile so‘rovida qaysi object-level policy tekshirilishi kerak?", ["ownership", "object ownership", "user ownership"], "Note’da no object ownership check deyiladi."),
      task("fix-pattern", "SQL qiymatini xavfsiz uzatish naqshi?", ["parameterized query", "prepared statement", "parametrli so‘rov"], "Query va value alohida uzatilishi kerak.")
    ],
    debrief: "Raw concatenation SQL injection riskini, UI-only admin gating esa server authorization gap’ini bildiradi. Fix design’ni testlar, least data response va ownership check bilan review qiling."
  },
  {
    slug: "security-sbom-dependency-review",
    moduleSlug: "security-engineering-appsec",
    title: "SBOM va dependency support holatini baholash",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Synthetic SBOM’da unsupported component, version va owner gap’ini toping.",
    scenario: "Release review’da dependency inventory berilgan. Findinglarni risk va patch owner bilan hujjatlashtiring.",
    skills: ["SBOM", "dependency lifecycle", "supply-chain risk"],
    evidence: [{ name: "sbom-synthetic.csv", content: "Component,Version,Support,Direct/Transitive,Owner\nlib-amber,1.2.0,Supported,Direct,Payments\nlib-cobalt,0.8.4,EOL,Transitive,Unknown\nlib-fern,4.1.1,Supported,Direct,Platform\nlib-slate,2.0.0,Advisory pending,Transitive,Search" }],
    tasks: [
      task("eol", "Qaysi component EOL?", ["lib-cobalt"], "Support ustunini qidiring."),
      task("owner-gap", "EOL component owner’i kim?", ["unknown"], "Owner field’ni tekshiring."),
      task("advisory", "Qaysi component advisory pending?", ["lib-slate"], "Support statusga qarang."),
      task("first-step", "EOL component uchun xavfsiz birinchi boshqaruv qadami?", ["owner assignment and impact review", "owner tayinlash va impact review", "assign owner"], "Avval owner va qo‘llanish doirasini aniqlang.")
    ],
    debrief: "lib-cobalt EOL va owner unknown; lib-slate advisory pending. Dependency tree, runtime usage, exposure, fix version, test and owner’ni aniqlang; package blindly upgrade qilmang."
  },
  {
    slug: "security-iam-policy-review",
    moduleSlug: "security-engineering-appsec",
    title: "Least-privilege IAM policy review",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic identity policy’da wildcard action/resource va unused role’ni toping.",
    scenario: "Cloud identity policy tahlili faqat berilgan matn bo‘yicha. Hech qanday cloud account’ga ulanilmaydi.",
    skills: ["IAM", "wildcard risk", "access review"],
    evidence: [{ name: "iam-policy-synthetic.txt", content: "Role: report-exporter\nPrincipal: workload-report\nAction: storage:*\nResource: *\nLastUsed: 2026-01-03\nOwner: analytics\nRequired task: write to bucket://monthly-reports only\nMFA: workload identity" }],
    tasks: [
      task("action", "Qaysi action wildcard bilan keng berilgan?", ["storage:*"], "Action field’ni o‘qing."),
      task("resource", "Resource scope qanday ko‘rsatilgan?", ["*"], "Resource field qiymati."),
      task("required", "Workload’ga kerak bo‘lgan yagona destination?", ["monthly-reports", "bucket://monthly-reports"], "Required task qatorini toping."),
      task("last-used", "LastUsed sanasi?", ["2026-01-03"], "LastUsed qatorini o‘qing.")
    ],
    debrief: "Policy storage:* va * resource bilan talabdan keng. Zarur action/resource’ni test va owner approval bilan toraytiring; last-used sanasi va workload identity’ni alohida verifikatsiya qiling."
  },
  {
    slug: "cloud-restore-readiness-review",
    moduleSlug: "cloud-devsecops-operations",
    title: "Cloud backup isolation va restore readiness review",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic cloud recovery plan’da cross-account, key owner va restore test gap’ini toping.",
    scenario: "Cloud backup dashboard yashil, ammo restore mashqi va access separation holatini baholash kerak.",
    skills: ["cloud backup", "restore test", "key governance"],
    evidence: [{ name: "cloud-recovery-synthetic.txt", content: "Workload: catalog-api (synthetic)\nBackup frequency: every 6 hours\nCopy: same account only\nEncryption: enabled, key owner=workload-admin\nDelete permission: workload-admin\nLast restore test: 2025-04-01\nTarget RPO: 8 hours\nTarget RTO: 6 hours" }],
    tasks: [
      task("copy", "Backup copy qayerda saqlanadi?", ["same account only", "same account"], "Copy qatorini ko‘ring."),
      task("delete-role", "Backup delete permission kimda?", ["workload-admin"], "Delete permission field’ni toping."),
      task("restore-date", "Oxirgi restore test sanasi?", ["2025-04-01"], "Last restore test qatori."),
      task("gap", "Backup delete va workload identity ajratilganmi?", ["yo‘q", "yo'q", "no"], "Bir xil workload-admin boshqarayotganini ko‘ring.")
    ],
    debrief: "Same-account copy, shared delete/key authority va eskirgan restore evidence ransomware/accidental deletion riskini oshiradi. Immutable/isolated copy va restore drill’ni ownerlar bilan rejalang."
  },
  {
    slug: "cloud-iac-plan-review",
    moduleSlug: "cloud-devsecops-operations",
    title: "Infrastructure-as-Code plan’da ochiq resource va state riskini aniqlash",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Synthetic IaC plan va repo note’lardan public exposure hamda secret storage gap’ini toping.",
    scenario: "CI pipeline plan artifact yaratdi, lekin apply qilinmagan. Review natijasini yozing; hech qanday infratuzilma o‘zgarmaydi.",
    skills: ["IaC review", "public exposure", "secrets"],
    evidence: [{ name: "iac-plan-synthetic.txt", content: "resource storage_bucket monthly-reports\npublic_access = true\nversioning = false\nstate_backend = local file\npipeline note: cloud_access_key stored in repo variable file\nplan status: not applied" }],
    tasks: [
      task("public", "Bucket public access qiymati?", ["true"], "public_access qatoriga qarang."),
      task("versioning", "Versioning yoqilganmi?", ["yo‘q", "yo'q", "false", "no"], "versioning qiymati false."),
      task("state", "IaC state qayerda saqlanmoqda?", ["local file", "local"], "state_backend qatorini o‘qing."),
      task("secret", "Access key qayerda saqlangan?", ["repo variable file", "repo"], "Pipeline note’ni ko‘ring.")
    ],
    debrief: "Public bucket, no versioning, local state va repository’dagi key — review blocker. Key’ni revoke/rotate va incident policy’ni tekshiring; secure backend, access control va testdan keyingina apply ko‘rib chiqilsin."
  },
  {
    slug: "cloud-container-manifest-review",
    moduleSlug: "cloud-devsecops-operations",
    title: "Container manifest’da root va resurs limitlari bo‘shlig‘i",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic workload YAML summary’dan root execution, writable filesystem va limit gap’ini toping.",
    scenario: "Cluster policy review uchun metadata summary berilgan; kubectl yoki cluster ishlatilmaydi.",
    skills: ["container hardening", "Kubernetes security", "resource control"],
    evidence: [{ name: "pod-summary-synthetic.yaml", content: "workload: invoice-worker\nimage: registry.example.test/invoice:latest\nrunAsUser: 0\nreadOnlyRootFilesystem: false\nresourceRequests: missing\nresourceLimits: missing\nserviceAccount: default\nnetworkPolicy: absent" }],
    tasks: [
      task("root", "runAsUser qiymati?", ["0", "root"], "Summary qatorini ko‘ring."),
      task("tag", "Image tag mutable yoki latestmi?", ["latest", "ha", "yes"], "Image reference oxirini o‘qing."),
      task("limits", "CPU/memory resource limit bor-mi?", ["yo‘q", "yo'q", "no", "missing"], "resourceLimits qiymatini toping."),
      task("service-account", "Qaysi service account ishlatilgan?", ["default"], "serviceAccount field’i.")
    ],
    debrief: "Root, mutable latest tag, no limits, default service account va missing network policy riskni oshiradi. Release owner bilan pinned digest, non-root, resource boundary va scoped identity planini ishlab chiqing."
  },
  {
    slug: "gdpr-data-inventory-review",
    moduleSlug: "gdpr-privacy-engineering",
    title: "GDPR data inventory’da purpose va retention bo‘shlig‘i",
    level: "boshlang‘ich", minutes: 25, priceTec: 20,
    summary: "Synthetic data map’da maqsadi noma’lum va muddatsiz saqlanadigan ma’lumotni toping.",
    scenario: "Yangi mahsulot uchun data inventory tekshirilmoqda. Bu legal conclusion emas, governance gap analysis mashqi.",
    skills: ["data inventory", "purpose limitation", "retention"],
    evidence: [{ name: "data-map-synthetic.csv", content: "Category,Purpose,Retention,Owner,Access\nemail,account notices,account lifetime + 30 days,Product,Support\nprecise-location,analytics,indefinite,Unknown,Analytics team\npassword,authentication,not stored in plaintext,Identity,Identity service\nsupport-ticket,customer support,24 months,Support,Support leads" }],
    tasks: [
      task("unknown-purpose-owner", "Qaysi category owner’i unknown?", ["precise-location"], "Owner column’ni ko‘ring."),
      task("indefinite", "Qaysi category indefinite retention’da?", ["precise-location"], "Retention qiymatini izlang."),
      task("password", "Password qanday saqlanishi ko‘rsatilgan?", ["not stored in plaintext", "plaintext emas"], "Password qatorini o‘qing."),
      task("next", "Precise location uchun birinchi boshqaruv: purpose/retention owner review yoki data’ni avtomatik publish qilish?", ["purpose and retention owner review", "owner review", "purpose retention review"], "Unknown owner va indefinite muddatni hal qiling.")
    ],
    debrief: "Precise-location processing’da owner va finite retention yo‘q. Maqsad, necessity, legal basis, DPIA trigger, access va deletion’ni privacy/legal egasi bilan baholang."
  },
  {
    slug: "gdpr-data-subject-request",
    moduleSlug: "gdpr-privacy-engineering",
    title: "Data subject request workflow va minimallashtirilgan identity check",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Synthetic request’da huquq turi, receive date va safe identity verification yo‘lini ajrating.",
    scenario: "Support team access request oldi. Talabni legal exceptionlardan mustaqil ravishda hal qilmang; routing va evidence’ni tekshiring.",
    skills: ["DSR workflow", "identity verification", "privacy"],
    evidence: [{ name: "dsr-ticket-synthetic.txt", content: "Ticket: DSR-104\nReceived: 2026-10-26 14:00 UTC\nRequest: copy of personal data\nRequester: synthetic-user-17\nIdentity: existing authenticated account session\nSystems: CRM, support portal, billing\nOwner: Privacy Operations\nID document copy: not requested" }],
    tasks: [
      task("right", "Qaysi data subject request turi?", ["access", "copy of personal data", "right of access"], "Request qatorini o‘qing."),
      task("received", "Ticket qachon qabul qilingan?", ["2026-10-26 14:00 utc", "2026-10-26"], "Received field’ni toping."),
      task("owner", "Ticket owner?", ["privacy operations"], "Owner qatorini ko‘ring."),
      task("minimization", "ID document copy so‘ralganmi?", ["yo‘q", "yo'q", "no"], "Oxirgi qator.")
    ],
    debrief: "Bu access request; identity mavjud authenticated session orqali tekshirilgan va ortiqcha ID copy so‘ralmagan. Response scope, applicable deadline, exemptions va secure delivery’ni privacy/legal owner bilan tasdiqlang."
  },
  {
    slug: "gdpr-breach-risk-assessment",
    moduleSlug: "gdpr-privacy-engineering",
    title: "GDPR personal data breach tabletop va escalation",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic noto‘g‘ri recipient’ga yuborilgan ma’lumot holatida scope, containment va legal decision owner’ni aniqlang.",
    scenario: "Test email’da synthetic contact list tashqi test vendoriga ketdi. Hodisani yashirmang va real shaxslar bilan test qilmang.",
    skills: ["breach workflow", "risk assessment", "legal escalation"],
    evidence: [{ name: "breach-tabletop-synthetic.txt", content: "Data: 12 synthetic contact records (name + test email)\nRecipient: approved test vendor, wrong project mailbox\nAttachment encrypted: No\nAccess confirmation: recipient says unopened; not independently verified\nDetection: 2026-10-27 09:20 UTC\nContainment: access revoked 09:34 UTC\nPrivacy owner: on-call DPO\nAuthority notification decision: pending" }],
    tasks: [
      task("records", "Nechta synthetic record?", ["12"], "Data qatorini o‘qing."),
      task("encrypted", "Attachment encrypted bo‘lganmi?", ["yo‘q", "yo'q", "no"], "Encryption qatori."),
      task("containment", "Access qachon revoke qilingan?", ["09:34 utc", "09:34"], "Containment field’ni toping."),
      task("decision", "Authority notification qarorini kim baholashi kerak?", ["privacy owner", "dpo", "on-call dpo"], "Owner qatoriga qarang.")
    ],
    debrief: "Recipient tasdiqlashi mustaqil verifikatsiya qilinmagan, attachment shifrlanmagan. Data/controller scope, likelihood/impact, verification, legal timeline va notification qarorini DPO/legal egasi bilan hujjatlashtiring."
  },
  {
    slug: "gdpr-retention-deletion-map",
    moduleSlug: "gdpr-privacy-engineering",
    title: "Retention jadvali va backup deletion trigger’ini ko‘rib chiqish",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Synthetic retention schedule’da no-end-date va backup expiry noaniqligini toping.",
    scenario: "Privacy review uchun data retention map berilgan. Data’ni o‘chirmang; schedule owner va trigger’ni aniqlang.",
    skills: ["storage limitation", "retention schedule", "backup lifecycle"],
    evidence: [{ name: "retention-synthetic.csv", content: "Data,Active retention,Backup expiry,Legal hold,Owner\nsession-log,30 days,60 days,None,Security\nmarketing-event,Until withdrawn,90 days after deletion,None,Marketing\nsupport-export,Indefinite,Not defined,None,Unknown" }],
    tasks: [
      task("indefinite", "Qaysi data indefinite active retention’da?", ["support-export"], "Active retention qatorini qidiring."),
      task("backup", "Qaysi data’da backup expiry belgilanmagan?", ["support-export"], "Backup expiry ustuni."),
      task("owner", "Support export owner’i kim?", ["unknown"], "Owner maydoni."),
      task("decision", "Deletion’dan oldin qaysi legal condition tekshiriladi?", ["legal hold", "legal hold status"], "Legal hold ustunini va policy’ni tekshiring.")
    ],
    debrief: "support-export’da indefinite retention, backup expiry noaniq va owner unknown. Purpose, legal basis, hold, backup rotation va deletion evidence’ni privacy/data owner bilan aniqlang."
  },
  {
    slug: "iso27001-risk-register-treatment",
    moduleSlug: "iso-27001-isms",
    title: "ISO 27001 risk register’dan treatment owner va residual risk’ni aniqlash",
    level: "o‘rta", minutes: 30, priceTec: 25,
    summary: "Synthetic ISMS risk entries’dan ownership gap va treatment evidence’ni review qiling.",
    scenario: "Ichki ISMS exercise’da risk owner yo‘q qatorni toping; standard control wording’ni nusxalash shart emas.",
    skills: ["risk register", "risk treatment", "accountability"],
    evidence: [{ name: "risk-register-synthetic.csv", content: "ID,Scenario,Inherent,Control,Treatment,Residual,Owner\nR-01,Lost admin laptop,High,Full-disk encryption,Mitigate,Low,Endpoint Lead\nR-02,Cloud backup deletion,High,Versioned copy,Mitigate,Medium,Unknown\nR-03,Vendor outage,Medium,Manual workaround,Accept,Medium,Service Owner\nR-04,Stale staff account,Medium,Quarterly review,Mitigate,Low,Identity Lead" }],
    tasks: [
      task("unknown-owner", "Qaysi risk owner’i unknown?", ["r-02", "02"], "Owner maydonini qidiring."),
      task("scenario", "R-02 scenario?", ["cloud backup deletion", "backup deletion"], "Scenario ustuniga qarang."),
      task("residual", "R-02 residual risk level?", ["medium"], "Residual ustunini o‘qing."),
      task("safe-action", "Riskni qabul qilish yoki treatment uchun kim javobgar bo‘lishi kerak?", ["risk owner", "risk egasi"], "Ownership gap’ni tegishli biznes egasi yopadi.")
    ],
    debrief: "R-02’da owner unknown va residual risk medium. Risk treatment plan’ni service/data egasi tasdiqlasin; control samarasi, evidence, due date va qabul qilish vakolatini yozing."
  },
  {
    slug: "iso27001-control-evidence-audit",
    moduleSlug: "iso-27001-isms",
    title: "ISMS audit evidence: policy borligi va control samaradorligini farqlash",
    level: "o‘rta", minutes: 30, priceTec: 25,
    summary: "Synthetic audit sample’da hujjat, operatsion evidence va gapni aniqlang.",
    scenario: "Ichki auditor access review nazoratini sample qilyapti. Hujjat borligi control bajarilganini isbotlamaydi.",
    skills: ["audit evidence", "sampling", "control effectiveness"],
    evidence: [{ name: "audit-sample-synthetic.txt", content: "Control objective: privileged access reviewed quarterly\nPolicy: approved 2026-01-10\nQ1 review record: present, reviewer=Identity Lead\nQ2 review record: missing\nAdmin group export: captured 2026-07-01\nException: ADM-07, expiry missing\nAudit scope: lab tenant only" }],
    tasks: [
      task("policy", "Policy tasdiqlangan sana?", ["2026-01-10"], "Policy line’ni o‘qing."),
      task("missing-quarter", "Qaysi chorak review record’i missing?", ["q2", "second quarter"], "Q1 record present; Q2 missing."),
      task("exception", "Expiry yo‘q exception ID?", ["adm-07"], "Exception qatorini toping."),
      task("scope", "Audit scope qaysi muhit?", ["lab tenant only", "lab"], "Scope qatorini o‘qing.")
    ],
    debrief: "Policy borligi Q2 review’ni isbotlamaydi. Q2 evidence va ADM-07 expiry owner’ini so‘rang; audit finding’ni lab scope’dan tashqariga umumlashtirmang."
  },
  {
    slug: "iso27001-corrective-action",
    moduleSlug: "iso-27001-isms",
    title: "Audit finding uchun corrective action va effectiveness check tuzish",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic nonconformity’dan root cause, immediate correction va samaradorlik mezonini ajrating.",
    scenario: "Patch exception muddati o‘tib ketgan. Team faqat listni yangilagan; qaytalanishni oldini oluvchi action hali belgilanmagan.",
    skills: ["CAPA", "root cause", "effectiveness"],
    evidence: [{ name: "finding-synthetic.txt", content: "Finding: 3 patch exceptions past expiry\nImmediate correction: spreadsheet updated\nRoot cause: no owner reminder workflow\nCorrective action: NOT ASSIGNED\nEvidence owner: Platform Governance\nEffectiveness check: none\nDue date: none" }],
    tasks: [
      task("count", "Muddati o‘tgan exception soni?", ["3"], "Finding qatorini o‘qing."),
      task("cause", "Ko‘rsatilgan root cause?", ["no owner reminder workflow", "owner reminder workflow yo‘q", "no reminder workflow"], "Root cause line’ni toping."),
      task("action", "Corrective action tayinlanganmi?", ["yo‘q", "yo'q", "not assigned", "no"], "Corrective action field."),
      task("effectiveness", "Effectiveness check bormi?", ["yo‘q", "yo'q", "none", "no"], "Effectiveness field’ni tekshiring.")
    ],
    debrief: "Spreadsheet update immediate correction; reminder workflow root cause’ga tegadi, ammo owner, due date va effectiveness sample yo‘q. CAPA’ni tasdiqlab, keyingi review’da expiry alert ishlashini o‘lchang."
  },
  {
    slug: "iso27001-statement-applicability-review",
    moduleSlug: "iso-27001-isms",
    title: "SoA’da applicability rationale va implementation status’ni tekshirish",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic SoA excerpt’da rationale/evidence yetishmovchiligini toping.",
    scenario: "ISMS team SoA draft review qilyapti. Bu mashqda standart control matni berilmaydi va nusxalanmaydi.",
    skills: ["SoA governance", "applicability rationale", "evidence"],
    evidence: [{ name: "soa-synthetic.csv", content: "Ref,Applicable,Rationale,Status,Evidence owner\nC-01,Yes,Required for in-scope service,Implemented,Identity Lead\nC-02,No,Not relevant,Blank,Unknown\nC-03,Yes,Required for supplier access,Planned,Vendor Risk\nC-04,Yes,Blank,Implemented,Platform" }],
    tasks: [
      task("blank-rationale", "Applicable control’da rationale bo‘sh qaysi ref?", ["c-04", "04"], "Applicable Yes va Rationale blank satrini toping."),
      task("excluded", "Qaysi ref Not applicable?", ["c-02", "02"], "Applicable No qiymatini qidiring."),
      task("planned", "Qaysi ref Planned statusda?", ["c-03", "03"], "Status column."),
      task("unknown-owner", "Qaysi ref’da evidence owner unknown?", ["c-02", "02"], "Evidence owner ustunini tekshiring.")
    ],
    debrief: "C-02 exclusion rationale va owner’i noaniq; C-03 planned va C-04 rationale missing. Scope va standard edition asosida owner’lar rationale/status/evidence’ni to‘ldirsin; official standard wording licensed source’dan tekshiriladi."
  },
  {
    slug: "senior-architecture-rto-rpo-design",
    moduleSlug: "senior-infrastructure-architecture",
    title: "Senior arxitektura mashqi: recovery target va dependency order",
    level: "ilg‘or", minutes: 35, priceTec: 30,
    summary: "Synthetic service graph’da critical dependency, RTO/RPO gap va DR test’ni ko‘rib chiqing.",
    scenario: "Ko‘p komponentli lab xizmatida katalog API, identity, database va object backup bor. Recovery order’ni berilgan RTO/RPO bilan align qiling.",
    skills: ["architecture trade-off", "RTO/RPO", "dependency mapping"],
    evidence: [{ name: "service-recovery-synthetic.txt", content: "Service: catalog-platform\nTarget RTO: 4 hours\nTarget RPO: 15 minutes\nDependencies: identity -> database -> API -> web\nDatabase backup interval: 30 minutes\nIdentity recovery test: 2 hours\nDatabase restore test: 3 hours\nAPI/web recovery test: not recorded\nData: synthetic only" }],
    tasks: [
      task("rto", "Service target RTO?", ["4 hours", "4 soat"], "Target RTO qatorini o‘qing."),
      task("rpo", "Service target RPO?", ["15 minutes", "15 daqiqa"], "Target RPO qatorini o‘qing."),
      task("backup-gap", "Database backup interval target RPO’dan qisqami?", ["yo‘q", "yo'q", "no"], "30 daqiqa va 15 daqiqani taqqoslang."),
      task("missing-test", "Qaysi layer recovery test’i not recorded?", ["api/web", "api", "web"], "Oxirgi qatorlardagi recovery test status.")
    ],
    debrief: "Database backup 30 min interval bo‘lib, 15 min RPO’ga mos kelmaydi; API/web recovery evidence yo‘q. Business owner bilan target, backup, dependency order va full-service DR rehearsal’ni qayta ko‘rib chiqing."
  },
  {
    slug: "senior-architecture-change-risk",
    moduleSlug: "senior-infrastructure-architecture",
    title: "Senior change review: blast radius, rollback va stakeholder",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic platform change plan’da approval, health gate va rollback trigger bo‘shliqlarini aniqlang.",
    scenario: "Identity provider migration change request’i berilgan. Review faqat hujjatga tegishli; migration bajarilmaydi.",
    skills: ["change governance", "blast radius", "rollback"],
    evidence: [{ name: "change-plan-synthetic.txt", content: "Change: rotate identity signing certificate\nScope: all production tenants\nPilot: none\nApproval: service owner only\nPre-check: certificate chain valid\nHealth gate: not defined\nRollback: old certificate retained 24h, owner unknown\nCommunication: support team not listed" }],
    tasks: [
      task("scope", "Change scope?", ["all production tenants"], "Scope qatorini o‘qing."),
      task("pilot", "Pilot belgilangami?", ["yo‘q", "yo'q", "no", "none"], "Pilot field’ga qarang."),
      task("health", "Health gate belgilanganmi?", ["yo‘q", "yo'q", "no", "not defined"], "Health gate field."),
      task("rollback-owner", "Rollback owner tayinlanganmi?", ["yo‘q", "yo'q", "no", "unknown"], "Rollback line’dagi owner.")
    ],
    debrief: "Global production scope, no pilot/health gate, unknown rollback owner va support communication gap bor. Change’ni bosqichlash, approver, telemetry, rollback trigger va stakeholder plan bilan qayta ko‘rib chiqing."
  },
  {
    slug: "senior-architecture-slo-review",
    moduleSlug: "senior-infrastructure-architecture",
    title: "SLI/SLO va error budget’ni foydalanuvchi ta’siri bilan review",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic dashboard’da success-rate denominator va alert ownership bo‘shlig‘ini aniqlang.",
    scenario: "Yangi API SLO dashboard’i ko‘rib chiqilmoqda. Metrika faqat server CPU’ga tayanadi va user request denominator’i yo‘q.",
    skills: ["SLI/SLO", "alert design", "service ownership"],
    evidence: [{ name: "slo-dashboard-synthetic.txt", content: "Service: search-api\nSLO: 99.9% availability / 30 days\nSLI source: CPU below 80%\nValid requests denominator: not defined\nLatency percentile: p50 only\nAlert owner: unassigned\nError budget policy: none" }],
    tasks: [
      task("slo", "Dashboard SLO foizi?", ["99.9%", "99.9"], "SLO field’ni toping."),
      task("weak-sli", "Qaysi SLI source user request success’ini bevosita o‘lchamaydi?", ["cpu below 80%", "cpu"], "SLI source qatorini ko‘ring."),
      task("denominator", "Valid request denominator belgilanganmi?", ["yo‘q", "yo'q", "no", "not defined"], "Denominator field."),
      task("owner", "Alert owner kim?", ["unassigned"], "Alert owner qatorini o‘qing.")
    ],
    debrief: "CPU threshold availability SLI emas; request denominator va meaningful latency percentile kerak. Service owner bilan user-centric SLI, alert owner va error budget policy’ni kelishing."
  },
  {
    slug: "senior-architecture-supplier-risk",
    moduleSlug: "senior-infrastructure-architecture",
    title: "Supplier risk review’da data flow va exit rejasini tekshirish",
    level: "ilg‘or", minutes: 30, priceTec: 25,
    summary: "Synthetic supplier record’dan subprocessor, incident SLA va deletion evidence gap’ini toping.",
    scenario: "Platforma yangi analytics vendor bilan shartnoma ko‘rib chiqmoqda. Vendor approval’ni avtomatik bermang.",
    skills: ["supplier risk", "data governance", "exit planning"],
    evidence: [{ name: "supplier-review-synthetic.txt", content: "Vendor: MetricLab (synthetic)\nData: pseudonymous usage events\nSubprocessor list: not supplied\nIncident notice: 72 hours\nData region: EU and US, exact transfer path pending\nDeletion evidence at exit: not defined\nBusiness owner: Product Analytics" }],
    tasks: [
      task("data", "Qaysi data category vendor bilan ulashiladi?", ["pseudonymous usage events"], "Data field’ni o‘qing."),
      task("subprocessor", "Subprocessor list berilganmi?", ["yo‘q", "yo'q", "no", "not supplied"], "Subprocessor field."),
      task("region", "Qaysi transfer tafsiloti pending?", ["exact transfer path", "transfer path"], "Data region qatorini ko‘ring."),
      task("deletion", "Exit’da deletion evidence belgilanganmi?", ["yo‘q", "yo'q", "no", "not defined"], "Deletion evidence field.")
    ],
    debrief: "Subprocessor, transfer path va exit deletion evidence aniqlanmagan. Privacy/legal/security review, DPA, access, notice SLA va exit test tugamaguncha production data yubormang."
  },
  {
    slug: "soc-mitre-attack-mapping",
    moduleSlug: "soc-incident-response-detection",
    title: "Synthetic sign-in signalini MITRE ATT&CK bilan xaritalash",
    level: "o‘rta", minutes: 25, priceTec: 20,
    summary: "Berilgan login pattern’ini ehtiyotkorlik bilan texnika taksonomiyasiga bog‘lang; mappingni compromise isboti deb qabul qilmang.",
    scenario: "Defensive SOC mashqida bitta manba ko‘p account’ga uringan, ulardan biri muvaffaqiyatli kirgan. Faqat sintetik loglar ishlatiladi.",
    skills: ["MITRE ATT&CK mapping", "password spraying signal", "evidence confidence"],
    evidence: [{ name: "auth-pattern-synthetic.txt", content: "Source: 198.51.100.40 (documentation address)\n09:00-09:03Z: one failed attempt each against 18 distinct synthetic accounts\n09:05Z: successful sign-in to learner-11\nMFA: status unknown\nDevice context: missing\nATT&CK candidate: T1110.003 Password Spraying\nATT&CK candidate after successful access: T1078 Valid Accounts" }],
    tasks: [
      task("distinct-accounts", "Nechta distinct synthetic account sinab ko‘rilgan?", ["18"], "Evidence bir failed attempt per account deydi."),
      task("spraying-id", "Password spraying uchun berilgan ATT&CK technique ID?", ["t1110.003"], "ATT&CK candidate qatorini o‘qing."),
      task("valid-account-id", "Successful access’dan keyingi berilgan candidate ID?", ["t1078"], "Ikkinchi candidate’ni toping."),
      task("confidence-gap", "Qaysi ikki kontekst yetishmaydi?", ["mfa and device context", "mfa va device context", "mfa and device"], "Evidence oxiridagi missing/unknown field’lar.")
    ],
    debrief: "T1110.003 candidate’ga o‘xshash pattern bor; T1078 esa muvaffaqiyatli account ishlatilganini tekshirish uchun qo‘shimcha dalil talab qiladi. ATT&CK mapping — kuzatilgan xatti-harakatni tasniflash, attribution yoki incident tasdiqlash emas."
  },
  {
    slug: "soc-kql-siem-query-review",
    moduleSlug: "soc-incident-response-detection",
    title: "KQL uslubidagi sign-in query natijasini tahlil qilish",
    level: "o‘rta", minutes: 30, priceTec: 25,
    summary: "Sintetik jadval va KQL query ni o‘qib, muvaffaqiyatsiz sign-in’larni user/IP bo‘yicha jamlang.",
    scenario: "Lab Sentinel analitigi query natijasini review qilmoqda. Query faqat synthetic dataset’da ishlaydi; tenantga ulanmaydi.",
    skills: ["KQL reading", "SIEM aggregation", "query scope"],
    evidence: [{ name: "signin-events-synthetic.kql", content: "SigninLogs\n| where TimeGenerated > ago(1h)\n| where ResultType != 0\n| summarize Failures=count() by UserPrincipalName, IPAddress\n\nSynthetic rows: analyst-a / 203.0.113.9 / failure\nanalyst-a / 203.0.113.9 / failure\nanalyst-b / 203.0.113.9 / failure\nanalyst-c / 198.51.100.8 / failure\nsvc-report / 203.0.113.9 / success (excluded by ResultType != 0)" }],
    tasks: [
      task("window", "Query qaysi vaqt oynasini so‘raydi?", ["1h", "1 hour", "1 soat"], "ago() argumentini o‘qing."),
      task("failure-filter", "Muvaffaqiyatsiz natijalarni tanlash sharti?", ["resulttype != 0", "!= 0"], "where qatorini toping."),
      task("group-fields", "Natija qaysi ikki field bo‘yicha guruhlanadi?", ["userprincipalname and ipaddress", "user and ip", "userprincipalname, ipaddress"], "summarize by qismini o‘qing."),
      task("max-group", "Eng ko‘p failure bo‘lgan user?", ["analyst-a"], "Synthetic rows’da takrorlangan juftlikni sanang.")
    ],
    debrief: "Query 1 soatlik failure’larni user va IP bilan jamlaydi. Success qatori filter’dan o‘tmaydi. Ishlab chiqarish query’ni scope, tenant, time range, RBAC va privacy policy bilan tasdiqlamasdan bajarmang."
  },
  {
    slug: "cis-controls-self-assessment",
    moduleSlug: "iso-27001-isms",
    title: "CIS Controls self-assessment: evidence va owner gap’lari",
    level: "ilg‘or", minutes: 35, priceTec: 30,
    summary: "Fiktiv kichik tashkilot inventory va control evidence’ini baholab, riskka asoslangan action’lar tuzing.",
    scenario: "Mashq CIS Controls v8.1’ni yuqori darajada self-assessment qilishga qaratilgan; rasmiy control matnini ko‘chirmang yoki compliance claim bermang.",
    skills: ["CIS Controls", "self-assessment", "evidence ownership"],
    evidence: [{ name: "cis-assessment-synthetic.csv", content: "Area,Status,Evidence,Owner,Review\nAsset inventory,Partial,CMDB export 120 days old,IT Ops,Overdue\nAccess control,Implemented,Quarterly review Q3,Identity,Current\nVulnerability management,Unknown,None,Unknown,Not started\nData recovery,Partial,Backup jobs green; restore test absent,Platform,Overdue" }],
    tasks: [
      task("unknown-area", "Qaysi assessment area statusi Unknown?", ["vulnerability management"], "Status ustunini ko‘ring."),
      task("no-evidence", "Qaysi area uchun evidence None?", ["vulnerability management"], "Evidence column’da None qidiring."),
      task("stale-inventory", "Asset inventory export necha kun oldin?", ["120 days", "120"], "Evidence qatorini o‘qing."),
      task("restore-gap", "Data recovery’da qaysi amaliy dalil yetishmaydi?", ["restore test", "restore drill"], "Backup jobs green, lekin qaysi test yo‘q?")
    ],
    debrief: "Assessment evidence va owner gap’larini ko‘rsatadi, formal conformity yoki certification emas. Scope, evidence freshness, risk priority va action owner’ni tashkilot bilan tasdiqlang; CIS Controls rasmiy v8.1 sahifasidan current materialni tekshiring."
  },
  {
    slug: "aws-iam-vpc-security-review",
    moduleSlug: "cloud-devsecops-operations",
    title: "AWS uslubidagi IAM va VPC qoidalarini xavfsizlik review’i",
    level: "ilg‘or", minutes: 35, priceTec: 30,
    summary: "Synthetic cloud policy’da public SSH exposure, wildcard IAM va logging gap’ini aniqlang.",
    scenario: "Bu statik config review; AWS account yoki real resource yo‘q. Change qilmasdan, minimal ruxsat va owner action’larini yozing.",
    skills: ["cloud IAM", "VPC security group", "audit logging"],
    evidence: [{ name: "cloud-config-synthetic.txt", content: "SecurityGroup: sg-lab-web\nIngress: TCP/22 source=0.0.0.0/0\nIngress: TCP/443 source=0.0.0.0/0\nIAM Action: *\nIAM Resource: *\nCloudTrail: enabled in primary region only\nBucket access logging: disabled\nOwner: cloud-platform" }],
    tasks: [
      task("ssh-port", "Qaysi port public manbadan ochiq?", ["22", "tcp/22"], "Ingress qatorlarini ko‘ring."),
      task("source", "SSH qoidasi qaysi source range’dan ruxsat beradi?", ["0.0.0.0/0"], "Birinchi ingress qatori."),
      task("wildcard", "IAM action va resource scope qanchalik keng?", ["wildcard both", "action and resource wildcard", "*"], "Ikki IAM qatorini o‘qing."),
      task("logging-gap", "Qaysi logging nazorati o‘chirilgan?", ["bucket access logging", "bucket access log"], "Oxirgi logging qatorlari.")
    ],
    debrief: "SSH 0.0.0.0/0 va wildcard IAM yuqori xavfli; CloudTrail region coverage hamda bucket access logging gap bor. Role-based policy, managed access path, multi-region audit requirement va change approval’ni cloud owner bilan tekshiring."
  },
  {
    slug: "security-rules-of-engagement-review",
    moduleSlug: "security-engineering-appsec",
    title: "Xavfsizlik tekshiruvi uchun written scope va Rules of Engagement review",
    level: "boshlang‘ich", minutes: 25, priceTec: 20,
    summary: "Ruxsatli lab assessment’ning scope, vaqt, taqiqlar va to‘xtatish shartlarini tekshiring; testni bajarmang.",
    scenario: "Jamoa vakolati to‘liq bo‘lmagan test request oldi. Ushbu mashq faqat hujjat review’i; target’ga trafik yuborilmaydi.",
    skills: ["written authorization", "scope definition", "rules of engagement"],
    evidence: [{ name: "assessment-authorization-synthetic.txt", content: "Sponsor: Security Training (synthetic)\nWritten approval: SIGNED\nIn-scope: isolated VM lab-ctf-01 (10.10.50.10)\nOut-of-scope: production subnet 10.10.0.0/16, third-party services\nWindow: 2026-10-30 10:00-12:00 UTC\nAllowed: documentation review and non-destructive checks in lab only\nProhibited: credential guessing, data exfiltration, persistence, denial of service\nStop contact: lab owner on-call\nApproval expiry: 2026-10-30 12:00 UTC" }],
    tasks: [
      task("in-scope", "Yozma ruxsatda in-scope bo‘lgan yagona lab host?", ["lab-ctf-01", "10.10.50.10"], "In-scope qatorini o‘qing."),
      task("excluded", "Production uchun qaysi subnet out-of-scope?", ["10.10.0.0/16"], "Out-of-scope qatorini ko‘ring."),
      task("window", "Ruxsat oynasi UTC bo‘yicha qachon tugaydi?", ["12:00 utc", "12:00"], "Window intervalining oxirgi vaqtini oling."),
      task("stop-contact", "Ishni to‘xtatish kerak bo‘lsa kimga murojaat qilinadi?", ["lab owner on-call", "lab owner"], "Stop contact qatoriga qarang.")
    ],
    debrief: "Yozma ruxsat faqat ko‘rsatilgan host, vaqt va non-destructive check’larni qamrab oladi; production, credential guessing va service disruption aniq taqiqlangan. Scope tugasa yoki ta’sir kuzatilsa to‘xtab, sponsor bilan qayta tasdiqlang."
  }
];

export const careerLearningLabs: LabDef[] = cases;
