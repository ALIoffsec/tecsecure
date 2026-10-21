import { normalizeLearningAnswer } from "@/lib/learning-completion";

export type LabTask = { id: string; prompt: string; answers: string[]; hint: string };
export type LabDef = {
  slug: string;
  moduleSlug: string;
  title: string;
  level: "boshlang‘ich" | "o‘rta" | "ilg‘or";
  minutes: number;
  priceTec: number;
  summary: string;
  scenario: string;
  skills: string[];
  evidence: { name: string; content: string }[];
  tasks: LabTask[];
  debrief: string;
};
export type PublicLab = Omit<LabDef, "tasks"> & { tasks: Omit<LabTask, "answers">[] };

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function clock(totalSeconds: number) {
  return `${pad(Math.floor(totalSeconds / 3600) % 24)}:${pad(Math.floor(totalSeconds / 60) % 60)}:${pad(totalSeconds % 60)}`;
}

function sshLab(): LabDef {
  const attacker = "185.220.101.47";
  const users = ["admin", "root", "test", "oracle", "ubuntu", "postgres", "git", "backup"];
  const lines: string[] = [];
  let seconds = 3 * 3600 + 11 * 60 + 2;
  let failed = 0;
  lines.push(`Mar 14 02:41:17 srv01 sshd[2210]: Accepted publickey for deploy from 10.0.5.20 port 51044 ssh2`);
  for (let i = 0; i < 34; i++) {
    const user = users[i % users.length];
    const invalid = user !== "root" && user !== "backup" && user !== "git";
    seconds += 1 + (i * 3) % 4;
    lines.push(`Mar 14 ${clock(seconds)} srv01 sshd[${2301 + i}]: Failed password for ${invalid ? "invalid user " : ""}${user} from ${attacker} port ${40100 + i * 7} ssh2`);
    failed++;
    if (i === 11) lines.push(`Mar 14 ${clock(seconds)} srv01 sshd[2299]: Failed password for deploy from 10.0.5.20 port 51207 ssh2`);
  }
  seconds += 6;
  const successAt = clock(seconds);
  lines.push(`Mar 14 ${successAt} srv01 sshd[2360]: Accepted password for backup from ${attacker} port 40411 ssh2`);
  lines.push(`Mar 14 ${clock(seconds + 2)} srv01 sshd[2360]: pam_unix(sshd:session): session opened for user backup by (uid=0)`);
  lines.push(`Mar 14 ${clock(seconds + 40)} srv01 sudo:   backup : TTY=pts/0 ; PWD=/home/backup ; USER=root ; COMMAND=/bin/cat /etc/shadow`);
  return {
    slug: "ssh-bruteforce-auth-log",
    moduleSlug: "soc-log-analysis",
    title: "SSH brute-force hujumini auth.log’dan topish",
    level: "boshlang‘ich",
    minutes: 25,
    priceTec: 20,
    summary: "Haqiqiy ko‘rinishdagi /var/log/auth.log ni tahlil qilib, hujumchi, buzilgan akkaunt va vaqtni aniqlaysiz.",
    scenario: "Tungi soat 03:00 atrofida monitoring srv01 serverda g‘ayrioddiy SSH faolligini ko‘rsatdi. Sizga auth.log parchasi berilgan. SOC tahlilchisi sifatida hodisani tahlil qiling.",
    skills: ["auth.log o‘qish", "brute-force belgilari", "kompromet bo‘lgan akkauntni aniqlash"],
    evidence: [
      { name: "/var/log/auth.log", content: lines.join("\n") },
      { name: "/etc/ssh/sshd_config (parcha)", content: "Port 22\nPermitRootLogin no\nPasswordAuthentication yes\nMaxAuthTries 6\nPubkeyAuthentication yes" }
    ],
    tasks: [
      { id: "ip", prompt: "Eng ko‘p muvaffaqiyatsiz urinish qilgan tashqi IP manzilni yozing.", answers: [attacker], hint: "Failed password qatorlaridagi 'from' maydonini sanang; 10.0.x.x ichki manzil." },
      { id: "count", prompt: "Shu IP dan nechta 'Failed password' qatori bor?", answers: [String(failed)], hint: "Faqat hujumchi IP ga tegishli qatorlarni sanang, deploy foydalanuvchisinikini kiritmang." },
      { id: "account", prompt: "Hujumchi qaysi akkaunt orqali tizimga kirishga muvaffaq bo‘ldi? (foydalanuvchi nomi)", answers: ["backup"], hint: "'Accepted password' qatorini qidiring." },
      { id: "time", prompt: "Hujumchining muvaffaqiyatli kirish vaqti (SS:DD:SS formatida)?", answers: [successAt], hint: "Accepted password qatorining vaqt belgisi." },
      { id: "fix", prompt: "Parol bilan kirishni butunlay o‘chirish uchun sshd_config dagi PasswordAuthentication qiymati qanday bo‘lishi kerak? (bitta so‘z)", answers: ["no"], hint: "Faqat kalit (publickey) orqali kirish qoldiriladi." }
    ],
    debrief: "Hujum sxemasi: ko‘p muvaffaqiyatsiz urinishlar ketma-ketligi ortidan bitta muvaffaqiyatli kirish va darhol /etc/shadow o‘qilishi — bu kompromet belgisi. Amaliyotda: akkauntni bloklash, parollarni almashtirish, fail2ban/rate limit va parol bilan kirishni o‘chirish."
  };
}

