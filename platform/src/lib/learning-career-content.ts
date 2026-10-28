import type { Category, LearningModule, LearningPath, LearningReference, LearningSection, Localized } from "./learning-demo";

const l = (uz: string): Localized => ({ uz, ru: uz, en: uz });

type Chapter = {
  title: string;
  content: string;
  example: string;
  explanation: string;
  prompt: string;
  answers: string[];
};

type Book = {
  slug: string;
  title: string;
  summary: string;
  category: Category;
  difficulty: LearningModule["difficulty"];
  hours: number;
  labPlan: string;
  references: LearningReference[];
  chapters: Chapter[];
};

const reference = (label: string, href: string): LearningReference => ({ label: l(label), href });
const section = (chapter: Chapter): LearningSection => ({
  title: l(chapter.title),
  content: l(chapter.content),
  example: l(chapter.example),
  exampleExplanation: l(chapter.explanation),
  question: { prompt: l(chapter.prompt), answers: chapter.answers }
});

function book(data: Book): LearningModule {
  return {
    slug: data.slug,
    title: l(data.title),
    summary: l(data.summary),
    difficulty: data.difficulty,
    category: data.category,
    hours: data.hours,
    hasLab: true,
    labPlan: l(data.labPlan),
    references: data.references,
    sections: data.chapters.map(section)
  };
}

