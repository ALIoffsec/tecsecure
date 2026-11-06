import type { Locale } from "./messages";

type MenuLink = { href: string; title: string; hint: string };
type MenuGroup = { title: string; href: string; links: MenuLink[] };

type SiteCopy = {
  nav: { home: string; menu: string; account: string; cart: string; search: string; close: string; language: string; theme: string; dark: string; light: string; system: string; primary: string };
  menu: { services: MenuGroup; learning: MenuGroup; shop: MenuGroup; company: MenuGroup };
  cookie: {
    title: string; text: string; acceptAll: string; essential: string; customize: string; save: string; close: string;
    necessary: string; necessaryHint: string; preferences: string; preferencesHint: string; always: string; none: string; privacy: string;
  };
  orders: {
    eyebrow: string; title: string; empty: string; browse: string; delivery: string; total: string; totalPending: string; payment: string; history: string; cancelled: string; map: string; trackLabel: string; note: string; account: string;
    status: Record<string, string>; method: Record<string, string>; paymentStatus: Record<string, string>;
  };
  admin: {
    overview: string; overviewHint: string; attention: string; allClear: string; quick: string; ordersTitle: string; all: string; byStatus: string; noOrders: string; back: string; search: string; viewProof: string; confirmPayment: string; confirmed: string; failed: string;
    newOrders: string; pendingWallet: string; openRequests: string; pendingPayments: string; customers: string; revenue: string; revenueHint: string; botOff: string; botOffHint: string; botOn: string; card: string; cardHint: string; cardNumber: string; cardHolder: string; cardBank: string; addProduct: string; addWork: string; openOrders: string; openIntegrations: string; botTest: string; botTestFailed: string; botTestSent: string; botWebhookOn: string; botWebhookSecret: string; botWebhookLocal: string;
  };
  work: { eyebrow: string; title: string; intro: string; all: string; photos: string; open: string; next: string; prev: string; play: string; pause: string; close: string; drag: string; cta: string; ctaHint: string; ctaButton: string; seeAll: string; projects: string; shots: string };
  shop: { recent: string; recentHint: string; buy: string; trust: { delivery: string; deliveryHint: string; warranty: string; warrantyHint: string; install: string; installHint: string } };
  contactDock: { call: string };
  common: { copy: string; copied: string; tryAgain: string; chooseFiles: string; chooseImage: string; proofHint: string; proofLabel: string };
};