function nmapLab(): LabDef {
  const ports = [
    ["21/tcp", "open", "ftp", "vsftpd 2.3.4"],
    ["22/tcp", "open", "ssh", "OpenSSH 8.9p1 Ubuntu"],
    ["80/tcp", "open", "http", "Apache httpd 2.4.52"],
    ["139/tcp", "open", "netbios-ssn", "Samba smbd 4"],
    ["445/tcp", "open", "microsoft-ds", "Samba smbd 4"],
    ["3306/tcp", "open", "mysql", "MySQL 5.7.33"],
    ["8080/tcp", "closed", "http-proxy", ""],
    ["9100/tcp", "filtered", "jetdirect", ""]
  ];
  const open = ports.filter((port) => port[1] === "open").length;
  const body = ports.map((p) => `${p[0].padEnd(9)} ${p[1].padEnd(9)} ${p[2].padEnd(13)} ${p[3]}`).join("\n");
  return {
    slug: "nmap-scan-reading",
    moduleSlug: "intro-cybersecurity",
    title: "Nmap natijasini o‘qish va xavflarni baholash",
    level: "boshlang‘ich",
    minutes: 20,
    priceTec: 15,
    summary: "Skanerlash natijasidagi ochiq portlar va servis versiyalaridan xavf darajasini aniqlaysiz.",
    scenario: "Kompaniya ichki serveri 10.0.0.15 uchun nmap -sV skanerlash natijasi berilgan. Qaysi servislar xavf tug‘dirishini aniqlang.",
    skills: ["port holatlarini farqlash", "servis versiyalaridan xavf topish", "minimal ochiq sirt tamoyili"],
    evidence: [{ name: "nmap -sV 10.0.0.15", content: `Starting Nmap scan report for 10.0.0.15\nHost is up (0.0021s latency).\nPORT      STATE     SERVICE       VERSION\n${body}\nService Info: OS: Linux` }],
    tasks: [
      { id: "open", prompt: "Nechta port 'open' holatida?", answers: [String(open)], hint: "closed va filtered portlarni hisobga olmang." },
      { id: "ftp", prompt: "Ma’lum orqa eshigi (backdoor) bo‘lgan eski FTP servisi qaysi portda?", answers: ["21", "21/tcp"], hint: "vsftpd 2.3.4 versiyasi 2011-yilda zararli kod bilan tarqalgan." },
      { id: "db", prompt: "Internetga/ichki tarmoqqa ochiq turmasligi kerak bo‘lgan ma’lumotlar bazasi porti qaysi?", answers: ["3306", "3306/tcp"], hint: "MySQL standart porti." },
      { id: "smb", prompt: "Fayl almashish (SMB) uchun ishlatiladigan ikkita portdan kattasi qaysi?", answers: ["445", "445/tcp"], hint: "139 NetBIOS, ikkinchisi to‘g‘ridan-to‘g‘ri SMB." },
      { id: "filtered", prompt: "9100 porti qaysi holatda? (bitta so‘z)", answers: ["filtered"], hint: "Firewall paketlarni tashlab yuboryapti." }
    ],
    debrief: "filtered — firewall javob bermayapti, closed — host javob beryapti lekin servis yo‘q, open — servis tinglayapti. Minimal sirt tamoyili: kerak bo‘lmagan servislarni o‘chiring, bazani faqat kerakli manzillarga oching, eski versiyalarni yangilang."
  };
}

