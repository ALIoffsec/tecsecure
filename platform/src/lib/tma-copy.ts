import type { Locale } from "./messages";

/** Words for the staff Telegram Mini App (the shop cabinet has its own, seller-app-copy). Request status names come from messages. */
const uz = {
  staff: {
    tabs: { today: "Bugun", requests: "Arizalar", orders: "Buyurtmalar", profile: "Profil" },
    hello: "Salom", needNow: "Hozir kerak", allClear: "Kutayotgan ish yo‘q. Yangi ariza yoki buyurtma kelsa, bot xabar beradi.",
    statNewRequests: "Yangi arizalar", statActiveOrders: "Faol buyurtmalar", statProof: "Chek tekshiruvi", statWallet: "Hamyon so‘rovlari",
    todayCame: "Bugun keldi", todayDone: "Bugun yakunlandi", requestsWord: "ariza", ordersWord: "buyurtma",
    wallet: "Hamyon so‘rovlari", deposit: "To‘ldirish", withdrawal: "Yechish", approve: "Tasdiqlash", reject: "Rad etish", proof: "Chekni ko‘rish",
    filterNew: "Yangi", filterActive: "Jarayonda", filterAll: "Hammasi", filterProof: "Chek kutmoqda",
    noAccess: "Bu bo‘lim sizga ochilmagan. Ruxsatni administrator beradi.", empty: "Bu yerda hozircha hech narsa yo‘q.",
    contact: "Aloqa", call: "Qo‘ng‘iroq qilish", service: "Xizmat", city: "Shahar", location: "Manzil", budget: "Byudjet", contactTime: "Qulay vaqt", organization: "Tashkilot",
    description: "Tavsif", otherSteps: "Boshqa holatlar", createdAt: "Kelgan vaqti",
    requestAction: {
      UNDER_REVIEW: "Ko‘rib chiqishga olish", CONTACTED: "Bog‘lanildi", INSPECTION_REQUIRED: "Joyida ko‘rik kerak", QUOTATION_SENT: "Taklif yuborildi",
      APPROVED: "Mijoz rozi bo‘ldi", IN_PROGRESS: "Ishni boshlash", COMPLETED: "Yakunlash", REJECTED: "Rad etish", CANCELLED: "Bekor qilish"
    } as Record<string, string>,
    items: "Mahsulotlar", delivery: "Yetkazish", payment: "To‘lov", note: "Izoh", company: "Kompaniya", confirmPayment: "To‘lovni tasdiqlash",
    goods: "Mahsulotlar", deliveryFee: "Yetkazish", total: "Jami", pcs: "dona",
    deliveryMethod: { EXPRESS: "Shahar ichida kuryer", COURIER: "Viloyatga kuryer yoki pochta", PICKUP: "Olib ketish", AGREED: "Telefonda kelishiladi" } as Record<string, string>,
    confirmDanger: "Rostdan ham shu amalni bajarasizmi?",
    role: { FOUNDER: "Asoschi", ADMIN: "Administrator", STAFF: "Xodim" } as Record<string, string>,
    permissions: "Ochiq bo‘limlar", allModules: "Barcha bo‘limlar", telegramLinked: "Telegram ulangan", fullPanel: "To‘liq admin panel", logout: "Chiqish",
    module: { REQUESTS: "Arizalar", PROJECTS: "Loyihalar", SERVICES: "Xizmatlar", PRODUCTS: "Do‘kon va buyurtmalar", NEWS: "Yangiliklar", COMPANY: "Kompaniya", USERS: "Foydalanuvchilar", SUBSCRIPTIONS: "Obunalar", PAYMENTS: "To‘lovlar", CONTENT: "Kontent", PORTFOLIO: "Portfolio", WALLET: "Hamyon", SYSTEM: "Tizim" } as Record<string, string>,
    done: "Bajarildi", failed: "Amal bajarilmadi. Qayta urinib ko‘ring."
  }
};

type TmaCopy = typeof uz;

