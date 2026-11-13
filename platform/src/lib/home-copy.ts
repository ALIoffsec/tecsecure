import type { Locale } from "./messages";

/** Words for the home page, the services page top and the admin "home page figures" form. */
const uz = {
  eyebrow: "Tecsecure",
  title: "IT va kiberxavfsizlik:", highlight: "o‘rnatib beramiz, o‘rgatamiz, uskunasini topamiz.",
  lead: "Ofisingiz uchun kamera va tarmoq, brauzerda amaliy darslar va mos uskunalar — bitta joyda.",
  inspect: "Bepul ko‘rikka yozilish", inspectTopic: "Bepul ko‘rik", calculate: "Smetani hisoblash",
  doors: {
    services: { label: "Xizmatlar", hook: "Ofisingizga videokuzatuv va tarmoq — bepul ko‘rik bilan", proofEmpty: "Videokuzatuv, tarmoq, audit va oylik IT yordam", cta: "Smetani hisoblash" },
    academy: { label: "Akademiya", hook: "Linux va kiberxavfsizlikni brauzerdagi terminalda o‘rganing", free: "bepul", lessons: "dars", cta: "Bepul darsni boshlash" },
    shop: { label: "Do‘kon", hook: "Kamera, router, kommutator — moslikni tekshirib tanlang", empty: "Katalog to‘ldirilmoqda", cta: "Katalog" }
  },
  servicesTitle: "Asosiy xizmatlar", servicesNote: "To‘rt asosiy yo‘nalish: har birida ish tarkibi, natija va kiritilgan bo‘lsa narx va muddat. Kartochkani bosing — batafsil sahifa ochiladi.", carouselPrev: "Oldingi", carouselNext: "Keyingi", carouselGo: "kartochkaga o‘tish", carouselLabel: "karusel", price: "Narx", from: "dan boshlab", duration: "Muddat", warranty: "Kafolat", more: "Batafsil",
  academyTitle: "Akademiya", academyNote: "Avval bepul kurslar: har bir dars — tushuntirish, misol va brauzerdagi terminalda amaliyot. Kartochkani bosing — kurs sahifasi ochiladi.", courses: "kurs", lessons: "dars", hours: "soat", free: "Bepul", allCourses: "Barcha kurslar",
  shopTitle: "Do‘kondan", shopNote: "Har toifadan bittadan uskuna: kamera, kommutator, router va boshqalar. Narx tanlangan valyutada. Kartochkani bosing — mahsulot sahifasi ochiladi; savat tugmasi esa sahifadan chiqmasdan qo‘shadi.", allProducts: "Katalogga o‘tish",
  howTitle: "Qanday ishlaymiz", workTitle: "Bajarilgan ishlar",
  trustTitle: "Raqamlarda", projects: "bajarilgan loyiha", years: "yil tajriba", clients: "mijoz", warrantyLabel: "kafolat",
  brandsTitle: "Ishlaydigan uskunalarimiz brendlari", brandsNote: "Shu brendlarning uskunalarini o‘rnatamiz, sozlaymiz va xizmat ko‘rsatamiz.",
  contactTitle: "Savolingiz bormi?", contactText: "Raqamingizni qoldiring — qo‘ng‘iroq qilib, vazifani birga aniqlaymiz.",
  cctvTitle: "Videokuzatuv smetasini hisoblang", cctvText: "Kameralar soni va joyini kiriting — kerakli uskunalar ro‘yxati chiqadi. Uni PDF qilib saqlang yoki narxini bilish uchun bizga yuboring.", cctvCta: "Kalkulyatorni ochish",
  priceFaq: { q: "Narxni darhol bilsam bo‘ladimi?", calc: "Dastlabki hisobni hozir qilishingiz mumkin: videokuzatuv kalkulyatori kamera soniga qarab kerakli uskunalar ro‘yxatini chiqaradi — uni bizga yuborsangiz, narxini aytamiz.", from: "Xizmat kartochkalarida “...dan boshlab” narx ko‘rsatilgan.", final: "Yakuniy narx obyekt ko‘rilgandan keyin yozma taklifda qat’iy belgilanadi." },
  admin: {
    title: "Bosh sahifa raqamlari", hint: "Bosh sahifa va Xizmatlar sahifasidagi raqamlar faqat shu yerdan olinadi. Bo‘sh qoldirilgan maydon saytda ko‘rinmaydi.",
    trust: "Ishonch bloki", projects: "Bajarilgan loyihalar", years: "Tajriba (yil)", clients: "Mijozlar", warranty: "Kafolat",
    from: "Narx (...dan boshlab)", duration: "Muddat", serviceWarranty: "Kafolat",
    projectsExample: "Masalan: 50+", yearsExample: "Masalan: 5", clientsExample: "Masalan: 30+", warrantyExample: "Masalan: 12 oy", fromExample: "Masalan: 1 500 000 so‘m", durationExample: "Masalan: 1–3 kun",
    save: "Saqlash", saving: "Saqlanmoqda…", saved: "Saqlandi.", failed: "Saqlab bo‘lmadi."
  }
};