export const careerLearningModules: LearningModule[] = [
  book({
    slug: "computer-science-core",
    title: "Kompyuter fanlari: asoslardan tizimli fikrlashgacha",
    summary: "Bit, algoritm, operatsion tizim, tarmoq, ma’lumotlar bazasi, dasturiy ta’minot hayot sikli va tizim dizaynini juniordan senior darajadagi tahlilgacha bog‘laydigan darslik.",
    category: "systems", difficulty: "fundamental", hours: 42,
    labPlan: "Sintetik ma’lumotlar bilan bajariladigan 8 ta mashq: sanoq tizimlari, algoritm bahosi, jarayonlar, SQL tranzaksiyalari, API kuzatuvi va tizim dizayni qarorlari.",
    references: [
      reference("Harvard CS50x — kompyuter fanlariga kirish", "https://cs50.harvard.edu/x/"),
      reference("MIT OpenCourseWare 6.006 — algoritmlar", "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/"),
      reference("Nand2Tetris — kompyuter tizimlari", "https://www.nand2tetris.org/")
    ],
    chapters: [
      {
        title: "1. Ma’lumot qanday ifodalanadi: bitdan matn va faylgacha",
        content: "Kompyuter ma’lumotni bitlar ketma-ketligi sifatida saqlaydi. 8 bit bir bayt; 1 KiB odatda 1024 bayt, 1 kB esa 1000 baytni bildiradi, shuning uchun disk hajmi va xotira ko‘rsatkichlarini solishtirganda birlikni aniqlang. Ikkilik va o‘n oltilik sanoq tizimlari bit naqshlarini ixcham ifodalaydi; signed/unsigned butun sonlar, overflow va endianness qiymat talqinini o‘zgartiradi.\n\nMatn ham kodlash orqali baytlarga o‘giriladi: UTF-8 o‘zgaruvchan uzunlikdagi kodlash bo‘lib, Unicode belgilarining keng qismini ifodalaydi. Fayl nomi yoki matn noto‘g‘ri ko‘rinsa, baytlar yo‘qolgan deb darhol xulosa qilmang; kodlash, locale va dekoder zanjirini tekshiring. Bu bilim log, tarmoq paketi, xotira sarfi va disk hisobotlaridagi xatolarni tushunishga asos bo‘ladi.",
        example: "0x2A = 42 (o‘nlik); 42 = 00101010 (8 bit).\nUTF-8 faylni tekshirish: file report.txt\nFayl o‘lchami: wc -c report.txt",
        explanation: "Hex/binary konversiyani qo‘lda tekshiring; `wc -c` baytni sanaydi, matn belgilarini emas. Haqiqiy fayl bilan ishlashdan oldin nusxa oling va maxfiy ma’lumotni tashqi decoder saytlariga yubormang.",
        prompt: "8 bit qanday birlikni tashkil qiladi?",
        answers: ["1 bayt", "1 byte", "byte"]
      },
      {
        title: "2. Mantiq, ma’lumot tuzilmalari va algoritm murakkabligi",
        content: "Algoritm kirish ma’lumotini chiqishga aylantiruvchi aniq qadamlar ketma-ketligidir. Array indeks bilan tez murojaat beradi; linked list qo‘shish/o‘chirishni ayrim joylarda yengillashtiradi; hash table o‘rtacha holatda tez qidiradi, lekin collision va xotira sarfi bor; queue/FIFO va stack/LIFO turli navbat semantikasini beradi. Tuzilmani moda bo‘lgani uchun emas, ish yukiga mosligi uchun tanlang.\n\nBig O o‘sish tartibini tasvirlaydi: O(1), O(log n), O(n), O(n log n), O(n²). Bu aniq vaqt o‘lchovi emas; konstantalar, xotira, cache va real ma’lumot ham muhim. Senior darajada worst-case, amortized xarajat, input hajmi chegarasi va degradatsiya yo‘lini ko‘rsating. Hash collisionga chidamlilik, pagination va resurs limitlari ishlab chiqarish xizmatini haddan tashqari yuklanishdan himoya qilishga yordam beradi.",
        example: "Kichik to‘plamni tartiblash: O(n log n) algoritmni baholang.\nRo‘yxatda ketma-ket qidiruv: O(n).\nHash table’da qidiruv: o‘rtacha O(1), eng yomon holatni ham hujjatlashtiring.",
        explanation: "Bu baholar algoritm va ma’lumot tuzilmasi haqidagi tahlil; ularni benchmark bilan tasdiqlang. Maxfiy yoki katta ishlab chiqarish ma’lumotlarini o‘quv muhitiga ko‘chirmang.",
        prompt: "n elementni bir marta ko‘rib chiqadigan algoritmning chiziqli murakkabligi qanday yoziladi?",
        answers: ["o(n)", "on", "linear"]
      },
      {
        title: "3. Operatsion tizim: jarayon, thread, xotira va fayl",
        content: "Jarayon — izolyatsiyalangan manzil maydoni va resurslarga ega ishlayotgan dastur; thread esa jarayon ichidagi bajarilish oqimi bo‘lib, xotirani boshqa threadlar bilan bo‘lishadi. Scheduler CPU vaqtini taqsimlaydi. Virtual xotira jarayonga uzluksiz manzil maydoni ko‘rsatadi, lekin fizik RAM sahifalar orqali boshqariladi; page fault har doim xato emas, ammo doimiy swapping unumdorlikni pasaytirishi mumkin.\n\nFayl tizimi nom, metadata va bloklarni boshqaradi. File descriptor, inode, mount, buffer va permission tushunchalari Linux/Unix’da nosozlik qidirishga yordam beradi; Windows’da handle, NTFS ACL va service identity muhim. Tizim muammosida CPU, RAM, disk I/O, process count va loglarni bir vaqtda kuzating. Bir metrikaning o‘zi sababni isbotlamaydi; vaqt oralig‘i va o‘zgarishlar tarixini bog‘lang.",
        example: "Linux: ps -eo pid,ppid,stat,%cpu,%mem,comm --sort=-%cpu | head\nLinux: free -h; df -h\nWindows: Get-Process | Sort-Object CPU -Descending | Select-Object -First 5",
        explanation: "Buyruqlar kuzatuv uchun; natijada foydalanuvchi nomlari yoki jarayon argumentlarida sirlar bo‘lishi mumkin. Hisobot ulashishdan oldin ularni niqoblang.",
        prompt: "Bir jarayon ichida umumiy manzil maydonini bo‘lishadigan bajarilish oqimi nima?",
        answers: ["thread", "oqim", "ip"]
      },
      {
        title: "4. Tarmoq va taqsimlangan tizimlar: kechikish, xato va izchillik",
        content: "Taqsimlangan xizmatlar tarmoq orqali aloqa qiluvchi mustaqil tugunlardan tuziladi. Tarmoq ishonchsiz: paket yo‘qolishi, timeout, kechikish, takroriy so‘rov va qisman uzilish sodir bo‘ladi. Shuning uchun timeout, retry backoff, idempotency key va circuit breaker kabi naqshlarni ongli tanlang; cheksiz retry xizmatdagi tiqilishni kuchaytirishi mumkin.\n\nCAP va consistency atamalarini soddalashtirib noto‘g‘ri qo‘llamang. Tizim bo‘limlanishi (partition) paytida izchillik va mavjudlik qarori mahsulot talabiga bog‘liq; eventual consistency foydalanuvchi tajribasida kechikishni anglatishi mumkin. DNS, TCP, TLS, load balancer va service discovery qatlamlarini alohida tekshiring. Senior dizayn hujjatida SLO, xato budjeti, ishdan chiqish domenlari, ma’lumot yo‘qotish limiti va tiklanish vaqti aniq bo‘lsin.",
        example: "So‘rov oqimi: client → DNS → load balancer → service → database.\nHar bir hop uchun timeout, retry soni, request ID va mas’uliyatni yozing.",
        explanation: "Bu model arxitektura muhokamasi uchun. Haqiqiy xizmatda o‘zgarishni staging, monitoring, rollback va tasdiqlangan change window bilan bajaring.",
        prompt: "Bir so‘rov takror yuborilganda natijani xavfsiz takrorlanadigan qiluvchi xususiyat?",
        answers: ["idempotency", "idempotentlik", "idempotent"]
      },
      {
        title: "5. Ma’lumotlar bazasi: SQL, tranzaksiya va yaxlitlik",
        content: "Relatsion ma’lumotlar bazasi jadvallarni kalit va constraintlar bilan bog‘laydi. Primary key qatorni aniqlaydi; foreign key munosabatni saqlaydi; unique/check constraint noto‘g‘ri holatni saqlashga yo‘l qo‘ymaydi. Index o‘qishni tezlashtirishi mumkin, ammo yozishni va disk sarfini oshiradi; query plan va real ish yukini o‘lchang.\n\nACID tranzaksiyalari atomicity, consistency, isolation, durability xususiyatlarini beradi. Isolation darajasi parallel o‘qish/yozishda ko‘rinadigan holatni belgilaydi; deadlock bo‘lsa, retry siyosati chegaralangan bo‘lsin. Backup faqat fayl yaratish emas: restore sinovi, RPO/RTO, shifrlash, kalitlar, retention va ajratilgan hisoblar bilan to‘liq tiklash jarayonidir. SQL injectiondan himoyalanish uchun parametrli so‘rov ishlating; foydalanuvchi kiritgan matnni so‘rovga biriktirmang.",
        example: "SELECT status, COUNT(*) FROM tickets GROUP BY status;\n-- Parametrli so‘rov misoli: SELECT * FROM users WHERE email = ?",
        explanation: "Misollar sintetik jadvalga mo‘ljallangan. `SELECT *` va shaxsiy ma’lumotlarni logga chiqarishni ishlab chiqarishda cheklang; parametr nomi driverga qarab farq qiladi.",
        prompt: "SQL qiymatlarini so‘rov matniga qo‘shmasdan uzatish usuli?",
        answers: ["parametrli so‘rov", "prepared statement", "parameterized query", "bind parameter"]
      },
      {
        title: "6. Dasturiy ta’minot hayot sikli, Git, test va xatoni izlash",
        content: "Ishonchli jamoa talabni yozadi, kichik o‘zgarish kiritadi, code review va avtomatlashtirilgan testdan o‘tkazadi, keyin nazoratli deploy qiladi. Git commit tarixni beradi, lekin noto‘g‘ri secret commit qilingan bo‘lsa, uni o‘chirishning o‘zi credentialni bekor qilmaydi. Secretlarni secret managerda saqlang; `.env` faylini repoga qo‘shmang.\n\nUnit test kichik funksiyani, integration test komponentlar chegarasini, end-to-end test foydalanuvchi oqimini tekshiradi. Testlar kuzatiladigan talab va rollback qarorini qo‘llab-quvvatlaydi; faqat coverage foizi sifat kafolati emas. Bugni takrorlash qadami, kutilgan/haqiqiy holat, minimal reproducer va log vaqtini yozing. Senior review’da backward compatibility, migratsiya, observability, xavfsizlik, accessibility va operatsion yukni ham baholang.",
        example: "Git tarixini ko‘rish: git log --oneline --decorate -10\nO‘zgarishni tekshirish: git diff --check\nPull request rubrikasi: correctness, tests, security, rollback, observability.",
        explanation: "Bu misollar lokal repoda o‘qish va format tekshiruvini bajaradi. Secret topilsa, uni public issue yoki logga qo‘ymang; tegishli egaga xabar bering va credentialni rotate qiling.",
        prompt: "Tashqi xizmatlar yoki komponentlar o‘rtasidagi integratsiyani tekshiruvchi test turi?",
        answers: ["integration test", "integratsion test"]
      },
      {
        title: "7. Tizim dizayni va senior muhandisning qaror yozuvi",
        content: "Senior muhandis faqat diagramma chizmaydi: talab, taxmin, yuk profili, ishonch chegarasi, ma’lumot tasnifi, failure mode va operatsion egani aniqlaydi. Architecture Decision Record (ADR) qaror, ko‘rib chiqilgan variant, sabab, oqibat va qayta ko‘rish shartini qayd etadi. Bu hujjat kelajakdagi jamoaga kontekst beradi va yashirin qarorni kamaytiradi.\n\nCapacity planningda o‘rtacha va peak yuk, o‘sish sur’ati, storage retention, tarmoq chiqimi va recovery nusxasini hisoblang. SLO foydalanuvchi sezadigan ishonchlilik maqsadini ifodalaydi; alertlar foydalanuvchiga ta’sirga bog‘langan bo‘lsin. Tizim dizaynini kichik boshlang, lekin partition, region yo‘qolishi, ma’lumotni o‘chirish, vendor lock-in va xavfsizlik hodisasiga javobni rejalashtiring. Har qarorni trade-off bilan himoya qiling.",
        example: "ADR: Kontekst → qaror → ko‘rib chiqilgan variantlar → xavflar → monitoring → rollback → qayta ko‘rish mezoni.",
        explanation: "Misol shablon; yakuniy arxitektura biznes, privacy va compliance egalarining tasdig‘ini talab qilishi mumkin.",
        prompt: "Arxitektura qarorining sababi va oqibatlarini qisqa qayd etuvchi hujjat?",
        answers: ["adr", "architecture decision record"]
      },
      {
        title: "8. Mas’uliyatli amaliyot, maxfiylik va bilimni isbotlash",
        content: "IT muhandisi foydalanuvchi ma’lumotlari va xizmatlar uzluksizligiga ta’sir qiladi. Eng kam vakolat, vazifalarni ajratish, audit izi, ma’lumotni minimallashtirish va aniq rozilik/huquqiy asos kabi tamoyillarni texnik dizaynga qo‘shing. Ish beruvchi portfolio yoki suhbatda faqat sertifikatni emas, qaror jarayoni, noaniqlikni qanday boshqarganingiz va xatodan nimani o‘rganganingizni ham so‘rashi mumkin.\n\nPortfolio loyihasida faqat sintetik yoki ruxsatli ma’lumot ishlating; real ish beruvchi logi, mijoz nomi, credential va zaiflik tafsilotini oshkor qilmang. README’da maqsad, arxitektura, threat model, test, cheklov, xavfsiz ishga tushirish, natija va keyingi yaxshilashni yozing. Ishga tayyorlik kurs tugatish bilan kafolatlanmaydi; ko‘nikma muntazam mustaqil amaliyot va tajriba bilan shakllanadi.",
        example: "Portfolio README: maqsad / scope / diagramma / testlar / xavfsizlik cheklovlari / tiklash / o‘rganilgan saboq.",
        explanation: "Ko‘rsatish uchun sintetik data va ataylab ajratilgan lokal muhitdan foydalaning; ish beruvchi yoki mijozga tegishli materialni ommaga chiqarmang.",
        prompt: "Ruxsat etilgan hajmdan tashqaridagi tizimni tekshirishdan oldin nimani olish shart?",
        answers: ["yozma ruxsat", "yozma vakolat", "written authorization", "authorization"]
      }
    ]
  }),
  book({
    slug: "linux-systems-administration",
    title: "Linux tizim administratsiyasi va ishonchli operatsiyalar",
    summary: "Linux serverni o‘rnatishdan incident response va senior operatsion boshqaruvigacha: foydalanuvchi, systemd, storage, tarmoq, hardening, monitoring va tiklash.",
    category: "systems", difficulty: "medium", hours: 36,
    labPlan: "Izolyatsiyalangan VM yoki berilgan sintetik chiqishlarda Linux service, permission, disk, DNS, patch, backup va incident tahlili.",
    references: [
      reference("Red Hat Enterprise Linux 9 — xavfsizlikni mustahkamlash", "https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/security_hardening/index"),
      reference("systemd man pages", "https://www.freedesktop.org/software/systemd/man/latest/"),
      reference("Linux man-pages project", "https://man7.org/linux/man-pages/")
    ],
    chapters: [
      {
        title: "1. Shell, fayl tizimi va xavfsiz buyruq satri",
        content: "Shell buyruqlarni jarayonlarga aylantiradi, stdout/stderr oqimlarini yo‘naltiradi va pipeline orqali bog‘laydi. `/etc` konfiguratsiya, `/var/log` o‘zgaruvchan log, `/home` foydalanuvchi ma’lumoti, `/proc` va `/sys` esa yadro holatining virtual ko‘rinishlarini saqlaydi. Nisbiy va mutlaq yo‘lni ajrating; symbolic link va mount nuqtasi asl diskni yashirishi mumkin.\n\nAvval o‘qish buyruqlarini ishlating, keyin o‘zgarish rejasini tuzing. `sudo` bilan noma’lum skriptni pipe orqali bajarish, `rm -rf` yoki recursive permission o‘zgartirish noto‘g‘ri scope’da katta zarar yetkazadi. Har buyruqdan oldin target, shell expansion va rollbackni tekshiring. Terminal tarixiga token yoki parol yozmang.",
        example: "pwd; id; find /var/log -maxdepth 1 -type f -printf '%f\\n' | sort\nSkript matnini avval ko‘rish: sed -n '1,160p' ./maintenance.sh",
        explanation: "Ko‘rsatilgan buyruqlar faqat yo‘l, identifikator va fayl nomlarini o‘qiydi. Log faylining o‘zi maxfiy ma’lumot saqlashi mumkin; ruxsatsiz katalogni ko‘rmang.",
        prompt: "Linux’da joriy katalogning mutlaq yo‘lini ko‘rsatuvchi buyruq?",
        answers: ["pwd"]
      },
      {
        title: "2. Foydalanuvchi, guruh, sudo va ACL",
        content: "Har bir jarayon UID/GID va capability bilan ishlaydi; root barcha huquqlarni jamlagani uchun kundalik vazifani root sifatida bajarish xavfli. Fayl ruxsati egasi, guruh va boshqalarga read/write/execute beradi; directory’da execute katalog ichidan o‘tish huquqini bildiradi. ACL qo‘shimcha subjectlarga granular ruxsat beradi, ammo audit va troubleshootingni murakkablashtirishi mumkin.\n\nSudo siyosatini aniq buyruq va role bilan cheklang, umumiy admin akkauntdan qoching, privileged sessionlarni audit qiling. Umumiy hisob o‘rniga shaxsiy identity va vaqt bilan cheklangan elevation qo‘llang. `chmod 777` muammoni yashirishi mumkin, lekin maxfiylik va yaxlitlikni yo‘qotadi. Ruxsatni o‘zgartirishdan oldin owner, parent directory, service user va dastur talablarini aniqlang.",
        example: "id svc-report\nstat -c '%A %a %U:%G %n' /srv/report\ngetfacl /srv/report  # agar ACL vositasi o‘rnatilgan bo‘lsa",
        explanation: "Buyruqlar metadata va ACL’ni ko‘rsatadi, o‘zgartirmaydi. Haqiqiy user/group nomlari va yo‘llarini ommaviy hisobotdan olib tashlang.",
        prompt: "Linux’da foydalanuvchi va uning guruh a’zoligini ko‘rsatuvchi buyruq?",
        answers: ["id"]
      },
      {
        title: "3. systemd xizmatlari, jurnal va nosozlikni bartaraf etish",
        content: "systemd unit’lari service, socket, timer, mount va target kabi resurslarni ifodalaydi. `active` holati xizmat to‘g‘ri ishlayotganini kafolatlamaydi: health check, log, port, dependency va biznes so‘rovini ham tekshiring. Restart loop, noto‘g‘ri environment file, permission yoki disk to‘lishi ko‘p uchraydigan sabablar.\n\nJurnal yozuvlarini vaqt, unit va boot ID bilan filtrlab, hodisa oldi-keyinini solishtiring. Soat drift va timezone incident timeline’ni buzishi mumkin. Production restartni boshlashdan oldin ta’sir doirasi, active session, HA peer va rollbackni biling. O‘zgarishni change record bilan bog‘lang, sabab topilmaguncha takroriy restart orqali dalilni yo‘qotmang.",
        example: "systemctl status app.service --no-pager\njournalctl -u app.service --since '2026-01-01 10:00' --until '2026-01-01 10:15'",
        explanation: "Bu diagnostika namunasi; vaqt oralig‘ini sintetik yoki ruxsatli labga moslang. Jurnalda token, IP va foydalanuvchi ma’lumoti bo‘lsa, eksportdan oldin niqoblang.",
        prompt: "systemd xizmatining unit jurnalini o‘qishga mo‘ljallangan buyruq?",
        answers: ["journalctl"]
      },
      {
        title: "4. Disk, filesystem, mount va zaxira nusxa",
        content: "Storage incidentida filesystem to‘lishi, inode tugashi, blok qurilmasi xatosi, read-only mount va application log o‘sishini farqlang. `df` blok/inode ishlatilishini, `du` katalog hajmini, `lsblk` blok qurilma topologiyasini ko‘rsatadi. LVM hajmni moslashuvchan boshqaradi, lekin snapshot backup o‘rnini bosmaydi.\n\nBackup siyosati RPO — qabul qilinadigan ma’lumot yo‘qotish oynasi — va RTO — tiklash maqsad vaqti — bilan belgilanadi. Shifrlangan nusxada kalitni alohida, nazoratli saqlang; immutable/offline nusxa ransomware xavfini kamaytiradi. Backup muvaffaqiyatli tugashi restore ishlashini isbotlamaydi: muntazam restore drill va checksum tekshiruvi kerak.",
        example: "df -hT; df -i\nlsblk -f\nfind /var/log -xdev -type f -size +100M -printf '%s %p\\n' 2>/dev/null",
        explanation: "Misollar disk holatini o‘qiydi. `find` natijasi maxfiy yo‘l nomlarini chiqarishi mumkin; begona tizimlarda ishga tushirmang.",
        prompt: "Backup’dan tiklash uchun maqsadli maksimal vaqt qisqartmasi?",
        answers: ["rto"]
      },
      {
        title: "5. Tarmoq, DNS, vaqt va host firewall",
        content: "Server tarmog‘ini tekshirishda link, IP/prefix, default route, DNS, NTP, socket va ilova health check’ini qatlamma-qatlam solishtiring. DNS cache, split-horizon zone, resolver timeout va stale record noto‘g‘ri manzilga olib kelishi mumkin. TLS sertifikati, hostname, chain va vaqt birga tekshiriladi; soat noto‘g‘ri bo‘lsa sertifikat yoki Kerberos autentifikatsiyasi buzilishi mumkin.\n\nHost firewall siyosatini tarmoq firewall bilan birga ko‘ring. Default deny va minimal inbound/outbound ruxsat yaxshi boshlang‘ich nuqta, lekin SSH orqali o‘zingizni bloklamaslik uchun change window, console access, qoidalar review’i va rollback tayyor bo‘lsin. Listener’ni `ss` bilan aniqlang; zarur bo‘lmagan portni ochiq qoldirmang.",
        example: "ip addr; ip route; resolvectl status\nss -lntup\ngetent hosts service.example.test",
        explanation: "`.test` misol domeni laboratoriya uchun. `ss -p` process nomini ko‘rsatishi mumkin; ruxsatli hostdan tashqarida jarayon ma’lumotini yig‘mang.",
        prompt: "Linux’da TCP/UDP tinglovchi socketlarni ko‘rish uchun keng qo‘llanadigan vosita?",
        answers: ["ss"]
      },
      {
        title: "6. Patch, SSH, audit va MAC policy",
        content: "Hardening aktiv xizmatlarni inventarizatsiya qilish, xavfsizlik yangilanishi, SSH siyosati, log/audit va SELinux/AppArmor kabi mandatory access control’ni qamrab oladi. `PasswordAuthentication no` ni joriy qilishdan oldin kalitli kirish, break-glass akkaunt, console recovery va ikkinchi administrator sessiyasini tekshiring. SSH konfiguratsiyasi distro va include fayllariga qarab farqlanishi mumkin.\n\nPatchni xavfga qarab ustuvorlang: internetga ochiqlik, ekspluatatsiya dalili, aktiv qiymati, ta’sir, vendor mitigation va downtime oynasi. Versiya satri yakka o‘zi zaiflikni tasdiqlamaydi; backport va paket buildini tekshiring. Audit loglarida sinxron vaqt, retention va integrity nazorati bo‘lsin. Qoidabuzarliklarni hujjatlashtirib, tasdiqlangan exception va tugash sanasini belgilang.",
        example: "sshd -T | grep -E 'passwordauthentication|permitrootlogin'\nsestatus 2>/dev/null || aa-status 2>/dev/null\nsystemctl list-unit-files --state=enabled",
        explanation: "Buyruqlar effective sozlamalar va yoqilgan unit’larni tekshiradi; distroga qarab natija farq qiladi. Ishlab chiqarish konfiguratsiyasini auditdan keyin faqat tasdiqlangan change orqali o‘zgartiring.",
        prompt: "Linux’da SELinux holatini ko‘rsatadigan keng tarqalgan buyruq?",
        answers: ["sestatus"]
      },
      {
        title: "7. Bash/Ansible avtomatlashtirish va o‘zgarish nazorati",
        content: "Shell skript input, exit code, signal, quoting, locale va error handling’ni hisobga olishi kerak. `set -e` barcha edge case’ni hal qilmaydi; kritik buyruqlarni tekshirib, xato holatini aniq qaytaring. Idempotent automation bir xil holatni qayta qo‘llaganda kutilmagan qo‘shimcha o‘zgarish qilmaydi.\n\nAnsible kabi configuration management inventar, role, variable va handler yordamida desired state’ni boshqaradi. Secret’ni plain text inventory yoki CI logiga qo‘ymang; vault/secret store ishlating. Diff, check mode, peer review va staging’dan boshlang. Playbook o‘zgarishi reboot, paket versiyasi va servis uzilishiga olib kelishi mumkin; rollout batch, health gate va rollback yo‘lini rejalang.",
        example: "bash -n ./check.sh       # sintaksis tekshiruvi\nshellcheck ./check.sh  # mavjud bo‘lsa\nansible-playbook --syntax-check site.yml",
        explanation: "Tekshiruvlar skriptni bajarmaydi. Ansible syntax-check o‘zgarishlarni qo‘llamaydi; haqiqiy playbookni faqat tasdiqlangan, izolyatsiyalangan inventory’da sinang.",
        prompt: "Bir xil automation’ni qayta ishlatganda istalmagan yangi o‘zgarish yaratmaslik xususiyati?",
        answers: ["idempotency", "idempotentlik", "idempotent"]
      },
      {
        title: "8. Ishlab chiqarish hodisasi, postmortem va senior amaliyot",
        content: "Incident commander ta’sirni cheklash, xavfsiz tiklash, dalil saqlash va manfaatdor tomonlarga aniq xabar berishni muvofiqlashtiradi. Avval symptom va scope, keyin ehtimoliy sabab va tekshiruvni yozing; sababni taxmin sifatida belgilang. Log, metric, trace, deploy tarixi, dependency va tashqi provayder holatini bitta timeline’da bog‘lang.\n\nBlameless postmortem tizim sabablarini ochadi: alert yo‘qligi, runbook eskirishi, dependency single point, ownership noaniqligi yoki change failure. Har action uchun owner, muddat va tekshiriladigan natija belgilang. Senior administrator capacity, patch, backup restore, disaster recovery, access review va o‘zgarish tezligi o‘rtasida muvozanat saqlaydi; operatsiya xavfsizligi texnik chora bilan birga jamoa jarayonidir.",
        example: "Incident note: UTC vaqt / foydalanuvchi ta’siri / dalillar / taxminlar / containment / tiklash / keyingi ownerli vazifalar.",
        explanation: "Har doim vaqt zonasini ko‘rsating, maxfiy logni minimallashtiring va xulosani fakt bilan ajrating. Hujjatni tashkilotning incident siyosati bo‘yicha saqlang.",
        prompt: "Aybdor izlashga emas, tizim sabablarini yaxshilashga qaratilgan postmortem turi?",
        answers: ["blameless", "blameless postmortem", "ayblovsiz"]
      }
    ]
  }),
  book({
    slug: "windows-active-directory-operations",
    title: "Windows Server, Active Directory va korporativ identifikatsiya",
    summary: "Windows infratuzilmasini qo‘llash, AD DS, DNS, Group Policy, PowerShell audit, backup va identifikatsiya hodisalarini bosqichma-bosqich o‘rganish.",
    category: "systems", difficulty: "medium", hours: 34,
    labPlan: "Faqat sintetik Event ID va konfiguratsiyalardan foydalangan holda 8 ta Windows/AD troubleshooting va xavfsiz baseline mashqi.",
    references: [
      reference("Microsoft Learn — Active Directory Domain Services overview", "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview"),
      reference("Microsoft Learn — Group Policy overview", "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-overview"),
      reference("Microsoft Learn — Windows PowerShell documentation", "https://learn.microsoft.com/en-us/powershell/")
    ],
    chapters: [
      {
        title: "1. Windows Server rollari va boshqaruv chegaralari",
        content: "Windows Server’da role/feature, service, registry, NTFS, Event Log va PowerShell boshqaruvning asosiy qismlari hisoblanadi. Server Core kichik hujum sirtini va kamroq patch talabini beradi, ammo masofaviy boshqaruv va avariya konsoli oldindan rejalashtirilishi kerak. Domain controller, file server va application server rollarini imkon qadar ajratish blast radiusni kamaytiradi.\n\nAdministrator o‘zgarishdan oldin host nomi, OS build, server role, owner, backup, monitoring va change window’ni aniqlaydi. Server Manager yoki PowerShell’dagi yuqori huquqli amallarni qaytarish yo‘li bilan sinang. Har bir service accountning vazifasi va huquqi hujjatlashtirilsin; interaktiv login kerak bo‘lmagan hisobga unga ruxsat bermang.",
        example: "Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber\nGet-WindowsFeature | Where-Object Installed",
        explanation: "Misollar inventarizatsiya uchun. Server nomi, role va build ichki aktiv haqida ma’lumot; ruxsatsiz tashqi ulashishdan saqlaning.",
        prompt: "Windows Server’da o‘rnatilgan role/feature holatini ko‘rish uchun PowerShell cmdlet?",
        answers: ["get-windowsfeature"]
      },
      {
        title: "2. AD DS, forest/domain, OU, DNS va replikatsiya",
        content: "Active Directory DS obyektlar, identity va policy’larni forest/domain ichida markaziy boshqaradi. Domain controller autentifikatsiya va katalog xizmatini beradi; DNS SRV yozuvlari clientga xizmatni topishga yordam beradi. OU delegatsiya va GPO scope uchun ishlatiladi, lekin xavfsizlik chegarasi sifatida domain/forest bilan teng emas.\n\nMulti-site muhitda replication latency, site/subnet mapping, time synchronization, DNS health va FSMO role egalarini kuzating. Bir DC’dagi muvaffaqiyat boshqa DC yoki client logon ishlashini isbotlamaydi. Diagnostikani kichik scope’da bajaring; replikatsiyani majburlash yoki metadata cleanup kabi o‘zgarishlar avval directory backup va tasdiqlangan runbook talab qiladi.",
        example: "Get-ADDomain\nGet-ADReplicationPartnerMetadata -Target dc-lab.example.test -Scope Server\nnslookup -type=SRV _ldap._tcp.dc._msdcs.example.test",
        explanation: "Cmdletlar ActiveDirectory moduli va tegishli huquq talab qiladi. `example.test` sintetik nom; haqiqiy directory ichki tuzilishini oshkor qilmang.",
        prompt: "AD domain controller va xizmatlarini topishda muhim bo‘lgan DNS record turi?",
        answers: ["srv", "srv record"]
      },
      {
        title: "3. Group Policy, privilege va tiered administration",
        content: "Group Policy computer/user configuration’ni scope, inheritance, link order, security filtering va WMI filter orqali qo‘llaydi. GPO natijasini tushunishda local, site, domain va OU qatlamlarini ko‘rib chiqing; `gpresult` natijasi clientda haqiqatan qo‘llangan siyosatni ko‘rsatadi. Keraksiz GPO link yoki broad delegation privilege escalation va noto‘g‘ri konfiguratsiya xavfini keltiradi.\n\nDomain admin huquqini kundalik ish uchun ishlatmang. Tiered administration, alohida admin identity, privileged workstation, MFA va vaqt bilan cheklangan elevation qo‘llang. GPO o‘zgarishini backup, review, test OU, pilot va rollback bilan joriy eting. Baseline hardening business application compatibility va recovery talabi bilan muvoوازن bo‘lishi kerak.",
        example: "gpresult /scope computer /r\nGet-GPO -All | Select-Object DisplayName, GpoStatus, Id",
        explanation: "Birinchi buyruq faqat joriy qurilma scope’ini o‘qiydi, ikkinchisi GroupPolicy modulini talab qiladi. Natijada user va OU nomlari chiqishi mumkin.",
        prompt: "Clientda qo‘llangan Group Policy natijasini ko‘rsatadigan buyruq?",
        answers: ["gpresult"]
      },
      {
        title: "4. PowerShell: xavfsiz audit va takrorlanuvchi boshqaruv",
        content: "PowerShell object pipeline bilan ishlaydi; matnni grep qilish o‘rniga property va type’lardan foydalanish parsing xatosini kamaytiradi. Scriptda parameter validation, least privilege, error handling, transcript/log sanitization va idempotency kerak. `-WhatIf` qo‘llab-quvvatlanadigan cmdletlarda o‘zgarishdan oldin ta’sirni ko‘rsatadi, lekin barcha cmdletlar WhatIf’ni to‘liq qo‘llamasligi mumkin.\n\nRemote session uchun Kerberos/WinRM/HTTPS va JEA kabi delegated endpoint’larni siyosatga mos sozlang. Credential’ni skriptga yozmang; SecretManagement yoki tasdiqlangan vault ishlating. Execution policy malware himoyasining to‘liq chegarasi emas. Script signing, code review, constrained privilege, logging va endpoint detection qatlamlarini birga ko‘ring.",
        example: "Get-Service | Where-Object Status -eq 'Stopped' | Select-Object Name, StartType\nGet-WinEvent -FilterHashtable @{LogName='System'; Id=7045} -MaxEvents 20",
        explanation: "Misollar faqat o‘qish uchun va qayd etilgan servis hodisalarini tekshiradi. `7045` o‘zi zararli xizmatni isbotlamaydi; owner, change record va boshqa dalil bilan tasdiqlang.",
        prompt: "PowerShell pipeline’da obyektlarni shart bo‘yicha tanlash cmdlet’i?",
        answers: ["where-object", "where"]
      },
      {
        title: "5. Windows autentifikatsiyasi va audit loglari",
        content: "Windows kirish hodisalarini 4624 (muvaffaqiyatli logon), 4625 (muvaffaqiyatsiz logon), 4672 (maxsus privilege tayinlanishi) kabi eventlar bilan qayd etishi mumkin; auditing policy va log source’ni tekshiring. Logon Type interaktiv, network yoki xizmat kontekstini farqlashga yordam beradi. Event ID’ni alohida talqin qilish yetarli emas: account, source, host, timestamp, status/substatus va normal ish naqshini bog‘lang.\n\nKerberos ticketing, SPN, time sync va DNS muammolari autentifikatsiya xatosini keltirib chiqaradi. NTLM’ni cheklashdan oldin legacy dependency inventarizatsiya va pilot kerak. Password spray, impossible travel yoki privilege change signalini threshold va biznes kontekst bilan baholang; foydalanuvchiga ortiqcha ma’lumot bermasdan xavfsiz escalation qiling.",
        example: "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624,4625; StartTime=(Get-Date).AddHours(-4)} -MaxEvents 100",
        explanation: "Bu sintaksisni o‘zingizning ruxsatli lab Event Log’ida ishlating; real audit ma’lumotini saqlash, ko‘rish va ulashish uchun tashkilot siyosatiga amal qiling.",
        prompt: "Windows Security’da muvaffaqiyatsiz logon hodisasi ID’si?",
        answers: ["4625"]
      },
      {
        title: "6. Patch, endpoint baseline, backup va recovery",
        content: "Patch boshqaruvi inventar, vendor advisory, ta’sir, test, ring deployment va qaytarish rejasini o‘z ichiga oladi. Muhim serverda avtomatik reboot biznes uzilishiga olib kelishi mumkin; maintenance window, cluster failover, backup va application owner tasdig‘ini tekshiring. Defender/EDR, firewall, BitLocker, secure boot va application control konfiguratsiyasini baseline va exception bilan yuriting.\n\nSystem State backup AD DS tiklashda muhim bo‘lishi mumkin, ammo restore topologiyasi va forest recovery runbook alohida ishlab chiqiladi. Backup media va encryption key’ga kirishni ajrating; restore mashqlarini izolyatsiyalangan muhitda o‘tkazing. RPO/RTO’ni rahbariyat bilan kelishing, amalda o‘lchang va natijani qayd eting.",
        example: "Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10\nGet-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled",
        explanation: "Cmdletlar patch va Defender holatini o‘qiydi; OS versiyasiga qarab property farq qiladi. Natija endpoint posture’ni to‘liq isbotlamaydi.",
        prompt: "Qabul qilinadigan maksimal ma’lumot yo‘qotish oynasining qisqartmasi?",
        answers: ["rpo"]
      },
      {
        title: "7. Hybrid identity, MFA va access lifecycle",
        content: "Korporativ identity hayot sikli joiner/mover/leaver, rol o‘zgarishi, access review va favqulodda hisoblarni boshqaradi. On-prem AD va cloud identity sinxronlashida authoritative source, conflict, break-glass va lifecycle owner aniq bo‘lsin. MFA barcha riskni bartaraf etmaydi: phishing-resistant method, conditional access, device posture va session riskni qatlamlab qo‘llang.\n\nService principal, managed identity va service accountlarga interaktiv login bermaslik, credential rotation va ownership kerak. Ortiqcha group nesting, stale account va privileged role membership davriy tekshirilsin. Joiner/leaver jarayoni kechiksa, orphan account qoladi; avtomatlashtirishdan oldin HR identity, approval va exception jarayonini aniqlang.",
        example: "Access review jadvali: identity / owner / role / oxirgi foydalanish / tasdiqlovchi / muddat / qaror / ticket.",
        explanation: "Hisobotda haqiqiy xodim nomi va account ID o‘rniga sintetik qiymat ishlating. Huquqni olib tashlashni tashkilotning approval va emergency policy’siz avtomatlashtirmang.",
        prompt: "Hodim tashkilotdan ketganda account va access’ni yopish jarayoni?",
        answers: ["leaver", "offboarding", "leaver process"]
      },
      {
        title: "8. Senior Windows administrator: xizmat sifati va incident boshqaruvi",
        content: "Senior Windows administrator patch KPI’lari, backup restore, directory health, privileged access, endpoint coverage va change failure rate’ni birga kuzatadi. Dashboard sonlari operational qarorga olib kelishi kerak: eski patch, stale account, replication lag va audit gap uchun owner hamda SLA belgilang. Alert threshold’i pilot data bilan tune qilinib, noise va blind spot o‘lchansin.\n\nIncidentda containment, identity reset, endpoint isolation va evidence preservation qarorlarini incident commander bilan muvofiqlashtiring. AD compromise gumonida shoshilinch password resetning replikatsiya, service account va Kerberos ticketlarga ta’sirini tushuning; faqat rasmiy forest recovery runbook bo‘yicha ish tuting. Postmortemda texnik sabab bilan birga aniqlash va tiklash jarayonidagi bo‘shliqni ham bartaraf eting.",
        example: "Operatsion review: patch compliance / privileged changes / backup restore evidence / DC replication / open exceptions / action owner.",
        explanation: "Faqat agregat va ruxsatli ko‘rsatkichlarni ulashing. Account komprometi bo‘yicha javob tashkilotning incident response va huquqiy jarayonlari bilan boshqarilsin.",
        prompt: "Directory xizmatida vaqt farqi va replikatsiya holatini baholashda qaysi server rolini topish muhim?",
        answers: ["domain controller", "dc"]
      }
    ]
  }),
  book({
    slug: "network-engineering-advanced",
    title: "Tarmoq muhandisligi: loyihalash, diagnostika va chidamlilik",
    summary: "IPv4/IPv6, subnetting, VLAN, switching, routing, DNS/DHCP, VPN, Wi-Fi, firewall va tarmoq o‘zgarishlarini xavfsiz boshqarish bo‘yicha ishga yo‘naltirilgan darslik.",
    category: "networking", difficulty: "medium", hours: 38,
    labPlan: "Berilgan sintetik topologiya va konfiguratsiya eksportlarida addressing, segmentatsiya, marshrut, DNS, firewall va packet-timeline tahlili.",
    references: [
      reference("Cloudflare Learning Center — networking", "https://www.cloudflare.com/learning/"),
      reference("IETF RFC Editor", "https://www.rfc-editor.org/"),
      reference("Cisco CCNA exam topics", "https://learningnetwork.cisco.com/s/ccna-exam-topics"),
      reference("NIST Cybersecurity Framework 2.0", "https://www.nist.gov/cyberframework")
    ],
    chapters: [
      {
        title: "1. IPv4/IPv6, subnetting va manzil rejalashtirish",
        content: "Subnet mask/prefix tarmoq va host bitlarini ajratadi. CIDR address aggregation va route planning’ga yordam beradi; VLSM’da eng katta segmentdan boshlab talabga yetarli eng kichik blok tanlanadi. Gateway, reserved address, DHCP pool, broadcast (IPv4’da) va point-to-point linklarni jadvalda qayd qiling. Overlap, undocumented static address va NAT pool’lar o‘sishni qiyinlashtiradi.\n\nIPv6’da /64 subnet keng qo‘llanadi; link-local, global unicast, multicast va SLAAC/DHCPv6 rollarini farqlang. IPv6’ni noto‘g‘ri “o‘chirib qo‘yish” o‘rniga firewall policy, router advertisement, DNS, monitoring va dual-stack testni boshqaring. Address plan’da owner, site, VLAN, environment va lifecycle ko‘rsatilishi kerak.",
        example: "192.0.2.0/26: 64 manzil, IPv4 usable host odatda 62.\nIPv6 link-local: fe80::/10.\nSintetik subnet jadvali: network / prefix / gateway / DHCP range / owner.",
        explanation: "TEST-NET manzillar hujjat misollari uchun ajratilgan. Real enterprise manzillarni public portfolio yoki screenshotga qo‘ymang.",
        prompt: "IPv4 /26 blokida jami nechta manzil bor?",
        answers: ["64"]
      },
      {
        title: "2. Ethernet, VLAN, STP va switch port siyosati",
        content: "VLAN broadcast domenini ajratadi; access port bitta VLAN’ni, trunk bir nechta 802.1Q taglangan VLAN’ni tashiydi. Native VLAN, allowed VLAN list, voice VLAN va management plane siyosati vendor bo‘yicha farq qiladi. STP loop’ni oldini oladi, lekin root bridge, redundant link va edge port sozlamasi noto‘g‘ri bo‘lsa outage bo‘lishi mumkin.\n\nPort security, 802.1X/NAC, DHCP snooping, Dynamic ARP Inspection kabi nazoratlar platforma va arxitekturaga bog‘liq. Ularni yoqishdan oldin client compatibility, fail-open/fail-closed qarori va recovery yo‘lini sinang. Change plan’da oldingi state, expected output va rollback komandasi bo‘lsin.",
        example: "Port audit jadvali: switch/port / mode / VLAN / neighbor / expected device / unused? / change ticket.",
        explanation: "Bu audit shabloni, real qurilma buyrug‘i emas. Configuration export ichki host va credentialni o‘z ichiga olishi mumkin; redaction qiling.",
        prompt: "802.1Q tag bilan bir nechta VLAN’ni tashiydigan switch port mode?",
        answers: ["trunk"]
      },
      {
        title: "3. Routing, BGP/OSPF tushunchalari va nosozlik izlash",
        content: "Router eng uzun mos prefix bo‘yicha forwarding qiladi; route source, administrative distance/metric, next hop va policy’ni birgalikda tekshiring. OSPF ichki link-state routing’ni, BGP esa turli autonomous systemlar orasida policy’ga asoslangan routing’ni ta’minlaydi. Protokolni tanlash topologiya, convergence, scale va operatsion ko‘nikmaga bog‘liq.\n\nAsimmetrik yo‘l stateful firewall’ni buzishi mumkin. MTU/PMTUD muammosi faqat katta paketda namoyon bo‘ladi; traceroute firewall yoki ECMP sabab to‘liq yo‘lni bermasligi mumkin. Route flap, prefix leak va blackhole uchun max-prefix, route filtering, RPKI kabi himoyalarni operator siyosati bilan loyihalang. Public routing o‘zgarishi faqat vakolatli NOC change jarayonida bajarilsin.",
        example: "Nosozlik zanjiri: client route → gateway FIB → next hop reachability → ACL → remote route → return path.",
        explanation: "Bu konseptual check-list; public routerga test e’lon qilmang. Diagnostika faqat o‘zingiz boshqaradigan yoki ruxsat berilgan tarmoqda bajariladi.",
        prompt: "Eng aniq mos keladigan IP route tanlash qoidasi?",
        answers: ["longest prefix match", "eng uzun prefiks", "longest prefix"]
      },
      {
        title: "4. DNS, DHCP, NTP va xizmatga bog‘liqlik",
        content: "DNS recursive resolver, authoritative zone, TTL, CNAME, A/AAAA va PTR yozuvlari bilan nomlarni boshqaradi. DHCP lease va option’lar IP, gateway, DNS hamda domain search’ni tarqatadi. DHCP relay turli broadcast domenlar orasida so‘rovni yetkazadi. NTP vaqt sinxronligi Kerberos, log korrelyatsiyasi va sertifikat tekshiruviga ta’sir qiladi.\n\nNosozlikda client cache, resolver, authoritative server, delegation, firewall UDP/TCP 53, lease va scope exhaustion’ni ajratib tekshiring. DNS o‘zgarishida TTL va cache sabab propagation darhol bo‘lmasligi mumkin. Change log’da oldingi/yangilangan record, owner, approval va rollback ko‘rsating; DNS hijack yoki unauthorized update gumoni bo‘lsa audit trailni saqlang.",
        example: "nslookup -type=A service.example.test\nnslookup -type=SRV _ldap._tcp.example.test\nipconfig /all  # Windows client holatini o‘qish",
        explanation: "Misollardagi `.test` domeni sintetik. Ichki DNS yozuvlari tarmoq topologiyasini oshkor qilishi mumkin; ruxsatsiz query va ommaviy screenshotdan saqlaning.",
        prompt: "DNS yozuvining cache’da saqlanish muddatini belgilovchi qiymat?",
        answers: ["ttl", "time to live"]
      },
      {
        title: "5. Firewall, NAT, VPN va zero-trust segmentatsiya",
        content: "Firewall policy source, destination, port, application, identity, direction va connection state’ni tekshiradi; rule order, implicit deny va object group inheritance’ni hisobga oling. NAT mappingni o‘zgartiradi, xavfsizlik policy o‘rnini bosmaydi. Site-to-site va remote-access VPN’da identity, certificate lifecycle, split tunnel, DNS, route, MFA va log nazorati kerak.\n\nSegmentatsiya faqat VLAN yaratish emas: inter-zone flow matrix va data classification asosida minimal aloqa yo‘lini belgilang. Zero-trust modelda har kirish so‘rovi identity, device, context va resurs siyosati bilan baholanadi. Firewall change’da shadow rule, broad any-any, stale object va logging gaplarni tekshirib, test va rollback qo‘shing.",
        example: "Flow request: source role → destination service → protocol/port → business need → owner → expiry → log/monitoring.",
        explanation: "Shablon yangi ruxsatni avtomatik tasdiqlamaydi. Ishlab chiqarish firewall qoidasi tarmoq/security ownerlari tomonidan review qilinishi kerak.",
        prompt: "NAT firewall ruxsat nazoratining o‘rnini bosa oladimi?",
        answers: ["yo‘q", "no", "cannot"]
      },
      {
        title: "6. Wi-Fi, 802.1X va radio rejalashtirish",
        content: "Wi-Fi’da coverage, channel interference, airtime contention, roaming va client density bir-biriga ta’sir qiladi. SSID’ni ko‘paytirish overhead keltirishi mumkin. WPA2/3-Enterprise va 802.1X’da supplicant, authenticator va RADIUS server munosabatini, sertifikat trust’ini va guest onboarding’ni boshqaring. PSK’ni guruhlararo ulashish lifecycle va attribution muammosini keltiradi.\n\nGuest, corporate, IoT va management trafikni ajrating; IoT qurilmalari faqat kerakli controller/service’ga chiqsin. Rogue AP aniqlanganda qurilmani darhol uzishdan oldin ownership va physical impact’ni tekshiring. Kanal rejasini site survey va telemetry’ga tayang; 2.4/5/6 GHz qo‘llovi, regulatory domain va device capability’ni hisobga oling.",
        example: "Wi-Fi incident ma’lumotlari: AP/SSID / band/channel / client RSSI / retry rate / RADIUS result / vaqt / ta’sir.",
        explanation: "Bu kuzatuv jadvali, client MAC va username shaxsiy/operatsion ma’lumot bo‘lishi mumkin; loglarni siyosatga muvofiq saqlang.",
        prompt: "802.1X autentifikatsiya so‘rovlarini odatda qabul qiluvchi server turi?",
        answers: ["radius"]
      },
      {
        title: "7. Packet analysis, observability va muammoni isbotlash",
        content: "Packet capture aloqaning bir nuqtadagi dalilidir, butun tizimning ko‘rinishi emas. TCP handshake, retransmission, DNS query/response, TLS handshake va ICMP xabarlarini timeline bilan tahlil qiling. Capture point, interface, filter, snap length, clock skew va packet loss’ni yozing. Encryption sabab payload ko‘rinmasligi odatiy; TLS’ni buzishga urinmang.\n\nNetFlow/IPFIX, SNMP telemetry, syslog, synthetic probe va application metric’larni birlashtirish root cause’ni toraytiradi. Alertda user impact, severity, owner va runbook bo‘lsin. Pcap’da credential, cookie, internal IP va shaxsiy ma’lumot chiqishi mumkin; scope, approval, retention va access control’ni capture’dan oldin belgilang.",
        example: "Wireshark display filter: dns || tcp.analysis.retransmission\nCapture note: sensor / UTC start-end / filter / authorization / file hash / retention owner.",
        explanation: "Display filter faqat berilgan capture’ni ko‘rsatadi; filter capture’ni o‘zgartirmaydi. Haqiqiy trafikni yozib olishdan oldin ruxsat va privacy talabini tasdiqlang.",
        prompt: "DNS so‘rovi va javoblarni Wireshark’da ajratadigan protocol filter?",
        answers: ["dns"]
      },
      {
        title: "8. Senior tarmoq muhandisi: change, resilience va capacity",
        content: "Senior network engineer HA, routing convergence, failure domain, maintenance risk, ISP/vendor SLA, observability va business continuity’ni yagona dizaynda ko‘radi. Redundant qurilma failover sinovidan o‘tmasa, haqiqiy redundancy emas. Capacity trendida port utilization, packet loss, latency percentile, Wi-Fi airtime, NAT/session table va circuit headroom’ni kuzating.\n\nChange review’da blast radius, dependency, pre/post-check, rollback trigger, out-of-band access va stakeholder comms yoziladi. Network diagram versiya nazorati ostida bo‘lsin; secretsiz, aktual topology va ownership ko‘rsatilsin. Incident’dan keyin root cause, detection gap va preventive task’ni egasi va due date bilan yoping. Katta o‘zgarishni pilot, canary yoki bosqichma-bosqich rollout bilan bajaring.",
        example: "Change plan: scope → risk → pre-check → staged action → validation → rollback trigger → owner → communication.",
        explanation: "Yakuniy change plan mahalliy change advisory jarayoniga mos bo‘lishi kerak. Haqiqiy qurilmada change’ni faqat vakolatli muhandis bajarsin.",
        prompt: "Katta tarmoq o‘zgarishini kichik bosqichlarga bo‘lib, har bosqichda tekshirish usuli?",
        answers: ["staged rollout", "bosqichma-bosqich rollout", "canary"]
      }
    ]
  }),
  book({
    slug: "soc-incident-response-detection",
    title: "SOC, incident response va detection engineering",
    summary: "Alert triage’dan threat hunting, log engineering, incident lifecycle, dalil yaxlitligi va senior SOC operatsiyalarigacha bo‘lgan blue-team darsligi.",
    category: "security", difficulty: "medium", hours: 40,
    labPlan: "Faqat berilgan sintetik loglar va xavfsiz konfiguratsiya namunalarida 10 ta detection, triage, timeline va response mashqi.",
    references: [
      reference("NIST SP 800-61 Rev. 3 — incident response", "https://csrc.nist.gov/pubs/sp/800/61/r3/final"),
      reference("MITRE ATT&CK knowledge base", "https://attack.mitre.org/"),
      reference("NIST NICE Framework", "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center"),
      reference("Microsoft SC-200 — Security Operations Analyst", "https://learn.microsoft.com/en-us/credentials/certifications/security-operations-analyst/")
    ],
    chapters: [
      {
        title: "1. SOC roli, telemetriya va analitik fikrlash",
        content: "SOC tahlilchisi alertni ko‘rib, signal manbasi, asset kritikligi, foydalanuvchi ta’siri va dalil ishonchliligini baholaydi. SIEM’dagi loglar endpoint, identity, DNS, proxy, firewall, cloud control plane va ilovadan kelishi mumkin; parsing, timezone, retention va coverage farq qiladi. Event yo‘qligi har doim faoliyat bo‘lmaganini anglatmaydi.\n\nTriage’da fakt, taxmin va noma’lumni alohida yozing. Alert severity biznes ta’sir va ehtimolga asoslanadi; bitta IOC yoki vendor risk label’iga ko‘r-ko‘rona tayanmang. Analitik yozuvi qayta ko‘rib chiqishga yaroqli bo‘lsin: query scope, vaqt, source, natija, cheklov va keyingi qadam.",
        example: "Case note: alert ID / UTC window / asset owner / source logs / verified facts / hypotheses / decision / escalation.",
        explanation: "Sintetik identifikatorlardan foydalaning. Ishlab chiqarish SIEM loglari maxfiy va shaxsiy ma’lumot bo‘lishi mumkin.",
        prompt: "Tasdiqlangan kuzatuvni ehtimoliy izohdan ajratib yozish nima uchun kerak?",
        answers: ["dalil va taxminni farqlash", "evidence from hypothesis", "dalil"]
      },
      {
        title: "2. Alert triage, severity va escalation",
        content: "Triage playbook avval alertni takrorlash, vaqt/scope tasdiqlash, asset owner va criticality aniqlash, parallel signal qidirish, so‘ng containment vakolatini tekshiradi. Severity’da likelihood, impact, exposure, privilege, data sensitivity va ongoing activity hisobga olinadi. False positive sababini qayd eting, lekin detectionni shunchaki o‘chirib qo‘ymang.\n\nEscalation threshold oldindan kelishilgan bo‘lsin: privileged account, regulated data, lateral movement indicator, business-critical host yoki confirmed exfiltration kabi signal tezkor incident commander’ga yuborilishi mumkin. SOC L1/L2/L3 chegarasi tashkilotga qarab farq qiladi; handoff’da kontekst, dalil, noaniqlik va so‘ralgan qarorni bering.",
        example: "Triage matrix: severity / evidence confidence / affected assets / business owner / containment authority / SLA.",
        explanation: "Matrisa namunaviy; tashkilotning incident policy va regulatory reporting muddatlari ustun.",
        prompt: "Keyingi tahlilga yuborishda dalil va noaniqlikni beradigan jarayon?",
        answers: ["escalation", "handoff", "eskalatsiya"]
      },
      {
        title: "3. Log normalizatsiyasi, vaqt va korrelyatsiya",
        content: "SIEM normalizatsiyasi turli log manbalarini umumiy field’lar — timestamp, user, host, source/destination, action, result — ko‘rinishida izlashga imkon beradi. Parser drift, locale, missing field va device clock noto‘g‘riligini tekshiring. UTCga normallashtirish timeline tuzishni yengillashtiradi, lekin original timestamp va timezone offset saqlanishi kerak.\n\nKorrelyatsiya qoidasi bir necha signalni bog‘lashi mumkin, ammo event ID yoki IP almashishi attributionni isbotlamaydi. Entity resolution’da NAT, shared device, VPN egress, DHCP lease va service account’ni hisobga oling. Katta query’ni chegaralangan vaqt va index bilan bajaring; PII field’larni minimallashtirib, audit qiling.",
        example: "Timeline: source event time + ingest time + timezone + host clock status + parser version.",
        explanation: "Ingest delay va source timestamp farqini alohida saqlang; kutilmagan log eksportini umumiy kanalda tarqatmang.",
        prompt: "Xalqaro timeline’larni bir xil taqqoslashga qulay standart vaqt zonasi?",
        answers: ["utc"]
      },
      {
        title: "4. Detection engineering va MITRE ATT&CK",
        content: "Detection use case himoya maqsadi, data source, analytics, threshold, exception, response va test bilan belgilanadi. ATT&CK texnika taksonomiyasi kuzatilgan xatti-harakatni tasniflashga yordam beradi; ATT&CK mapping hujum bo‘lganini yoki detection qamrovi to‘liq ekanini isbotlamaydi. Analytics aniqlangan data source va telemetry retention’ga bog‘liq.\n\nQoidani sintetik fixture bilan test qiling: normal, benign edge case va suspicious pattern. Precision, recall, alert volume, time-to-detect va missed coverage’ni o‘lchang. Allowlistni owner va expiry bilan boshqaring, aks holda hujumchi unga yashirinishi mumkin. Detection o‘zgarishini peer review va version control’dan o‘tkazing.",
        example: "Rule record: purpose / ATT&CK technique / required fields / logic summary / known false positives / test fixture / owner / expiry.",
        explanation: "Bu detection hujjati shabloni; real logga qarshi ishlab chiqarish qoidasi qo‘llash uchun approval va staged rollout talab qilinadi.",
        prompt: "ATT&CK nimani standartlashga yordam beradi?",
        answers: ["taktika va texnika taksonomiyasi", "tactics and techniques", "xatti-harakat taksonomiyasi"]
      },
      {
        title: "5. Incident response: tayyorgarlik, aniqlash va tiklash",
        content: "NIST SP 800-61 Rev. 3 incident response’ni kengroq cybersecurity risk management bilan bog‘laydi. Tashkilot tayyorgarlikda role, escalation, contact, evidence, legal/privacy review, backup, communication channel va exercise’ni belgilaydi. Hodisa davomida scope, containment, eradication, recovery va lessons learned iterativ kechishi mumkin; real vaziyat qat’iy chiziqli bo‘lmaydi.\n\nContainment biznes ta’siri va dalil saqlash bilan muvozanatlanadi. Endpointni izolyatsiya qilish yoki account’ni bloklashni faqat vakolatli incident lead bilan bajaring. Recovery’da monitoring heightened bo‘lsin, credential rotation va persistence check siyosatga muvofiq bajarilsin. Har qaror, vaqt, owner va asosni yozing; regulator yoki mijozga xabar berishni huquqiy egalar bilan muvofiqlashtiring.",
        example: "IR record: detection / scope / decisions / approvals / containment / recovery checks / communications / follow-up.",
        explanation: "Runbook tashkilotning vakolat zanjiri va tegishli qonunlarni almashtirmaydi. Mashqda faqat sun’iy hodisa va izolatsiyalangan resurs ishlating.",
        prompt: "NIST incident response amaliyotida hodisadan keyingi yaxshilash bosqichi?",
        answers: ["lessons learned", "takomillashtirish", "improvement"]
      },
      {
        title: "6. Threat hunting: gipoteza, scope va xavfsiz tekshiruv",
        content: "Threat hunting oldindan belgilangan gipotezani mavjud telemetry’da tekshiradi: masalan, noma’lum service account odatiy bo‘lmagan hostga kirganmi? Gipoteza kuzatiladigan signal, data source, vaqt oynasi, scope va kutilgan benign izohlarni ko‘rsatishi kerak. Hunt natijasi “topilmadi” bo‘lsa, telemetry coverage yetarli bo‘lmaganini ham ayting.\n\nHunt query’larini chegaralangan datasetda, read-only usulda bajaring; faol exploit, credential sinash yoki ruxsatsiz tizimga kirish hunt emas. PII minimallashtiring, case ID bilan audit qiling va topilmani detection, response runbook yoki risk register’ga aylantiring. Senior hunt program coverage, repeatability va business riskni o‘lchaydi.",
        example: "Hunt brief: hypothesis / scope / data available / query intent / benign explanations / findings / limits / follow-up.",
        explanation: "Faoliyat faqat tashkilot tasdiqlagan telemetriya va scope’da bo‘lishi kerak. Ishlab chiqarish query’larini resurs cheklovi va privacy talabiga moslang.",
        prompt: "Hunt boshlanishida tekshiriladigan aniq taxmin nima deb ataladi?",
        answers: ["gipoteza", "hypothesis"]
      },
      {
        title: "7. Dalil, chain of custody va maxfiy loglar",
        content: "Digital evidence yig‘ishda scope, vakolat, vaqt, collector, source, method, hash va storage access’ni qayd eting. Hash fayl keyin o‘zgarganini aniqlashga yordam beradi, ammo hash manbasining haqiqiyligini o‘zi isbotlamaydi. Chain of custody’da har transfer va ko‘rish yoziladi; originalni read-only saqlab, tahlil nusxasida ishlang.\n\nLoglarda shaxsiy ma’lumot, authentication token, cookie, email va xodim faoliyati bo‘lishi mumkin. Need-to-know access, retention, encryption, redaction va legal hold qoidalariga amal qiling. Dalilni chat, shaxsiy cloud yoki noma’lum AI xizmatiga yuklamang. Hisobotda xulosa darajasi, cheklov va alternativ izohlarni yozing.",
        example: "Evidence manifest: case ID / file name / SHA-256 / collected UTC / collector role / source / access log / retention date.",
        explanation: "Bu sintetik manifest shabloni. Haqiqiy dalillar faqat tasdiqlangan evidence repository’da saqlanadi.",
        prompt: "Dalilni qabul qilishdan tahlilgacha kimda bo‘lganini qayd etish jarayoni?",
        answers: ["chain of custody", "dalil zanjiri"]
      },
      {
        title: "8. Senior SOC: metrikalar, coverage va jamoa samaradorligi",
        content: "Senior SOC lead alert hajmini kamaytirishni yagona maqsad qilmaydi; detection coverage, median time-to-triage, time-to-contain, false-positive cost, missed incident review va analyst workloadni birga o‘lchaydi. Metrika o‘yinga aylansa, xodimlar noto‘g‘ri xulqni optimallashtirishi mumkin. Har indikator nimani anglatmasligini ham yozing.\n\nUse-case portfolio’da risk owner, data source, test, version, expiry, escalation va audit evidence bo‘lsin. Tabletop exercise’da executive, IT, legal, privacy, communications va vendor rollarini qo‘shing. Senior analitik rahbariyatga texnik jargon emas, biznes ta’siri, qaror varianti va qolgan riskni taqdim etadi; aniqlik va halollik ishonchni oshiradi.",
        example: "SOC review: risk coverage / detection health / response SLA / analyst capacity / privacy impact / overdue actions.",
        explanation: "Metrikalarni agregat shaklda ishlating; xodimlarni bir ko‘rsatkich bilan individual jazolash incident reportingni susaytirishi mumkin.",
        prompt: "Alert paydo bo‘lishidan tahlilchi ko‘rib chiqishigacha bo‘lgan vaqt metrikasi?",
        answers: ["time to triage", "time-to-triage", "triage vaqti"]
      }
    ]
  }),
  book({
    slug: "security-engineering-appsec",
    title: "Xavfsizlik muhandisligi va secure software lifecycle",
    summary: "Asset/risk, threat modeling, IAM, secrets, secure code review, vulnerability management, OWASP, cloud boundary va assurance bo‘yicha himoyaviy darslik.",
    category: "security", difficulty: "hard", hours: 38,
    labPlan: "Faqat berilgan kod parchasi, SBOM, threat model va sintetik findinglarda 8 ta xavfsiz design/review mashqi.",
    references: [
      reference("OWASP Application Security Verification Standard", "https://owasp.org/www-project-application-security-verification-standard/"),
      reference("OWASP Top 10", "https://owasp.org/www-project-top-ten/"),
      reference("NIST SSDF SP 800-218", "https://csrc.nist.gov/pubs/sp/800/218/final"),
      reference("CIS Controls v8.1", "https://www.cisecurity.org/controls/cis-controls-list")
    ],
    chapters: [
      {
        title: "1. Asset inventarizatsiyasi, risk va threat modeling",
        content: "Xavfsizlik muhandisligi business asset, data flow, actor, trust boundary, abuse case va mumkin bo‘lgan impact’ni aniqlashdan boshlanadi. Threat model’da STRIDE kabi framework fikrni tizimlashtiradi, lekin risk scoring qaror o‘rnini bosmaydi. Data classification, exposure, privilege, exploitability, business impact va existing control’larni hujjatlashtiring.\n\nModelni arxitektura o‘zgarganda yangilang; diagramma owner va review date’ga ega bo‘lsin. Har risk uchun treatment — mitigate, accept, transfer yoki avoid — va risk owner yozilsin. “Xavfsiz” degan umumiy da’vo o‘rniga scope, assumptions va residual riskni ochiq qiling.",
        example: "Threat model: asset → data flow → trust boundary → threat scenario → existing controls → residual risk → owner.",
        explanation: "Faqat sintetik arxitektura va data ishlating. Threat model eksploit qo‘llanmasi emas, himoyani rejalash vositasidir.",
        prompt: "Tizim ichida ishonch darajasi yoki security control o‘zgaradigan chegara?",
        answers: ["trust boundary", "ishonch chegarasi"]
      },
      {
        title: "2. Identity, access control va secret lifecycle",
        content: "Authentication identity’ni tasdiqlaydi, authorization unga ruxsat berilgan amalni belgilaydi. RBAC role asosida, ABAC attribute/context asosida qaror qabul qiladi. Least privilege, separation of duties, MFA, privileged access management va access review’ni riskka mos qatlamlang. Deny/allow qarorini server-side qo‘llang; UI’da tugmani yashirish authorization emas.\n\nCredential, API key va signing key’ni source, image, log, ticket va chatga qo‘ymang. Secret manager, short-lived credential, rotation, scoped permission va audit log ishlating. Secret sizib chiqsa, faqat repository’dan o‘chirish yetarli emas — credentialni revoke/rotate qiling, loglarni tekshiring va incidentni qayd eting.",
        example: "Access check: subject / action / resource / context / policy / decision / audit event.",
        explanation: "Bu access control modeli; haqiqiy token yoki key’ni misolga kiritmang.",
        prompt: "Tizimga kim kirganini tekshiruvchi nazorat turi?",
        answers: ["authentication", "autentifikatsiya"]
      },
      {
        title: "3. Secure coding, input validation va parametrli so‘rov",
        content: "Kiritilgan ma’lumotni server-side schema va context bo‘yicha tekshiring; outputni HTML/SQL/shell kontekstiga mos encode qiling. SQL’da parametrli query, shell’da argument array, templating’da auto-escaping ishlating; blacklist xavfsizlik chegarasi emas. Authorization har object va action uchun tekshiriladi, object ID’ni bilish ruxsat bermaydi.\n\nError message ichki stack, secret yoki query’ni foydalanuvchiga ko‘rsatmasin, lekin serverda correlation ID va sanitize qilingan diagnostika bo‘lsin. Fuzz testingni faqat o‘z ilovangizning local/staging muhitida bajaring. Code review’da security regression test, dependency version va backwards compatibility’ni birga tekshiring.",
        example: "Xavfsiz DB naqshi: SELECT id FROM accounts WHERE email = ?\nUnsafe naqsh: query = '... ' + user_input",
        explanation: "Misol string interpolation xavfini tushuntiradi; internetga ochiq ilovada testni faqat owner ruxsat bergan staging’da bajaring.",
        prompt: "SQL qiymatlarini query matnidan alohida uzatish usuli?",
        answers: ["parameterized query", "prepared statement", "parametrli so‘rov"]
      },
      {
        title: "4. OWASP ASVS, authorization va web assurance",
        content: "OWASP ASVS ilovaning verification talablarini risk va assurance darajasiga mos tanlash uchun ishlatiladi; u checklistni ko‘r-ko‘rona bajarishdan ko‘ra talabni arxitektura va testga bog‘lashni talab qiladi. Authentication, session, access control, input handling, crypto, error handling, logging va data protection’ni qamrab oling. OWASP Top 10 esa awareness ro‘yxati; barcha xavfsizlik talablarining o‘rnini bosmaydi.\n\nHar talab uchun evidence yozing: test, code review, configuration, owner va versiya. Regression testni CI’da bajaring, lekin production secret va customer data’ni CI fixture’ga ko‘chirmang. API’da object-level authorization, rate control, schema, version retirement va audit event’ni tekshiring.",
        example: "Verification record: requirement ID / component / test method / expected result / evidence / exception owner.",
        explanation: "OWASP hujjatlari versiyalanadi; loyihada ishlatilgan edition va talablarni aniq qayd eting.",
        prompt: "Ilova xavfsizlik nazoratlarini verification talablarida jamlaydigan OWASP loyiha?",
        answers: ["asvs", "owasp asvs"]
      },
      {
        title: "5. Vulnerability management va patch risk",
        content: "Vulnerability management inventar, scan, vendor advisory, exploit evidence, exposure, business criticality, owner, remediation, validation va exception lifecycle’dan iborat. CVSS severity foydali signal, lekin tashkilot riskining tayyor javobi emas; internet exposure, asset, known exploitation, compensating control va change riskni hisobga oling.\n\nFindingni tuzatgandan keyin qayta tekshirib, versiya/config evidence saqlang. False positive yoki accepted risk uchun asos, approver, mitigation, expiry va qayta ko‘rish sanasi talab etiladi. Pentest yoki scanner faqat yozma scope va xavfsiz test sharoitida ishlatiladi; production tizimga ruxsatsiz exploit yoki credential test qilmang.",
        example: "Finding row: asset / component / evidence / severity / exposure / owner / due date / mitigation / verification.",
        explanation: "Portfolio uchun sintetik finding ishlating; real customer vulnerability va exploit tafsilotini oshkor qilmang.",
        prompt: "Vulnerability tuzatilganini keyin qayta tekshirish bosqichi?",
        answers: ["verification", "qayta tekshirish", "remediation validation"]
      },
      {
        title: "6. CI/CD, dependency va software supply chain",
        content: "Secure SDLC talab, threat modeling, code review, test, dependency, build, release va vulnerability response’ni uzluksiz bog‘laydi. Lockfile, dependency update, provenance, signed artifact, SBOM va reproducible build ta’minot zanjiri ko‘rinishini oshiradi. CI runnerga minimal secret va network access bering; fork pull request’larida privileged token chiqmasin.\n\nSAST/DAST/SCA vositalari finding yaratadi, ammo false positive va coverage cheklovi bor. Gate’lar riskka mos va developer uchun actionable bo‘lsin. Build artifact’ni tasdiqlangan pipeline’dan deploy qiling; prod serverda qo‘lda rebuild qilish provenance’ni buzadi. Incidentga tayyorlik uchun dependency owner, supported version va patch SLA belgilang.",
        example: "Pipeline gate: tests → dependency review → secret scan → artifact provenance → approval → staged release.",
        explanation: "Bu himoya pipeline naqshi. Real pipeline’da secret scan outputi ham credential yoki private pathni ko‘rsatishi mumkin.",
        prompt: "Dasturga kiritilgan component va dependency’lar ro‘yxati nima deb ataladi?",
        answers: ["sbom", "software bill of materials"]
      },
      {
        title: "7. Kriptografiya, ma’lumotni himoya qilish va loglash",
        content: "Encryption confidentiality’ni, hash integrity comparison’ni, MAC/signature esa integrity va origin verification’ni qo‘llaydi; ular bir-birini almashtirmaydi. TLS sertifikat lifecycle, key usage, trust chain va rotation bilan boshqariladi. Password’larni oddiy hash bilan emas, salt va mos password hashing algorithm bilan saqlang; key’larni data’dan alohida boshqaring.\n\nLogging’da zarur event va correlation’ni yozing, lekin password, token, full payment detail yoki keraksiz PII’ni yozmang. Retention, access, tamper detection va deletion talabini data owner bilan belgilang. Backup encryption’da restore paytida kalit mavjudligi va key compromise rejasini mashq qiling.",
        example: "Log review: actor ID (pseudonymous) / action / resource class / decision / request ID / UTC time — secret values excluded.",
        explanation: "Hashing shifrlash emas; private key va key materialni kod yoki audit logda ko‘rsatish mumkin emas.",
        prompt: "Ma’lumotni asl kalitsiz tiklab bo‘lmaydigan matematik usul?",
        answers: ["encryption", "shifrlash"]
      },
      {
        title: "8. Senior security engineer: assurance va residual risk",
        content: "Security engineer control’ni aniq requirement, owner, evidence va lifecycle bilan bog‘laydi. Architecture review’da security, privacy, reliability, accessibility, cost va operator workload orasidagi trade-off’ni yozing. Exceptionlar vaqtinchalik, risk owner tasdiqlagan, mitigation va expiry sanali bo‘lsin. Security debt backlog’da business impact va qayta ko‘rish mezoni ko‘rsatiladi.\n\nSenior muhandis auditga dalil tayyorlaydi, lekin nazorat ishlashini dalilsiz da’vo qilmaydi. Metrika coverage va remediation trendini ko‘rsatadi; “100% secure” kabi mutlaq da’vodan qoching. Incident va audit saboqlarini threat model, secure baseline, test va developer enablement’ga qaytaring. Tashqi testning scope’i, ruxsati va ta’sir limiti oldindan tasdiqlanadi.",
        example: "Assurance packet: requirement / owner / evidence link / test date / exception / residual risk / next review.",
        explanation: "Evidence linklar access-controlled repository’da bo‘lsin; ommaviy portfolioda faqat sintetik material ko‘rsating.",
        prompt: "Riskni qabul qilish uchun yakuniy javobgarlikni kim oladi?",
        answers: ["risk owner", "risk egasi"]
      }
    ]
  }),
  book({
    slug: "cloud-devsecops-operations",
    title: "Cloud, DevOps va platforma xavfsizligi",
    summary: "Cloud IAM, landing zone, network, IaC, containers, CI/CD, monitoring, backup va incident response’ni AWS/Azure/GCP kabi platformalarga ko‘chirishga tayyorlaydigan darslik.",
    category: "security", difficulty: "hard", hours: 36,
    labPlan: "Cloud vendor konsoliga ulanish shart emas: berilgan sintetik IAM policy, IaC diff, container manifest va log event’larini audit qiling.",
    references: [
      reference("AWS Well-Architected Framework — Security Pillar", "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html"),
      reference("Microsoft Cloud Adoption Framework — security", "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/secure/"),
      reference("Google Cloud Security Foundations Guide", "https://cloud.google.com/architecture/security-foundations"),
      reference("AWS Certified Security — Specialty", "https://aws.amazon.com/certification/certified-security-specialty/")
    ],
    chapters: [
      {
        title: "1. Cloud shared responsibility va account landing zone",
        content: "Cloud provayder fizik infrastruktura va boshqariladigan qatlamning bir qismini himoya qiladi; customer identity, data, configuration va xizmat turiga qarab workload security uchun javobgar bo‘lib qoladi. Shared responsibility modeli IaaS/PaaS/SaaS’da farq qiladi; xizmat nomiga qarab taxmin qilmang.\n\nLanding zone account/subscription/project tuzilmasi, guardrail, network, logging, identity, key management va billing owner’ni bir standartga keltiradi. Sandbox, dev, staging va production chegarasi, region/data residency va emergency access oldindan belgilanadi. Root/owner akkauntni kundalik automation’da ishlatmang.",
        example: "Account map: org → environment account → workload → owner → data classification → logging destination.",
        explanation: "Dizayn shabloni real account ID yoki cloud credentialni talab qilmaydi. Cloud resource inventari sensitive bo‘lishi mumkin.",
        prompt: "Cloud’da provayder va mijoz o‘rtasida taqsimlangan xavfsizlik javobgarligi modeli?",
        answers: ["shared responsibility", "shared responsibility model"]
      },
      {
        title: "2. Cloud IAM, federation va workload identity",
        content: "Cloud IAM role, policy, trust relationship va condition orqali principalga action/resource beradi. Wildcard action/resource convenience yaratadi, lekin blast radiusni oshiradi. Federation va short-lived workload identity statik key’ni kamaytiradi; trust policy’da issuer, audience, subject va environment cheklovini tekshiring.\n\nHuman admin MFA, JIT elevation, access review va break-glass monitoring bilan himoyalanadi. Service identity faqat zarur API action va resource’ga ega bo‘lsin; unused key, stale role va cross-account trust’ni inventar qiling. Deny policy va policy inheritance providerga xos bo‘lgani uchun effective access’ni test qiling.",
        example: "Review matrix: principal / trust source / actions / resources / conditions / last use / owner / expiry.",
        explanation: "Haqiqiy IAM policy’ni gist/chatga nusxalamang. Lab’da sintetik ARN, project ID va account name ishlating.",
        prompt: "Uzoq muddatli cloud key o‘rniga afzal ko‘riladigan vaqtinchalik identity credentials?",
        answers: ["short-lived credentials", "temporary credentials", "qisqa muddatli credential"]
      },
      {
        title: "3. Cloud network, workload isolation va egress",
        content: "VPC/VNet/project network design’da subnet, route, security group, network ACL, private endpoint, DNS, NAT gateway va egress policy’ni threat boundary bilan bog‘lang. Public IP yo‘qligi workload xavfsizligini o‘zi isbotlamaydi; control plane, metadata service, peering va identity ham ko‘rib chiqiladi.\n\nProd/non-prod, sensitive data va admin plane’ni ajrating. Egress allowlist va private service access monitoring talab qiladi; default deny noto‘g‘ri qo‘llansa dependency’lar uziladi. Flow log’da privacy va retention, incidentda region va account scope’ni hisobga oling. Cloud firewall vendor behavior’ini rasmiy doc va test bilan tasdiqlang.",
        example: "Flow matrix: source workload → destination service → port/protocol → business reason → logging → owner.",
        explanation: "Misol architecture review uchun. Haqiqiy cloud security group’ni o‘zgartirish production outage keltirishi mumkin.",
        prompt: "VPC ichidagi network traffic’ni kuzatish uchun keng tarqalgan log turi?",
        answers: ["flow log", "vpc flow log", "flow logs"]
      },
      {
        title: "4. Infrastructure as Code va configuration drift",
        content: "IaC tarmoq, IAM va resource konfiguratsiyasini version-controlled, review qilinadigan deklarativ kodga aylantiradi. Plan/diff’ni ko‘rmasdan apply qilmang; module source, provider version, state backend, lock va secret handling’ni tekshiring. State file resource ID, secret yoki konfiguratsiya qiymatini saqlashi mumkin, shuning uchun encryption va access control zarur.\n\nDrift detection real va desired state farqini ko‘rsatadi, ammo auto-remediation xavfli bo‘lishi mumkin. Policy-as-code guardrail’lari change pipeline’da test qilinsin. Naming, tag, owner, data class va lifecycle standardlarini avtomatlashtirish inventory va auditni osonlashtiradi.",
        example: "Review: terraform fmt -check\nTerraform plan’ni o‘qing; lab bo‘lmagan muhitda apply qilmang.",
        explanation: "Formatting tekshiruvi resource’ni o‘zgartirmaydi. Plan output’da sensitive field redaction va state access’ni tekshiring.",
        prompt: "Cloud resursini koddagi kerakli holat bilan taqqoslab ko‘rsatadigan IaC bosqichi?",
        answers: ["plan", "diff"]
      },
      {
        title: "5. Container, Kubernetes va runtime boundary",
        content: "Container image minimal base, pinned dependency, verified source, vulnerability scan va signed provenance bilan build qilinadi. Root bo‘lmagan user, read-only filesystem, dropped capability, resource limit va seccomp/AppArmor kabi runtime control’larni workload ehtiyojiga moslang. Secret’ni image layer yoki environment dump’da saqlamang.\n\nKubernetes’da namespace, service account, RBAC, network policy, admission control, secrets encryption, audit log va upgrade lifecycle muhim. Container boundary alohida kernel VM bilan teng emas. Cluster admin huquqini cheklang; manifestlarni policy va test bilan review qiling. Prod clusterda “kubectl apply”ni faqat approved pipeline va rollback orqali bajaring.",
        example: "Manifest review: runAsNonRoot / readOnlyRootFilesystem / resource requests+limits / serviceAccountName / network policy.",
        explanation: "Bu konfiguratsiya review checklist; to‘liq xavfsizlikni kafolatlamaydi. Testni disposable clusterda bajaring.",
        prompt: "Container jarayonini root bo‘lmagan user bilan ishga tushirish nazorati?",
        answers: ["runasnonroot", "run as non-root", "non-root"]
      },
      {
        title: "6. CI/CD, artifact provenance va release nazorati",
        content: "CI/CD pipeline source review, unit/integration test, dependency scan, secret check, artifact build, signature/provenance va deployment approval’ni bog‘laydi. Build runner izolyatsiyasi, token permission, untrusted contribution va cache poisoning riskini baholang. Artifact bir marta qurilib, muhitlar bo‘ylab aynan shu artifact sifatida ko‘tarilsin.\n\nDeploy canary yoki bosqichma-bosqich bo‘lsin; health gate, rollback trigger, database migration compatibility va feature flag’ni rejalang. Pipeline loglari secretni niqoblasin. SBOM va provenance incident vaqtida qaysi workload qaysi dependency’ni ishlatayotganini topishga yordam beradi.",
        example: "Release evidence: commit SHA / build identity / dependency manifest / signature / approval / deploy target / rollback.",
        explanation: "Sample record sintetik. Build badge yoki signature nimani tasdiqlashini verification policy’sida aniq belgilang.",
        prompt: "Bir build natijasi va uning kelib chiqishini tekshirishga oid dalil?",
        answers: ["provenance", "artifact provenance"]
      },
      {
        title: "7. Cloud monitoring, backup, cost va resilience",
        content: "Cloud observability’da metrics, logs, traces, audit events va provider health birlashtiriladi. Control-plane audit loglari identity va resource change’ni ko‘rsatadi; data-plane loglari workload request’larini beradi. Alert action’ga olib borishi, owner va runbook’ga ega bo‘lishi kerak. Cost anomaly security incident bo‘lishi mumkin, ammo o‘zi compromise isboti emas.\n\nBackup region, account, key va deletion permission bo‘yicha ajrating; immutable copy va restore test ransomware va operator xatosini kamaytiradi. Multi-AZ/region redundancy RTO/RPO, consistency, data residency, cost va dependency’ga ta’sir qiladi. Failover drill va restore report’ni saqlang; “backup enabled”ni recovery proof deb hisoblamang.",
        example: "Readiness check: audit coverage / alert owner / backup age / restore evidence / RPO/RTO / cost anomaly path.",
        explanation: "Cross-region backup data residency yoki privacy chekloviga zid bo‘lishi mumkin; transferni compliance owner bilan tekshiring.",
        prompt: "Backup nusxasidan tiklash amalda ishlashini ko‘rsatuvchi sinov?",
        answers: ["restore test", "restore drill", "tiklash sinovi"]
      },
      {
        title: "8. Senior platform engineer: SRE, postmortem va governance",
        content: "SRE yondashuvi xizmatning user-facing SLI, SLO va error budget’ini operatsion qarorga bog‘laydi. Error budget tugasa, reliability ishiga ustuvorlik berish release xavfini kamaytiradi. Platform jamoasi developer enablement, guardrails, paved road va self-service’ni yaratadi; biroq shared responsibility va team ownership’ni yashirmaydi.\n\nSenior cloud engineer architecture decision, threat model, compliance mapping, cost, vendor lock-in, failure domain, support plan va exit strategy’ni yozadi. Incident postmortem blame-free va action-oriented bo‘lsin. Platform metric’lari developer toil, deployment failure, recovery time, policy exception va service health’ni ko‘rsatsin. Katta riskni leadership tilida, taxmin va trade-off bilan tushuntiring.",
        example: "Service review: SLI/SLO / error budget / cost / security exceptions / restore evidence / toil / owner actions.",
        explanation: "SLO raqamlarini foydalanuvchi ehtiyoji va real telemetry’dan belgilang; boshqa jamoa maqsadini ko‘r-ko‘rona ko‘chirmang.",
        prompt: "Reliability uchun oldindan belgilangan xizmat maqsadi qisqartmasi?",
        answers: ["slo", "service level objective"]
      }
    ]
  }),
  book({
    slug: "iso-27001-isms",
    title: "ISO/IEC 27001:2022 — ISMS amaliyoti va auditga tayyorgarlik",
    summary: "ISMS konteksti, risk assessment, treatment, Statement of Applicability, nazorat dalillari, ichki audit va continual improvement bo‘yicha original amaliy darslik.",
    category: "security", difficulty: "hard", hours: 30,
    labPlan: "Sintetik kompaniya uchun ISMS scope, risk register, control mapping, SoA qarori, audit finding va corrective action yozish mashqlari.",
    references: [
      reference("ISO/IEC 27001:2022 — rasmiy standart sahifasi", "https://www.iso.org/standard/82875.html"),
      reference("ISO/IEC 27002:2022 — nazorat bo‘yicha yo‘riqnoma", "https://www.iso.org/standard/75652.html"),
      reference("NIST Cybersecurity Framework 2.0", "https://www.nist.gov/cyberframework")
    ],
    chapters: [
      {
        title: "1. ISMS maqsadi, kontekst va scope",
        content: "Information Security Management System (ISMS) tashkilot xavfsizlik riskini boshqarish, maqsad qo‘yish, nazoratni bajarish va yaxshilash uchun boshqaruv tizimidir. ISO/IEC 27001:2022 talablarini tashkilot konteksti, stakeholder ehtiyoji, qonuniy/contractual majburiyat, xizmat va joylashuv bilan bog‘lang. Scope haddan tashqari tor bo‘lsa, muhim dependency yoki ma’lumot tashqarida qolishi mumkin.\n\nScope bayonida boundary, interface, asset, site, service, supplier va exclusion asosini ko‘rsating. Top management mas’uliyati, policy, role, resurs, competence va review davri belgilanadi. Bu material standart matnining o‘rnini bosmaydi; rasmiy talablarni bajarish uchun amaldagi, litsenziyalangan ISO nashrini o‘qing.",
        example: "ISMS scope draft: tashkilot / xizmat / lokatsiya / in-scope data / external dependency / exclusions / approval / review date.",
        explanation: "Scope shabloni o‘quv misoli; sertifikatlash yoki compliance xulosasi bermaydi.",
        prompt: "ISMS nimaning qisqartmasi?",
        answers: ["information security management system", "isms"]
      },
      {
        title: "2. Risk mezoni, asset va risk assessment",
        content: "Risk assessment metodologiyasi ehtimol, ta’sir, risk appetite, vaqt oralig‘i va qabul qilish vakolatini izchil belgilashi kerak. Asset faqat server emas: ma’lumot, process, people, supplier, identity va cloud service ham qiymatga ega. Threat, vulnerability, existing control va consequence’ni bog‘lab scenario tuzing.\n\nRisk register’da owner, inherent/residual rating, evidence, treatment, due date va review trigger bo‘lsin. Ballar aniq ko‘rinsa ham, taxmin va uncertainty’ni yashirmang. Bir xil scoring scale’ni bo‘limlar bo‘yicha kalibrlang; riskni compliance checkboxga aylantirmang. Riskni qabul qilish vakolatli biznes risk egasining qarori bo‘lishi kerak.",
        example: "Risk: asset / threat scenario / weakness / impact / likelihood / current control / residual level / owner.",
        explanation: "Ballar shartli bo‘lishi mumkin; tashkilot tasdiqlagan metodologiya va risk appetite’dan foydalaning.",
        prompt: "Muayyan risk uchun javobgarlikni oladigan biznes roli?",
        answers: ["risk owner", "risk egasi"]
      },
      {
        title: "3. Risk treatment, control tanlash va SoA",
        content: "Risk treatment plan riskni kamaytirish, qabul qilish, boshqa tomonga o‘tkazish yoki faoliyatdan qochish qarorini qayd etadi. Control tanlash sababini risk, qonun, contract va biznes sharoiti bilan bog‘lang. Statement of Applicability (SoA) Annex A controls’ning qo‘llanish holati, inclusion/exclusion asoslari va implementation statusini izohlaydi.\n\nSoA universal copy-paste jadval bo‘lmasin: control mavjudligi, owner va evidence bilan tasdiqlansin. ISO/IEC 27001:2022 Annex A’da 93 ta reference control 4 tema bo‘yicha guruhlangan. Bu darslik standart matnini qayta nashr qilmaydi; amaldagi control wording’ni litsenziyalangan ISO nusxasidan tekshiring.",
        example: "SoA maydonlari: control reference / applicable? / rationale / implementation status / evidence owner / review.",
        explanation: "Bu ustunlar o‘quv shabloni, rasmiy Annex A matni emas. Rasmiy mappingni standartning amaldagi nashri bilan tekshiring.",
        prompt: "Qo‘llaniladigan nazorat va uning asosini jamlaydigan ISMS hujjati?",
        answers: ["statement of applicability", "soa"]
      },
      {
        title: "4. Policy, kompetensiya, supplier va nazorat amaliyoti",
        content: "Policy boshqaruv niyati va talabini ifodalaydi; procedure, standard, runbook va work instruction uni amaliyotga aylantiradi. Hujjatlarda owner, approver, version, scope, effective date va review interval bo‘lsin. Xodim competence va awareness’i role riskiga mos o‘lchanadi, faqat kursni tugatganlik emas.\n\nSupplier riskida due diligence, data flow, subprocessor, incident notification, access, exit plan va assurance report’ni shartnoma bilan bog‘lang. Control design’ni kundalik workflow ichiga qo‘shing: access request, patch, backup, change va incident. Exceptionlar risk owner, compensating control, expiry va approval bilan boshqarilsin.",
        example: "Policy lifecycle: draft → owner review → legal/privacy/security check → approval → communication → evidence → periodic review.",
        explanation: "Haqiqiy shartnoma yoki vendor security report’ni ochiq kursga joylamang; sintetik misol bilan mashq qiling.",
        prompt: "Control requirement’ni bajarish uchun detail step-by-step operational hujjat?",
        answers: ["procedure", "protsedura"]
      },
      {
        title: "5. Performance evaluation, ichki audit va evidence",
        content: "ISMS performance evaluation control effectiveness, objective, metric, audit, management review va action follow-up’ni qamrab oladi. Auditor mezon, scope, sample, method va evidence’ni oldindan belgilaydi; intervyu, record review va observation’ni uyg‘unlashtiradi. Audit mustaqilligi uchun auditor o‘zi boshqargan control’ni baholamasligi kerak.\n\nEvidence ishonchli, sanali, ownerga tegishli va qayta tekshiriladigan bo‘lsin. Screenshotning o‘zi source, scope yoki access nazoratini isbotlamasligi mumkin. Finding’da criterion, objective evidence, gap, risk va corrective action farqlanadi. Auditni “hujjat bor” deb yopmang: nazorat amalda ishlaganini sampling bilan tekshiring.",
        example: "Audit note: criterion / sample / evidence source / observed fact / gap / risk / owner response.",
        explanation: "Audit dalilini access-controlled joyda saqlang, keraksiz shaxsiy ma’lumotni ko‘chirmang.",
        prompt: "Nazorat amalda ishlashini tekshirish uchun auditor yig‘adigan ishonchli ma’lumot?",
        answers: ["evidence", "dalil"]
      },
      {
        title: "6. Nonconformity, corrective action va root cause",
        content: "Nonconformity — talab va amaliy holat o‘rtasidagi dalil bilan ko‘rsatilgan tafovut. Corrective action faqat symptomni tuzatish emas; sababni aniqlab, qayta sodir bo‘lish ehtimolini kamaytiradi. Immediate correction, root-cause analysis, action owner, due date va effectiveness check’ni ajrating.\n\nBlameless tahlilda process, role, resource, technology va oversight’ni tekshiring. “Xodim e’tiborsiz edi” ko‘pincha root cause emas; noaniq instruction, noto‘g‘ri tool yoki review gap bo‘lishi mumkin. Action’ni yopishdan oldin evidence va effectiveness criterion belgilang.",
        example: "CAPA: finding → correction → root cause → corrective action → owner/due date → effectiveness evidence.",
        explanation: "CAPA atamasi turli tizimlarda ishlatiladi; tashkilotingizdagi formal workflow va terminology’ga amal qiling.",
        prompt: "Nomuvofiqlik sababini bartaraf etib, qayta sodir bo‘lishni kamaytiruvchi amal?",
        answers: ["corrective action", "tuzatuvchi chora"]
      },
      {
        title: "7. Management review va continual improvement",
        content: "Management review’da oldingi action, kontekst o‘zgarishi, risk statusi, audit, objective, incident, supplier, resurs va improvement opportunity ko‘rib chiqiladi. Qaror, owner, resurs, due date va kutilgan natijani qayd qiling. Rahbariyatga risk trendini biznes xizmat, mijoz, regulatory exposure va investment bilan bog‘lab bering.\n\nContinual improvement yangi technology sotib olish degani emas; stale access, restore drill, incident detection, policy adoption yoki supplier visibility’ni yaxshilash bo‘lishi mumkin. KPI bajarilishi control samaradorligiga teng emas. Trend va sifatli dalilni birga ko‘rib, riskni qayta baholang.",
        example: "Review dashboard: objective status / significant change / risk trend / incident / audit / supplier / decisions and owners.",
        explanation: "Agregat ko‘rsatkichlar bilan shaxsiy ma’lumotni kamaytiring. Rahbariyat qarori va follow-up evidence’ni saqlang.",
        prompt: "ISMSni muntazam qayta baholab yaxshilash jarayoni?",
        answers: ["continual improvement", "uzluksiz yaxshilash"]
      },
      {
        title: "8. Sertifikatlashga tayyorlik va kasbiy chegaralar",
        content: "Certification readiness gap assessment, scope, risk, SoA, internal audit, management review, corrective action va evidence consistency’ni tekshiradi. Sertifikatsiya organi mustaqil audit qiladi; ichki kursni tugatish, template to‘ldirish yoki bitta audit report sertifikat bermaydi. Talablar tashkilot konteksti va amaldagi standard edition’ga mos bo‘lishi kerak.\n\nKonsultant yoki auditor rolida manfaatlar to‘qnashuvi, confidentiality va audit independence’ni ochiq boshqaring. Standard matnini ruxsatsiz nusxalamang va “ISO compliant” degan da’voni tekshirilmagan holda bermang. Bu darslik umumiy ta’lim; rasmiy qaror uchun akkreditatsiya, litsenziya va malakali mutaxassis talablarini tekshiring.",
        example: "Readiness evidence index: requirement map / record owner / current evidence / gap / action / verification date.",
        explanation: "Hujjatlar ro‘yxati sertifikatsiya kafolati emas. Rasmiy audit va tegishli standart nusxasi mustaqil ravishda talab qilinadi.",
        prompt: "ISO/IEC 27001 sertifikatini kurs platformasi emas, kim beradi?",
        answers: ["akkreditatsiyalangan sertifikatlash organi", "certification body", "sertifikatlash organi"]
      }
    ]
  }),
  book({
    slug: "gdpr-privacy-engineering",
    title: "GDPR va privacy engineering: huquqiy talabdan texnik nazoratgacha",
    summary: "GDPR principles, lawful basis, role, data subject rights, DPIA, breach workflow, processor va cross-border transfer’larni texnik/jarayon nazoratlariga bog‘laydigan darslik.",
    category: "security", difficulty: "hard", hours: 28,
    labPlan: "Faqat sintetik shaxsiy ma’lumotlar bilan data inventory, lawful-basis mapping, subject request, DPIA va breach tabletop mashqlari.",
    references: [
      reference("EU GDPR — Regulation (EU) 2016/679", "https://eur-lex.europa.eu/eli/reg/2016/679/oj"),
      reference("EDPB — SME data protection guide", "https://www.edpb.europa.eu/sme-data-protection-guide_en"),
      reference("European Commission — data protection rules", "https://commission.europa.eu/law/law-topic/data-protection_en")
    ],
    chapters: [
      {
        title: "1. GDPR doirasi, shaxsiy ma’lumot va role",
        content: "GDPR personal data’ni aniqlangan yoki aniqlanishi mumkin bo‘lgan jismoniy shaxsga taalluqli ma’lumot deb belgilaydi; pseudonymized data ham qo‘shimcha ma’lumot bilan bog‘lanishi mumkin. Controller maqsad va vositani belgilaydi, processor controller nomidan ishlov beradi; ayrim holatlarda joint controllership bo‘lishi mumkin. Territorial scope’ni tashkilot, shaxs va processing kontekstiga qarab huquqiy mutaxassis baholaydi.\n\nData inventory’da kategoriya, maqsad, subject, source, recipient, location, retention, access va legal basis ko‘rsating. “Anonim” deb aytishdan oldin qayta aniqlash xavfini tekshiring. GDPR barcha vaziyatga bir xil tatbiq etiladi deb taxmin qilmang; O‘zbekiston, boshqa qonunlar va shartnomalar ham qo‘shimcha talab qo‘yishi mumkin.",
        example: "Record: data category / purpose / subjects / controller-processor role / source / recipients / retention / security owner.",
        explanation: "Faqat synthetic data ishlating. Role va territorial scope bo‘yicha yakuniy xulosa yuridik maslahat talab qilishi mumkin.",
        prompt: "Processing maqsadi va vositasini belgilovchi GDPR roli?",
        answers: ["controller", "nazorat qiluvchi"]
      },
      {
        title: "2. Principles, lawful basis va purpose limitation",
        content: "GDPR principles lawful, fair and transparent processing; purpose limitation; data minimisation; accuracy; storage limitation; integrity/confidentiality; accountability’ni o‘z ichiga oladi. Har maqsad uchun Article 6 lawful basis aniqlanadi; consent barcha ishlovga majburiy yagona asos emas. Special-category data uchun qo‘shimcha shartlar bo‘lishi mumkin.\n\nMaqsadni keyin kengaytirishdan oldin compatibility, notice, legal basis va retention’ni qayta baholang. Privacy notice aniq, tushunarli va processingga mos bo‘lsin. Consent ishlatilsa, erkin berilgan, aniq, xabardor, isbotlanadigan va qaytarib olish oson bo‘lishi kerak. Bu huquqiy baholash; mahsulot jamoasi DPO/legal counsel bilan ishlasin.",
        example: "Purpose map: purpose → data needed → legal basis → notice text → retention → recipient → withdrawal/objection path.",
        explanation: "Bu o‘quv jadvali huquqiy asosni o‘zi tanlab bermaydi. Har processing uchun legal owner bilan tasdiqlang.",
        prompt: "GDPR’da ma’lumotni belgilangan maqsad uchun zaruridan ortiq yig‘maslik prinsipi?",
        answers: ["data minimisation", "data minimization", "ma’lumotlarni minimallashtirish"]
      },
      {
        title: "3. Data subject rights va so‘rov workflow",
        content: "GDPR data subject’ga tegishli sharoitlarda access, rectification, erasure, restriction, portability, objection va automated decision bo‘yicha huquqlar beradi. Har huquq mutlaq emas; istisno va muddatlar vaziyatga qarab qo‘llanadi. So‘rovni qabul qiluvchi support xodimi identity’ni mutanosib tekshiradi, ammo ortiqcha ID nusxasini yig‘maydi.\n\nWorkflow’da receive date, scope, systems, controller/processor, legal exception, approver, response deadline va secure delivery qayd etiladi. Data discovery uchun indekslangan manbalar va retention map kerak. O‘chirish so‘rovi backup va legal hold bilan murakkablashishi mumkin; tizimning texnik chegarasi va keyingi expiry sanasini aniq tushuntiring.",
        example: "DSR ticket: request type / received UTC / identity check method / systems searched / exception review / response owner / due date.",
        explanation: "So‘rovni real shaxsdan olgandek ishlamang; lab’da sintetik profil qo‘llang. Qonuniy muddatni amaldagi matn va counsel bilan tekshiring.",
        prompt: "Shaxsga o‘z ma’lumotiga kirish imkonini beruvchi huquq?",
        answers: ["right of access", "access", "kirish huquqi"]
      },
      {
        title: "4. DPIA, privacy by design va risk",
        content: "DPIA processing shaxs huquqiga yuqori risk keltirishi mumkin bo‘lgan holatlarda tizimli tavsif, zarurat/proportionality, risk va mitigation’ni baholaydi. DPIA barcha loyiha uchun avtomatik talab emas; GDPR mezonlari, supervisory authority guidance va tashkilot threshold’i asosida baholanadi. DPO yoki privacy owner’ni erta jalb qiling.\n\nPrivacy by design/default’da default setting minimal ma’lumot, cheklangan retention, role-based access, pseudonymization, encryption va foydalanuvchiga shaffoflikni qo‘llab-quvvatlaydi. Data flow diagram va trust boundary texnik qarorni ko‘rsatadi. Qolgan yuqori riskni yashirmasdan huquqiy maslahat va kerakli supervisory consultation’ga yo‘naltiring.",
        example: "DPIA outline: processing / necessity / data flow / affected people / risk scenario / safeguards / residual risk / approval.",
        explanation: "DPIA shabloni legal determination emas. Yuqori residual risk holatini DPO/legal counsel orqali baholang.",
        prompt: "Yuqori data protection riskini tizimli baholash hujjati?",
        answers: ["dpia", "data protection impact assessment"]
      },
      {
        title: "5. Processor, supplier va xalqaro uzatish",
        content: "Processor bilan shartnoma processing subject, duration, purpose, data type, instruction, confidentiality, security, subprocessor, rights assistance, breach notice, deletion/return va audit bo‘yicha talablarni belgilaydi. Supplier risk assessment’da service dependency, access, data location, support channel, resilience va exit plan ko‘rib chiqiladi.\n\nEEA/uchinchi davlat transfer qoidalari va transfer mechanism’lari o‘zgarishi mumkin; adequacy, safeguards va supplementary measure’larni amaldagi qonun hamda EDPB guidance bo‘yicha baholang. Region tanlashning o‘zi barcha transfer majburiyatini hal qilmaydi. Vendor security claim’ini mustaqil evidence va contract bilan tekshiring.",
        example: "Supplier map: data categories / processing role / subprocessor / transfer location / security evidence / exit/deletion.",
        explanation: "Haqiqiy DPA yoki supplier report’ni ommaga chiqarmang. Transfer bo‘yicha qarorni yuridik va privacy mutaxassisi bilan tasdiqlang.",
        prompt: "Controller nomidan shaxsiy ma’lumotni qayta ishlaydigan taraf?",
        answers: ["processor", "qayta ishlovchi"]
      },
      {
        title: "6. Personal data breach va 72 soatlik jarayon",
        content: "Personal data breach confidentiality, integrity yoki availability’ga ta’sir qiluvchi security breach bo‘lishi mumkin. Incidentni tasniflashda ma’lumot turi, subject soni, shifrlash, real access, ehtimoliy zarar va containment ko‘rib chiqiladi. GDPR Article 33 bo‘yicha controller, tegishli holatlarda, supervisory authority’ga xabarnomani imkon qadar tez va odatda xabardor bo‘lganidan keyin 72 soatdan kechiktirmay yuboradi; breach huquq va erkinliklarga risk tug‘dirishi ehtimoli bo‘lmasa istisno qo‘llanishi mumkin. Processor controller’ni undue delay’siz xabardor qiladi. Article 34 bo‘yicha yuqori risk holatlarida data subject’ga ham undue delay’siz xabar berish talabi bo‘lishi mumkin.\n\nSubprocessor va internal team escalation muddatni kutmasdan ishga tushsin. Incident log’da aniqlash va awareness vaqti, scope, data, ta’sir, chora, risk, notification qarori va approver qayd etilsin. Har bir breach data subject’ga xabarni avtomatik anglatmaydi; istisno va threshold’ni legal/DPO owner bilan baholang, sababni hujjatlashtiring.",
        example: "Tabletop timeline: detection → privacy/security escalation → scope → risk decision → authority/data subject decision → evidence → lessons.",
        explanation: "72 soatdan kech xabar berilsa kechikish sababi ko‘rsatilishi kerak. Bu darslik legal advice emas; aniq deadline, risk threshold va notification matnini counsel/DPO hamda supervisory authority guidance’dan tekshiring.",
        prompt: "GDPR breach xabarini supervisory authority’ga yuborish bo‘yicha controllerning birinchi darajali mas’ul roli?",
        answers: ["controller", "nazorat qiluvchi"]
      },
      {
        title: "7. Retention, minimallashtirish va privacy-preserving telemetry",
        content: "Storage limitation ma’lumotni belgilangan maqsad uchun zarur muddatdan ortiq saqlamaslikni talab qiladi; universal retention raqami yo‘q. Retention schedule’da data category, trigger, period, legal hold, backup expiry, deletion method va owner bo‘lsin. O‘chirish operatsiyasi auditli va tiklanish xavfiga mos bo‘lishi kerak.\n\nSecurity logging xavfsizlik uchun kerak bo‘lsa ham, ortiqcha payload, token, parol va sensitive category yozmang. Pseudonymization, aggregation, access logging, encryption, sampling va short retention’ni ko‘rib chiqing. Kichik cohort’ni agregatsiya qilish qayta aniqlash xavfini bartaraf etmaydi. Privacy risk assessment’da downstream analytics va vendor sharing’ni ham qo‘shing.",
        example: "Retention table: purpose / category / source / active period / archive / deletion trigger / backup expiry / exception.",
        explanation: "Periodlarni yuridik majburiyat, biznes maqsadi va privacy riskga qarab belgilang; universal qiymat yo‘q.",
        prompt: "Shaxsni bevosita ko‘rsatmaydigan, ammo qo‘shimcha kalit bilan qayta bog‘lanishi mumkin bo‘lgan ma’lumot?",
        answers: ["pseudonymized data", "pseudonymisation", "pseudonimlashtirilgan"]
      },
      {
        title: "8. Privacy governance va amaliy cheklovlar",
        content: "Privacy program ROPA, policy, training, DSR workflow, DPIA trigger, supplier review, incident process, retention, access control va audit evidence’ni yagona ownership bilan boshqaradi. DPO vazifasi va mustaqilligi tashkilot hamda qonuniy shartlarga bog‘liq; har jamoaga avtomatik DPO kerak deb bo‘lmaydi.\n\nSenior privacy engineer/legal partner texnik dizaynni huquqiy talab bilan bog‘laydi, ammo muhandis yakka o‘zi qonuniy talqin bermasligi kerak. Mahalliy qonunlar, sektor talabi, sud qarori va EDPB guidance yangilanib turadi. Kurs materialini loyiha boshlanishida tekshiring, real vaziyat bo‘yicha counsel’ga murojaat qiling va privacy notice’ni processing amaliyotiga mos tuting.",
        example: "Privacy review gate: data purpose / lawful basis owner / DPIA check / transfer / retention / security / notice / approval.",
        explanation: "Ushbu dars ta’limiy va yurisdiksiya bo‘yicha legal advice emas. Rasmiy GDPR matni va hozirgi guidance’ni tekshiring.",
        prompt: "GDPR bo‘yicha rasmiy supervisory guidance chiqaruvchi Yevropa organi qisqartmasi?",
        answers: ["edpb", "european data protection board"]
      }
    ]
  }),
  book({
    slug: "senior-infrastructure-architecture",
    title: "Senior infratuzilma va xavfsizlik arxitekturasi",
    summary: "Senior/lead darajadagi reliability, architecture decision, risk appetite, capacity, disaster recovery, supplier governance va texnik rahbarlikni o‘rgatuvchi capstone darslik.",
    category: "security", difficulty: "hard", hours: 32,
    labPlan: "Sintetik biznes holati uchun arxitektura qaror yozuvi, failure-mode tahlili, RTO/RPO, threat model, audit evidence va executive brief tayyorlash.",
    references: [
      reference("NIST Cybersecurity Framework 2.0", "https://www.nist.gov/cyberframework"),
      reference("NIST SP 800-34 Rev. 1 — contingency planning", "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final"),
      reference("Google SRE Workbook", "https://sre.google/workbook/table-of-contents/"),
      reference("NIST NICE Framework — work roles and competencies", "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center"),
      reference("NIST SP 800-181 Rev. 1 — NICE Framework", "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-181r1.pdf")
    ],
    chapters: [
      {
        title: "1. Architecture decision, trade-off va ADR",
        content: "Senior arxitektor talab va cheklovlarni aniqlab, variantlarni cost, reliability, security, privacy, operability, team skill va exit cost bo‘yicha solishtiradi. ADR qarorni, ko‘rib chiqilgan alternativani, sababni, ta’sirni va review trigger’ni saqlaydi. “Best practice” kontekstsiz qo‘llansa, yangi failure mode yoki operatsion yuk yaratishi mumkin.\n\nDecision owner va risk owner’ni farqlang; kim qaror qilishi, kim maslahat berishi va kim bajarishi aniq bo‘lsin. Assumption va uncertainty’ni yashirmang. Arxitektura diagrammasi trust boundary, data flow, dependency, failure domain va monitoring’ni ko‘rsatsin.",
        example: "ADR table: context / options / decision / consequences / risks / owner / revisit trigger.",
        explanation: "Hujjatda mijoz, provayder yoki ichki tarmoqning maxfiy detalini oshkor qilmang.",
        prompt: "Muqobil yechimlar va qaror oqibatlarini qayd etuvchi hujjat?",
        answers: ["adr", "architecture decision record"]
      },
      {
        title: "2. Reliability, SLI/SLO, error budget va failure mode",
        content: "Reliability service contract va user journey bilan boshlanadi. SLI o‘lchanadigan ko‘rsatkich, SLO maqsad, SLA esa shartnomaviy va’da bo‘lishi mumkin; ularni bir xil deb ishlatmang. Error budget release tezligi va reliability investitsiyasini muhokama qilishga yordam beradi. Latency’da p50/p95/p99, availability’da successful request va denominator’ni aniq tanlang.\n\nFMEA/failure-mode analysis component failure, detection, impact, recovery control’ni sistematik ko‘rib chiqadi. Dependency outage, DNS, identity, certificate, quota, regional outage, clock, human error va data corruption’ni model qiling. Alert symptom’ga yaqin bo‘lsin; root cause alerting noise’ni kuchaytirishi mumkin.",
        example: "SLI: muvaffaqiyatli request / barcha valid request; SLO: belgilangan oynadagi foiz va exclusion qoidasi.",
        explanation: "SLO qiymatini real user need, baseline va business risk’dan oling; bu universal target emas.",
        prompt: "Service level indicator qisqartmasi?",
        answers: ["sli", "service level indicator"]
      },
      {
        title: "3. Capacity, scalability va iqtisodiy qaror",
        content: "Capacity planning traffic, concurrency, storage growth, retention, CPU/memory, I/O, network egress, quota va peak season’ni o‘lchaydi. Autoscaling latency yoki queue depth bo‘yicha ishlashi mumkin, ammo cold start, downstream limit va cost spike’ni hisobga olsin. Load test faqat test data va muhitda, tasdiqlangan scope va rate limit bilan bajariladi.\n\nVertical/horizontal scale, caching, batching, async queue va data partition’ning trade-off’larini yozing. Unit economics va cost allocation tag’lari platforma boshqaruvining bir qismi. Kutilmagan xarajat incident signal bo‘lishi mumkin, lekin avval deployment, usage pattern, quota va billing delay’ni tasdiqlang.",
        example: "Forecast: baseline / peak / growth / retention / headroom / quota / cost per unit / trigger / owner.",
        explanation: "Load test target’a ruxsat bo‘lishi shart; provider quota va billing exposure’ni oldindan tekshiring.",
        prompt: "Traffic oshganda resursni avtomatik ko‘paytirish/buxtirish capability?",
        answers: ["autoscaling", "auto scaling"]
      },
      {
        title: "4. Business continuity, backup va disaster recovery",
        content: "Business impact analysis muhim process, dependency, acceptable downtime va data loss’ni belgilaydi. RTO tiklash vaqti, RPO qabul qilinadigan ma’lumot yo‘qotish oralig‘i. Hot/warm/cold recovery usuli cost, recovery speed, data consistency va staffing bilan farq qiladi.\n\nDR plan’da trigger, decision authority, contact, backup key, network/DNS, identity, vendor, restore order, validation va return-to-primary bosqichi bo‘lsin. Backup integrity, immutable copy, access separation va restore testni ko‘rsating. Failover drill vaqtida customer impact va data residency’ni ham tekshiring; faqat “replica bor” degani disaster readiness emas.",
        example: "DR runbook: trigger / approver / dependency order / restore / validation / communication / failback / evidence.",
        explanation: "Mashqni izolyatsiyalangan lab’da bajaring; prod failover uchun business owner va change authority roziligi zarur.",
        prompt: "Tiklashdan keyin qabul qilinadigan ma’lumot yo‘qotish oynasi?",
        answers: ["rpo"]
      },
      {
        title: "5. Security/privacy architecture va residual risk",
        content: "Architecture review identity plane, management plane, data plane, trust boundary, secrets, logging, encryption, supplier, recovery, privacy rights va deletion path’ni qamrab oladi. Defense in depth bir xil nosoz control’ni takrorlash emas; qatlamlar turli failure mode’ni kamaytirishi kerak. Threat model va DPIA/ISMS risk register’lar o‘zaro reference’ga ega bo‘lsin.\n\nControl mavjudligini configuration, test va telemetry dalili bilan tekshiring. Residual risk’ni risk owner qabul qiladi; engineering lead o‘z vakolatidan tashqaridagi riskni yashirmaydi. Emergency exception scope va expiry bilan bo‘lsin. Security acceptance’ni release gate, support model va incident runbook’ga bog‘lang.",
        example: "Review: data / identity / trust boundary / threats / controls / evidence / residual risk / owner / expiry.",
        explanation: "Review shabloni huquqiy, xavfsizlik yoki sertifikatlash qarorini avtomatik chiqarmaydi.",
        prompt: "Nazoratdan keyin ham qolayotgan xavf?",
        answers: ["residual risk", "qolgan risk"]
      },
      {
        title: "6. Change governance, supplier va service ownership",
        content: "Reliable change process urgency, risk, test evidence, approval, implementation owner, rollback, monitoring va communication’ni boshqaradi. CAB barcha kichik o‘zgarishlarga to‘siq bo‘lishi shart emas; standart, normal va emergency change’ni riskka mos ajrating. Emergency change’da keyingi review va evidence talabini bekor qilmang.\n\nService catalog’da owner, dependency, support window, data class, recovery target, vendor contact va lifecycle bo‘lsin. Supplier review SLA, incident notice, subprocessor, access, exit, audit evidence va resilience’ni qamrab oladi. Vendor lock-in va support end-of-life arxitektura qaroriga ta’sir qiladi.",
        example: "Service ownership card: accountable owner / technical owner / dependencies / support / recovery / supplier / review date.",
        explanation: "Vendor contract va internal contact maxfiy bo‘lishi mumkin; o‘quv mashqida sintetik qiymat ishlating.",
        prompt: "Xizmatning biznes natijasi va riskiga yakuniy javob beruvchi rol?",
        answers: ["service owner", "xizmat egasi"]
      },
      {
        title: "7. Executive communication, mentorship va decision quality",
        content: "Lead muhandis rahbariyatga riskni ehtimol, ta’sir, variant, cost, vaqt, noaniqlik va qaror kerak bo‘lgan sana bilan tushuntiradi. “Critical vulnerability bor” kabi xabar asset, exposure, known exploitation evidence, mitigation, business impact va qaror owner’ini ko‘rsatishi kerak. Noaniqlikni yashirish qisqa muddatda qulay, uzoq muddatda ishonchni yemiradi.\n\nMentorship’da vazifani bajarib berishdan ko‘ra fikrlash jarayonini ko‘rsating: hypothesis, safe test, evidence, rollback va review. Jamoa incident’dan o‘rganishi uchun blameless culture va accountability ikkalasi ham zarur. Technical debt, on-call load, burnout va documentation quality’ni capacity rejasiga qo‘shing.",
        example: "Executive brief: what happened / who impacted / current confidence / options / residual risk / decision requested.",
        explanation: "Brieflar faqat kerakli auditoriyaga yuborilsin; incident tafsilotini public channel’da oshkor qilmang.",
        prompt: "Noto‘g‘ri qaror uchun kim javob beradi va riskni rasmiy qabul qiladi?",
        answers: ["decision owner", "risk owner"]
      },
      {
        title: "8. Senior capstone: tizimni boshidan oxirigacha himoyalash",
        content: "Capstone’da sintetik kompaniya uchun asset inventory, context, architecture diagram, threat model, SLO, backup/DR, IAM matrix, logging plan, privacy review, ISO/GDPR mapping va incident playbook yarating. Har artefact bir xil scope va owner bilan bog‘langan bo‘lsin. Tavsiya etilgan control’lar biznes talabiga mosligi va residual risk bilan asoslanadi.\n\nNIST NICE work role va task/competency lug‘atini o‘quv natijalarini rollarga xaritalash uchun ishlating; vakansiya nomini framework roliga aynan tenglashtirmang. Rubrika: texnik aniqlik, operatsion bajariluvchanlik, recovery evidence, privacy minimization, risk ownership, cost/trade-off, testability va aniq yozuv. Capstone kurs yakuniy o‘quv ishi bo‘lib, ish tajribasi, akkreditatsiyalangan sertifikat yoki senior malaka tasdig‘i emas. Natijani portfolio’ga qo‘yishda faqat sintetik ma’lumot ishlating.",
        example: "Deliverables: 1) architecture + flows 2) risk register 3) control map 4) SLO/DR 5) incident exercise 6) executive summary 7) NICE task/competency evidence map.",
        explanation: "Barcha artefactlar o‘zaro izchil, versiyalangan va synthetic bo‘lsin. Haqiqiy kompaniya dizaynini ruxsatsiz e’lon qilmang.",
        prompt: "Senior capstone’ning texnik yechimdan tashqari asosiy baholash mezoni?",
        answers: ["operability", "operatsion bajariluvchanlik", "risk ownership", "testability"]
      }
    ]
  })
];