function subnetLab(): LabDef {
  return {
    slug: "subnet-vlsm-office",
    moduleSlug: "network-fundamentals",
    title: "Ofis tarmog‘ini VLSM bilan bo‘lish",
    level: "o‘rta",
    minutes: 35,
    priceTec: 20,
    summary: "192.168.10.0/24 blokini turli o‘lchamdagi bo‘limlarga bo‘lib, tarmoq/broadcast manzillarini hisoblaysiz.",
    scenario: "Ofisga 192.168.10.0/24 ajratilgan. Kerak: Sales — 50 host, IT — 25 host, Guests — 10 host, router orasidagi point-to-point havola — 2 host. Katta tarmoqdan boshlab, ketma-ket joylashtiring (VLSM).",
    skills: ["VLSM", "prefiks tanlash", "tarmoq va broadcast hisoblash"],
    evidence: [{ name: "Talablar", content: "Blok: 192.168.10.0/24\nSales  : 50 host\nIT     : 25 host\nGuests : 10 host\nP2P    : 2 host\nTartib : katta -> kichik, bo‘shliqsiz joylashtiring" }],
    tasks: [
      { id: "sales", prompt: "Sales (50 host) uchun eng mos prefiks uzunligi? (masalan /27 ko‘rinishida)", answers: ["/26", "26", "255.255.255.192"], hint: "2^n - 2 >= 50 bo‘lgan eng kichik n; 6 bit host => 62 host." },
      { id: "it-net", prompt: "IT tarmog‘ining tarmoq manzili (Sales dan keyin birinchi bo‘sh blok, /27)?", answers: ["192.168.10.64", "192.168.10.64/27"], hint: "Sales 0–63 ni egallaydi." },
      { id: "it-last", prompt: "IT tarmog‘idagi oxirgi foydalanish mumkin bo‘lgan host manzili?", answers: ["192.168.10.94"], hint: "/27 blok 32 manzil: 64–95; 95 — broadcast." },
      { id: "guest-bc", prompt: "Guests (/28) tarmog‘ining broadcast manzili?", answers: ["192.168.10.111"], hint: "Guests 96 dan boshlanadi, /28 = 16 manzil." },
      { id: "p2p", prompt: "P2P havola uchun prefiks uzunligi va tarmoq manzili qaysi? (prefiksni yozing, masalan /29)", answers: ["/30", "30"], hint: "2 ta host uchun 2 bit host maydoni yetadi." }
    ],
    debrief: "Natija: Sales 192.168.10.0/26, IT 192.168.10.64/27, Guests 192.168.10.96/28, P2P 192.168.10.112/30. Katta bloklardan boshlash manzillar parchalanib ketishining oldini oladi."
  };
}

