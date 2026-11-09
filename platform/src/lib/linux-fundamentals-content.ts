import { sectionVideo } from "./learning-media-paths";
import type { LearningImage, LearningSection, LinuxTerminalPractice, Localized } from "@/lib/learning-demo";

type CatalogItem = readonly [name: string, explanation: string];
type QuizItem = readonly [question: string, answer: string];
type Lesson = {
  title: string;
  introduction: string;
  /** What the learner can do by the end of the lesson. */
  goal: string;
  /** Markdown lines: "- " bullets or "1. " steps. */
  theory: string[];
  groups: { title: string; items: readonly CatalogItem[] }[];
  /** Markdown lines describing a real situation. */
  situation: string[];
  mistakes: string[];
  /** The two self-check questions after the graded one; the graded one is `question`. */
  quiz: readonly QuizItem[];
  summary: string;
  example: string;
  exampleExplanation: string;
  question: string;
  answers: string[];
  options?: string[];
  practice: LinuxTerminalPractice;
  image?: LearningImage;
};

const l = (value: string): Localized => ({ uz: value, ru: value, en: value });
const task = (id: string, command: string, prompt: string) => ({ id, command, prompt: l(prompt) });
const safety = "Buyruqlar o‘quv simulyatorida ishlaydi; kompyuteringiz yoki serveringizga hech narsa yuborilmaydi.";