type HomeCopy = typeof uz;

const ru: HomeCopy = {
  eyebrow: "Tecsecure",
  title: "IT и кибербезопасность:", highlight: "установим, научим, подберём оборудование.",
  lead: "Камеры и сеть для офиса, практические уроки в браузере и совместимое оборудование — в одном месте.",
  inspect: "Записаться на бесплатный осмотр", inspectTopic: "Бесплатный осмотр", calculate: "Рассчитать смету",
  doors: {
    services: { label: "Услуги", hook: "Видеонаблюдение и сеть для офиса — с бесплатным осмотром", proofEmpty: "Видеонаблюдение, сеть, аудит и ежемесячная IT-поддержка", cta: "Рассчитать смету" },
    academy: { label: "Академия", hook: "Изучайте Linux и кибербезопасность в терминале прямо в браузере", free: "бесплатно", lessons: "уроков", cta: "Начать бесплатный урок" },
    shop: { label: "Магазин", hook: "Камеры, роутеры, коммутаторы — с проверкой совместимости", empty: "Каталог наполняется", cta: "Каталог" }
  },
  servicesTitle: "Основные услуги", servicesNote: "Четыре основных направления: состав работ, результат, а если указаны — цена и срок. Нажмите на карточку — откроется подробная страница.", carouselPrev: "Назад", carouselNext: "Вперёд", carouselGo: "перейти к карточке", carouselLabel: "карусель", price: "Цена", from: "от", duration: "Срок", warranty: "Гарантия", more: "Подробнее",
  academyTitle: "Академия", academyNote: "Сначала бесплатные курсы: каждый урок — объяснение, пример и практика в терминале в браузере. Нажмите на карточку — откроется страница курса.", courses: "курсов", lessons: "уроков", hours: "ч", free: "Бесплатно", allCourses: "Все курсы",
  shopTitle: "Из магазина", shopNote: "По одному товару из каждой категории: камеры, коммутаторы, роутеры и другое. Цена в выбранной валюте. Нажмите на карточку — откроется страница товара; кнопка корзины добавляет, не уходя со страницы.", allProducts: "Перейти в каталог",
  howTitle: "Как мы работаем", workTitle: "Выполненные работы",
  trustTitle: "В цифрах", projects: "выполненных проектов", years: "лет опыта", clients: "клиентов", warrantyLabel: "гарантия",
  brandsTitle: "Бренды оборудования, с которым работаем", brandsNote: "Устанавливаем, настраиваем и обслуживаем оборудование этих брендов.",
  contactTitle: "Есть вопрос?", contactText: "Оставьте номер — перезвоним и вместе уточним задачу.",
  cctvTitle: "Рассчитайте смету видеонаблюдения", cctvText: "Укажите количество и места камер — получите список оборудования. Сохраните его в PDF или отправьте нам, чтобы узнать цену.", cctvCta: "Открыть калькулятор",
  priceFaq: { q: "Можно узнать цену сразу?", calc: "Предварительный расчёт можно сделать сейчас: калькулятор видеонаблюдения по числу камер выдаёт список оборудования — отправьте его нам, и мы назовём цену.", from: "На карточках услуг указана цена «от».", final: "Окончательная цена фиксируется в письменном предложении после осмотра объекта." },
  admin: {
    title: "Цифры главной страницы", hint: "Цифры на главной и на странице услуг берутся только отсюда. Пустое поле на сайте не показывается.",
    trust: "Блок доверия", projects: "Выполненные проекты", years: "Опыт (лет)", clients: "Клиенты", warranty: "Гарантия",
    from: "Цена (от)", duration: "Срок", serviceWarranty: "Гарантия",
    projectsExample: "Например: 50+", yearsExample: "Например: 5", clientsExample: "Например: 30+", warrantyExample: "Например: 12 мес.", fromExample: "Например: 1 500 000 сум", durationExample: "Например: 1–3 дня",
    save: "Сохранить", saving: "Сохраняем…", saved: "Сохранено.", failed: "Не удалось сохранить."
  }
};