function linuxLab(): LabDef {
  return {
    slug: "linux-permissions-audit",
    moduleSlug: "linux-fundamentals",
    title: "Linux server ruxsatlari auditi",
    level: "boshlang‘ich",
    minutes: 30,
    priceTec: 20,
    summary: "Fayl ruxsatlari, SUID, UID 0 va sudoers qoidalaridan xavfli sozlamalarni topasiz.",
    scenario: "Yangi qabul qilingan serverda xavfsizlik auditi o‘tkazyapsiz. Quyidagi chiqishlar buyruqlardan olingan.",
    skills: ["ls -l ruxsatlarini o‘qish", "SUID xavfi", "UID 0 akkauntlar", "sudoers tahlili"],
    evidence: [
      { name: "ls -l /opt/app", content: "-rw-r--r-- 1 root root  1204 Feb  2 10:11 README.txt\n-rw-rw-rw- 1 app  app    388 Feb  9 08:40 db.conf\n-rwxr-x--- 1 app  app   9120 Feb  2 10:11 run.sh\n-rw-r----- 1 root app    211 Feb  2 10:11 secrets.env" },
      { name: "find / -perm -4000 -type f", content: "/usr/bin/passwd\n/usr/bin/sudo\n/usr/bin/mount\n/usr/bin/find\n/usr/bin/chsh" },
      { name: "awk -F: '$3==0' /etc/passwd", content: "root:x:0:0:root:/root:/bin/bash\nsvc_admin:x:0:0::/home/svc_admin:/bin/bash" },
      { name: "/etc/sudoers (parcha)", content: "root    ALL=(ALL:ALL) ALL\n%admin  ALL=(ALL) ALL\ndeploy  ALL=(ALL) NOPASSWD: ALL\nbackup  ALL=(root) NOPASSWD: /usr/bin/rsync" }
    ],
    tasks: [
      { id: "world", prompt: "Hamma yozishi mumkin bo‘lgan (world-writable) fayl nomi?", answers: ["db.conf", "/opt/app/db.conf"], hint: "Oxirgi uch belgida 'w' (yozish) biti bor fayl." },
      { id: "octal", prompt: "secrets.env faylining ruxsati sakkizlik (octal) ko‘rinishda?", answers: ["640"], hint: "rw- r-- --- = 6 4 0; bu yerda -rw-r-----." },
      { id: "suid", prompt: "Odatda SUID bo‘lmasligi kerak va ildiz huquqini olishga yo‘l ochadigan binar qaysi? (nomi)", answers: ["find", "/usr/bin/find"], hint: "GTFOBins ro‘yxatida bor: find -exec orqali shell ochish mumkin." },
      { id: "uid0", prompt: "root dan tashqari UID 0 ga ega akkaunt nomi?", answers: ["svc_admin"], hint: "UID 0 = to‘liq administrator." },
      { id: "sudo", prompt: "Parolsiz hamma buyruqni bajara oladigan foydalanuvchi?", answers: ["deploy"], hint: "NOPASSWD: ALL." }
    ],
    debrief: "Tuzatishlar: chmod 640 db.conf; chmod u-s /usr/bin/find; svc_admin akkauntini o‘chirish yoki UID ni o‘zgartirish; deploy uchun faqat kerakli buyruqlarga NOPASSWD berish (eng kam huquq tamoyili)."
  };
}

function firewallLab(): LabDef {
  return {
    slug: "firewall-ruleset-review",
    moduleSlug: "firewall-zero-to-hero",
    title: "Firewall qoidalar ro‘yxatini tekshirish",
    level: "o‘rta",
    minutes: 30,
    priceTec: 30,
    summary: "Tartiblangan qoidalar ichidan xavfli ochiq xizmatni va soyalangan qoidani topasiz.",
    scenario: "Perimetr firewall qoidalari yuqoridan pastga tekshiriladi; birinchi mos kelgan qoida ishlaydi. Audit uchun qoidalar chiqarib olindi.",
    skills: ["qoida tartibi", "shadowed rule", "RDP ni ochiq qoldirish xavfi", "default deny"],
    evidence: [{ name: "WAN -> LAN rules", content: "#  ACTION  PROTO  SRC            DST          DPORT\n1  allow   any    ESTABLISHED    any          -\n2  allow   icmp   10.0.0.0/24    10.0.0.1     -\n3  allow   tcp    10.0.0.0/24    10.0.0.1     22\n4  allow   tcp    any            10.0.0.15    3389\n5  allow   any    any            any          any\n6  deny    any    any            any          any   (log)" }],
    tasks: [
      { id: "rdp", prompt: "Internetdagi istalgan manzildan RDP ga ruxsat bergan qoida raqami?", answers: ["4"], hint: "3389 — RDP porti, manba 'any'." },
      { id: "shadow", prompt: "6-qoidani hech qachon ishlamaydigan qilib qo‘yadigan qoida raqami?", answers: ["5"], hint: "any→any ruxsati undan keyingi hammasini yopib qo‘yadi." },
      { id: "port", prompt: "Internetga ochilgan xavfli port raqami?", answers: ["3389"], hint: "Windows masofaviy ish stoli." },
      { id: "ssh-src", prompt: "SSH (22) ga faqat qaysi manba tarmog‘idan ruxsat berilgan?", answers: ["10.0.0.0/24"], hint: "3-qoida manbasi." },
      { id: "default", prompt: "Oxirgi qoida bo‘lishi kerak bo‘lgan standart siyosat nomi (bitta so‘z: allow yoki deny)?", answers: ["deny", "drop"], hint: "Default deny — ruxsat berilmagan hamma narsa taqiqlanadi." }
    ],
    debrief: "Tuzatish: 5-qoidani o‘chirish, 4-qoidani VPN orqali yoki aniq manzillarga cheklash, default deny ni saqlash. Qoida tartibi — xavfsizlikning bir qismi."
  };
}

