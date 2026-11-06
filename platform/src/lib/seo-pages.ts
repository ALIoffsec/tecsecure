export type SeoPage = {
  slug: string;
  twin: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  includesTitle: string;
  includes: string[];
  stepsTitle: string;
  steps: string[];
  faq: { q: string; a: string }[];
  cta: string;
  serviceName: string;
};

/**
 * Pages written for search engines and for people who search for one job. The language is in the
 * address, because crawlers cannot switch the site's language. The claims stay limited to what the
 * company does; prices and promises are left to the written proposal.
 */
export const seoPagesUz: SeoPage[] = [
  {
    slug: "toshkentda-videokuzatuv-ornatish", twin: "ustanovka-videonablyudeniya-tashkent", serviceName: "Videokuzatuv o‘rnatish",
    title: "Toshkentda videokuzatuv o‘rnatish | Tecsecure", description: "Ofis, do‘kon, ombor va uy uchun IP kameralarni loyihalash, o‘rnatish va sozlash. Yozuv saqlash va telefondan xavfsiz ko‘rish. Toshkent bo‘ylab.",
    heading: "Toshkentda videokuzatuv o‘rnatish", intro: "Ofis, do‘kon, ombor yoki uyingiz uchun kamera tizimini tanlaymiz, o‘rnatamiz va sozlaymiz. Tasvir aniq, yozuv kerakli muddat saqlanadi, telefondan ko‘rish esa xavfsiz bo‘ladi.",
    includesTitle: "Ishga nimalar kiradi", includes: ["Obyektni ko‘rish va kuzatuv nuqtalarini belgilash", "IP kamera, NVR va disk hajmini hisoblash", "Kabel yotqizish, PoE kommutator va montaj", "Telefon va kompyuterdan xavfsiz ko‘rishni sozlash", "Foydalanuvchilarga ko‘rsatma va topshirish"],
    stepsTitle: "Qanday ishlaymiz", steps: ["Ariza qoldirasiz yoki qo‘ng‘iroq qilasiz", "Obyektni ko‘rib, yozma taklif beramiz", "Kelishilgan muddatda o‘rnatib, sinab topshiramiz"],
    faq: [
      { q: "Yozuvlar necha kun saqlanadi?", a: "Bu kamera soni, tasvir sifati va disk hajmiga bog‘liq. Kerakli muddatni aytsangiz, disk hajmini shunga qarab hisoblaymiz." },
      { q: "Telefondan ko‘rsa bo‘ladimi?", a: "Ha. Kamerani internetga to‘g‘ridan-to‘g‘ri ochmasdan, xavfsiz usulda sozlaymiz." },
      { q: "Narxi qancha turadi?", a: "Narx kamera soni, kabel uzunligi va montaj sharoitiga bog‘liq. Obyektni ko‘rgach aniq taklif beramiz." }
    ],
    cta: "Narxni bilish"
  },
  {
    slug: "ofis-tarmogi-va-wifi-ornatish", twin: "lokalnaya-set-i-wifi-dlya-ofisa", serviceName: "Ofis tarmog‘i va Wi-Fi",
    title: "Ofis tarmog‘i va Wi-Fi o‘rnatish, Toshkent | Tecsecure", description: "Strukturalangan kabel tizimi, kommutator va butun ofisni qoplaydigan Wi-Fi. Internet sekinligi va uzilishlarni aniqlash va tuzatish.",
    heading: "Ofis tarmog‘i va Wi-Fi o‘rnatish", intro: "Internet tez-tez uzilyaptimi yoki Wi-Fi hamma joyga yetmayaptimi? Tarmog‘ingizni tekshiramiz, sababini topamiz va ishonchli tizim quramiz.",
    includesTitle: "Ishga nimalar kiradi", includes: ["Mavjud tarmoqni va Wi-Fi qamrovini tekshirish", "Kabel yo‘llari va tarmoq nuqtalarini rejalashtirish", "Router, kommutator va kirish nuqtalarini o‘rnatish", "Mehmon va ish tarmog‘ini ajratish", "Sinov natijalari va hujjatlarni topshirish"],
    stepsTitle: "Qanday ishlaymiz", steps: ["Vazifani va ish joylari sonini aytasiz", "Sxema va uskunalar ro‘yxatini kelishamiz", "Montaj, sozlash va sinovdan keyin topshiramiz"],
    faq: [
      { q: "Yangi kabel tortish shartmi?", a: "Har doim emas. Avval mavjud tarmoqni tekshiramiz, ko‘pincha sozlash va to‘g‘ri joylashtirish yetarli bo‘ladi." },
      { q: "Ish to‘xtab qoladimi?", a: "Ishni kelishilgan vaqtda, kerak bo‘lsa ish vaqtidan tashqari bajaramiz." },
      { q: "Taxminiy hajmni qanday bilaman?", a: "Saytimizdagi smeta kalkulyatorida bir daqiqada dastlabki ro‘yxatni olishingiz mumkin." }
    ],
    cta: "Ariza qoldirish"
  },
  {
    slug: "kiberxavfsizlik-auditi", twin: "audit-kiberbezopasnosti", serviceName: "Kiberxavfsizlik auditi",
    title: "Kiberxavfsizlik auditi, Toshkent | Tecsecure", description: "Tarmoq, server va ilovalaringizdagi zaifliklarni topamiz va tushunarli hisobot beramiz. Faqat yozma ruxsat asosida.",
    heading: "Kiberxavfsizlik auditi", intro: "Kompaniyangizdagi zaif joylarni hujumchilardan oldin topamiz. Natijada xavf darajasi va nimani birinchi tuzatish kerakligi yozilgan tushunarli hisobot olasiz.",
    includesTitle: "Ishga nimalar kiradi", includes: ["Qamrov va yozma ruxsatni kelishish", "Tarmoq, server va ilovalarni tekshirish", "Har bir topilma bo‘yicha xavf darajasi va dalil", "Rahbariyat uchun qisqa xulosa", "Tuzatish rejasi va qayta tekshiruv"],
    stepsTitle: "Qanday ishlaymiz", steps: ["Nimani tekshirishni birga belgilaymiz", "Kelishilgan vaqtda tekshiruv o‘tkazamiz", "Hisobotni topshirib, tuzatishda yordam beramiz"],
    faq: [
      { q: "Ishimizga xalaqit beradimi?", a: "Tekshiruv vaqti va usullari oldindan kelishiladi, faol ishlayotgan tizimlar ehtiyotkorlik bilan tekshiriladi." },
      { q: "Audit to‘liq xavfsizlikni kafolatlaydimi?", a: "Yo‘q. Audit tekshiruv vaqtidagi holatni ko‘rsatadi va eng muhim xavflarni kamaytirishga yordam beradi." },
      { q: "Qayerdan boshlasam bo‘ladi?", a: "Saytimizdagi 10 savollik xavfsizlik testini topshiring, u qaysi yo‘nalishga e’tibor berish kerakligini ko‘rsatadi." }
    ],
    cta: "Audit narxini so‘rash"
  },
  {
    slug: "kompaniyalar-uchun-it-yordam", twin: "it-podderzhka-dlya-kompanii", serviceName: "Kompaniyalar uchun IT yordam",
    title: "Kompaniyalar uchun oylik IT yordam, Toshkent | Tecsecure", description: "Doimiy IT xodim o‘rniga oylik xizmat: tarmoq, kompyuter, server va xavfsizlik nazorati, monitoring va tezkor yordam.",
    heading: "Kompaniyalar uchun oylik IT yordam", intro: "Doimiy IT xodim yollash qimmatmi yoki bitta odam hamma ishga ulgurmayaptimi? Tarmoq, kompyuter va serverlaringizni bizga topshiring, siz ishingizga e’tibor bering.",
    includesTitle: "Ishga nimalar kiradi", includes: ["Xodimlarga masofaviy va joyida yordam", "Tarmoq va qurilmalar monitoringi", "Zaxira nusxalar nazorati", "Xavfsizlik yangilanishlari", "Oylik holat hisoboti"],
    stepsTitle: "Qanday ishlaymiz", steps: ["Tizimlaringizni ko‘rib chiqamiz", "Xizmat ko‘lami va narxni yozma kelishamiz", "Monitoring ulanib, yordam boshlanadi"],
    faq: [
      { q: "Qaysi kompaniyalarga mos?", a: "Doimiy IT bo‘limi bo‘lmagan yoki IT xodimiga yordam kerak bo‘lgan kichik va o‘rta kompaniyalarga." },
      { q: "Javob muddati qancha?", a: "Muddatlar tanlangan paketga qarab shartnomada aniq yoziladi." },
      { q: "Shartnomasiz sinab ko‘rsa bo‘ladimi?", a: "Avval tizimingizni ko‘rib chiqamiz va bir martalik ishdan boshlash mumkinligini kelishamiz." }
    ],
    cta: "Paketni tanlash"
  }
];