const uz: SiteCopy = {
  nav: { home: "Bosh sahifa", menu: "Menyu", account: "Hisob", cart: "Savat", search: "Qidiruv", close: "Yopish", language: "Til", theme: "Ko‘rinish", dark: "Qorong‘i", light: "Yorug‘", system: "Tizim", primary: "Asosiy menyu" },
  menu: {
    services: { title: "Xizmatlar", href: "/services", links: [
      { href: "/services", title: "Barcha xizmatlar", hint: "Tarmoq, videokuzatuv, server va kirish nazorati" },
      { href: "/cybersecurity", title: "Kiberxavfsizlik", hint: "Xavflarni aniqlash va himoyani kuchaytirish" },
      { href: "/monitoring", title: "Monitoring", hint: "Qurilmalaringiz holatini doimiy kuzatish" },
      { href: "/consultation", title: "Maslahat", hint: "Mutaxassis bilan yechimni birga tanlash" },
      { href: "/request-service", title: "Ariza qoldirish", hint: "Vazifani yozing, biz bog‘lanamiz" }
    ] },
    learning: { title: "Ta’lim", href: "/learning", links: [
      { href: "/learning/paths", title: "Yo‘nalishlar", hint: "Noldan kasbgacha bosqichma-bosqich reja" },
      { href: "/learning/modules", title: "Modullar", hint: "Aniq mavzu bo‘yicha darslar" },
      { href: "/learning/practice", title: "Amaliyot", hint: "Laboratoriya va mashqlar" },
      { href: "/learning/exams", title: "Imtihonlar", hint: "Bilimni tekshirish va sertifikat" },
      { href: "/learning/dashboard", title: "Mening o‘qishim", hint: "Natijalar va davom ettirish" }
    ] },
    shop: { title: "Do‘kon", href: "/products", links: [
      { href: "/products", title: "Barcha uskunalar", hint: "Tarmoq, kamera va xavfsizlik jihozlari" },
      { href: "/products/compare", title: "Taqqoslash", hint: "Modellarni yonma-yon solishtirish" },
      { href: "/cart", title: "Savat", hint: "Buyurtmani rasmiylashtirish" },
      { href: "/portal/orders", title: "Buyurtmalarim", hint: "Yetkazish holatini kuzatish" }
    ] },
    company: { title: "Kompaniya", href: "/about", links: [
      { href: "/about", title: "Biz haqimizda", hint: "Nima qilamiz va qanday ishlaymiz" },
      { href: "/work", title: "Bajarilgan ishlar", hint: "Real loyihalardan suratlar" },
      { href: "/news", title: "Yangiliklar", hint: "Texnologiya va xavfsizlik xabarlari" },
      { href: "/careers", title: "Jamoaga qo‘shilish", hint: "Ochiq ish o‘rinlari" },
      { href: "/contact", title: "Aloqa", hint: "Telefon, Telegram va manzil" }
    ] }
  },
  cookie: {
    title: "Cookie fayllari", text: "Sayt ishlashi uchun zarur cookie’lardan foydalanamiz. Xohlasangiz, tanlagan tilingiz va ko‘rinishingizni ham eslab qolamiz.",
    acceptAll: "Roziman", essential: "Faqat zarurlari", customize: "Sozlash", save: "Saqlash", close: "Yopish",
    necessary: "Zarur cookie’lar", necessaryHint: "Hisobga kirish, savat va xavfsizlik uchun. O‘chirib bo‘lmaydi.",
    preferences: "Sozlamalar", preferencesHint: "Til va ko‘rinishni keyingi tashrifda eslab qoladi.",
    always: "Doim yoqilgan", none: "Reklama va kuzatuv cookie’lari ishlatilmaydi.", privacy: "Maxfiylik siyosati"
  },
  orders: {
    eyebrow: "Buyurtmalar", title: "Mening buyurtmalarim", empty: "Hali buyurtma yo‘q", browse: "Katalogga o‘tish", delivery: "Yetkazib berish", total: "Jami", totalPending: "Narx tasdiqlanganda bildiriladi", payment: "To‘lov", history: "Holatlar tarixi", cancelled: "Buyurtma bekor qilingan.", map: "Xaritada ko‘rish", trackLabel: "Buyurtma holati", note: "Izoh", account: "Hisob",
    status: { NEW: "Qabul qilindi", CONFIRMED: "Tasdiqlandi", PREPARING: "Tayyorlanmoqda", SHIPPED: "Yo‘lda", DELIVERED: "Yetkazildi", CANCELLED: "Bekor qilindi" },
    method: { CASH: "Naqd pul", CARD_ON_DELIVERY: "Karta (kuryerga)", CARD_TRANSFER: "Kartaga o‘tkazma", WALLET: "Tecsecure hamyoni", UNSPECIFIED: "Kelishiladi" },
    paymentStatus: { PENDING: "Qabul qilganda to‘lanadi", AWAITING_CONFIRMATION: "Chek tekshirilmoqda", PAID: "To‘langan", REFUNDED: "Qaytarilgan" }
  },
  admin: {
    overview: "Umumiy holat", overviewHint: "Bugun e’tibor talab qiladigan ishlar bir joyda.", attention: "Kutilayotgan ishlar", allClear: "Hozircha kutilayotgan ish yo‘q.", quick: "Tezkor amallar", ordersTitle: "Buyurtmalar", all: "Hammasi", byStatus: "Holat bo‘yicha", noOrders: "Bu holatda buyurtma yo‘q.", back: "Admin panel", search: "Raqam, ism yoki telefon bo‘yicha qidirish", viewProof: "Chekni ko‘rish", confirmPayment: "To‘lovni tasdiqlash", confirmed: "To‘lov tasdiqlandi.", failed: "Amal bajarilmadi. Qayta urinib ko‘ring.",
    newOrders: "Yangi buyurtmalar", pendingWallet: "Hamyon arizalari", openRequests: "Yangi arizalar", pendingPayments: "Tasdiqlanmagan to‘lovlar", customers: "Mijozlar", revenue: "Shu oy savdosi", revenueHint: "Yetkazilgan buyurtmalar", botOff: "Telegram bot ulanmagan", botOffHint: "Yangi arizalar botga bormaydi. Token va chat ID ni kiriting.", botOn: "Telegram bot ulangan", card: "To‘lov kartasi", cardHint: "Mijozlar hisobni to‘ldirish va buyurtma uchun shu kartaga pul o‘tkazadi.", cardNumber: "Karta raqami", cardHolder: "Karta egasi", cardBank: "Bank", addProduct: "Mahsulot qo‘shish", addWork: "Bajarilgan ish qo‘shish", openOrders: "Buyurtmalarni ochish", openIntegrations: "Botni sozlash", botTest: "Botni tekshirish", botTestFailed: "Botga ulanib bo‘lmadi. Token va chat ID ni tekshiring.", botTestSent: "Sinov xabari yuborildi.", botWebhookOn: "Tugmalar ham ulandi.", botWebhookSecret: "Tugmalar ishlashi uchun webhook kalitini kiriting.", botWebhookLocal: "Bot tugmalari sayt HTTPS manzilda ishlaganda ulanadi."
  },
  work: { eyebrow: "Bajarilgan ishlar", title: "Real obyektlardan suratlar", intro: "Mijozlarimiz obyektlaridan olingan haqiqiy suratlar: tartibga solingan shkaflar, kabel yo‘llari va o‘rnatilgan uskunalar.", all: "Barchasi", photos: "surat", open: "Kattalashtirish", next: "Keyingi surat", prev: "Oldingi surat", play: "Avtomatik ko‘rsatish", pause: "To‘xtatish", close: "Yopish", drag: "Suring yoki strelkalarni bosing", cta: "Shunday natija sizga ham kerakmi?", ctaHint: "Obyektingizni yozing, narx va muddatni aniqlab beramiz.", ctaButton: "Ariza qoldirish", seeAll: "Barcha ishlar", projects: "loyiha", shots: "surat" },
  shop: { recent: "Yaqinda ko‘rganlaringiz", recentHint: "Tanlovni shu yerdan davom ettiring.", buy: "Savatga", trust: { delivery: "Yetkazib berish", deliveryHint: "Manzil va muddat buyurtmada kelishiladi", warranty: "Kafolat", warrantyHint: "Ishlab chiqaruvchi kafolati asosida", install: "O‘rnatish", installHint: "Mutaxassislarimiz o‘rnatib beradi" } },
  contactDock: { call: "Qo‘ng‘iroq" },
  common: { copy: "Nusxalash", copied: "Nusxalandi", tryAgain: "Qayta urinish", chooseFiles: "Fayl tanlash", chooseImage: "Rasm tanlash", proofHint: "JPG, PNG yoki WebP, 8 MB gacha.", proofLabel: "To‘lov cheki" }
};