function webLab(): LabDef {
  const attacker = "203.0.113.66";
  const ua = "sqlmap/1.7.2#stable (https://sqlmap.org)";
  const lines: string[] = [];
  let unions = 0;
  let sec = 14 * 3600 + 22 * 60;
  const normal = [["198.51.100.8", "/index.php?page=home", 200, 5120], ["198.51.100.23", "/product.php?id=14", 200, 3380], ["192.0.2.51", "/about.php", 200, 2041]];
  const payloads = [
    "id=14'", "id=14' OR '1'='1", "id=14 UNION SELECT NULL,NULL,NULL-- -", "id=14 UNION SELECT username,password,3 FROM users-- -",
    "id=14 AND SLEEP(5)", "id=14 union select table_name,2,3 from information_schema.tables-- -", "id=14' ORDER BY 4-- -"
  ];
  for (let i = 0; i < 14; i++) {
    const n = normal[i % normal.length];
    sec += 17;
    lines.push(`${n[0]} - - [14/Mar/2026:${clock(sec)} +0500] "GET ${n[1]} HTTP/1.1" ${n[2]} ${n[3]} "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"`);
    if (i % 2 === 0) {
      const payload = payloads[(i / 2) % payloads.length];
      const dump = payload.includes("username,password");
      if (payload.toLowerCase().includes("union")) unions++;
      sec += 2;
      lines.push(`${attacker} - - [14/Mar/2026:${clock(sec)} +0500] "GET /product.php?${encodeURI(payload).replace(/'/g, "%27")} HTTP/1.1" ${dump ? 200 : payload.includes("SLEEP") ? 200 : 500} ${dump ? 48211 : 612} "-" "${ua}"`);
    }
  }
  return {
    slug: "web-sqli-access-log",
    moduleSlug: "web-security-owasp",
    title: "SQL injection hujumini web log’dan aniqlash",
    level: "o‘rta",
    minutes: 30,
    priceTec: 25,
    summary: "nginx access log ichidan SQL injection urinishlari, vosita va ma’lumot sizib chiqishini topasiz.",
    scenario: "Mahsulot sahifasi sekinlashgani haqida shikoyat tushdi. Web server access log tekshirilmoqda.",
    skills: ["access log tahlili", "SQLi belgilarini topish", "User-Agent orqali vosita aniqlash", "ma’lumot sizib chiqishini baholash"],
    evidence: [{ name: "/var/log/nginx/access.log", content: lines.join("\n") }],
    tasks: [
      { id: "ip", prompt: "SQL injection urinishlarini yuborgan IP manzil?", answers: [attacker], hint: "UNION, OR '1'='1, SLEEP kabi so‘rovlar." },
      { id: "tool", prompt: "User-Agent da ko‘ringan avtomatik hujum vositasi nomi?", answers: ["sqlmap"], hint: "User-Agent maydonini o‘qing." },
      { id: "param", prompt: "Zaif bo‘lgan GET parametr nomi?", answers: ["id"], hint: "Hujumchi o‘zgartiradigan parametr." },
      { id: "unions", prompt: "Hujumchi so‘rovlarining nechtasida UNION SELECT (katta-kichik harfdan qat’i nazar) bor?", answers: [String(unions)], hint: "Faqat hujumchi IP dan kelgan qatorlar; 'union select' ham sanaladi." },
      { id: "dump", prompt: "Foydalanuvchi jadvalidan ma’lumot sizib chiqqanini ko‘rsatadigan javob hajmi (bayt, eng katta son)?", answers: ["48211"], hint: "Oddiy javoblar 2–5 KB; keskin katta javobni qidiring." }
    ],
    debrief: "Himoya: parametrli so‘rovlar (prepared statements), WAF, kirish validatsiyasi, DB foydalanuvchisiga minimal huquq va xatolarni foydalanuvchiga ko‘rsatmaslik. 500 xatolar ketma-ketligi va User-Agent: sqlmap — odatiy belgi."
  };
}