export const seoPagesRu: SeoPage[] = [
  {
    slug: "ustanovka-videonablyudeniya-tashkent", twin: "toshkentda-videokuzatuv-ornatish", serviceName: "Установка видеонаблюдения",
    title: "Установка видеонаблюдения в Ташкенте | Tecsecure", description: "Проектирование, монтаж и настройка IP-камер для офиса, магазина, склада и дома. Хранение записей и безопасный просмотр с телефона. По всему Ташкенту.",
    heading: "Установка видеонаблюдения в Ташкенте", intro: "Подберём, установим и настроим систему камер для офиса, магазина, склада или дома. Чёткая картинка, запись хранится нужный срок, а просмотр с телефона безопасен.",
    includesTitle: "Что входит в работу", includes: ["Осмотр объекта и выбор точек наблюдения", "Расчёт IP-камер, NVR и объёма дисков", "Прокладка кабеля, PoE-коммутатор и монтаж", "Настройка безопасного просмотра с телефона и компьютера", "Инструктаж пользователей и сдача системы"],
    stepsTitle: "Как мы работаем", steps: ["Вы оставляете заявку или звоните", "Осматриваем объект и даём письменное предложение", "Устанавливаем в согласованный срок, проверяем и сдаём"],
    faq: [
      { q: "Сколько дней хранятся записи?", a: "Это зависит от количества камер, качества изображения и объёма дисков. Назовите нужный срок, и мы рассчитаем диски под него." },
      { q: "Можно ли смотреть с телефона?", a: "Да. Настраиваем безопасным способом, не открывая камеры напрямую в интернет." },
      { q: "Сколько это стоит?", a: "Цена зависит от количества камер, длины кабеля и условий монтажа. Точное предложение дадим после осмотра объекта." }
    ],
    cta: "Узнать цену"
  },
  {
    slug: "lokalnaya-set-i-wifi-dlya-ofisa", twin: "ofis-tarmogi-va-wifi-ornatish", serviceName: "Локальная сеть и Wi-Fi",
    title: "Локальная сеть и Wi-Fi для офиса, Ташкент | Tecsecure", description: "Структурированная кабельная система, коммутаторы и Wi-Fi на весь офис. Поиск и устранение причин медленного интернета и обрывов связи.",
    heading: "Локальная сеть и Wi-Fi для офиса", intro: "Интернет часто обрывается или Wi-Fi не достаёт до всех мест? Проверим сеть, найдём причину и построим надёжную систему.",
    includesTitle: "Что входит в работу", includes: ["Проверка текущей сети и покрытия Wi-Fi", "Планирование кабельных трасс и сетевых точек", "Установка роутера, коммутаторов и точек доступа", "Разделение гостевой и рабочей сети", "Результаты проверки и документы при сдаче"],
    stepsTitle: "Как мы работаем", steps: ["Вы описываете задачу и количество рабочих мест", "Согласуем схему и список оборудования", "Монтаж, настройка и сдача после проверки"],
    faq: [
      { q: "Обязательно ли прокладывать новый кабель?", a: "Не всегда. Сначала проверяем текущую сеть: часто достаточно настройки и правильного размещения." },
      { q: "Придётся ли останавливать работу?", a: "Работы проводим в согласованное время, при необходимости вне рабочего дня." },
      { q: "Как узнать примерный объём?", a: "В калькуляторе сметы на сайте можно за минуту получить предварительный список." }
    ],
    cta: "Оставить заявку"
  },
  {
    slug: "audit-kiberbezopasnosti", twin: "kiberxavfsizlik-auditi", serviceName: "Аудит кибербезопасности",
    title: "Аудит кибербезопасности, Ташкент | Tecsecure", description: "Находим уязвимости в сети, на серверах и в приложениях и даём понятный отчёт. Только с письменного разрешения.",
    heading: "Аудит кибербезопасности", intro: "Найдём слабые места вашей компании раньше злоумышленников. На выходе понятный отчёт: уровень риска и что исправить в первую очередь.",
    includesTitle: "Что входит в работу", includes: ["Согласование охвата и письменного разрешения", "Проверка сети, серверов и приложений", "Уровень риска и доказательство по каждой находке", "Краткий вывод для руководства", "План устранения и повторная проверка"],
    stepsTitle: "Как мы работаем", steps: ["Вместе определяем, что проверять", "Проводим проверку в согласованное время", "Сдаём отчёт и помогаем с исправлениями"],
    faq: [
      { q: "Помешает ли это работе?", a: "Время и методы проверки согласуются заранее, а рабочие системы проверяются осторожно." },
      { q: "Гарантирует ли аудит полную безопасность?", a: "Нет. Аудит показывает состояние на момент проверки и помогает снизить главные риски." },
      { q: "С чего можно начать?", a: "Пройдите на сайте тест безопасности из 10 вопросов: он покажет, на что обратить внимание." }
    ],
    cta: "Узнать цену аудита"
  },
  {
    slug: "it-podderzhka-dlya-kompanii", twin: "kompaniyalar-uchun-it-yordam", serviceName: "IT-поддержка для компаний",
    title: "Ежемесячная IT-поддержка для компаний, Ташкент | Tecsecure", description: "Вместо штатного IT-специалиста ежемесячный сервис: сеть, компьютеры, серверы и безопасность, мониторинг и быстрая помощь.",
    heading: "Ежемесячная IT-поддержка для компаний", intro: "Штатный IT-специалист обходится дорого или один человек не успевает? Доверьте нам сеть, компьютеры и серверы, а сами занимайтесь бизнесом.",
    includesTitle: "Что входит в работу", includes: ["Удалённая помощь и выезд к сотрудникам", "Мониторинг сети и устройств", "Контроль резервных копий", "Обновления безопасности", "Ежемесячный отчёт о состоянии"],
    stepsTitle: "Как мы работаем", steps: ["Изучаем ваши системы", "Письменно согласуем объём и цену", "Подключаем мониторинг и начинаем поддержку"],
    faq: [
      { q: "Кому это подходит?", a: "Малым и средним компаниям без постоянного IT-отдела или когда IT-специалисту нужна помощь." },
      { q: "Какое время реакции?", a: "Сроки зависят от выбранного пакета и указываются в договоре." },
      { q: "Можно ли попробовать без договора?", a: "Сначала изучим вашу систему и согласуем, можно ли начать с разовой работы." }
    ],
    cta: "Выбрать пакет"
  }
];

export const SEO_UZ_BASE = "/xizmat";
export const SEO_RU_BASE = "/ru/uslugi";
