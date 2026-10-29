import type { Category, LearningModule, LearningPath, LearningReference, LearningSection, Localized } from "./learning-demo";

const l = (uz: string, ru: string = uz, en: string = uz): Localized => ({ uz, ru, en });

type LocalizedChapterField = { uz: string; ru: string; en: string };

type Chapter = {
  title: LocalizedChapterField;
  content: LocalizedChapterField;
  example: LocalizedChapterField;
  explanation: LocalizedChapterField;
  prompt: LocalizedChapterField;
  answers: string[];
};

type Book = {
  slug: string;
  title: LocalizedChapterField;
  summary: LocalizedChapterField;
  category: Category;
  difficulty: LearningModule["difficulty"];
  hours: number;
  labPlan: LocalizedChapterField;
  references: LearningReference[];
  chapters: Chapter[];
};

const t = (uz: string, ru: string, en: string): LocalizedChapterField => ({ uz, ru, en });
const reference = (label: LocalizedChapterField, href: string): LearningReference => ({ label: l(label.uz, label.ru, label.en), href });
const section = (chapter: Chapter): LearningSection => ({
  title: l(chapter.title.uz, chapter.title.ru, chapter.title.en),
  content: l(chapter.content.uz, chapter.content.ru, chapter.content.en),
  example: l(chapter.example.uz, chapter.example.ru, chapter.example.en),
  exampleExplanation: l(chapter.explanation.uz, chapter.explanation.ru, chapter.explanation.en),
  question: { prompt: l(chapter.prompt.uz, chapter.prompt.ru, chapter.prompt.en), answers: chapter.answers }
});

function book(data: Book): LearningModule {
  return {
    slug: data.slug,
    title: l(data.title.uz, data.title.ru, data.title.en),
    summary: l(data.summary.uz, data.summary.ru, data.summary.en),
    difficulty: data.difficulty,
    category: data.category,
    hours: data.hours,
    hasLab: true,
    labPlan: l(data.labPlan.uz, data.labPlan.ru, data.labPlan.en),
    references: data.references,
    sections: data.chapters.map(section)
  };
}

