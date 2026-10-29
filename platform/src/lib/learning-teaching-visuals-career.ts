import type { LearningDiagram, Localized } from "@/lib/learning-demo";

type L3 = [uz: string, ru: string, en: string];

const l = ([uz, ru, en]: L3): Localized => ({ uz, ru, en });

function flow(caption: L3, nodes: L3[], links: L3[]): LearningDiagram {
  return {
    kind: "flow",
    caption: l(caption),
    nodes: nodes.map(l),
    links: links.map(l)
  };
}

function hierarchy(caption: L3, nodes: L3[], links: L3[]): LearningDiagram {
  return {
    kind: "hierarchy",
    caption: l(caption),
    nodes: nodes.map(l),
    links: links.map(l)
  };
}

/**
 * Diagrams for the 10 "career" (book-style) learning modules, keyed by module
 * slug and chapter/section index. Consumed as a fallback alongside
 * `learningTeachingVisuals` wherever a section itself has no inline diagram.
 */
export const careerTeachingVisuals: Record<string, Record<number, LearningDiagram>> = {
  "computer-science-core": {
    0: flow(
      ["Dastur manba koddan protsessor bajaradigan amallarga qadar bir nechta bosqichdan o‘tadi.", "Программа проходит несколько этапов от исходного кода до инструкций процессора.", "A program moves through several stages from source code to instructions the CPU executes."],
      [["Manba kod\n.c / .py / .js", "Исходный код\n.c / .py / .js", "Source code\n.c / .py / .js"], ["Kompilyatsiya /\ninterpretatsiya", "Компиляция /\nинтерпретация", "Compile /\ninterpret"], ["Mashina kodi\nyoki bytecode", "Машинный код\nили байт-код", "Machine code\nor bytecode"], ["CPU\nbajarish", "ЦП\nвыполнение", "CPU\nexecution"]],
      [["yoziladi", "пишется", "written"], ["aylantiriladi", "преобразуется", "translated"], ["yuklanadi", "загружается", "loaded"]]
    ),
    1: hierarchy(
      ["Katta-O yondashuvi algoritm murakkabligini kirish hajmiga nisbatan solishtirish uchun ierarxiya beradi.", "Нотация Big-O задаёт иерархию для сравнения сложности алгоритма относительно размера входных данных.", "Big-O notation gives a hierarchy for comparing algorithm complexity relative to input size."],
      [["Murakkablik\ndarajalari", "Уровни\nсложности", "Complexity\ntiers"], ["O(1)\nkonstant", "O(1)\nконстанта", "O(1)\nconstant"], ["O(log n)\nikkilik qidiruv", "O(log n)\nбинарный поиск", "O(log n)\nbinary search"], ["O(n)\nchiziqli", "O(n)\nлинейный", "O(n)\nlinear"], ["O(n²)\nichma-ich sikl", "O(n²)\nвложенный цикл", "O(n²)\nnested loop"]],
      [["eng tez", "самый быстрый", "fastest"], ["tez", "быстрый", "fast"], ["o‘rtacha", "средний", "moderate"], ["sekin", "медленный", "slow"]]
    ),
    2: flow(
      ["Operatsion tizim yadrosi jarayon, xotira va qurilmalarni ilovalar o‘rtasida taqsimlaydi.", "Ядро операционной системы распределяет процессы, память и устройства между приложениями.", "The OS kernel arbitrates processes, memory, and devices between applications."],
      [["Ilova\nuser space", "Приложение\nпользовательское пространство", "Application\nuser space"], ["Tizim chaqiruvi\nsyscall", "Системный вызов\nsyscall", "System call\nsyscall"], ["Yadro\nkernel space", "Ядро\nпространство ядра", "Kernel\nkernel space"], ["Qurilma\ndriver / hardware", "Устройство\nдрайвер / железо", "Device\ndriver / hardware"]],
      [["so‘rov", "запрос", "request"], ["o‘tkaziladi", "передаётся", "forwarded"], ["boshqariladi", "управляется", "managed"]]
    )
  },
  "linux-systems-administration": {
    0: flow(
      ["Linux’da jarayon yaratish fork/exec modeliga asoslanadi; har bir jarayon ota-jarayondan tarqaladi.", "Создание процессов в Linux основано на модели fork/exec; каждый процесс порождается от родительского.", "Process creation in Linux follows the fork/exec model; every process is spawned from a parent."],
      [["init / systemd\nPID 1", "init / systemd\nPID 1", "init / systemd\nPID 1"], ["fork()\nnusxa jarayon", "fork()\nкопия процесса", "fork()\nprocess copy"], ["exec()\nyangi dastur", "exec()\nновая программа", "exec()\nnew program"], ["Jarayon\nishlaydi", "Процесс\nвыполняется", "Process\nruns"]],
      [["yaratadi", "создаёт", "spawns"], ["chaqiradi", "вызывает", "invokes"], ["natija", "результат", "result"]]
    ),
    1: hierarchy(
      ["Fayl tizimi ierarxiyasi ildiz katalogdan boshlanib, maqsadga ko‘ra tarmoqlanadi (FHS).", "Иерархия файловой системы начинается с корневого каталога и ветвится по назначению (FHS).", "The filesystem hierarchy starts at the root directory and branches by purpose (FHS)."],
      [["/\nildiz", "/\nкорень", "/\nroot"], ["/etc\nkonfiguratsiya", "/etc\nконфигурация", "/etc\nconfiguration"], ["/var\nlog / data", "/var\nлоги / данные", "/var\nlogs / data"], ["/home\nfoydalanuvchi", "/home\nпользователь", "/home\nuser data"], ["/usr\ndastur fayllari", "/usr\nфайлы программ", "/usr\nprogram files"]],
      [["sozlamalar", "настройки", "settings"], ["o‘zgaruvchan", "переменные", "variable data"], ["shaxsiy", "личное", "personal"]]
    ),
    2: flow(
      ["systemd xizmatni so‘rov bo‘yicha emas, belgilangan target va bog‘liqliklar tartibida ishga tushiradi.", "systemd запускает службу не по запросу, а в порядке целей (target) и зависимостей.", "systemd starts a service not on demand but in the order of targets and dependencies."],
      [["Target\nmulti-user.target", "Цель\nmulti-user.target", "Target\nmulti-user.target"], ["Unit fayl\n.service", "Unit-файл\n.service", "Unit file\n.service"], ["Bog‘liqlik\nWants / After", "Зависимость\nWants / After", "Dependency\nWants / After"], ["Xizmat\nishga tushadi", "Служба\nзапускается", "Service\nstarts"]],
      [["yuklaydi", "загружает", "loads"], ["tekshiradi", "проверяет", "checks"], ["natija", "результат", "result"]]
    )
  },
  "windows-active-directory-operations": {
    0: hierarchy(
      ["Active Directory o‘rmoni domenlardan, domen esa tashkiliy birliklardan (OU) tashkil topadi.", "Лес Active Directory состоит из доменов, а домен — из организационных подразделений (OU).", "An Active Directory forest is made of domains, and each domain is made of organizational units (OUs)."],
      [["O‘rmon\nforest", "Лес\nforest", "Forest\nforest"], ["Domen\ncontoso.local", "Домен\ncontoso.local", "Domain\ncontoso.local"], ["OU: IT\nxodimlar", "OU: IT\nсотрудники", "OU: IT\nstaff"], ["OU: Finance\nxodimlar", "OU: Finance\nсотрудники", "OU: Finance\nstaff"], ["GPO\nsiyosat", "GPO\nполитика", "GPO\npolicy"]],
      [["ichida", "внутри", "contains"], ["bo‘linadi", "делится", "splits into"], ["qo‘llanadi", "применяется", "applies to"]]
    ),
    1: flow(
      ["Kerberos autentifikatsiyasida bilet-granting ticket orqali xizmatga alohida xizmat bileti olinadi.", "При Kerberos-аутентификации билет на выдачу билетов (TGT) используется для получения билета на конкретную службу.", "In Kerberos authentication, a ticket-granting ticket (TGT) is used to obtain a service-specific ticket."],
      [["Foydalanuvchi\nlogin", "Пользователь\nвход", "User\nlogin"], ["KDC\nAS-REQ", "KDC\nAS-REQ", "KDC\nAS-REQ"], ["TGT\nolinadi", "TGT\nполучен", "TGT\nissued"], ["Xizmat bileti\nTGS-REQ", "Билет службы\nTGS-REQ", "Service ticket\nTGS-REQ"], ["Resurs\nkirish", "Ресурс\nдоступ", "Resource\naccess"]],
      [["so‘raydi", "запрашивает", "requests"], ["beradi", "выдаёт", "grants"], ["taqdim etadi", "предоставляет", "presents"]]
    ),
    2: flow(
      ["Group Policy sozlamalari saytdan OU’gacha tartibda qo‘llanadi (SOM: Site, Domain, OU).", "Настройки групповой политики применяются в порядке от сайта до OU (SOM: Site, Domain, OU).", "Group Policy settings apply in order from site down to OU (SOM: Site, Domain, OU)."],
      [["Site\nGPO", "Сайт\nGPO", "Site\nGPO"], ["Domain\nGPO", "Домен\nGPO", "Domain\nGPO"], ["OU\nGPO", "OU\nGPO", "OU\nGPO"], ["Natija\nqo‘llangan siyosat", "Итог\nприменённая политика", "Result\napplied policy"]],
      [["birinchi", "первый", "first"], ["keyin", "затем", "then"], ["yakuniy", "итоговый", "final"]]
    )
  },
  "network-engineering-advanced": {
    0: flow(
      ["OSPF qo‘shnilar bilan link-state ma’lumotini almashib, eng qisqa yo‘l daraxtini hisoblaydi.", "OSPF обменивается link-state данными с соседями и вычисляет дерево кратчайших путей.", "OSPF exchanges link-state data with neighbors and computes a shortest-path tree."],
      [["Router\nHello", "Маршрутизатор\nHello", "Router\nHello"], ["Qo‘shnilik\nadjacency", "Соседство\nadjacency", "Neighbor\nadjacency"], ["LSDB\nlink-state baza", "LSDB\nбаза link-state", "LSDB\nlink-state database"], ["SPF\nDijkstra", "SPF\nДейкстра", "SPF\nDijkstra"], ["Marshrut jadvali\nRIB", "Таблица маршрутов\nRIB", "Routing table\nRIB"]],
      [["o‘rnatiladi", "устанавливается", "established"], ["sinxronlanadi", "синхронизируется", "synchronized"], ["hisoblanadi", "вычисляется", "computed"], ["o‘rnatiladi", "устанавливается", "installed"]]
    ),
    1: flow(
      ["BGP avtonom tizimlar orasida yo‘l atributlari asosida eng yaxshi yo‘lni tanlaydi.", "BGP выбирает лучший путь между автономными системами на основе атрибутов маршрута.", "BGP selects the best path between autonomous systems based on route attributes."],
      [["AS 100\ne-BGP", "AS 100\ne-BGP", "AS 100\ne-BGP"], ["Atributlar\nAS-path, LocalPref", "Атрибуты\nAS-path, LocalPref", "Attributes\nAS-path, LocalPref"], ["Eng yaxshi yo‘l\nbest path algoritmi", "Лучший путь\nалгоритм best path", "Best path\nselection algorithm"], ["AS 200\ni-BGP", "AS 200\ni-BGP", "AS 200\ni-BGP"]],
      [["e'lon qiladi", "анонсирует", "advertises"], ["baholaydi", "оценивает", "evaluates"], ["tarqatadi", "распространяет", "propagates"]]
    ),
    2: flow(
      ["QoS trafikni tasniflab, navbatlash siyosati orqali ustuvorlikni ta’minlaydi.", "QoS классифицирует трафик и обеспечивает приоритет через политику очередей.", "QoS classifies traffic and enforces priority through queuing policy."],
      [["Trafik\nvoice / data / video", "Трафик\nvoice / data / video", "Traffic\nvoice / data / video"], ["Tasniflash\nclassify & mark", "Классификация\nclassify & mark", "Classification\nclassify & mark"], ["Navbat\nqueue siyosati", "Очередь\nполитика queue", "Queue\nqueuing policy"], ["Chiqish\nustuvor uzatish", "Выход\nприоритетная передача", "Egress\npriority forwarding"]],
      [["kiradi", "поступает", "enters"], ["belgilanadi", "помечается", "marked"], ["uzatiladi", "передаётся", "forwarded"]]
    )
  },
  "soc-incident-response-detection": {
    0: flow(
      ["Insident boshqaruvi NIST hayot siklini — tayyorgarlikdan tikланishgacha — bosqichma-bosqich bajaradi.", "Управление инцидентами проходит жизненный цикл NIST — от подготовки до восстановления.", "Incident management follows the NIST lifecycle — from preparation to recovery."],
      [["Tayyorgarlik\npreparation", "Подготовка\npreparation", "Preparation\npreparation"], ["Aniqlash\ndetection & analysis", "Обнаружение\ndetection & analysis", "Detection\ndetection & analysis"], ["Lokallashtirish\ncontainment", "Локализация\ncontainment", "Containment\ncontainment"], ["Yo‘qotish\neradication", "Устранение\neradication", "Eradication\neradication"], ["Tiklanish\nrecovery", "Восстановление\nrecovery", "Recovery\nrecovery"]],
      [["keyin", "затем", "then"], ["aniqlansa", "при обнаружении", "if detected"], ["tozalangach", "после очистки", "once cleaned"], ["tiklangach", "после восстановления", "once restored"]]
    ),
    1: flow(
      ["Threat hunting gipoteza, ma’lumot manbasi va dalil orqali yashirin tahdidni qidiradi.", "Threat hunting ищет скрытую угрозу через гипотезу, источники данных и улики.", "Threat hunting searches for hidden threats using a hypothesis, data sources, and evidence."],
      [["Gipoteza\nnima bo‘lishi mumkin?", "Гипотеза\nчто могло произойти?", "Hypothesis\nwhat could have happened?"], ["Ma’lumot manbai\nEDR, log, netflow", "Источник данных\nEDR, log, netflow", "Data source\nEDR, log, netflow"], ["Qidiruv\nso‘rov / query", "Поиск\nзапрос / query", "Hunt\nquery / search"], ["Dalil\nIOC / TTP tasdiqlanadi", "Улика\nIOC / TTP подтверждён", "Evidence\nIOC / TTP confirmed"]],
      [["tekshiriladi", "проверяется", "tested against"], ["yuritiladi", "выполняется", "run against"], ["topiladi", "находится", "yields"]]
    ),
    2: hierarchy(
      ["MITRE ATT&CK taktikalari texnikalarga, texnikalar esa aniq protsedura (TTP) misollariga bo‘linadi.", "Тактики MITRE ATT&CK делятся на техники, а техники — на конкретные процедуры (TTP).", "MITRE ATT&CK tactics break down into techniques, and techniques into specific procedures (TTPs)."],
      [["Taktika\nInitial Access", "Тактика\nInitial Access", "Tactic\nInitial Access"], ["Texnika\nPhishing (T1566)", "Техника\nPhishing (T1566)", "Technique\nPhishing (T1566)"], ["Protsedura\nzararli ilova biriktirma", "Процедура\nвредоносное вложение", "Procedure\nmalicious attachment"], ["Detektsiya\nemail gateway qoidasi", "Детекция\nправило email-шлюза", "Detection\nemail gateway rule"]],
      [["amalga oshiriladi", "реализуется", "realized via"], ["misol", "пример", "example"], ["aniqlanadi", "обнаруживается", "caught by"]]
    )
  },
  "security-engineering-appsec": {
    0: flow(
      ["Secure SDLC xavfsizlikni loyihalashdan joylashtirishgacha har bosqichga kiritadi.", "Secure SDLC встраивает безопасность на каждом этапе — от проектирования до релиза.", "Secure SDLC embeds security at every stage from design to release."],
      [["Talablar\nthreat model", "Требования\nthreat model", "Requirements\nthreat model"], ["Dizayn\nxavfsiz arxitektura", "Дизайн\nбезопасная архитектура", "Design\nsecure architecture"], ["Kodlash\nSAST / code review", "Разработка\nSAST / code review", "Coding\nSAST / code review"], ["Test\nDAST / pentest", "Тестирование\nDAST / pentest", "Testing\nDAST / pentest"], ["Relize\nmonitoring", "Релиз\nмониторинг", "Release\nmonitoring"]],
      [["aniqlaydi", "определяет", "defines"], ["amalga oshiradi", "реализует", "implements"], ["tekshiradi", "проверяет", "validates"], ["kuzatadi", "отслеживает", "observes"]]
    ),
    1: flow(
      ["SQL in'ektsiya hujumi ishonchsiz kirishni to‘g‘ridan-to‘g‘ri so‘rovga qo‘shganda yuzaga keladi.", "SQL-инъекция возникает, когда недоверенный ввод напрямую подставляется в запрос.", "SQL injection occurs when untrusted input is concatenated directly into a query."],
      [["Foydalanuvchi\nkiritma", "Пользователь\nввод", "User\ninput"], ["Ilova\nstring birlashtirish", "Приложение\nконкатенация строк", "Application\nstring concatenation"], ["SQL so‘rov\no‘zgartirilgan", "SQL-запрос\nизменён", "SQL query\naltered"], ["Baza\nkutilmagan natija", "База данных\nнеожиданный результат", "Database\nunexpected result"]],
      [["yuboriladi", "отправляется", "sent"], ["quriladi", "строится", "built"], ["bajariladi", "выполняется", "executed"]]
    ),
    2: hierarchy(
      ["OWASP Top 10 bir nechta keng toifalarga, har biri esa aniq zaiflik turlariga bo‘linadi.", "OWASP Top 10 делится на несколько широких категорий, а каждая — на конкретные типы уязвимостей.", "The OWASP Top 10 splits into broad categories, each containing specific vulnerability types."],
      [["OWASP\nTop 10", "OWASP\nTop 10", "OWASP\nTop 10"], ["Access control\nbuzilgan ruxsat", "Access control\nнарушенный доступ", "Access control\nbroken access"], ["Injection\nSQL / command", "Injection\nSQL / command", "Injection\nSQL / command"], ["Crypto failures\nzaif shifrlash", "Crypto failures\nслабое шифрование", "Crypto failures\nweak encryption"]],
      [["toifa", "категория", "category"], ["toifa", "категория", "category"], ["toifa", "категория", "category"]]
    )
  },
  "cloud-devsecops-operations": {
    0: flow(
      ["CI/CD quvuri kod commitidan ishlab chiqarishgacha avtomatlashtirilgan bosqichlardan o‘tadi.", "Конвейер CI/CD проходит автоматизированные этапы от коммита кода до продакшена.", "A CI/CD pipeline moves through automated stages from code commit to production."],
      [["Commit\ngit push", "Коммит\ngit push", "Commit\ngit push"], ["Build\nkompilyatsiya", "Сборка\nкомпиляция", "Build\ncompile"], ["Test\nunit / SAST", "Тест\nunit / SAST", "Test\nunit / SAST"], ["Deploy\nstaging", "Деплой\nstaging", "Deploy\nstaging"], ["Prod\nrelease", "Прод\nрелиз", "Prod\nrelease"]],
      [["ishga tushadi", "запускает", "triggers"], ["o‘tadi", "проходит", "passes"], ["joylashtiriladi", "разворачивается", "deployed"], ["targ‘ib qilinadi", "продвигается", "promoted"]]
    ),
    1: hierarchy(
      ["Bulutdagi javobgarlik modeli (shared responsibility) provayder va mijoz o‘rtasida bo‘linadi.", "Модель общей ответственности (shared responsibility) делится между провайдером и клиентом.", "The shared responsibility model splits duties between provider and customer."],
      [["Shared\nResponsibility", "Общая\nответственность", "Shared\nResponsibility"], ["Provayder\nfizik, tarmoq, virtualizatsiya", "Провайдер\nфизика, сеть, виртуализация", "Provider\nphysical, network, virtualization"], ["Mijoz (IaaS)\nOS, ilova, ma’lumot", "Клиент (IaaS)\nОС, приложение, данные", "Customer (IaaS)\nOS, app, data"], ["Mijoz (SaaS)\nfaqat konfiguratsiya va foydalanuvchi", "Клиент (SaaS)\nтолько конфигурация и пользователи", "Customer (SaaS)\nconfig and users only"]],
      [["masalan", "например", "e.g."], ["javobgar", "ответственен", "responsible for"], ["javobgar", "ответственен", "responsible for"]]
    ),
    2: flow(
      ["Konteyner obrazi build vaqtida skanerlanadi, keyin registry va runtime bosqichida ham tekshiriladi.", "Образ контейнера сканируется при сборке, а затем проверяется в registry и во время выполнения.", "A container image is scanned at build time, then checked again in the registry and at runtime."],
      [["Dockerfile\nqurilish", "Dockerfile\nсборка", "Dockerfile\nbuild"], ["Image scan\nCVE tekshiruvi", "Скан образа\nпроверка CVE", "Image scan\nCVE check"], ["Registry\nimzolangan image", "Registry\nподписанный образ", "Registry\nsigned image"], ["Runtime\nxatti-harakat monitoringi", "Runtime\nмониторинг поведения", "Runtime\nbehavior monitoring"]],
      [["natija", "результат", "produces"], ["o‘tadi", "проходит", "passes to"], ["kuzatiladi", "отслеживается", "observed at"]]
    )
  },
  "iso-27001-isms": {
    0: hierarchy(
      ["ISMS siyosat, risk boshqaruvi va nazoratlar (Annex A) orqali tuzilgan boshqaruv tizimi.", "ISMS — это система управления, построенная через политику, управление рисками и меры контроля (Annex A).", "An ISMS is a management system built through policy, risk management, and controls (Annex A)."],
      [["ISMS\npolitika", "ISMS\nполитика", "ISMS\npolicy"], ["Risk baholash\nreestr", "Оценка риска\nреестр", "Risk assessment\nregister"], ["Annex A\nnazoratlar", "Annex A\nмеры контроля", "Annex A\ncontrols"], ["Statement of\nApplicability (SoA)", "Statement of\nApplicability (SoA)", "Statement of\nApplicability (SoA)"]],
      [["belgilaydi", "определяет", "drives"], ["tanlanadi", "выбираются", "selects"], ["hujjatlashtiriladi", "документируется", "documented in"]]
    ),
    1: flow(
      ["PDCA sikli (Plan-Do-Check-Act) ISMS’ni doimiy yaxshilashning asosi hisoblanadi.", "Цикл PDCA (Plan-Do-Check-Act) лежит в основе непрерывного улучшения ISMS.", "The PDCA cycle (Plan-Do-Check-Act) underlies continuous improvement of the ISMS."],
      [["Plan\nreja", "Plan\nплан", "Plan\nplan"], ["Do\namalga oshirish", "Do\nвыполнение", "Do\nimplement"], ["Check\nichki audit", "Check\nвнутренний аудит", "Check\ninternal audit"], ["Act\ntuzatish", "Act\nкоррекция", "Act\ncorrect"]],
      [["keyin", "затем", "then"], ["keyin", "затем", "then"], ["qayta rejaga", "снова к плану", "back to plan"]]
    ),
    2: flow(
      ["Nomuvofiqlik topilgach, tuzatuvchi harakat ildiz sababni bartaraf etishga qaratiladi.", "После выявления несоответствия корректирующее действие устраняет его коренную причину.", "Once a nonconformity is found, corrective action targets its root cause."],
      [["Audit\nnomuvofiqlik topildi", "Аудит\nвыявлено несоответствие", "Audit\nnonconformity found"], ["Ildiz sabab\ntahlil", "Корневая причина\nанализ", "Root cause\nanalysis"], ["Tuzatuvchi harakat\nreja", "Корректирующее действие\nплан", "Corrective action\nplan"], ["Tekshiruv\nnatija tasdiqlanadi", "Проверка\nрезультат подтверждён", "Verification\nresult confirmed"]],
      [["boshlaydi", "инициирует", "initiates"], ["aniqlaydi", "определяет", "informs"], ["tasdiqlanadi", "подтверждается", "verified by"]]
    )
  },
  "gdpr-privacy-engineering": {
    0: flow(
      ["Ma’lumot sub’ekti so‘rovi (DSAR) qabul qilishdan javob berishgacha belgilangan muddatda bajariladi.", "Запрос субъекта данных (DSAR) обрабатывается в установленный срок от приёма до ответа.", "A data subject access request (DSAR) is handled within a statutory deadline from intake to response."],
      [["So‘rov\nDSAR qabul", "Запрос\nприём DSAR", "Request\nDSAR intake"], ["Identifikatsiya\nso‘rovchini tasdiqlash", "Идентификация\nподтверждение запрашивающего", "Identity\nverify requester"], ["Yig‘ish\ntegishli ma’lumot", "Сбор\nсоответствующие данные", "Collection\nrelevant data"], ["Javob\n30 kun ichida", "Ответ\nв течение 30 дней", "Response\nwithin 30 days"]],
      [["keladi", "поступает", "arrives"], ["tasdiqlanadi", "подтверждается", "confirmed"], ["tayyorlanadi", "готовится", "prepared"]]
    ),
    1: hierarchy(
      ["GDPR’da ishonchli asos (lawful basis) bir nechta variantdan biriga tayanadi.", "В GDPR законное основание (lawful basis) опирается на один из нескольких вариантов.", "Under GDPR, the lawful basis for processing rests on one of several options."],
      [["Qayta ishlash\nasosi", "Основание\nобработки", "Processing\nbasis"], ["Rozilik\nconsent", "Согласие\nconsent", "Consent\nconsent"], ["Shartnoma\ncontract", "Договор\ncontract", "Contract\ncontract"], ["Qonuniy\nmajburiyat", "Юридическое\nобязательство", "Legal\nobligation"], ["Qonuniy\nmanfaat", "Законный\nинтерес", "Legitimate\ninterest"]],
      [["masalan", "например", "e.g."], ["masalan", "например", "e.g."], ["masalan", "например", "e.g."]]
    ),
    2: flow(
      ["Ma’lumot buzilishi (breach) aniqlanganidan 72 soat ichida nazorat organiga xabar berilishi kerak.", "О нарушении данных (breach) необходимо уведомить надзорный орган в течение 72 часов с момента обнаружения.", "A data breach must be reported to the supervisory authority within 72 hours of discovery."],
      [["Buzilish\naniqlandi", "Нарушение\nобнаружено", "Breach\ndetected"], ["Baholash\nxavf darajasi", "Оценка\nуровень риска", "Assessment\nrisk level"], ["Xabar berish\n72 soat / DPA", "Уведомление\n72 часа / DPA", "Notification\n72 hours / DPA"], ["Sub’ektlarga\nxabar (agar yuqori xavf)", "Уведомление\nсубъектов (если высокий риск)", "Subject notice\n(if high risk)"]],
      [["boshlanadi", "запускает", "triggers"], ["belgilaydi", "определяет", "determines"], ["amalga oshiriladi", "выполняется", "followed by"]]
    )
  },
  "senior-infrastructure-architecture": {
    0: hierarchy(
      ["Korxona arxitekturasi biznes maqsaddan texnik komponentgacha qatlamlarga bo‘linadi.", "Корпоративная архитектура делится на слои от бизнес-целей до технических компонентов.", "Enterprise architecture breaks down into layers from business goals to technical components."],
      [["Biznes\nmaqsadlar", "Бизнес\nцели", "Business\ngoals"], ["Ilova\narxitekturasi", "Архитектура\nприложений", "Application\narchitecture"], ["Ma’lumot\narxitekturasi", "Архитектура\nданных", "Data\narchitecture"], ["Texnologiya\ninfratuzilma", "Технологии\nинфраструктура", "Technology\ninfrastructure"]],
      [["belgilaydi", "определяет", "drives"], ["qo‘llab-quvvatlaydi", "поддерживает", "supported by"], ["joylashadi", "размещается на", "runs on"]]
    ),
    1: flow(
      ["Yuqori mavjudlik dizayni yagona nosozlik nuqtasini (SPOF) yo‘qotishga qaratilgan.", "Проектирование высокой доступности направлено на устранение единой точки отказа (SPOF).", "High-availability design is aimed at eliminating a single point of failure (SPOF)."],
      [["Yuklama\nso‘rov", "Нагрузка\nзапрос", "Load\nrequest"], ["Load balancer\nredundant", "Балансировщик\nизбыточный", "Load balancer\nredundant"], ["Faol tugun\nactive", "Активный узел\nactive", "Active node\nactive"], ["Zaxira tugun\nstandby / failover", "Резервный узел\nstandby / failover", "Standby node\nstandby / failover"]],
      [["keladi", "поступает", "arrives at"], ["taqsimlaydi", "распределяет", "distributes to"], ["nosozlikda o‘tadi", "переключается при сбое", "fails over to"]]
    ),
    2: flow(
      ["Falokatdan keyin tiklash (DR) rejasi RTO va RPO maqsadlariga qarab strategiyani tanlaydi.", "План аварийного восстановления (DR) выбирает стратегию исходя из целей RTO и RPO.", "A disaster recovery (DR) plan chooses a strategy based on RTO and RPO targets."],
      [["Hodisa\nasosiy markaz yo‘q", "Инцидент\nосновной ЦОД недоступен", "Incident\nprimary site down"], ["RTO / RPO\nmaqsadlar", "RTO / RPO\nцели", "RTO / RPO\ntargets"], ["Strategiya\nhot / warm / cold site", "Стратегия\nhot / warm / cold site", "Strategy\nhot / warm / cold site"], ["Qayta tiklash\nxizmat davom etadi", "Восстановление\nслужба продолжает работу", "Failback\nservice resumes"]],
      [["baholanadi", "оценивается", "evaluated against"], ["belgilaydi", "определяет", "selects"], ["amalga oshiriladi", "выполняется", "executed as"]]
    )
  }
};