const lessons: Lesson[] = [
  {
    title: "0. Linux nima? Kernel, distributiv va CPU arxitekturasi",
    introduction: "Linux — avvalo operatsion tizim yadrosi: u protsessor, xotira, qurilmalar, fayl tizimi va jarayonlar uchun umumiy boshqaruv qatlamini beradi. Odamlar “Linux” deganda odatda kernelni, GNU buyruq vositalarini, paket menejerini va boshqa dasturlarni birlashtirgan distributivni (masalan, Ubuntu yoki Fedora) nazarda tutadi. Server, ish stoli va o‘rnatilgan qurilmalardagi Linux bir xil kernel oilasidan foydalansa ham, paketlari va sozlamalari farq qilishi mumkin.\n\nCPU arxitekturasi dasturlar qaysi protsessor buyruqlar to‘plamida ishlashini bildiradi: x86_64/amd64 ko‘p kompyuterlarda, ARM64 esa telefonlar, kichik qurilmalar va ayrim serverlarda uchraydi. Kernel versiyasi, distributiv nomi va CPU arxitekturasini alohida aniqlang; “Linux” degan bitta nom barcha tizimlar aynan bir xil degani emas.",
    goal: "Kernel, distributiv va arxitekturani farqlash hamda istalgan Linux tizimini bir daqiqada “tanib olish”.",
    theory: [
      "- **Kernel (yadro)** — apparat bilan dasturlar orasidagi vositachi: protsessor vaqtini jarayonlarga taqsimlaydi, xotirani ajratadi, drayverlar orqali disk, tarmoq va USB bilan ishlaydi, fayl tizimini boshqaradi.",
      "- Dasturlar apparatga to‘g‘ridan-to‘g‘ri murojaat qilmaydi: ular kernelga **system call** orqali so‘rov yuboradi.",
      "- **Distributiv (distro)** — kernel, GNU vositalari (`ls`, `cp`, `bash`), paket menejeri, sozlamalar va dasturlar to‘plami.",
      "- **Debian/Ubuntu** (`apt`, `.deb`) serverlarda va o‘qishda keng tarqalgan; **RHEL/Rocky/AlmaLinux/Fedora** (`dnf`, `.rpm`) korporativ serverlarda; **Alpine** konteynerlarda. Buyruqlarning ko‘pi hammasida bir xil, farq asosan paket boshqaruvi va sozlamalarda.",
      "- **Arxitektura** — protsessorning buyruqlar to‘plami: `x86_64` (`amd64`) oddiy kompyuter va serverlarda, `aarch64` (`arm64`) telefonlar, Raspberry Pi va ayrim bulut serverlarida. x86_64 uchun yig‘ilgan paket ARM’da ishlamaydi.",
      "- **Kernel versiyasi** (masalan, `6.8.0-45-generic`) va **distributiv versiyasi** (masalan, Ubuntu 24.04) har xil narsalar; ularni alohida tekshiring."
    ],
    groups: [{ title: "Tizimni tanib olish", items: [
      ["uname", "Yadro nomi, versiyasi va arxitekturasini chiqaradi: `uname -r` faqat kernel versiyasi, `uname -m` arxitektura, `uname -a` hammasi bir qatorda."],
      ["hostnamectl", "Kompyuter nomi, operatsion tizim, kernel va arxitekturani bitta jadvalda ko‘rsatadi; yangi serverda birinchi qaraladigan buyruqlardan biri."],
      ["cat", "Fayl mazmunini terminalga chiqaradi. `/etc/os-release` distributiv nomi va versiyasini beradi: `NAME=` va `VERSION_ID=` qatorlariga qarang."],
      ["whoami", "Joriy shell qaysi foydalanuvchi nomidan ishlayotganini ko‘rsatadi; huquqlarni o‘zgartirmaydi."],
      ["id", "UID, asosiy GID va guruhlarni ko‘rsatadi. `uid=0` bo‘lsa siz root’siz: ehtiyot bo‘ling."],
      ["apt", "Debian/Ubuntu paket vositasi. Darsda faqat `apt list --installed` ro‘yxati ko‘riladi; o‘rnatish va o‘chirish simulyatorda yopiq."]
    ]}],
    situation: [
      "Sizga yangi serverga SSH kirish berishdi. Birinchi to‘rt buyruq: `whoami`, `hostnamectl` (yoki `cat /etc/os-release`), `uname -r`, `uname -m`.",
      "Shundan keyin qaysi paket menejeri kerakligini, qaysi qo‘llanmani o‘qish kerakligini va dastur arxitekturaga mosligini bilasiz."
    ],
    mistakes: [
      "“Linux versiyasi” deb kernel versiyasini aytish: distributiv versiyasi boshqa narsa.",
      "Ubuntu qo‘llanmasidagi `apt` buyrug‘ini Rocky Linux’da ishlatishga urinish.",
      "Qaysi foydalanuvchi ekaningizni tekshirmasdan ishlash: root’da xato qimmatga tushadi."
    ],
    quiz: [
      ["`aarch64` qaysi arxitektura?", "ARM 64-bit."],
      ["`id` natijasida `uid=0` nimani bildiradi?", "root foydalanuvchi."]
    ],
    summary: "Kernel tizimni boshqaradi, distributiv uni foydalanishga tayyorlaydi, arxitektura esa qaysi dastur ishlashini belgilaydi.",
    example: "whoami\nhostnamectl\ncat /etc/os-release\nuname -r\nuname -m\nid",
    exampleExplanation: "Bu yangi serverda bajariladigan “tanishuv” ketma-ketligi: kim ekaningiz, tizim nomi va OS, distributiv versiyasi, kernel versiyasi va arxitektura. Hammasi faqat o‘qiydi, hech narsani o‘zgartirmaydi.",
    question: "Linux yadrosi va paketlari birgalikda tarqatiladigan tizim to‘plami nima deb ataladi?",
    answers: ["distributiv", "distro", "distribution", "linux distributivi"],
    practice: {
      instructions: l(`Terminaldagi vazifalarning har birini bajaring. ${safety}`),
      tasks: [
        task("kernel", "uname -a", "Kernel va mashina haqidagi umumiy ma’lumotni ko‘ring."),
        task("architecture", "uname -m", "CPU arxitekturasini alohida aniqlang."),
        task("distribution", "cat /etc/os-release", "Simulyatsiya qilingan distributiv nomi va versiyasini o‘qing."),
        task("user", "whoami", "Joriy foydalanuvchi nomini aniqlang."),
        task("identity", "id", "Foydalanuvchi ID va guruhlarini tekshiring."),
        task("packages", "apt list --installed", "O‘rnatilgan deb ko‘rsatilgan namuna paketlarni ko‘ring."),
        task("kernel-release", "uname -r", "Faqat kernel versiyasini aniqlang."),
        task("hostnamectl", "hostnamectl", "Kompyuter nomi, OS, kernel va arxitekturani bitta jadvalda ko‘ring.")
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
    goal: "Yuklanish bosqichlarini ketma-ket aytish va nosozlik qaysi qatlamda ekanini taxmin qilish.",
    theory: [
      "1. Firmware (UEFI/BIOS) apparatni tekshiradi.",
      "2. Bootloader (odatda GRUB) kernelni xotiraga yuklaydi.",
      "3. Kernel drayverlarni ishga tushiradi va root fayl tizimini ulaydi.",
      "4. Birinchi jarayon `systemd` (PID 1) ishga tushadi va xizmatlarni ketma-ket yoki parallel yoqadi.",
      "- **Kernel space** faqat yadroga tegishli va hamma narsaga kirish huquqiga ega; dasturlar **user space**’da ishlaydi va kernel xizmatlaridan system call orqali foydalanadi. Shuning uchun bitta dastur qulasa, butun tizim qulamaydi.",
      "- **Jarayon (process)** — ishlayotgan dastur nusxasi: har birida PID, ota jarayon (PPID), egasi va resurslar bor.",
      "- **Xizmat (service, daemon)** — fonda ishlaydigan jarayon, masalan `ssh`, `nginx` yoki `cron`. systemd uni unit fayli orqali boshqaradi."
    ],
    groups: [{ title: "Jarayon, xizmat va jurnal", items: [
      ["ps", "Ishlayotgan jarayonlar suratini ko‘rsatadi. `ps aux` ustunlari: USER, PID, %CPU, %MEM, COMMAND."],
      ["top", "Jarayonlar va CPU/xotira yukini yangilanib turadigan ko‘rinishda beradi; `top -b -n 1` bitta suratni oladi."],
      ["systemctl", "systemd xizmatlarini boshqaradi. `systemctl status ssh`: `active (running)` — ishlayapti, `failed` — xato bilan to‘xtagan; `Loaded:` qatorida `enabled` yuklanganda avtomatik yoqilishini bildiradi. Simulyatorda faqat `status` ishlaydi."],
      ["journalctl", "systemd jurnalini ko‘rsatadi: `-u` xizmat bo‘yicha, `-n` oxirgi yozuvlar soni bo‘yicha, `-b` joriy yuklanishdagi barcha yozuvlarni beradi."]
    ]}],
    situation: [
      "Sayt ochilmayapti. Qatlamlar bo‘yicha tekshiramiz:",
      "1. Server javob beryaptimi? Bu tarmoq qatlami.",
      "2. `systemctl status nginx`: xizmat ishlayaptimi?",
      "3. `journalctl -u nginx -n 20`: nega to‘xtagan?",
      "Ko‘pincha javob 3-qadamda, jurnalda bo‘ladi."
    ],
    mistakes: [
      "Xizmatni sababini o‘qimasdan qayta ishga tushirish: muammo qaytadi.",
      "Jarayon va xizmatni bir narsa deb o‘ylash: xizmat — systemd boshqaradigan jarayon."
    ],
    quiz: [
      ["Dastur kernel xizmatidan qanday foydalanadi?", "system call orqali."],
      ["`failed` holatidagi xizmat sababini qayerdan qidirasiz?", "`journalctl -u <xizmat>` bilan uning jurnalidan."]
    ],
    summary: "Firmware → bootloader → kernel → systemd → xizmatlar. Nosozlikni shu zanjirning to‘g‘ri qatlamidan qidiring.",
    example: "ps aux\ntop -b -n 1\nsystemctl status ssh\njournalctl -u ssh -n 5\njournalctl -b",
    exampleExplanation: "Misollar jarayonlar, SSH xizmati va uning so‘nggi jurnal yozuvlarini, so‘ng joriy yuklanish jurnalini ko‘rsatadi: kernel, systemd va xizmatlar qaysi tartibda ishga tushgani ko‘rinadi. Xizmatni ishga tushirish yoki to‘xtatish bu terminalda yo‘q.",
    question: "Yuklanishda birinchi bo‘lib ishga tushadigan, PID 1 raqamli jarayon odatda qaysi?",
    answers: ["systemd", "init", "/sbin/init"],
    practice: {
      instructions: l(`Jarayon bilan xizmat farqini kuzating. ${safety}`),
      tasks: [
        task("processes", "ps aux", "Ishlayotgan jarayonlar ro‘yxatini ko‘ring."),
        task("top", "top -b -n 1", "Bir martalik tizim va jarayonlar ko‘rinishini oling."),
        task("service", "systemctl status ssh", "Xizmat holatini faqat o‘qish rejimida tekshiring."),
        task("logs", "journalctl -u ssh -n 5", "SSH xizmatiga tegishli so‘nggi beshta jurnal yozuvini ko‘ring."),
        task("boot-log", "journalctl -b", "Joriy yuklanishdagi yozuvlarda kernel, systemd va xizmatlar ketma-ketligini kuzating."),
        task("nginx-status", "systemctl status nginx", "Veb-server xizmati ham ishlayotganini tekshiring.")
      ]
    }
  },
  {
    title: "2. Terminal, shell va kataloglar bo‘ylab yurish",
    introduction: "Terminal — matn kiritish/chiqarish interfeysi; shell esa kiritilgan buyruqni talqin qiladi va dasturga uzatadi. Buyruq odatda `nom [parametrlar] [argumentlar]` ko‘rinishida bo‘ladi. Parametr xatti-harakatni, argument esa fayl yoki qiymatni belgilaydi. Shell’da joriy katalog tushunchasi bor: nisbiy yo‘l shu joydan hisoblanadi, mutlaq yo‘l esa `/` ildizidan boshlanadi.\n\nLinux katalog daraxtining ildizi `/`. Foydalanuvchi fayllari odatda `/home` katalogida, sozlamalar `/etc` ichida, tizim jurnallari esa `/var/log` ostida saqlanadi. Bu joylar misol uchun; haqiqiy tuzilma distributiv va server vazifasiga qarab farq qiladi.",
    goal: "Fayl tizimida erkin yurish, mutlaq va nisbiy yo‘lni farqlash, buyruq natijasini faylga yozish.",
    theory: [
      "- **Terminal va shell:** terminal — oyna, shell (odatda `bash`) — buyruqni o‘qib bajaradigan dastur.",
      "- **Buyruq tuzilishi:** `buyruq -parametr argument`, masalan `ls -l /etc`. Parametrlarni birlashtirish mumkin: `ls -la`.",
      "- **Mutlaq yo‘l** `/` dan boshlanadi (`/home/student/Documents`); **nisbiy yo‘l** joriy katalogdan hisoblanadi (`Documents`). `.` — shu katalog, `..` — bir pog‘ona yuqori, `~` — uy katalogingiz.",
      "- **Muhim kataloglar:** `/etc` — sozlamalar, `/home` — foydalanuvchilar, `/var/log` — jurnallar, `/tmp` — vaqtinchalik fayllar, `/usr/bin` — dasturlar.",
      "- **Tezlashtiruvchilar:** `Tab` nomni to‘ldiradi, `↑` oldingi buyruqni qaytaradi, `history` buyruqlar tarixini ko‘rsatadi; wildcard `*.txt` barcha txt fayllarni, `?` bitta belgini bildiradi.",
      "- **Yo‘naltirish:** `>` natijani faylga yozadi va fayl bor bo‘lsa ustidan yozib yuboradi; `>>` fayl oxiriga qo‘shadi."
    ],
    groups: [{ title: "Yo‘l va katalog buyruqlari", items: [
      ["pwd", "Joriy ishchi katalogning to‘liq yo‘lini ko‘rsatadi."],
      ["ls", "Katalogdagi fayllarni ro‘yxatlaydi: `-l` tafsilotlar, `-a` yashirin yozuvlar, `-h` o‘qishga qulay hajmlar."],
      ["cd", "Joriy katalogni o‘zgartiradi: `cd ..` ota katalogga, `cd ~` uy katalogiga, `cd -` oldingi katalogga qaytaradi."],
      ["find", "Katalog daraxtidan shartga mos yo‘llarni topadi, masalan `find /home/student -name '*.txt'`. Ishonchsiz yo‘llarda o‘chiruvchi parametrlarni ishlatmang."],
      ["man", "Buyruq qo‘llanmasini ochadi; `q` bilan chiqiladi. O‘quv terminalida qisqa izoh beriladi."],
      ["history", "Shu shell’da yozilgan buyruqlar tarixini raqamlari bilan ko‘rsatadi."],
      ["echo", "Matnni chiqaradi. `echo \"salom\" > note.txt` faylga yozadi, `echo \"yana\" >> note.txt` oxiriga qo‘shadi."]
    ]}],
    situation: [
      "Sozlama faylini topish kerak, lekin u qayerdaligini bilmaysiz: `find /etc -name '*.conf'`.",
      "Natijani hamkasbga yuborish uchun faylga yozasiz: `find /etc -name '*.conf' > conf-list.txt`."
    ],
    mistakes: [
      "`>` bilan muhim fayl ustidan yozib yuborish: qo‘shish kerak bo‘lsa `>>` ishlating.",
      "Nisbiy yo‘lni noto‘g‘ri katalogda ishlatish: avval `pwd` qiling.",
      "Bo‘sh joyli fayl nomlarini qo‘shtirnoqsiz yozish."
    ],
    quiz: [
      ["`>` va `>>` farqi nima?", "`>` ustidan yozadi, `>>` oxiriga qo‘shadi."],
      ["Joriy katalogning to‘liq yo‘li qaysi buyruq bilan chiqadi?", "`pwd`."]
    ],
    summary: "Avval qayerdaligingizni biling (`pwd`), keyin yuring (`cd`), ko‘ring (`ls`) va qidiring (`find`).",
    example: "pwd\nls -la\ncd /home/student/Documents\ncd -\nfind /home/student -name '*.txt'\necho \"salom\" > /home/student/note.txt\necho \"yana\" >> /home/student/note.txt\ncat /home/student/note.txt",
    exampleExplanation: "`pwd` qayerdaligingizni, `ls -la` katalog tarkibini ko‘rsatadi. `cd` joriy joyni almashtiradi, `cd -` esa oldingisiga qaytaradi. `>` yangi fayl yozadi, `>>` uning oxiriga qator qo‘shadi; oxirida `cat` ikkala qator ham borligini ko‘rsatadi.",
    question: "Yo‘lda yozilgan `..` nimani bildiradi?",
    options: ["Bir pog‘ona yuqoridagi (ota) katalog", "Joriy katalog", "Foydalanuvchining uy katalogi", "Fayl tizimining ildizi"],
    answers: ["Bir pog‘ona yuqoridagi (ota) katalog"],
    practice: {
      instructions: l(`Avval joriy joyni aniqlang, so‘ng kataloglarga o‘ting, fayl qidiring va natijani faylga yozing. ${safety}`),
      tasks: [
        task("pwd", "pwd", "Joriy katalog yo‘lini ko‘rsating."),
        task("ls", "ls -la", "Oddiy va yashirin yozuvlarni tafsilotlari bilan ro‘yxatlang."),
        task("cd", "cd /home/student/Documents", "Hujjatlar katalogiga o‘ting."),
        task("find", "find /home/student -name '*.txt'", "Talaba katalogidagi `.txt` fayllarni toping."),
        task("manual", "man ls", "`ls` buyrug‘i uchun qisqa qo‘llanmani ko‘ring."),
        task("back", "cd -", "Oldingi katalogga qayting."),
        task("write", "echo \"salom\" > /home/student/note.txt", "Matnni yangi faylga yozing."),
        task("append", "echo \"yana\" >> /home/student/note.txt", "Fayl oxiriga yana bir qator qo‘shing."),
        task("read-note", "cat /home/student/note.txt", "Ikkala qator ham borligini tekshiring."),
        task("history", "history", "Shu paytgacha yozgan buyruqlaringiz tarixini ko‘ring.")
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
    goal: "Fayl va kataloglarni yaratish, o‘qish, nusxalash, ko‘chirish, o‘chirish va arxivlash.",
    theory: [
      "- Linux’da deyarli hamma narsa fayl: sozlama, jurnal, hatto qurilmalar.",
      "- Kengaytma faqat nom: `.txt` deb nomlangan fayl ichida boshqa narsa bo‘lishi mumkin. Fayl turi `file` buyrug‘i bilan aniqlanadi.",
      "- `rm` faylni “savatcha”ga tashlamaydi: o‘chirilgan fayl qaytmaydi.",
      "- Katta fayllarni `cat` bilan emas, `less` bilan o‘qing: u sahifalab ko‘rsatadi, `/` bilan qidiradi, `q` bilan chiqadi.",
      "- Oddiy tahrir uchun `nano` qulay: `Ctrl+O` — saqlash, `Ctrl+X` — chiqish. Simulyatorda muharrir ochilmaydi, faylga yozish uchun `echo ... >>` ishlating."
    ],
    groups: [{ title: "Fayl amallari", items: [
      ["mkdir", "Yangi katalog yaratadi; `-p` ichma-ich kataloglarni ham tayyorlaydi, masalan `mkdir -p lab/2026/noyabr`."],
      ["touch", "Fayl bo‘lmasa bo‘sh fayl yaratadi; bo‘lsa vaqt belgisini yangilaydi."],
      ["cat", "Fayl mazmunini chiqaradi. Katta fayllarda `head`, `tail` yoki `less` bilan faqat kerakli qismini ko‘ring."],
      ["less", "Faylni sahifalab o‘qiydi: `/matn` qidiradi, `q` chiqadi. Simulyatorda butun matn va eslatma ko‘rsatiladi."],
      ["file", "Fayl turini mazmuniga qarab aniqlaydi, masalan `ASCII text` yoki `gzip compressed data`."],
      ["cp", "Faylni nusxalaydi. `cp -i` ustidan yozishdan oldin so‘raydi; `cp nginx.conf nginx.conf.bak` — tahrirdan oldingi zaxira."],
      ["mv", "Faylni ko‘chiradi yoki nomini o‘zgartiradi; `-i` mavjud faylni yo‘qotib qo‘yishdan saqlaydi."],
      ["rm", "Faylni o‘chiradi; `rm -i` oldin so‘raydi. Simulyatorda faqat `/home/student` ichidagi virtual fayllar o‘chiriladi, `rm -rf` taqiqlangan."],
      ["tar", "Arxiv bilan ishlaydi: `tar -czf lab.tar.gz lab/` arxivlaydi, `tar -tzf lab.tar.gz` ichini ko‘rsatadi. Simulyatorda arxiv virtual."]
    ]}],
    situation: [
      "Sozlama faylini o‘zgartirishdan oldin har doim nusxa oling: `cp nginx.conf nginx.conf.bak`.",
      "Xato bo‘lsa, nusxadan bir zumda tiklaysiz. Bu professionallarning odati."
    ],
    mistakes: [
      "Wildcard bilan `rm *` qilish va kerakli fayllarni ham o‘chirib yuborish.",
      "Sozlamani nusxa olmasdan tahrirlash.",
      "`mv` bilan mavjud fayl ustidan yozib yuborish: `-i` dan foydalaning."
    ],
    quiz: [
      ["Sozlamani tahrirlashdan oldin nima qilinadi?", "zaxira nusxa olinadi (`cp ... .bak`)."],
      ["Faylni ko‘chiradigan yoki nomini o‘zgartiradigan buyruq qaysi?", "`mv`."]
    ],
    summary: "Yaratish oson, o‘chirish qaytarilmaydi: har doim avval tekshiring va nusxa oling.",
    example: "mkdir -p /home/student/lab\ntouch /home/student/lab/notes.txt\nfile /home/student/readme.txt\ncp /home/student/readme.txt /home/student/readme.txt.bak\nmv /home/student/lab/notes.txt /home/student/lab/notes-old.txt\nrm /home/student/lab/notes-old.txt\ntar -czf /home/student/lab.tar.gz /home/student/lab\ntar -tzf /home/student/lab.tar.gz",
    exampleExplanation: "Ketma-ketlik virtual katalogda papka va fayl yaratadi, fayl turini aniqlaydi, tahrirdan oldin zaxira oladi, nomini o‘zgartiradi, vaqtinchalik faylni o‘chiradi va oxirida katalogni arxivlab, arxiv ichini tekshiradi.",
    question: "Ichma-ich kataloglarni bitta buyruqda qaysi parametr bilan yaratasiz?",
    answers: ["mkdir -p", "-p", "--parents", "mkdir --parents"],
    practice: {
      instructions: l(`Har bir vazifa virtual fayl tizimiga ta’sir qiladi. Fayl o‘chirilsa ham faqat simulyator ma’lumoti o‘zgaradi. ${safety}`),
      tasks: [
        task("mkdir", "mkdir /home/student/lab", "O‘quvchi uy katalogida `lab` papkasini yarating."),
        task("mkdir-p", "mkdir -p /home/student/lab/2026/noyabr", "Ichma-ich kataloglarni bitta buyruqda yarating."),
        task("touch", "touch /home/student/lab/notes.txt", "Laboratoriya papkasida yangi bo‘sh fayl yarating."),
        task("cat", "cat /home/student/readme.txt", "Namuna fayl mazmunini o‘qing."),
        task("less", "less /home/student/readme.txt", "Xuddi shu faylni sahifalab o‘qish vositasida oching."),
        task("file", "file /home/student/readme.txt", "Fayl turini kengaytmaga emas, mazmuniga qarab aniqlang."),
        task("cp", "cp /home/student/readme.txt /home/student/lab/readme-copy.txt", "Namuna fayldan laboratoriya nusxasini yarating."),
        task("backup", "cp /home/student/readme.txt /home/student/readme.txt.bak", "Tahrirdan oldingidek zaxira nusxa oling."),
        task("mv", "mv /home/student/lab/notes.txt /home/student/lab/notes-old.txt", "Yangi fayl nomini o‘zgartiring."),
        task("rm", "rm /home/student/lab/notes-old.txt", "Faqat virtual laboratoriya faylini o‘chiring."),
        task("tar", "tar -czf /home/student/lab.tar.gz /home/student/lab", "`lab` katalogini arxivlang."),
        task("tar-list", "tar -tzf /home/student/lab.tar.gz", "Arxiv ichida nimalar borligini ko‘ring.")
      ]
    }
  },
  {
    title: "4. Linux ruxsatlari: owner, group, others va sudo",
    introduction: "Linux har bir fayl yoki katalog uchun egasi (owner), guruh (group) va qolgan foydalanuvchilar (others) huquqlarini alohida belgilaydi. `r` — o‘qish, `w` — yozish, `x` — bajarish yoki katalog ichiga kirish. Raqamli yozuvda `r=4`, `w=2`, `x=1`; `640` egaga o‘qish/yozish, guruhga faqat o‘qish, boshqalarga esa huquq bermaydi.\n\nRuxsatni o‘zgartirishdan oldin egasi, guruh va hozirgi rejimni tekshiring. Bu terminaldagi `chmod` va `chown` faqat virtual fayl metama’lumotini o‘zgartiradi; haqiqiy tizimga ta’siri yo‘q. Haqiqiy serverda `777` berish yoki egani tekshirmasdan almashtirish xavf tug‘diradi.",
    goal: "`ls -l` qatorini o‘qish, ruxsatni raqam va harf bilan berish, `sudo` va `chown` ma’nosini tushunish.",
    theory: [
      "- `ls -l` qatori, masalan `-rw-r----- 1 student staff 512 ...`: birinchi belgi tur (`-` fayl, `d` katalog, `l` havola), keyin 3 tadan uch guruh — owner, group, others.",
      "- **Harflar:** `r` — o‘qish, `w` — yozish, `x` — bajarish (katalogda: ichiga kirish).",
      "- **Raqamli yozuv:** r=4, w=2, x=1, har bir guruh uchun yig‘indi. `640` = owner `rw-`, group `r--`, others `---`; `755` dastur va kataloglar uchun odatiy; `600` maxfiy fayllar uchun, masalan SSH kalit.",
      "- **Harfli yozuv:** `chmod u+x skript.sh` egasiga bajarish huquqini qo‘shadi, `chmod o-r fayl` boshqalardan o‘qishni oladi.",
      "- **Egasi:** `chown user:group fayl` egani o‘zgartiradi; buni odatda faqat root qila oladi.",
      "- **root va `sudo`:** root’ning hamma narsaga ruxsati bor. `sudo buyruq` bitta buyruqni root huquqi bilan bajaradi va jurnalga yozadi — doim root’da ishlashdan xavfsizroq."
    ],
    groups: [{ title: "Ruxsatni ko‘rish va sozlash", items: [
      ["ls -l", "Fayl turi, ruxsatlar, egasi, guruhi, hajmi va vaqtini bir qatorda ko‘rsatadi."],
      ["chmod", "Ruxsatlarni o‘zgartiradi: `chmod 640 fayl` rejimni raqam bilan, `chmod u+x fayl` harf bilan beradi."],
      ["stat", "Faylning ruxsat, egasi, hajmi va vaqt metama’lumotlarini batafsil ko‘rsatadi."],
      ["chown", "Fayl egasi va guruhini o‘zgartiradi: `sudo chown student:staff fayl`. Oddiy foydalanuvchiga ruxsat berilmaydi."],
      ["groups", "Joriy foydalanuvchi qaysi guruhlarda ekanini ko‘rsatadi; guruh huquqlari shu ro‘yxatga bog‘liq."],
      ["sudo", "Bitta buyruqni root huquqi bilan bajaradi; `sudo -l` sizga qaysi buyruqlar ruxsat etilganini ko‘rsatadi. Simulyatorda faqat `sudo -l` va `sudo chown` ishlaydi."]
    ]}],
    situation: [
      "Sayt fayllari hammaga yozish huquqi bilan qo‘yilgan (`777`). Bu xavfli: buzg‘unchi sayt fayliga kod yozib qo‘yishi mumkin.",
      "To‘g‘ri ruxsatlar: fayllar — `644`, kataloglar — `755`, yozish faqat kerakli katalogga va to‘g‘ri egaga beriladi."
    ],
    mistakes: [
      "“Ishlamayapti, `chmod 777` qilaman”: bu muammoni yashiradi va teshik ochadi.",
      "Hamma ishni root’da qilish.",
      "Katalogga `x` bermasdan, “ichiga kira olmayapman” deb hayron bo‘lish."
    ],
    quiz: [
      ["`755` ni harflarda yozing.", "`rwxr-xr-x`."],
      ["Bitta buyruqni root huquqi bilan qanday bajarasiz?", "`sudo` bilan."]
    ],
    summary: "Eng kam huquq tamoyili: har kimga faqat ishiga kerakli ruxsatni bering.",
    example: "ls -l /home/student/readme.txt\nchmod 640 /home/student/readme.txt\nchmod u+x /home/student/readme.txt\ngroups\nsudo -l\nsudo chown student:staff /home/student/readme.txt\nstat /home/student/readme.txt",
    exampleExplanation: "Avval `ls -l` bilan joriy rejimni ko‘ring, `chmod 640` bilan raqamli, `chmod u+x` bilan harfli o‘zgartiring. `groups` va `sudo -l` qaysi huquqlaringiz borligini ko‘rsatadi; `sudo chown` guruhni almashtiradi, `stat` esa yakuniy holatni tasdiqlaydi.",
    question: "Raqamli `640` rejimida boshqalarga (others) qanday huquq beriladi?",
    options: ["Hech qanday huquq berilmaydi", "Faqat o‘qish", "O‘qish va yozish", "O‘qish, yozish va bajarish"],
    answers: ["Hech qanday huquq berilmaydi"],
    practice: {
      instructions: l(`Virtual fayl ruxsatini o‘qing, o‘zgartiring, huquqlaringizni tekshiring va natijani metama’lumotdan tasdiqlang. ${safety}`),
      tasks: [
        task("list-mode", "ls -l /home/student/readme.txt", "Faylning amaldagi ruxsat va egasini ko‘ring."),
        task("chmod", "chmod 640 /home/student/readme.txt", "Owner uchun o‘qish/yozish, group uchun o‘qish rejimini qo‘ying."),
        task("chmod-symbolic", "chmod u+x /home/student/readme.txt", "Egasiga bajarish huquqini harfli yozuv bilan qo‘shing."),
        task("groups", "groups", "Qaysi guruhlarga a’zo ekaningizni ko‘ring."),
        task("sudo-list", "sudo -l", "`sudo` orqali qaysi buyruqlar sizga ruxsat etilganini tekshiring."),
        task("chown", "sudo chown student:staff /home/student/readme.txt", "Fayl guruhini `staff` ga almashtiring."),
        task("stat", "stat /home/student/readme.txt", "Yangi rejim va guruhni tasdiqlang.")
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
    introduction: "Jarayonlar tizimda ishlayotgan dasturlardir; har birining PID raqami, egasi va resurs sarfi bo‘ladi. `ps` bir martalik ro‘yxat, `top` esa o‘zgarib turadigan ko‘rinish beradi. Xizmatlar odatda tizim ishga tushganda boshlanadi va `systemd` orqali kuzatiladi. Nosozlikni tahlil qilganda xizmat holati va vaqt bo‘yicha jurnal yozuvlarini birga solishtiring.\n\nVirtual terminalda jarayonlar va jurnallar sintetik namuna. `kill` faqat o‘quvchining virtual jarayonlarini to‘xtatadi; xizmatlar start/stop qilinmaydi va real host loglari o‘qilmaydi.",
    goal: "Yuklamani o‘qish, “qotgan” dasturni topish va to‘g‘ri to‘xtatish, jurnal bilan sababni topish.",
    theory: [
      "- **Jarayon holatlari:** R — ishlayapti, S — kutyapti, Z — zombi (tugagan, lekin ota jarayon hali yig‘ishtirmagan).",
      "- **`top` sarlavhasi:** `load average` — 1, 5 va 15 daqiqalik o‘rtacha navbat; yonida CPU va xotira foizlari. 4 yadroli serverda load 4 dan oshsa, navbat paydo bo‘lyapti degani.",
      "- **Signallar:** `SIGTERM` (15) — “iltimos, to‘xta”, dastur ishini saqlab yopiladi; `SIGKILL` (9) — majburan to‘xtatadi. Avval 15, faqat kerak bo‘lsa 9 ishlatiladi.",
      "- **Jurnal** vaqt tamg‘asi bilan yoziladi. Xizmat holati bilan jurnalni vaqt bo‘yicha solishtirish — diagnostikaning asosi."
    ],
    groups: [{ title: "Kuzatish va boshqarish buyruqlari", items: [
      ["ps", "Jarayonlar ro‘yxatini chiqaradi; `ps aux | grep nginx` kerakli jarayonni topadi."],
      ["top", "Jarayonlar yukini kuzatadi; sarlavhadagi `load average` va eng ko‘p CPU olgan jarayonga qarang."],
      ["kill", "Jarayonga signal yuboradi: `kill PID` — SIGTERM, `kill -9 PID` — SIGKILL. Avval PID’ni tekshiring. Simulyatorda faqat virtual jarayonlar to‘xtatiladi."],
      ["systemctl", "systemd xizmat holatini ko‘rsatadi. Kursda faqat `systemctl status` mashq qilinadi; `restart` haqiqiy serverda bajariladi."],
      ["journalctl", "systemd jurnali: `-u` xizmat, `-n` yozuvlar soni, `--since \"10 min ago\"` oxirgi 10 daqiqa."],
      ["date", "Joriy vaqtni ko‘rsatadi; `date -Is` ISO ko‘rinishida beradi. Jurnal vaqtini server vaqti bilan solishtirish uchun kerak."]
    ]}],
    situation: [
      "Server sekinlashdi. Tekshirish tartibi:",
      "1. `top`: qaysi jarayon CPU’ni 100% band qilyapti?",
      "2. `ps aux | grep <nom>`: uning to‘liq buyrug‘i qanday?",
      "3. `journalctl -u <xizmat>`: nima bo‘lgan?",
      "4. Xizmatni `systemctl restart` bilan to‘g‘ri qayta yoqish (haqiqiy serverda; simulyatorda yo‘q)."
    ],
    mistakes: [
      "Darhol `kill -9` qilish: ma’lumot saqlanmay qolishi mumkin.",
      "PID’ni tekshirmasdan boshqa jarayonni to‘xtatib qo‘yish.",
      "Jurnal vaqtini server vaqti bilan solishtirmaslik (vaqt zonasi)."
    ],
    quiz: [
      ["Yuklamani davriy yangilab ko‘rsatadigan vosita qaysi?", "`top`."],
      ["Bitta xizmat jurnalini qanday ko‘rasiz?", "`journalctl -u <xizmat>`."]
    ],
    summary: "Kuzating (`top`), toping (`ps`), sababini o‘qing (`journalctl`), keyin to‘g‘ri choraga o‘ting.",
    example: "top -b -n 1\nps aux | grep report.py\nkill 640\ntop -b -n 1\njournalctl --since \"10 min ago\"",
    exampleExplanation: "`top` CPU’ni band qilgan jarayonni ko‘rsatadi, `ps aux | grep` uning PID va to‘liq buyrug‘ini beradi. `kill 640` unga yumshoq SIGTERM yuboradi; qayta `top` yuklama tushganini ko‘rsatadi. Jurnaldagi oxirgi 10 daqiqa sababni izlash uchun.",
    question: "Dasturni yumshoq, ishini saqlab to‘xtatadigan signal qaysi?",
    answers: ["SIGTERM", "TERM", "15", "SIGTERM (15)", "sigterm 15", "kill -15"],
    practice: {
      instructions: l(`Qotgan virtual jarayonni toping, to‘g‘ri to‘xtating va jurnalni o‘qing. ${safety}`),
      tasks: [
        task("date", "date -Is", "Joriy vaqtning ISO ko‘rinishini o‘qing."),
        task("ps", "ps aux", "Joriy jarayonlarning sintetik ro‘yxatini oling."),
        task("top", "top -b -n 1", "Qaysi jarayon CPU’ni band qilganini ko‘ring."),
        task("find-process", "ps aux | grep report.py", "O‘sha jarayonning PID va to‘liq buyrug‘ini toping."),
        task("kill", "kill 640", "Qotgan virtual jarayonni yumshoq SIGTERM bilan to‘xtating."),
        task("systemctl", "systemctl status ssh", "SSH xizmatining simulyatsiya qilingan holatini tekshiring."),
        task("journalctl", "journalctl -u ssh -n 5", "SSH uchun so‘nggi beshta sintetik log satrini ko‘ring."),
        task("since", "journalctl --since \"10 min ago\"", "Oxirgi 10 daqiqadagi yozuvlarni ko‘ring.")
      ]
    }
  },
  {
    title: "6. Tarmoq va resurslarni diagnostika qilish",
    introduction: "Nosozlikni qatlamma-qatlam tekshiring: interfeys va IP manzil, marshrut, masofaviy javob, so‘ng ilova. `ip` interfeys va route holatini ko‘rsatadi; `ping` odatda ICMP orqali aloqani tekshiradi, ammo firewall javobni to‘sishi mumkin. Disk va xotira resurslarini `df` va `free` bilan kuzating.\n\nO‘quv terminalidagi IP, ping, curl, port, disk va xotira ma’lumotlari uydirma namunadir. `ping` paket yubormaydi, `curl` internetga chiqmaydi, `ssh` ulanmaydi, `df` va `free` esa kompyuteringiz resurslarini o‘qimaydi.",
    goal: "“Internet yo‘q” muammosini qatlamma-qatlam tekshirish, ochiq portlarni ko‘rish va xavfsiz masofaviy kirishni tushunish.",
    theory: [
      "1. Interfeys yoqilganmi, IP bormi? (`ip addr`)",
      "2. Shlyuz bormi? (`ip route`)",
      "3. Shlyuzga ping boryaptimi?",
      "4. Tashqi IP’ga ping boryaptimi?",
      "5. Domen nomi IP’ga aylanyaptimi? (DNS)",
      "6. Ilova javob beryaptimi? (`curl`)",
      "- Qaysi pog‘ona buzilsa, muammo o‘sha yerda. `ping` javob bermasligi har doim ham host o‘chiq degani emas: firewall ICMP’ni to‘sgan bo‘lishi mumkin.",
      "- **Port** — xizmat tinglaydigan eshik; `ss -tuln` qaysi portlar ochiq ekanini ko‘rsatadi (SSH uchun 22).",
      "- **SSH** — serverga shifrlangan masofaviy kirish. Parol o‘rniga kalit (`ssh-keygen`) ishlatish xavfsizroq.",
      "- **Resurslar:** disk to‘lsa, xizmatlar yozolmay to‘xtaydi (`df -h`); xotira tugasa, tizim jarayonlarni majburan yopadi (`free -h`)."
    ],
    groups: [{ title: "Interfeys, ulanish va resurslar", items: [
      ["ip", "`ip addr` tarmoq interfeyslari va IP manzillarni, `ip route` yo‘nalish jadvali va shlyuzni ko‘rsatadi."],
      ["ping", "Host javob berishini ICMP echo bilan sinaydi; `-c 3` uchta paket. Simulyatorda paket yuborilmaydi."],
      ["curl", "URL’ga so‘rov yuboradi; `curl -I` faqat sarlavhalarni (masalan `200` yoki `502 Bad Gateway`) ko‘rsatadi. Simulyator faqat `example.test` javobini beradi."],
      ["ss", "Soketlar va tinglayotgan portlarni ko‘rsatadi: `ss -tuln` — TCP/UDP, faqat tinglayotganlar, raqamli ko‘rinishda."],
      ["ssh", "Serverga shifrlangan masofaviy kirish: `ssh user@host`. Simulyatorda ulanmaydi, faqat izoh beriladi."],
      ["df", "Fayl tizimlari bo‘yicha jami, band va bo‘sh joyni ko‘rsatadi; `-h` o‘qishga qulay birliklarda."],
      ["free", "RAM va swap ishlatilishini ko‘rsatadi; `-h` o‘qishga qulay birliklarda."]
    ]}],
    situation: [
      "Hamkasb “sayt ochilmayapti” deydi. Zinapoya bo‘yicha tekshiramiz:",
      "1. `ip addr`: IP bor.",
      "2. Shlyuzga `ping`: javob bor.",
      "3. `curl -I`: `502 Bad Gateway`.",
      "4. Demak tarmoq joyida, muammo ilovada; endi `systemctl status` va `journalctl` bilan ilovani tekshiramiz."
    ],
    mistakes: [
      "Faqat `ping` natijasiga qarab xulosa chiqarish.",
      "`df -h` ni tekshirmasdan “server buzildi” deyish: ko‘pincha disk to‘lgan bo‘ladi.",
      "SSH’ni parol bilan, internetga ochiq qoldirish."
    ],
    quiz: [
      ["Ping javob bermasa, host albatta o‘chiqmi?", "Yo‘q, firewall to‘sgan bo‘lishi mumkin."],
      ["Disk bo‘sh joyini qaysi buyruq ko‘rsatadi?", "`df -h`."]
    ],
    summary: "Pastdan yuqoriga tekshiring: interfeys, marshrut, javob, DNS, ilova.",
    example: "ip addr\nip route\nping -c 3 example.test\ncurl -I https://example.test\nss -tuln\ndf -h\nfree -h",
    exampleExplanation: "IP va route’ni tekshirib, keyin namuna hostning javobi va HTTP sarlavhasini ko‘rasiz. `ss -tuln` qaysi xizmatlar qaysi portda tinglayotganini, `df -h` va `free -h` esa disk va xotira holatini ko‘rsatadi; hech biri tizimni o‘zgartirmaydi.",
    question: "Shlyuz (default gateway) qaysi buyruq natijasida ko‘rinadi?",
    answers: ["ip route", "ip r", "ip route show", "route -n", "route"],
    practice: {
      instructions: l(`Bu mashqlar tarmoqqa chiqmaydi va haqiqiy qurilmalarni tekshirmaydi; ekrandagi natijalar o‘quv namunalaridir. ${safety}`),
      tasks: [
        task("ip-address", "ip addr", "Virtual tarmoq interfeysi va IP manzillarni ko‘ring."),
        task("ip-route", "ip route", "Namuna marshrut jadvalini va shlyuzni o‘qing."),
        task("ping", "ping -c 3 example.test", "Namuna hostga paket yubormasdan simulyatsiya qilingan ping natijasini oling."),
        task("curl", "curl -I https://example.test", "Faqat `example.test` uchun tayyor HTTP header namunasini ko‘ring."),
        task("df", "df -h", "Virtual filesystem’larning bo‘sh joyini tekshiring."),
        task("free", "free -h", "Virtual RAM va swap holatini o‘qing."),
        task("ss", "ss -tuln", "Qaysi portlar tinglanayotganini ko‘ring.")
      ]
    }
  },
  {
    title: "7. Log va matn bilan amaliy ishlash",
    introduction: "Log — vaqt bo‘yicha yozilgan hodisalar ketma-ketligi. Katta faylni to‘liq chiqarish o‘rniga kerakli satrlarni filtrlash, qismlarga ajratish va sanash samaraliroq. Pipeline’dagi buyruqlarni birma-bir tushunib oling: avval ma’lumotni o‘qing, keyin filtrlash va tartiblashni qo‘shing.\n\nQuyidagi misollarda sun’iy log ishlatiladi. Real loglarda foydalanuvchi nomi, ichki manzil yoki token uchrashi mumkin; o‘quv uchun maxfiy ma’lumotni ko‘chirmang.",
    goal: "Minglab qatorli logdan kerakli ma’lumotni pipeline bilan bir daqiqada ajratish.",
    theory: [
      "- **Pipeline (`|`)** bir buyruq natijasini keyingisiga beradi. Har bir bo‘g‘in bitta ish qiladi: `grep` filtrlaydi, `cut` ustun ajratadi, `sort` tartiblaydi, `uniq -c` sanaydi, `head` eng ko‘plarini ko‘rsatadi.",
      "- Pipeline’ni bo‘g‘inma-bo‘g‘in quring va har qadamda natijani tekshiring.",
      "- `uniq` faqat yonma-yon takrorlarni sanaydi, shuning uchun undan oldin doim `sort` qo‘yiladi.",
      "- Logdagi vaqt va vaqt zonasiga qarang: hodisalarni vaqt bo‘yicha bog‘lash — tahlilning yarmi."
    ],
    groups: [{ title: "Qidirish, ko‘rish va hisoblash", items: [
      ["grep", "Andozaga mos satrlarni topadi: `-i` katta-kichik harfni farqlamaydi, `-c` sanaydi, `-v` mos KELMAYDIGANlarni ko‘rsatadi."],
      ["head", "Fayl yoki oqimning boshidan belgilangan qatorlarni chiqaradi."],
      ["tail", "Oxiridan qatorlarni chiqaradi; `tail -f` faylni jonli kuzatadi (haqiqiy serverda)."],
      ["wc", "Qator, so‘z yoki bayt sonini hisoblaydi; `-l` qatorlarni sanaydi."],
      ["sort", "Satrlarni saralaydi: `-n` raqam bo‘yicha, `-r` teskari tartibda."],
      ["uniq", "Yonma-yon takrorlarni birlashtiradi; `-c` har biri necha marta uchraganini sanaydi."],
      ["cut", "Ajratkich bo‘yicha maydon ajratadi: `cut -d: -f1` ikki nuqtadan oldingi birinchi maydon."]
    ]}],
    situation: [
      "Server sekin, `auth.log` da minglab “Failed password” yozuvi bor. Pipeline:",
      "`grep \"Failed password\" /var/log/auth.log | cut -d' ' -f11 | sort | uniq -c | sort -rn | head -5`",
      "Natijada bitta IP soatiga yuzlab urinish qilgani ko‘rinadi: bu brute-force hujum. Keyingi qadam o‘sha IP’ni firewall’da to‘sish va parol bilan kirishni o‘chirish. Bu Academy’dagi SSH brute-force laboratoriyasiga tayyorgarlik."
    ],
    mistakes: [
      "`uniq` dan oldin `sort` qilmaslik.",
      "Katta logni `cat` bilan ekranga chiqarish.",
      "Real logni maxfiy ma’lumotlari bilan ommaviy joyga yuborish."
    ],
    quiz: [
      ["`grep -v` nima qiladi?", "andozaga mos KELMAYDIGAN qatorlarni ko‘rsatadi."],
      ["Ikki nuqta bilan ajratilgan 1-maydonni qanday olasiz?", "`cut -d: -f1`."]
    ],
    summary: "Katta muammo kichik buyruqlar zanjiri bilan yechiladi: filtrlang, ajrating, sanang, tartiblang.",
    example: "grep -c ERROR /var/log/demo.log\ngrep -v INFO /var/log/demo.log\ngrep \"Failed password\" /var/log/auth.log | cut -d' ' -f11 | sort | uniq -c | sort -rn | head -5",
    exampleExplanation: "Birinchi buyruq xatolarni sanaydi, ikkinchisi INFO bo‘lmagan satrlarni ko‘rsatadi. Pipeline esa noto‘g‘ri parol yozuvlaridan IP manzilni (11-maydon) ajratadi, saralab sanaydi va eng ko‘p urinish qilgan beshtasini chiqaradi.",
    question: "Nima uchun `uniq -c` dan oldin `sort` qo‘yiladi?",
    options: ["uniq faqat yonma-yon takrorlarni sanaydi", "sort faylni siqib, tezlashtiradi", "uniq faqat raqamlarni sanay oladi", "sort bo‘sh satrlarni o‘chiradi"],
    answers: ["uniq faqat yonma-yon takrorlarni sanaydi"],
    practice: {
      instructions: l(`Har bir buyruqni alohida ishga tushirib, natijadagi satrlar soni va tarkibini solishtiring; oxirida ularni pipeline’ga ulang. ${safety}`),
      tasks: [
        task("grep", "grep ERROR /var/log/demo.log", "Sintetik logdan xato satrlarini toping."),
        task("head", "head -n 3 /var/log/demo.log", "Logning boshidagi uchta satrni o‘qing."),
        task("tail", "tail -n 2 /var/log/demo.log", "Logning oxiridagi ikkita satrni o‘qing."),
        task("wc", "wc -l /var/log/demo.log", "Logdagi qatorlar sonini hisoblang."),
        task("sort", "sort /home/student/users.txt", "Foydalanuvchi nomlari ro‘yxatini tartiblang."),
        task("uniq", "uniq -c /home/student/users.txt", "Yonma-yon takrorlangan nomlarni sanang."),
        task("cut", "cut -d: -f1 /home/student/passwd.txt", "Ikki nuqtali yozuvdan birinchi maydonni ajrating."),
        task("grep-count", "grep -c ERROR /var/log/demo.log", "Xato satrlari sonini bitta raqam bilan oling."),
        task("grep-invert", "grep -v INFO /var/log/demo.log", "INFO bo‘lmagan satrlarni ko‘ring."),
        task("pipeline", "grep \"Failed password\" /var/log/auth.log | cut -d' ' -f11 | sort | uniq -c | sort -rn | head -5", "SSH’ga eng ko‘p noto‘g‘ri parol bilan urilgan IP manzillarni toping.")
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

/** Video lengths in seconds, as the producer reports them; unknown ones are simply left out. */
const videoSeconds: Record<number, number> = { 0: 258, 1: 202, 2: 188, 3: 172, 4: 166, 5: 156, 6: 159, 7: 151 };

export const linuxFundamentalsSections: LearningSection[] = lessons.map((item, index) => ({
  title: l(item.title),
  // Files go to LEARNING_MEDIA_DIR/linux-fundamentals/<index>.mp4 (plus -poster.jpg and .vtt); until then no player shows.
  video: sectionVideo("linux-fundamentals", index, videoSeconds[index]),
  content: l(item.introduction),
  example: l(item.example),
  exampleExplanation: l(item.exampleExplanation),
  terminalPractice: item.practice,
  question: { prompt: l(item.question), answers: item.answers, ...(item.options ? { options: item.options.map(l) } : {}) },
  ...(item.image ? { images: [item.image] } : {})
}));

/**
 * The lesson body under the introduction: goal, theory, command reference, a real situation, common mistakes,
 * the self-check (the graded question is shown separately, so only questions 2 and 3 carry their answers here)
 * and the summary. Lists stay on consecutive lines so each renders as one list.
 */
export const linuxFundamentalsDetails: Record<number, string> = Object.fromEntries(lessons.map((item, index) => {
  const blocks = [
    `### Maqsad\n${item.goal}`,
    `### Nazariya\n${item.theory.join("\n")}`,
    ...item.groups.map(group => `### ${group.title}\n${group.items.map(([name, explanation]) => `- \`${name}\` — ${explanation}`).join("\n")}`),
    `### Hayotiy vaziyat\n${item.situation.join("\n")}`,
    `### Ko‘p uchraydigan xatolar\n${item.mistakes.map(mistake => `- ${mistake}`).join("\n")}`,
    `### Mini-test\n- **1-savol** — dars oxiridagi tekshiruv savoli.\n${item.quiz.map(([question, answer], quizIndex) => `- **${quizIndex + 2}-savol.** ${question} **Javob:** ${answer}`).join("\n")}`,
    `### Xulosa\n${item.summary}`
  ];
  return [index, blocks.join("\n\n")];
}));

export const linuxFundamentalsCommandCatalog = lessons.flatMap((item) =>
  item.groups.flatMap((group) => group.items.map(([command]) => ({ section: item.title, group: group.title, command })))
);