const ru: SiteCopy = {
  nav: { home: "Главная", menu: "Меню", account: "Кабинет", cart: "Корзина", search: "Поиск", close: "Закрыть", language: "Язык", theme: "Оформление", dark: "Тёмная", light: "Светлая", system: "Системная", primary: "Основное меню" },
  menu: {
    services: { title: "Услуги", href: "/services", links: [
      { href: "/services", title: "Все услуги", hint: "Сети, видеонаблюдение, серверы и контроль доступа" },
      { href: "/cybersecurity", title: "Кибербезопасность", hint: "Поиск рисков и усиление защиты" },
      { href: "/monitoring", title: "Мониторинг", hint: "Постоянный контроль состояния устройств" },
      { href: "/consultation", title: "Консультация", hint: "Подберём решение вместе со специалистом" },
      { href: "/request-service", title: "Оставить заявку", hint: "Опишите задачу, мы свяжемся с вами" }
    ] },
    learning: { title: "Обучение", href: "/learning", links: [
      { href: "/learning/paths", title: "Направления", hint: "Пошаговый план от нуля до профессии" },
      { href: "/learning/modules", title: "Модули", hint: "Уроки по конкретной теме" },
      { href: "/learning/practice", title: "Практика", hint: "Лаборатории и упражнения" },
      { href: "/learning/exams", title: "Экзамены", hint: "Проверка знаний и сертификат" },
      { href: "/learning/dashboard", title: "Моё обучение", hint: "Результаты и продолжение" }
    ] },
    shop: { title: "Магазин", href: "/products", links: [
      { href: "/products", title: "Всё оборудование", hint: "Сети, камеры и системы безопасности" },
      { href: "/products/compare", title: "Сравнение", hint: "Модели рядом друг с другом" },
      { href: "/cart", title: "Корзина", hint: "Оформление заказа" },
      { href: "/portal/orders", title: "Мои заказы", hint: "Отслеживание доставки" }
    ] },
    company: { title: "Компания", href: "/about", links: [
      { href: "/about", title: "О нас", hint: "Чем занимаемся и как работаем" },
      { href: "/work", title: "Наши работы", hint: "Фотографии реальных проектов" },
      { href: "/news", title: "Новости", hint: "Технологии и безопасность" },
      { href: "/careers", title: "Вакансии", hint: "Открытые позиции" },
      { href: "/contact", title: "Контакты", hint: "Телефон, Telegram и адрес" }
    ] }
  },
  cookie: {
    title: "Файлы cookie", text: "Мы используем cookie, необходимые для работы сайта. По вашему желанию также запомним выбранный язык и оформление.",
    acceptAll: "Согласен", essential: "Только необходимые", customize: "Настроить", save: "Сохранить", close: "Закрыть",
    necessary: "Необходимые cookie", necessaryHint: "Для входа, корзины и безопасности. Отключить нельзя.",
    preferences: "Настройки", preferencesHint: "Запоминают язык и оформление до следующего визита.",
    always: "Всегда включены", none: "Рекламные и отслеживающие cookie не используются.", privacy: "Политика конфиденциальности"
  },
  orders: {
    eyebrow: "Заказы", title: "Мои заказы", empty: "Заказов пока нет", browse: "Перейти в каталог", delivery: "Доставка", total: "Итого", totalPending: "Сообщим после подтверждения цены", payment: "Оплата", history: "История статусов", cancelled: "Заказ отменён.", map: "Показать на карте", trackLabel: "Статус заказа", note: "Комментарий", account: "Аккаунт",
    status: { NEW: "Принят", CONFIRMED: "Подтверждён", PREPARING: "Готовится", SHIPPED: "В пути", DELIVERED: "Доставлен", CANCELLED: "Отменён" },
    method: { CASH: "Наличные", CARD_ON_DELIVERY: "Картой курьеру", CARD_TRANSFER: "Перевод на карту", WALLET: "Кошелёк Tecsecure", UNSPECIFIED: "По договорённости" },
    paymentStatus: { PENDING: "Оплата при получении", AWAITING_CONFIRMATION: "Чек проверяется", PAID: "Оплачен", REFUNDED: "Возвращён" }
  },
  admin: {
    overview: "Обзор", overviewHint: "Всё, что требует внимания сегодня, в одном месте.", attention: "Ожидают действий", allClear: "Сейчас нет ожидающих задач.", quick: "Быстрые действия", ordersTitle: "Заказы", all: "Все", byStatus: "По статусу", noOrders: "Заказов с таким статусом нет.", back: "Админ-панель", search: "Поиск по номеру, имени или телефону", viewProof: "Посмотреть чек", confirmPayment: "Подтвердить оплату", confirmed: "Оплата подтверждена.", failed: "Не удалось выполнить. Попробуйте ещё раз.",
    newOrders: "Новые заказы", pendingWallet: "Заявки кошелька", openRequests: "Новые заявки", pendingPayments: "Неподтверждённые оплаты", customers: "Клиенты", revenue: "Продажи за месяц", revenueHint: "Доставленные заказы", botOff: "Telegram-бот не подключён", botOffHint: "Новые заявки не попадают в бот. Укажите токен и chat ID.", botOn: "Telegram-бот подключён", card: "Карта для оплаты", cardHint: "На эту карту клиенты переводят деньги для пополнения и заказов.", cardNumber: "Номер карты", cardHolder: "Владелец карты", cardBank: "Банк", addProduct: "Добавить товар", addWork: "Добавить работу", openOrders: "Открыть заказы", openIntegrations: "Настроить бота", botTest: "Проверить бота", botTestFailed: "Не удалось подключиться к боту. Проверьте токен и chat ID.", botTestSent: "Тестовое сообщение отправлено.", botWebhookOn: "Кнопки тоже подключены.", botWebhookSecret: "Чтобы работали кнопки, укажите секрет вебхука.", botWebhookLocal: "Кнопки бота подключатся, когда сайт будет работать по HTTPS."
  },
  work: { eyebrow: "Наши работы", title: "Кадры с реальных проектов", intro: "Настоящие фотографии с объектов клиентов: аккуратные шкафы, кабельные трассы и установленное оборудование.", all: "Все", photos: "фото", open: "Увеличить", next: "Следующее фото", prev: "Предыдущее фото", play: "Автопоказ", pause: "Пауза", close: "Закрыть", drag: "Листайте или нажимайте стрелки", cta: "Нужен такой же результат?", ctaHint: "Опишите объект, и мы уточним цену и сроки.", ctaButton: "Оставить заявку", seeAll: "Все работы", projects: "проектов", shots: "фото" },
  shop: { recent: "Вы недавно смотрели", recentHint: "Продолжите выбор отсюда.", buy: "В корзину", trust: { delivery: "Доставка", deliveryHint: "Адрес и срок согласуем в заказе", warranty: "Гарантия", warrantyHint: "По гарантии производителя", install: "Установка", installHint: "Наши специалисты установят" } },
  contactDock: { call: "Позвонить" },
  common: { copy: "Скопировать", copied: "Скопировано", tryAgain: "Повторить", chooseFiles: "Выбрать файлы", chooseImage: "Выбрать фото", proofHint: "JPG, PNG или WebP, до 8 МБ.", proofLabel: "Чек об оплате" }
};