function windowsLab(): LabDef {
  const attackerIp = "10.20.30.77";
  const targets = ["a.aliyev", "b.rahimov", "d.tursunov", "f.nazarov", "g.ismoilov", "h.saidov", "j.karimov", "k.yusupov", "m.abdullayev", "n.sobirov", "o.qodirov", "s.ergashev"];
  const rows: string[] = ["Time      EventID  Account        LogonType  SourceIP       Status"];
  let sec = 9 * 3600 + 4 * 60;
  rows.push(`${clock(sec)}  4624     r.hamidov      2          127.0.0.1      Success`);
  targets.forEach((user, index) => {
    sec += 3;
    if (user === "j.karimov") {
      rows.push(`${clock(sec)}  4625     ${user.padEnd(14)} 3          ${attackerIp.padEnd(14)} Failure 0xC000006A`);
      return;
    }
    rows.push(`${clock(sec)}  4625     ${user.padEnd(14)} 3          ${attackerIp.padEnd(14)} Failure 0xC000006A`);
    if (index === 5) rows.push(`${clock(sec + 1)}  4625     z.nobody       3          10.20.30.12    Failure 0xC0000064`);
  });
  sec += 4;
  rows.push(`${clock(sec)}  4624     j.karimov      3          ${attackerIp.padEnd(14)} Success`);
  return {
    slug: "windows-password-spray",
    moduleSlug: "active-directory-security",
    title: "Active Directory’da password spray hujumi",
    level: "ilg‘or",
    minutes: 35,
    priceTec: 30,
    summary: "Windows Security hodisalaridan password spray ni brute-force dan farqlab, buzilgan akkauntni topasiz.",
    scenario: "Domain kontrollerdan Security jurnali (4624 — muvaffaqiyatli, 4625 — muvaffaqiyatsiz kirish) olindi. Bitta IP dan g‘ayrioddiy faollik gumon qilinmoqda.",
    skills: ["4624/4625 hodisalari", "logon type", "password spray belgilari", "kompromet bo‘lgan akkaunt"],
    evidence: [{ name: "Security.evtx (eksport)", content: rows.join("\n") }],
    tasks: [
      { id: "ip", prompt: "Ko‘p akkauntga muvaffaqiyatsiz urinish qilgan manba IP?", answers: [attackerIp], hint: "Bitta IP, ko‘p turli akkaunt = password spray." },
      { id: "count", prompt: "Shu IP nechta turli akkauntga urinib ko‘rgan?", answers: [String(targets.length)], hint: "Faqat shu IP dan kelgan 4625 qatorlaridagi akkaunt nomlari." },
      { id: "account", prompt: "Spray dan keyin muvaffaqiyatli kirilgan akkaunt?", answers: ["j.karimov"], hint: "4624 qatori, manba — o‘sha IP." },
      { id: "event", prompt: "Muvaffaqiyatsiz kirish hodisasi ID si?", answers: ["4625"], hint: "4624 — muvaffaqiyatli." },
      { id: "type", prompt: "Hujumchi kirishining Logon Type qiymati (tarmoq orqali kirish)?", answers: ["3"], hint: "Type 3 = Network; 2 = interaktiv." }
    ],
    debrief: "Password spray — bitta oddiy parolni ko‘p akkauntda sinash, shuning uchun akkaunt bloklanmaydi. Himoya: MFA, parol siyosati va taqiqlangan parollar ro‘yxati, bir IP dan ko‘p 4625 uchun ogohlantirish, kirish vaqtlarini nazorat qilish."
  };
}