const ru: TmaCopy = {
  staff: {
    tabs: { today: "Сегодня", requests: "Заявки", orders: "Заказы", profile: "Профиль" },
    hello: "Здравствуйте", needNow: "Нужно сейчас", allClear: "Ожидающих задач нет. Когда придёт заявка или заказ, бот сообщит.",
    statNewRequests: "Новые заявки", statActiveOrders: "Активные заказы", statProof: "Проверка чека", statWallet: "Заявки кошелька",
    todayCame: "Сегодня пришло", todayDone: "Сегодня завершено", requestsWord: "заявок", ordersWord: "заказов",
    wallet: "Заявки кошелька", deposit: "Пополнение", withdrawal: "Вывод", approve: "Подтвердить", reject: "Отклонить", proof: "Посмотреть чек",
    filterNew: "Новые", filterActive: "В работе", filterAll: "Все", filterProof: "Ждут проверки",
    noAccess: "Этот раздел вам не открыт. Доступ выдаёт администратор.", empty: "Здесь пока ничего нет.",
    contact: "Контакт", call: "Позвонить", service: "Услуга", city: "Город", location: "Адрес", budget: "Бюджет", contactTime: "Удобное время", organization: "Организация",
    description: "Описание", otherSteps: "Другие статусы", createdAt: "Поступила",
    requestAction: {
      UNDER_REVIEW: "Взять в работу", CONTACTED: "Связались", INSPECTION_REQUIRED: "Нужен выезд на осмотр", QUOTATION_SENT: "Предложение отправлено",
      APPROVED: "Клиент согласился", IN_PROGRESS: "Начать работу", COMPLETED: "Завершить", REJECTED: "Отклонить", CANCELLED: "Отменить"
    },
    items: "Товары", delivery: "Доставка", payment: "Оплата", note: "Комментарий", company: "Компания", confirmPayment: "Подтвердить оплату",
    goods: "Товары", deliveryFee: "Доставка", total: "Итого", pcs: "шт.",
    deliveryMethod: { EXPRESS: "Курьер по городу", COURIER: "Курьер или почта в регион", PICKUP: "Самовывоз", AGREED: "Договоримся по телефону" },
    confirmDanger: "Точно выполнить это действие?",
    role: { FOUNDER: "Основатель", ADMIN: "Администратор", STAFF: "Сотрудник" },
    permissions: "Открытые разделы", allModules: "Все разделы", telegramLinked: "Telegram подключён", fullPanel: "Полная админ-панель", logout: "Выйти",
    module: { REQUESTS: "Заявки", PROJECTS: "Проекты", SERVICES: "Услуги", PRODUCTS: "Магазин и заказы", NEWS: "Новости", COMPANY: "Компания", USERS: "Пользователи", SUBSCRIPTIONS: "Подписки", PAYMENTS: "Платежи", CONTENT: "Контент", PORTFOLIO: "Портфолио", WALLET: "Кошелёк", SYSTEM: "Система" },
    done: "Готово", failed: "Не удалось выполнить. Попробуйте ещё раз."
  }
};

const en: TmaCopy = {
  staff: {
    tabs: { today: "Today", requests: "Requests", orders: "Orders", profile: "Profile" },
    hello: "Hello", needNow: "Needs you now", allClear: "Nothing is waiting. The bot will tell you when a request or order comes in.",
    statNewRequests: "New requests", statActiveOrders: "Active orders", statProof: "Receipts to check", statWallet: "Wallet requests",
    todayCame: "Came in today", todayDone: "Finished today", requestsWord: "requests", ordersWord: "orders",
    wallet: "Wallet requests", deposit: "Top-up", withdrawal: "Withdrawal", approve: "Approve", reject: "Reject", proof: "View receipt",
    filterNew: "New", filterActive: "In progress", filterAll: "All", filterProof: "Receipt waiting",
    noAccess: "This section is not open to you. An administrator grants access.", empty: "Nothing here yet.",
    contact: "Contact", call: "Call", service: "Service", city: "City", location: "Address", budget: "Budget", contactTime: "Best time", organization: "Organization",
    description: "Description", otherSteps: "Other statuses", createdAt: "Received",
    requestAction: {
      UNDER_REVIEW: "Take it", CONTACTED: "Contacted", INSPECTION_REQUIRED: "Site visit needed", QUOTATION_SENT: "Quote sent",
      APPROVED: "Customer agreed", IN_PROGRESS: "Start work", COMPLETED: "Complete", REJECTED: "Reject", CANCELLED: "Cancel"
    },
    items: "Items", delivery: "Delivery", payment: "Payment", note: "Note", company: "Company", confirmPayment: "Confirm payment",
    goods: "Goods", deliveryFee: "Delivery", total: "Total", pcs: "pcs",
    deliveryMethod: { EXPRESS: "City courier", COURIER: "Regional courier or post", PICKUP: "Pickup", AGREED: "Agreed by phone" },
    confirmDanger: "Are you sure you want to do this?",
    role: { FOUNDER: "Founder", ADMIN: "Administrator", STAFF: "Staff" },
    permissions: "Open sections", allModules: "All sections", telegramLinked: "Telegram linked", fullPanel: "Full admin panel", logout: "Sign out",
    module: { REQUESTS: "Requests", PROJECTS: "Projects", SERVICES: "Services", PRODUCTS: "Store and orders", NEWS: "News", COMPANY: "Company", USERS: "Users", SUBSCRIPTIONS: "Subscriptions", PAYMENTS: "Payments", CONTENT: "Content", PORTFOLIO: "Portfolio", WALLET: "Wallet", SYSTEM: "System" },
    done: "Done", failed: "That did not work. Please try again."
  }
};

export const tmaCopy: Record<Locale, TmaCopy> = { uz, ru, en };

const months: Record<Locale, string[]> = {
  uz: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
const weekdays: Record<Locale, string[]> = {
  uz: ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"],
  ru: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
};

/** "chorshanba, 11-noyabr" in Tashkent time, spelled out by hand: Node and browsers disagree on Uzbek dates. */
export function longDay(value: Date | string, locale: Locale): string {
  const local = new Date(new Date(value).getTime() + 5 * 60 * 60 * 1000);
  const day = local.getUTCDate();
  const weekday = weekdays[locale][local.getUTCDay()];
  const month = months[locale][local.getUTCMonth()];
  if (locale === "uz") return `${weekday}, ${day}-${month}`;
  if (locale === "ru") return `${weekday}, ${day} ${month}`;
  return `${weekday}, ${month} ${day}`;
}