type PathInput = {
  slug: string;
  kind: LearningPath["kind"];
  title: string;
  summary: string;
  prerequisites: string;
  outcomes: string;
  capstone: string;
  modules: string[];
  hours: string;
};

function path(data: PathInput): LearningPath {
  return {
    slug: data.slug,
    kind: data.kind,
    title: l(data.title),
    summary: l(data.summary),
    timeEstimate: l(`Taxminan ${data.hours} soat: darslar, takrorlash, mustaqil amaliyot va yakuniy loyiha. Haqiqiy vaqt tajriba va o‘qish sur’atiga qarab farq qiladi.`),
    prerequisites: l(data.prerequisites),
    outcomes: l(data.outcomes),
    capstone: l(data.capstone),
    modules: data.modules
  };
}

export const careerLearningPaths: LearningPath[] = [
  path({
    slug: "linux-systems-administrator",
    kind: "jobRole",
    title: "Linux tizim administratori",
    summary: "Juniordan senior operatsiyagacha Linux, tarmoq, storage, hardening, automation va incident boshqaruvi.",
    prerequisites: "Boshlash uchun oldingi IT tajribasi shart emas; terminal va inglizcha texnik atamalarni muntazam o‘rganishga tayyor bo‘ling.",
    outcomes: "Linux user/permission, systemd/log, storage, DNS/network, patch/hardening, automation va restore jarayonlarini dalil bilan tekshirasiz.",
    capstone: "Sintetik xizmat uchun architecture, least-privilege access, monitoring, backup/restore runbook, patch plan va incident postmortem tayyorlang. Rubrika: to‘g‘rilik, rollback, evidence, RPO/RTO va owner.",
    modules: ["computer-science-core", "linux-fundamentals", "linux-systems-administration", "network-engineering-advanced", "senior-infrastructure-architecture"],
    hours: "110–150"
  }),
  path({
    slug: "windows-enterprise-administrator",
    kind: "jobRole",
    title: "Windows va Active Directory administratori",
    summary: "Windows Server, AD DS, DNS, GPO, identity security, audit va disaster recovery uchun kasbiy yo‘l.",
    prerequisites: "Oldingi tajriba majburiy emas; Windows ish stoli va buyruq satri bilan tanishish foydali.",
    outcomes: "AD/DNS holati, GPO natijasi, privileged identity, Windows event, patch va backup recovery’ni tekshirib, xavfsiz change hujjatlashtirasiz.",
    capstone: "Sintetik korxona uchun domain/OU/GPO xaritasi, access review, event triage, recovery va change rollback rejasini yarating. Rubrika: minimal privilege, sinov, dalil va tiklash.",
    modules: ["computer-science-core", "windows-fundamentals", "active-directory-security", "windows-active-directory-operations", "soc-incident-response-detection"],
    hours: "100–140"
  }),
  path({
    slug: "network-engineer",
    kind: "jobRole",
    title: "Tarmoq muhandisi",
    summary: "Support asoslaridan enterprise switching/routing, firewall, Wi-Fi, troubleshooting va senior change governance’gacha.",
    prerequisites: "Oldingi tajriba shart emas; IP va subnet hisoblashni mashq qilishga tayyor bo‘ling.",
    outcomes: "Address plan tuzasiz, VLAN/routing/DNS muammosini qatlamma-qatlam aniqlaysiz, traffic flow va firewall change’ni dalil bilan ko‘rib chiqasiz.",
    capstone: "Sintetik ko‘p saytli topologiya, IPv4/IPv6 jadvali, segmentatsiya, HA/failover, monitoring va rollback plan tayyorlang. Rubrika: routability, blast radius, privacy va takrorlanuvchi test.",
    modules: ["computer-science-core", "network-fundamentals", "network-engineering-advanced", "mikrotik-routeros-basics", "wifi-security", "senior-infrastructure-architecture"],
    hours: "120–170"
  }),
  path({
    slug: "soc-analyst-to-incident-lead",
    kind: "jobRole",
    title: "SOC tahlilchisi va incident response",
    summary: "Log asoslaridan detection engineering, hunting, incident handling va SOC lead metrikalarigacha.",
    prerequisites: "Oldingi xavfsizlik tajribasi talab qilinmaydi; tarmoq va operatsion tizim asoslari yo‘l ichida beriladi.",
    outcomes: "Sintetik loglarda alertni triage qilasiz, vaqt chizig‘i tuzasiz, detection scope’ini yozasiz va escalation/containment qarorini asoslay olasiz.",
    capstone: "Sintetik incident case’da timeline, evidence manifest, ATT&CK mapping, response decision, uncertainty, notification owner va lessons-learned action’larini tayyorlang. Rubrika: dalil, maxfiylik, scope va xavfsiz tavsiya.",
    modules: ["computer-science-core", "network-fundamentals", "linux-fundamentals", "windows-fundamentals", "soc-log-analysis", "active-directory-security", "soc-incident-response-detection"],
    hours: "130–180"
  }),
  path({
    slug: "security-engineer",
    kind: "jobRole",
    title: "Kiberxavfsizlik muhandisi",
    summary: "Blue-team, secure software, risk, identity, vulnerability lifecycle va architecture review bo‘yicha rivojlanish yo‘li.",
    prerequisites: "Boshlang‘ich bilim yetarli; dastur, tarmoq va tizimlar bo‘yicha mustaqil mashq tavsiya etiladi.",
    outcomes: "Threat model tuzasiz, secure design talabini testga aylantirasiz, finding’ni riskka ko‘ra ustuvorlab, nazorat dalilini taqdim qilasiz.",
    capstone: "Sintetik web-service uchun data flow, threat model, ASVS talabi, access matrix, dependency evidence, logging/retention va remediation plan tayyorlang. Rubrika: testable requirements, safe scope, residual risk va evidence.",
    modules: ["computer-science-core", "intro-cybersecurity", "web-security-owasp", "soc-incident-response-detection", "security-engineering-appsec", "senior-infrastructure-architecture"],
    hours: "140–190"
  }),
  path({
    slug: "cloud-devsecops-engineer",
    kind: "jobRole",
    title: "Cloud va DevSecOps muhandisi",
    summary: "Linux/network asoslaridan cloud IAM, IaC, container security, CI/CD va SRE boshqaruvigacha.",
    prerequisites: "Oldingi cloud tajribasi shart emas; asosiy tarmoq va buyruq satrini o‘rganish zarur.",
    outcomes: "Cloud policy va IaC diff’ni review qilasiz, CI/CD supply chain riskini aniqlaysiz, monitoring, backup va recovery evidence yozasiz.",
    capstone: "Synthetic cloud workload uchun account map, least-privilege IAM, private data flow, IaC review, release provenance, SLO va restore drill hujjatini tuzing. Rubrika: risk, rollback, auditability, cost va privacy.",
    modules: ["computer-science-core", "linux-fundamentals", "network-engineering-advanced", "security-engineering-appsec", "cloud-devsecops-operations", "senior-infrastructure-architecture"],
    hours: "130–180"
  }),
  path({
    slug: "iso27001-grc-practitioner",
    kind: "jobRole",
    title: "ISO 27001 va GRC mutaxassisi",
    summary: "ISMS, risk, SoA, control evidence, audit, corrective action va management review’ni amaliy mashq qilish.",
    prerequisites: "IT tajribasi foydali, ammo majburiy emas; tashkilot jarayonlari va aniq yozishga qiziqish talab etiladi.",
    outcomes: "ISMS scope va risk register tuzasiz, SoA qarorini asoslay olasiz, evidence yig‘asiz va finding uchun corrective action belgilaysiz.",
    capstone: "Sintetik tashkilot uchun scope, risk methodology, risk treatment, SoA rationale, audit sample, CAPA va management review paketini tayyorlang. Rubrika: izchillik, owner, evidence, expiry va residual risk.",
    modules: ["computer-science-core", "intro-cybersecurity", "iso-27001-isms", "gdpr-privacy-engineering", "senior-infrastructure-architecture"],
    hours: "90–130"
  }),
  path({
    slug: "gdpr-privacy-engineer",
    kind: "jobRole",
    title: "GDPR va Privacy Engineering",
    summary: "Data inventory, lawful-basis workflow, data subject rights, DPIA, breach process va privacy-by-design.",
    prerequisites: "Oldindan yuridik ta’lim talab qilinmaydi; yakuniy legal interpretation uchun mutaxassis bilan ishlash o‘rgatiladi.",
    outcomes: "Data flow va retention’ni xaritalaysiz, DSR ticket’ni xavfsiz yuritasiz, DPIA trigger va breach escalation’ni texnik jarayonga bog‘laysiz.",
    capstone: "Sintetik SaaS mahsuloti uchun ROPA namunasi, data flow, DSR workflow, DPIA outline, supplier map va breach tabletop natijasini tayyorlang. Rubrika: minimization, lawful-owner, security, deletion va noaniqlikni ochiq ko‘rsatish.",
    modules: ["computer-science-core", "security-engineering-appsec", "gdpr-privacy-engineering", "iso-27001-isms", "senior-infrastructure-architecture"],
    hours: "85–120"
  }),
  path({
    slug: "computer-science-foundations",
    kind: "skill",
    title: "Computer Science: tizimlar uchun asosiy nazariya",
    summary: "Bit va algoritmdan operating systems, databases, distributed systems va architecture decision’gacha.",
    prerequisites: "Maxsus tajriba shart emas; matematika va mantiqiy masalalarni bosqichma-bosqich mashq qiling.",
    outcomes: "Algoritm murakkabligini tushuntirasiz, OS va network symptom’larini qatlamlarga ajratasiz, storage va transaction trade-off’larini taqqoslaysiz.",
    capstone: "Sintetik ticketing service uchun data model, query plan, API flow, failure handling, SLO va ADR tayyorlang. Rubrika: complexity, correctness, failure modes, test va trade-off.",
    modules: ["computer-science-core", "linux-fundamentals", "network-fundamentals", "network-engineering-advanced", "senior-infrastructure-architecture"],
    hours: "80–120"
  }),
  path({
    slug: "senior-platform-security-architect",
    kind: "jobRole",
    title: "Senior platform va security architect",
    summary: "Keng qamrovli senior yo‘l: arxitektura, reliability, security/privacy governance va jamoalararo qarorlar.",
    prerequisites: "Bu yuqori darajali o‘quv yo‘li; amaliy ish tajribasi, mentoring va production ownership o‘rnini bosmaydi.",
    outcomes: "Trade-off’ni ADR’da yozasiz, failure domain va SLO tanlaysiz, recovery/control evidence hamda residual risk owner’ini ko‘rsatasiz.",
    capstone: "Ko‘p xizmatli sintetik kompaniya uchun platforma arxitekturasi, threat/privacy model, ISO/GDPR mapping, SLO/DR, vendor review, incident tabletop va executive brief yarating. Rubrika: izchillik, operability, risk, evidence, cost va aniq qaror.",
    modules: ["computer-science-core", "linux-systems-administration", "windows-active-directory-operations", "network-engineering-advanced", "soc-incident-response-detection", "security-engineering-appsec", "cloud-devsecops-operations", "iso-27001-isms", "gdpr-privacy-engineering", "senior-infrastructure-architecture"],
    hours: "220–300"
  })
];
