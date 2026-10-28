import type { LearningImage, LearningSection, LinuxTerminalPractice, Localized } from "@/lib/learning-demo";

type CatalogItem = readonly [name: string, explanation: string];
type Lesson = {
  title: string;
  introduction: string;
  groups: { title: string; items: readonly CatalogItem[] }[];
  example: string;
  exampleExplanation: string;
  question: string;
  answers: string[];
  practice: LinuxTerminalPractice;
  image?: LearningImage;
};

const l = (value: string): Localized => ({ uz: value, ru: value, en: value });
const task = (id: string, command: string, prompt: string) => ({ id, command, prompt: l(prompt) });

const lessons: Lesson[] = [
  {
    title: "0. Linux nima? Kernel, distributiv va CPU arxitekturasi",
    introduction: "Linux — avvalo operatsion tizim yadrosi: u protsessor, xotira, qurilmalar, fayl tizimi va jarayonlar uchun umumiy boshqaruv qatlamini beradi. Odamlar “Linux” deganda odatda kernelni, GNU buyruq vositalarini, paket menejerini va boshqa dasturlarni birlashtirgan distributivni (masalan, Ubuntu yoki Fedora) nazarda tutadi. Server, ish stoli va o‘rnatilgan qurilmalardagi Linux bir xil kernel oilasidan foydalansa ham, paketlari va sozlamalari farq qilishi mumkin.\n\nCPU arxitekturasi dasturlar qaysi protsessor buyruqlar to‘plamida ishlashini bildiradi: x86_64/amd64 ko‘p kompyuterlarda, ARM64 esa telefonlar, kichik qurilmalar va ayrim serverlarda uchraydi. Kernel versiyasi, distributiv nomi va CPU arxitekturasini alohida aniqlang; “Linux” degan bitta nom barcha tizimlar aynan bir xil degani emas.",
    groups: [{ title: "Tizimni tanib olish", items: [
      ["uname", "Yadro nomi, versiyasi va mashina arxitekturasini chiqaradi. `uname -a` bir qator umumiy ma’lumot beradi; `uname -m` arxitekturani alohida ko‘rsatadi."],
      ["cat", "Fayl mazmunini terminalga chiqaradi. `/etc/os-release` distributivning nomi va versiyasi haqidagi standart matnli ma’lumotni beradi."],
      ["whoami", "Joriy shell qaysi foydalanuvchi nomidan ishlayotganini ko‘rsatadi; bu buyruq huquqlarni o‘zgartirmaydi."],
      ["id", "Joriy foydalanuvchining UID, asosiy GID va guruhlarini ko‘rsatadi."],
      ["apt", "Debian/Ubuntu tizimlarida paketlarni qidirish va boshqarish vositasi. Darsda faqat `apt list --installed` ro‘yxati ko‘riladi; o‘rnatish va o‘chirish buyruqlari simulyatorda yopiq."]
    ]}],
    example: "uname -a\nuname -m\ncat /etc/os-release\nwhoami\nid\napt list --installed",
    exampleExplanation: "Bular faqat joriy muhit haqidagi ma’lumotni o‘qiydi. Masalan, `uname -m` `x86_64` yoki `aarch64` kabi arxitekturani ko‘rsatishi mumkin; distributiv versiyasini `/etc/os-release`dan, o‘rnatilgan paketlarni esa `apt` ro‘yxatidan ko‘rasiz.",
    question: "Linux yadrosi va paketlari birgalikda tarqatiladigan tizim to‘plami nima deb ataladi?",
    answers: ["distributiv", "distro"],
    practice: {
      instructions: l("Terminaldagi vazifalarning har birini bajaring. Buyruqlar o‘quv simulyatorida ishlaydi; kompyuteringiz yoki serveringizga buyruq yuborilmaydi."),
      tasks: [
        task("kernel", "uname -a", "Kernel va mashina haqidagi umumiy ma’lumotni ko‘ring."),
        task("architecture", "uname -m", "CPU arxitekturasini alohida aniqlang."),
        task("distribution", "cat /etc/os-release", "Simulyatsiya qilingan distributiv nomi va versiyasini o‘qing."),
        task("user", "whoami", "Joriy foydalanuvchi nomini aniqlang."),
        task("identity", "id", "Foydalanuvchi ID va guruhlarini tekshiring."),
        task("packages", "apt list --installed", "O‘rnatilgan deb ko‘rsatilgan namuna paketlarni ko‘ring.")
      ]
    },
    image: {
      src: "/learning-assets/linux-fundamentals/05-linux-architecture.svg",
      alt: l("Linux distributivi, yadro va CPU arxitekturasi o‘rtasidagi bog‘lanish diagrammasi."),
      caption: l("Distributiv — kernel, paketlar va foydalanuvchi dasturlari yig‘indisi; arxitektura esa mos CPU turini bildiradi."),
      width: 1100,
      height: 440
    }
  },
  {
    title: "1. Linux arxitekturasi: yuklanishdan xizmatlargacha",
    introduction: "Linux tizimi yoqilganda firmware qurilmani ishga tayyorlaydi, bootloader kernelni yuklaydi, kernel esa xotira, qurilmalar va jarayonlarni boshqarishni boshlaydi. So‘ng `systemd` kabi birinchi foydalanuvchi makonidagi jarayon xizmatlarni ishga tushiradi. Foydalanuvchi dasturlari, shell va xizmatlar user space’da ishlaydi; system call orqali kernel xizmatlaridan foydalanadi.\n\nJarayon — ishlayotgan dastur nusxasi, xizmat esa odatda fonda ishlaydigan va systemd tomonidan boshqariladigan jarayondir. Tizim arxitekturasini tushunish nosozlikni to‘g‘ri qatlamda qidirishga yordam beradi: yuklanish, yadro, xizmat yoki foydalanuvchi dasturi.",
    groups: [{ title: "Jarayon, xizmat va jurnal", items: [
      ["ps", "Hozir ishlayotgan jarayonlarning suratini ko‘rsatadi. `ps aux` tizimdagi jarayonlarni bir martalik ro‘yxatda beradi."],
      ["top", "Jarayonlar va CPU/xotira yukini yangilanib turadigan ko‘rinishda ko‘rsatadi. Simulyatorda statik namuna beriladi."],
      ["systemctl", "systemd xizmatlari holatini ko‘rish va boshqarish vositasi. Bu kursdagi terminal faqat xavfsiz `status` so‘rovini simulyatsiya qiladi."],
      ["journalctl", "systemd jurnal yozuvlarini ko‘rsatadi; `-u` xizmat bo‘yicha, `-n` esa oxirgi yozuvlar soni bo‘yicha cheklaydi."]
    ]}],
    example: "ps aux\ntop -b -n 1\nsystemctl status ssh\njournalctl -u ssh -n 5",
    exampleExplanation: "Misollar jarayonlar, SSH xizmati va uning so‘nggi sintetik jurnal yozuvlarini ko‘rsatadi. Xizmatni ishga tushirish, to‘xtatish yoki o‘zgartirish bu terminalda mavjud emas.",
    question: "Linux yuklanishida kernel’dan keyin xizmatlarni boshqarishni odatda qaysi tizim boshlaydi?",
    answers: ["systemd"],
    practice: {
      instructions: l("Jarayon bilan xizmat farqini kuzating. Bu yerda barcha natijalar oldindan tayyorlangan simulyatsiya ma’lumotidir."),
      tasks: [
        task("processes", "ps aux", "Ishlayotgan jarayonlar ro‘yxatini ko‘ring."),
        task("top", "top -b -n 1", "Bir martalik tizim va jarayonlar ko‘rinishini oling."),
        task("service", "systemctl status ssh", "Xizmat holatini faqat o‘qish rejimida tekshiring."),
        task("logs", "journalctl -u ssh -n 5", "SSH xizmatiga tegishli so‘nggi beshta jurnal yozuvini ko‘ring.")
      ]
    }
  },
  {
    title: "2. Terminal, shell va kataloglar bo‘ylab yurish",
    introduction: "Terminal — matn kiritish/chiqarish interfeysi; shell esa kiritilgan buyruqni talqin qiladi va dasturga uzatadi. Buyruq odatda `nom [parametrlar] [argumentlar]` ko‘rinishida bo‘ladi. Parametr xatti-harakatni, argument esa fayl yoki qiymatni belgilaydi. Shell’da joriy katalog tushunchasi bor: nisbiy yo‘l shu joydan hisoblanadi, mutlaq yo‘l esa `/` ildizidan boshlanadi.\n\nLinux katalog daraxtining ildizi `/`. Foydalanuvchi fayllari odatda `/home` katalogida, sozlamalar `/etc` ichida, tizim jurnallari esa `/var/log` ostida saqlanadi. Bu joylar misol uchun; haqiqiy tuzilma distributiv va server vazifasiga qarab farq qiladi.",
    groups: [{ title: "Yo‘l va katalog buyruqlari", items: [
      ["pwd", "Joriy ishchi katalogning to‘liq yo‘lini ko‘rsatadi."],
      ["ls", "Katalogdagi fayllarni ro‘yxatlaydi. `-l` tafsilotlarni, `-a` yashirin yozuvlarni ham ko‘rsatadi."],
      ["cd", "Shell’ning joriy katalogini o‘zgartiradi. `cd ..` ota katalogga, `cd /` esa ildizga olib boradi."],
      ["find", "Berilgan katalog daraxtidan nom yoki boshqa shartga mos yo‘llarni topadi. Ishonchsiz yo‘llarda o‘chiruvchi parametrlarni ishlatmang."],
      ["man", "O‘rnatilgan buyruq va sozlama uchun terminal qo‘llanmasini ochadi; bu o‘quv terminalida faqat qisqa izoh beriladi."]
    ]}],
    example: "pwd\nls -la\ncd /home/student/Documents\npwd\nfind /home/student -name '*.txt'\nman ls",
    exampleExplanation: "`pwd` qayerdaligingizni, `ls -la` katalog tarkibini ko‘rsatadi. `cd` keyingi nisbiy yo‘llar uchun joriy joyni almashtiradi; `find` mos fayl nomlarini qidiradi, `man ls` esa buyruq qo‘llanmasini ochadi.",
    question: "Joriy katalogning to‘liq yo‘lini ko‘rsatadigan buyruq qaysi?",
    answers: ["pwd"],
    practice: {
      instructions: l("Avval joriy joyni aniqlang, so‘ng simulyatsiyadagi kataloglarga o‘ting va fayl qidiring."),
      tasks: [
        task("pwd", "pwd", "Joriy katalog yo‘lini ko‘rsating."),
        task("ls", "ls -la", "Oddiy va yashirin yozuvlarni tafsilotlari bilan ro‘yxatlang."),
        task("cd", "cd /home/student/Documents", "Hujjatlar katalogiga o‘ting."),
        task("find", "find /home/student -name '*.txt'", "Talaba katalogidagi `.txt` fayllarni toping."),
        task("manual", "man ls", "`ls` buyrug‘i uchun qisqa qo‘llanmani ko‘ring.")
      ]
    },
    image: {
      src: "/learning-assets/linux-fundamentals/02-filesystem-paths.svg",
      alt: l("Linux katalog daraxtidagi asosiy yo‘llar va mutlaq hamda nisbiy yo‘l farqi."),
      caption: l("Mutlaq yo‘l `/` dan boshlanadi; nisbiy yo‘l joriy katalogga bog‘liq."),
      width: 1100,
      height: 440
    }
  },
  {
    title: "3. Fayl yaratish, o‘qish va xavfsiz boshqarish",
    introduction: "Fayl amallarida avval joriy katalog va maqsad yo‘lini tekshiring. Fayl nomi kengaytmasi uning mazmunini kafolatlamaydi. Nusxalash manbani saqlaydi, ko‘chirish esa manzilni almashtirishi mumkin. O‘chirishni faqat o‘quv terminalining virtual katalogida bajaring: ushbu simulyator o‘zgarishlarni brauzerdagi vaqtinchalik xotirada saqlaydi va haqiqiy fayl tizimiga tegmaydi.",
    groups: [{ title: "Fayl amallari", items: [
      ["mkdir", "Yangi katalog yaratadi. `-p` ichma-ich kataloglarni ham tayyorlaydi."],
      ["touch", "Fayl mavjud bo‘lmasa bo‘sh fayl yaratadi; mavjud bo‘lsa vaqt belgisini yangilaydi."],
      ["cat", "Fayl mazmunini chiqaradi. Katta fayllarda `head` yoki `tail` bilan faqat kerakli qismini ko‘ring."],
      ["cp", "Faylni nusxalaydi. Manba va manzilni, ayniqsa mavjud fayl ustiga yozish ehtimolini tekshiring."],
      ["mv", "Faylni ko‘chiradi yoki nomini o‘zgartiradi; mavjud manzilga ko‘chirish natijasini oldindan biling."],
      ["rm", "Faylni o‘chiradi. Simulyatorda faqat `/home/student` ichidagi virtual fayllar o‘chiriladi; tizim kataloglari va `rm -rf` qo‘llab-quvvatlanmaydi."]
    ]}],
    example: "mkdir -p /home/student/lab\ntouch /home/student/lab/notes.txt\ncat /home/student/readme.txt\ncp /home/student/readme.txt /home/student/lab/readme-copy.txt\nmv /home/student/lab/notes.txt /home/student/lab/notes-old.txt\nrm /home/student/lab/notes-old.txt",
    exampleExplanation: "Bu ketma-ketlik virtual katalogda papka yaratadi, fayl qo‘shadi, namuna matnini o‘qiydi, nusxa oladi, nomini o‘zgartiradi va oxirida vaqtinchalik faylni o‘chiradi. Barcha o‘zgarishlar faqat o‘quv simulyatorida.",
    question: "Faylni boshqa nom yoki katalogga ko‘chiradigan buyruq qaysi?",
    answers: ["mv"],
    practice: {
      instructions: l("Har bir vazifa virtual fayl tizimiga ta’sir qiladi. Fayl o‘chirilsa ham faqat simulyator ma’lumoti o‘zgaradi."),
      tasks: [
        task("mkdir", "mkdir /home/student/lab", "O‘quvchi uy katalogida `lab` papkasini yarating."),
        task("touch", "touch /home/student/lab/notes.txt", "Laboratoriya papkasida yangi bo‘sh fayl yarating."),
        task("cat", "cat /home/student/readme.txt", "Namuna fayl mazmunini o‘qing."),
        task("cp", "cp /home/student/readme.txt /home/student/lab/readme-copy.txt", "Namuna fayldan laboratoriya nusxasini yarating."),
        task("mv", "mv /home/student/lab/notes.txt /home/student/lab/notes-old.txt", "Yangi fayl nomini o‘zgartiring."),
        task("rm", "rm /home/student/lab/notes-old.txt", "Faqat virtual laboratoriya faylini o‘chiring.")
      ]
    }
  },
  {
    title: "4. Linux ruxsatlari: owner, group va others",
    introduction: "Linux har bir fayl yoki katalog uchun egasi (owner), guruh (group) va qolgan foydalanuvchilar (others) huquqlarini alohida belgilaydi. `r` — o‘qish, `w` — yozish, `x` — bajarish yoki katalog ichiga kirish. Raqamli yozuvda `r=4`, `w=2`, `x=1`; `640` egaga o‘qish/yozish, guruhga faqat o‘qish, boshqalarga esa huquq bermaydi.\n\nRuxsatni o‘zgartirishdan oldin egasi, guruh va hozirgi rejimni tekshiring. Bu terminaldagi `chmod` faqat virtual fayl metama’lumotini o‘zgartiradi; haqiqiy tizimga ta’siri yo‘q. Haqiqiy serverda `777` berish yoki egani tekshirmasdan almashtirish xavf tug‘diradi.",
    groups: [{ title: "Ruxsatni ko‘rish va sozlash", items: [
      ["ls -l", "Fayl turi, ruxsatlar, egasi, guruhi, hajmi va vaqtini bir qatorda ko‘rsatadi."],
      ["chmod", "Fayl ruxsatlarini o‘zgartiradi. Masalan, `chmod 640 file` owner/group/others uchun rejimni aniq belgilaydi."],
      ["stat", "Faylning ruxsat, hajm, inode va vaqt metama’lumotlarini batafsil ko‘rsatadi."]
    ]}],
    example: "ls -l /home/student/readme.txt\nchmod 640 /home/student/readme.txt\nstat /home/student/readme.txt",
    exampleExplanation: "Avval `ls -l` orqali joriy rejimni ko‘ring, so‘ng simulyatorda `chmod 640` bajaring va `stat` bilan natijani tasdiqlang. Raqamli rejimning har bir raqami alohida guruhga tegishli.",
    question: "Raqamli `640` rejimida boshqalarga (others) qanday huquq beriladi?",
    answers: ["hech qanday", "ruxsat berilmaydi", "0"],
    practice: {
      instructions: l("Virtual fayl ruxsatini o‘qing, cheklangan rejimga o‘zgartiring va natijani metama’lumotdan tekshiring."),
      tasks: [
        task("list-mode", "ls -l /home/student/readme.txt", "Faylning amaldagi ruxsat va egasini ko‘ring."),
        task("chmod", "chmod 640 /home/student/readme.txt", "Owner uchun o‘qish/yozish, group uchun o‘qish rejimini qo‘ying."),
        task("stat", "stat /home/student/readme.txt", "Yangi virtual rejimni tasdiqlang.")
      ]
    },
    image: {
      src: "/learning-assets/linux-fundamentals/03-permission-bits.svg",
      alt: l("Owner, group va others uchun rwx ruxsat bitlari hamda 754 misoli."),
      caption: l("Ruxsat raqamlari owner, group va others uchun bittadan qiymatni ifodalaydi."),
      width: 1100,
      height: 440
    }
  },
  {
    title: "5. Jarayonlar, xizmatlar va jurnallar",
    introduction: "Jarayonlar tizimda ishlayotgan dasturlardir; har birining PID raqami, egasi va resurs sarfi bo‘ladi. `ps` bir martalik ro‘yxat, `top` esa o‘zgarib turadigan ko‘rinish beradi. Xizmatlar odatda tizim ishga tushganda boshlanadi va `systemd` orqali kuzatiladi. Nosozlikni tahlil qilganda xizmat holati va vaqt bo‘yicha jurnal yozuvlarini birga solishtiring.\n\nVirtual terminalda jarayonlar va jurnallar sintetik namuna. Buyruqlar xizmatni start/stop qilmaydi, real host loglarini o‘qimaydi va hech qanday tarmoqqa ulanmaydi.",
    groups: [{ title: "Kuzatish buyruqlari", items: [
      ["ps", "Jarayonlar ro‘yxatini chiqaradi. `ps aux` barcha foydalanuvchilarning jarayonlarini bir martalik ko‘rsatadi."],
      ["top", "Jarayonlar yukini kuzatish uchun interaktiv vosita; bu darsda natijaning xavfsiz bir martalik ko‘rinishi simulyatsiya qilinadi."],
      ["systemctl", "systemd xizmat holatini boshqaradi. Kursda faqat `systemctl status` kabi o‘qish amali mashq qilinadi."],
      ["journalctl", "systemd jurnalini ko‘rsatadi. `-u` bilan xizmat, `-n` bilan oxirgi yozuvlar sonini tanlash mumkin."],
      ["date", "Joriy vaqtni ko‘rsatadi yoki formatlaydi. Tizim vaqtini o‘zgartiradigan parametrlar bu simulyatorda mavjud emas."]
    ]}],
    example: "date -Is\nps aux\nsystemctl status ssh\njournalctl -u ssh -n 5",
    exampleExplanation: "`date -Is` vaqtni ISO ko‘rinishida chiqaradi. Jarayon nomi va PID’ni toping, xizmat active yoki failed holatdaligini o‘qing, keyin jurnal vaqtini solishtiring. Jurnalda maxfiy qiymatlar bo‘lishi mumkin; real ma’lumotni ommaga yubormang.",
    question: "Jarayonlarning joriy yukini davriy yangilab ko‘rsatadigan kuzatuv vositasi?",
    answers: ["top"],
    practice: {
      instructions: l("Har bir buyruq faqat sintetik namuna ko‘rsatadi; xizmatlarni o‘zgartirish imkoniyati yo‘q."),
      tasks: [
        task("date", "date -Is", "Joriy vaqtning ISO ko‘rinishini o‘qing."),
        task("ps", "ps aux", "Joriy jarayonlarning sintetik ro‘yxatini oling."),
        task("top", "top -b -n 1", "Bir martalik tizim yukini ko‘ring."),
        task("systemctl", "systemctl status ssh", "SSH xizmatining simulyatsiya qilingan holatini tekshiring."),
        task("journalctl", "journalctl -u ssh -n 5", "SSH uchun so‘nggi beshta sintetik log satrini ko‘ring.")
      ]
    }
  },
  {
    title: "6. Tarmoq va resurslarni diagnostika qilish",
    introduction: "Nosozlikni qatlamma-qatlam tekshiring: interfeys va IP manzil, marshrut, masofaviy javob, so‘ng ilova. `ip` interfeys va route holatini ko‘rsatadi; `ping` odatda ICMP orqali aloqani tekshiradi, ammo firewall javobni to‘sishi mumkin. Disk va xotira resurslarini `df` va `free` bilan kuzating.\n\nO‘quv terminalidagi IP, ping, curl, disk va xotira ma’lumotlari uydirma namunadir. `ping` paket yubormaydi, `curl` internetga chiqmaydi, `df` va `free` esa kompyuteringiz resurslarini o‘qimaydi.",
    groups: [{ title: "Interfeys, ulanish va resurslar", items: [
      ["ip", "`ip addr` tarmoq interfeyslarini, `ip route` esa yo‘nalish jadvalini ko‘rsatadi."],
      ["ping", "Host javob berishini sinash uchun ICMP echo ishlatadi. Bu simulyatorda hech qanday paket yuborilmaydi."],
      ["curl", "URL bilan ishlaydigan so‘rov vositasi. Simulyator faqat `example.test` uchun tayyor javob ko‘rsatadi; real tarmoq so‘rovi yuborilmaydi."],
      ["df", "Filesystem bo‘yicha jami, ishlatilgan va bo‘sh joyni ko‘rsatadi. `-h` qiymatlarni o‘qilishi qulay birlikda beradi."],
      ["free", "RAM va swap ishlatilishini ko‘rsatadi; `-h` qiymatlarni o‘qilishi qulay birlikda chiqaradi."]
    ]}],
    example: "ip addr\nip route\nping -c 3 example.test\ncurl -I https://example.test\ndf -h\nfree -h",
    exampleExplanation: "IP va route’ni avval tekshirib, keyin simulyatsiya qilingan host javobi bilan solishtiring. `df -h` disk, `free -h` esa xotira holatini ko‘rsatadi; hech biri tizim konfiguratsiyasini o‘zgartirmaydi.",
    question: "Filesystem’larda ishlatilgan va bo‘sh disk joyini ko‘rsatadigan buyruq?",
    answers: ["df"],
    practice: {
      instructions: l("Bu mashqlar tarmoqqa chiqmaydi va haqiqiy qurilmalarni tekshirmaydi; ekrandagi natijalar o‘quv namunalaridir."),
      tasks: [
        task("ip-address", "ip addr", "Virtual tarmoq interfeysi va IP manzillarni ko‘ring."),
        task("ip-route", "ip route", "Namuna marshrut jadvalini o‘qing."),
        task("ping", "ping -c 3 example.test", "Namuna hostga paket yubormasdan simulyatsiya qilingan ping natijasini oling."),
        task("curl", "curl -I https://example.test", "Faqat `example.test` uchun tayyor HTTP header namunasini ko‘ring."),
        task("df", "df -h", "Virtual filesystem’larning bo‘sh joyini tekshiring."),
        task("free", "free -h", "Virtual RAM va swap holatini o‘qing.")
      ]
    }
  },
  {
    title: "7. Log va matn bilan amaliy ishlash",
    introduction: "Log — vaqt bo‘yicha yozilgan hodisalar ketma-ketligi. Katta faylni to‘liq chiqarish o‘rniga kerakli satrlarni filtrlash, qismlarga ajratish va sanash samaraliroq. Pipeline’dagi buyruqlarni birma-bir tushunib oling: avval ma’lumotni o‘qing, keyin filtrlash va tartiblashni qo‘shing.\n\nQuyidagi misollarda sun’iy log ishlatiladi. Real loglarda foydalanuvchi nomi, ichki manzil yoki token uchrashi mumkin; o‘quv uchun maxfiy ma’lumotni ko‘chirmang.",
    groups: [{ title: "Qidirish, ko‘rish va hisoblash", items: [
      ["grep", "Matn faylidan andozaga mos satrlarni topadi. Oddiy matnni qidirishdan boshlang; murakkab regex uchun andozani alohida tekshiring."],
      ["head", "Fayl yoki oqimning boshidan belgilangan qatorlarni chiqaradi."],
      ["tail", "Fayl yoki oqimning oxiridan qatorlarni chiqaradi; logning eng yangi yozuvlarini ko‘rishga qulay."],
      ["wc", "Qator, so‘z yoki bayt sonini hisoblaydi. `-l` qatorlarni sanaydi."],
      ["sort", "Matn satrlarini alifbo yoki tanlangan tartib bo‘yicha saralaydi."],
      ["uniq", "Yonma-yon takrorlangan satrlarni chiqaradi yoki sanaydi; barcha takrorlarni guruhlash uchun ko‘pincha avval `sort` ishlatiladi."],
      ["cut", "Har bir satrdan belgilangan ajratkich bilan bo‘lingan maydonlarni tanlab chiqaradi."]
    ]}],
    example: "grep ERROR /var/log/demo.log\nhead -n 3 /var/log/demo.log\ntail -n 2 /var/log/demo.log\nwc -l /var/log/demo.log\nsort /home/student/users.txt\nuniq -c /home/student/users.txt\ncut -d: -f1 /home/student/passwd.txt",
    exampleExplanation: "`grep` xatolarni ajratadi, `head`/`tail` kerakli chetlarni ko‘rsatadi, `wc -l` qatorlarni sanaydi. `uniq` qo‘shni takrorlarni sanaydi; `cut` `:` belgisi bilan ajratilgan maydonlardan foydalanuvchi nomini chiqaradi.",
    question: "Fayldagi `ERROR` so‘zini o‘z ichiga olgan satrlarni topadigan buyruq?",
    answers: ["grep"],
    practice: {
      instructions: l("Har bir buyruqni alohida ishga tushirib, natijadagi satrlar soni va tarkibini solishtiring."),
      tasks: [
        task("grep", "grep ERROR /var/log/demo.log", "Sintetik logdan xato satrlarini toping."),
        task("head", "head -n 3 /var/log/demo.log", "Logning boshidagi uchta satrni o‘qing."),
        task("tail", "tail -n 2 /var/log/demo.log", "Logning oxiridagi ikkita satrni o‘qing."),
        task("wc", "wc -l /var/log/demo.log", "Logdagi qatorlar sonini hisoblang."),
        task("sort", "sort /home/student/users.txt", "Foydalanuvchi nomlari ro‘yxatini tartiblang."),
        task("uniq", "uniq -c /home/student/users.txt", "Yonma-yon takrorlangan nomlarni sanang."),
        task("cut", "cut -d: -f1 /home/student/passwd.txt", "Ikki nuqtali yozuvdan birinchi maydonni ajrating.")
      ]
    },
    image: {
      src: "/learning-assets/linux-fundamentals/04-pipeline-integrity.svg",
      alt: l("Sintetik logni filtrlash, qayta ishlash va checksum orqali tekshirish oqimi."),
      caption: l("Har bir bosqichni tekshiring: manba, filter, natija va yaxlitlik."),
      width: 1100,
      height: 420
    }
  }
];

export const linuxFundamentalsSections: LearningSection[] = lessons.map((item) => ({
  title: l(item.title),
  content: l(item.introduction),
  example: l(item.example),
  exampleExplanation: l(item.exampleExplanation),
  terminalPractice: item.practice,
  question: { prompt: l(item.question), answers: item.answers },
  ...(item.image ? { images: [item.image] } : {})
}));

export const linuxFundamentalsDetails: Record<number, string> = Object.fromEntries(lessons.map((item, index) => {
  const rows = item.groups.flatMap((group) => [
    `### ${group.title}`,
    ...group.items.map(([name, explanation]) => `- \`${name}\` — ${explanation}`)
  ]);
  return [index, rows.join("\n\n")];
}));

export const linuxFundamentalsCommandCatalog = lessons.flatMap((item) =>
  item.groups.flatMap((group) => group.items.map(([command]) => ({ section: item.title, group: group.title, command })))
);