export const careerLearningModules: LearningModule[] = [
  book({
    slug: "computer-science-core",
    title: t("Kompyuter fanlari: asoslardan tizimli fikrlashgacha", "Информатика: от основ до системного мышления", "Computer science: from fundamentals to systems thinking"),
    summary: t(
      "Bit, algoritm, operatsion tizim, tarmoq, ma’lumotlar bazasi, dasturiy ta’minot hayot sikli va tizim dizaynini juniordan senior darajadagi tahlilgacha bog‘laydigan darslik.",
      "Курс, связывающий биты, алгоритмы, операционные системы, сети, базы данных, жизненный цикл ПО и проектирование систем — от уровня джуниора до анализа уровня сеньора.",
      "A course linking bits, algorithms, operating systems, networking, databases, the software lifecycle, and system design — from junior-level basics to senior-level analysis."
    ),
    category: "systems", difficulty: "fundamental", hours: 42,
    labPlan: t(
      "Sintetik ma’lumotlar bilan bajariladigan 8 ta mashq: sanoq tizimlari, algoritm bahosi, jarayonlar, SQL tranzaksiyalari, API kuzatuvi va tizim dizayni qarorlari.",
      "8 упражнений на синтетических данных: системы счисления, оценка алгоритмов, процессы, SQL-транзакции, наблюдение за API и решения по проектированию систем.",
      "8 exercises on synthetic data: number systems, algorithm complexity, processes, SQL transactions, API observability, and system design decisions."
    ),
    references: [
      reference(t("Harvard CS50x — kompyuter fanlariga kirish", "Harvard CS50x — введение в информатику", "Harvard CS50x — introduction to computer science"), "https://cs50.harvard.edu/x/"),
      reference(t("MIT OpenCourseWare 6.006 — algoritmlar", "MIT OpenCourseWare 6.006 — алгоритмы", "MIT OpenCourseWare 6.006 — algorithms"), "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/"),
      reference(t("Nand2Tetris — kompyuter tizimlari", "Nand2Tetris — компьютерные системы", "Nand2Tetris — computer systems"), "https://www.nand2tetris.org/")
    ],
    chapters: [
      {
        title: t("1. Ma’lumot qanday ifodalanadi: bitdan matn va faylgacha", "1. Как представляются данные: от бита до текста и файла", "1. How data is represented: from bits to text and files"),
        content: t(
          "Kompyuter ma’lumotni bitlar ketma-ketligi sifatida saqlaydi. 8 bit bir bayt; 1 KiB odatda 1024 bayt, 1 kB esa 1000 baytni bildiradi, shuning uchun disk hajmi va xotira ko‘rsatkichlarini solishtirganda birlikni aniqlang. Ikkilik va o‘n oltilik sanoq tizimlari bit naqshlarini ixcham ifodalaydi; signed/unsigned butun sonlar, overflow va endianness qiymat talqinini o‘zgartiradi.\n\nMatn ham kodlash orqali baytlarga o‘giriladi: UTF-8 o‘zgaruvchan uzunlikdagi kodlash bo‘lib, Unicode belgilarining keng qismini ifodalaydi. Fayl nomi yoki matn noto‘g‘ri ko‘rinsa, baytlar yo‘qolgan deb darhol xulosa qilmang; kodlash, locale va dekoder zanjirini tekshiring. Bu bilim log, tarmoq paketi, xotira sarfi va disk hisobotlaridagi xatolarni tushunishga asos bo‘ladi.",
          "Компьютер хранит данные как последовательность битов. 8 бит — это 1 байт; 1 КиБ обычно означает 1024 байта, а 1 кБ — 1000 байт, поэтому при сравнении объёма диска и памяти уточняйте единицу измерения. Двоичная и шестнадцатеричная системы счисления компактно представляют битовые шаблоны; знаковые/беззнаковые целые числа, переполнение и endianness меняют интерпретацию значения.\n\nТекст тоже преобразуется в байты через кодировку: UTF-8 — это кодировка переменной длины, представляющая большую часть символов Unicode. Если имя файла или текст отображается некорректно, не делайте поспешный вывод о потере байтов; проверьте кодировку, локаль и цепочку декодирования. Это знание — основа для понимания ошибок в логах, сетевых пакетах, использовании памяти и отчётах по диску.",
          "A computer stores data as a sequence of bits. 8 bits make 1 byte; 1 KiB usually means 1024 bytes while 1 kB means 1000 bytes, so clarify the unit when comparing disk size and memory figures. Binary and hexadecimal number systems compactly represent bit patterns; signed/unsigned integers, overflow, and endianness change how a value is interpreted.\n\nText is also converted to bytes via an encoding: UTF-8 is a variable-length encoding that represents most Unicode characters. If a filename or text looks wrong, don't immediately conclude bytes were lost; check the encoding, locale, and decoder chain. This knowledge underlies understanding errors in logs, network packets, memory usage, and disk reports."
        ),
        example: t(
          "0x2A = 42 (o‘nlik); 42 = 00101010 (8 bit).\nUTF-8 faylni tekshirish: file report.txt\nFayl o‘lchami: wc -c report.txt",
          "0x2A = 42 (десятичное); 42 = 00101010 (8 бит).\nПроверка кодировки файла: file report.txt\nРазмер файла: wc -c report.txt",
          "0x2A = 42 (decimal); 42 = 00101010 (8 bits).\nCheck UTF-8 encoding of a file: file report.txt\nFile size: wc -c report.txt"
        ),
        explanation: t(
          "Hex/binary konversiyani qo‘lda tekshiring; `wc -c` baytni sanaydi, matn belgilarini emas. Haqiqiy fayl bilan ishlashdan oldin nusxa oling va maxfiy ma’lumotni tashqi decoder saytlariga yubormang.",
          "Проверяйте hex/binary конверсию вручную; `wc -c` считает байты, а не текстовые символы. Перед работой с реальным файлом сделайте копию и не отправляйте конфиденциальные данные на внешние сайты-декодеры.",
          "Verify hex/binary conversion manually; `wc -c` counts bytes, not text characters. Make a copy before working with a real file, and never send sensitive data to external decoder websites."
        ),
        prompt: t("8 bit qanday birlikni tashkil qiladi?", "Какую единицу образуют 8 бит?", "What unit do 8 bits form?"),
        answers: ["1 bayt", "1 byte", "byte"]
      },
      {
        title: t("2. Mantiq, ma’lumot tuzilmalari va algoritm murakkabligi", "2. Логика, структуры данных и сложность алгоритмов", "2. Logic, data structures, and algorithmic complexity"),
        content: t(
          "Algoritm kirish ma’lumotini chiqishga aylantiruvchi aniq qadamlar ketma-ketligidir. Array indeks bilan tez murojaat beradi; linked list qo‘shish/o‘chirishni ayrim joylarda yengillashtiradi; hash table o‘rtacha holatda tez qidiradi, lekin collision va xotira sarfi bor; queue/FIFO va stack/LIFO turli navbat semantikasini beradi. Tuzilmani moda bo‘lgani uchun emas, ish yukiga mosligi uchun tanlang.\n\nBig O o‘sish tartibini tasvirlaydi: O(1), O(log n), O(n), O(n log n), O(n²). Bu aniq vaqt o‘lchovi emas; konstantalar, xotira, cache va real ma’lumot ham muhim. Senior darajada worst-case, amortized xarajat, input hajmi chegarasi va degradatsiya yo‘lini ko‘rsating. Hash collisionga chidamlilik, pagination va resurs limitlari ishlab chiqarish xizmatini haddan tashqari yuklanishdan himoya qilishga yordam beradi.",
          "Алгоритм — это точная последовательность шагов, преобразующих входные данные в выходные. Массив обеспечивает быстрый доступ по индексу; связный список упрощает вставку/удаление в некоторых местах; хеш-таблица в среднем обеспечивает быстрый поиск, но имеет коллизии и расход памяти; очередь/FIFO и стек/LIFO дают разную семантику порядка. Выбирайте структуру не из-за моды, а исходя из нагрузки.\n\nBig O описывает порядок роста: O(1), O(log n), O(n), O(n log n), O(n²). Это не точная мера времени; важны константы, память, кеш и реальные данные. На senior-уровне указывайте худший случай, амортизированную стоимость, ограничения объёма входных данных и путь деградации. Устойчивость к коллизиям хеша, пагинация и лимиты ресурсов помогают защитить продакшн-сервис от перегрузки.",
          "An algorithm is a precise sequence of steps that transforms input into output. An array gives fast indexed access; a linked list eases insertion/deletion in some places; a hash table searches fast on average but has collisions and memory overhead; queue/FIFO and stack/LIFO give different ordering semantics. Choose a structure to fit the workload, not because it's trendy.\n\nBig O describes the order of growth: O(1), O(log n), O(n), O(n log n), O(n²). It is not an exact time measurement; constants, memory, cache, and real data also matter. At a senior level, state the worst case, amortized cost, input-size limits, and degradation path. Resilience to hash collisions, pagination, and resource limits help protect a production service from being overloaded."
        ),
        example: t(
          "Kichik to‘plamni tartiblash: O(n log n) algoritmni baholang.\nRo‘yxatda ketma-ket qidiruv: O(n).\nHash table’da qidiruv: o‘rtacha O(1), eng yomon holatni ham hujjatlashtiring.",
          "Сортировка небольшого набора: оцените алгоритм O(n log n).\nПоследовательный поиск в списке: O(n).\nПоиск в хеш-таблице: в среднем O(1), документируйте и худший случай.",
          "Sorting a small set: evaluate an O(n log n) algorithm.\nSequential search in a list: O(n).\nLookup in a hash table: average O(1), also document the worst case."
        ),
        explanation: t(
          "Bu baholar algoritm va ma’lumot tuzilmasi haqidagi tahlil; ularni benchmark bilan tasdiqlang. Maxfiy yoki katta ishlab chiqarish ma’lumotlarini o‘quv muhitiga ko‘chirmang.",
          "Эти оценки — анализ алгоритма и структуры данных; подтверждайте их бенчмарками. Не переносите конфиденциальные или крупные продакшн-данные в учебную среду.",
          "These estimates are an analysis of the algorithm and data structure; confirm them with benchmarks. Do not copy sensitive or large production data into a training environment."
        ),
        prompt: t("n elementni bir marta ko‘rib chiqadigan algoritmning chiziqli murakkabligi qanday yoziladi?", "Как записывается линейная сложность алгоритма, который один раз просматривает n элементов?", "How is the linear complexity of an algorithm that scans n elements once written?"),
        answers: ["o(n)", "on", "linear"]
      },
      {
        title: t("3. Operatsion tizim: jarayon, thread, xotira va fayl", "3. Операционная система: процесс, поток, память и файл", "3. Operating system: process, thread, memory, and file"),
        content: t(
          "Jarayon — izolyatsiyalangan manzil maydoni va resurslarga ega ishlayotgan dastur; thread esa jarayon ichidagi bajarilish oqimi bo‘lib, xotirani boshqa threadlar bilan bo‘lishadi. Scheduler CPU vaqtini taqsimlaydi. Virtual xotira jarayonga uzluksiz manzil maydoni ko‘rsatadi, lekin fizik RAM sahifalar orqali boshqariladi; page fault har doim xato emas, ammo doimiy swapping unumdorlikni pasaytirishi mumkin.\n\nFayl tizimi nom, metadata va bloklarni boshqaradi. File descriptor, inode, mount, buffer va permission tushunchalari Linux/Unix’da nosozlik qidirishga yordam beradi; Windows’da handle, NTFS ACL va service identity muhim. Tizim muammosida CPU, RAM, disk I/O, process count va loglarni bir vaqtda kuzating. Bir metrikaning o‘zi sababni isbotlamaydi; vaqt oralig‘i va o‘zgarishlar tarixini bog‘lang.",
          "Процесс — это выполняемая программа с изолированным адресным пространством и ресурсами; поток же — это нить выполнения внутри процесса, разделяющая память с другими потоками. Планировщик распределяет процессорное время. Виртуальная память показывает процессу непрерывное адресное пространство, но физическая RAM управляется постранично; page fault не всегда ошибка, однако постоянный swapping может снижать производительность.\n\nФайловая система управляет именами, метаданными и блоками. Понятия file descriptor, inode, mount, buffer и permission помогают диагностировать проблемы в Linux/Unix; в Windows важны handle, NTFS ACL и service identity. При системной проблеме отслеживайте CPU, RAM, дисковый I/O, количество процессов и логи одновременно. Одна метрика сама по себе не доказывает причину; связывайте временной интервал и историю изменений.",
          "A process is a running program with an isolated address space and resources; a thread is a flow of execution within a process that shares memory with other threads. The scheduler allocates CPU time. Virtual memory presents a process with a contiguous address space, but physical RAM is managed in pages; a page fault is not always an error, though persistent swapping can degrade performance.\n\nThe filesystem manages names, metadata, and blocks. Concepts like file descriptor, inode, mount, buffer, and permission help troubleshoot on Linux/Unix; on Windows, handle, NTFS ACL, and service identity matter. During a system issue, track CPU, RAM, disk I/O, process count, and logs together. A single metric alone does not prove the cause; correlate the time window with the change history."
        ),
        example: t(
          "Linux: ps -eo pid,ppid,stat,%cpu,%mem,comm --sort=-%cpu | head\nLinux: free -h; df -h\nWindows: Get-Process | Sort-Object CPU -Descending | Select-Object -First 5",
          "Linux: ps -eo pid,ppid,stat,%cpu,%mem,comm --sort=-%cpu | head\nLinux: free -h; df -h\nWindows: Get-Process | Sort-Object CPU -Descending | Select-Object -First 5",
          "Linux: ps -eo pid,ppid,stat,%cpu,%mem,comm --sort=-%cpu | head\nLinux: free -h; df -h\nWindows: Get-Process | Sort-Object CPU -Descending | Select-Object -First 5"
        ),
        explanation: t(
          "Buyruqlar kuzatuv uchun; natijada foydalanuvchi nomlari yoki jarayon argumentlarida sirlar bo‘lishi mumkin. Hisobot ulashishdan oldin ularni niqoblang.",
          "Команды предназначены для мониторинга; в результатах могут содержаться имена пользователей или секреты в аргументах процессов. Маскируйте их перед тем как делиться отчётом.",
          "These commands are for observation; results may contain usernames or secrets in process arguments. Mask them before sharing a report."
        ),
        prompt: t("Bir jarayon ichida umumiy manzil maydonini bo‘lishadigan bajarilish oqimi nima?", "Что представляет собой поток выполнения, разделяющий общее адресное пространство внутри процесса?", "What is a flow of execution that shares a common address space within a process?"),
        answers: ["thread", "oqim", "ip"]
      },
      {
        title: t("4. Tarmoq va taqsimlangan tizimlar: kechikish, xato va izchillik", "4. Сети и распределённые системы: задержка, ошибки и согласованность", "4. Networks and distributed systems: latency, failure, and consistency"),
        content: t(
          "Taqsimlangan xizmatlar tarmoq orqali aloqa qiluvchi mustaqil tugunlardan tuziladi. Tarmoq ishonchsiz: paket yo‘qolishi, timeout, kechikish, takroriy so‘rov va qisman uzilish sodir bo‘ladi. Shuning uchun timeout, retry backoff, idempotency key va circuit breaker kabi naqshlarni ongli tanlang; cheksiz retry xizmatdagi tiqilishni kuchaytirishi mumkin.\n\nCAP va consistency atamalarini soddalashtirib noto‘g‘ri qo‘llamang. Tizim bo‘limlanishi (partition) paytida izchillik va mavjudlik qarori mahsulot talabiga bog‘liq; eventual consistency foydalanuvchi tajribasida kechikishni anglatishi mumkin. DNS, TCP, TLS, load balancer va service discovery qatlamlarini alohida tekshiring. Senior dizayn hujjatida SLO, xato budjeti, ishdan chiqish domenlari, ma’lumot yo‘qotish limiti va tiklanish vaqti aniq bo‘lsin.",
          "Распределённые сервисы строятся из независимых узлов, взаимодействующих по сети. Сеть ненадёжна: происходят потери пакетов, таймауты, задержки, повторные запросы и частичные разрывы связи. Поэтому осознанно выбирайте такие паттерны, как timeout, retry с backoff, idempotency key и circuit breaker; бесконечные повторные попытки могут усилить перегрузку сервиса.\n\nНе применяйте термины CAP и consistency упрощённо и некорректно. Во время разделения системы (partition) решение между согласованностью и доступностью зависит от требований продукта; eventual consistency может означать задержку в восприятии пользователя. Проверяйте слои DNS, TCP, TLS, балансировщика нагрузки и service discovery по отдельности. В senior-документе дизайна должны быть чётко указаны SLO, бюджет ошибок, домены отказа, лимит потери данных и время восстановления.",
          "Distributed services are built from independent nodes communicating over a network. The network is unreliable: packet loss, timeouts, latency, retries, and partial outages occur. So deliberately choose patterns such as timeout, retry with backoff, idempotency keys, and circuit breakers; unbounded retries can amplify congestion in a service.\n\nDon't oversimplify or misapply the terms CAP and consistency. During a system partition, the choice between consistency and availability depends on product requirements; eventual consistency can mean perceived latency for the user. Check the DNS, TCP, TLS, load balancer, and service discovery layers separately. A senior design document should clearly state SLOs, error budget, failure domains, data-loss limits, and recovery time."
        ),
        example: t(
          "So‘rov oqimi: client → DNS → load balancer → service → database.\nHar bir hop uchun timeout, retry soni, request ID va mas’uliyatni yozing.",
          "Поток запроса: client → DNS → load balancer → service → database.\nДля каждого hop укажите timeout, количество retry, request ID и зону ответственности.",
          "Request flow: client → DNS → load balancer → service → database.\nFor each hop, record the timeout, retry count, request ID, and ownership."
        ),
        explanation: t(
          "Bu model arxitektura muhokamasi uchun. Haqiqiy xizmatda o‘zgarishni staging, monitoring, rollback va tasdiqlangan change window bilan bajaring.",
          "Эта модель предназначена для архитектурного обсуждения. В реальном сервисе вносите изменения через staging, мониторинг, rollback и согласованное окно изменений.",
          "This model is for architectural discussion. In a real service, make changes through staging, monitoring, rollback, and an approved change window."
        ),
        prompt: t("Bir so‘rov takror yuborilganda natijani xavfsiz takrorlanadigan qiluvchi xususiyat?", "Свойство, которое делает результат безопасно повторяемым при повторной отправке запроса?", "The property that makes a result safe to repeat when a request is resent?"),
        answers: ["idempotency", "idempotentlik", "idempotent"]
      },
      {
        title: t("5. Ma’lumotlar bazasi: SQL, tranzaksiya va yaxlitlik", "5. Базы данных: SQL, транзакции и целостность", "5. Databases: SQL, transactions, and integrity"),
        content: t(
          "Relatsion ma’lumotlar bazasi jadvallarni kalit va constraintlar bilan bog‘laydi. Primary key qatorni aniqlaydi; foreign key munosabatni saqlaydi; unique/check constraint noto‘g‘ri holatni saqlashga yo‘l qo‘ymaydi. Index o‘qishni tezlashtirishi mumkin, ammo yozishni va disk sarfini oshiradi; query plan va real ish yukini o‘lchang.\n\nACID tranzaksiyalari atomicity, consistency, isolation, durability xususiyatlarini beradi. Isolation darajasi parallel o‘qish/yozishda ko‘rinadigan holatni belgilaydi; deadlock bo‘lsa, retry siyosati chegaralangan bo‘lsin. Backup faqat fayl yaratish emas: restore sinovi, RPO/RTO, shifrlash, kalitlar, retention va ajratilgan hisoblar bilan to‘liq tiklash jarayonidir. SQL injectiondan himoyalanish uchun parametrli so‘rov ishlating; foydalanuvchi kiritgan matnni so‘rovga biriktirmang.",
          "Реляционная база данных связывает таблицы с помощью ключей и ограничений. Primary key идентифицирует строку; foreign key сохраняет связь; ограничения unique/check не позволяют сохранить некорректное состояние. Индекс может ускорить чтение, но увеличивает затраты на запись и дисковое пространство; измеряйте план запроса и реальную нагрузку.\n\nACID-транзакции обеспечивают свойства atomicity, consistency, isolation, durability. Уровень изоляции определяет, какое состояние видно при параллельном чтении/записи; при deadlock политика повторных попыток должна быть ограниченной. Резервное копирование — это не просто создание файла: это полный процесс восстановления, включающий тест восстановления, RPO/RTO, шифрование, ключи, retention и отдельные учётные записи. Для защиты от SQL-инъекций используйте параметризованные запросы; не вставляйте пользовательский ввод непосредственно в запрос.",
          "A relational database links tables through keys and constraints. A primary key identifies a row; a foreign key preserves a relationship; unique/check constraints prevent storing an invalid state. An index can speed up reads but increases write cost and disk usage; measure the query plan and real workload.\n\nACID transactions provide atomicity, consistency, isolation, and durability. The isolation level determines what state is visible during concurrent reads/writes; if a deadlock occurs, the retry policy should be bounded. A backup is not just creating a file: it's a complete restore process involving a restore test, RPO/RTO, encryption, keys, retention, and separate accounts. To protect against SQL injection, use parameterized queries; never concatenate user input directly into a query."
        ),
        example: t(
          "SELECT status, COUNT(*) FROM tickets GROUP BY status;\n-- Parametrli so‘rov misoli: SELECT * FROM users WHERE email = ?",
          "SELECT status, COUNT(*) FROM tickets GROUP BY status;\n-- Пример параметризованного запроса: SELECT * FROM users WHERE email = ?",
          "SELECT status, COUNT(*) FROM tickets GROUP BY status;\n-- Example of a parameterized query: SELECT * FROM users WHERE email = ?"
        ),
        explanation: t(
          "Misollar sintetik jadvalga mo‘ljallangan. `SELECT *` va shaxsiy ma’lumotlarni logga chiqarishni ishlab chiqarishda cheklang; parametr nomi driverga qarab farq qiladi.",
          "Примеры рассчитаны на синтетическую таблицу. Ограничивайте использование `SELECT *` и вывод персональных данных в лог в продакшене; имя параметра зависит от драйвера.",
          "The examples are intended for a synthetic table. Limit `SELECT *` and logging personal data in production; the parameter name depends on the driver."
        ),
        prompt: t("SQL qidiruvda foydalanuvchi kiritgan matnni to‘g‘ridan-to‘g‘ri so‘rovga biriktirmay, xavfsiz uzatish usuli?", "Способ безопасной передачи пользовательского ввода в SQL-запрос без прямой конкатенации?", "The safe way to pass user input into an SQL query without direct concatenation?"),
        answers: ["parametrli so‘rov", "prepared statement", "parameterized query", "bind parameter"]
      },
      {
        title: t("6. Dasturiy ta’minot hayot sikli, Git, test va xatoni izlash", "6. Жизненный цикл ПО, Git, тестирование и отладка", "6. Software lifecycle, Git, testing, and debugging"),
        content: t(
          "Ishonchli jamoa talabni yozadi, kichik o‘zgarish kiritadi, code review va avtomatlashtirilgan testdan o‘tkazadi, keyin nazoratli deploy qiladi. Git commit tarixni beradi, lekin noto‘g‘ri secret commit qilingan bo‘lsa, uni o‘chirishning o‘zi credentialni bekor qilmaydi. Secretlarni secret managerda saqlang; `.env` faylini repoga qo‘shmang.\n\nUnit test kichik funksiyani, integration test komponentlar chegarasini, end-to-end test foydalanuvchi oqimini tekshiradi. Testlar kuzatiladigan talab va rollback qarorini qo‘llab-quvvatlaydi; faqat coverage foizi sifat kafolati emas. Bugni takrorlash qadami, kutilgan/haqiqiy holat, minimal reproducer va log vaqtini yozing. Senior review’da backward compatibility, migratsiya, observability, xavfsizlik, accessibility va operatsion yukni ham baholang.",
          "Надёжная команда фиксирует требование, вносит небольшое изменение, проводит code review и автоматизированное тестирование, затем выполняет контролируемый деплой. История Git-коммитов сохраняется, но если был случайно закоммичен секрет, одно лишь его удаление не аннулирует учётные данные. Храните секреты в secret manager; не добавляйте файл `.env` в репозиторий.\n\nUnit-тест проверяет небольшую функцию, integration-тест — границу компонентов, end-to-end-тест — пользовательский поток. Тесты поддерживают отслеживаемость требований и решения о rollback; один лишь процент покрытия не гарантирует качество. Записывайте шаги воспроизведения бага, ожидаемое/фактическое состояние, минимальный репродьюсер и время в логе. В senior-ревью также оценивайте обратную совместимость, миграцию, observability, безопасность, доступность (accessibility) и операционную нагрузку.",
          "A reliable team writes down the requirement, makes a small change, runs it through code review and automated tests, then deploys it in a controlled way. Git commit history is preserved, but if a secret was accidentally committed, deleting it alone does not invalidate the credential. Store secrets in a secret manager; don't add a `.env` file to the repository.\n\nA unit test checks a small function, an integration test checks the boundary between components, and an end-to-end test checks the user flow. Tests support traceable requirements and rollback decisions; coverage percentage alone is not a quality guarantee. Record the bug reproduction steps, expected/actual state, a minimal reproducer, and the log timestamp. In a senior review, also evaluate backward compatibility, migration, observability, security, accessibility, and operational load."
        ),
        example: t(
          "Git tarixini ko‘rish: git log --oneline --decorate -10\nO‘zgarishni tekshirish: git diff --check\nPull request rubrikasi: correctness, tests, security, rollback, observability.",
          "Просмотр истории Git: git log --oneline --decorate -10\nПроверка изменений: git diff --check\nРубрика pull request: correctness, tests, security, rollback, observability.",
          "View Git history: git log --oneline --decorate -10\nCheck a change: git diff --check\nPull request rubric: correctness, tests, security, rollback, observability."
        ),
        explanation: t(
          "Bu misollar lokal repoda o‘qish va format tekshiruvini bajaradi. Secret topilsa, uni public issue yoki logga qo‘ymang; tegishli egaga xabar bering va credentialni rotate qiling.",
          "Эти примеры выполняют чтение и проверку формата в локальном репозитории. Если найден секрет, не публикуйте его в публичном issue или логе; сообщите ответственному владельцу и выполните ротацию учётных данных.",
          "These examples perform a read and format check in a local repository. If a secret is found, don't post it in a public issue or log; notify the responsible owner and rotate the credential."
        ),
        prompt: t("Tashqi xizmatlar yoki komponentlar o‘rtasidagi integratsiyani tekshiruvchi test turi?", "Тип теста, проверяющий интеграцию между внешними сервисами или компонентами?", "The type of test that verifies integration between external services or components?"),
        answers: ["integration test", "integratsion test"]
      },
      {
        title: t("7. Tizim dizayni va senior muhandisning qaror yozuvi", "7. Проектирование систем и фиксация решений senior-инженера", "7. System design and a senior engineer's decision record"),
        content: t(
          "Senior muhandis faqat diagramma chizmaydi: talab, taxmin, yuk profili, ishonch chegarasi, ma’lumot tasnifi, failure mode va operatsion egani aniqlaydi. Architecture Decision Record (ADR) qaror, ko‘rib chiqilgan variant, sabab, oqibat va qayta ko‘rish shartini qayd etadi. Bu hujjat kelajakdagi jamoaga kontekst beradi va yashirin qarorni kamaytiradi.\n\nCapacity planningda o‘rtacha va peak yuk, o‘sish sur’ati, storage retention, tarmoq chiqimi va recovery nusxasini hisoblang. SLO foydalanuvchi sezadigan ishonchlilik maqsadini ifodalaydi; alertlar foydalanuvchiga ta’sirga bog‘langan bo‘lsin. Tizim dizaynini kichik boshlang, lekin partition, region yo‘qolishi, ma’lumotni o‘chirish, vendor lock-in va xavfsizlik hodisasiga javobni rejalashtiring. Har qarorni trade-off bilan himoya qiling.",
          "Senior-инженер не просто рисует диаграммы: он определяет требования, допущения, профиль нагрузки, границы доверия, классификацию данных, режимы отказа и операционного владельца. Architecture Decision Record (ADR) фиксирует решение, рассмотренные варианты, причину, последствия и условие пересмотра. Этот документ даёт контекст будущей команде и уменьшает скрытые решения.\n\nПри capacity planning рассчитывайте среднюю и пиковую нагрузку, темп роста, retention хранилища, сетевой трафик и копию для восстановления. SLO выражает ощущаемую пользователем цель надёжности; алерты должны быть привязаны к влиянию на пользователя. Начинайте проектирование системы с малого, но планируйте реакцию на partition, потерю региона, удаление данных, vendor lock-in и инцидент безопасности. Обосновывайте каждое решение через trade-off.",
          "A senior engineer doesn't just draw diagrams: they define requirements, assumptions, load profile, trust boundaries, data classification, failure modes, and the operational owner. An Architecture Decision Record (ADR) records the decision, considered alternatives, rationale, consequences, and revisit criteria. This document gives future teams context and reduces hidden decisions.\n\nIn capacity planning, calculate average and peak load, growth rate, storage retention, network egress, and recovery copies. An SLO expresses a user-perceived reliability goal; alerts should be tied to user impact. Start system design small, but plan the response to partitions, region loss, data deletion, vendor lock-in, and security incidents. Justify every decision with its trade-offs."
        ),
        example: t(
          "ADR: Kontekst → qaror → ko‘rib chiqilgan variantlar → xavflar → monitoring → rollback → qayta ko‘rish mezoni.",
          "ADR: контекст → решение → рассмотренные варианты → риски → мониторинг → rollback → критерий пересмотра.",
          "ADR: context → decision → considered alternatives → risks → monitoring → rollback → revisit criteria."
        ),
        explanation: t(
          "Misol shablon; yakuniy arxitektura biznes, privacy va compliance egalarining tasdig‘ini talab qilishi mumkin.",
          "Это шаблонный пример; окончательная архитектура может требовать утверждения со стороны владельцев бизнеса, privacy и compliance.",
          "This is a sample template; the final architecture may require approval from business, privacy, and compliance owners."
        ),
        prompt: t("Arxitektura qarorining sababi va oqibatlarini qisqa qayd etuvchi hujjat?", "Документ, кратко фиксирующий причину и последствия архитектурного решения?", "The document that briefly records the rationale and consequences of an architecture decision?"),
        answers: ["adr", "architecture decision record"]
      },
      {
        title: t("8. Mas’uliyatli amaliyot, maxfiylik va bilimni isbotlash", "8. Ответственная практика, конфиденциальность и подтверждение знаний", "8. Responsible practice, privacy, and demonstrating knowledge"),
        content: t(
          "IT muhandisi foydalanuvchi ma’lumotlari va xizmatlar uzluksizligiga ta’sir qiladi. Eng kam vakolat, vazifalarni ajratish, audit izi, ma’lumotni minimallashtirish va aniq rozilik/huquqiy asos kabi tamoyillarni texnik dizaynga qo‘shing. Ish beruvchi portfolio yoki suhbatda faqat sertifikatni emas, qaror jarayoni, noaniqlikni qanday boshqarganingiz va xatodan nimani o‘rganganingizni ham so‘rashi mumkin.\n\nPortfolio loyihasida faqat sintetik yoki ruxsatli ma’lumot ishlating; real ish beruvchi logi, mijoz nomi, credential va zaiflik tafsilotini oshkor qilmang. README’da maqsad, arxitektura, threat model, test, cheklov, xavfsiz ishga tushirish, natija va keyingi yaxshilashni yozing. Ishga tayyorlik kurs tugatish bilan kafolatlanmaydi; ko‘nikma muntazam mustaqil amaliyot va tajriba bilan shakllanadi.",
          "IT-инженер влияет на пользовательские данные и непрерывность сервисов. Включайте в технический дизайн такие принципы, как минимальные привилегии, разделение обязанностей, audit trail, минимизация данных и чёткое согласие/правовое основание. Работодатель в портфолио или на собеседовании может спрашивать не только о сертификате, но и о процессе принятия решений, о том, как вы справлялись с неопределённостью, и чему научились на ошибках.\n\nВ проекте портфолио используйте только синтетические или разрешённые данные; не раскрывайте реальные логи работодателя, имена клиентов, учётные данные и детали уязвимостей. В README укажите цель, архитектуру, модель угроз, тесты, ограничения, безопасный запуск, результаты и дальнейшие улучшения. Готовность к работе не гарантируется завершением курса; навык формируется через регулярную самостоятельную практику и опыт.",
          "An IT engineer affects user data and service continuity. Build principles such as least privilege, separation of duties, an audit trail, data minimization, and clear consent/legal basis into the technical design. An employer, in a portfolio or interview, may ask not only about certificates but also about your decision-making process, how you handled uncertainty, and what you learned from mistakes.\n\nIn a portfolio project, use only synthetic or authorized data; never expose a real employer's logs, client names, credentials, or vulnerability details. In the README, state the purpose, architecture, threat model, tests, limitations, safe setup, results, and planned improvements. Job readiness is not guaranteed by finishing a course; skill is built through regular independent practice and experience."
        ),
        example: t(
          "Portfolio README: maqsad / scope / diagramma / testlar / xavfsizlik cheklovlari / tiklash / o‘rganilgan saboq.",
          "Portfolio README: цель / scope / диаграмма / тесты / ограничения безопасности / восстановление / извлечённый урок.",
          "Portfolio README: purpose / scope / diagram / tests / security constraints / recovery / lessons learned."
        ),
        explanation: t(
          "Ko‘rsatish uchun sintetik data va ataylab ajratilgan lokal muhitdan foydalaning; ish beruvchi yoki mijozga tegishli materialni ommaga chiqarmang.",
          "Для демонстрации используйте синтетические данные и специально выделенную локальную среду; не публикуйте материалы, принадлежащие работодателю или клиенту.",
          "For demonstration, use synthetic data and a deliberately isolated local environment; don't publish material belonging to an employer or client."
        ),
        prompt: t("Ruxsat etilgan hajmdan tashqaridagi tizimni tekshirishdan oldin nimani olish shart?", "Что обязательно нужно получить перед тестированием системы за пределами разрешённого объёма?", "What must be obtained before testing a system outside the authorized scope?"),
        answers: ["yozma ruxsat", "yozma vakolat", "written authorization", "authorization"]
      }
    ]
  }),
  book({
    slug: "linux-systems-administration",
    title: t("Linux tizim administratsiyasi va ishonchli operatsiyalar", "Администрирование Linux-систем и надёжные операции", "Linux systems administration and reliable operations"),
    summary: t(
      "Linux serverni o‘rnatishdan incident response va senior operatsion boshqaruvigacha: foydalanuvchi, systemd, storage, tarmoq, hardening, monitoring va tiklash.",
      "От установки Linux-сервера до реагирования на инциденты и senior-уровня операционного управления: пользователи, systemd, хранилище, сеть, hardening, мониторинг и восстановление.",
      "From setting up a Linux server to incident response and senior-level operational management: users, systemd, storage, networking, hardening, monitoring, and recovery."
    ),
    category: "systems", difficulty: "medium", hours: 36,
    labPlan: t(
      "Izolyatsiyalangan VM yoki berilgan sintetik chiqishlarda Linux service, permission, disk, DNS, patch, backup va incident tahlili.",
      "Анализ Linux-сервисов, прав доступа, дисков, DNS, патчей, резервного копирования и инцидентов в изолированной VM или на предоставленных синтетических выводах.",
      "Analysis of Linux services, permissions, disks, DNS, patches, backups, and incidents in an isolated VM or on provided synthetic output."
    ),
    references: [
      reference(t("Red Hat Enterprise Linux 9 — xavfsizlikni mustahkamlash", "Red Hat Enterprise Linux 9 — усиление защищённости", "Red Hat Enterprise Linux 9 — security hardening"), "https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/security_hardening/index"),
      reference(t("systemd man pages", "Справочные страницы systemd", "systemd man pages"), "https://www.freedesktop.org/software/systemd/man/latest/"),
      reference(t("Linux man-pages project", "Проект Linux man-pages", "Linux man-pages project"), "https://man7.org/linux/man-pages/")
    ],
    chapters: [
      {
        title: t("1. Shell, fayl tizimi va xavfsiz buyruq satri", "1. Shell, файловая система и безопасная командная строка", "1. The shell, filesystem, and safe command-line practice"),
        content: t(
          "Shell buyruqlarni jarayonlarga aylantiradi, stdout/stderr oqimlarini yo‘naltiradi va pipeline orqali bog‘laydi. `/etc` konfiguratsiya, `/var/log` o‘zgaruvchan log, `/home` foydalanuvchi ma’lumoti, `/proc` va `/sys` esa yadro holatining virtual ko‘rinishlarini saqlaydi. Nisbiy va mutlaq yo‘lni ajrating; symbolic link va mount nuqtasi asl diskni yashirishi mumkin.\n\nAvval o‘qish buyruqlarini ishlating, keyin o‘zgarish rejasini tuzing. `sudo` bilan noma’lum skriptni pipe orqali bajarish, `rm -rf` yoki recursive permission o‘zgartirish noto‘g‘ri scope’da katta zarar yetkazadi. Har buyruqdan oldin target, shell expansion va rollbackni tekshiring. Terminal tarixiga token yoki parol yozmang.",
          "Shell преобразует команды в процессы, перенаправляет потоки stdout/stderr и связывает их через конвейер (pipeline). `/etc` хранит конфигурацию, `/var/log` — изменяемые логи, `/home` — данные пользователя, а `/proc` и `/sys` — виртуальные представления состояния ядра. Различайте относительный и абсолютный путь; символическая ссылка и точка монтирования могут скрывать настоящий диск.\n\nСначала выполняйте команды чтения, затем составляйте план изменений. Выполнение неизвестного скрипта через pipe с `sudo`, `rm -rf` или рекурсивное изменение прав доступа в неверной области может нанести серьёзный ущерб. Перед каждой командой проверяйте цель, раскрытие (expansion) shell и возможность rollback. Не записывайте токены или пароли в историю терминала.",
          "The shell turns commands into processes, redirects stdout/stderr streams, and links them through a pipeline. `/etc` holds configuration, `/var/log` holds mutable logs, `/home` holds user data, while `/proc` and `/sys` are virtual views of kernel state. Distinguish relative from absolute paths; a symbolic link or mount point can hide the real disk.\n\nRun read-only commands first, then build a change plan. Piping an unknown script through `sudo`, running `rm -rf`, or recursively changing permissions in the wrong scope can cause major damage. Before every command, check the target, shell expansion, and rollback option. Never write tokens or passwords into the terminal history."
        ),
        example: t(
          "pwd; id; find /var/log -maxdepth 1 -type f -printf '%f\\n' | sort\nSkript matnini avval ko‘rish: sed -n '1,160p' ./maintenance.sh",
          "pwd; id; find /var/log -maxdepth 1 -type f -printf '%f\\n' | sort\nСначала просмотрите текст скрипта: sed -n '1,160p' ./maintenance.sh",
          "pwd; id; find /var/log -maxdepth 1 -type f -printf '%f\\n' | sort\nReview the script text first: sed -n '1,160p' ./maintenance.sh"
        ),
        explanation: t(
          "Ko‘rsatilgan buyruqlar faqat yo‘l, identifikator va fayl nomlarini o‘qiydi. Log faylining o‘zi maxfiy ma’lumot saqlashi mumkin; ruxsatsiz katalogni ko‘rmang.",
          "Показанные команды только читают пути, идентификаторы и имена файлов. Сам лог-файл может содержать конфиденциальную информацию; не просматривайте каталог без разрешения.",
          "The commands shown only read paths, identifiers, and filenames. The log file itself may contain sensitive data; never browse an unauthorized directory."
        ),
        prompt: t("Linux’da joriy katalogning mutlaq yo‘lini ko‘rsatuvchi buyruq?", "Команда, показывающая абсолютный путь текущего каталога в Linux?", "The command that shows the absolute path of the current directory on Linux?"),
        answers: ["pwd"]
      },
      {
        title: t("2. Foydalanuvchi, guruh, sudo va ACL", "2. Пользователи, группы, sudo и ACL", "2. Users, groups, sudo, and ACLs"),
        content: t(
          "Har bir jarayon UID/GID va capability bilan ishlaydi; root barcha huquqlarni jamlagani uchun kundalik vazifani root sifatida bajarish xavfli. Fayl ruxsati egasi, guruh va boshqalarga read/write/execute beradi; directory’da execute katalog ichidan o‘tish huquqini bildiradi. ACL qo‘shimcha subjectlarga granular ruxsat beradi, ammo audit va troubleshootingni murakkablashtirishi mumkin.\n\nSudo siyosatini aniq buyruq va role bilan cheklang, umumiy admin akkauntdan qoching, privileged sessionlarni audit qiling. Umumiy hisob o‘rniga shaxsiy identity va vaqt bilan cheklangan elevation qo‘llang. `chmod 777` muammoni yashirishi mumkin, lekin maxfiylik va yaxlitlikni yo‘qotadi. Ruxsatni o‘zgartirishdan oldin owner, parent directory, service user va dastur talablarini aniqlang.",
          "Каждый процесс работает с UID/GID и capability; поскольку root объединяет все права, выполнение повседневных задач от имени root опасно. Права на файл дают read/write/execute владельцу, группе и остальным; execute на каталоге означает право входа внутрь каталога. ACL даёт дополнительным субъектам гранулярные права, но может усложнить аудит и диагностику.\n\nОграничивайте политику sudo конкретной командой и ролью, избегайте общего административного аккаунта, аудируйте привилегированные сессии. Вместо общей учётной записи применяйте персональную identity и ограниченное по времени повышение привилегий. `chmod 777` может скрыть проблему, но нарушает конфиденциальность и целостность. Перед изменением прав определите владельца, родительский каталог, служебного пользователя и требования приложения.",
          "Every process runs with a UID/GID and capabilities; because root combines all privileges, performing everyday tasks as root is risky. File permissions grant read/write/execute to the owner, group, and others; execute on a directory means the right to traverse into it. ACLs grant granular permissions to additional subjects but can complicate auditing and troubleshooting.\n\nRestrict sudo policy to specific commands and roles, avoid a shared admin account, and audit privileged sessions. Use personal identity and time-bound elevation instead of a shared account. `chmod 777` may mask a problem but destroys confidentiality and integrity. Before changing permissions, identify the owner, parent directory, service user, and application requirements."
        ),
        example: t(
          "id svc-report\nstat -c '%A %a %U:%G %n' /srv/report\ngetfacl /srv/report  # agar ACL vositasi o‘rnatilgan bo‘lsa",
          "id svc-report\nstat -c '%A %a %U:%G %n' /srv/report\ngetfacl /srv/report  # если установлен инструмент ACL",
          "id svc-report\nstat -c '%A %a %U:%G %n' /srv/report\ngetfacl /srv/report  # if the ACL tool is installed"
        ),
        explanation: t(
          "Buyruqlar metadata va ACL’ni ko‘rsatadi, o‘zgartirmaydi. Haqiqiy user/group nomlari va yo‘llarini ommaviy hisobotdan olib tashlang.",
          "Команды только показывают метаданные и ACL, не изменяя их. Удаляйте реальные имена пользователей/групп и пути из публичного отчёта.",
          "The commands only display metadata and ACLs; they don't change anything. Remove real user/group names and paths from a public report."
        ),
        prompt: t("Linux’da foydalanuvchi va uning guruh a’zoligini ko‘rsatuvchi buyruq?", "Команда, показывающая пользователя и его членство в группах в Linux?", "The command that shows a user and their group membership on Linux?"),
        answers: ["id"]
      },
      {
        title: t("3. systemd xizmatlari, jurnal va nosozlikni bartaraf etish", "3. Сервисы systemd, журналы и устранение неполадок", "3. systemd services, logging, and troubleshooting"),
        content: t(
          "systemd unit’lari service, socket, timer, mount va target kabi resurslarni ifodalaydi. `active` holati xizmat to‘g‘ri ishlayotganini kafolatlamaydi: health check, log, port, dependency va biznes so‘rovini ham tekshiring. Restart loop, noto‘g‘ri environment file, permission yoki disk to‘lishi ko‘p uchraydigan sabablar.\n\nJurnal yozuvlarini vaqt, unit va boot ID bilan filtrlab, hodisa oldi-keyinini solishtiring. Soat drift va timezone incident timeline’ni buzishi mumkin. Production restartni boshlashdan oldin ta’sir doirasi, active session, HA peer va rollbackni biling. O‘zgarishni change record bilan bog‘lang, sabab topilmaguncha takroriy restart orqali dalilni yo‘qotmang.",
          "Юниты systemd представляют такие ресурсы, как service, socket, timer, mount и target. Статус `active` не гарантирует, что сервис работает корректно: проверяйте также health check, логи, порт, зависимости и реальные бизнес-запросы. Частые причины — цикл перезапуска (restart loop), некорректный файл окружения, права доступа или переполнение диска.\n\nФильтруйте записи журнала по времени, юниту и boot ID, сравнивая состояние до и после события. Дрейф часов и часовой пояс могут исказить timeline инцидента. Перед перезапуском в продакшене оцените область влияния, активные сессии, HA-партнёров и возможность rollback. Связывайте изменение с записью об изменении (change record) и не теряйте доказательства через повторные перезапуски, пока причина не найдена.",
          "systemd units represent resources such as services, sockets, timers, mounts, and targets. An `active` status doesn't guarantee the service is working correctly: also check health checks, logs, ports, dependencies, and real business requests. Common causes include restart loops, an incorrect environment file, permissions, or disk exhaustion.\n\nFilter journal entries by time, unit, and boot ID to compare the state before and after an event. Clock drift and timezone issues can distort an incident timeline. Before restarting in production, know the blast radius, active sessions, HA peers, and rollback plan. Tie the change to a change record, and don't lose evidence through repeated restarts before the cause is found."
        ),
        example: t(
          "systemctl status app.service --no-pager\njournalctl -u app.service --since '2026-01-01 10:00' --until '2026-01-01 10:15'",
          "systemctl status app.service --no-pager\njournalctl -u app.service --since '2026-01-01 10:00' --until '2026-01-01 10:15'",
          "systemctl status app.service --no-pager\njournalctl -u app.service --since '2026-01-01 10:00' --until '2026-01-01 10:15'"
        ),
        explanation: t(
          "Bu diagnostika namunasi; vaqt oralig‘ini sintetik yoki ruxsatli labga moslang. Jurnalda token, IP va foydalanuvchi ma’lumoti bo‘lsa, eksportdan oldin niqoblang.",
          "Это пример диагностики; подбирайте временной диапазон под синтетическую или разрешённую лабораторную среду. Если в журнале есть токены, IP-адреса или данные пользователей, маскируйте их перед экспортом.",
          "This is a diagnostic example; match the time range to a synthetic or authorized lab environment. If the journal contains tokens, IP addresses, or user data, mask them before exporting."
        ),
        prompt: t("systemd xizmatining unit jurnalini o‘qishga mo‘ljallangan buyruq?", "Команда, предназначенная для чтения журнала юнита systemd-сервиса?", "The command intended for reading a systemd service unit's journal?"),
        answers: ["journalctl"]
      },
      {
        title: t("4. Disk, filesystem, mount va zaxira nusxa", "4. Диск, файловая система, монтирование и резервное копирование", "4. Disk, filesystem, mounts, and backups"),
        content: t(
          "Storage incidentida filesystem to‘lishi, inode tugashi, blok qurilmasi xatosi, read-only mount va application log o‘sishini farqlang. `df` blok/inode ishlatilishini, `du` katalog hajmini, `lsblk` blok qurilma topologiyasini ko‘rsatadi. LVM hajmni moslashuvchan boshqaradi, lekin snapshot backup o‘rnini bosmaydi.\n\nBackup siyosati RPO — qabul qilinadigan ma’lumot yo‘qotish oynasi — va RTO — tiklash maqsad vaqti — bilan belgilanadi. Shifrlangan nusxada kalitni alohida, nazoratli saqlang; immutable/offline nusxa ransomware xavfini kamaytiradi. Backup muvaffaqiyatli tugashi restore ishlashini isbotlamaydi: muntazam restore drill va checksum tekshiruvi kerak.",
          "При инциденте с хранилищем различайте переполнение файловой системы, исчерпание inode, ошибку блочного устройства, монтирование в режиме read-only и рост логов приложения. `df` показывает использование блоков/inode, `du` — размер каталога, `lsblk` — топологию блочных устройств. LVM гибко управляет объёмом, но снапшот не заменяет резервное копирование.\n\nПолитика резервного копирования определяется RPO — допустимым окном потери данных — и RTO — целевым временем восстановления. Храните ключ шифрованной копии отдельно и под контролем; неизменяемая (immutable) или offline-копия снижает риск ransomware. Успешное завершение резервного копирования не доказывает работоспособность восстановления: нужны регулярные учения по восстановлению (restore drill) и проверка контрольных сумм.",
          "During a storage incident, distinguish between a full filesystem, inode exhaustion, a block device error, a read-only mount, and application log growth. `df` shows block/inode usage, `du` shows directory size, and `lsblk` shows block device topology. LVM manages volumes flexibly, but a snapshot does not replace a backup.\n\nBackup policy is defined by RPO — the acceptable data-loss window — and RTO — the target recovery time. Keep an encrypted copy's key separate and controlled; an immutable/offline copy reduces ransomware risk. A backup completing successfully doesn't prove restore works: regular restore drills and checksum verification are needed."
        ),
        example: t(
          "df -hT; df -i\nlsblk -f\nfind /var/log -xdev -type f -size +100M -printf '%s %p\\n' 2>/dev/null",
          "df -hT; df -i\nlsblk -f\nfind /var/log -xdev -type f -size +100M -printf '%s %p\\n' 2>/dev/null",
          "df -hT; df -i\nlsblk -f\nfind /var/log -xdev -type f -size +100M -printf '%s %p\\n' 2>/dev/null"
        ),
        explanation: t(
          "Misollar disk holatini o‘qiydi. `find` natijasi maxfiy yo‘l nomlarini chiqarishi mumkin; begona tizimlarda ishga tushirmang.",
          "Примеры только считывают состояние диска. Результат `find` может раскрыть конфиденциальные имена путей; не запускайте их на чужих системах.",
          "The examples only read disk state. The `find` output may reveal sensitive path names; don't run it on systems you don't own."
        ),
        prompt: t("Backup’dan tiklash uchun maqsadli maksimal vaqt qisqartmasi?", "Аббревиатура целевого максимального времени восстановления из резервной копии?", "The abbreviation for the target maximum time to restore from a backup?"),
        answers: ["rto"]
      },
      {
        title: t("5. Tarmoq, DNS, vaqt va host firewall", "5. Сеть, DNS, время и firewall хоста", "5. Networking, DNS, time, and host firewall"),
        content: t(
          "Server tarmog‘ini tekshirishda link, IP/prefix, default route, DNS, NTP, socket va ilova health check’ini qatlamma-qatlam solishtiring. DNS cache, split-horizon zone, resolver timeout va stale record noto‘g‘ri manzilga olib kelishi mumkin. TLS sertifikati, hostname, chain va vaqt birga tekshiriladi; soat noto‘g‘ri bo‘lsa sertifikat yoki Kerberos autentifikatsiyasi buzilishi mumkin.\n\nHost firewall siyosatini tarmoq firewall bilan birga ko‘ring. Default deny va minimal inbound/outbound ruxsat yaxshi boshlang‘ich nuqta, lekin SSH orqali o‘zingizni bloklamaslik uchun change window, console access, qoidalar review’i va rollback tayyor bo‘lsin. Listener’ni `ss` bilan aniqlang; zarur bo‘lmagan portni ochiq qoldirmang.",
          "При проверке сети сервера сравнивайте по уровням: link, IP/prefix, default route, DNS, NTP, сокеты и health check приложения. Кеш DNS, split-horizon-зона, таймаут резолвера и устаревшая запись могут привести к неверному адресу. Сертификат TLS, hostname, цепочка и время проверяются совместно; при неверных часах аутентификация по сертификату или Kerberos может нарушиться.\n\nРассматривайте политику firewall хоста вместе с сетевым firewall. Default deny и минимальные inbound/outbound разрешения — хорошая отправная точка, но чтобы не заблокировать себя через SSH, подготовьте окно изменений, доступ к консоли, ревью правил и rollback. Определяйте слушающие сокеты через `ss`; не оставляйте ненужные порты открытыми.",
          "When checking a server's network, compare layer by layer: link, IP/prefix, default route, DNS, NTP, sockets, and the application health check. DNS cache, split-horizon zones, resolver timeouts, and stale records can lead to the wrong address. TLS certificate, hostname, chain, and time are checked together; if the clock is wrong, certificate or Kerberos authentication can break.\n\nConsider host firewall policy alongside the network firewall. Default deny and minimal inbound/outbound rules are a good starting point, but to avoid locking yourself out over SSH, have a change window, console access, rule review, and rollback ready. Identify listeners with `ss`; don't leave unnecessary ports open."
        ),
        example: t(
          "ip addr; ip route; resolvectl status\nss -lntup\ngetent hosts service.example.test",
          "ip addr; ip route; resolvectl status\nss -lntup\ngetent hosts service.example.test",
          "ip addr; ip route; resolvectl status\nss -lntup\ngetent hosts service.example.test"
        ),
        explanation: t(
          "`.test` misol domeni laboratoriya uchun. `ss -p` process nomini ko‘rsatishi mumkin; ruxsatli hostdan tashqarida jarayon ma’lumotini yig‘mang.",
          "Домен `.test` в примере предназначен для лаборатории. `ss -p` может показывать имя процесса; не собирайте информацию о процессах за пределами разрешённого хоста.",
          "The `.test` domain in the example is for the lab. `ss -p` may show a process name; don't gather process information outside an authorized host."
        ),
        prompt: t("Linux’da TCP/UDP tinglovchi socketlarni ko‘rish uchun keng qo‘llanadigan vosita?", "Широко используемый инструмент для просмотра слушающих TCP/UDP сокетов в Linux?", "The widely used tool to view listening TCP/UDP sockets on Linux?"),
        answers: ["ss"]
      },
      {
        title: t("6. Patch, SSH, audit va MAC policy", "6. Патчи, SSH, аудит и политика MAC", "6. Patching, SSH, auditing, and MAC policy"),
        content: t(
          "Hardening aktiv xizmatlarni inventarizatsiya qilish, xavfsizlik yangilanishi, SSH siyosati, log/audit va SELinux/AppArmor kabi mandatory access control’ni qamrab oladi. `PasswordAuthentication no` ni joriy qilishdan oldin kalitli kirish, break-glass akkaunt, console recovery va ikkinchi administrator sessiyasini tekshiring. SSH konfiguratsiyasi distro va include fayllariga qarab farqlanishi mumkin.\n\nPatchni xavfga qarab ustuvorlang: internetga ochiqlik, ekspluatatsiya dalili, aktiv qiymati, ta’sir, vendor mitigation va downtime oynasi. Versiya satri yakka o‘zi zaiflikni tasdiqlamaydi; backport va paket buildini tekshiring. Audit loglarida sinxron vaqt, retention va integrity nazorati bo‘lsin. Qoidabuzarliklarni hujjatlashtirib, tasdiqlangan exception va tugash sanasini belgilang.",
          "Hardening охватывает инвентаризацию активных сервисов, обновления безопасности, политику SSH, лог/аудит и mandatory access control, такой как SELinux/AppArmor. Перед включением `PasswordAuthentication no` проверьте вход по ключу, аварийную (break-glass) учётную запись, восстановление через консоль и сессию второго администратора. Конфигурация SSH может отличаться в зависимости от дистрибутива и включённых файлов.\n\nПриоритизируйте патчи по риску: доступность из интернета, доказательства эксплуатации, ценность актива, воздействие, меры вендора и окно простоя. Одна лишь строка версии не подтверждает уязвимость; проверяйте backport и сборку пакета. В логах аудита должны быть синхронное время, retention и контроль целостности. Документируйте исключения из политики с утверждённым обоснованием и сроком действия.",
          "Hardening covers inventorying active services, security updates, SSH policy, logging/audit, and mandatory access control such as SELinux/AppArmor. Before enabling `PasswordAuthentication no`, verify key-based login, a break-glass account, console recovery, and a second administrator session. SSH configuration can vary by distro and included files.\n\nPrioritize patches by risk: internet exposure, evidence of exploitation, asset value, impact, vendor mitigation, and the downtime window. A version string alone doesn't confirm a vulnerability; check backports and the package build. Audit logs should have synchronized time, retention, and integrity controls. Document policy exceptions with an approved justification and expiry date."
        ),
        example: t(
          "sshd -T | grep -E 'passwordauthentication|permitrootlogin'\nsestatus 2>/dev/null || aa-status 2>/dev/null\nsystemctl list-unit-files --state=enabled",
          "sshd -T | grep -E 'passwordauthentication|permitrootlogin'\nsestatus 2>/dev/null || aa-status 2>/dev/null\nsystemctl list-unit-files --state=enabled",
          "sshd -T | grep -E 'passwordauthentication|permitrootlogin'\nsestatus 2>/dev/null || aa-status 2>/dev/null\nsystemctl list-unit-files --state=enabled"
        ),
        explanation: t(
          "Buyruqlar effective sozlamalar va yoqilgan unit’larni tekshiradi; distroga qarab natija farq qiladi. Ishlab chiqarish konfiguratsiyasini auditdan keyin faqat tasdiqlangan change orqali o‘zgartiring.",
          "Команды проверяют эффективные настройки и включённые юниты; результат отличается в зависимости от дистрибутива. Изменяйте продакшен-конфигурацию только через утверждённый change после аудита.",
          "The commands check effective settings and enabled units; results vary by distro. Change production configuration only through an approved change after an audit."
        ),
        prompt: t("Linux’da SELinux holatini ko‘rsatadigan keng tarqalgan buyruq?", "Распространённая команда, показывающая состояние SELinux в Linux?", "The common command that shows SELinux status on Linux?"),
        answers: ["sestatus"]
      },
      {
        title: t("7. Bash/Ansible avtomatlashtirish va o‘zgarish nazorati", "7. Автоматизация Bash/Ansible и контроль изменений", "7. Bash/Ansible automation and change control"),
        content: t(
          "Shell skript input, exit code, signal, quoting, locale va error handling’ni hisobga olishi kerak. `set -e` barcha edge case’ni hal qilmaydi; kritik buyruqlarni tekshirib, xato holatini aniq qaytaring. Idempotent automation bir xil holatni qayta qo‘llaganda kutilmagan qo‘shimcha o‘zgarish qilmaydi.\n\nAnsible kabi configuration management inventar, role, variable va handler yordamida desired state’ni boshqaradi. Secret’ni plain text inventory yoki CI logiga qo‘ymang; vault/secret store ishlating. Diff, check mode, peer review va staging’dan boshlang. Playbook o‘zgarishi reboot, paket versiyasi va servis uzilishiga olib kelishi mumkin; rollout batch, health gate va rollback yo‘lini rejalang.",
          "Shell-скрипт должен учитывать ввод, код выхода, сигналы, экранирование (quoting), locale и обработку ошибок. `set -e` не решает все edge case; проверяйте критичные команды и явно возвращайте статус ошибки. Идемпотентная автоматизация при повторном применении к одинаковому состоянию не вносит неожиданных дополнительных изменений.\n\nСредства управления конфигурацией, такие как Ansible, управляют desired state через inventory, роли, переменные и handler'ы. Не помещайте секреты в инвентарь в открытом виде или в лог CI; используйте vault/secret store. Начинайте с diff, check mode, peer review и staging. Изменение playbook может повлечь перезагрузку, смену версии пакета и прерывание сервиса; планируйте выкатку батчами, health gate и путь rollback.",
          "A shell script must account for input, exit codes, signals, quoting, locale, and error handling. `set -e` doesn't resolve every edge case; check critical commands and explicitly return an error status. Idempotent automation doesn't make unexpected additional changes when reapplied to the same state.\n\nConfiguration management tools such as Ansible manage desired state through inventory, roles, variables, and handlers. Don't put secrets in plain-text inventory or CI logs; use a vault/secret store. Start with diff, check mode, peer review, and staging. A playbook change can trigger a reboot, package version change, or service disruption; plan a staged rollout, health gates, and a rollback path."
        ),
        example: t(
          "bash -n ./check.sh       # sintaksis tekshiruvi\nshellcheck ./check.sh  # mavjud bo‘lsa\nansible-playbook --syntax-check site.yml",
          "bash -n ./check.sh       # проверка синтаксиса\nshellcheck ./check.sh  # если доступен\nansible-playbook --syntax-check site.yml",
          "bash -n ./check.sh       # syntax check\nshellcheck ./check.sh  # if available\nansible-playbook --syntax-check site.yml"
        ),
        explanation: t(
          "Tekshiruvlar skriptni bajarmaydi. Ansible syntax-check o‘zgarishlarni qo‘llamaydi; haqiqiy playbookni faqat tasdiqlangan, izolyatsiyalangan inventory’da sinang.",
          "Проверки не выполняют скрипт. Ansible syntax-check не применяет изменения; реальный playbook тестируйте только на утверждённом, изолированном inventory.",
          "The checks don't execute the script. Ansible syntax-check doesn't apply changes; test a real playbook only against an approved, isolated inventory."
        ),
        prompt: t("Bir xil automation’ni qayta ishlatganda istalmagan yangi o‘zgarish yaratmaslik xususiyati?", "Свойство, не создающее нежелательных новых изменений при повторном применении одной и той же автоматизации?", "The property of not creating unwanted new changes when the same automation is reapplied?"),
        answers: ["idempotency", "idempotentlik", "idempotent"]
      },
      {
        title: t("8. Ishlab chiqarish hodisasi, postmortem va senior amaliyot", "8. Производственный инцидент, postmortem и senior-практика", "8. Production incidents, postmortems, and senior practice"),
        content: t(
          "Incident commander ta’sirni cheklash, xavfsiz tiklash, dalil saqlash va manfaatdor tomonlarga aniq xabar berishni muvofiqlashtiradi. Avval symptom va scope, keyin ehtimoliy sabab va tekshiruvni yozing; sababni taxmin sifatida belgilang. Log, metric, trace, deploy tarixi, dependency va tashqi provayder holatini bitta timeline’da bog‘lang.\n\nBlameless postmortem tizim sabablarini ochadi: alert yo‘qligi, runbook eskirishi, dependency single point, ownership noaniqligi yoki change failure. Har action uchun owner, muddat va tekshiriladigan natija belgilang. Senior administrator capacity, patch, backup restore, disaster recovery, access review va o‘zgarish tezligi o‘rtasida muvozanat saqlaydi; operatsiya xavfsizligi texnik chora bilan birga jamoa jarayonidir.",
          "Incident commander координирует ограничение воздействия, безопасное восстановление, сохранение доказательств и чёткое информирование заинтересованных сторон. Сначала фиксируйте симптом и область, затем вероятную причину и проверку; обозначайте причину как гипотезу. Связывайте логи, метрики, трассировки, историю деплоев, зависимости и статус внешних провайдеров в единой timeline.\n\nБезвинный (blameless) postmortem раскрывает системные причины: отсутствие алерта, устаревший runbook, единую точку отказа зависимости, неясность ответственности или сбой изменения. Для каждого действия назначайте владельца, срок и проверяемый результат. Senior-администратор балансирует между capacity, патчами, восстановлением из резервных копий, disaster recovery, ревью доступа и темпом изменений; безопасность операций — это командный процесс наряду с техническими мерами.",
          "An incident commander coordinates limiting impact, safe recovery, preserving evidence, and clearly communicating with stakeholders. First record the symptom and scope, then the probable cause and verification; label the cause as a hypothesis. Tie logs, metrics, traces, deploy history, dependencies, and external provider status into a single timeline.\n\nA blameless postmortem reveals systemic causes: a missing alert, an outdated runbook, a dependency single point of failure, unclear ownership, or a change failure. Assign an owner, deadline, and verifiable outcome to each action. A senior administrator balances capacity, patching, backup restore, disaster recovery, access review, and change velocity; operational safety is a team process alongside technical measures."
        ),
        example: t(
          "Incident note: UTC vaqt / foydalanuvchi ta’siri / dalillar / taxminlar / containment / tiklash / keyingi ownerli vazifalar.",
          "Заметка об инциденте: время UTC / влияние на пользователей / доказательства / гипотезы / containment / восстановление / дальнейшие задачи с владельцем.",
          "Incident note: UTC time / user impact / evidence / hypotheses / containment / recovery / follow-up tasks with an owner."
        ),
        explanation: t(
          "Har doim vaqt zonasini ko‘rsating, maxfiy logni minimallashtiring va xulosani fakt bilan ajrating. Hujjatni tashkilotning incident siyosati bo‘yicha saqlang.",
          "Всегда указывайте часовой пояс, минимизируйте конфиденциальные логи и отделяйте выводы от фактов. Храните документ согласно политике инцидентов организации.",
          "Always state the time zone, minimize sensitive logs, and separate conclusions from facts. Store the document according to the organization's incident policy."
        ),
        prompt: t("Aybdor izlashga emas, tizim sabablarini yaxshilashga qaratilgan postmortem turi?", "Тип postmortem, направленный не на поиск виновного, а на улучшение системных причин?", "The type of postmortem focused on improving systemic causes rather than finding someone to blame?"),
        answers: ["blameless", "blameless postmortem", "ayblovsiz"]
      }
    ]
  }),
  book({
    slug: "windows-active-directory-operations",
    title: t("Windows Server, Active Directory va korporativ identifikatsiya", "Windows Server, Active Directory и корпоративная идентификация", "Windows Server, Active Directory, and enterprise identity"),
    summary: t(
      "Windows infratuzilmasini qo‘llash, AD DS, DNS, Group Policy, PowerShell audit, backup va identifikatsiya hodisalarini bosqichma-bosqich o‘rganish.",
      "Пошаговое изучение администрирования Windows-инфраструктуры, AD DS, DNS, Group Policy, аудита PowerShell, резервного копирования и инцидентов идентификации.",
      "A step-by-step look at administering Windows infrastructure, AD DS, DNS, Group Policy, PowerShell auditing, backups, and identity incidents."
    ),
    category: "systems", difficulty: "medium", hours: 34,
    labPlan: t(
      "Faqat sintetik Event ID va konfiguratsiyalardan foydalangan holda 8 ta Windows/AD troubleshooting va xavfsiz baseline mashqi.",
      "8 упражнений по диагностике Windows/AD и безопасному базовому профилю с использованием только синтетических Event ID и конфигураций.",
      "8 exercises on Windows/AD troubleshooting and a safe security baseline, using only synthetic Event IDs and configurations."
    ),
    references: [
      reference(t("Microsoft Learn — Active Directory Domain Services overview", "Microsoft Learn — обзор Active Directory Domain Services", "Microsoft Learn — Active Directory Domain Services overview"), "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview"),
      reference(t("Microsoft Learn — Group Policy overview", "Microsoft Learn — обзор Group Policy", "Microsoft Learn — Group Policy overview"), "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-overview"),
      reference(t("Microsoft Learn — Windows PowerShell documentation", "Microsoft Learn — документация Windows PowerShell", "Microsoft Learn — Windows PowerShell documentation"), "https://learn.microsoft.com/en-us/powershell/")
    ],
    chapters: [
      {
        title: t("1. Windows Server rollari va boshqaruv chegaralari", "1. Роли Windows Server и границы управления", "1. Windows Server roles and administrative boundaries"),
        content: t(
          "Windows Server’da role/feature, service, registry, NTFS, Event Log va PowerShell boshqaruvning asosiy qismlari hisoblanadi. Server Core kichik hujum sirtini va kamroq patch talabini beradi, ammo masofaviy boshqaruv va avariya konsoli oldindan rejalashtirilishi kerak. Domain controller, file server va application server rollarini imkon qadar ajratish blast radiusni kamaytiradi.\n\nAdministrator o‘zgarishdan oldin host nomi, OS build, server role, owner, backup, monitoring va change window’ni aniqlaydi. Server Manager yoki PowerShell’dagi yuqori huquqli amallarni qaytarish yo‘li bilan sinang. Har bir service accountning vazifasi va huquqi hujjatlashtirilsin; interaktiv login kerak bo‘lmagan hisobga unga ruxsat bermang.",
          "В Windows Server роли/компоненты (role/feature), службы, реестр, NTFS, журнал событий и PowerShell являются основными элементами управления. Server Core даёт меньшую поверхность атаки и меньше требований к патчам, но удалённое управление и аварийную консоль нужно спланировать заранее. Разделение ролей контроллера домена, файлового сервера и сервера приложений, где возможно, снижает blast radius.\n\nПеред изменением администратор определяет имя хоста, сборку ОС, роль сервера, владельца, резервное копирование, мониторинг и окно изменений. Тестируйте высокопривилегированные операции в Server Manager или PowerShell с возможностью отката. Назначение и права каждой служебной учётной записи должны быть задокументированы; не давайте интерактивный вход учётной записи, которой он не нужен.",
          "In Windows Server, roles/features, services, the registry, NTFS, the Event Log, and PowerShell are core management elements. Server Core gives a smaller attack surface and fewer patching requirements, but remote management and emergency console access must be planned in advance. Separating domain controller, file server, and application server roles where possible reduces the blast radius.\n\nBefore a change, an administrator identifies the hostname, OS build, server role, owner, backup, monitoring, and change window. Test high-privilege operations in Server Manager or PowerShell with a way to revert them. Every service account's purpose and rights should be documented; don't grant interactive login to an account that doesn't need it."
        ),
        example: t(
          "Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber\nGet-WindowsFeature | Where-Object Installed",
          "Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber\nGet-WindowsFeature | Where-Object Installed",
          "Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber\nGet-WindowsFeature | Where-Object Installed"
        ),
        explanation: t(
          "Misollar inventarizatsiya uchun. Server nomi, role va build ichki aktiv haqida ma’lumot; ruxsatsiz tashqi ulashishdan saqlaning.",
          "Примеры предназначены для инвентаризации. Имя сервера, роль и сборка — это информация о внутреннем активе; избегайте несанкционированного распространения вовне.",
          "The examples are for inventory purposes. Server name, role, and build are internal asset information; avoid unauthorized external sharing."
        ),
        prompt: t("Windows Server’da o‘rnatilgan role/feature holatini ko‘rish uchun PowerShell cmdlet?", "Командлет PowerShell для просмотра состояния установленных ролей/компонентов в Windows Server?", "The PowerShell cmdlet to view the status of installed roles/features in Windows Server?"),
        answers: ["get-windowsfeature"]
      },
      {
        title: t("2. AD DS, forest/domain, OU, DNS va replikatsiya", "2. AD DS, лес/домен, OU, DNS и репликация", "2. AD DS, forest/domain, OUs, DNS, and replication"),
        content: t(
          "Active Directory DS obyektlar, identity va policy’larni forest/domain ichida markaziy boshqaradi. Domain controller autentifikatsiya va katalog xizmatini beradi; DNS SRV yozuvlari clientga xizmatni topishga yordam beradi. OU delegatsiya va GPO scope uchun ishlatiladi, lekin xavfsizlik chegarasi sifatida domain/forest bilan teng emas.\n\nMulti-site muhitda replication latency, site/subnet mapping, time synchronization, DNS health va FSMO role egalarini kuzating. Bir DC’dagi muvaffaqiyat boshqa DC yoki client logon ishlashini isbotlamaydi. Diagnostikani kichik scope’da bajaring; replikatsiyani majburlash yoki metadata cleanup kabi o‘zgarishlar avval directory backup va tasdiqlangan runbook talab qiladi.",
          "Active Directory DS централизованно управляет объектами, identity и политиками внутри леса/домена. Контроллер домена предоставляет службу аутентификации и каталога; записи DNS SRV помогают клиенту находить службу. OU используется для делегирования и области действия GPO, но не эквивалентен домену/лесу как границе безопасности.\n\nВ multi-site среде отслеживайте задержку репликации, сопоставление site/subnet, синхронизацию времени, состояние DNS и владельцев ролей FSMO. Успех на одном DC не доказывает работоспособность другого DC или входа клиента. Проводите диагностику в ограниченной области; такие изменения, как принудительная репликация или очистка метаданных, требуют предварительного резервного копирования каталога и утверждённого runbook.",
          "Active Directory DS centrally manages objects, identity, and policy within a forest/domain. A domain controller provides authentication and directory services; DNS SRV records help clients locate the service. An OU is used for delegation and GPO scope, but is not equivalent to a domain/forest as a security boundary.\n\nIn a multi-site environment, monitor replication latency, site/subnet mapping, time synchronization, DNS health, and FSMO role holders. Success on one DC doesn't prove another DC or client logon works. Perform diagnostics within a limited scope; changes such as forcing replication or metadata cleanup require a prior directory backup and an approved runbook."
        ),
        example: t(
          "Get-ADDomain\nGet-ADReplicationPartnerMetadata -Target dc-lab.example.test -Scope Server\nnslookup -type=SRV _ldap._tcp.dc._msdcs.example.test",
          "Get-ADDomain\nGet-ADReplicationPartnerMetadata -Target dc-lab.example.test -Scope Server\nnslookup -type=SRV _ldap._tcp.dc._msdcs.example.test",
          "Get-ADDomain\nGet-ADReplicationPartnerMetadata -Target dc-lab.example.test -Scope Server\nnslookup -type=SRV _ldap._tcp.dc._msdcs.example.test"
        ),
        explanation: t(
          "Cmdletlar ActiveDirectory moduli va tegishli huquq talab qiladi. `example.test` sintetik nom; haqiqiy directory ichki tuzilishini oshkor qilmang.",
          "Командлеты требуют модуль ActiveDirectory и соответствующие права. `example.test` — синтетическое имя; не раскрывайте внутреннюю структуру реального каталога.",
          "The cmdlets require the ActiveDirectory module and corresponding rights. `example.test` is a synthetic name; don't disclose a real directory's internal structure."
        ),
        prompt: t("AD domain controller va xizmatlarini topishda muhim bo‘lgan DNS record turi?", "Тип записи DNS, важный для обнаружения контроллера домена AD и его служб?", "The DNS record type important for locating an AD domain controller and its services?"),
        answers: ["srv", "srv record"]
      },
      {
        title: t("3. Group Policy, privilege va tiered administration", "3. Group Policy, привилегии и многоуровневое администрирование", "3. Group Policy, privilege, and tiered administration"),
        content: t(
          "Group Policy computer/user configuration’ni scope, inheritance, link order, security filtering va WMI filter orqali qo‘llaydi. GPO natijasini tushunishda local, site, domain va OU qatlamlarini ko‘rib chiqing; `gpresult` natijasi clientda haqiqatan qo‘llangan siyosatni ko‘rsatadi. Keraksiz GPO link yoki broad delegation privilege escalation va noto‘g‘ri konfiguratsiya xavfini keltiradi.\n\nDomain admin huquqini kundalik ish uchun ishlatmang. Tiered administration, alohida admin identity, privileged workstation, MFA va vaqt bilan cheklangan elevation qo‘llang. GPO o‘zgarishini backup, review, test OU, pilot va rollback bilan joriy eting. Baseline hardening business application compatibility va recovery talabi bilan muvoوازن bo‘lishi kerak.",
          "Group Policy применяет конфигурацию computer/user через scope, наследование, порядок связывания (link order), фильтрацию безопасности и WMI-фильтры. Чтобы понять итоговый результат GPO, рассматривайте уровни local, site, domain и OU; результат `gpresult` показывает политику, реально применённую на клиенте. Лишняя связь GPO или слишком широкое делегирование создают риск повышения привилегий и неверной конфигурации.\n\nНе используйте права Domain Admin для повседневной работы. Применяйте многоуровневое администрирование (tiered administration), отдельную admin identity, привилегированную рабочую станцию, MFA и ограниченное по времени повышение привилегий. Внедряйте изменения GPO через резервное копирование, ревью, тестовый OU, пилот и rollback. Базовое ужесточение (baseline hardening) должно быть сбалансировано с совместимостью бизнес-приложений и требованиями восстановления.",
          "Group Policy applies computer/user configuration through scope, inheritance, link order, security filtering, and WMI filters. To understand the resulting GPO, consider the local, site, domain, and OU layers; `gpresult` output shows the policy actually applied on the client. An unnecessary GPO link or overly broad delegation creates a risk of privilege escalation and misconfiguration.\n\nDon't use Domain Admin rights for everyday work. Apply tiered administration, a separate admin identity, a privileged workstation, MFA, and time-bound elevation. Roll out GPO changes with backup, review, a test OU, a pilot, and rollback. Baseline hardening must be balanced against business application compatibility and recovery requirements."
        ),
        example: t(
          "gpresult /scope computer /r\nGet-GPO -All | Select-Object DisplayName, GpoStatus, Id",
          "gpresult /scope computer /r\nGet-GPO -All | Select-Object DisplayName, GpoStatus, Id",
          "gpresult /scope computer /r\nGet-GPO -All | Select-Object DisplayName, GpoStatus, Id"
        ),
        explanation: t(
          "Birinchi buyruq faqat joriy qurilma scope’ini o‘qiydi, ikkinchisi GroupPolicy modulini talab qiladi. Natijada user va OU nomlari chiqishi mumkin.",
          "Первая команда считывает только область текущего устройства, вторая требует модуль GroupPolicy. В результате могут отображаться имена пользователей и OU.",
          "The first command only reads the current device's scope, the second requires the GroupPolicy module. The output may show user and OU names."
        ),
        prompt: t("Clientda qo‘llangan Group Policy natijasini ko‘rsatadigan buyruq?", "Команда, показывающая результирующую Group Policy, применённую на клиенте?", "The command that shows the resulting Group Policy applied on a client?"),
        answers: ["gpresult"]
      },
      {
        title: t("4. PowerShell: xavfsiz audit va takrorlanuvchi boshqaruv", "4. PowerShell: безопасный аудит и воспроизводимое управление", "4. PowerShell: safe auditing and repeatable management"),
        content: t(
          "PowerShell object pipeline bilan ishlaydi; matnni grep qilish o‘rniga property va type’lardan foydalanish parsing xatosini kamaytiradi. Scriptda parameter validation, least privilege, error handling, transcript/log sanitization va idempotency kerak. `-WhatIf` qo‘llab-quvvatlanadigan cmdletlarda o‘zgarishdan oldin ta’sirni ko‘rsatadi, lekin barcha cmdletlar WhatIf’ni to‘liq qo‘llamasligi mumkin.\n\nRemote session uchun Kerberos/WinRM/HTTPS va JEA kabi delegated endpoint’larni siyosatga mos sozlang. Credential’ni skriptga yozmang; SecretManagement yoki tasdiqlangan vault ishlating. Execution policy malware himoyasining to‘liq chegarasi emas. Script signing, code review, constrained privilege, logging va endpoint detection qatlamlarini birga ko‘ring.",
          "PowerShell работает через object pipeline; использование свойств (property) и типов вместо grep по тексту снижает ошибки парсинга. Скрипту нужны валидация параметров, принцип наименьших привилегий, обработка ошибок, санитизация transcript/лога и идемпотентность. `-WhatIf` в поддерживающих его командлетах показывает эффект до изменения, но не все командлеты полностью его реализуют.\n\nДля удалённой сессии настройте Kerberos/WinRM/HTTPS и делегированные конечные точки, такие как JEA, в соответствии с политикой. Не записывайте учётные данные в скрипт; используйте SecretManagement или утверждённое хранилище (vault). Политика выполнения (execution policy) не является полной защитой от вредоносного ПО. Рассматривайте подписание скриптов, код-ревью, ограниченные привилегии, логирование и обнаружение на конечных точках как совместные уровни защиты.",
          "PowerShell operates via an object pipeline; using properties and types instead of grepping text reduces parsing errors. A script needs parameter validation, least privilege, error handling, transcript/log sanitization, and idempotency. `-WhatIf`, where a cmdlet supports it, shows the effect before a change, but not every cmdlet fully implements WhatIf.\n\nFor a remote session, configure Kerberos/WinRM/HTTPS and delegated endpoints such as JEA according to policy. Don't write credentials into a script; use SecretManagement or an approved vault. Execution policy is not a complete defense against malware. Consider script signing, code review, constrained privilege, logging, and endpoint detection as combined layers."
        ),
        example: t(
          "Get-Service | Where-Object Status -eq 'Stopped' | Select-Object Name, StartType\nGet-WinEvent -FilterHashtable @{LogName='System'; Id=7045} -MaxEvents 20",
          "Get-Service | Where-Object Status -eq 'Stopped' | Select-Object Name, StartType\nGet-WinEvent -FilterHashtable @{LogName='System'; Id=7045} -MaxEvents 20",
          "Get-Service | Where-Object Status -eq 'Stopped' | Select-Object Name, StartType\nGet-WinEvent -FilterHashtable @{LogName='System'; Id=7045} -MaxEvents 20"
        ),
        explanation: t(
          "Misollar faqat o‘qish uchun va qayd etilgan servis hodisalarini tekshiradi. `7045` o‘zi zararli xizmatni isbotlamaydi; owner, change record va boshqa dalil bilan tasdiqlang.",
          "Примеры предназначены только для чтения и проверяют зарегистрированные события служб. Само по себе `7045` не доказывает вредоносную службу; подтверждайте владельцем, записью об изменении и другими доказательствами.",
          "The examples are read-only and check logged service events. `7045` alone doesn't prove a malicious service; confirm with the owner, a change record, and other evidence."
        ),
        prompt: t("PowerShell pipeline’da obyektlarni shart bo‘yicha tanlash cmdlet’i?", "Командлет для выбора объектов по условию в конвейере PowerShell?", "The cmdlet for selecting objects by condition in a PowerShell pipeline?"),
        answers: ["where-object", "where"]
      },
      {
        title: t("5. Windows autentifikatsiyasi va audit loglari", "5. Аутентификация Windows и журналы аудита", "5. Windows authentication and audit logs"),
        content: t(
          "Windows kirish hodisalarini 4624 (muvaffaqiyatli logon), 4625 (muvaffaqiyatsiz logon), 4672 (maxsus privilege tayinlanishi) kabi eventlar bilan qayd etishi mumkin; auditing policy va log source’ni tekshiring. Logon Type interaktiv, network yoki xizmat kontekstini farqlashga yordam beradi. Event ID’ni alohida talqin qilish yetarli emas: account, source, host, timestamp, status/substatus va normal ish naqshini bog‘lang.\n\nKerberos ticketing, SPN, time sync va DNS muammolari autentifikatsiya xatosini keltirib chiqaradi. NTLM’ni cheklashdan oldin legacy dependency inventarizatsiya va pilot kerak. Password spray, impossible travel yoki privilege change signalini threshold va biznes kontekst bilan baholang; foydalanuvchiga ortiqcha ma’lumot bermasdan xavfsiz escalation qiling.",
          "Windows может регистрировать события входа такими событиями, как 4624 (успешный вход), 4625 (неудачный вход), 4672 (назначение специальных привилегий); проверьте политику аудита и источник логов. Logon Type помогает различать интерактивный, сетевой или служебный контекст. Интерпретации одного Event ID недостаточно: связывайте учётную запись, источник, хост, временную метку, status/substatus и нормальный паттерн работы.\n\nПроблемы с тикетами Kerberos, SPN, синхронизацией времени и DNS вызывают ошибки аутентификации. Перед ограничением NTLM нужны инвентаризация устаревших зависимостей и пилотный запуск. Оценивайте сигналы password spray, impossible travel или изменения привилегий с учётом порога (threshold) и бизнес-контекста; выполняйте безопасную эскалацию, не раскрывая пользователю лишней информации.",
          "Windows can log sign-in events such as 4624 (successful logon), 4625 (failed logon), and 4672 (special privileges assigned); check the auditing policy and log source. Logon Type helps distinguish interactive, network, or service context. Interpreting an Event ID alone isn't enough: correlate the account, source, host, timestamp, status/substatus, and normal work pattern.\n\nKerberos ticketing, SPN, time sync, and DNS issues cause authentication errors. Restricting NTLM first requires a legacy-dependency inventory and a pilot. Evaluate password-spray, impossible-travel, or privilege-change signals against a threshold and business context; escalate safely without giving the user excess information."
        ),
        example: t(
          "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624,4625; StartTime=(Get-Date).AddHours(-4)} -MaxEvents 100",
          "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624,4625; StartTime=(Get-Date).AddHours(-4)} -MaxEvents 100",
          "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624,4625; StartTime=(Get-Date).AddHours(-4)} -MaxEvents 100"
        ),
        explanation: t(
          "Bu sintaksisni o‘zingizning ruxsatli lab Event Log’ida ishlating; real audit ma’lumotini saqlash, ko‘rish va ulashish uchun tashkilot siyosatiga amal qiling.",
          "Используйте этот синтаксис в своём авторизованном лабораторном Event Log; при сохранении, просмотре и передаче реальных данных аудита следуйте политике организации.",
          "Use this syntax on your own authorized lab Event Log; follow organizational policy for storing, viewing, and sharing real audit data."
        ),
        prompt: t("Windows Security’da muvaffaqiyatsiz logon hodisasi ID’si?", "ID события неудачного входа в Windows Security?", "The event ID for a failed logon in Windows Security?"),
        answers: ["4625"]
      },
      {
        title: t("6. Patch, endpoint baseline, backup va recovery", "6. Патчи, базовая конфигурация конечных точек, резервное копирование и восстановление", "6. Patching, endpoint baseline, backup, and recovery"),
        content: t(
          "Patch boshqaruvi inventar, vendor advisory, ta’sir, test, ring deployment va qaytarish rejasini o‘z ichiga oladi. Muhim serverda avtomatik reboot biznes uzilishiga olib kelishi mumkin; maintenance window, cluster failover, backup va application owner tasdig‘ini tekshiring. Defender/EDR, firewall, BitLocker, secure boot va application control konfiguratsiyasini baseline va exception bilan yuriting.\n\nSystem State backup AD DS tiklashda muhim bo‘lishi mumkin, ammo restore topologiyasi va forest recovery runbook alohida ishlab chiqiladi. Backup media va encryption key’ga kirishni ajrating; restore mashqlarini izolyatsiyalangan muhitda o‘tkazing. RPO/RTO’ni rahbariyat bilan kelishing, amalda o‘lchang va natijani qayd eting.",
          "Управление патчами включает инвентаризацию, рекомендации производителя (vendor advisory), оценку влияния, тестирование, поэтапное развёртывание (ring deployment) и план отката. Автоматическая перезагрузка критичного сервера может привести к сбою бизнес-процессов; проверьте окно обслуживания, failover кластера, резервное копирование и согласие владельца приложения. Ведите конфигурацию Defender/EDR, межсетевого экрана, BitLocker, secure boot и контроля приложений с помощью baseline и исключений.\n\nРезервная копия System State может быть важна для восстановления AD DS, но топология восстановления и runbook восстановления леса разрабатываются отдельно. Разделяйте доступ к резервным носителям и ключам шифрования; проводите учения по восстановлению в изолированной среде. Согласуйте RPO/RTO с руководством, измеряйте их на практике и фиксируйте результаты.",
          "Patch management includes inventory, vendor advisories, impact assessment, testing, ring deployment, and a rollback plan. An automatic reboot of a critical server can cause business disruption; check the maintenance window, cluster failover, backups, and application owner approval. Run Defender/EDR, firewall, BitLocker, secure boot, and application-control configuration with a baseline and exceptions.\n\nA System State backup can be important for AD DS recovery, but the restore topology and forest-recovery runbook are developed separately. Separate access to backup media and encryption keys; perform restore drills in an isolated environment. Agree RPO/RTO with management, measure them in practice, and record the results."
        ),
        example: t(
          "Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10\nGet-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled",
          "Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10\nGet-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled",
          "Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10\nGet-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled"
        ),
        explanation: t(
          "Cmdletlar patch va Defender holatini o‘qiydi; OS versiyasiga qarab property farq qiladi. Natija endpoint posture’ni to‘liq isbotlamaydi.",
          "Командлеты считывают состояние патчей и Defender; свойства различаются в зависимости от версии ОС. Результат не доказывает полную защищённость конечной точки.",
          "The cmdlets read patch and Defender status; properties vary by OS version. The output doesn't fully prove endpoint posture."
        ),
        prompt: t("Qabul qilinadigan maksimal ma’lumot yo‘qotish oynasining qisqartmasi?", "Аббревиатура допустимого максимального окна потери данных?", "The abbreviation for the acceptable maximum data-loss window?"),
        answers: ["rpo"]
      },
      {
        title: t("7. Hybrid identity, MFA va access lifecycle", "7. Гибридная идентификация, MFA и жизненный цикл доступа", "7. Hybrid identity, MFA, and the access lifecycle"),
        content: t(
          "Korporativ identity hayot sikli joiner/mover/leaver, rol o‘zgarishi, access review va favqulodda hisoblarni boshqaradi. On-prem AD va cloud identity sinxronlashida authoritative source, conflict, break-glass va lifecycle owner aniq bo‘lsin. MFA barcha riskni bartaraf etmaydi: phishing-resistant method, conditional access, device posture va session riskni qatlamlab qo‘llang.\n\nService principal, managed identity va service accountlarga interaktiv login bermaslik, credential rotation va ownership kerak. Ortiqcha group nesting, stale account va privileged role membership davriy tekshirilsin. Joiner/leaver jarayoni kechiksa, orphan account qoladi; avtomatlashtirishdan oldin HR identity, approval va exception jarayonini aniqlang.",
          "Жизненный цикл корпоративной идентичности управляет joiner/mover/leaver, изменением ролей, пересмотром доступа (access review) и аварийными учётными записями. При синхронизации локального AD и облачной идентичности должны быть чётко определены авторитетный источник (authoritative source), конфликты, break-glass и владелец жизненного цикла. MFA не устраняет весь риск: применяйте послойно phishing-resistant методы, условный доступ (conditional access), состояние устройства (device posture) и риск сессии.\n\nСлужебным principal, managed identity и служебным учётным записям нужны запрет интерактивного входа, ротация учётных данных и назначенный владелец. Избыточное вложение групп, устаревшие учётные записи и членство в привилегированных ролях должны регулярно проверяться. Если процесс joiner/leaver задерживается, остаются «осиротевшие» учётные записи; перед автоматизацией определите процесс идентификации HR, согласования и исключений.",
          "The corporate identity lifecycle manages joiner/mover/leaver, role changes, access reviews, and emergency accounts. When synchronizing on-prem AD with cloud identity, the authoritative source, conflict handling, break-glass access, and lifecycle owner must be clear. MFA doesn't eliminate all risk: apply phishing-resistant methods, conditional access, device posture, and session risk in layers.\n\nService principals, managed identities, and service accounts need no interactive login, credential rotation, and clear ownership. Excessive group nesting, stale accounts, and privileged role membership should be reviewed periodically. If the joiner/leaver process lags, orphaned accounts remain; before automating, define the HR identity, approval, and exception process."
        ),
        example: t(
          "Access review jadvali: identity / owner / role / oxirgi foydalanish / tasdiqlovchi / muddat / qaror / ticket.",
          "Таблица access review: identity / владелец / роль / последнее использование / утверждающий / срок / решение / тикет.",
          "Access review table: identity / owner / role / last used / approver / deadline / decision / ticket."
        ),
        explanation: t(
          "Hisobotda haqiqiy xodim nomi va account ID o‘rniga sintetik qiymat ishlating. Huquqni olib tashlashni tashkilotning approval va emergency policy’siz avtomatlashtirmang.",
          "В отчёте используйте синтетические значения вместо реальных имён сотрудников и ID учётных записей. Не автоматизируйте отзыв прав без процесса согласования и аварийной политики организации.",
          "Use synthetic values in the report instead of real employee names and account IDs. Don't automate rights removal without the organization's approval and emergency policy process."
        ),
        prompt: t("Hodim tashkilotdan ketganda account va access’ni yopish jarayoni?", "Процесс закрытия учётной записи и доступа при уходе сотрудника из организации?", "The process of closing an account and access when an employee leaves the organization?"),
        answers: ["leaver", "offboarding", "leaver process"]
      },
      {
        title: t("8. Senior Windows administrator: xizmat sifati va incident boshqaruvi", "8. Senior Windows-администратор: качество сервиса и управление инцидентами", "8. Senior Windows administrator: service quality and incident management"),
        content: t(
          "Senior Windows administrator patch KPI’lari, backup restore, directory health, privileged access, endpoint coverage va change failure rate’ni birga kuzatadi. Dashboard sonlari operational qarorga olib kelishi kerak: eski patch, stale account, replication lag va audit gap uchun owner hamda SLA belgilang. Alert threshold’i pilot data bilan tune qilinib, noise va blind spot o‘lchansin.\n\nIncidentda containment, identity reset, endpoint isolation va evidence preservation qarorlarini incident commander bilan muvofiqlashtiring. AD compromise gumonida shoshilinch password resetning replikatsiya, service account va Kerberos ticketlarga ta’sirini tushuning; faqat rasmiy forest recovery runbook bo‘yicha ish tuting. Postmortemda texnik sabab bilan birga aniqlash va tiklash jarayonidagi bo‘shliqni ham bartaraf eting.",
          "Senior Windows-администратор отслеживает вместе KPI патчинга, восстановление из резервных копий, состояние каталога, привилегированный доступ, покрытие конечных точек и change failure rate. Цифры дашборда должны вести к операционному решению: назначьте владельца и SLA для устаревших патчей, неактивных учётных записей, задержки репликации и пробелов аудита. Порог оповещений (alert threshold) настраивается на пилотных данных, при этом измеряются шум и слепые зоны.\n\nПри инциденте согласуйте решения о сдерживании (containment), сбросе identity, изоляции конечной точки и сохранении улик с incident commander. При подозрении на компрометацию AD понимайте влияние экстренного сброса пароля на репликацию, служебные учётные записи и тикеты Kerberos; действуйте только по официальному runbook восстановления леса. В постмортеме устраняйте не только техническую причину, но и пробелы в процессах обнаружения и восстановления.",
          "A senior Windows administrator tracks patch KPIs, backup restore, directory health, privileged access, endpoint coverage, and change failure rate together. Dashboard numbers must drive operational decisions: assign an owner and SLA for stale patches, stale accounts, replication lag, and audit gaps. Alert thresholds are tuned with pilot data, measuring noise and blind spots.\n\nDuring an incident, coordinate containment, identity reset, endpoint isolation, and evidence preservation decisions with the incident commander. When AD compromise is suspected, understand the impact of an emergency password reset on replication, service accounts, and Kerberos tickets; act only per the official forest-recovery runbook. In the postmortem, address not only the technical cause but also gaps in the detection and recovery process."
        ),
        example: t(
          "Operatsion review: patch compliance / privileged changes / backup restore evidence / DC replication / open exceptions / action owner.",
          "Операционный обзор: соответствие патчей / привилегированные изменения / подтверждение восстановления из резервной копии / репликация DC / открытые исключения / ответственный за действие.",
          "Operational review: patch compliance / privileged changes / backup restore evidence / DC replication / open exceptions / action owner."
        ),
        explanation: t(
          "Faqat agregat va ruxsatli ko‘rsatkichlarni ulashing. Account komprometi bo‘yicha javob tashkilotning incident response va huquqiy jarayonlari bilan boshqarilsin.",
          "Делитесь только агрегированными и разрешёнными показателями. Реагирование на компрометацию учётной записи должно управляться процессами incident response и юридическими процедурами организации.",
          "Share only aggregated, authorized metrics. Response to account compromise must be governed by the organization's incident response and legal processes."
        ),
        prompt: t("Directory xizmatida vaqt farqi va replikatsiya holatini baholashda qaysi server rolini topish muhim?", "Какую роль сервера важно определить при оценке расхождения времени и состояния репликации в службе каталогов?", "Which server role is important to identify when assessing time skew and replication status in a directory service?"),
        answers: ["domain controller", "dc"]
      }
    ]
  }),
  book({
    slug: "network-engineering-advanced",
    title: t(
      "Tarmoq muhandisligi: loyihalash, diagnostika va chidamlilik",
      "Сетевая инженерия: проектирование, диагностика и отказоустойчивость",
      "Network engineering: design, diagnostics, and resilience"
    ),
    summary: t(
      "IPv4/IPv6, subnetting, VLAN, switching, routing, DNS/DHCP, VPN, Wi-Fi, firewall va tarmoq o‘zgarishlarini xavfsiz boshqarish bo‘yicha ishga yo‘naltirilgan darslik.",
      "Практический курс по IPv4/IPv6, субнетированию, VLAN, коммутации, маршрутизации, DNS/DHCP, VPN, Wi-Fi, межсетевым экранам и безопасному управлению изменениями в сети.",
      "A job-focused course on IPv4/IPv6, subnetting, VLAN, switching, routing, DNS/DHCP, VPN, Wi-Fi, firewalls, and safely managing network changes."
    ),
    category: "networking", difficulty: "medium", hours: 38,
    labPlan: t(
      "Berilgan sintetik topologiya va konfiguratsiya eksportlarida addressing, segmentatsiya, marshrut, DNS, firewall va packet-timeline tahlili.",
      "Анализ адресации, сегментации, маршрутов, DNS, межсетевых экранов и временной шкалы пакетов на заданной синтетической топологии и экспортах конфигурации.",
      "Analysis of addressing, segmentation, routing, DNS, firewalls, and packet timelines on a provided synthetic topology and configuration exports."
    ),
    references: [
      reference(t("Cloudflare Learning Center — networking", "Cloudflare Learning Center — сети", "Cloudflare Learning Center — networking"), "https://www.cloudflare.com/learning/"),
      reference(t("IETF RFC Editor", "IETF RFC Editor", "IETF RFC Editor"), "https://www.rfc-editor.org/"),
      reference(t("Cisco CCNA exam topics", "Темы экзамена Cisco CCNA", "Cisco CCNA exam topics"), "https://learningnetwork.cisco.com/s/ccna-exam-topics"),
      reference(t("NIST Cybersecurity Framework 2.0", "NIST Cybersecurity Framework 2.0", "NIST Cybersecurity Framework 2.0"), "https://www.nist.gov/cyberframework")
    ],
    chapters: [
      {
        title: t(
          "1. IPv4/IPv6, subnetting va manzil rejalashtirish",
          "1. IPv4/IPv6, субнетирование и планирование адресации",
          "1. IPv4/IPv6, subnetting, and address planning"
        ),
        content: t(
          "Subnet mask/prefix tarmoq va host bitlarini ajratadi. CIDR address aggregation va route planning’ga yordam beradi; VLSM’da eng katta segmentdan boshlab talabga yetarli eng kichik blok tanlanadi. Gateway, reserved address, DHCP pool, broadcast (IPv4’da) va point-to-point linklarni jadvalda qayd qiling. Overlap, undocumented static address va NAT pool’lar o‘sishni qiyinlashtiradi.\n\nIPv6’da /64 subnet keng qo‘llanadi; link-local, global unicast, multicast va SLAAC/DHCPv6 rollarini farqlang. IPv6’ni noto‘g‘ri “o‘chirib qo‘yish” o‘rniga firewall policy, router advertisement, DNS, monitoring va dual-stack testni boshqaring. Address plan’da owner, site, VLAN, environment va lifecycle ko‘rsatilishi kerak.",
          "Маска подсети/префикс разделяет биты сети и узла. CIDR помогает с агрегацией адресов и планированием маршрутов; в VLSM, начиная с самого крупного сегмента, выбирается наименьший достаточный блок. Фиксируйте в таблице шлюз, зарезервированные адреса, пул DHCP, широковещательный адрес (в IPv4) и point-to-point каналы. Пересечения, недокументированные статические адреса и пулы NAT усложняют рост сети.\n\nВ IPv6 широко применяется подсеть /64; различайте роли link-local, global unicast, multicast и SLAAC/DHCPv6. Вместо неправильного «отключения» IPv6 управляйте политикой межсетевого экрана, router advertisement, DNS, мониторингом и тестированием dual-stack. В плане адресации должны быть указаны владелец, площадка, VLAN, окружение и жизненный цикл.",
          "A subnet mask/prefix separates network and host bits. CIDR aids address aggregation and route planning; with VLSM, starting from the largest segment, the smallest block that still meets the requirement is chosen. Record the gateway, reserved addresses, DHCP pool, broadcast address (in IPv4), and point-to-point links in a table. Overlaps, undocumented static addresses, and NAT pools make growth harder.\n\nIn IPv6, /64 subnets are widely used; distinguish the roles of link-local, global unicast, multicast, and SLAAC/DHCPv6. Instead of incorrectly \"disabling\" IPv6, manage firewall policy, router advertisements, DNS, monitoring, and dual-stack testing. The address plan should show owner, site, VLAN, environment, and lifecycle."
        ),
        example: t(
          "192.0.2.0/26: 64 manzil, IPv4 usable host odatda 62.\nIPv6 link-local: fe80::/10.\nSintetik subnet jadvali: network / prefix / gateway / DHCP range / owner.",
          "192.0.2.0/26: 64 адреса, обычно 62 пригодных для использования IPv4-хоста.\nIPv6 link-local: fe80::/10.\nСинтетическая таблица подсетей: network / prefix / gateway / DHCP range / owner.",
          "192.0.2.0/26: 64 addresses, typically 62 usable IPv4 hosts.\nIPv6 link-local: fe80::/10.\nSynthetic subnet table: network / prefix / gateway / DHCP range / owner."
        ),
        explanation: t(
          "TEST-NET manzillar hujjat misollari uchun ajratilgan. Real enterprise manzillarni public portfolio yoki screenshotga qo‘ymang.",
          "Адреса TEST-NET зарезервированы для примеров в документации. Не публикуйте реальные корпоративные адреса в открытом портфолио или на скриншотах.",
          "TEST-NET addresses are reserved for documentation examples. Do not put real enterprise addresses in a public portfolio or screenshots."
        ),
        prompt: t(
          "IPv4 /26 blokida jami nechta manzil bor?",
          "Сколько всего адресов в блоке IPv4 /26?",
          "How many total addresses are in an IPv4 /26 block?"
        ),
        answers: ["64"]
      },
      {
        title: t(
          "2. Ethernet, VLAN, STP va switch port siyosati",
          "2. Ethernet, VLAN, STP и политика портов коммутатора",
          "2. Ethernet, VLAN, STP, and switch port policy"
        ),
        content: t(
          "VLAN broadcast domenini ajratadi; access port bitta VLAN’ni, trunk bir nechta 802.1Q taglangan VLAN’ni tashiydi. Native VLAN, allowed VLAN list, voice VLAN va management plane siyosati vendor bo‘yicha farq qiladi. STP loop’ni oldini oladi, lekin root bridge, redundant link va edge port sozlamasi noto‘g‘ri bo‘lsa outage bo‘lishi mumkin.\n\nPort security, 802.1X/NAC, DHCP snooping, Dynamic ARP Inspection kabi nazoratlar platforma va arxitekturaga bog‘liq. Ularni yoqishdan oldin client compatibility, fail-open/fail-closed qarori va recovery yo‘lini sinang. Change plan’da oldingi state, expected output va rollback komandasi bo‘lsin.",
          "VLAN разделяет домен широковещания; access-порт переносит один VLAN, trunk — несколько VLAN с тегами 802.1Q. Политика native VLAN, списка разрешённых VLAN, voice VLAN и management plane различается в зависимости от вендора. STP предотвращает петли, но при неверной настройке root bridge, резервных каналов и edge-портов возможен простой.\n\nТакие средства контроля, как port security, 802.1X/NAC, DHCP snooping и Dynamic ARP Inspection, зависят от платформы и архитектуры. Перед их включением протестируйте совместимость с клиентами, решение fail-open/fail-closed и путь восстановления. В плане изменений должны быть предыдущее состояние, ожидаемый результат и команда отката.",
          "VLANs separate broadcast domains; an access port carries a single VLAN, while a trunk carries multiple 802.1Q-tagged VLANs. Native VLAN, allowed VLAN list, voice VLAN, and management plane policy vary by vendor. STP prevents loops, but an outage can occur if root bridge, redundant link, and edge port settings are misconfigured.\n\nControls such as port security, 802.1X/NAC, DHCP snooping, and Dynamic ARP Inspection depend on the platform and architecture. Before enabling them, test client compatibility, the fail-open/fail-closed decision, and the recovery path. A change plan should include the prior state, expected output, and rollback command."
        ),
        example: t(
          "Port audit jadvali: switch/port / mode / VLAN / neighbor / expected device / unused? / change ticket.",
          "Таблица аудита портов: switch/port / mode / VLAN / neighbor / expected device / unused? / change ticket.",
          "Port audit table: switch/port / mode / VLAN / neighbor / expected device / unused? / change ticket."
        ),
        explanation: t(
          "Bu audit shabloni, real qurilma buyrug‘i emas. Configuration export ichki host va credentialni o‘z ichiga olishi mumkin; redaction qiling.",
          "Это шаблон аудита, а не реальная команда устройства. Экспорт конфигурации может содержать внутренние хосты и учётные данные; применяйте редактирование (redaction).",
          "This is an audit template, not a real device command. A configuration export may contain internal hosts and credentials; redact it."
        ),
        prompt: t(
          "802.1Q tag bilan bir nechta VLAN’ni tashiydigan switch port mode?",
          "Какой режим порта коммутатора переносит несколько VLAN с тегом 802.1Q?",
          "Which switch port mode carries multiple VLANs tagged with 802.1Q?"
        ),
        answers: ["trunk"]
      },
      {
        title: t(
          "3. Routing, BGP/OSPF tushunchalari va nosozlik izlash",
          "3. Основы маршрутизации, BGP/OSPF и поиск неисправностей",
          "3. Routing, BGP/OSPF concepts, and troubleshooting"
        ),
        content: t(
          "Router eng uzun mos prefix bo‘yicha forwarding qiladi; route source, administrative distance/metric, next hop va policy’ni birgalikda tekshiring. OSPF ichki link-state routing’ni, BGP esa turli autonomous systemlar orasida policy’ga asoslangan routing’ni ta’minlaydi. Protokolni tanlash topologiya, convergence, scale va operatsion ko‘nikmaga bog‘liq.\n\nAsimmetrik yo‘l stateful firewall’ni buzishi mumkin. MTU/PMTUD muammosi faqat katta paketda namoyon bo‘ladi; traceroute firewall yoki ECMP sabab to‘liq yo‘lni bermasligi mumkin. Route flap, prefix leak va blackhole uchun max-prefix, route filtering, RPKI kabi himoyalarni operator siyosati bilan loyihalang. Public routing o‘zgarishi faqat vakolatli NOC change jarayonida bajarilsin.",
          "Маршрутизатор пересылает трафик по правилу наиболее длинного совпадающего префикса; проверяйте в совокупности источник маршрута, административное расстояние/метрику, next hop и политику. OSPF обеспечивает внутреннюю link-state маршрутизацию, а BGP — маршрутизацию на основе политик между разными автономными системами. Выбор протокола зависит от топологии, сходимости, масштаба и операционного опыта.\n\nАсимметричный путь может нарушить работу stateful межсетевого экрана. Проблема MTU/PMTUD проявляется только на крупных пакетах; traceroute может не показывать полный путь из-за межсетевого экрана или ECMP. Проектируйте защиту от route flap, prefix leak и blackhole — max-prefix, фильтрацию маршрутов, RPKI — в соответствии с политикой оператора. Изменения публичной маршрутизации выполняются только через уполномоченный процесс изменений NOC.",
          "A router forwards based on the longest matching prefix; check route source, administrative distance/metric, next hop, and policy together. OSPF provides internal link-state routing, while BGP provides policy-based routing between different autonomous systems. Protocol choice depends on topology, convergence, scale, and operational skill.\n\nAn asymmetric path can break a stateful firewall. MTU/PMTUD issues show up only with large packets; traceroute may not reveal the full path because of a firewall or ECMP. Design protections such as max-prefix, route filtering, and RPKI against route flap, prefix leak, and blackhole in line with operator policy. Public routing changes should only be made through an authorized NOC change process."
        ),
        example: t(
          "Nosozlik zanjiri: client route → gateway FIB → next hop reachability → ACL → remote route → return path.",
          "Цепочка диагностики: client route → gateway FIB → next hop reachability → ACL → remote route → return path.",
          "Troubleshooting chain: client route → gateway FIB → next hop reachability → ACL → remote route → return path."
        ),
        explanation: t(
          "Bu konseptual check-list; public routerga test e’lon qilmang. Diagnostika faqat o‘zingiz boshqaradigan yoki ruxsat berilgan tarmoqda bajariladi.",
          "Это концептуальный чек-лист; не проводите тестирование на публичных маршрутизаторах. Диагностика выполняется только в сети, которой вы управляете или на которую у вас есть разрешение.",
          "This is a conceptual checklist; do not run tests against public routers. Diagnostics should only be performed on a network you control or are authorized to test."
        ),
        prompt: t(
          "Eng aniq mos keladigan IP route tanlash qoidasi?",
          "Правило выбора наиболее точно совпадающего IP-маршрута?",
          "What is the rule for selecting the most specific matching IP route?"
        ),
        answers: ["longest prefix match", "eng uzun prefiks", "longest prefix"]
      },
      {
        title: t(
          "4. DNS, DHCP, NTP va xizmatga bog‘liqlik",
          "4. DNS, DHCP, NTP и взаимозависимость сервисов",
          "4. DNS, DHCP, NTP, and service dependencies"
        ),
        content: t(
          "DNS recursive resolver, authoritative zone, TTL, CNAME, A/AAAA va PTR yozuvlari bilan nomlarni boshqaradi. DHCP lease va option’lar IP, gateway, DNS hamda domain search’ni tarqatadi. DHCP relay turli broadcast domenlar orasida so‘rovni yetkazadi. NTP vaqt sinxronligi Kerberos, log korrelyatsiyasi va sertifikat tekshiruviga ta’sir qiladi.\n\nNosozlikda client cache, resolver, authoritative server, delegation, firewall UDP/TCP 53, lease va scope exhaustion’ni ajratib tekshiring. DNS o‘zgarishida TTL va cache sabab propagation darhol bo‘lmasligi mumkin. Change log’da oldingi/yangilangan record, owner, approval va rollback ko‘rsating; DNS hijack yoki unauthorized update gumoni bo‘lsa audit trailni saqlang.",
          "DNS управляет именами с помощью recursive resolver, authoritative-зоны, TTL, записей CNAME, A/AAAA и PTR. Аренда DHCP (lease) и опции распространяют IP, шлюз, DNS и domain search. DHCP relay доставляет запросы между разными доменами широковещания. Синхронизация времени NTP влияет на Kerberos, корреляцию логов и проверку сертификатов.\n\nПри диагностике отдельно проверяйте кэш клиента, resolver, authoritative-сервер, делегирование, межсетевой экран на UDP/TCP 53, lease и исчерпание scope. При изменении DNS распространение может произойти не сразу из-за TTL и кэша. В журнале изменений указывайте предыдущую/обновлённую запись, владельца, утверждение и откат; при подозрении на DNS hijack или несанкционированное обновление сохраняйте журнал аудита.",
          "DNS manages names via recursive resolvers, authoritative zones, TTL, CNAME, A/AAAA, and PTR records. DHCP leases and options distribute the IP, gateway, DNS, and domain search list. DHCP relay forwards requests between different broadcast domains. NTP time synchronization affects Kerberos, log correlation, and certificate validation.\n\nWhen troubleshooting, separately check client cache, resolver, authoritative server, delegation, firewall UDP/TCP 53, lease, and scope exhaustion. After a DNS change, propagation may not be immediate because of TTL and caching. In the change log, record the previous/updated record, owner, approval, and rollback; if a DNS hijack or unauthorized update is suspected, preserve the audit trail."
        ),
        example: t(
          "nslookup -type=A service.example.test\nnslookup -type=SRV _ldap._tcp.example.test\nipconfig /all  # Windows client holatini o‘qish",
          "nslookup -type=A service.example.test\nnslookup -type=SRV _ldap._tcp.example.test\nipconfig /all  # чтение состояния Windows-клиента",
          "nslookup -type=A service.example.test\nnslookup -type=SRV _ldap._tcp.example.test\nipconfig /all  # reading Windows client state"
        ),
        explanation: t(
          "Misollardagi `.test` domeni sintetik. Ichki DNS yozuvlari tarmoq topologiyasini oshkor qilishi mumkin; ruxsatsiz query va ommaviy screenshotdan saqlaning.",
          "Домен `.test` в примерах синтетический. Внутренние записи DNS могут раскрывать топологию сети; избегайте несанкционированных запросов и публичных скриншотов.",
          "The `.test` domain in the examples is synthetic. Internal DNS records can reveal network topology; avoid unauthorized queries and public screenshots."
        ),
        prompt: t(
          "DNS yozuvining cache’da saqlanish muddatini belgilovchi qiymat?",
          "Какое значение определяет срок хранения DNS-записи в кэше?",
          "Which value determines how long a DNS record is kept in cache?"
        ),
        answers: ["ttl", "time to live"]
      },
      {
        title: t(
          "5. Firewall, NAT, VPN va zero-trust segmentatsiya",
          "5. Межсетевой экран, NAT, VPN и сегментация zero-trust",
          "5. Firewall, NAT, VPN, and zero-trust segmentation"
        ),
        content: t(
          "Firewall policy source, destination, port, application, identity, direction va connection state’ni tekshiradi; rule order, implicit deny va object group inheritance’ni hisobga oling. NAT mappingni o‘zgartiradi, xavfsizlik policy o‘rnini bosmaydi. Site-to-site va remote-access VPN’da identity, certificate lifecycle, split tunnel, DNS, route, MFA va log nazorati kerak.\n\nSegmentatsiya faqat VLAN yaratish emas: inter-zone flow matrix va data classification asosida minimal aloqa yo‘lini belgilang. Zero-trust modelda har kirish so‘rovi identity, device, context va resurs siyosati bilan baholanadi. Firewall change’da shadow rule, broad any-any, stale object va logging gaplarni tekshirib, test va rollback qo‘shing.",
          "Политика межсетевого экрана проверяет source, destination, порт, приложение, identity, направление и состояние соединения; учитывайте порядок правил, implicit deny и наследование object group. NAT изменяет адресацию, но не заменяет политику безопасности. Для site-to-site и remote-access VPN нужны контроль identity, жизненного цикла сертификатов, split tunnel, DNS, маршрутов, MFA и логов.\n\nСегментация — это не просто создание VLAN: определяйте минимально необходимый путь взаимодействия на основе матрицы потоков между зонами и классификации данных. В модели zero-trust каждый запрос на доступ оценивается по identity, устройству, контексту и политике ресурса. При изменении межсетевого экрана проверяйте теневые правила, широкие any-any, устаревшие объекты и пробелы в логировании, добавляя тестирование и откат.",
          "Firewall policy checks source, destination, port, application, identity, direction, and connection state; account for rule order, implicit deny, and object group inheritance. NAT changes addressing but does not replace security policy. Site-to-site and remote-access VPNs require control of identity, certificate lifecycle, split tunneling, DNS, routes, MFA, and logging.\n\nSegmentation is not just creating VLANs: define the minimal required communication path based on an inter-zone flow matrix and data classification. In a zero-trust model, every access request is evaluated against identity, device, context, and resource policy. For firewall changes, check for shadow rules, broad any-any entries, stale objects, and logging gaps, and add testing and rollback."
        ),
        example: t(
          "Flow request: source role → destination service → protocol/port → business need → owner → expiry → log/monitoring.",
          "Запрос на поток: source role → destination service → protocol/port → business need → owner → expiry → log/monitoring.",
          "Flow request: source role → destination service → protocol/port → business need → owner → expiry → log/monitoring."
        ),
        explanation: t(
          "Shablon yangi ruxsatni avtomatik tasdiqlamaydi. Ishlab chiqarish firewall qoidasi tarmoq/security ownerlari tomonidan review qilinishi kerak.",
          "Шаблон не одобряет новое разрешение автоматически. Правило межсетевого экрана в production должно пройти review у владельцев сети/безопасности.",
          "The template does not automatically approve a new permission. A production firewall rule must be reviewed by the network/security owners."
        ),
        prompt: t(
          "NAT firewall ruxsat nazoratining o‘rnini bosa oladimi?",
          "Может ли NAT заменить контроль доступа межсетевого экрана?",
          "Can NAT replace firewall access control?"
        ),
        answers: ["yo‘q", "no", "cannot"]
      },
      {
        title: t(
          "6. Wi-Fi, 802.1X va radio rejalashtirish",
          "6. Wi-Fi, 802.1X и радиопланирование",
          "6. Wi-Fi, 802.1X, and radio planning"
        ),
        content: t(
          "Wi-Fi’da coverage, channel interference, airtime contention, roaming va client density bir-biriga ta’sir qiladi. SSID’ni ko‘paytirish overhead keltirishi mumkin. WPA2/3-Enterprise va 802.1X’da supplicant, authenticator va RADIUS server munosabatini, sertifikat trust’ini va guest onboarding’ni boshqaring. PSK’ni guruhlararo ulashish lifecycle va attribution muammosini keltiradi.\n\nGuest, corporate, IoT va management trafikni ajrating; IoT qurilmalari faqat kerakli controller/service’ga chiqsin. Rogue AP aniqlanganda qurilmani darhol uzishdan oldin ownership va physical impact’ni tekshiring. Kanal rejasini site survey va telemetry’ga tayang; 2.4/5/6 GHz qo‘llovi, regulatory domain va device capability’ni hisobga oling.",
          "В Wi-Fi покрытие, интерференция каналов, конкуренция за airtime, роуминг и плотность клиентов влияют друг на друга. Увеличение числа SSID может создавать дополнительную нагрузку. В WPA2/3-Enterprise и 802.1X управляйте взаимодействием supplicant, authenticator и сервера RADIUS, доверием к сертификатам и подключением гостей. Совместное использование PSK между группами создаёт проблемы с жизненным циклом и атрибуцией.\n\nРазделяйте гостевой, корпоративный, IoT и управленческий трафик; устройства IoT должны иметь доступ только к нужному контроллеру/сервису. При обнаружении rogue AP перед немедленным отключением устройства проверьте владельца и физическое влияние. Опирайтесь на site survey и телеметрию при планировании каналов; учитывайте поддержку диапазонов 2.4/5/6 ГГц, регуляторный домен и возможности устройств.",
          "In Wi-Fi, coverage, channel interference, airtime contention, roaming, and client density all affect each other. Adding more SSIDs can add overhead. In WPA2/3-Enterprise and 802.1X, manage the relationship between supplicant, authenticator, and RADIUS server, certificate trust, and guest onboarding. Sharing a PSK across groups creates lifecycle and attribution problems.\n\nSeparate guest, corporate, IoT, and management traffic; IoT devices should only reach the controller/service they need. When a rogue AP is detected, check ownership and physical impact before immediately disconnecting the device. Base the channel plan on a site survey and telemetry; account for 2.4/5/6 GHz support, regulatory domain, and device capability."
        ),
        example: t(
          "Wi-Fi incident ma’lumotlari: AP/SSID / band/channel / client RSSI / retry rate / RADIUS result / vaqt / ta’sir.",
          "Данные инцидента Wi-Fi: AP/SSID / band/channel / client RSSI / retry rate / RADIUS result / время / влияние.",
          "Wi-Fi incident data: AP/SSID / band/channel / client RSSI / retry rate / RADIUS result / time / impact."
        ),
        explanation: t(
          "Bu kuzatuv jadvali, client MAC va username shaxsiy/operatsion ma’lumot bo‘lishi mumkin; loglarni siyosatga muvofiq saqlang.",
          "Это таблица наблюдения; MAC-адрес клиента и имя пользователя могут быть персональными/операционными данными — храните логи в соответствии с политикой.",
          "This is a monitoring table; client MAC and username may be personal/operational data — retain logs in line with policy."
        ),
        prompt: t(
          "802.1X autentifikatsiya so‘rovlarini odatda qabul qiluvchi server turi?",
          "Какой тип сервера обычно принимает запросы аутентификации 802.1X?",
          "What type of server typically accepts 802.1X authentication requests?"
        ),
        answers: ["radius"]
      },
      {
        title: t(
          "7. Packet analysis, observability va muammoni isbotlash",
          "7. Анализ пакетов, наблюдаемость и доказательство проблемы",
          "7. Packet analysis, observability, and proving the problem"
        ),
        content: t(
          "Packet capture aloqaning bir nuqtadagi dalilidir, butun tizimning ko‘rinishi emas. TCP handshake, retransmission, DNS query/response, TLS handshake va ICMP xabarlarini timeline bilan tahlil qiling. Capture point, interface, filter, snap length, clock skew va packet loss’ni yozing. Encryption sabab payload ko‘rinmasligi odatiy; TLS’ni buzishga urinmang.\n\nNetFlow/IPFIX, SNMP telemetry, syslog, synthetic probe va application metric’larni birlashtirish root cause’ni toraytiradi. Alertda user impact, severity, owner va runbook bo‘lsin. Pcap’da credential, cookie, internal IP va shaxsiy ma’lumot chiqishi mumkin; scope, approval, retention va access control’ni capture’dan oldin belgilang.",
          "Захват пакетов — это доказательство в одной точке соединения, а не представление всей системы. Анализируйте по временной шкале TCP handshake, повторные передачи, DNS-запросы/ответы, TLS handshake и сообщения ICMP. Фиксируйте точку захвата, интерфейс, фильтр, snap length, рассинхронизацию часов и потерю пакетов. Невидимость полезной нагрузки из-за шифрования — это нормально; не пытайтесь взломать TLS.\n\nОбъединение NetFlow/IPFIX, телеметрии SNMP, syslog, синтетических проб и метрик приложений сужает круг поиска первопричины. В оповещении должны быть указаны влияние на пользователя, серьёзность, владелец и runbook. В pcap могут содержаться учётные данные, cookie, внутренние IP-адреса и персональные данные; определите scope, утверждение, хранение и контроль доступа до начала захвата.",
          "A packet capture is evidence at one point in the conversation, not a view of the entire system. Analyze the TCP handshake, retransmissions, DNS query/response, TLS handshake, and ICMP messages on a timeline. Record the capture point, interface, filter, snap length, clock skew, and packet loss. Payload being hidden due to encryption is normal; do not attempt to break TLS.\n\nCombining NetFlow/IPFIX, SNMP telemetry, syslog, synthetic probes, and application metrics narrows down the root cause. An alert should include user impact, severity, owner, and runbook. A pcap may expose credentials, cookies, internal IPs, and personal data; define scope, approval, retention, and access control before capturing."
        ),
        example: t(
          "Wireshark display filter: dns || tcp.analysis.retransmission\nCapture note: sensor / UTC start-end / filter / authorization / file hash / retention owner.",
          "Фильтр отображения Wireshark: dns || tcp.analysis.retransmission\nЗаметка о захвате: sensor / UTC start-end / filter / authorization / file hash / retention owner.",
          "Wireshark display filter: dns || tcp.analysis.retransmission\nCapture note: sensor / UTC start-end / filter / authorization / file hash / retention owner."
        ),
        explanation: t(
          "Display filter faqat berilgan capture’ni ko‘rsatadi; filter capture’ni o‘zgartirmaydi. Haqiqiy trafikni yozib olishdan oldin ruxsat va privacy talabini tasdiqlang.",
          "Фильтр отображения лишь показывает заданный захват; он не изменяет сам захват. Перед записью реального трафика подтвердите разрешение и требования к конфиденциальности.",
          "A display filter only shows the given capture; it does not alter the capture itself. Confirm authorization and privacy requirements before recording real traffic."
        ),
        prompt: t(
          "DNS so‘rovi va javoblarni Wireshark’da ajratadigan protocol filter?",
          "Какой фильтр протокола выделяет DNS-запросы и ответы в Wireshark?",
          "Which protocol filter isolates DNS queries and responses in Wireshark?"
        ),
        answers: ["dns"]
      },
      {
        title: t(
          "8. Senior tarmoq muhandisi: change, resilience va capacity",
          "8. Старший сетевой инженер: изменения, отказоустойчивость и ёмкость",
          "8. Senior network engineer: change, resilience, and capacity"
        ),
        content: t(
          "Senior network engineer HA, routing convergence, failure domain, maintenance risk, ISP/vendor SLA, observability va business continuity’ni yagona dizaynda ko‘radi. Redundant qurilma failover sinovidan o‘tmasa, haqiqiy redundancy emas. Capacity trendida port utilization, packet loss, latency percentile, Wi-Fi airtime, NAT/session table va circuit headroom’ni kuzating.\n\nChange review’da blast radius, dependency, pre/post-check, rollback trigger, out-of-band access va stakeholder comms yoziladi. Network diagram versiya nazorati ostida bo‘lsin; secretsiz, aktual topology va ownership ko‘rsatilsin. Incident’dan keyin root cause, detection gap va preventive task’ni egasi va due date bilan yoping. Katta o‘zgarishni pilot, canary yoki bosqichma-bosqich rollout bilan bajaring.",
          "Старший сетевой инженер рассматривает в едином дизайне HA, сходимость маршрутизации, домен отказа, риск обслуживания, SLA провайдера/вендора, наблюдаемость и непрерывность бизнеса. Если резервное устройство не прошло проверку failover, это не настоящая избыточность. В тренде ёмкости отслеживайте использование портов, потерю пакетов, перцентили задержки, airtime Wi-Fi, таблицы NAT/сессий и запас пропускной способности канала.\n\nВ review изменений фиксируются радиус воздействия, зависимости, проверки до/после, триггер отката, доступ out-of-band и коммуникация с заинтересованными сторонами. Диаграмма сети должна находиться под контролем версий; без секретов, с актуальной топологией и владением. После инцидента закрывайте первопричину, пробел в обнаружении и превентивную задачу с владельцем и сроком. Крупные изменения проводите через pilot, canary или поэтапный rollout.",
          "A senior network engineer views HA, routing convergence, failure domain, maintenance risk, ISP/vendor SLA, observability, and business continuity as a single design. If a redundant device hasn't passed a failover test, it isn't true redundancy. In capacity trends, track port utilization, packet loss, latency percentiles, Wi-Fi airtime, NAT/session tables, and circuit headroom.\n\nA change review records blast radius, dependencies, pre/post-checks, rollback trigger, out-of-band access, and stakeholder communications. Network diagrams should be under version control, secret-free, and show current topology and ownership. After an incident, close out root cause, detection gap, and preventive tasks with an owner and due date. Carry out large changes via pilot, canary, or staged rollout."
        ),
        example: t(
          "Change plan: scope → risk → pre-check → staged action → validation → rollback trigger → owner → communication.",
          "План изменений: scope → risk → pre-check → staged action → validation → rollback trigger → owner → communication.",
          "Change plan: scope → risk → pre-check → staged action → validation → rollback trigger → owner → communication."
        ),
        explanation: t(
          "Yakuniy change plan mahalliy change advisory jarayoniga mos bo‘lishi kerak. Haqiqiy qurilmada change’ni faqat vakolatli muhandis bajarsin.",
          "Итоговый план изменений должен соответствовать локальному процессу change advisory. Изменения на реальном устройстве должен выполнять только уполномоченный инженер.",
          "The final change plan should align with the local change advisory process. Only an authorized engineer should carry out a change on a real device."
        ),
        prompt: t(
          "Katta tarmoq o‘zgarishini kichik bosqichlarga bo‘lib, har bosqichda tekshirish usuli?",
          "Способ разбить крупное изменение сети на небольшие этапы с проверкой на каждом из них?",
          "What is the method for breaking a large network change into small stages with verification at each stage?"
        ),
        answers: ["staged rollout", "bosqichma-bosqich rollout", "canary"]
      }
    ]
  }),
  book({
    slug: "soc-incident-response-detection",
    title: t(
      "SOC, incident response va detection engineering",
      "SOC, реагирование на инциденты и detection engineering",
      "SOC, incident response, and detection engineering"
    ),
    summary: t(
      "Alert triage’dan threat hunting, log engineering, incident lifecycle, dalil yaxlitligi va senior SOC operatsiyalarigacha bo‘lgan blue-team darsligi.",
      "Курс для blue-team: от триажа алертов до threat hunting, инженерии логов, жизненного цикла инцидентов, целостности доказательств и операций senior SOC.",
      "A blue-team course spanning alert triage, threat hunting, log engineering, the incident lifecycle, evidence integrity, and senior SOC operations."
    ),
    category: "security", difficulty: "medium", hours: 40,
    labPlan: t(
      "Faqat berilgan sintetik loglar va xavfsiz konfiguratsiya namunalarida 10 ta detection, triage, timeline va response mashqi.",
      "10 упражнений по детектированию, триажу, временной шкале и реагированию только на заданных синтетических логах и безопасных примерах конфигурации.",
      "10 detection, triage, timeline, and response exercises using only the provided synthetic logs and safe configuration samples."
    ),
    references: [
      reference(t("NIST SP 800-61 Rev. 3 — incident response", "NIST SP 800-61 Rev. 3 — реагирование на инциденты", "NIST SP 800-61 Rev. 3 — incident response"), "https://csrc.nist.gov/pubs/sp/800/61/r3/final"),
      reference(t("MITRE ATT&CK knowledge base", "База знаний MITRE ATT&CK", "MITRE ATT&CK knowledge base"), "https://attack.mitre.org/"),
      reference(t("NIST NICE Framework", "Структура NIST NICE", "NIST NICE Framework"), "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center"),
      reference(t("Microsoft SC-200 — Security Operations Analyst", "Microsoft SC-200 — аналитик операций безопасности", "Microsoft SC-200 — Security Operations Analyst"), "https://learn.microsoft.com/en-us/credentials/certifications/security-operations-analyst/")
    ],
    chapters: [
      {
        title: t(
          "1. SOC roli, telemetriya va analitik fikrlash",
          "1. Роль SOC, телеметрия и аналитическое мышление",
          "1. The role of the SOC, telemetry, and analytical thinking"
        ),
        content: t(
          "SOC tahlilchisi alertni ko‘rib, signal manbasi, asset kritikligi, foydalanuvchi ta’siri va dalil ishonchliligini baholaydi. SIEM’dagi loglar endpoint, identity, DNS, proxy, firewall, cloud control plane va ilovadan kelishi mumkin; parsing, timezone, retention va coverage farq qiladi. Event yo‘qligi har doim faoliyat bo‘lmaganini anglatmaydi.\n\nTriage’da fakt, taxmin va noma’lumni alohida yozing. Alert severity biznes ta’sir va ehtimolga asoslanadi; bitta IOC yoki vendor risk label’iga ko‘r-ko‘rona tayanmang. Analitik yozuvi qayta ko‘rib chiqishga yaroqli bo‘lsin: query scope, vaqt, source, natija, cheklov va keyingi qadam.",
          "Аналитик SOC, рассматривая алерт, оценивает источник сигнала, критичность актива, влияние на пользователя и достоверность доказательств. Логи в SIEM могут поступать с конечных точек, из identity, DNS, прокси, межсетевого экрана, cloud control plane и приложений; парсинг, часовой пояс, хранение и покрытие различаются. Отсутствие события не всегда означает отсутствие активности.\n\nПри триаже фиксируйте факт, предположение и неизвестное отдельно. Серьёзность алерта основывается на бизнес-влиянии и вероятности; не полагайтесь слепо на один IOC или вендорскую метку риска. Запись аналитика должна быть пригодна для повторного рассмотрения: scope запроса, время, источник, результат, ограничения и следующий шаг.",
          "A SOC analyst reviewing an alert assesses the signal source, asset criticality, user impact, and evidence reliability. SIEM logs may come from endpoints, identity, DNS, proxy, firewall, cloud control plane, and applications; parsing, timezone, retention, and coverage vary. The absence of an event does not always mean the absence of activity.\n\nDuring triage, record facts, assumptions, and unknowns separately. Alert severity is based on business impact and likelihood; don't blindly rely on a single IOC or vendor risk label. An analyst's notes should be fit for re-review: query scope, time, source, outcome, limitations, and next step."
        ),
        example: t(
          "Case note: alert ID / UTC window / asset owner / source logs / verified facts / hypotheses / decision / escalation.",
          "Заметка по кейсу: alert ID / UTC window / asset owner / source logs / verified facts / hypotheses / decision / escalation.",
          "Case note: alert ID / UTC window / asset owner / source logs / verified facts / hypotheses / decision / escalation."
        ),
        explanation: t(
          "Sintetik identifikatorlardan foydalaning. Ishlab chiqarish SIEM loglari maxfiy va shaxsiy ma’lumot bo‘lishi mumkin.",
          "Используйте синтетические идентификаторы. Производственные логи SIEM могут содержать конфиденциальные и персональные данные.",
          "Use synthetic identifiers. Production SIEM logs may contain confidential and personal data."
        ),
        prompt: t(
          "Tasdiqlangan kuzatuvni ehtimoliy izohdan ajratib yozish nima uchun kerak?",
          "Зачем нужно отделять подтверждённое наблюдение от вероятного объяснения?",
          "Why is it necessary to separate a confirmed observation from a probable explanation?"
        ),
        answers: ["dalil va taxminni farqlash", "evidence from hypothesis", "dalil"]
      },
      {
        title: t(
          "2. Alert triage, severity va escalation",
          "2. Триаж алертов, серьёзность и эскалация",
          "2. Alert triage, severity, and escalation"
        ),
        content: t(
          "Triage playbook avval alertni takrorlash, vaqt/scope tasdiqlash, asset owner va criticality aniqlash, parallel signal qidirish, so‘ng containment vakolatini tekshiradi. Severity’da likelihood, impact, exposure, privilege, data sensitivity va ongoing activity hisobga olinadi. False positive sababini qayd eting, lekin detectionni shunchaki o‘chirib qo‘ymang.\n\nEscalation threshold oldindan kelishilgan bo‘lsin: privileged account, regulated data, lateral movement indicator, business-critical host yoki confirmed exfiltration kabi signal tezkor incident commander’ga yuborilishi mumkin. SOC L1/L2/L3 chegarasi tashkilotga qarab farq qiladi; handoff’da kontekst, dalil, noaniqlik va so‘ralgan qarorni bering.",
          "Плейбук триажа сначала воспроизводит алерт, подтверждает время/scope, определяет владельца актива и критичность, ищет параллельные сигналы, а затем проверяет полномочия на containment. В серьёзности учитываются вероятность, воздействие, экспозиция, привилегии, чувствительность данных и текущая активность. Фиксируйте причину ложного срабатывания, но не отключайте детектирование просто так.\n\nПорог эскалации должен быть согласован заранее: такие сигналы, как привилегированная учётная запись, регулируемые данные, индикатор lateral movement, бизнес-критичный хост или подтверждённая эксфильтрация, могут немедленно направляться incident commander. Граница SOC L1/L2/L3 различается в зависимости от организации; при передаче (handoff) указывайте контекст, доказательства, неопределённость и требуемое решение.",
          "A triage playbook first reproduces the alert, confirms the time/scope, identifies the asset owner and criticality, searches for parallel signals, and then checks containment authority. Severity accounts for likelihood, impact, exposure, privilege, data sensitivity, and ongoing activity. Record the reason for a false positive, but don't simply disable the detection.\n\nEscalation thresholds should be agreed upon in advance: signals such as a privileged account, regulated data, a lateral movement indicator, a business-critical host, or confirmed exfiltration may be sent immediately to the incident commander. The SOC L1/L2/L3 boundary varies by organization; in a handoff, provide context, evidence, uncertainty, and the decision being requested."
        ),
        example: t(
          "Triage matrix: severity / evidence confidence / affected assets / business owner / containment authority / SLA.",
          "Матрица триажа: severity / evidence confidence / affected assets / business owner / containment authority / SLA.",
          "Triage matrix: severity / evidence confidence / affected assets / business owner / containment authority / SLA."
        ),
        explanation: t(
          "Matrisa namunaviy; tashkilotning incident policy va regulatory reporting muddatlari ustun.",
          "Матрица приведена в качестве примера; приоритет имеют политика инцидентов организации и регуляторные сроки отчётности.",
          "The matrix is illustrative; the organization's incident policy and regulatory reporting deadlines take precedence."
        ),
        prompt: t(
          "Keyingi tahlilga yuborishda dalil va noaniqlikni beradigan jarayon?",
          "Процесс передачи дела на дальнейший анализ вместе с доказательствами и неопределённостью?",
          "What is the process of forwarding a case for further analysis along with evidence and uncertainty?"
        ),
        answers: ["escalation", "handoff", "eskalatsiya"]
      },
      {
        title: t(
          "3. Log normalizatsiyasi, vaqt va korrelyatsiya",
          "3. Нормализация логов, время и корреляция",
          "3. Log normalization, time, and correlation"
        ),
        content: t(
          "SIEM normalizatsiyasi turli log manbalarini umumiy field’lar — timestamp, user, host, source/destination, action, result — ko‘rinishida izlashga imkon beradi. Parser drift, locale, missing field va device clock noto‘g‘riligini tekshiring. UTCga normallashtirish timeline tuzishni yengillashtiradi, lekin original timestamp va timezone offset saqlanishi kerak.\n\nKorrelyatsiya qoidasi bir necha signalni bog‘lashi mumkin, ammo event ID yoki IP almashishi attributionni isbotlamaydi. Entity resolution’da NAT, shared device, VPN egress, DHCP lease va service account’ni hisobga oling. Katta query’ni chegaralangan vaqt va index bilan bajaring; PII field’larni minimallashtirib, audit qiling.",
          "Нормализация в SIEM позволяет искать по общим полям — timestamp, user, host, source/destination, action, result — независимо от источника лога. Проверяйте дрейф парсера, локаль, отсутствующие поля и неточность часов устройства. Нормализация к UTC упрощает построение временной шкалы, но исходный timestamp и смещение часового пояса должны сохраняться.\n\nПравило корреляции может связывать несколько сигналов, но совпадение event ID или IP не доказывает атрибуцию. При разрешении сущностей учитывайте NAT, общие устройства, VPN egress, аренду DHCP и служебные учётные записи. Выполняйте крупные запросы с ограниченным временным диапазоном и индексом; минимизируйте поля PII и ведите аудит.",
          "SIEM normalization allows searching across common fields — timestamp, user, host, source/destination, action, result — regardless of log source. Check for parser drift, locale, missing fields, and device clock inaccuracy. Normalizing to UTC makes building a timeline easier, but the original timestamp and timezone offset must be preserved.\n\nA correlation rule can link several signals, but matching event IDs or IPs does not prove attribution. In entity resolution, account for NAT, shared devices, VPN egress, DHCP leases, and service accounts. Run large queries with a bounded time range and index; minimize PII fields and keep an audit trail."
        ),
        example: t(
          "Timeline: source event time + ingest time + timezone + host clock status + parser version.",
          "Временная шкала: source event time + ingest time + timezone + host clock status + parser version.",
          "Timeline: source event time + ingest time + timezone + host clock status + parser version."
        ),
        explanation: t(
          "Ingest delay va source timestamp farqini alohida saqlang; kutilmagan log eksportini umumiy kanalda tarqatmang.",
          "Сохраняйте отдельно разницу между задержкой ingest и исходным timestamp; не распространяйте непредвиденный экспорт логов по общим каналам.",
          "Keep the difference between ingest delay and source timestamp recorded separately; do not share an unexpected log export over a general channel."
        ),
        prompt: t(
          "Xalqaro timeline’larni bir xil taqqoslashga qulay standart vaqt zonasi?",
          "Какой стандартный часовой пояс удобен для единообразного сравнения международных временных шкал?",
          "Which standard timezone is convenient for consistently comparing international timelines?"
        ),
        answers: ["utc"]
      },
      {
        title: t(
          "4. Detection engineering va MITRE ATT&CK",
          "4. Detection engineering и MITRE ATT&CK",
          "4. Detection engineering and MITRE ATT&CK"
        ),
        content: t(
          "Detection use case himoya maqsadi, data source, analytics, threshold, exception, response va test bilan belgilanadi. ATT&CK texnika taksonomiyasi kuzatilgan xatti-harakatni tasniflashga yordam beradi; ATT&CK mapping hujum bo‘lganini yoki detection qamrovi to‘liq ekanini isbotlamaydi. Analytics aniqlangan data source va telemetry retention’ga bog‘liq.\n\nQoidani sintetik fixture bilan test qiling: normal, benign edge case va suspicious pattern. Precision, recall, alert volume, time-to-detect va missed coverage’ni o‘lchang. Allowlistni owner va expiry bilan boshqaring, aks holda hujumchi unga yashirinishi mumkin. Detection o‘zgarishini peer review va version control’dan o‘tkazing.",
          "Детектирующий use case определяется целью защиты, источником данных, аналитикой, порогом, исключениями, реагированием и тестом. Таксономия техник ATT&CK помогает классифицировать наблюдаемое поведение; сопоставление с ATT&CK не доказывает, что атака произошла, или что покрытие детектирования полное. Аналитика зависит от определённого источника данных и срока хранения телеметрии.\n\nТестируйте правило на синтетических фикстурах: нормальных, граничных безобидных случаях и подозрительных паттернах. Измеряйте точность (precision), полноту (recall), объём алертов, время до обнаружения и пропущенное покрытие. Управляйте allowlist с указанием владельца и срока действия, иначе злоумышленник может скрыться за ним. Пропускайте изменения детектирования через peer review и систему контроля версий.",
          "A detection use case is defined by protection goal, data source, analytics, threshold, exceptions, response, and test. The ATT&CK technique taxonomy helps classify observed behavior; an ATT&CK mapping does not prove an attack occurred or that detection coverage is complete. Analytics depend on the identified data source and telemetry retention.\n\nTest a rule against synthetic fixtures: normal, benign edge cases, and suspicious patterns. Measure precision, recall, alert volume, time-to-detect, and missed coverage. Manage allowlists with an owner and expiry, otherwise an attacker may hide behind them. Run detection changes through peer review and version control."
        ),
        example: t(
          "Rule record: purpose / ATT&CK technique / required fields / logic summary / known false positives / test fixture / owner / expiry.",
          "Запись правила: purpose / ATT&CK technique / required fields / logic summary / known false positives / test fixture / owner / expiry.",
          "Rule record: purpose / ATT&CK technique / required fields / logic summary / known false positives / test fixture / owner / expiry."
        ),
        explanation: t(
          "Bu detection hujjati shabloni; real logga qarshi ishlab chiqarish qoidasi qo‘llash uchun approval va staged rollout talab qilinadi.",
          "Это шаблон документации детектирования; применение production-правила к реальным логам требует утверждения и поэтапного rollout.",
          "This is a detection documentation template; applying a production rule against real logs requires approval and a staged rollout."
        ),
        prompt: t(
          "ATT&CK nimani standartlashga yordam beradi?",
          "Что помогает стандартизировать ATT&CK?",
          "What does ATT&CK help standardize?"
        ),
        answers: ["taktika va texnika taksonomiyasi", "tactics and techniques", "xatti-harakat taksonomiyasi"]
      },
      {
        title: t(
          "5. Incident response: tayyorgarlik, aniqlash va tiklash",
          "5. Реагирование на инциденты: подготовка, обнаружение и восстановление",
          "5. Incident response: preparation, detection, and recovery"
        ),
        content: t(
          "NIST SP 800-61 Rev. 3 incident response’ni kengroq cybersecurity risk management bilan bog‘laydi. Tashkilot tayyorgarlikda role, escalation, contact, evidence, legal/privacy review, backup, communication channel va exercise’ni belgilaydi. Hodisa davomida scope, containment, eradication, recovery va lessons learned iterativ kechishi mumkin; real vaziyat qat’iy chiziqli bo‘lmaydi.\n\nContainment biznes ta’siri va dalil saqlash bilan muvozanatlanadi. Endpointni izolyatsiya qilish yoki account’ni bloklashni faqat vakolatli incident lead bilan bajaring. Recovery’da monitoring heightened bo‘lsin, credential rotation va persistence check siyosatga muvofiq bajarilsin. Har qaror, vaqt, owner va asosni yozing; regulator yoki mijozga xabar berishni huquqiy egalar bilan muvofiqlashtiring.",
          "NIST SP 800-61 Rev. 3 связывает реагирование на инциденты с более широким управлением киберрисками. В рамках подготовки организация определяет роли, эскалацию, контакты, порядок работы с доказательствами, юридический/приватности review, резервное копирование, каналы связи и учения. В ходе инцидента scope, containment, устранение (eradication), восстановление и извлечённые уроки могут проходить итеративно; реальная ситуация не бывает строго линейной.\n\nContainment балансируется между бизнес-влиянием и сохранением доказательств. Изоляцию конечной точки или блокировку учётной записи выполняйте только совместно с уполномоченным incident lead. На этапе recovery мониторинг должен быть усилен, ротация учётных данных и проверка persistence — выполняться согласно политике. Фиксируйте каждое решение, время, владельца и обоснование; уведомление регулятора или клиента согласуйте с юридическими владельцами.",
          "NIST SP 800-61 Rev. 3 links incident response to broader cybersecurity risk management. In preparation, an organization defines roles, escalation, contacts, evidence handling, legal/privacy review, backups, communication channels, and exercises. During an incident, scope, containment, eradication, recovery, and lessons learned can proceed iteratively; the real situation is never strictly linear.\n\nContainment is balanced against business impact and evidence preservation. Isolate an endpoint or lock an account only together with an authorized incident lead. During recovery, monitoring should be heightened, and credential rotation and persistence checks should be carried out per policy. Record every decision, time, owner, and rationale; coordinate notifying a regulator or customer with legal owners."
        ),
        example: t(
          "IR record: detection / scope / decisions / approvals / containment / recovery checks / communications / follow-up.",
          "Запись IR: detection / scope / decisions / approvals / containment / recovery checks / communications / follow-up.",
          "IR record: detection / scope / decisions / approvals / containment / recovery checks / communications / follow-up."
        ),
        explanation: t(
          "Runbook tashkilotning vakolat zanjiri va tegishli qonunlarni almashtirmaydi. Mashqda faqat sun’iy hodisa va izolatsiyalangan resurs ishlating.",
          "Runbook не заменяет цепочку полномочий организации и применимые законы. В упражнении используйте только искусственный инцидент и изолированный ресурс.",
          "A runbook does not replace the organization's chain of authority and applicable laws. In exercises, use only a synthetic incident and an isolated resource."
        ),
        prompt: t(
          "NIST incident response amaliyotida hodisadan keyingi yaxshilash bosqichi?",
          "Этап улучшения после инцидента в практике реагирования NIST?",
          "What is the post-incident improvement stage in NIST incident response practice?"
        ),
        answers: ["lessons learned", "takomillashtirish", "improvement"]
      },
      {
        title: t(
          "6. Threat hunting: gipoteza, scope va xavfsiz tekshiruv",
          "6. Threat hunting: гипотеза, scope и безопасная проверка",
          "6. Threat hunting: hypothesis, scope, and safe investigation"
        ),
        content: t(
          "Threat hunting oldindan belgilangan gipotezani mavjud telemetry’da tekshiradi: masalan, noma’lum service account odatiy bo‘lmagan hostga kirganmi? Gipoteza kuzatiladigan signal, data source, vaqt oynasi, scope va kutilgan benign izohlarni ko‘rsatishi kerak. Hunt natijasi “topilmadi” bo‘lsa, telemetry coverage yetarli bo‘lmaganini ham ayting.\n\nHunt query’larini chegaralangan datasetda, read-only usulda bajaring; faol exploit, credential sinash yoki ruxsatsiz tizimga kirish hunt emas. PII minimallashtiring, case ID bilan audit qiling va topilmani detection, response runbook yoki risk register’ga aylantiring. Senior hunt program coverage, repeatability va business riskni o‘lchaydi.",
          "Threat hunting проверяет заранее сформулированную гипотезу на имеющейся телеметрии: например, заходила ли неизвестная служебная учётная запись на нехарактерный хост? Гипотеза должна указывать наблюдаемый сигнал, источник данных, временное окно, scope и ожидаемые безобидные объяснения. Если результат hunt — «не найдено», также укажите, что покрытие телеметрии может быть недостаточным.\n\nВыполняйте hunt-запросы на ограниченном наборе данных в режиме только для чтения; активная эксплуатация, подбор учётных данных или несанкционированный доступ к системе — это не hunting. Минимизируйте PII, ведите аудит с case ID и превращайте находку в детектирование, response runbook или запись в реестре рисков. Senior-программа hunt измеряет покрытие, повторяемость и бизнес-риск.",
          "Threat hunting tests a pre-formed hypothesis against existing telemetry: for example, did an unknown service account log into an atypical host? The hypothesis should specify the observable signal, data source, time window, scope, and expected benign explanations. If the hunt result is \"not found,\" also state whether telemetry coverage was sufficient.\n\nRun hunt queries on a bounded dataset in a read-only manner; active exploitation, credential guessing, or unauthorized system access is not hunting. Minimize PII, keep an audit trail with a case ID, and turn findings into detections, a response runbook, or a risk register entry. A senior hunt program measures coverage, repeatability, and business risk."
        ),
        example: t(
          "Hunt brief: hypothesis / scope / data available / query intent / benign explanations / findings / limits / follow-up.",
          "Краткое описание hunt: hypothesis / scope / data available / query intent / benign explanations / findings / limits / follow-up.",
          "Hunt brief: hypothesis / scope / data available / query intent / benign explanations / findings / limits / follow-up."
        ),
        explanation: t(
          "Faoliyat faqat tashkilot tasdiqlagan telemetriya va scope’da bo‘lishi kerak. Ishlab chiqarish query’larini resurs cheklovi va privacy talabiga moslang.",
          "Деятельность должна проводиться только в рамках телеметрии и scope, утверждённых организацией. Согласуйте production-запросы с ограничениями ресурсов и требованиями конфиденциальности.",
          "Activity must stay within telemetry and scope approved by the organization. Align production queries with resource limits and privacy requirements."
        ),
        prompt: t(
          "Hunt boshlanishida tekshiriladigan aniq taxmin nima deb ataladi?",
          "Как называется конкретное предположение, проверяемое в начале hunt?",
          "What is the specific assumption tested at the start of a hunt called?"
        ),
        answers: ["gipoteza", "hypothesis"]
      },
      {
        title: t(
          "7. Dalil, chain of custody va maxfiy loglar",
          "7. Доказательства, chain of custody и конфиденциальные логи",
          "7. Evidence, chain of custody, and confidential logs"
        ),
        content: t(
          "Digital evidence yig‘ishda scope, vakolat, vaqt, collector, source, method, hash va storage access’ni qayd eting. Hash fayl keyin o‘zgarganini aniqlashga yordam beradi, ammo hash manbasining haqiqiyligini o‘zi isbotlamaydi. Chain of custody’da har transfer va ko‘rish yoziladi; originalni read-only saqlab, tahlil nusxasida ishlang.\n\nLoglarda shaxsiy ma’lumot, authentication token, cookie, email va xodim faoliyati bo‘lishi mumkin. Need-to-know access, retention, encryption, redaction va legal hold qoidalariga amal qiling. Dalilni chat, shaxsiy cloud yoki noma’lum AI xizmatiga yuklamang. Hisobotda xulosa darajasi, cheklov va alternativ izohlarni yozing.",
          "При сборе цифровых доказательств фиксируйте scope, полномочия, время, сборщика, источник, метод, хэш и доступ к хранилищу. Хэш-файл помогает выявить последующее изменение, но сам по себе не доказывает подлинность источника. В chain of custody записывается каждая передача и просмотр; храните оригинал только для чтения, а работайте с аналитической копией.\n\nВ логах могут содержаться персональные данные, токены аутентификации, cookie, электронная почта и действия сотрудников. Соблюдайте правила доступа need-to-know, хранения, шифрования, редактирования (redaction) и legal hold. Не загружайте доказательства в чат, личное облако или неизвестный ИИ-сервис. В отчёте указывайте степень уверенности выводов, ограничения и альтернативные объяснения.",
          "When collecting digital evidence, record scope, authority, time, collector, source, method, hash, and storage access. A hash file helps detect subsequent changes, but on its own does not prove the authenticity of the source. Chain of custody records every transfer and viewing; keep the original read-only and work from an analysis copy.\n\nLogs may contain personal data, authentication tokens, cookies, email, and employee activity. Follow need-to-know access, retention, encryption, redaction, and legal hold rules. Do not upload evidence to a chat, personal cloud, or unknown AI service. In the report, record the confidence level of conclusions, limitations, and alternative explanations."
        ),
        example: t(
          "Evidence manifest: case ID / file name / SHA-256 / collected UTC / collector role / source / access log / retention date.",
          "Манифест доказательств: case ID / file name / SHA-256 / collected UTC / collector role / source / access log / retention date.",
          "Evidence manifest: case ID / file name / SHA-256 / collected UTC / collector role / source / access log / retention date."
        ),
        explanation: t(
          "Bu sintetik manifest shabloni. Haqiqiy dalillar faqat tasdiqlangan evidence repository’da saqlanadi.",
          "Это синтетический шаблон манифеста. Реальные доказательства хранятся только в утверждённом хранилище доказательств.",
          "This is a synthetic manifest template. Real evidence is stored only in an approved evidence repository."
        ),
        prompt: t(
          "Dalilni qabul qilishdan tahlilgacha kimda bo‘lganini qayd etish jarayoni?",
          "Процесс документирования того, у кого находилось доказательство от получения до анализа?",
          "What is the process of documenting who had custody of evidence from collection through analysis?"
        ),
        answers: ["chain of custody", "dalil zanjiri"]
      },
      {
        title: t(
          "8. Senior SOC: metrikalar, coverage va jamoa samaradorligi",
          "8. Senior SOC: метрики, покрытие и эффективность команды",
          "8. Senior SOC: metrics, coverage, and team effectiveness"
        ),
        content: t(
          "Senior SOC lead alert hajmini kamaytirishni yagona maqsad qilmaydi; detection coverage, median time-to-triage, time-to-contain, false-positive cost, missed incident review va analyst workloadni birga o‘lchaydi. Metrika o‘yinga aylansa, xodimlar noto‘g‘ri xulqni optimallashtirishi mumkin. Har indikator nimani anglatmasligini ham yozing.\n\nUse-case portfolio’da risk owner, data source, test, version, expiry, escalation va audit evidence bo‘lsin. Tabletop exercise’da executive, IT, legal, privacy, communications va vendor rollarini qo‘shing. Senior analitik rahbariyatga texnik jargon emas, biznes ta’siri, qaror varianti va qolgan riskni taqdim etadi; aniqlik va halollik ishonchni oshiradi.",
          "Senior-руководитель SOC не ставит единственной целью снижение объёма алертов; он измеряет вместе покрытие детектирования, медианное время до триажа, время до containment, стоимость ложных срабатываний, разбор пропущенных инцидентов и нагрузку аналитиков. Если метрика превращается в игру, сотрудники могут начать оптимизировать неверное поведение. Указывайте также, чего каждый показатель не отражает.\n\nВ портфеле use-case должны быть владелец риска, источник данных, тест, версия, срок действия, эскалация и доказательства аудита. В tabletop-учения включайте роли руководства, IT, юристов, приватности, коммуникаций и вендоров. Senior-аналитик представляет руководству не технический жаргон, а бизнес-влияние, варианты решения и оставшийся риск; точность и честность повышают доверие.",
          "A senior SOC lead does not treat reducing alert volume as the sole goal; they measure detection coverage, median time-to-triage, time-to-contain, false-positive cost, missed-incident review, and analyst workload together. If a metric turns into a game, staff may start optimizing the wrong behavior. Also note what each indicator does not capture.\n\nA use-case portfolio should include risk owner, data source, test, version, expiry, escalation, and audit evidence. Include executive, IT, legal, privacy, communications, and vendor roles in a tabletop exercise. A senior analyst presents leadership with business impact, decision options, and residual risk rather than technical jargon; precision and honesty build trust."
        ),
        example: t(
          "SOC review: risk coverage / detection health / response SLA / analyst capacity / privacy impact / overdue actions.",
          "Обзор SOC: risk coverage / detection health / response SLA / analyst capacity / privacy impact / overdue actions.",
          "SOC review: risk coverage / detection health / response SLA / analyst capacity / privacy impact / overdue actions."
        ),
        explanation: t(
          "Metrikalarni agregat shaklda ishlating; xodimlarni bir ko‘rsatkich bilan individual jazolash incident reportingni susaytirishi mumkin.",
          "Используйте метрики в агрегированном виде; индивидуальное наказание сотрудников по одному показателю может снизить качество отчётности об инцидентах.",
          "Use metrics in aggregate form; punishing individual staff based on a single indicator can undermine incident reporting."
        ),
        prompt: t(
          "Alert paydo bo‘lishidan tahlilchi ko‘rib chiqishigacha bo‘lgan vaqt metrikasi?",
          "Метрика времени от появления алерта до его рассмотрения аналитиком?",
          "What is the metric for the time from an alert appearing to an analyst reviewing it called?"
        ),
        answers: ["time to triage", "time-to-triage", "triage vaqti"]
      }
    ]
  }),
  book({
    slug: "security-engineering-appsec",
    title: t("Xavfsizlik muhandisligi va secure software lifecycle", "Инженерия безопасности и secure software lifecycle", "Security engineering and the secure software lifecycle"),
    summary: t(
      "Asset/risk, threat modeling, IAM, secrets, secure code review, vulnerability management, OWASP, cloud boundary va assurance bo‘yicha himoyaviy darslik.",
      "Защитный курс об активах/риске, threat modeling, IAM, секретах, secure code review, управлении уязвимостями, OWASP, границах облака и assurance.",
      "A defensive course on assets/risk, threat modeling, IAM, secrets, secure code review, vulnerability management, OWASP, cloud boundaries, and assurance."
    ),
    category: "security", difficulty: "hard", hours: 38,
    labPlan: t(
      "Faqat berilgan kod parchasi, SBOM, threat model va sintetik findinglarda 8 ta xavfsiz design/review mashqi.",
      "8 упражнений по безопасному дизайну/ревью только на предоставленных фрагментах кода, SBOM, threat model и синтетических находках.",
      "8 secure design/review exercises using only the provided code snippets, SBOM, threat model, and synthetic findings."
    ),
    references: [
      reference(t("OWASP Application Security Verification Standard", "OWASP Application Security Verification Standard", "OWASP Application Security Verification Standard"), "https://owasp.org/www-project-application-security-verification-standard/"),
      reference(t("OWASP Top 10", "OWASP Top 10", "OWASP Top 10"), "https://owasp.org/www-project-top-ten/"),
      reference(t("NIST SSDF SP 800-218", "NIST SSDF SP 800-218", "NIST SSDF SP 800-218"), "https://csrc.nist.gov/pubs/sp/800/218/final"),
      reference(t("CIS Controls v8.1", "CIS Controls v8.1", "CIS Controls v8.1"), "https://www.cisecurity.org/controls/cis-controls-list")
    ],
    chapters: [
      {
        title: t("1. Asset inventarizatsiyasi, risk va threat modeling", "1. Инвентаризация активов, риск и threat modeling", "1. Asset inventory, risk, and threat modeling"),
        content: t(
          "Xavfsizlik muhandisligi business asset, data flow, actor, trust boundary, abuse case va mumkin bo‘lgan impact’ni aniqlashdan boshlanadi. Threat model’da STRIDE kabi framework fikrni tizimlashtiradi, lekin risk scoring qaror o‘rnini bosmaydi. Data classification, exposure, privilege, exploitability, business impact va existing control’larni hujjatlashtiring.\n\nModelni arxitektura o‘zgarganda yangilang; diagramma owner va review date’ga ega bo‘lsin. Har risk uchun treatment — mitigate, accept, transfer yoki avoid — va risk owner yozilsin. “Xavfsiz” degan umumiy da’vo o‘rniga scope, assumptions va residual riskni ochiq qiling.",
          "Инженерия безопасности начинается с выявления бизнес-активов, потоков данных, акторов, границ доверия, abuse case и возможного воздействия. В threat model такой фреймворк, как STRIDE, упорядочивает мышление, но оценка риска (risk scoring) не заменяет решение. Документируйте классификацию данных, экспозицию, привилегии, эксплуатируемость, бизнес-воздействие и существующие меры контроля.\n\nОбновляйте модель при изменении архитектуры; у диаграммы должны быть владелец и дата пересмотра. Для каждого риска указывайте treatment — mitigate, accept, transfer или avoid — и risk owner. Вместо общего утверждения «безопасно» открыто раскрывайте scope, допущения и остаточный риск.",
          "Security engineering begins by identifying business assets, data flows, actors, trust boundaries, abuse cases, and potential impact. In a threat model, a framework such as STRIDE structures the thinking, but risk scoring does not replace a decision. Document data classification, exposure, privilege, exploitability, business impact, and existing controls.\n\nUpdate the model whenever the architecture changes; the diagram should have an owner and a review date. For each risk, record the treatment — mitigate, accept, transfer, or avoid — and the risk owner. Instead of a blanket claim of being \"secure,\" disclose the scope, assumptions, and residual risk openly."
        ),
        example: t(
          "Threat model: asset → data flow → trust boundary → threat scenario → existing controls → residual risk → owner.",
          "Threat model: asset → data flow → trust boundary → threat scenario → existing controls → residual risk → owner.",
          "Threat model: asset → data flow → trust boundary → threat scenario → existing controls → residual risk → owner."
        ),
        explanation: t(
          "Faqat sintetik arxitektura va data ishlating. Threat model eksploit qo‘llanmasi emas, himoyani rejalash vositasidir.",
          "Используйте только синтетическую архитектуру и данные. Threat model — это не руководство по эксплойтам, а инструмент планирования защиты.",
          "Use only synthetic architecture and data. A threat model is not an exploitation guide; it is a defense-planning tool."
        ),
        prompt: t(
          "Tizim ichida ishonch darajasi yoki security control o‘zgaradigan chegara?",
          "Граница внутри системы, на которой меняется уровень доверия или средства контроля безопасности?",
          "A boundary within a system where the level of trust or security controls changes?"
        ),
        answers: ["trust boundary", "ishonch chegarasi"]
      },
      {
        title: t("2. Identity, access control va secret lifecycle", "2. Идентификация, контроль доступа и жизненный цикл секретов", "2. Identity, access control, and secret lifecycle"),
        content: t(
          "Authentication identity’ni tasdiqlaydi, authorization unga ruxsat berilgan amalni belgilaydi. RBAC role asosida, ABAC attribute/context asosida qaror qabul qiladi. Least privilege, separation of duties, MFA, privileged access management va access review’ni riskka mos qatlamlang. Deny/allow qarorini server-side qo‘llang; UI’da tugmani yashirish authorization emas.\n\nCredential, API key va signing key’ni source, image, log, ticket va chatga qo‘ymang. Secret manager, short-lived credential, rotation, scoped permission va audit log ishlating. Secret sizib chiqsa, faqat repository’dan o‘chirish yetarli emas — credentialni revoke/rotate qiling, loglarni tekshiring va incidentni qayd eting.",
          "Authentication подтверждает идентичность, authorization определяет разрешённое ей действие. RBAC принимает решение на основе роли, ABAC — на основе атрибутов/контекста. Выстраивайте least privilege, separation of duties, MFA, privileged access management и access review по уровням, соответствующим риску. Применяйте решение deny/allow на стороне сервера; скрытие кнопки в UI — это не authorization.\n\nНе размещайте учётные данные, API-ключи и ключи подписи в исходном коде, образах, логах, тикетах и чатах. Используйте secret manager, краткоживущие учётные данные, ротацию, ограниченные по области разрешения и журнал аудита. Если секрет был скомпрометирован, удаления из репозитория недостаточно — отзовите/ротируйте учётные данные, проверьте логи и зафиксируйте инцидент.",
          "Authentication confirms identity; authorization determines the action it is permitted to perform. RBAC decides based on role, ABAC on attributes/context. Layer least privilege, separation of duties, MFA, privileged access management, and access review to match risk. Enforce the deny/allow decision server-side; hiding a button in the UI is not authorization.\n\nDo not place credentials, API keys, or signing keys in source code, images, logs, tickets, or chat. Use a secret manager, short-lived credentials, rotation, scoped permissions, and audit logs. If a secret leaks, deleting it from the repository alone is not enough — revoke/rotate the credential, review the logs, and record the incident."
        ),
        example: t(
          "Access check: subject / action / resource / context / policy / decision / audit event.",
          "Access check: subject / action / resource / context / policy / decision / audit event.",
          "Access check: subject / action / resource / context / policy / decision / audit event."
        ),
        explanation: t(
          "Bu access control modeli; haqiqiy token yoki key’ni misolga kiritmang.",
          "Это модель контроля доступа; не включайте в пример реальные токены или ключи.",
          "This is an access control model; do not include real tokens or keys in the example."
        ),
        prompt: t(
          "Tizimga kim kirganini tekshiruvchi nazorat turi?",
          "Вид контроля, проверяющий, кто входит в систему?",
          "The type of control that verifies who is entering the system?"
        ),
        answers: ["authentication", "autentifikatsiya"]
      },
      {
        title: t("3. Secure coding, input validation va parametrli so‘rov", "3. Безопасное кодирование, валидация ввода и параметризованные запросы", "3. Secure coding, input validation, and parameterized queries"),
        content: t(
          "Kiritilgan ma’lumotni server-side schema va context bo‘yicha tekshiring; outputni HTML/SQL/shell kontekstiga mos encode qiling. SQL’da parametrli query, shell’da argument array, templating’da auto-escaping ishlating; blacklist xavfsizlik chegarasi emas. Authorization har object va action uchun tekshiriladi, object ID’ni bilish ruxsat bermaydi.\n\nError message ichki stack, secret yoki query’ni foydalanuvchiga ko‘rsatmasin, lekin serverda correlation ID va sanitize qilingan diagnostika bo‘lsin. Fuzz testingni faqat o‘z ilovangizning local/staging muhitida bajaring. Code review’da security regression test, dependency version va backwards compatibility’ni birga tekshiring.",
          "Проверяйте входные данные на стороне сервера по схеме и контексту; кодируйте вывод в соответствии с контекстом HTML/SQL/shell. В SQL используйте параметризованные запросы, в shell — массив аргументов, в шаблонизаторах — автоэкранирование; blacklist не является границей безопасности. Авторизация проверяется для каждого объекта и действия отдельно — знание object ID само по себе не даёт разрешения.\n\nСообщение об ошибке не должно показывать пользователю внутренний stack, секреты или запрос, но на сервере должны быть correlation ID и санитизированная диагностика. Проводите fuzz testing только в локальной/staging-среде вашего собственного приложения. В code review совместно проверяйте security regression test, версии зависимостей и обратную совместимость.",
          "Validate input server-side against a schema and context; encode output to match the HTML/SQL/shell context. Use parameterized queries in SQL, an argument array in shell, and auto-escaping in templating; a blacklist is not a security boundary. Authorization is checked for every object and action — knowing the object ID alone does not grant permission.\n\nAn error message should not expose the internal stack, secrets, or the query to the user, but the server should retain a correlation ID and sanitized diagnostics. Perform fuzz testing only in your own application's local/staging environment. In code review, check security regression tests, dependency versions, and backwards compatibility together."
        ),
        example: t(
          "Xavfsiz DB naqshi: SELECT id FROM accounts WHERE email = ?\nUnsafe naqsh: query = '... ' + user_input",
          "Xavfsiz DB naqshi: SELECT id FROM accounts WHERE email = ?\nUnsafe naqsh: query = '... ' + user_input",
          "Xavfsiz DB naqshi: SELECT id FROM accounts WHERE email = ?\nUnsafe naqsh: query = '... ' + user_input"
        ),
        explanation: t(
          "Misol string interpolation xavfini tushuntiradi; internetga ochiq ilovada testni faqat owner ruxsat bergan staging’da bajaring.",
          "Пример иллюстрирует опасность конкатенации строк; тестирование публично доступного приложения проводите только в staging-среде с разрешения владельца.",
          "The example illustrates the danger of string interpolation; test an internet-facing application only in a staging environment authorized by its owner."
        ),
        prompt: t(
          "SQL qiymatlarini query matnidan alohida uzatish usuli?",
          "Способ передачи значений SQL отдельно от текста запроса?",
          "The method of passing SQL values separately from the query text?"
        ),
        answers: ["parameterized query", "prepared statement", "parametrli so‘rov"]
      },
      {
        title: t("4. OWASP ASVS, authorization va web assurance", "4. OWASP ASVS, авторизация и web assurance", "4. OWASP ASVS, authorization, and web assurance"),
        content: t(
          "OWASP ASVS ilovaning verification talablarini risk va assurance darajasiga mos tanlash uchun ishlatiladi; u checklistni ko‘r-ko‘rona bajarishdan ko‘ra talabni arxitektura va testga bog‘lashni talab qiladi. Authentication, session, access control, input handling, crypto, error handling, logging va data protection’ni qamrab oling. OWASP Top 10 esa awareness ro‘yxati; barcha xavfsizlik talablarining o‘rnini bosmaydi.\n\nHar talab uchun evidence yozing: test, code review, configuration, owner va versiya. Regression testni CI’da bajaring, lekin production secret va customer data’ni CI fixture’ga ko‘chirmang. API’da object-level authorization, rate control, schema, version retirement va audit event’ni tekshiring.",
          "OWASP ASVS используется для выбора требований верификации приложения в соответствии с уровнем риска и assurance; он требует не слепого выполнения чек-листа, а увязки требования с архитектурой и тестами. Охватите authentication, session, access control, обработку ввода, криптографию, обработку ошибок, логирование и защиту данных. OWASP Top 10, в свою очередь, — это список осведомлённости (awareness); он не заменяет все требования безопасности.\n\nДля каждого требования фиксируйте evidence: тест, code review, конфигурацию, владельца и версию. Выполняйте регрессионные тесты в CI, но не переносите production-секреты и данные клиентов в CI fixture. В API проверяйте object-level authorization, контроль частоты запросов, схему, вывод версий из эксплуатации и события аудита.",
          "OWASP ASVS is used to select an application's verification requirements according to its risk and assurance level; it requires linking the requirement to architecture and tests rather than blindly completing a checklist. Cover authentication, session, access control, input handling, cryptography, error handling, logging, and data protection. OWASP Top 10, by contrast, is an awareness list; it does not replace the full set of security requirements.\n\nRecord evidence for each requirement: test, code review, configuration, owner, and version. Run regression tests in CI, but do not copy production secrets and customer data into CI fixtures. In APIs, check object-level authorization, rate control, schema, version retirement, and audit events."
        ),
        example: t(
          "Verification record: requirement ID / component / test method / expected result / evidence / exception owner.",
          "Verification record: requirement ID / component / test method / expected result / evidence / exception owner.",
          "Verification record: requirement ID / component / test method / expected result / evidence / exception owner."
        ),
        explanation: t(
          "OWASP hujjatlari versiyalanadi; loyihada ishlatilgan edition va talablarni aniq qayd eting.",
          "Документы OWASP версионируются; чётко фиксируйте, какое издание и какие требования использовались в проекте.",
          "OWASP documents are versioned; clearly record which edition and requirements were used in the project."
        ),
        prompt: t(
          "Ilova xavfsizlik nazoratlarini verification talablarida jamlaydigan OWASP loyiha?",
          "Проект OWASP, объединяющий меры контроля безопасности приложения в требованиях верификации?",
          "The OWASP project that consolidates application security controls into verification requirements?"
        ),
        answers: ["asvs", "owasp asvs"]
      },
      {
        title: t("5. Vulnerability management va patch risk", "5. Управление уязвимостями и риск патчей", "5. Vulnerability management and patch risk"),
        content: t(
          "Vulnerability management inventar, scan, vendor advisory, exploit evidence, exposure, business criticality, owner, remediation, validation va exception lifecycle’dan iborat. CVSS severity foydali signal, lekin tashkilot riskining tayyor javobi emas; internet exposure, asset, known exploitation, compensating control va change riskni hisobga oling.\n\nFindingni tuzatgandan keyin qayta tekshirib, versiya/config evidence saqlang. False positive yoki accepted risk uchun asos, approver, mitigation, expiry va qayta ko‘rish sanasi talab etiladi. Pentest yoki scanner faqat yozma scope va xavfsiz test sharoitida ishlatiladi; production tizimga ruxsatsiz exploit yoki credential test qilmang.",
          "Управление уязвимостями включает инвентаризацию, сканирование, рекомендации поставщика (vendor advisory), доказательства эксплойта, экспозицию, критичность для бизнеса, владельца, устранение, валидацию и жизненный цикл исключений. CVSS severity — полезный сигнал, но не готовый ответ об организационном риске; учитывайте экспозицию в интернете, актив, известную эксплуатацию, компенсирующие меры контроля и риск изменения.\n\nПосле устранения finding проведите повторную проверку и сохраните evidence о версии/конфигурации. Для false positive или принятого риска требуются обоснование, approver, мера смягчения, срок действия и дата пересмотра. Pentest или сканер используются только при наличии письменного scope и безопасных условий тестирования; не проводите несанкционированные эксплойты или проверку учётных данных на production-системе.",
          "Vulnerability management consists of inventory, scanning, vendor advisories, exploit evidence, exposure, business criticality, owner, remediation, validation, and exception lifecycle. CVSS severity is a useful signal, but not a ready-made answer for organizational risk; account for internet exposure, the asset, known exploitation, compensating controls, and change risk.\n\nAfter a finding is fixed, re-verify it and retain version/configuration evidence. A false positive or accepted risk requires justification, an approver, mitigation, an expiry, and a review date. A pentest or scanner is used only with a written scope and safe test conditions; do not perform unauthorized exploitation or credential testing against a production system."
        ),
        example: t(
          "Finding row: asset / component / evidence / severity / exposure / owner / due date / mitigation / verification.",
          "Finding row: asset / component / evidence / severity / exposure / owner / due date / mitigation / verification.",
          "Finding row: asset / component / evidence / severity / exposure / owner / due date / mitigation / verification."
        ),
        explanation: t(
          "Portfolio uchun sintetik finding ishlating; real customer vulnerability va exploit tafsilotini oshkor qilmang.",
          "Для портфолио используйте синтетические находки; не раскрывайте реальные уязвимости клиентов и детали эксплойтов.",
          "Use synthetic findings for a portfolio; do not disclose real customer vulnerabilities or exploit details."
        ),
        prompt: t(
          "Vulnerability tuzatilganini keyin qayta tekshirish bosqichi?",
          "Этап повторной проверки того, что уязвимость была устранена?",
          "The stage of re-verifying that a vulnerability has been fixed?"
        ),
        answers: ["verification", "qayta tekshirish", "remediation validation"]
      },
      {
        title: t("6. CI/CD, dependency va software supply chain", "6. CI/CD, зависимости и software supply chain", "6. CI/CD, dependencies, and the software supply chain"),
        content: t(
          "Secure SDLC talab, threat modeling, code review, test, dependency, build, release va vulnerability response’ni uzluksiz bog‘laydi. Lockfile, dependency update, provenance, signed artifact, SBOM va reproducible build ta’minot zanjiri ko‘rinishini oshiradi. CI runnerga minimal secret va network access bering; fork pull request’larida privileged token chiqmasin.\n\nSAST/DAST/SCA vositalari finding yaratadi, ammo false positive va coverage cheklovi bor. Gate’lar riskka mos va developer uchun actionable bo‘lsin. Build artifact’ni tasdiqlangan pipeline’dan deploy qiling; prod serverda qo‘lda rebuild qilish provenance’ni buzadi. Incidentga tayyorlik uchun dependency owner, supported version va patch SLA belgilang.",
          "Secure SDLC непрерывно связывает требования, threat modeling, code review, тесты, зависимости, сборку, релиз и реакцию на уязвимости. Lockfile, обновление зависимостей, provenance, подписанные артефакты, SBOM и воспроизводимая сборка повышают прозрачность цепочки поставок. Предоставляйте CI runner минимальный набор секретов и сетевого доступа; в pull request из форков привилегированные токены не должны передаваться.\n\nИнструменты SAST/DAST/SCA генерируют находки, но у них есть ограничения по false positive и покрытию. Гейты должны соответствовать риску и быть actionable для разработчика. Разворачивайте build-артефакт только из подтверждённого pipeline; ручная пересборка на prod-сервере нарушает provenance. Для готовности к инцидентам определите владельца зависимости, поддерживаемую версию и patch SLA.",
          "Secure SDLC continuously links requirements, threat modeling, code review, testing, dependencies, build, release, and vulnerability response. Lockfiles, dependency updates, provenance, signed artifacts, SBOM, and reproducible builds increase supply-chain visibility. Grant the CI runner minimal secrets and network access; privileged tokens must not be exposed in pull requests from forks.\n\nSAST/DAST/SCA tools generate findings, but they have false-positive and coverage limitations. Gates should match the risk and be actionable for the developer. Deploy build artifacts only from a verified pipeline; manually rebuilding on a production server breaks provenance. For incident readiness, define a dependency owner, supported version, and patch SLA."
        ),
        example: t(
          "Pipeline gate: tests → dependency review → secret scan → artifact provenance → approval → staged release.",
          "Pipeline gate: tests → dependency review → secret scan → artifact provenance → approval → staged release.",
          "Pipeline gate: tests → dependency review → secret scan → artifact provenance → approval → staged release."
        ),
        explanation: t(
          "Bu himoya pipeline naqshi. Real pipeline’da secret scan outputi ham credential yoki private pathni ko‘rsatishi mumkin.",
          "Это защитный шаблон pipeline. В реальном pipeline вывод secret scan также может содержать учётные данные или приватные пути.",
          "This is a defensive pipeline pattern. In a real pipeline, secret-scan output may also reveal credentials or private paths."
        ),
        prompt: t(
          "Dasturga kiritilgan component va dependency’lar ro‘yxati nima deb ataladi?",
          "Как называется список компонентов и зависимостей, включённых в программу?",
          "What is the list of components and dependencies included in a program called?"
        ),
        answers: ["sbom", "software bill of materials"]
      },
      {
        title: t("7. Kriptografiya, ma’lumotni himoya qilish va loglash", "7. Криптография, защита данных и логирование", "7. Cryptography, data protection, and logging"),
        content: t(
          "Encryption confidentiality’ni, hash integrity comparison’ni, MAC/signature esa integrity va origin verification’ni qo‘llaydi; ular bir-birini almashtirmaydi. TLS sertifikat lifecycle, key usage, trust chain va rotation bilan boshqariladi. Password’larni oddiy hash bilan emas, salt va mos password hashing algorithm bilan saqlang; key’larni data’dan alohida boshqaring.\n\nLogging’da zarur event va correlation’ni yozing, lekin password, token, full payment detail yoki keraksiz PII’ni yozmang. Retention, access, tamper detection va deletion talabini data owner bilan belgilang. Backup encryption’da restore paytida kalit mavjudligi va key compromise rejasini mashq qiling.",
          "Encryption обеспечивает конфиденциальность, hash — сравнение целостности, а MAC/signature — проверку целостности и подлинности источника; они не заменяют друг друга. TLS управляется жизненным циклом сертификата, использованием ключей, цепочкой доверия и ротацией. Храните пароли не через простой hash, а с солью (salt) и подходящим алгоритмом хеширования паролей; управляйте ключами отдельно от данных.\n\nВ логировании записывайте необходимые события и correlation, но не записывайте пароли, токены, полные платёжные реквизиты или ненужные PII. Определите требования к хранению, доступу, обнаружению подделки (tamper detection) и удалению совместно с владельцем данных. При шифровании резервных копий отрабатывайте доступность ключа во время restore и план на случай компрометации ключа.",
          "Encryption provides confidentiality, hashing provides integrity comparison, and MAC/signature provide integrity and origin verification; they do not substitute for one another. TLS is governed by certificate lifecycle, key usage, trust chain, and rotation. Store passwords not with plain hashing but with salt and an appropriate password-hashing algorithm; manage keys separately from data.\n\nIn logging, record the necessary events and correlation, but do not log passwords, tokens, full payment details, or unnecessary PII. Define retention, access, tamper detection, and deletion requirements together with the data owner. For backup encryption, rehearse key availability during restore and the plan for key compromise."
        ),
        example: t(
          "Log review: actor ID (pseudonymous) / action / resource class / decision / request ID / UTC time — secret values excluded.",
          "Log review: actor ID (pseudonymous) / action / resource class / decision / request ID / UTC time — secret values excluded.",
          "Log review: actor ID (pseudonymous) / action / resource class / decision / request ID / UTC time — secret values excluded."
        ),
        explanation: t(
          "Hashing shifrlash emas; private key va key materialni kod yoki audit logda ko‘rsatish mumkin emas.",
          "Хеширование не является шифрованием; приватный ключ и ключевой материал нельзя показывать в коде или журнале аудита.",
          "Hashing is not encryption; the private key and key material must never appear in code or audit logs."
        ),
        prompt: t(
          "Ma’lumotni asl kalitsiz tiklab bo‘lmaydigan matematik usul?",
          "Математический метод, не позволяющий восстановить данные без исходного ключа?",
          "The mathematical method that prevents recovering data without the original key?"
        ),
        answers: ["encryption", "shifrlash"]
      },
      {
        title: t("8. Senior security engineer: assurance va residual risk", "8. Senior security engineer: assurance и остаточный риск", "8. Senior security engineer: assurance and residual risk"),
        content: t(
          "Security engineer control’ni aniq requirement, owner, evidence va lifecycle bilan bog‘laydi. Architecture review’da security, privacy, reliability, accessibility, cost va operator workload orasidagi trade-off’ni yozing. Exceptionlar vaqtinchalik, risk owner tasdiqlagan, mitigation va expiry sanali bo‘lsin. Security debt backlog’da business impact va qayta ko‘rish mezoni ko‘rsatiladi.\n\nSenior muhandis auditga dalil tayyorlaydi, lekin nazorat ishlashini dalilsiz da’vo qilmaydi. Metrika coverage va remediation trendini ko‘rsatadi; “100% secure” kabi mutlaq da’vodan qoching. Incident va audit saboqlarini threat model, secure baseline, test va developer enablement’ga qaytaring. Tashqi testning scope’i, ruxsati va ta’sir limiti oldindan tasdiqlanadi.",
          "Security engineer связывает каждый control с конкретным требованием, владельцем, evidence и жизненным циклом. В architecture review фиксируйте trade-off между security, privacy, надёжностью, доступностью, стоимостью и нагрузкой на оператора. Исключения должны быть временными, утверждёнными risk owner, с мерой смягчения и сроком действия. В backlog security debt указываются влияние на бизнес и критерии пересмотра.\n\nSenior-инженер готовит доказательства для аудита, но не утверждает, что контроль работает, без evidence. Метрики показывают покрытие и тренд устранения; избегайте абсолютных утверждений вроде «100% безопасно». Возвращайте уроки из инцидентов и аудитов в threat model, secure baseline, тесты и обучение разработчиков. Scope, разрешение и лимит воздействия внешнего теста утверждаются заранее.",
          "A security engineer ties each control to a specific requirement, owner, evidence, and lifecycle. In an architecture review, record the trade-off between security, privacy, reliability, accessibility, cost, and operator workload. Exceptions should be temporary, approved by the risk owner, and carry mitigation and an expiry date. A security-debt backlog shows business impact and review criteria.\n\nA senior engineer prepares evidence for audits but does not claim a control works without evidence. Metrics show coverage and remediation trends; avoid absolute claims such as \"100% secure.\" Feed lessons from incidents and audits back into the threat model, secure baseline, tests, and developer enablement. The scope, authorization, and impact limit of external testing are approved in advance."
        ),
        example: t(
          "Assurance packet: requirement / owner / evidence link / test date / exception / residual risk / next review.",
          "Assurance packet: requirement / owner / evidence link / test date / exception / residual risk / next review.",
          "Assurance packet: requirement / owner / evidence link / test date / exception / residual risk / next review."
        ),
        explanation: t(
          "Evidence linklar access-controlled repository’da bo‘lsin; ommaviy portfolioda faqat sintetik material ko‘rsating.",
          "Ссылки на evidence должны находиться в репозитории с контролем доступа; в публичном портфолио показывайте только синтетические материалы.",
          "Evidence links should reside in an access-controlled repository; show only synthetic material in a public portfolio."
        ),
        prompt: t(
          "Riskni qabul qilish uchun yakuniy javobgarlikni kim oladi?",
          "Кто несёт конечную ответственность за принятие риска?",
          "Who bears the final accountability for accepting a risk?"
        ),
        answers: ["risk owner", "risk egasi"]
      }
    ]
  }),
  book({
    slug: "cloud-devsecops-operations",
    title: t("Cloud, DevOps va platforma xavfsizligi", "Безопасность облака, DevOps и платформ", "Cloud, DevOps, and platform security"),
    summary: t(
      "Cloud IAM, landing zone, network, IaC, containers, CI/CD, monitoring, backup va incident response’ni AWS/Azure/GCP kabi platformalarga ko‘chirishga tayyorlaydigan darslik.",
      "Курс, готовящий к переносу cloud IAM, landing zone, сети, IaC, контейнеров, CI/CD, мониторинга, резервного копирования и реагирования на инциденты на платформы, такие как AWS/Azure/GCP.",
      "A course that prepares you to carry cloud IAM, landing zones, networking, IaC, containers, CI/CD, monitoring, backup, and incident response over to platforms such as AWS/Azure/GCP."
    ),
    category: "security", difficulty: "hard", hours: 36,
    labPlan: t(
      "Cloud vendor konsoliga ulanish shart emas: berilgan sintetik IAM policy, IaC diff, container manifest va log event’larini audit qiling.",
      "Подключаться к консоли облачного провайдера не обязательно: аудируйте предоставленные синтетические IAM policy, IaC diff, манифесты контейнеров и события логов.",
      "There is no need to connect to a cloud vendor console: audit the provided synthetic IAM policies, IaC diffs, container manifests, and log events."
    ),
    references: [
      reference(t("AWS Well-Architected Framework — Security Pillar", "AWS Well-Architected Framework — Security Pillar", "AWS Well-Architected Framework — Security Pillar"), "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html"),
      reference(t("Microsoft Cloud Adoption Framework — security", "Microsoft Cloud Adoption Framework — security", "Microsoft Cloud Adoption Framework — security"), "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/secure/"),
      reference(t("Google Cloud Security Foundations Guide", "Google Cloud Security Foundations Guide", "Google Cloud Security Foundations Guide"), "https://cloud.google.com/architecture/security-foundations"),
      reference(t("AWS Certified Security — Specialty", "AWS Certified Security — Specialty", "AWS Certified Security — Specialty"), "https://aws.amazon.com/certification/certified-security-specialty/")
    ],
    chapters: [
      {
        title: t("1. Cloud shared responsibility va account landing zone", "1. Shared responsibility в облаке и account landing zone", "1. Cloud shared responsibility and account landing zones"),
        content: t(
          "Cloud provayder fizik infrastruktura va boshqariladigan qatlamning bir qismini himoya qiladi; customer identity, data, configuration va xizmat turiga qarab workload security uchun javobgar bo‘lib qoladi. Shared responsibility modeli IaaS/PaaS/SaaS’da farq qiladi; xizmat nomiga qarab taxmin qilmang.\n\nLanding zone account/subscription/project tuzilmasi, guardrail, network, logging, identity, key management va billing owner’ni bir standartga keltiradi. Sandbox, dev, staging va production chegarasi, region/data residency va emergency access oldindan belgilanadi. Root/owner akkauntni kundalik automation’da ishlatmang.",
          "Облачный провайдер защищает физическую инфраструктуру и часть управляемого слоя; заказчик остаётся ответственным за identity, данные, конфигурацию и безопасность workload в зависимости от типа сервиса. Модель shared responsibility различается для IaaS/PaaS/SaaS; не делайте предположений исходя только из названия сервиса.\n\nLanding zone приводит к единому стандарту структуру account/subscription/project, guardrail, сеть, логирование, identity, управление ключами и владельца биллинга. Границы sandbox, dev, staging и production, регион/резидентность данных и аварийный доступ определяются заранее. Не используйте root/owner-аккаунт в повседневной автоматизации.",
          "The cloud provider protects the physical infrastructure and part of the managed layer; the customer remains responsible for identity, data, configuration, and workload security depending on the service type. The shared responsibility model differs across IaaS/PaaS/SaaS; do not assume based on the service name alone.\n\nA landing zone brings the account/subscription/project structure, guardrails, network, logging, identity, key management, and billing owner to a single standard. The boundaries between sandbox, dev, staging, and production, region/data residency, and emergency access are defined in advance. Do not use the root/owner account in day-to-day automation."
        ),
        example: t(
          "Account map: org → environment account → workload → owner → data classification → logging destination.",
          "Account map: org → environment account → workload → owner → data classification → logging destination.",
          "Account map: org → environment account → workload → owner → data classification → logging destination."
        ),
        explanation: t(
          "Dizayn shabloni real account ID yoki cloud credentialni talab qilmaydi. Cloud resource inventari sensitive bo‘lishi mumkin.",
          "Шаблон дизайна не требует реального account ID или облачных учётных данных. Инвентарь облачных ресурсов может быть чувствительным.",
          "The design template does not require a real account ID or cloud credentials. A cloud resource inventory can be sensitive."
        ),
        prompt: t(
          "Cloud’da provayder va mijoz o‘rtasida taqsimlangan xavfsizlik javobgarligi modeli?",
          "Модель распределения ответственности за безопасность между провайдером и клиентом в облаке?",
          "The model that divides security responsibility between the provider and the customer in the cloud?"
        ),
        answers: ["shared responsibility", "shared responsibility model"]
      },
      {
        title: t("2. Cloud IAM, federation va workload identity", "2. Cloud IAM, федерация и workload identity", "2. Cloud IAM, federation, and workload identity"),
        content: t(
          "Cloud IAM role, policy, trust relationship va condition orqali principalga action/resource beradi. Wildcard action/resource convenience yaratadi, lekin blast radiusni oshiradi. Federation va short-lived workload identity statik key’ni kamaytiradi; trust policy’da issuer, audience, subject va environment cheklovini tekshiring.\n\nHuman admin MFA, JIT elevation, access review va break-glass monitoring bilan himoyalanadi. Service identity faqat zarur API action va resource’ga ega bo‘lsin; unused key, stale role va cross-account trust’ni inventar qiling. Deny policy va policy inheritance providerga xos bo‘lgani uchun effective access’ni test qiling.",
          "Cloud IAM предоставляет principal действия/ресурсы через role, policy, trust relationship и condition. Wildcard в action/resource создаёт удобство, но увеличивает blast radius. Federation и краткоживущий workload identity уменьшают использование статических ключей; в trust policy проверяйте ограничения issuer, audience, subject и environment.\n\nАдминистраторы-люди защищаются MFA, JIT elevation, access review и мониторингом break-glass. Service identity должен иметь доступ только к необходимым API-действиям и ресурсам; инвентаризируйте неиспользуемые ключи, устаревшие роли и cross-account trust. Поскольку deny policy и наследование политик специфичны для провайдера, тестируйте effective access.",
          "Cloud IAM grants a principal actions/resources through roles, policies, trust relationships, and conditions. Wildcards in actions/resources create convenience but increase blast radius. Federation and short-lived workload identities reduce reliance on static keys; check the issuer, audience, subject, and environment constraints in the trust policy.\n\nHuman admins are protected with MFA, JIT elevation, access review, and break-glass monitoring. A service identity should have access only to the API actions and resources it needs; inventory unused keys, stale roles, and cross-account trust. Because deny policies and policy inheritance are provider-specific, test effective access."
        ),
        example: t(
          "Review matrix: principal / trust source / actions / resources / conditions / last use / owner / expiry.",
          "Review matrix: principal / trust source / actions / resources / conditions / last use / owner / expiry.",
          "Review matrix: principal / trust source / actions / resources / conditions / last use / owner / expiry."
        ),
        explanation: t(
          "Haqiqiy IAM policy’ni gist/chatga nusxalamang. Lab’da sintetik ARN, project ID va account name ishlating.",
          "Не копируйте реальную IAM policy в gist/чат. В лабораторной используйте синтетические ARN, project ID и имена аккаунтов.",
          "Do not copy a real IAM policy into a gist/chat. In the lab, use synthetic ARNs, project IDs, and account names."
        ),
        prompt: t(
          "Uzoq muddatli cloud key o‘rniga afzal ko‘riladigan vaqtinchalik identity credentials?",
          "Временные identity-учётные данные, предпочтительные вместо долгосрочного облачного ключа?",
          "Temporary identity credentials preferred over a long-lived cloud key?"
        ),
        answers: ["short-lived credentials", "temporary credentials", "qisqa muddatli credential"]
      },
      {
        title: t("3. Cloud network, workload isolation va egress", "3. Облачная сеть, изоляция workload и egress", "3. Cloud networking, workload isolation, and egress"),
        content: t(
          "VPC/VNet/project network design’da subnet, route, security group, network ACL, private endpoint, DNS, NAT gateway va egress policy’ni threat boundary bilan bog‘lang. Public IP yo‘qligi workload xavfsizligini o‘zi isbotlamaydi; control plane, metadata service, peering va identity ham ko‘rib chiqiladi.\n\nProd/non-prod, sensitive data va admin plane’ni ajrating. Egress allowlist va private service access monitoring talab qiladi; default deny noto‘g‘ri qo‘llansa dependency’lar uziladi. Flow log’da privacy va retention, incidentda region va account scope’ni hisobga oling. Cloud firewall vendor behavior’ini rasmiy doc va test bilan tasdiqlang.",
          "В дизайне сети VPC/VNet/project связывайте subnet, маршруты, security group, network ACL, private endpoint, DNS, NAT gateway и egress-политику с границами угроз (threat boundary). Отсутствие публичного IP само по себе не доказывает безопасность workload; учитывайте также control plane, metadata service, peering и identity.\n\nРазделяйте prod/non-prod, чувствительные данные и admin plane. Egress allowlist и private service access требуют мониторинга; неверно применённый default deny разрывает зависимости. Учитывайте приватность и хранение в flow log, а также область региона и account при инциденте. Подтверждайте поведение облачного firewall официальной документацией и тестами.",
          "In VPC/VNet/project network design, tie subnets, routes, security groups, network ACLs, private endpoints, DNS, NAT gateways, and egress policy to the threat boundary. The absence of a public IP does not by itself prove workload security; the control plane, metadata service, peering, and identity are also considered.\n\nSeparate prod/non-prod, sensitive data, and the admin plane. Egress allowlists and private service access require monitoring; an incorrectly applied default deny breaks dependencies. Account for privacy and retention in flow logs, and for region and account scope during an incident. Confirm cloud firewall vendor behavior with official documentation and testing."
        ),
        example: t(
          "Flow matrix: source workload → destination service → port/protocol → business reason → logging → owner.",
          "Flow matrix: source workload → destination service → port/protocol → business reason → logging → owner.",
          "Flow matrix: source workload → destination service → port/protocol → business reason → logging → owner."
        ),
        explanation: t(
          "Misol architecture review uchun. Haqiqiy cloud security group’ni o‘zgartirish production outage keltirishi mumkin.",
          "Пример предназначен для architecture review. Изменение реальной облачной security group может привести к production-сбою.",
          "The example is for architecture review. Changing a real cloud security group can cause a production outage."
        ),
        prompt: t(
          "VPC ichidagi network traffic’ni kuzatish uchun keng tarqalgan log turi?",
          "Распространённый тип логов для отслеживания сетевого трафика внутри VPC?",
          "A common log type for tracking network traffic within a VPC?"
        ),
        answers: ["flow log", "vpc flow log", "flow logs"]
      },
      {
        title: t("4. Infrastructure as Code va configuration drift", "4. Infrastructure as Code и configuration drift", "4. Infrastructure as Code and configuration drift"),
        content: t(
          "IaC tarmoq, IAM va resource konfiguratsiyasini version-controlled, review qilinadigan deklarativ kodga aylantiradi. Plan/diff’ni ko‘rmasdan apply qilmang; module source, provider version, state backend, lock va secret handling’ni tekshiring. State file resource ID, secret yoki konfiguratsiya qiymatini saqlashi mumkin, shuning uchun encryption va access control zarur.\n\nDrift detection real va desired state farqini ko‘rsatadi, ammo auto-remediation xavfli bo‘lishi mumkin. Policy-as-code guardrail’lari change pipeline’da test qilinsin. Naming, tag, owner, data class va lifecycle standardlarini avtomatlashtirish inventory va auditni osonlashtiradi.",
          "IaC превращает конфигурацию сети, IAM и ресурсов в декларативный код под контролем версий и доступный для ревью. Не применяйте apply, не просмотрев plan/diff; проверяйте источник модуля, версию provider, state backend, блокировку и работу с секретами. State-файл может содержать ID ресурсов, секреты или значения конфигурации, поэтому необходимы шифрование и контроль доступа.\n\nDrift detection показывает разницу между фактическим и желаемым состоянием, но auto-remediation может быть опасен. Guardrail-ы policy-as-code должны тестироваться в pipeline изменений. Автоматизация стандартов именования, тегов, владельца, класса данных и жизненного цикла упрощает инвентаризацию и аудит.",
          "IaC turns network, IAM, and resource configuration into version-controlled, reviewable declarative code. Do not apply without reviewing the plan/diff; check the module source, provider version, state backend, locking, and secret handling. The state file can contain resource IDs, secrets, or configuration values, so encryption and access control are required.\n\nDrift detection shows the difference between actual and desired state, but auto-remediation can be risky. Policy-as-code guardrails should be tested in the change pipeline. Automating naming, tagging, owner, data class, and lifecycle standards eases inventory and audit."
        ),
        example: t(
          "Review: terraform fmt -check\nTerraform plan’ni o‘qing; lab bo‘lmagan muhitda apply qilmang.",
          "Review: terraform fmt -check\nTerraform plan’ni o‘qing; lab bo‘lmagan muhitda apply qilmang.",
          "Review: terraform fmt -check\nTerraform plan’ni o‘qing; lab bo‘lmagan muhitda apply qilmang."
        ),
        explanation: t(
          "Formatting tekshiruvi resource’ni o‘zgartirmaydi. Plan output’da sensitive field redaction va state access’ni tekshiring.",
          "Проверка форматирования не изменяет ресурсы. В выводе plan проверяйте редактирование (redaction) чувствительных полей и доступ к state.",
          "The formatting check does not change resources. In plan output, check sensitive-field redaction and state access."
        ),
        prompt: t(
          "Cloud resursini koddagi kerakli holat bilan taqqoslab ko‘rsatadigan IaC bosqichi?",
          "Этап IaC, показывающий сравнение облачного ресурса с желаемым состоянием в коде?",
          "The IaC stage that compares a cloud resource with the desired state defined in code?"
        ),
        answers: ["plan", "diff"]
      },
      {
        title: t("5. Container, Kubernetes va runtime boundary", "5. Контейнеры, Kubernetes и runtime boundary", "5. Containers, Kubernetes, and the runtime boundary"),
        content: t(
          "Container image minimal base, pinned dependency, verified source, vulnerability scan va signed provenance bilan build qilinadi. Root bo‘lmagan user, read-only filesystem, dropped capability, resource limit va seccomp/AppArmor kabi runtime control’larni workload ehtiyojiga moslang. Secret’ni image layer yoki environment dump’da saqlamang.\n\nKubernetes’da namespace, service account, RBAC, network policy, admission control, secrets encryption, audit log va upgrade lifecycle muhim. Container boundary alohida kernel VM bilan teng emas. Cluster admin huquqini cheklang; manifestlarni policy va test bilan review qiling. Prod clusterda “kubectl apply”ni faqat approved pipeline va rollback orqali bajaring.",
          "Образ контейнера собирается с минимальной базой, закреплёнными (pinned) зависимостями, проверенным источником, сканированием уязвимостей и подписанным provenance. Настройте runtime-контроли — не-root пользователь, read-only файловая система, сброшенные capability, лимиты ресурсов и seccomp/AppArmor — под нужды workload. Не храните секреты в слое образа или дампе переменных окружения.\n\nВ Kubernetes важны namespace, service account, RBAC, network policy, admission control, шифрование секретов, журнал аудита и жизненный цикл обновлений. Граница контейнера не эквивалентна отдельной kernel-VM. Ограничивайте права cluster admin; ревьюируйте манифесты с помощью policy и тестов. В prod-кластере выполняйте «kubectl apply» только через утверждённый pipeline и с возможностью rollback.",
          "A container image is built with a minimal base, pinned dependencies, a verified source, vulnerability scanning, and signed provenance. Tailor runtime controls — non-root user, read-only filesystem, dropped capabilities, resource limits, and seccomp/AppArmor — to the workload's needs. Do not store secrets in an image layer or an environment dump.\n\nIn Kubernetes, namespace, service account, RBAC, network policy, admission control, secrets encryption, audit log, and the upgrade lifecycle matter. A container boundary is not equivalent to a separate kernel VM. Restrict cluster-admin rights; review manifests with policy and tests. In a production cluster, run \"kubectl apply\" only through an approved pipeline with rollback."
        ),
        example: t(
          "Manifest review: runAsNonRoot / readOnlyRootFilesystem / resource requests+limits / serviceAccountName / network policy.",
          "Manifest review: runAsNonRoot / readOnlyRootFilesystem / resource requests+limits / serviceAccountName / network policy.",
          "Manifest review: runAsNonRoot / readOnlyRootFilesystem / resource requests+limits / serviceAccountName / network policy."
        ),
        explanation: t(
          "Bu konfiguratsiya review checklist; to‘liq xavfsizlikni kafolatlamaydi. Testni disposable clusterda bajaring.",
          "Это чек-лист для review конфигурации; он не гарантирует полную безопасность. Проводите тесты в одноразовом (disposable) кластере.",
          "This is a configuration-review checklist; it does not guarantee complete security. Run tests on a disposable cluster."
        ),
        prompt: t(
          "Container jarayonini root bo‘lmagan user bilan ishga tushirish nazorati?",
          "Контроль, запускающий процесс контейнера от имени непривилегированного (non-root) пользователя?",
          "The control that runs a container process as a non-root user?"
        ),
        answers: ["runasnonroot", "run as non-root", "non-root"]
      },
      {
        title: t("6. CI/CD, artifact provenance va release nazorati", "6. CI/CD, artifact provenance и контроль релизов", "6. CI/CD, artifact provenance, and release control"),
        content: t(
          "CI/CD pipeline source review, unit/integration test, dependency scan, secret check, artifact build, signature/provenance va deployment approval’ni bog‘laydi. Build runner izolyatsiyasi, token permission, untrusted contribution va cache poisoning riskini baholang. Artifact bir marta qurilib, muhitlar bo‘ylab aynan shu artifact sifatida ko‘tarilsin.\n\nDeploy canary yoki bosqichma-bosqich bo‘lsin; health gate, rollback trigger, database migration compatibility va feature flag’ni rejalang. Pipeline loglari secretni niqoblasin. SBOM va provenance incident vaqtida qaysi workload qaysi dependency’ni ishlatayotganini topishga yordam beradi.",
          "CI/CD pipeline связывает ревью исходного кода, unit/integration тесты, сканирование зависимостей, проверку секретов, сборку артефакта, подпись/provenance и утверждение развёртывания. Оценивайте изоляцию build-runner'а, права токенов, риск untrusted-контрибьюций и cache poisoning. Артефакт должен собираться один раз и продвигаться по средам именно как этот же артефакт.\n\nРазвёртывание должно быть canary или поэтапным; планируйте health gate, триггер rollback, совместимость миграций базы данных и feature flag. Логи pipeline должны маскировать секреты. SBOM и provenance помогают во время инцидента выяснить, какой workload использует какую зависимость.",
          "The CI/CD pipeline links source review, unit/integration tests, dependency scanning, secret checks, artifact build, signature/provenance, and deployment approval. Assess build-runner isolation, token permissions, untrusted-contribution risk, and cache-poisoning risk. An artifact should be built once and promoted across environments as that exact same artifact.\n\nDeployment should be canary or staged; plan health gates, rollback triggers, database migration compatibility, and feature flags. Pipeline logs should mask secrets. SBOM and provenance help during an incident to identify which workload uses which dependency."
        ),
        example: t(
          "Release evidence: commit SHA / build identity / dependency manifest / signature / approval / deploy target / rollback.",
          "Release evidence: commit SHA / build identity / dependency manifest / signature / approval / deploy target / rollback.",
          "Release evidence: commit SHA / build identity / dependency manifest / signature / approval / deploy target / rollback."
        ),
        explanation: t(
          "Sample record sintetik. Build badge yoki signature nimani tasdiqlashini verification policy’sida aniq belgilang.",
          "Пример записи синтетический. Чётко определите в политике верификации, что именно подтверждает build badge или подпись.",
          "The sample record is synthetic. Clearly define in the verification policy exactly what a build badge or signature confirms."
        ),
        prompt: t(
          "Bir build natijasi va uning kelib chiqishini tekshirishga oid dalil?",
          "Доказательство, подтверждающее результат сборки и её происхождение?",
          "Evidence confirming a build result and its origin?"
        ),
        answers: ["provenance", "artifact provenance"]
      },
      {
        title: t("7. Cloud monitoring, backup, cost va resilience", "7. Облачный мониторинг, резервное копирование, cost и resilience", "7. Cloud monitoring, backup, cost, and resilience"),
        content: t(
          "Cloud observability’da metrics, logs, traces, audit events va provider health birlashtiriladi. Control-plane audit loglari identity va resource change’ni ko‘rsatadi; data-plane loglari workload request’larini beradi. Alert action’ga olib borishi, owner va runbook’ga ega bo‘lishi kerak. Cost anomaly security incident bo‘lishi mumkin, ammo o‘zi compromise isboti emas.\n\nBackup region, account, key va deletion permission bo‘yicha ajrating; immutable copy va restore test ransomware va operator xatosini kamaytiradi. Multi-AZ/region redundancy RTO/RPO, consistency, data residency, cost va dependency’ga ta’sir qiladi. Failover drill va restore report’ni saqlang; “backup enabled”ni recovery proof deb hisoblamang.",
          "В облачной observability объединяются metrics, logs, traces, события аудита и состояние провайдера (provider health). Логи аудита control-plane показывают изменения identity и ресурсов; логи data-plane дают запросы workload. Оповещение должно вести к действию и иметь владельца и runbook. Аномалия затрат может быть инцидентом безопасности, но сама по себе не доказывает компрометацию.\n\nРазделяйте резервные копии по региону, аккаунту, ключу и правам на удаление; неизменяемые (immutable) копии и тесты восстановления снижают риск ransomware и ошибок оператора. Multi-AZ/region-избыточность влияет на RTO/RPO, согласованность, резидентность данных, стоимость и зависимости. Сохраняйте отчёты о failover-тренировках и восстановлении; не считайте «backup enabled» доказательством восстанавливаемости.",
          "Cloud observability brings together metrics, logs, traces, audit events, and provider health. Control-plane audit logs show identity and resource changes; data-plane logs provide workload requests. An alert must lead to action and have an owner and a runbook. A cost anomaly can be a security incident, but by itself is not proof of compromise.\n\nSeparate backups by region, account, key, and deletion permission; immutable copies and restore tests reduce ransomware and operator-error risk. Multi-AZ/region redundancy affects RTO/RPO, consistency, data residency, cost, and dependencies. Retain failover-drill and restore reports; do not treat \"backup enabled\" as proof of recoverability."
        ),
        example: t(
          "Readiness check: audit coverage / alert owner / backup age / restore evidence / RPO/RTO / cost anomaly path.",
          "Readiness check: audit coverage / alert owner / backup age / restore evidence / RPO/RTO / cost anomaly path.",
          "Readiness check: audit coverage / alert owner / backup age / restore evidence / RPO/RTO / cost anomaly path."
        ),
        explanation: t(
          "Cross-region backup data residency yoki privacy chekloviga zid bo‘lishi mumkin; transferni compliance owner bilan tekshiring.",
          "Резервное копирование между регионами может противоречить требованиям резидентности данных или конфиденциальности; проверяйте передачу с владельцем compliance.",
          "Cross-region backup may conflict with data-residency or privacy restrictions; verify the transfer with the compliance owner."
        ),
        prompt: t(
          "Backup nusxasidan tiklash amalda ishlashini ko‘rsatuvchi sinov?",
          "Тест, демонстрирующий, что восстановление из резервной копии действительно работает?",
          "The test that demonstrates restoring from a backup actually works?"
        ),
        answers: ["restore test", "restore drill", "tiklash sinovi"]
      },
      {
        title: t("8. Senior platform engineer: SRE, postmortem va governance", "8. Senior platform engineer: SRE, postmortem и governance", "8. Senior platform engineer: SRE, postmortems, and governance"),
        content: t(
          "SRE yondashuvi xizmatning user-facing SLI, SLO va error budget’ini operatsion qarorga bog‘laydi. Error budget tugasa, reliability ishiga ustuvorlik berish release xavfini kamaytiradi. Platform jamoasi developer enablement, guardrails, paved road va self-service’ni yaratadi; biroq shared responsibility va team ownership’ni yashirmaydi.\n\nSenior cloud engineer architecture decision, threat model, compliance mapping, cost, vendor lock-in, failure domain, support plan va exit strategy’ni yozadi. Incident postmortem blame-free va action-oriented bo‘lsin. Platform metric’lari developer toil, deployment failure, recovery time, policy exception va service health’ni ko‘rsatsin. Katta riskni leadership tilida, taxmin va trade-off bilan tushuntiring.",
          "Подход SRE связывает пользовательские SLI, SLO и error budget сервиса с операционными решениями. Когда error budget исчерпан, приоритет работы над надёжностью снижает риск релизов. Команда платформы создаёт developer enablement, guardrail, paved road и self-service, но это не отменяет shared responsibility и ownership команд.\n\nSenior cloud engineer документирует архитектурные решения, threat model, compliance mapping, стоимость, vendor lock-in, домены отказа, план поддержки и стратегию выхода. Postmortem инцидентов должен быть blameless и ориентированным на действия. Метрики платформы должны показывать toil разработчиков, сбои развёртывания, время восстановления, исключения политик и состояние сервиса. Объясняйте крупные риски руководству на понятном языке, с допущениями и компромиссами.",
          "The SRE approach ties a service's user-facing SLIs, SLOs, and error budget to operational decisions. When the error budget is exhausted, prioritizing reliability work reduces release risk. The platform team creates developer enablement, guardrails, a paved road, and self-service — but this does not hide shared responsibility and team ownership.\n\nA senior cloud engineer documents architecture decisions, threat models, compliance mapping, cost, vendor lock-in, failure domains, the support plan, and the exit strategy. Incident postmortems should be blameless and action-oriented. Platform metrics should show developer toil, deployment failures, recovery time, policy exceptions, and service health. Explain major risk to leadership in their language, with assumptions and trade-offs."
        ),
        example: t(
          "Service review: SLI/SLO / error budget / cost / security exceptions / restore evidence / toil / owner actions.",
          "Service review: SLI/SLO / error budget / cost / security exceptions / restore evidence / toil / owner actions.",
          "Service review: SLI/SLO / error budget / cost / security exceptions / restore evidence / toil / owner actions."
        ),
        explanation: t(
          "SLO raqamlarini foydalanuvchi ehtiyoji va real telemetry’dan belgilang; boshqa jamoa maqsadini ko‘r-ko‘rona ko‘chirmang.",
          "Определяйте значения SLO на основе потребностей пользователей и реальной телеметрии; не копируйте слепо цели другой команды.",
          "Set SLO values based on user needs and real telemetry; do not blindly copy another team's target."
        ),
        prompt: t(
          "Reliability uchun oldindan belgilangan xizmat maqsadi qisqartmasi?",
          "Аббревиатура заранее установленной цели сервиса по надёжности?",
          "The abbreviation for a predefined service reliability target?"
        ),
        answers: ["slo", "service level objective"]
      }
    ]
  }),
  book({
    slug: "iso-27001-isms",
    title: t("ISO/IEC 27001:2022 — ISMS amaliyoti va auditga tayyorgarlik", "ISO/IEC 27001:2022 — практика ISMS и подготовка к аудиту", "ISO/IEC 27001:2022 — ISMS practice and audit readiness"),
    summary: t(
      "ISMS konteksti, risk assessment, treatment, Statement of Applicability, nazorat dalillari, ichki audit va continual improvement bo‘yicha original amaliy darslik.",
      "Оригинальный практический курс о контексте ISMS, оценке риска, его обработке, Statement of Applicability, доказательствах мер контроля, внутреннем аудите и continual improvement.",
      "An original, practical course on ISMS context, risk assessment, treatment, the Statement of Applicability, control evidence, internal audit, and continual improvement."
    ),
    category: "security", difficulty: "hard", hours: 30,
    labPlan: t(
      "Sintetik kompaniya uchun ISMS scope, risk register, control mapping, SoA qarori, audit finding va corrective action yozish mashqlari.",
      "Упражнения по написанию scope ISMS, реестра рисков, сопоставления мер контроля, решений SoA, результатов аудита и корректирующих действий для синтетической компании.",
      "Exercises writing an ISMS scope, risk register, control mapping, SoA decisions, audit findings, and corrective actions for a synthetic company."
    ),
    references: [
      reference(t("ISO/IEC 27001:2022 — rasmiy standart sahifasi", "ISO/IEC 27001:2022 — официальная страница стандарта", "ISO/IEC 27001:2022 — official standard page"), "https://www.iso.org/standard/82875.html"),
      reference(t("ISO/IEC 27002:2022 — nazorat bo‘yicha yo‘riqnoma", "ISO/IEC 27002:2022 — руководство по мерам контроля", "ISO/IEC 27002:2022 — guidance on controls"), "https://www.iso.org/standard/75652.html"),
      reference(t("NIST Cybersecurity Framework 2.0", "NIST Cybersecurity Framework 2.0", "NIST Cybersecurity Framework 2.0"), "https://www.nist.gov/cyberframework")
    ],
    chapters: [
      {
        title: t("1. ISMS maqsadi, kontekst va scope", "1. Цель ISMS, контекст и scope", "1. ISMS purpose, context, and scope"),
        content: t(
          "Information Security Management System (ISMS) tashkilot xavfsizlik riskini boshqarish, maqsad qo‘yish, nazoratni bajarish va yaxshilash uchun boshqaruv tizimidir. ISO/IEC 27001:2022 talablarini tashkilot konteksti, stakeholder ehtiyoji, qonuniy/contractual majburiyat, xizmat va joylashuv bilan bog‘lang. Scope haddan tashqari tor bo‘lsa, muhim dependency yoki ma’lumot tashqarida qolishi mumkin.\n\nScope bayonida boundary, interface, asset, site, service, supplier va exclusion asosini ko‘rsating. Top management mas’uliyati, policy, role, resurs, competence va review davri belgilanadi. Bu material standart matnining o‘rnini bosmaydi; rasmiy talablarni bajarish uchun amaldagi, litsenziyalangan ISO nashrini o‘qing.",
          "Information Security Management System (ISMS) — это система управления для управления риском безопасности организации, постановки целей, выполнения мер контроля и улучшения. Увязывайте требования ISO/IEC 27001:2022 с контекстом организации, потребностями заинтересованных сторон, юридическими/договорными обязательствами, услугами и расположением. Если scope слишком узок, важные зависимости или данные могут остаться за его пределами.\n\nВ описании scope укажите границы, интерфейсы, активы, площадки, услуги, поставщиков и основания для исключений. Определяются ответственность высшего руководства, политика, роли, ресурсы, компетентность и периодичность пересмотра. Этот материал не заменяет текст стандарта; для выполнения официальных требований читайте действующее лицензированное издание ISO.",
          "An Information Security Management System (ISMS) is a management system for managing an organization's security risk, setting objectives, implementing controls, and improving. Tie ISO/IEC 27001:2022 requirements to the organization's context, stakeholder needs, legal/contractual obligations, services, and locations. If the scope is too narrow, important dependencies or data may fall outside it.\n\nIn the scope statement, state the boundary, interfaces, assets, sites, services, suppliers, and the basis for exclusions. Top management responsibility, policy, roles, resources, competence, and review period are defined. This material does not replace the standard's text; to meet formal requirements, read the current, licensed ISO edition."
        ),
        example: t(
          "ISMS scope draft: tashkilot / xizmat / lokatsiya / in-scope data / external dependency / exclusions / approval / review date.",
          "ISMS scope draft: tashkilot / xizmat / lokatsiya / in-scope data / external dependency / exclusions / approval / review date.",
          "ISMS scope draft: tashkilot / xizmat / lokatsiya / in-scope data / external dependency / exclusions / approval / review date."
        ),
        explanation: t(
          "Scope shabloni o‘quv misoli; sertifikatlash yoki compliance xulosasi bermaydi.",
          "Шаблон scope — учебный пример; он не является сертификационным или compliance-заключением.",
          "The scope template is an educational example; it does not provide a certification or compliance conclusion."
        ),
        prompt: t(
          "ISMS nimaning qisqartmasi?",
          "Аббревиатурой чего является ISMS?",
          "What is ISMS an abbreviation for?"
        ),
        answers: ["information security management system", "isms"]
      },
      {
        title: t("2. Risk mezoni, asset va risk assessment", "2. Критерии риска, активы и risk assessment", "2. Risk criteria, assets, and risk assessment"),
        content: t(
          "Risk assessment metodologiyasi ehtimol, ta’sir, risk appetite, vaqt oralig‘i va qabul qilish vakolatini izchil belgilashi kerak. Asset faqat server emas: ma’lumot, process, people, supplier, identity va cloud service ham qiymatga ega. Threat, vulnerability, existing control va consequence’ni bog‘lab scenario tuzing.\n\nRisk register’da owner, inherent/residual rating, evidence, treatment, due date va review trigger bo‘lsin. Ballar aniq ko‘rinsa ham, taxmin va uncertainty’ni yashirmang. Bir xil scoring scale’ni bo‘limlar bo‘yicha kalibrlang; riskni compliance checkboxga aylantirmang. Riskni qabul qilish vakolatli biznes risk egasining qarori bo‘lishi kerak.",
          "Методология risk assessment должна последовательно определять вероятность, воздействие, risk appetite, временной горизонт и полномочия на принятие риска. Актив — это не только сервер: данные, процессы, люди, поставщики, identity и облачные сервисы также представляют ценность. Составляйте сценарии, связывая угрозу, уязвимость, существующий контроль и последствие.\n\nВ реестре рисков должны быть владелец, оценка inherent/residual, evidence, treatment, срок и триггер пересмотра. Даже если баллы выглядят точными, не скрывайте допущения и неопределённость. Калибруйте единую шкалу оценки по подразделениям; не превращайте риск в compliance-чекбокс. Принятие риска должно быть решением уполномоченного владельца бизнес-риска.",
          "The risk assessment methodology must consistently define likelihood, impact, risk appetite, time horizon, and acceptance authority. An asset is not just a server: data, processes, people, suppliers, identities, and cloud services also have value. Build scenarios by linking threat, vulnerability, existing control, and consequence.\n\nThe risk register should include owner, inherent/residual rating, evidence, treatment, due date, and review trigger. Even when scores look precise, do not hide assumptions and uncertainty. Calibrate the same scoring scale across units; do not turn risk into a compliance checkbox. Accepting a risk should be the decision of an authorized business risk owner."
        ),
        example: t(
          "Risk: asset / threat scenario / weakness / impact / likelihood / current control / residual level / owner.",
          "Risk: asset / threat scenario / weakness / impact / likelihood / current control / residual level / owner.",
          "Risk: asset / threat scenario / weakness / impact / likelihood / current control / residual level / owner."
        ),
        explanation: t(
          "Ballar shartli bo‘lishi mumkin; tashkilot tasdiqlagan metodologiya va risk appetite’dan foydalaning.",
          "Баллы могут быть условными; используйте методологию и risk appetite, утверждённые организацией.",
          "Scores can be conditional; use the methodology and risk appetite approved by the organization."
        ),
        prompt: t(
          "Muayyan risk uchun javobgarlikni oladigan biznes roli?",
          "Бизнес-роль, принимающая ответственность за конкретный риск?",
          "The business role that takes responsibility for a specific risk?"
        ),
        answers: ["risk owner", "risk egasi"]
      },
      {
        title: t("3. Risk treatment, control tanlash va SoA", "3. Risk treatment, выбор мер контроля и SoA", "3. Risk treatment, control selection, and the SoA"),
        content: t(
          "Risk treatment plan riskni kamaytirish, qabul qilish, boshqa tomonga o‘tkazish yoki faoliyatdan qochish qarorini qayd etadi. Control tanlash sababini risk, qonun, contract va biznes sharoiti bilan bog‘lang. Statement of Applicability (SoA) Annex A controls’ning qo‘llanish holati, inclusion/exclusion asoslari va implementation statusini izohlaydi.\n\nSoA universal copy-paste jadval bo‘lmasin: control mavjudligi, owner va evidence bilan tasdiqlansin. ISO/IEC 27001:2022 Annex A’da 93 ta reference control 4 tema bo‘yicha guruhlangan. Bu darslik standart matnini qayta nashr qilmaydi; amaldagi control wording’ni litsenziyalangan ISO nusxasidan tekshiring.",
          "План risk treatment фиксирует решение снизить, принять, передать риск другой стороне или избежать деятельности. Увязывайте обоснование выбора меры контроля с риском, законом, договором и бизнес-условиями. Statement of Applicability (SoA) описывает применимость мер контроля Annex A, основания включения/исключения и статус внедрения.\n\nSoA не должен быть универсальной скопированной таблицей: наличие контроля должно подтверждаться владельцем и evidence. В ISO/IEC 27001:2022 Annex A 93 эталонные меры контроля сгруппированы по 4 темам. Этот курс не воспроизводит текст стандарта; проверяйте актуальную формулировку контролей по лицензированному изданию ISO.",
          "The risk treatment plan records the decision to reduce, accept, transfer to another party, or avoid an activity. Tie the rationale for control selection to risk, law, contract, and business conditions. The Statement of Applicability (SoA) explains the applicability of Annex A controls, the basis for inclusion/exclusion, and implementation status.\n\nThe SoA should not be a generic copy-pasted table: control presence must be confirmed with an owner and evidence. In ISO/IEC 27001:2022 Annex A, 93 reference controls are grouped under 4 themes. This course does not reproduce the standard's text; check the current control wording against a licensed ISO copy."
        ),
        example: t(
          "SoA maydonlari: control reference / applicable? / rationale / implementation status / evidence owner / review.",
          "SoA maydonlari: control reference / applicable? / rationale / implementation status / evidence owner / review.",
          "SoA maydonlari: control reference / applicable? / rationale / implementation status / evidence owner / review."
        ),
        explanation: t(
          "Bu ustunlar o‘quv shabloni, rasmiy Annex A matni emas. Rasmiy mappingni standartning amaldagi nashri bilan tekshiring.",
          "Эти столбцы — учебный шаблон, а не официальный текст Annex A. Проверяйте официальное сопоставление по актуальному изданию стандарта.",
          "These columns are an educational template, not the official Annex A text. Verify the official mapping against the standard's current edition."
        ),
        prompt: t(
          "Qo‘llaniladigan nazorat va uning asosini jamlaydigan ISMS hujjati?",
          "Документ ISMS, обобщающий применяемые меры контроля и их обоснование?",
          "The ISMS document that compiles the applicable controls and their rationale?"
        ),
        answers: ["statement of applicability", "soa"]
      },
      {
        title: t("4. Policy, kompetensiya, supplier va nazorat amaliyoti", "4. Политика, компетентность, поставщики и практика контроля", "4. Policy, competence, suppliers, and control practice"),
        content: t(
          "Policy boshqaruv niyati va talabini ifodalaydi; procedure, standard, runbook va work instruction uni amaliyotga aylantiradi. Hujjatlarda owner, approver, version, scope, effective date va review interval bo‘lsin. Xodim competence va awareness’i role riskiga mos o‘lchanadi, faqat kursni tugatganlik emas.\n\nSupplier riskida due diligence, data flow, subprocessor, incident notification, access, exit plan va assurance report’ni shartnoma bilan bog‘lang. Control design’ni kundalik workflow ichiga qo‘shing: access request, patch, backup, change va incident. Exceptionlar risk owner, compensating control, expiry va approval bilan boshqarilsin.",
          "Policy выражает намерение и требования руководства; procedure, standard, runbook и work instruction превращают их в практику. В документах должны быть владелец, утверждающий, версия, scope, дата вступления в силу и интервал пересмотра. Компетентность и осведомлённость сотрудника оцениваются в соответствии с риском роли, а не только фактом прохождения курса.\n\nВ оценке риска поставщика увязывайте due diligence, потоки данных, субпроцессоров, уведомление об инцидентах, доступ, план выхода и отчёты assurance с договором. Встраивайте дизайн контроля в повседневный workflow: запрос доступа, патч, резервное копирование, изменение и инцидент. Исключения должны управляться владельцем риска, компенсирующим контролем, сроком действия и утверждением.",
          "Policy expresses management's intent and requirements; procedures, standards, runbooks, and work instructions turn it into practice. Documents should have an owner, approver, version, scope, effective date, and review interval. An employee's competence and awareness are measured against their role's risk, not merely whether they completed a course.\n\nIn supplier risk, tie due diligence, data flows, subprocessors, incident notification, access, the exit plan, and assurance reports to the contract. Embed control design into everyday workflow: access requests, patching, backup, change, and incidents. Exceptions should be governed by a risk owner, compensating control, expiry, and approval."
        ),
        example: t(
          "Policy lifecycle: draft → owner review → legal/privacy/security check → approval → communication → evidence → periodic review.",
          "Policy lifecycle: draft → owner review → legal/privacy/security check → approval → communication → evidence → periodic review.",
          "Policy lifecycle: draft → owner review → legal/privacy/security check → approval → communication → evidence → periodic review."
        ),
        explanation: t(
          "Haqiqiy shartnoma yoki vendor security report’ni ochiq kursga joylamang; sintetik misol bilan mashq qiling.",
          "Не размещайте в открытом курсе реальный договор или отчёт vendor security; тренируйтесь на синтетическом примере.",
          "Do not post a real contract or vendor security report in a public course; practice with a synthetic example."
        ),
        prompt: t(
          "Control requirement’ni bajarish uchun detail step-by-step operational hujjat?",
          "Детализированный пошаговый операционный документ для выполнения требования контроля?",
          "A detailed, step-by-step operational document for fulfilling a control requirement?"
        ),
        answers: ["procedure", "protsedura"]
      },
      {
        title: t("5. Performance evaluation, ichki audit va evidence", "5. Performance evaluation, внутренний аудит и evidence", "5. Performance evaluation, internal audit, and evidence"),
        content: t(
          "ISMS performance evaluation control effectiveness, objective, metric, audit, management review va action follow-up’ni qamrab oladi. Auditor mezon, scope, sample, method va evidence’ni oldindan belgilaydi; intervyu, record review va observation’ni uyg‘unlashtiradi. Audit mustaqilligi uchun auditor o‘zi boshqargan control’ni baholamasligi kerak.\n\nEvidence ishonchli, sanali, ownerga tegishli va qayta tekshiriladigan bo‘lsin. Screenshotning o‘zi source, scope yoki access nazoratini isbotlamasligi mumkin. Finding’da criterion, objective evidence, gap, risk va corrective action farqlanadi. Auditni “hujjat bor” deb yopmang: nazorat amalda ishlaganini sampling bilan tekshiring.",
          "Performance evaluation ISMS охватывает эффективность контроля, цели, метрики, аудит, management review и отслеживание действий. Аудитор заранее определяет критерии, scope, выборку, метод и evidence; сочетает интервью, проверку записей и наблюдение. Для независимости аудита аудитор не должен оценивать контроль, которым сам управляет.\n\nEvidence должно быть достоверным, датированным, привязанным к владельцу и перепроверяемым. Один скриншот сам по себе не может доказать источник, scope или контроль доступа. В finding различаются критерий, объективное доказательство, разрыв (gap), риск и корректирующее действие. Не закрывайте аудит фразой «документ есть»: проверяйте выборкой, что контроль реально работает.",
          "ISMS performance evaluation covers control effectiveness, objectives, metrics, audit, management review, and action follow-up. The auditor defines criteria, scope, sample, method, and evidence in advance, combining interviews, record review, and observation. For audit independence, an auditor must not evaluate a control they themselves manage.\n\nEvidence should be credible, dated, attributable to an owner, and re-verifiable. A screenshot alone may not prove the source, scope, or access control. A finding distinguishes between criterion, objective evidence, gap, risk, and corrective action. Do not close an audit on the claim that \"documentation exists\": verify through sampling that the control actually works."
        ),
        example: t(
          "Audit note: criterion / sample / evidence source / observed fact / gap / risk / owner response.",
          "Audit note: criterion / sample / evidence source / observed fact / gap / risk / owner response.",
          "Audit note: criterion / sample / evidence source / observed fact / gap / risk / owner response."
        ),
        explanation: t(
          "Audit dalilini access-controlled joyda saqlang, keraksiz shaxsiy ma’lumotni ko‘chirmang.",
          "Храните доказательства аудита в месте с контролем доступа, не копируйте ненужные персональные данные.",
          "Store audit evidence in an access-controlled location; do not copy unnecessary personal data."
        ),
        prompt: t(
          "Nazorat amalda ishlashini tekshirish uchun auditor yig‘adigan ishonchli ma’lumot?",
          "Достоверная информация, которую аудитор собирает для проверки реальной работы контроля?",
          "The credible information an auditor gathers to verify that a control works in practice?"
        ),
        answers: ["evidence", "dalil"]
      },
      {
        title: t("6. Nonconformity, corrective action va root cause", "6. Nonconformity, corrective action и root cause", "6. Nonconformity, corrective action, and root cause"),
        content: t(
          "Nonconformity — talab va amaliy holat o‘rtasidagi dalil bilan ko‘rsatilgan tafovut. Corrective action faqat symptomni tuzatish emas; sababni aniqlab, qayta sodir bo‘lish ehtimolini kamaytiradi. Immediate correction, root-cause analysis, action owner, due date va effectiveness check’ni ajrating.\n\nBlameless tahlilda process, role, resource, technology va oversight’ni tekshiring. “Xodim e’tiborsiz edi” ko‘pincha root cause emas; noaniq instruction, noto‘g‘ri tool yoki review gap bo‘lishi mumkin. Action’ni yopishdan oldin evidence va effectiveness criterion belgilang.",
          "Nonconformity — это подтверждённое доказательствами расхождение между требованием и фактическим положением дел. Corrective action — это не просто устранение симптома; он выявляет причину и снижает вероятность повторения. Разделяйте немедленное исправление (immediate correction), анализ первопричины (root-cause analysis), владельца действия, срок и проверку эффективности.\n\nВ blameless-анализе рассматривайте процесс, роль, ресурс, технологию и надзор. «Сотрудник был невнимателен» часто не является root cause; это может быть неясная инструкция, неподходящий инструмент или пробел в ревью. Прежде чем закрыть действие, определите evidence и критерий эффективности.",
          "A nonconformity is a gap between a requirement and the actual state, demonstrated with evidence. A corrective action is not just fixing the symptom; it identifies the cause and reduces the likelihood of recurrence. Distinguish immediate correction, root-cause analysis, the action owner, the due date, and the effectiveness check.\n\nIn a blameless analysis, examine process, role, resources, technology, and oversight. \"The employee was careless\" is often not the root cause; it may be an unclear instruction, the wrong tool, or a review gap. Define evidence and an effectiveness criterion before closing the action."
        ),
        example: t(
          "CAPA: finding → correction → root cause → corrective action → owner/due date → effectiveness evidence.",
          "CAPA: finding → correction → root cause → corrective action → owner/due date → effectiveness evidence.",
          "CAPA: finding → correction → root cause → corrective action → owner/due date → effectiveness evidence."
        ),
        explanation: t(
          "CAPA atamasi turli tizimlarda ishlatiladi; tashkilotingizdagi formal workflow va terminology’ga amal qiling.",
          "Термин CAPA используется в разных системах по-разному; следуйте формальному workflow и терминологии вашей организации.",
          "The term CAPA is used differently across systems; follow your organization's formal workflow and terminology."
        ),
        prompt: t(
          "Nomuvofiqlik sababini bartaraf etib, qayta sodir bo‘lishni kamaytiruvchi amal?",
          "Действие, устраняющее причину несоответствия и снижающее вероятность его повторения?",
          "The action that removes the cause of a nonconformity and reduces its recurrence?"
        ),
        answers: ["corrective action", "tuzatuvchi chora"]
      },
      {
        title: t("7. Management review va continual improvement", "7. Management review и continual improvement", "7. Management review and continual improvement"),
        content: t(
          "Management review’da oldingi action, kontekst o‘zgarishi, risk statusi, audit, objective, incident, supplier, resurs va improvement opportunity ko‘rib chiqiladi. Qaror, owner, resurs, due date va kutilgan natijani qayd qiling. Rahbariyatga risk trendini biznes xizmat, mijoz, regulatory exposure va investment bilan bog‘lab bering.\n\nContinual improvement yangi technology sotib olish degani emas; stale access, restore drill, incident detection, policy adoption yoki supplier visibility’ni yaxshilash bo‘lishi mumkin. KPI bajarilishi control samaradorligiga teng emas. Trend va sifatli dalilni birga ko‘rib, riskni qayta baholang.",
          "На management review рассматриваются предыдущие действия, изменения контекста, статус рисков, аудит, цели, инциденты, поставщики, ресурсы и возможности улучшения. Фиксируйте решение, владельца, ресурсы, срок и ожидаемый результат. Представляйте руководству тренд риска, увязывая его с бизнес-услугами, клиентами, regulatory exposure и инвестициями.\n\nContinual improvement не означает покупку новой технологии; это может быть устранение устаревшего доступа, тренировка восстановления, обнаружение инцидентов, внедрение политики или улучшение видимости поставщиков. Выполнение KPI не равнозначно эффективности контроля. Пересматривайте риск, рассматривая тренд и качественные доказательства вместе.",
          "A management review considers prior actions, context changes, risk status, audits, objectives, incidents, suppliers, resources, and improvement opportunities. Record the decision, owner, resources, due date, and expected outcome. Present the risk trend to leadership by linking it to business services, customers, regulatory exposure, and investment.\n\nContinual improvement does not mean buying new technology; it can mean removing stale access, running restore drills, improving incident detection, adopting policy, or improving supplier visibility. Meeting a KPI is not equivalent to control effectiveness. Re-assess risk by considering trend and qualitative evidence together."
        ),
        example: t(
          "Review dashboard: objective status / significant change / risk trend / incident / audit / supplier / decisions and owners.",
          "Review dashboard: objective status / significant change / risk trend / incident / audit / supplier / decisions and owners.",
          "Review dashboard: objective status / significant change / risk trend / incident / audit / supplier / decisions and owners."
        ),
        explanation: t(
          "Agregat ko‘rsatkichlar bilan shaxsiy ma’lumotni kamaytiring. Rahbariyat qarori va follow-up evidence’ni saqlang.",
          "Сокращайте персональные данные за счёт агрегированных показателей. Сохраняйте решения руководства и follow-up evidence.",
          "Reduce personal data through aggregated indicators. Retain leadership decisions and follow-up evidence."
        ),
        prompt: t(
          "ISMSni muntazam qayta baholab yaxshilash jarayoni?",
          "Процесс регулярной переоценки и улучшения ISMS?",
          "The process of regularly re-assessing and improving the ISMS?"
        ),
        answers: ["continual improvement", "uzluksiz yaxshilash"]
      },
      {
        title: t("8. Sertifikatlashga tayyorlik va kasbiy chegaralar", "8. Готовность к сертификации и профессиональные границы", "8. Certification readiness and professional boundaries"),
        content: t(
          "Certification readiness gap assessment, scope, risk, SoA, internal audit, management review, corrective action va evidence consistency’ni tekshiradi. Sertifikatsiya organi mustaqil audit qiladi; ichki kursni tugatish, template to‘ldirish yoki bitta audit report sertifikat bermaydi. Talablar tashkilot konteksti va amaldagi standard edition’ga mos bo‘lishi kerak.\n\nKonsultant yoki auditor rolida manfaatlar to‘qnashuvi, confidentiality va audit independence’ni ochiq boshqaring. Standard matnini ruxsatsiz nusxalamang va “ISO compliant” degan da’voni tekshirilmagan holda bermang. Bu darslik umumiy ta’lim; rasmiy qaror uchun akkreditatsiya, litsenziya va malakali mutaxassis talablarini tekshiring.",
          "Готовность к сертификации проверяет gap assessment, scope, риск, SoA, внутренний аудит, management review, корректирующие действия и согласованность evidence. Орган сертификации проводит независимый аудит; прохождение внутреннего курса, заполнение шаблона или единичный отчёт об аудите сертификат не дают. Требования должны соответствовать контексту организации и действующему изданию стандарта.\n\nОткрыто управляйте конфликтом интересов, конфиденциальностью и независимостью аудита в роли консультанта или аудитора. Не копируйте текст стандарта без разрешения и не делайте непроверенного заявления «ISO compliant». Этот курс — общее образование; для официального решения проверяйте требования к аккредитации, лицензии и квалифицированному специалисту.",
          "Certification readiness checks gap assessment, scope, risk, the SoA, internal audit, management review, corrective action, and evidence consistency. A certification body conducts an independent audit; completing an internal course, filling out a template, or a single audit report does not grant certification. Requirements must match the organization's context and the current standard edition.\n\nOpenly manage conflicts of interest, confidentiality, and audit independence when acting as a consultant or auditor. Do not copy the standard's text without authorization, and do not make an unverified \"ISO compliant\" claim. This course is general education; for a formal decision, check accreditation, licensing, and qualified-professional requirements."
        ),
        example: t(
          "Readiness evidence index: requirement map / record owner / current evidence / gap / action / verification date.",
          "Readiness evidence index: requirement map / record owner / current evidence / gap / action / verification date.",
          "Readiness evidence index: requirement map / record owner / current evidence / gap / action / verification date."
        ),
        explanation: t(
          "Hujjatlar ro‘yxati sertifikatsiya kafolati emas. Rasmiy audit va tegishli standart nusxasi mustaqil ravishda talab qilinadi.",
          "Перечень документов не является гарантией сертификации. Официальный аудит и актуальная копия стандарта требуются независимо от этого материала.",
          "A list of documents is not a guarantee of certification. A formal audit and a current copy of the standard are required independently."
        ),
        prompt: t(
          "ISO/IEC 27001 sertifikatini kurs platformasi emas, kim beradi?",
          "Кто выдаёт сертификат ISO/IEC 27001, а не учебная платформа?",
          "Who issues an ISO/IEC 27001 certificate, rather than a course platform?"
        ),
        answers: ["akkreditatsiyalangan sertifikatlash organi", "certification body", "sertifikatlash organi"]
      }
    ]
  }),
  book({
    slug: "gdpr-privacy-engineering",
    title: t("GDPR va privacy engineering: huquqiy talabdan texnik nazoratgacha", "GDPR и privacy engineering: от юридических требований к техническим мерам контроля", "GDPR and privacy engineering: from legal requirements to technical controls"),
    summary: t(
      "GDPR principles, lawful basis, role, data subject rights, DPIA, breach workflow, processor va cross-border transfer’larni texnik/jarayon nazoratlariga bog‘laydigan darslik.",
      "Курс, увязывающий принципы GDPR, lawful basis, роли, права субъектов данных, DPIA, workflow по утечкам, роль processor и трансграничную передачу данных с техническими/процессными мерами контроля.",
      "A course linking GDPR principles, lawful basis, roles, data subject rights, DPIA, breach workflow, the processor role, and cross-border transfers to technical/process controls."
    ),
    category: "security", difficulty: "hard", hours: 28,
    labPlan: t(
      "Faqat sintetik shaxsiy ma’lumotlar bilan data inventory, lawful-basis mapping, subject request, DPIA va breach tabletop mashqlari.",
      "Упражнения по data inventory, сопоставлению lawful basis, запросам субъектов данных, DPIA и tabletop-учениям по утечкам только с синтетическими персональными данными.",
      "Exercises in data inventory, lawful-basis mapping, subject requests, DPIA, and breach tabletop drills using only synthetic personal data."
    ),
    references: [
      reference(t("EU GDPR — Regulation (EU) 2016/679", "EU GDPR — Regulation (EU) 2016/679", "EU GDPR — Regulation (EU) 2016/679"), "https://eur-lex.europa.eu/eli/reg/2016/679/oj"),
      reference(t("EDPB — SME data protection guide", "EDPB — SME data protection guide", "EDPB — SME data protection guide"), "https://www.edpb.europa.eu/sme-data-protection-guide_en"),
      reference(t("European Commission — data protection rules", "European Commission — data protection rules", "European Commission — data protection rules"), "https://commission.europa.eu/law/law-topic/data-protection_en")
    ],
    chapters: [
      {
        title: t("1. GDPR doirasi, shaxsiy ma’lumot va role", "1. Сфера действия GDPR, персональные данные и роли", "1. GDPR scope, personal data, and roles"),
        content: t(
          "GDPR personal data’ni aniqlangan yoki aniqlanishi mumkin bo‘lgan jismoniy shaxsga taalluqli ma’lumot deb belgilaydi; pseudonymized data ham qo‘shimcha ma’lumot bilan bog‘lanishi mumkin. Controller maqsad va vositani belgilaydi, processor controller nomidan ishlov beradi; ayrim holatlarda joint controllership bo‘lishi mumkin. Territorial scope’ni tashkilot, shaxs va processing kontekstiga qarab huquqiy mutaxassis baholaydi.\n\nData inventory’da kategoriya, maqsad, subject, source, recipient, location, retention, access va legal basis ko‘rsating. “Anonim” deb aytishdan oldin qayta aniqlash xavfini tekshiring. GDPR barcha vaziyatga bir xil tatbiq etiladi deb taxmin qilmang; O‘zbekiston, boshqa qonunlar va shartnomalar ham qo‘shimcha talab qo‘yishi mumkin.",
          "GDPR определяет personal data как информацию, относящуюся к идентифицированному или идентифицируемому физическому лицу (data subject); даже псевдонимизированные данные могут быть связаны с дополнительной информацией. Controller определяет цель и средства обработки, processor обрабатывает данные от имени controller; в отдельных случаях возможен joint controllership. Территориальную сферу действия (territorial scope) в зависимости от организации, лица и контекста обработки должен оценивать юридический специалист.\n\nВ data inventory указывайте категорию, цель, субъекта, источник, получателя, местоположение, срок хранения, доступ и правовое основание (legal basis). Прежде чем заявлять «анонимно», проверьте риск повторной идентификации. Не предполагайте, что GDPR применяется одинаково во всех ситуациях; законодательство Узбекистана, другие законы и договоры также могут устанавливать дополнительные требования.",
          "GDPR defines personal data as information relating to an identified or identifiable natural person (data subject); even pseudonymized data may be linkable using additional information. The controller determines the purpose and means of processing, the processor processes data on the controller's behalf; in some cases joint controllership can occur. A legal specialist should assess territorial scope depending on the organization, the individual, and the processing context.\n\nIn the data inventory, record category, purpose, subject, source, recipient, location, retention, access, and legal basis. Before claiming data is \"anonymous,\" check the re-identification risk. Do not assume GDPR applies identically in every situation; Uzbekistan's laws, other laws, and contracts may impose additional requirements."
        ),
        example: t(
          "Record: data category / purpose / subjects / controller-processor role / source / recipients / retention / security owner.",
          "Record: data category / purpose / subjects / controller-processor role / source / recipients / retention / security owner.",
          "Record: data category / purpose / subjects / controller-processor role / source / recipients / retention / security owner."
        ),
        explanation: t(
          "Faqat synthetic data ishlating. Role va territorial scope bo‘yicha yakuniy xulosa yuridik maslahat talab qilishi mumkin.",
          "Используйте только синтетические данные. Окончательный вывод о роли и territorial scope может потребовать юридической консультации.",
          "Use only synthetic data. A final conclusion on role and territorial scope may require legal advice."
        ),
        prompt: t(
          "Processing maqsadi va vositasini belgilovchi GDPR roli?",
          "Роль по GDPR, определяющая цель и средства обработки?",
          "The GDPR role that determines the purpose and means of processing?"
        ),
        answers: ["controller", "nazorat qiluvchi"]
      },
      {
        title: t("2. Principles, lawful basis va purpose limitation", "2. Принципы, lawful basis и purpose limitation", "2. Principles, lawful basis, and purpose limitation"),
        content: t(
          "GDPR principles lawful, fair and transparent processing; purpose limitation; data minimisation; accuracy; storage limitation; integrity/confidentiality; accountability’ni o‘z ichiga oladi. Har maqsad uchun Article 6 lawful basis aniqlanadi; consent barcha ishlovga majburiy yagona asos emas. Special-category data uchun qo‘shimcha shartlar bo‘lishi mumkin.\n\nMaqsadni keyin kengaytirishdan oldin compatibility, notice, legal basis va retention’ni qayta baholang. Privacy notice aniq, tushunarli va processingga mos bo‘lsin. Consent ishlatilsa, erkin berilgan, aniq, xabardor, isbotlanadigan va qaytarib olish oson bo‘lishi kerak. Bu huquqiy baholash; mahsulot jamoasi DPO/legal counsel bilan ishlasin.",
          "Принципы GDPR включают lawful, fair and transparent processing; purpose limitation; data minimisation; accuracy; storage limitation; integrity/confidentiality; accountability. Для каждой цели определяется lawful basis по статье 6; согласие (consent) не является единственным обязательным основанием для всей обработки. Для special-category data могут действовать дополнительные условия.\n\nПрежде чем расширять цель в дальнейшем, заново оцените совместимость (compatibility), уведомление, правовое основание и срок хранения. Privacy notice должен быть ясным, понятным и соответствовать обработке. Если используется согласие, оно должно быть свободно данным, конкретным, информированным, доказуемым и легко отзываемым. Это юридическая оценка; продуктовая команда должна работать совместно с DPO/legal counsel.",
          "GDPR principles include lawful, fair and transparent processing; purpose limitation; data minimisation; accuracy; storage limitation; integrity/confidentiality; and accountability. An Article 6 lawful basis is identified for each purpose; consent is not the single mandatory basis for all processing. Additional conditions may apply to special-category data.\n\nBefore later expanding a purpose, re-assess compatibility, notice, legal basis, and retention. The privacy notice should be clear, understandable, and match the processing. Where consent is used, it must be freely given, specific, informed, demonstrable, and easy to withdraw. This is a legal assessment; the product team should work with a DPO/legal counsel."
        ),
        example: t(
          "Purpose map: purpose → data needed → legal basis → notice text → retention → recipient → withdrawal/objection path.",
          "Purpose map: purpose → data needed → legal basis → notice text → retention → recipient → withdrawal/objection path.",
          "Purpose map: purpose → data needed → legal basis → notice text → retention → recipient → withdrawal/objection path."
        ),
        explanation: t(
          "Bu o‘quv jadvali huquqiy asosni o‘zi tanlab bermaydi. Har processing uchun legal owner bilan tasdiqlang.",
          "Этот учебный шаблон сам по себе не выбирает правовое основание. Подтверждайте его для каждой обработки совместно с legal owner.",
          "This educational template does not select the legal basis by itself. Confirm it with the legal owner for each processing activity."
        ),
        prompt: t(
          "GDPR’da ma’lumotni belgilangan maqsad uchun zaruridan ortiq yig‘maslik prinsipi?",
          "Принцип GDPR о несборе данных сверх необходимого для указанной цели?",
          "The GDPR principle of not collecting data beyond what is necessary for the stated purpose?"
        ),
        answers: ["data minimisation", "data minimization", "ma’lumotlarni minimallashtirish"]
      },
      {
        title: t("3. Data subject rights va so‘rov workflow", "3. Права субъектов данных и workflow запросов", "3. Data subject rights and request workflow"),
        content: t(
          "GDPR data subject’ga tegishli sharoitlarda access, rectification, erasure, restriction, portability, objection va automated decision bo‘yicha huquqlar beradi. Har huquq mutlaq emas; istisno va muddatlar vaziyatga qarab qo‘llanadi. So‘rovni qabul qiluvchi support xodimi identity’ni mutanosib tekshiradi, ammo ortiqcha ID nusxasini yig‘maydi.\n\nWorkflow’da receive date, scope, systems, controller/processor, legal exception, approver, response deadline va secure delivery qayd etiladi. Data discovery uchun indekslangan manbalar va retention map kerak. O‘chirish so‘rovi backup va legal hold bilan murakkablashishi mumkin; tizimning texnik chegarasi va keyingi expiry sanasini aniq tushuntiring.",
          "GDPR при соответствующих обстоятельствах предоставляет data subject права на access, rectification, erasure, restriction, portability, objection и права, связанные с automated decision. Ни одно право не является абсолютным; исключения и сроки применяются в зависимости от ситуации. Сотрудник поддержки, принимающий запрос, соразмерно проверяет личность, но не собирает избыточные копии удостоверений.\n\nВ workflow фиксируются дата получения, scope, системы, роль controller/processor, правовое исключение, approver, срок ответа и безопасная доставка. Для обнаружения данных (data discovery) нужны индексированные источники и карта хранения (retention map). Запрос на удаление может усложняться резервными копиями и legal hold; чётко разъясняйте технические ограничения системы и дату последующего истечения срока.",
          "Under appropriate circumstances, GDPR grants the data subject rights to access, rectification, erasure, restriction, portability, objection, and rights related to automated decision-making. No right is absolute; exceptions and deadlines apply depending on the situation. The support staff member receiving the request verifies identity proportionately, without collecting excessive copies of ID documents.\n\nThe workflow records the receive date, scope, systems, controller/processor role, legal exception, approver, response deadline, and secure delivery. Data discovery requires indexed sources and a retention map. An erasure request can be complicated by backups and legal holds; clearly explain the system's technical limits and the subsequent expiry date."
        ),
        example: t(
          "DSR ticket: request type / received UTC / identity check method / systems searched / exception review / response owner / due date.",
          "DSR ticket: request type / received UTC / identity check method / systems searched / exception review / response owner / due date.",
          "DSR ticket: request type / received UTC / identity check method / systems searched / exception review / response owner / due date."
        ),
        explanation: t(
          "So‘rovni real shaxsdan olgandek ishlamang; lab’da sintetik profil qo‘llang. Qonuniy muddatni amaldagi matn va counsel bilan tekshiring.",
          "Не обрабатывайте запрос так, будто он получен от реального лица; в лабораторной используйте синтетический профиль. Проверяйте законный срок по актуальному тексту закона и с юристом.",
          "Do not process the request as if it came from a real individual; use a synthetic profile in the lab. Verify the legal deadline against the current text of the law and with counsel."
        ),
        prompt: t(
          "Shaxsga o‘z ma’lumotiga kirish imkonini beruvchi huquq?",
          "Право, дающее лицу доступ к своим данным?",
          "The right that gives a person access to their own data?"
        ),
        answers: ["right of access", "access", "kirish huquqi"]
      },
      {
        title: t("4. DPIA, privacy by design va risk", "4. DPIA, privacy by design и риск", "4. DPIA, privacy by design, and risk"),
        content: t(
          "DPIA processing shaxs huquqiga yuqori risk keltirishi mumkin bo‘lgan holatlarda tizimli tavsif, zarurat/proportionality, risk va mitigation’ni baholaydi. DPIA barcha loyiha uchun avtomatik talab emas; GDPR mezonlari, supervisory authority guidance va tashkilot threshold’i asosida baholanadi. DPO yoki privacy owner’ni erta jalb qiling.\n\nPrivacy by design/default’da default setting minimal ma’lumot, cheklangan retention, role-based access, pseudonymization, encryption va foydalanuvchiga shaffoflikni qo‘llab-quvvatlaydi. Data flow diagram va trust boundary texnik qarorni ko‘rsatadi. Qolgan yuqori riskni yashirmasdan huquqiy maslahat va kerakli supervisory consultation’ga yo‘naltiring.",
          "DPIA оценивает систематическое описание, необходимость/proportionality, риск и меры смягчения в случаях, когда обработка может повлечь высокий риск для прав лица. DPIA не является автоматическим требованием для всех проектов; его необходимость оценивается по критериям GDPR, рекомендациям supervisory authority и порогам организации. Привлекайте DPO или privacy owner на раннем этапе.\n\nВ privacy by design/default настройки по умолчанию должны поддерживать минимальный объём данных, ограниченный срок хранения, role-based доступ, псевдонимизацию, шифрование и прозрачность для пользователя. Диаграмма потоков данных и границы доверия показывают техническое решение. Не скрывайте оставшийся высокий риск — направляйте его на юридическую консультацию и необходимую консультацию с надзорным органом.",
          "A DPIA assesses the systematic description, necessity/proportionality, risk, and mitigation where processing may pose a high risk to individuals' rights. A DPIA is not an automatic requirement for every project; its necessity is assessed against GDPR criteria, supervisory authority guidance, and the organization's threshold. Involve the DPO or privacy owner early.\n\nIn privacy by design/default, default settings should support minimal data, limited retention, role-based access, pseudonymization, encryption, and transparency to the user. A data flow diagram and trust boundaries illustrate the technical decision. Do not hide remaining high risk — route it to legal advice and any required supervisory consultation."
        ),
        example: t(
          "DPIA outline: processing / necessity / data flow / affected people / risk scenario / safeguards / residual risk / approval.",
          "DPIA outline: processing / necessity / data flow / affected people / risk scenario / safeguards / residual risk / approval.",
          "DPIA outline: processing / necessity / data flow / affected people / risk scenario / safeguards / residual risk / approval."
        ),
        explanation: t(
          "DPIA shabloni legal determination emas. Yuqori residual risk holatini DPO/legal counsel orqali baholang.",
          "Шаблон DPIA не является юридическим заключением. Оценивайте случаи высокого остаточного риска через DPO/legal counsel.",
          "A DPIA template is not a legal determination. Assess cases of high residual risk through the DPO/legal counsel."
        ),
        prompt: t(
          "Yuqori data protection riskini tizimli baholash hujjati?",
          "Документ для систематической оценки высокого риска защиты данных?",
          "The document for systematically assessing high data-protection risk?"
        ),
        answers: ["dpia", "data protection impact assessment"]
      },
      {
        title: t("5. Processor, supplier va xalqaro uzatish", "5. Processor, поставщики и международная передача данных", "5. Processors, suppliers, and international transfers"),
        content: t(
          "Processor bilan shartnoma processing subject, duration, purpose, data type, instruction, confidentiality, security, subprocessor, rights assistance, breach notice, deletion/return va audit bo‘yicha talablarni belgilaydi. Supplier risk assessment’da service dependency, access, data location, support channel, resilience va exit plan ko‘rib chiqiladi.\n\nEEA/uchinchi davlat transfer qoidalari va transfer mechanism’lari o‘zgarishi mumkin; adequacy, safeguards va supplementary measure’larni amaldagi qonun hamda EDPB guidance bo‘yicha baholang. Region tanlashning o‘zi barcha transfer majburiyatini hal qilmaydi. Vendor security claim’ini mustaqil evidence va contract bilan tekshiring.",
          "Договор с processor определяет требования по предмету обработки, сроку, цели, типу данных, инструкциям, конфиденциальности, безопасности, субпроцессорам, содействию в реализации прав, уведомлению об утечках, удалению/возврату данных и аудиту. В оценке риска поставщика рассматриваются зависимость от сервиса, доступ, расположение данных, каналы поддержки, устойчивость и план выхода.\n\nПравила передачи данных в ЕЭЗ/третьи страны и механизмы передачи могут меняться; оценивайте adequacy, safeguards и дополнительные меры (supplementary measures) по действующему законодательству и рекомендациям EDPB. Сам по себе выбор региона не решает всех обязательств по передаче данных. Проверяйте заявления вендора о безопасности независимыми доказательствами и договором.",
          "The contract with a processor sets requirements covering the subject matter, duration, purpose, data type, instructions, confidentiality, security, subprocessors, assistance with rights, breach notice, deletion/return, and audit. A supplier risk assessment considers service dependency, access, data location, support channels, resilience, and the exit plan.\n\nRules for transfers to the EEA/third countries and transfer mechanisms can change; assess adequacy, safeguards, and supplementary measures against current law and EDPB guidance. Choosing a region alone does not resolve all transfer obligations. Verify a vendor's security claims with independent evidence and the contract."
        ),
        example: t(
          "Supplier map: data categories / processing role / subprocessor / transfer location / security evidence / exit/deletion.",
          "Supplier map: data categories / processing role / subprocessor / transfer location / security evidence / exit/deletion.",
          "Supplier map: data categories / processing role / subprocessor / transfer location / security evidence / exit/deletion."
        ),
        explanation: t(
          "Haqiqiy DPA yoki supplier report’ni ommaga chiqarmang. Transfer bo‘yicha qarorni yuridik va privacy mutaxassisi bilan tasdiqlang.",
          "Не публикуйте реальный DPA или отчёт поставщика. Подтверждайте решение о передаче данных совместно с юристом и специалистом по privacy.",
          "Do not publish a real DPA or supplier report. Confirm transfer decisions together with legal and privacy specialists."
        ),
        prompt: t(
          "Controller nomidan shaxsiy ma’lumotni qayta ishlaydigan taraf?",
          "Сторона, обрабатывающая персональные данные от имени controller?",
          "The party that processes personal data on behalf of the controller?"
        ),
        answers: ["processor", "qayta ishlovchi"]
      },
      {
        title: t("6. Personal data breach va 72 soatlik jarayon", "6. Нарушение персональных данных и 72-часовой процесс", "6. Personal data breach and the 72-hour process"),
        content: t(
          "Personal data breach confidentiality, integrity yoki availability’ga ta’sir qiluvchi security breach bo‘lishi mumkin. Incidentni tasniflashda ma’lumot turi, subject soni, shifrlash, real access, ehtimoliy zarar va containment ko‘rib chiqiladi. GDPR Article 33 bo‘yicha controller, tegishli holatlarda, supervisory authority’ga xabarnomani imkon qadar tez va odatda xabardor bo‘lganidan keyin 72 soatdan kechiktirmay yuboradi; breach huquq va erkinliklarga risk tug‘dirishi ehtimoli bo‘lmasa istisno qo‘llanishi mumkin. Processor controller’ni undue delay’siz xabardor qiladi. Article 34 bo‘yicha yuqori risk holatlarida data subject’ga ham undue delay’siz xabar berish talabi bo‘lishi mumkin.\n\nSubprocessor va internal team escalation muddatni kutmasdan ishga tushsin. Incident log’da aniqlash va awareness vaqti, scope, data, ta’sir, chora, risk, notification qarori va approver qayd etilsin. Har bir breach data subject’ga xabarni avtomatik anglatmaydi; istisno va threshold’ni legal/DPO owner bilan baholang, sababni hujjatlashtiring.",
          "Personal data breach — это нарушение безопасности, затрагивающее confidentiality, integrity или availability. При классификации инцидента учитываются тип данных, число субъектов, шифрование, реальный доступ, вероятный ущерб и меры сдерживания (containment). Согласно GDPR Article 33 controller, в соответствующих случаях, уведомляет supervisory authority как можно быстрее и, как правило, не позднее 72 часов после того, как узнал об инциденте; исключение может применяться, если breach вряд ли повлечёт риск для прав и свобод. Processor уведомляет controller без неоправданной задержки (undue delay). Согласно Article 34, в случаях высокого риска может также требоваться уведомление data subject без неоправданной задержки.\n\nЭскалация к субпроцессорам и внутренним командам должна запускаться немедленно, не дожидаясь истечения срока. В журнале инцидента фиксируются время обнаружения и осведомлённости, scope, данные, воздействие, меры, риск, решение об уведомлении и approver. Не каждое нарушение автоматически означает уведомление data subject; оценивайте исключения и пороги с legal/DPO owner и документируйте причину.",
          "A personal data breach is a security breach affecting confidentiality, integrity, or availability. Classifying the incident considers the type of data, number of subjects, encryption, actual access, likely harm, and containment measures. Under GDPR Article 33, the controller, where applicable, notifies the supervisory authority as quickly as possible and typically no later than 72 hours after becoming aware; an exception may apply if the breach is unlikely to result in a risk to rights and freedoms. The processor notifies the controller without undue delay. Under Article 34, high-risk cases may also require notifying the data subject without undue delay.\n\nEscalation to subprocessors and internal teams should begin immediately, without waiting for the deadline. The incident log records the time of detection and awareness, scope, data, impact, measures, risk, notification decision, and approver. Not every breach automatically means notifying the data subject; assess exceptions and thresholds with the legal/DPO owner and document the reasoning."
        ),
        example: t(
          "Tabletop timeline: detection → privacy/security escalation → scope → risk decision → authority/data subject decision → evidence → lessons.",
          "Tabletop timeline: detection → privacy/security escalation → scope → risk decision → authority/data subject decision → evidence → lessons.",
          "Tabletop timeline: detection → privacy/security escalation → scope → risk decision → authority/data subject decision → evidence → lessons."
        ),
        explanation: t(
          "72 soatdan kech xabar berilsa kechikish sababi ko‘rsatilishi kerak. Bu darslik legal advice emas; aniq deadline, risk threshold va notification matnini counsel/DPO hamda supervisory authority guidance’dan tekshiring.",
          "Если уведомление отправлено позже 72 часов, должна быть указана причина задержки. Данный урок не является юридической консультацией; уточняйте точный срок, пороги риска и текст уведомления у counsel/DPO и в рекомендациях supervisory authority.",
          "If notification is sent later than 72 hours, the reason for the delay must be stated. This lesson is not legal advice; verify the exact deadline, risk thresholds, and notification wording with counsel/DPO and supervisory authority guidance."
        ),
        prompt: t(
          "GDPR breach xabarini supervisory authority’ga yuborish bo‘yicha controllerning birinchi darajali mas’ul roli?",
          "Роль, несущая первичную ответственность controller за уведомление supervisory authority о breach по GDPR?",
          "The role bearing the controller's primary responsibility for notifying the supervisory authority of a breach under GDPR?"
        ),
        answers: ["controller", "nazorat qiluvchi"]
      },
      {
        title: t("7. Retention, minimallashtirish va privacy-preserving telemetry", "7. Хранение, минимизация и privacy-preserving телеметрия", "7. Retention, minimization, and privacy-preserving telemetry"),
        content: t(
          "Storage limitation ma’lumotni belgilangan maqsad uchun zarur muddatdan ortiq saqlamaslikni talab qiladi; universal retention raqami yo‘q. Retention schedule’da data category, trigger, period, legal hold, backup expiry, deletion method va owner bo‘lsin. O‘chirish operatsiyasi auditli va tiklanish xavfiga mos bo‘lishi kerak.\n\nSecurity logging xavfsizlik uchun kerak bo‘lsa ham, ortiqcha payload, token, parol va sensitive category yozmang. Pseudonymization, aggregation, access logging, encryption, sampling va short retention’ni ko‘rib chiqing. Kichik cohort’ni agregatsiya qilish qayta aniqlash xavfini bartaraf etmaydi. Privacy risk assessment’da downstream analytics va vendor sharing’ni ham qo‘shing.",
          "Принцип storage limitation требует не хранить данные дольше, чем это необходимо для заявленной цели; универсального числа для срока хранения не существует. В графике хранения (retention schedule) должны быть указаны категория данных, триггер, период, legal hold, срок истечения резервных копий, метод удаления и owner. Операция удаления должна быть подотчётна (auditable) и соразмерна риску восстановления.\n\nХотя security logging необходим для безопасности, не записывайте избыточные payload, токены, пароли и чувствительные категории данных. Рассмотрите псевдонимизацию, агрегацию, логирование доступа, шифрование, сэмплирование и короткий срок хранения. Агрегация небольшой когорты не устраняет риск повторной идентификации. Включайте в оценку privacy-риска также downstream-аналитику и обмен данными с поставщиками.",
          "The storage limitation principle requires not keeping data longer than necessary for the stated purpose; there is no universal retention number. The retention schedule should specify the data category, trigger, period, legal hold, backup expiry, deletion method, and owner. The deletion operation must be auditable and proportionate to restoration risk.\n\nAlthough security logging is necessary for security, do not record excessive payloads, tokens, passwords, or sensitive categories. Consider pseudonymization, aggregation, access logging, encryption, sampling, and short retention. Aggregating a small cohort does not eliminate the risk of re-identification. Include downstream analytics and vendor sharing in the privacy risk assessment as well."
        ),
        example: t(
          "Retention table: purpose / category / source / active period / archive / deletion trigger / backup expiry / exception.",
          "Retention table: purpose / category / source / active period / archive / deletion trigger / backup expiry / exception.",
          "Retention table: purpose / category / source / active period / archive / deletion trigger / backup expiry / exception."
        ),
        explanation: t(
          "Periodlarni yuridik majburiyat, biznes maqsadi va privacy riskga qarab belgilang; universal qiymat yo‘q.",
          "Определяйте периоды хранения исходя из юридических обязательств, бизнес-цели и privacy-риска; универсального значения не существует.",
          "Determine retention periods based on legal obligations, business purpose, and privacy risk; there is no universal value."
        ),
        prompt: t(
          "Shaxsni bevosita ko‘rsatmaydigan, ammo qo‘shimcha kalit bilan qayta bog‘lanishi mumkin bo‘lgan ma’lumot?",
          "Данные, которые напрямую не указывают на лицо, но могут быть повторно связаны с ним с помощью дополнительного ключа?",
          "Data that does not directly identify a person but can be re-linked to them using an additional key?"
        ),
        answers: ["pseudonymized data", "pseudonymisation", "pseudonimlashtirilgan"]
      },
      {
        title: t("8. Privacy governance va amaliy cheklovlar", "8. Privacy governance и практические ограничения", "8. Privacy governance and practical limitations"),
        content: t(
          "Privacy program ROPA, policy, training, DSR workflow, DPIA trigger, supplier review, incident process, retention, access control va audit evidence’ni yagona ownership bilan boshqaradi. DPO vazifasi va mustaqilligi tashkilot hamda qonuniy shartlarga bog‘liq; har jamoaga avtomatik DPO kerak deb bo‘lmaydi.\n\nSenior privacy engineer/legal partner texnik dizaynni huquqiy talab bilan bog‘laydi, ammo muhandis yakka o‘zi qonuniy talqin bermasligi kerak. Mahalliy qonunlar, sektor talabi, sud qarori va EDPB guidance yangilanib turadi. Kurs materialini loyiha boshlanishida tekshiring, real vaziyat bo‘yicha counsel’ga murojaat qiling va privacy notice’ni processing amaliyotiga mos tuting.",
          "Программа privacy управляет ROPA, политиками, обучением, workflow DSR, триггерами DPIA, проверкой поставщиков, процессом реагирования на инциденты, хранением, контролем доступа и доказательствами аудита в рамках единого владения (ownership). Роль и независимость DPO зависят от организации и законодательных требований; нельзя утверждать, что каждой команде автоматически нужен DPO.\n\nSenior privacy engineer/юридический партнёр связывает техническое проектирование с правовыми требованиями, но инженер не должен единолично давать юридическое толкование. Местное законодательство, отраслевые требования, судебные решения и рекомендации EDPB постоянно обновляются. Проверяйте материал курса в начале проекта, обращайтесь к counsel по конкретной ситуации и приводите privacy notice в соответствие с фактической практикой обработки данных.",
          "A privacy program manages the ROPA, policies, training, DSR workflow, DPIA triggers, supplier review, incident process, retention, access control, and audit evidence under single ownership. The DPO's role and independence depend on the organization and legal requirements; it cannot be assumed that every team automatically needs a DPO.\n\nA senior privacy engineer/legal partner connects technical design with legal requirements, but the engineer alone should not provide legal interpretation. Local laws, sector requirements, court rulings, and EDPB guidance are continually updated. Verify the course material at the start of a project, consult counsel for the actual situation, and align the privacy notice with actual processing practice."
        ),
        example: t(
          "Privacy review gate: data purpose / lawful basis owner / DPIA check / transfer / retention / security / notice / approval.",
          "Privacy review gate: data purpose / lawful basis owner / DPIA check / transfer / retention / security / notice / approval.",
          "Privacy review gate: data purpose / lawful basis owner / DPIA check / transfer / retention / security / notice / approval."
        ),
        explanation: t(
          "Ushbu dars ta’limiy va yurisdiksiya bo‘yicha legal advice emas. Rasmiy GDPR matni va hozirgi guidance’ni tekshiring.",
          "Этот урок носит образовательный характер и не является юридической консультацией по конкретной юрисдикции. Сверяйтесь с официальным текстом GDPR и актуальными рекомендациями.",
          "This lesson is educational in nature and is not jurisdiction-specific legal advice. Check the official GDPR text and current guidance."
        ),
        prompt: t(
          "GDPR bo‘yicha rasmiy supervisory guidance chiqaruvchi Yevropa organi qisqartmasi?",
          "Аббревиатура европейского органа, издающего официальные рекомендации supervisory по GDPR?",
          "The abbreviation for the European body that issues official supervisory guidance under GDPR?"
        ),
        answers: ["edpb", "european data protection board"]
      }
    ]
  }),
  book({
    slug: "senior-infrastructure-architecture",
    title: t("Senior infratuzilma va xavfsizlik arxitekturasi", "Senior-инфраструктура и архитектура безопасности", "Senior infrastructure and security architecture"),
    summary: t(
      "Senior/lead darajadagi reliability, architecture decision, risk appetite, capacity, disaster recovery, supplier governance va texnik rahbarlikni o‘rgatuvchi capstone darslik.",
      "Капстоун-курс для уровня senior/lead, обучающий reliability, принятию архитектурных решений, risk appetite, планированию мощности, disaster recovery, управлению поставщиками и техническому лидерству.",
      "A capstone course for senior/lead level, teaching reliability, architecture decision-making, risk appetite, capacity planning, disaster recovery, supplier governance, and technical leadership."
    ),
    category: "security", difficulty: "hard", hours: 32,
    labPlan: t(
      "Sintetik biznes holati uchun arxitektura qaror yozuvi, failure-mode tahlili, RTO/RPO, threat model, audit evidence va executive brief tayyorlash.",
      "Подготовка записи архитектурного решения, анализа failure-mode, RTO/RPO, модели угроз, доказательств аудита и executive brief для синтетического бизнес-кейса.",
      "Preparing an architecture decision record, failure-mode analysis, RTO/RPO, threat model, audit evidence, and executive brief for a synthetic business case."
    ),
    references: [
      reference(t("NIST Cybersecurity Framework 2.0", "NIST Cybersecurity Framework 2.0", "NIST Cybersecurity Framework 2.0"), "https://www.nist.gov/cyberframework"),
      reference(t("NIST SP 800-34 Rev. 1 — contingency planning", "NIST SP 800-34 Rev. 1 — планирование непрерывности (contingency planning)", "NIST SP 800-34 Rev. 1 — contingency planning"), "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final"),
      reference(t("Google SRE Workbook", "Google SRE Workbook", "Google SRE Workbook"), "https://sre.google/workbook/table-of-contents/"),
      reference(t("NIST NICE Framework — work roles and competencies", "NIST NICE Framework — рабочие роли и компетенции", "NIST NICE Framework — work roles and competencies"), "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center"),
      reference(t("NIST SP 800-181 Rev. 1 — NICE Framework", "NIST SP 800-181 Rev. 1 — NICE Framework", "NIST SP 800-181 Rev. 1 — NICE Framework"), "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-181r1.pdf")
    ],
    chapters: [
      {
        title: t("1. Architecture decision, trade-off va ADR", "1. Архитектурные решения, компромиссы и ADR", "1. Architecture decisions, trade-offs, and ADRs"),
        content: t(
          "Senior arxitektor talab va cheklovlarni aniqlab, variantlarni cost, reliability, security, privacy, operability, team skill va exit cost bo‘yicha solishtiradi. ADR qarorni, ko‘rib chiqilgan alternativani, sababni, ta’sirni va review trigger’ni saqlaydi. “Best practice” kontekstsiz qo‘llansa, yangi failure mode yoki operatsion yuk yaratishi mumkin.\n\nDecision owner va risk owner’ni farqlang; kim qaror qilishi, kim maslahat berishi va kim bajarishi aniq bo‘lsin. Assumption va uncertainty’ni yashirmang. Arxitektura diagrammasi trust boundary, data flow, dependency, failure domain va monitoring’ni ko‘rsatsin.",
          "Senior-архитектор выявляет требования и ограничения и сравнивает варианты по cost, reliability, security, privacy, operability, навыкам команды и стоимости выхода (exit cost). ADR фиксирует решение, рассмотренные альтернативы, обоснование, последствия и триггер пересмотра. Применение «best practice» без учёта контекста может создать новый failure mode или операционную нагрузку.\n\nРазличайте decision owner и risk owner; должно быть ясно, кто принимает решение, кто консультирует и кто исполняет. Не скрывайте допущения (assumptions) и неопределённость. Архитектурная диаграмма должна показывать границы доверия (trust boundary), поток данных, зависимости, домены отказа (failure domain) и мониторинг.",
          "A senior architect identifies requirements and constraints and compares options by cost, reliability, security, privacy, operability, team skill, and exit cost. An ADR records the decision, the alternatives considered, the rationale, the consequences, and the review trigger. Applying a \"best practice\" without context can create a new failure mode or operational burden.\n\nDistinguish the decision owner from the risk owner; it should be clear who decides, who advises, and who executes. Do not hide assumptions and uncertainty. The architecture diagram should show trust boundaries, data flow, dependencies, failure domains, and monitoring."
        ),
        example: t(
          "ADR table: context / options / decision / consequences / risks / owner / revisit trigger.",
          "ADR table: context / options / decision / consequences / risks / owner / revisit trigger.",
          "ADR table: context / options / decision / consequences / risks / owner / revisit trigger."
        ),
        explanation: t(
          "Hujjatda mijoz, provayder yoki ichki tarmoqning maxfiy detalini oshkor qilmang.",
          "Не раскрывайте в документе конфиденциальные детали клиента, провайдера или внутренней сети.",
          "Do not disclose confidential client, provider, or internal network details in the document."
        ),
        prompt: t(
          "Muqobil yechimlar va qaror oqibatlarini qayd etuvchi hujjat?",
          "Документ, фиксирующий альтернативные решения и последствия решения?",
          "The document that records alternative solutions and the consequences of a decision?"
        ),
        answers: ["adr", "architecture decision record"]
      },
      {
        title: t("2. Reliability, SLI/SLO, error budget va failure mode", "2. Reliability, SLI/SLO, error budget и failure mode", "2. Reliability, SLI/SLO, error budget, and failure modes"),
        content: t(
          "Reliability service contract va user journey bilan boshlanadi. SLI o‘lchanadigan ko‘rsatkich, SLO maqsad, SLA esa shartnomaviy va’da bo‘lishi mumkin; ularni bir xil deb ishlatmang. Error budget release tezligi va reliability investitsiyasini muhokama qilishga yordam beradi. Latency’da p50/p95/p99, availability’da successful request va denominator’ni aniq tanlang.\n\nFMEA/failure-mode analysis component failure, detection, impact, recovery control’ni sistematik ko‘rib chiqadi. Dependency outage, DNS, identity, certificate, quota, regional outage, clock, human error va data corruption’ni model qiling. Alert symptom’ga yaqin bo‘lsin; root cause alerting noise’ni kuchaytirishi mumkin.",
          "Reliability начинается с контракта сервиса и пользовательского пути (user journey). SLI — это измеримый показатель, SLO — цель, а SLA может быть договорным обязательством; не используйте эти термины как синонимы. Error budget помогает обсуждать скорость релизов и инвестиции в reliability. Для latency чётко выбирайте p50/p95/p99, а для availability — успешный запрос и знаменатель.\n\nFMEA/анализ failure-mode систематически рассматривает отказ компонента, обнаружение, воздействие и меры восстановления. Моделируйте отказ зависимостей, DNS, identity, сертификатов, квот, региональные сбои, рассинхронизацию часов, человеческий фактор и повреждение данных. Алерт должен быть близок к симптому; алертинг по первопричине (root cause) может усилить шум оповещений.",
          "Reliability starts with the service contract and the user journey. An SLI is a measurable indicator, an SLO is a target, and an SLA may be a contractual commitment; do not use these terms interchangeably. Error budgets help discuss release velocity and reliability investment. For latency, clearly choose p50/p95/p99, and for availability, choose the successful request and the denominator.\n\nFMEA/failure-mode analysis systematically reviews component failure, detection, impact, and recovery controls. Model dependency outages, DNS, identity, certificates, quotas, regional outages, clock drift, human error, and data corruption. Alerts should be close to the symptom; alerting on root cause can amplify alert noise."
        ),
        example: t(
          "SLI: muvaffaqiyatli request / barcha valid request; SLO: belgilangan oynadagi foiz va exclusion qoidasi.",
          "SLI: успешный запрос / все валидные запросы; SLO: процент в заданном окне и правило исключений.",
          "SLI: successful request / all valid requests; SLO: percentage within a defined window and the exclusion rule."
        ),
        explanation: t(
          "SLO qiymatini real user need, baseline va business risk’dan oling; bu universal target emas.",
          "Определяйте значение SLO на основе реальных потребностей пользователей, базового уровня и бизнес-риска; универсальной цели не существует.",
          "Derive the SLO value from real user needs, baseline, and business risk; there is no universal target."
        ),
        prompt: t(
          "Service level indicator qisqartmasi?",
          "Аббревиатура service level indicator?",
          "The abbreviation for service level indicator?"
        ),
        answers: ["sli", "service level indicator"]
      },
      {
        title: t("3. Capacity, scalability va iqtisodiy qaror", "3. Capacity, scalability и экономические решения", "3. Capacity, scalability, and economic decisions"),
        content: t(
          "Capacity planning traffic, concurrency, storage growth, retention, CPU/memory, I/O, network egress, quota va peak season’ni o‘lchaydi. Autoscaling latency yoki queue depth bo‘yicha ishlashi mumkin, ammo cold start, downstream limit va cost spike’ni hisobga olsin. Load test faqat test data va muhitda, tasdiqlangan scope va rate limit bilan bajariladi.\n\nVertical/horizontal scale, caching, batching, async queue va data partition’ning trade-off’larini yozing. Unit economics va cost allocation tag’lari platforma boshqaruvining bir qismi. Kutilmagan xarajat incident signal bo‘lishi mumkin, lekin avval deployment, usage pattern, quota va billing delay’ni tasdiqlang.",
          "Capacity planning измеряет трафик, concurrency, рост хранилища, срок хранения, CPU/память, I/O, исходящий сетевой трафик, квоты и пиковый сезон. Autoscaling может работать по latency или глубине очереди (queue depth), но должен учитывать cold start, лимиты зависимых сервисов (downstream limit) и всплески стоимости (cost spike). Нагрузочное тестирование проводится только на тестовых данных и в тестовой среде, с согласованным scope и ограничением скорости (rate limit).\n\nФиксируйте компромиссы вертикального/горизонтального масштабирования, кэширования, батчинга, асинхронных очередей и партиционирования данных. Unit economics и теги cost allocation являются частью управления платформой. Неожиданные расходы могут быть сигналом инцидента, но сначала подтвердите развёртывание, паттерн использования, квоты и задержку биллинга.",
          "Capacity planning measures traffic, concurrency, storage growth, retention, CPU/memory, I/O, network egress, quotas, and peak season. Autoscaling may operate on latency or queue depth, but should account for cold start, downstream limits, and cost spikes. Load testing is performed only on test data and in a test environment, with an agreed scope and rate limit.\n\nDocument the trade-offs of vertical/horizontal scaling, caching, batching, async queues, and data partitioning. Unit economics and cost allocation tags are part of platform governance. Unexpected spend can be an incident signal, but first confirm deployments, usage patterns, quotas, and billing delay."
        ),
        example: t(
          "Forecast: baseline / peak / growth / retention / headroom / quota / cost per unit / trigger / owner.",
          "Forecast: baseline / peak / growth / retention / headroom / quota / cost per unit / trigger / owner.",
          "Forecast: baseline / peak / growth / retention / headroom / quota / cost per unit / trigger / owner."
        ),
        explanation: t(
          "Load test target’a ruxsat bo‘lishi shart; provider quota va billing exposure’ni oldindan tekshiring.",
          "Нагрузочное тестирование требует разрешения на целевую систему; заранее проверьте квоты провайдера и подверженность расходам (billing exposure).",
          "Load testing requires permission on the target; check provider quotas and billing exposure in advance."
        ),
        prompt: t(
          "Traffic oshganda resursni avtomatik ko‘paytirish/buxtirish capability?",
          "Возможность автоматического увеличения/уменьшения ресурсов при росте трафика?",
          "The capability to automatically increase/decrease resources as traffic grows?"
        ),
        answers: ["autoscaling", "auto scaling"]
      },
      {
        title: t("4. Business continuity, backup va disaster recovery", "4. Business continuity, резервное копирование и disaster recovery", "4. Business continuity, backup, and disaster recovery"),
        content: t(
          "Business impact analysis muhim process, dependency, acceptable downtime va data loss’ni belgilaydi. RTO tiklash vaqti, RPO qabul qilinadigan ma’lumot yo‘qotish oralig‘i. Hot/warm/cold recovery usuli cost, recovery speed, data consistency va staffing bilan farq qiladi.\n\nDR plan’da trigger, decision authority, contact, backup key, network/DNS, identity, vendor, restore order, validation va return-to-primary bosqichi bo‘lsin. Backup integrity, immutable copy, access separation va restore testni ko‘rsating. Failover drill vaqtida customer impact va data residency’ni ham tekshiring; faqat “replica bor” degani disaster readiness emas.",
          "Business impact analysis определяет критичные процессы, зависимости, допустимое время простоя и допустимую потерю данных. RTO — это время восстановления, RPO — допустимый интервал потери данных. Методы восстановления hot/warm/cold различаются по стоимости, скорости восстановления, согласованности данных и требуемому персоналу.\n\nПлан DR должен включать триггер, орган принятия решения, контакты, ключи резервных копий, сеть/DNS, identity, поставщиков, порядок восстановления, валидацию и этап возврата на основную систему (return-to-primary). Продемонстрируйте целостность резервных копий, неизменяемые (immutable) копии, разделение доступа и тестирование восстановления. Во время учений по failover также проверяйте влияние на клиентов и data residency; наличие «реплики» само по себе не означает готовности к катастрофам.",
          "A business impact analysis determines critical processes, dependencies, acceptable downtime, and acceptable data loss. RTO is the recovery time, RPO is the acceptable data-loss interval. Hot/warm/cold recovery methods differ in cost, recovery speed, data consistency, and staffing requirements.\n\nThe DR plan should include the trigger, decision authority, contacts, backup keys, network/DNS, identity, vendors, restore order, validation, and the return-to-primary stage. Demonstrate backup integrity, immutable copies, access separation, and restore testing. During a failover drill, also check customer impact and data residency; merely having a \"replica\" does not mean disaster readiness."
        ),
        example: t(
          "DR runbook: trigger / approver / dependency order / restore / validation / communication / failback / evidence.",
          "DR runbook: trigger / approver / dependency order / restore / validation / communication / failback / evidence.",
          "DR runbook: trigger / approver / dependency order / restore / validation / communication / failback / evidence."
        ),
        explanation: t(
          "Mashqni izolyatsiyalangan lab’da bajaring; prod failover uchun business owner va change authority roziligi zarur.",
          "Проводите учения в изолированной лаборатории; для failover в production требуется согласие business owner и органа управления изменениями (change authority).",
          "Run drills in an isolated lab; production failover requires approval from the business owner and change authority."
        ),
        prompt: t(
          "Tiklashdan keyin qabul qilinadigan ma’lumot yo‘qotish oynasi?",
          "Допустимое окно потери данных после восстановления?",
          "The acceptable data-loss window after recovery?"
        ),
        answers: ["rpo"]
      },
      {
        title: t("5. Security/privacy architecture va residual risk", "5. Архитектура security/privacy и остаточный риск", "5. Security/privacy architecture and residual risk"),
        content: t(
          "Architecture review identity plane, management plane, data plane, trust boundary, secrets, logging, encryption, supplier, recovery, privacy rights va deletion path’ni qamrab oladi. Defense in depth bir xil nosoz control’ni takrorlash emas; qatlamlar turli failure mode’ni kamaytirishi kerak. Threat model va DPIA/ISMS risk register’lar o‘zaro reference’ga ega bo‘lsin.\n\nControl mavjudligini configuration, test va telemetry dalili bilan tekshiring. Residual risk’ni risk owner qabul qiladi; engineering lead o‘z vakolatidan tashqaridagi riskni yashirmaydi. Emergency exception scope va expiry bilan bo‘lsin. Security acceptance’ni release gate, support model va incident runbook’ga bog‘lang.",
          "Архитектурный обзор охватывает identity plane, management plane, data plane, границы доверия (trust boundary), секреты, логирование, шифрование, поставщиков, восстановление, права на privacy и путь удаления данных. Defense in depth — это не повторение одного и того же неисправного контроля; слои должны снижать разные failure mode. Модель угроз и реестры риска DPIA/ISMS должны иметь перекрёстные ссылки друг на друга.\n\nПроверяйте наличие контроля доказательствами конфигурации, тестов и телеметрии. Остаточный риск (residual risk) принимает risk owner; engineering lead не скрывает риск, выходящий за рамки его полномочий. Экстренное исключение должно иметь scope и срок действия. Привязывайте одобрение безопасности (security acceptance) к release gate, модели поддержки и runbook по инцидентам.",
          "The architecture review covers the identity plane, management plane, data plane, trust boundaries, secrets, logging, encryption, suppliers, recovery, privacy rights, and the deletion path. Defense in depth is not repeating the same faulty control; layers should mitigate different failure modes. The threat model and the DPIA/ISMS risk registers should cross-reference each other.\n\nVerify the existence of a control with configuration, test, and telemetry evidence. The risk owner accepts residual risk; the engineering lead does not hide risk beyond their authority. An emergency exception should have a scope and expiry. Tie security acceptance to the release gate, support model, and incident runbook."
        ),
        example: t(
          "Review: data / identity / trust boundary / threats / controls / evidence / residual risk / owner / expiry.",
          "Review: data / identity / trust boundary / threats / controls / evidence / residual risk / owner / expiry.",
          "Review: data / identity / trust boundary / threats / controls / evidence / residual risk / owner / expiry."
        ),
        explanation: t(
          "Review shabloni huquqiy, xavfsizlik yoki sertifikatlash qarorini avtomatik chiqarmaydi.",
          "Шаблон review не выносит автоматически юридическое, security-решение или решение о сертификации.",
          "The review template does not automatically produce a legal, security, or certification decision."
        ),
        prompt: t(
          "Nazoratdan keyin ham qolayotgan xavf?",
          "Риск, остающийся даже после применения контроля?",
          "The risk remaining even after controls are applied?"
        ),
        answers: ["residual risk", "qolgan risk"]
      },
      {
        title: t("6. Change governance, supplier va service ownership", "6. Change governance, поставщики и ownership сервисов", "6. Change governance, suppliers, and service ownership"),
        content: t(
          "Reliable change process urgency, risk, test evidence, approval, implementation owner, rollback, monitoring va communication’ni boshqaradi. CAB barcha kichik o‘zgarishlarga to‘siq bo‘lishi shart emas; standart, normal va emergency change’ni riskka mos ajrating. Emergency change’da keyingi review va evidence talabini bekor qilmang.\n\nService catalog’da owner, dependency, support window, data class, recovery target, vendor contact va lifecycle bo‘lsin. Supplier review SLA, incident notice, subprocessor, access, exit, audit evidence va resilience’ni qamrab oladi. Vendor lock-in va support end-of-life arxitektura qaroriga ta’sir qiladi.",
          "Надёжный процесс изменений управляет срочностью, риском, доказательствами тестирования, утверждением, владельцем внедрения, откатом, мониторингом и коммуникацией. CAB не должен быть препятствием для всех мелких изменений; разделяйте standard, normal и emergency change в соответствии с риском. При emergency change не отменяйте требование последующего review и доказательств.\n\nВ каталоге сервисов (service catalog) должны быть указаны owner, зависимости, окно поддержки, класс данных, целевое время восстановления, контакты поставщика и жизненный цикл. Обзор поставщиков охватывает SLA, уведомление об инцидентах, субпроцессоров, доступ, выход (exit), доказательства аудита и устойчивость. Привязка к вендору (vendor lock-in) и окончание поддержки (end-of-life) влияют на архитектурное решение.",
          "A reliable change process manages urgency, risk, test evidence, approval, implementation owner, rollback, monitoring, and communication. A CAB need not be a gate for every small change; separate standard, normal, and emergency changes according to risk. For an emergency change, do not waive the subsequent review and evidence requirement.\n\nThe service catalog should include the owner, dependencies, support window, data class, recovery target, vendor contact, and lifecycle. A supplier review covers the SLA, incident notice, subprocessors, access, exit, audit evidence, and resilience. Vendor lock-in and support end-of-life affect the architecture decision."
        ),
        example: t(
          "Service ownership card: accountable owner / technical owner / dependencies / support / recovery / supplier / review date.",
          "Service ownership card: accountable owner / technical owner / dependencies / support / recovery / supplier / review date.",
          "Service ownership card: accountable owner / technical owner / dependencies / support / recovery / supplier / review date."
        ),
        explanation: t(
          "Vendor contract va internal contact maxfiy bo‘lishi mumkin; o‘quv mashqida sintetik qiymat ishlating.",
          "Договор с вендором и внутренние контакты могут быть конфиденциальными; в учебном упражнении используйте синтетические значения.",
          "Vendor contracts and internal contacts may be confidential; use synthetic values in the training exercise."
        ),
        prompt: t(
          "Xizmatning biznes natijasi va riskiga yakuniy javob beruvchi rol?",
          "Роль, несущая конечную ответственность за бизнес-результат и риск сервиса?",
          "The role bearing ultimate responsibility for a service's business outcome and risk?"
        ),
        answers: ["service owner", "xizmat egasi"]
      },
      {
        title: t("7. Executive communication, mentorship va decision quality", "7. Коммуникация с руководством, менторство и качество решений", "7. Executive communication, mentorship, and decision quality"),
        content: t(
          "Lead muhandis rahbariyatga riskni ehtimol, ta’sir, variant, cost, vaqt, noaniqlik va qaror kerak bo‘lgan sana bilan tushuntiradi. “Critical vulnerability bor” kabi xabar asset, exposure, known exploitation evidence, mitigation, business impact va qaror owner’ini ko‘rsatishi kerak. Noaniqlikni yashirish qisqa muddatda qulay, uzoq muddatda ishonchni yemiradi.\n\nMentorship’da vazifani bajarib berishdan ko‘ra fikrlash jarayonini ko‘rsating: hypothesis, safe test, evidence, rollback va review. Jamoa incident’dan o‘rganishi uchun blameless culture va accountability ikkalasi ham zarur. Technical debt, on-call load, burnout va documentation quality’ni capacity rejasiga qo‘shing.",
          "Lead-инженер объясняет руководству риск в терминах вероятности, воздействия, вариантов, стоимости, времени, неопределённости и даты, к которой нужно решение. Сообщение вроде «есть критическая уязвимость» должно указывать актив, exposure, доказательства известной эксплуатации, меры смягчения, влияние на бизнес и владельца решения. Сокрытие неопределённости удобно в краткосрочной перспективе, но подрывает доверие в долгосрочной.\n\nВ менторстве показывайте процесс мышления, а не просто выполняйте задачу за другого: гипотеза, безопасный тест, доказательства, откат и review. Для того чтобы команда училась на инцидентах, нужны одновременно blameless-культура и accountability. Включайте технический долг, нагрузку дежурств (on-call load), выгорание и качество документации в план по мощности (capacity).",
          "A lead engineer explains risk to leadership in terms of probability, impact, options, cost, time, uncertainty, and the date by which a decision is needed. A message like \"there is a critical vulnerability\" should state the asset, exposure, evidence of known exploitation, mitigation, business impact, and the decision owner. Hiding uncertainty is convenient short-term but erodes trust long-term.\n\nIn mentorship, demonstrate the thinking process rather than just doing the task for someone else: hypothesis, safe test, evidence, rollback, and review. For a team to learn from incidents, both a blameless culture and accountability are needed. Include technical debt, on-call load, burnout, and documentation quality in capacity planning."
        ),
        example: t(
          "Executive brief: what happened / who impacted / current confidence / options / residual risk / decision requested.",
          "Executive brief: what happened / who impacted / current confidence / options / residual risk / decision requested.",
          "Executive brief: what happened / who impacted / current confidence / options / residual risk / decision requested."
        ),
        explanation: t(
          "Brieflar faqat kerakli auditoriyaga yuborilsin; incident tafsilotini public channel’da oshkor qilmang.",
          "Briefs должны направляться только нужной аудитории; не раскрывайте детали инцидента в публичном канале.",
          "Briefs should be sent only to the intended audience; do not disclose incident details in a public channel."
        ),
        prompt: t(
          "Noto‘g‘ri qaror uchun kim javob beradi va riskni rasmiy qabul qiladi?",
          "Кто отвечает за неверное решение и официально принимает риск?",
          "Who is responsible for a wrong decision and formally accepts the risk?"
        ),
        answers: ["decision owner", "risk owner"]
      },
      {
        title: t("8. Senior capstone: tizimni boshidan oxirigacha himoyalash", "8. Senior-капстоун: защита системы от начала до конца", "8. Senior capstone: securing a system end to end"),
        content: t(
          "Capstone’da sintetik kompaniya uchun asset inventory, context, architecture diagram, threat model, SLO, backup/DR, IAM matrix, logging plan, privacy review, ISO/GDPR mapping va incident playbook yarating. Har artefact bir xil scope va owner bilan bog‘langan bo‘lsin. Tavsiya etilgan control’lar biznes talabiga mosligi va residual risk bilan asoslanadi.\n\nNIST NICE work role va task/competency lug‘atini o‘quv natijalarini rollarga xaritalash uchun ishlating; vakansiya nomini framework roliga aynan tenglashtirmang. Rubrika: texnik aniqlik, operatsion bajariluvchanlik, recovery evidence, privacy minimization, risk ownership, cost/trade-off, testability va aniq yozuv. Capstone kurs yakuniy o‘quv ishi bo‘lib, ish tajribasi, akkreditatsiyalangan sertifikat yoki senior malaka tasdig‘i emas. Natijani portfolio’ga qo‘yishda faqat sintetik ma’lumot ishlating.",
          "В капстоуне создайте для синтетической компании asset inventory, контекст, архитектурную диаграмму, модель угроз, SLO, backup/DR, матрицу IAM, план логирования, privacy-review, сопоставление ISO/GDPR и playbook по инцидентам. Каждый артефакт должен быть связан единым scope и owner. Рекомендованные меры контроля обосновываются соответствием бизнес-требованиям и остаточным риском.\n\nИспользуйте словарь рабочих ролей и задач/компетенций NIST NICE для сопоставления результатов обучения с ролями; не приравнивайте название вакансии напрямую к роли из фреймворка. Критерии оценки: техническая точность, операционная выполнимость, доказательства восстановления, минимизация privacy, владение риском, стоимость/компромиссы, тестируемость и чёткое изложение. Капстоун — это итоговая учебная работа курса, а не подтверждение опыта работы, аккредитованный сертификат или подтверждение senior-квалификации. Размещая результат в портфолио, используйте только синтетические данные.",
          "In the capstone, create an asset inventory, context, architecture diagram, threat model, SLO, backup/DR, IAM matrix, logging plan, privacy review, ISO/GDPR mapping, and incident playbook for a synthetic company. Each artifact should share a consistent scope and owner. Recommended controls are justified by alignment with business requirements and residual risk.\n\nUse the NIST NICE work role and task/competency vocabulary to map learning outcomes to roles; do not equate a job title directly with a framework role. Rubric: technical accuracy, operational feasibility, recovery evidence, privacy minimization, risk ownership, cost/trade-offs, testability, and clear writing. The capstone is a final course assignment, not proof of work experience, an accredited certification, or confirmation of senior-level qualification. When adding the result to a portfolio, use only synthetic data."
        ),
        example: t(
          "Deliverables: 1) architecture + flows 2) risk register 3) control map 4) SLO/DR 5) incident exercise 6) executive summary 7) NICE task/competency evidence map.",
          "Deliverables: 1) architecture + flows 2) risk register 3) control map 4) SLO/DR 5) incident exercise 6) executive summary 7) NICE task/competency evidence map.",
          "Deliverables: 1) architecture + flows 2) risk register 3) control map 4) SLO/DR 5) incident exercise 6) executive summary 7) NICE task/competency evidence map."
        ),
        explanation: t(
          "Barcha artefactlar o‘zaro izchil, versiyalangan va synthetic bo‘lsin. Haqiqiy kompaniya dizaynini ruxsatsiz e’lon qilmang.",
          "Все артефакты должны быть взаимно согласованы, версионированы и синтетическими. Не публикуйте дизайн реальной компании без разрешения.",
          "All artifacts should be mutually consistent, versioned, and synthetic. Do not publish a real company's design without permission."
        ),
        prompt: t(
          "Senior capstone’ning texnik yechimdan tashqari asosiy baholash mezoni?",
          "Главный критерий оценки senior-капстоуна помимо технического решения?",
          "The main evaluation criterion for the senior capstone beyond the technical solution?"
        ),
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