function mikrotikLab(): LabDef {
  const services = [["telnet", 23, "no"], ["ftp", 21, "no"], ["www", 80, "no"], ["ssh", 22, "no"], ["www-ssl", 443, "yes"], ["api", 8728, "no"], ["api-ssl", 8729, "yes"], ["winbox", 8291, "no"]];
  const enabled = services.filter((s) => s[2] === "no").length;
  return {
    slug: "mikrotik-config-review",
    moduleSlug: "mikrotik-routeros-basics",
    title: "MikroTik konfiguratsiyasini xavfsizlik nuqtai nazaridan ko‘rib chiqish",
    level: "o‘rta",
    minutes: 30,
    priceTec: 25,
    summary: "RouterOS eksportidan ochiq xizmatlar, parolsiz akkaunt va yetishmayotgan firewall qoidalarini topasiz.",
    scenario: "Yangi mijoz routeri /export bilan olindi. Uni ishga tushirishdan oldin xavfsizlikni tekshiring.",
    skills: ["/ip service", "/user", "input chain firewall", "xavfsiz boshqaruv"],
    evidence: [{ name: "/export (parcha)", content: `/ip service\n${services.map((s) => `set ${s[0]} port=${s[1]} disabled=${s[2]}`).join("\n")}\n\n/user\nadd name=admin group=full password=""\nadd name=noc group=read password="***"\n\n/ip firewall filter\nadd chain=forward action=accept connection-state=established,related\nadd chain=forward action=drop connection-state=invalid\nadd chain=forward action=accept in-interface-list=LAN\n\n/ip firewall nat\nadd chain=srcnat action=masquerade out-interface=ether1` }],
    tasks: [
      { id: "enabled", prompt: "Nechta xizmat yoqilgan (disabled=no)?", answers: [String(enabled)], hint: "disabled=no — yoqilgan." },
      { id: "plain", prompt: "Shifrlanmagan, eng xavfli masofaviy boshqaruv xizmati porti?", answers: ["23"], hint: "telnet — parol ochiq yuboriladi." },
      { id: "nopass", prompt: "Parolsiz akkaunt nomi?", answers: ["admin"], hint: "password=\"\"." },
      { id: "chain", prompt: "Routerning o‘zini himoya qiladigan, konfiguratsiyada yo‘q firewall chain nomi?", answers: ["input"], hint: "forward — o‘tuvchi trafik; routerning o‘ziga kelgan trafik boshqa chainda." },
      { id: "winbox", prompt: "Winbox porti raqami?", answers: ["8291"], hint: "/ip service ro‘yxati." }
    ],
    debrief: "Tuzatish: telnet/ftp/www/api o‘chirish, admin ga kuchli parol berish yoki akkauntni almashtirish, input chain da faqat boshqaruv tarmog‘iga ruxsat berib qolganini drop qilish, winbox ni faqat ishonchli manzillardan ochish."
  };
}

export const learningLabs: LabDef[] = [sshLab(), nmapLab(), subnetLab(), linuxLab(), firewallLab(), webLab(), windowsLab(), mikrotikLab()];

export const getLab = (slug: string) => learningLabs.find((lab) => lab.slug === slug);

export function toPublicLab(lab: LabDef): PublicLab {
  return { ...lab, tasks: lab.tasks.map(({ id, prompt, hint }) => ({ id, prompt, hint })) };
}

export function isLabAnswerCorrect(task: LabTask, response: string) {
  const normalized = normalizeLearningAnswer(response);
  return normalized.length > 0 && task.answers.some((answer) => normalizeLearningAnswer(answer) === normalized);
}