const en: SiteCopy = {
  nav: { home: "Home", menu: "Menu", account: "Account", cart: "Cart", search: "Search", close: "Close", language: "Language", theme: "Appearance", dark: "Dark", light: "Light", system: "System", primary: "Main menu" },
  menu: {
    services: { title: "Services", href: "/services", links: [
      { href: "/services", title: "All services", hint: "Networks, CCTV, servers and access control" },
      { href: "/cybersecurity", title: "Cybersecurity", hint: "Find risks and strengthen protection" },
      { href: "/monitoring", title: "Monitoring", hint: "Continuous watch over your devices" },
      { href: "/consultation", title: "Consultation", hint: "Choose the right solution with an expert" },
      { href: "/request-service", title: "Send a request", hint: "Describe the task and we will contact you" }
    ] },
    learning: { title: "Learning", href: "/learning", links: [
      { href: "/learning/paths", title: "Paths", hint: "A step-by-step plan from zero to a career" },
      { href: "/learning/modules", title: "Modules", hint: "Lessons on a specific topic" },
      { href: "/learning/practice", title: "Practice", hint: "Labs and exercises" },
      { href: "/learning/exams", title: "Exams", hint: "Test your knowledge and earn a certificate" },
      { href: "/learning/dashboard", title: "My learning", hint: "Results and where to continue" }
    ] },
    shop: { title: "Shop", href: "/products", links: [
      { href: "/products", title: "All equipment", hint: "Networking, cameras and security gear" },
      { href: "/products/compare", title: "Compare", hint: "See models side by side" },
      { href: "/cart", title: "Cart", hint: "Complete your order" },
      { href: "/portal/orders", title: "My orders", hint: "Track your delivery" }
    ] },
    company: { title: "Company", href: "/about", links: [
      { href: "/about", title: "About us", hint: "What we do and how we work" },
      { href: "/work", title: "Our work", hint: "Photos from real projects" },
      { href: "/news", title: "News", hint: "Technology and security updates" },
      { href: "/careers", title: "Careers", hint: "Open positions" },
      { href: "/contact", title: "Contact", hint: "Phone, Telegram and address" }
    ] }
  },
  cookie: {
    title: "Cookies", text: "We use the cookies this site needs to work. If you agree, we will also remember your language and appearance.",
    acceptAll: "Accept", essential: "Essential only", customize: "Customize", save: "Save", close: "Close",
    necessary: "Essential cookies", necessaryHint: "For sign-in, the cart and security. These cannot be turned off.",
    preferences: "Preferences", preferencesHint: "Remember your language and appearance for your next visit.",
    always: "Always on", none: "We do not use advertising or tracking cookies.", privacy: "Privacy policy"
  },
  orders: {
    eyebrow: "Orders", title: "My orders", empty: "No orders yet", browse: "Browse the catalog", delivery: "Delivery", total: "Total", totalPending: "Shown once the price is confirmed", payment: "Payment", history: "Status history", cancelled: "This order was cancelled.", map: "View on map", trackLabel: "Order status", note: "Note", account: "Account",
    status: { NEW: "Received", CONFIRMED: "Confirmed", PREPARING: "Preparing", SHIPPED: "On the way", DELIVERED: "Delivered", CANCELLED: "Cancelled" },
    method: { CASH: "Cash", CARD_ON_DELIVERY: "Card to courier", CARD_TRANSFER: "Card transfer", WALLET: "Tecsecure wallet", UNSPECIFIED: "To be agreed" },
    paymentStatus: { PENDING: "Pay on delivery", AWAITING_CONFIRMATION: "Receipt under review", PAID: "Paid", REFUNDED: "Refunded" }
  },
  admin: {
    overview: "Overview", overviewHint: "Everything that needs attention today, in one place.", attention: "Waiting for action", allClear: "Nothing is waiting right now.", quick: "Quick actions", ordersTitle: "Orders", all: "All", byStatus: "By status", noOrders: "No orders with this status.", back: "Admin panel", search: "Search by number, name or phone", viewProof: "View receipt", confirmPayment: "Confirm payment", confirmed: "Payment confirmed.", failed: "That did not work. Please try again.",
    newOrders: "New orders", pendingWallet: "Wallet requests", openRequests: "New requests", pendingPayments: "Unconfirmed payments", customers: "Customers", revenue: "Sales this month", revenueHint: "Delivered orders", botOff: "Telegram bot is not connected", botOffHint: "New requests do not reach the bot. Enter the token and chat ID.", botOn: "Telegram bot is connected", card: "Payment card", cardHint: "Customers transfer money to this card for top-ups and orders.", cardNumber: "Card number", cardHolder: "Card holder", cardBank: "Bank", addProduct: "Add a product", addWork: "Add a project", openOrders: "Open orders", openIntegrations: "Set up the bot", botTest: "Test the bot", botTestFailed: "Could not reach the bot. Check the token and chat ID.", botTestSent: "Test message sent.", botWebhookOn: "Buttons are connected too.", botWebhookSecret: "Enter the webhook secret so the buttons work.", botWebhookLocal: "Bot buttons connect once the site runs on HTTPS."
  },
  work: { eyebrow: "Our work", title: "From real projects", intro: "Real photos from client sites: tidy cabinets, cable routes and installed equipment.", all: "All", photos: "photos", open: "View larger", next: "Next photo", prev: "Previous photo", play: "Autoplay", pause: "Pause", close: "Close", drag: "Swipe or use the arrows", cta: "Want a result like this?", ctaHint: "Describe your site and we will confirm price and timing.", ctaButton: "Send a request", seeAll: "All projects", projects: "projects", shots: "photos" },
  shop: { recent: "Recently viewed", recentHint: "Pick up where you left off.", buy: "Add to cart", trust: { delivery: "Delivery", deliveryHint: "Address and timing agreed with your order", warranty: "Warranty", warrantyHint: "Backed by the manufacturer", install: "Installation", installHint: "Our specialists can install it" } },
  contactDock: { call: "Call" },
  common: { copy: "Copy", copied: "Copied", tryAgain: "Try again", chooseFiles: "Choose files", chooseImage: "Choose image", proofHint: "JPG, PNG or WebP, up to 8 MB.", proofLabel: "Payment receipt" }
};

export const siteCopy: Record<Locale, SiteCopy> = { uz, ru, en };