const en: HomeCopy = {
  eyebrow: "Tecsecure",
  title: "IT and cybersecurity:", highlight: "we install it, teach it and find the right equipment.",
  lead: "Cameras and networks for your office, hands-on lessons in the browser and compatible equipment — in one place.",
  inspect: "Book a free site visit", inspectTopic: "Free site visit", calculate: "Build an estimate",
  doors: {
    services: { label: "Services", hook: "Video surveillance and networking for your office — with a free site visit", proofEmpty: "Surveillance, networking, audits and monthly IT support", cta: "Build an estimate" },
    academy: { label: "Academy", hook: "Learn Linux and cybersecurity in a terminal right in your browser", free: "free", lessons: "lessons", cta: "Start the free lesson" },
    shop: { label: "Shop", hook: "Cameras, routers, switches — chosen with a compatibility check", empty: "The catalogue is being filled", cta: "Catalogue" }
  },
  servicesTitle: "Main services", servicesNote: "Four main services: the scope of work, the result and, when entered, the price and duration. Tap a card to open its page.", carouselPrev: "Previous", carouselNext: "Next", carouselGo: "go to card", carouselLabel: "carousel", price: "Price", from: "from", duration: "Duration", warranty: "Warranty", more: "Details",
  academyTitle: "Academy", academyNote: "Free courses first: every lesson is an explanation, an example and practice in a browser terminal. Tap a card to open the course.", courses: "courses", lessons: "lessons", hours: "h", free: "Free", allCourses: "All courses",
  shopTitle: "From the shop", shopNote: "One item from each category: cameras, switches, routers and more. Prices in your chosen currency. Tap a card to open the product; the cart button adds it without leaving the page.", allProducts: "Go to the catalogue",
  howTitle: "How we work", workTitle: "Completed work",
  trustTitle: "In numbers", projects: "completed projects", years: "years of experience", clients: "clients", warrantyLabel: "warranty",
  brandsTitle: "Equipment brands we work with", brandsNote: "We install, configure and service equipment from these brands.",
  contactTitle: "Have a question?", contactText: "Leave your number — we will call and work out the task together.",
  cctvTitle: "Estimate a surveillance system", cctvText: "Enter how many cameras and where — you get the equipment list. Save it as a PDF or send it to us for a price.", cctvCta: "Open the calculator",
  priceFaq: { q: "Can I know the price right away?", calc: "You can start now: the surveillance calculator turns the camera count into an equipment list — send it to us and we will name the price.", from: "Service cards show a “from” price.", final: "The final price is fixed in a written offer after the site visit." },
  admin: {
    title: "Home page figures", hint: "The figures on the home and services pages come only from here. An empty field is not shown on the site.",
    trust: "Trust block", projects: "Completed projects", years: "Experience (years)", clients: "Clients", warranty: "Warranty",
    from: "Price (from)", duration: "Duration", serviceWarranty: "Warranty",
    projectsExample: "e.g. 50+", yearsExample: "e.g. 5", clientsExample: "e.g. 30+", warrantyExample: "e.g. 12 months", fromExample: "e.g. 1,500,000 so‘m", durationExample: "e.g. 1–3 days",
    save: "Save", saving: "Saving…", saved: "Saved.", failed: "Could not save."
  }
};

export const homeCopy: Record<Locale, HomeCopy> = { uz, ru, en };
