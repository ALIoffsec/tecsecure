import type { Locale } from "./messages";

/** Every word of the seller app (Telegram Mini App and web). */
const uz = {
  tabs: { home: "Bosh", orders: "Buyurtmalar", products: "Mahsulotlar", balance: "Balans" },
  common: { save: "Saqlash", saving: "Saqlanmoqda…", cancel: "Bekor qilish", back: "Orqaga", retry: "Qayta urinish", loading: "Yuklanmoqda…", failed: "Bajarilmadi. Qayta urinib ko‘ring.", done: "Bajarildi", sum: "so‘m", pcs: "dona", open: "Ochish", close: "Yopish", copy: "Nusxalash", copied: "Nusxalandi", confirm: "Rostdan ham shu amalni bajarasizmi?" },
  home: {
    hello: "Salom", todo: "Hozir bajarish kerak", allClear: "Hozircha kutayotgan ish yo‘q. Yangi buyurtma kelsa, Telegram’ga xabar keladi.",
    toAccept: "Qabul qilish kerak", awaitingPayment: "To‘lov kutilmoqda", toShip: "Jo‘natish kerak", shipped: "Yo‘lda",
    money: "Pul", balance: "Balans", pending: "Yo‘lda (yetkazilgach tushadi)", earned30: "30 kunda tushgan",
    listings: "Mahsulotlar", onSale: "Sotuvda", inReview: "Tekshiruvda", rejected: "Rad etilgan", advertised: "Reklamada", views: "Ko‘rishlar",
    lowStock: "Qoldiq kam", outOfStock: "Tugagan", topSold: "30 kunda ko‘p sotilgan", topViewed: "Ko‘p ko‘rilgan",
    addProduct: "Mahsulot qo‘shish", storefront: "Do‘kon sahifasi", visitCard: "Vizitka va QR", settings: "Do‘kon sozlamalari",
    delivered: "Yetkazilgan buyurtmalar", disputes: (n: number) => `${n} ta buyurtma bo‘yicha mijoz muammo bildirdi. Xodimimiz bog‘lanadi; hal bo‘lguncha ularning puli balansga yozilmaydi.`, share: "Do‘kon havolasi", shareHint: "Havola va QR orqali kelgan mijozlardan komissiya kamroq:", commission: "Komissiya"
  },
  orders: {
    title: "Buyurtmalar", empty: "Bu bo‘limda buyurtma yo‘q.",
    filters: { active: "Faol", new: "Yangi", ship: "Jo‘natish", road: "Yo‘lda", done: "Yakunlangan", cancelled: "Bekor" },
    status: { NEW: "Yangi", CONFIRMED: "Qabul qilindi", PREPARING: "Tayyorlanmoqda", SHIPPED: "Jo‘natildi", DELIVERED: "Yetkazildi", CANCELLED: "Bekor qilindi" } as Record<string, string>,
    action: { CONFIRMED: "Qabul qilish", PREPARING: "Tayyorlashni boshlash", SHIPPED: "Jo‘natildi deb belgilash", DELIVERED: "Yetkazildi deb belgilash", CANCELLED: "Bekor qilish" } as Record<string, string>,
    paid: "To‘langan", notPaid: "To‘lov hali tasdiqlanmagan — tasdiqlangach xabar keladi, keyin qabul qiling.",
    items: "Mahsulotlar", buyer: "Qabul qiluvchi", call: "Qo‘ng‘iroq", address: "Manzil", map: "Xaritada", delivery: "Yetkazish", note: "Mijoz izohi",
    money: "Hisob", goods: "Mahsulotlar", commission: "Komissiya", deliveryShare: "Yetkazish ulushi", youGet: "Sizga tushadi", credited: "Balansga yozildi", notCredited: "Yetkazilgach va to‘lov tasdiqlangach balansga yoziladi", disputeShort: "Mijoz muammo bildirdi", disputeTitle: "Mijoz muammo bildirdi:", disputeHint: "Tecsecure xodimi siz va mijoz bilan bog‘lanadi. Hal bo‘lguncha bu buyurtma puli balansga yozilmaydi.", disputeDone: { RELEASED: "Murojaat yopildi: pul balansingizga yoziladi.", REFUNDED: "Murojaat mijoz foydasiga hal qilindi: buyurtma bekor, pul mijozga qaytarildi." } as Record<string, string>,
    creditOn: "Mijoz e’tirozi uchun ushlab turiladi, balansga yoziladi:", holdNote: (days: number) => `(yetkazilgandan ${days} kun o‘tib).`,
    sellerNote: "Mijozga izoh (trek raqami, kuryer telefoni…)", sellerNoteSaved: "Izoh", cancelReason: "Bekor qilish sababi (mijozga ko‘rinadi)", reasonNeeded: "Sababini yozing.",
    methods: { EXPRESS: "Shahar ichida kuryer", COURIER: "Viloyatga kuryer yoki pochta", PICKUP: "Mijoz olib ketadi", AGREED: "Telefonda kelishiladi" } as Record<string, string>,
    timeline: "Bosqichlar", referral: "QR orqali kelgan mijoz — kamaytirilgan komissiya"
  },
  products: {
    title: "Mahsulotlar", add: "Qo‘shish", search: "Qidirish…", empty: "Bu bo‘limda mahsulot yo‘q.", emptyAll: "Hali mahsulot yo‘q. Birinchisini qo‘shing — rasm, nom va narx kifoya.",
    filters: { all: "Hammasi", sale: "Sotuvda", review: "Tekshiruvda", rejected: "Rad etilgan", hidden: "Yashirilgan", out: "Tugagan" },
    state: { sale: "Sotuvda", review: "Tekshiruvda", rejected: "Rad etildi", hidden: "Yashirilgan", out: "Tugagan" },
    sold: "sotildi", views: "ko‘rildi", stock: "Qoldiq", notCounted: "sanalmaydi", ad: "Reklama", adUntil: "gacha",
    edit: "Tahrirlash", hide: "Sotuvdan olish", show: "Sotuvga qaytarish", remove: "O‘chirish", removeConfirm: "Mahsulot butunlay o‘chiriladi (eski buyurtmalarda nomi qoladi). Davom etasizmi?",
    onSite: "Saytda ko‘rish", promote: "Topga chiqarish", reason: "Rad etish sababi", quick: "Tezkor o‘zgartirish", price: "Narx", saveQuick: "Narx va qoldiqni saqlash",
    promoteTitle: "Topga chiqarish", promoteHint: "Mahsulot katalogda yuqorida, “Reklama” belgisi bilan chiqadi. Pul balansingizdan yechiladi.",
    promoteOff: "Reklama hozircha yoqilmagan. Narxni Tecsecure belgilagach, shu yerda ochiladi.", days: "Kunlar", perDay: "kuniga", total: "Jami", buy: "Sotib olish",
    promoteOnlySale: "Faqat sotuvdagi mahsulotni reklama qilish mumkin.", balanceLow: "Balans yetarli emas"
  },
  editor: {
    newTitle: "Yangi mahsulot", editTitle: "Mahsulotni tahrirlash", photos: "Rasmlar", photosHint: "Avval rasm: oq yoki toza fonda, kamida 600×600 piksel. Birinchi rasm — muqova. 10 tagacha.",
    addPhoto: "Rasm qo‘shish", uploading: "Yuklanmoqda…", cover: "Muqova", left: "Chapga", right: "O‘ngga", removePhoto: "O‘chirish",
    name: "Nomi", namePh: "Masalan: Hikvision DS-2CD1043G2-I 4 MP IP kamera", category: "Kategoriya", chooseCategory: "Kategoriyani tanlang",
    brand: "Brend", model: "Model", sku: "Artikul (SKU)", price: "Narx", currency: "Valyuta", stock: "Omborda (dona)", stockHint: "Bo‘sh qoldirsangiz, sanalmaydi. Kiritsangiz, sotilganda o‘zi kamayadi va 0 bo‘lsa “Tugagan” bo‘ladi.",
    warranty: "Kafolat", warrantyPh: "Masalan: 12 oy, ishlab chiqaruvchi kafolati", description: "Tavsif", descriptionHint: "Kamida 20 belgi: nimaga kerak, nima kiradi, asosiy afzalliklari.",
    specs: "Xususiyatlar", specKey: "Nomi (masalan: Ruxsat)", specValue: "Qiymati (masalan: 4 MP)", addSpec: "Xususiyat qo‘shish",
    translations: "Rus va ingliz tilida (ixtiyoriy)", ruName: "Nomi (rus)", ruDescription: "Tavsif (rus)", enName: "Nomi (ingliz)", enDescription: "Tavsif (ingliz)",
    reviewNote: "Yangi mahsulot Tecsecure xodimi tekshirgandan keyin sotuvga chiqadi.",
    reReviewNote: "Matn, rasm yoki xususiyat o‘zgarsa, mahsulot qayta tekshiruvga ketadi va tasdiqlanguncha saytda ko‘rinmaydi. Narx va qoldiq darhol yangilanadi.",
    submitNew: "Tekshiruvga yuborish", submitEdit: "Saqlash", saved: "Saqlandi", sentToReview: "Tekshiruvga yuborildi", required: "Majburiy maydonlarni to‘ldiring: rasm, nom, kategoriya, narx va tavsif."
  },
  balance: {
    title: "Balans", available: "Yechib olish mumkin", pending: "Yo‘lda", pendingHint: "Qabul qilingan, lekin hali yetkazilmagan, to‘lovi tasdiqlanmagan yoki ushlab turish muddati tugamagan buyurtmalardan.",
    commission: "Komissiya", referral: "QR orqali", history: "Tarix", noHistory: "Hali harakat yo‘q.",
    kinds: { SALE: "Sotuv", PROMOTION: "Reklama", PAYOUT: "Pul yechish", PAYOUT_RETURNED: "Qaytarildi", ADJUSTMENT: "Tuzatish" } as Record<string, string>,
    payout: "Pul yechish", payoutHint: "Pul do‘kon bank hisobiga o‘tkaziladi. So‘ralgan summa ko‘rib chiqilguncha balansdan ushlab turiladi.",
    amount: "Summa (so‘m)", all: "Hammasi", request: "So‘rov yuborish", requested: "So‘rov yuborildi",
    payouts: "So‘rovlar", payoutStatus: { REQUESTED: "Ko‘rib chiqilmoqda", PAID: "O‘tkazildi", REJECTED: "Qaytarildi" } as Record<string, string>,
    details: "Bank rekvizitlari", detailsHint: "Faqat do‘kon (YaTT yoki MChJ) bank hisobi. Karta raqami qabul qilinmaydi.",
    bank: "Bank nomi", account: "Hisob raqami (20 raqam)", mfo: "MFO (5 raqam)", recipient: "Qabul qiluvchi (YaTT/MChJ nomi)", saveDetails: "Rekvizitlarni saqlash", needDetails: "Avval bank rekvizitlarini kiriting."
  },
  profile: {
    title: "Do‘kon sozlamalari", notify: "Telegram xabarlari", notifyHint: "Yangi buyurtma, to‘lov va qoldiq haqida xabarlar.", info: "Do‘kon ma’lumotlari",
    storefront: "Do‘kon sahifasi", qr: "QR kodni yuklab olish", card: "Vizitkani chop etish", logout: "Chiqish", status: "Holat", web: "Brauzerda ochish"
  },
  apply: { title: "Do‘kon ochish", hint: "Arizani to‘ldiring. Xodimlarimiz tekshirib, natijani shu bot orqali yuboradi.", staff: "Bu xodim hisobi. Do‘kon kabineti mijoz hisobi bilan ochiladi." }
};

type SellerAppCopy = typeof uz;

const ru: SellerAppCopy = {
  tabs: { home: "Главная", orders: "Заказы", products: "Товары", balance: "Баланс" },
  common: { save: "Сохранить", saving: "Сохраняем…", cancel: "Отмена", back: "Назад", retry: "Повторить", loading: "Загрузка…", failed: "Не получилось. Попробуйте ещё раз.", done: "Готово", sum: "сум", pcs: "шт.", open: "Открыть", close: "Закрыть", copy: "Копировать", copied: "Скопировано", confirm: "Точно выполнить это действие?" },
  home: {
    hello: "Здравствуйте", todo: "Нужно сделать сейчас", allClear: "Ожидающих дел нет. Когда придёт заказ, Telegram сообщит.",
    toAccept: "Принять", awaitingPayment: "Ждут оплаты", toShip: "Отправить", shipped: "В пути",
    money: "Деньги", balance: "Баланс", pending: "В пути (поступит после доставки)", earned30: "Поступило за 30 дней",
    listings: "Товары", onSale: "В продаже", inReview: "На проверке", rejected: "Отклонены", advertised: "В рекламе", views: "Просмотры",
    lowStock: "Мало на складе", outOfStock: "Закончились", topSold: "Продаются лучше всего (30 дней)", topViewed: "Чаще смотрят",
    addProduct: "Добавить товар", storefront: "Страница магазина", visitCard: "Визитка и QR", settings: "Настройки магазина",
    delivered: "Доставленные заказы", disputes: (n: number) => `Покупатели сообщили о проблеме по заказам: ${n}. Сотрудник свяжется с вами; пока вопрос не решён, деньги не поступят на баланс.`, share: "Ссылка на магазин", shareHint: "С покупателей по ссылке и QR комиссия ниже:", commission: "Комиссия"
  },
  orders: {
    title: "Заказы", empty: "Здесь заказов нет.",
    filters: { active: "Активные", new: "Новые", ship: "Отправить", road: "В пути", done: "Завершены", cancelled: "Отменены" },
    status: { NEW: "Новый", CONFIRMED: "Принят", PREPARING: "Готовится", SHIPPED: "Отправлен", DELIVERED: "Доставлен", CANCELLED: "Отменён" },
    action: { CONFIRMED: "Принять", PREPARING: "Начать подготовку", SHIPPED: "Отметить отправленным", DELIVERED: "Отметить доставленным", CANCELLED: "Отменить" },
    paid: "Оплачен", notPaid: "Оплата ещё не подтверждена — после подтверждения придёт сообщение, тогда принимайте.",
    items: "Товары", buyer: "Получатель", call: "Позвонить", address: "Адрес", map: "На карте", delivery: "Доставка", note: "Комментарий покупателя",
    money: "Расчёт", goods: "Товары", commission: "Комиссия", deliveryShare: "Доля доставки", youGet: "Вам поступит", credited: "Зачислено на баланс", notCredited: "Зачисляется после доставки и подтверждения оплаты", disputeShort: "Претензия покупателя", disputeTitle: "Покупатель сообщил о проблеме:", disputeHint: "Сотрудник Tecsecure свяжется с вами и покупателем. Пока вопрос не решён, деньги за заказ не поступят на баланс.", disputeDone: { RELEASED: "Претензия закрыта: деньги поступят на ваш баланс.", REFUNDED: "Претензия решена в пользу покупателя: заказ отменён, деньги возвращены." } as Record<string, string>,
    creditOn: "Удерживается на случай претензии покупателя, поступит на баланс:", holdNote: (days: number) => `(через ${days} дн. после доставки).`,
    sellerNote: "Комментарий покупателю (трек-номер, телефон курьера…)", sellerNoteSaved: "Комментарий", cancelReason: "Причина отмены (видна покупателю)", reasonNeeded: "Укажите причину.",
    methods: { EXPRESS: "Курьер по городу", COURIER: "Курьер или почта в регион", PICKUP: "Самовывоз", AGREED: "Договоримся по телефону" },
    timeline: "Этапы", referral: "Покупатель пришёл по QR — сниженная комиссия"
  },
  products: {
    title: "Товары", add: "Добавить", search: "Поиск…", empty: "Здесь товаров нет.", emptyAll: "Товаров пока нет. Добавьте первый — достаточно фото, названия и цены.",
    filters: { all: "Все", sale: "В продаже", review: "На проверке", rejected: "Отклонены", hidden: "Скрыты", out: "Закончились" },
    state: { sale: "В продаже", review: "На проверке", rejected: "Отклонён", hidden: "Скрыт", out: "Закончился" },
    sold: "продано", views: "просмотров", stock: "Остаток", notCounted: "не считается", ad: "Реклама", adUntil: "до",
    edit: "Редактировать", hide: "Снять с продажи", show: "Вернуть в продажу", remove: "Удалить", removeConfirm: "Товар будет удалён (в старых заказах название останется). Продолжить?",
    onSite: "Открыть на сайте", promote: "Поднять в топ", reason: "Причина отклонения", quick: "Быстрое изменение", price: "Цена", saveQuick: "Сохранить цену и остаток",
    promoteTitle: "Поднять в топ", promoteHint: "Товар будет вверху каталога с пометкой «Реклама». Оплата списывается с баланса.",
    promoteOff: "Реклама пока не включена. Откроется здесь, когда Tecsecure установит цену.", days: "Дней", perDay: "в день", total: "Итого", buy: "Купить",
    promoteOnlySale: "Рекламировать можно только товар в продаже.", balanceLow: "Недостаточно средств"
  },
  editor: {
    newTitle: "Новый товар", editTitle: "Редактирование товара", photos: "Фото", photosHint: "Сначала фото: белый или чистый фон, не меньше 600×600 пикселей. Первое фото — обложка. До 10.",
    addPhoto: "Добавить фото", uploading: "Загрузка…", cover: "Обложка", left: "Влево", right: "Вправо", removePhoto: "Удалить",
    name: "Название", namePh: "Например: Hikvision DS-2CD1043G2-I 4 MP IP-камера", category: "Категория", chooseCategory: "Выберите категорию",
    brand: "Бренд", model: "Модель", sku: "Артикул (SKU)", price: "Цена", currency: "Валюта", stock: "На складе (шт.)", stockHint: "Если пусто — не считается. Если указать, уменьшается при продаже, а при 0 товар «закончился».",
    warranty: "Гарантия", warrantyPh: "Например: 12 месяцев, гарантия производителя", description: "Описание", descriptionHint: "Не меньше 20 символов: для чего, что входит, главные плюсы.",
    specs: "Характеристики", specKey: "Название (например: Разрешение)", specValue: "Значение (например: 4 MP)", addSpec: "Добавить характеристику",
    translations: "На русском и английском (необязательно)", ruName: "Название (рус.)", ruDescription: "Описание (рус.)", enName: "Название (англ.)", enDescription: "Описание (англ.)",
    reviewNote: "Новый товар появится в продаже после проверки сотрудником Tecsecure.",
    reReviewNote: "При изменении текста, фото или характеристик товар уходит на повторную проверку и скрыт до одобрения. Цена и остаток меняются сразу.",
    submitNew: "Отправить на проверку", submitEdit: "Сохранить", saved: "Сохранено", sentToReview: "Отправлено на проверку", required: "Заполните обязательные поля: фото, название, категория, цена и описание."
  },
  balance: {
    title: "Баланс", available: "Можно вывести", pending: "В пути", pendingHint: "Из принятых заказов: ещё не доставлены, без подтверждённой оплаты или срок удержания не истёк.",
    commission: "Комиссия", referral: "Через QR", history: "История", noHistory: "Движений пока нет.",
    kinds: { SALE: "Продажа", PROMOTION: "Реклама", PAYOUT: "Вывод", PAYOUT_RETURNED: "Возвращено", ADJUSTMENT: "Корректировка" },
    payout: "Вывод денег", payoutHint: "Деньги переводятся на банковский счёт магазина. Сумма удерживается с баланса до рассмотрения.",
    amount: "Сумма (сум)", all: "Всё", request: "Отправить запрос", requested: "Запрос отправлен",
    payouts: "Запросы", payoutStatus: { REQUESTED: "На рассмотрении", PAID: "Переведено", REJECTED: "Возвращено" },
    details: "Банковские реквизиты", detailsHint: "Только расчётный счёт магазина (ИП или ООО). Номер карты не принимается.",
    bank: "Банк", account: "Расчётный счёт (20 цифр)", mfo: "МФО (5 цифр)", recipient: "Получатель (название ИП/ООО)", saveDetails: "Сохранить реквизиты", needDetails: "Сначала укажите банковские реквизиты."
  },
  profile: {
    title: "Настройки магазина", notify: "Сообщения в Telegram", notifyHint: "О новых заказах, оплате и остатках.", info: "Данные магазина",
    storefront: "Страница магазина", qr: "Скачать QR-код", card: "Распечатать визитку", logout: "Выйти", status: "Статус", web: "Открыть в браузере"
  },
  apply: { title: "Открыть магазин", hint: "Заполните заявку. Сотрудники проверят её и пришлют ответ через этого бота.", staff: "Это аккаунт сотрудника. Кабинет магазина открывается с аккаунта клиента." }
};

const en: SellerAppCopy = {
  tabs: { home: "Home", orders: "Orders", products: "Products", balance: "Balance" },
  common: { save: "Save", saving: "Saving…", cancel: "Cancel", back: "Back", retry: "Retry", loading: "Loading…", failed: "That did not work. Please try again.", done: "Done", sum: "so‘m", pcs: "pcs", open: "Open", close: "Close", copy: "Copy", copied: "Copied", confirm: "Are you sure?" },
  home: {
    hello: "Hello", todo: "Needs doing now", allClear: "Nothing is waiting. Telegram will tell you when an order comes in.",
    toAccept: "To accept", awaitingPayment: "Awaiting payment", toShip: "To ship", shipped: "On the way",
    money: "Money", balance: "Balance", pending: "On the way (after delivery)", earned30: "Earned in 30 days",
    listings: "Products", onSale: "On sale", inReview: "In review", rejected: "Rejected", advertised: "Advertised", views: "Views",
    lowStock: "Low stock", outOfStock: "Out of stock", topSold: "Best sellers (30 days)", topViewed: "Most viewed",
    addProduct: "Add product", storefront: "Shop page", visitCard: "Visit card and QR", settings: "Shop settings",
    delivered: "Orders delivered", disputes: (n: number) => `Buyers reported a problem with ${n} order(s). Our staff will contact you; until settled, that money does not reach your balance.`, share: "Shop link", shareHint: "Buyers who come through the link and QR cost you less commission:", commission: "Commission"
  },
  orders: {
    title: "Orders", empty: "No orders here.",
    filters: { active: "Active", new: "New", ship: "To ship", road: "On the way", done: "Done", cancelled: "Cancelled" },
    status: { NEW: "New", CONFIRMED: "Accepted", PREPARING: "Preparing", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled" },
    action: { CONFIRMED: "Accept", PREPARING: "Start preparing", SHIPPED: "Mark shipped", DELIVERED: "Mark delivered", CANCELLED: "Cancel" },
    paid: "Paid", notPaid: "Payment not confirmed yet — you will get a message, then accept.",
    items: "Items", buyer: "Recipient", call: "Call", address: "Address", map: "On map", delivery: "Delivery", note: "Buyer's note",
    money: "Settlement", goods: "Goods", commission: "Commission", deliveryShare: "Delivery share", youGet: "You get", credited: "Credited to balance", notCredited: "Credited after delivery and payment", disputeShort: "Buyer complaint", disputeTitle: "The buyer reported a problem:", disputeHint: "Tecsecure staff will contact you and the buyer. Until it is settled, this order's money does not reach your balance.", disputeDone: { RELEASED: "Complaint closed: the money goes to your balance.", REFUNDED: "Settled for the buyer: the order is cancelled and the money returned." } as Record<string, string>,
    creditOn: "Held in case the buyer complains, reaches your balance on", holdNote: (days: number) => `(${days} days after delivery).`,
    sellerNote: "Note to the buyer (tracking number, courier phone…)", sellerNoteSaved: "Note", cancelReason: "Reason for cancelling (the buyer sees it)", reasonNeeded: "Write a reason.",
    methods: { EXPRESS: "City courier", COURIER: "Regional courier or post", PICKUP: "Pickup", AGREED: "Agreed by phone" },
    timeline: "Steps", referral: "Buyer came through your QR — lower commission"
  },
  products: {
    title: "Products", add: "Add", search: "Search…", empty: "No products here.", emptyAll: "No products yet. Add the first one — a photo, a name and a price are enough.",
    filters: { all: "All", sale: "On sale", review: "In review", rejected: "Rejected", hidden: "Hidden", out: "Out of stock" },
    state: { sale: "On sale", review: "In review", rejected: "Rejected", hidden: "Hidden", out: "Out of stock" },
    sold: "sold", views: "views", stock: "Stock", notCounted: "not counted", ad: "Ad", adUntil: "until",
    edit: "Edit", hide: "Take off sale", show: "Put back on sale", remove: "Delete", removeConfirm: "The product is deleted (old orders keep its name). Continue?",
    onSite: "View on site", promote: "Promote", reason: "Reason", quick: "Quick change", price: "Price", saveQuick: "Save price and stock",
    promoteTitle: "Promote", promoteHint: "The product shows at the top of the catalogue, marked “Ad”. Paid from your balance.",
    promoteOff: "Advertising is not on yet. It opens here once Tecsecure sets a price.", days: "Days", perDay: "per day", total: "Total", buy: "Buy",
    promoteOnlySale: "Only a product on sale can be promoted.", balanceLow: "Balance too low"
  },
  editor: {
    newTitle: "New product", editTitle: "Edit product", photos: "Photos", photosHint: "Photos first: white or clean background, at least 600×600 pixels. The first is the cover. Up to 10.",
    addPhoto: "Add photo", uploading: "Uploading…", cover: "Cover", left: "Left", right: "Right", removePhoto: "Remove",
    name: "Name", namePh: "e.g. Hikvision DS-2CD1043G2-I 4 MP IP camera", category: "Category", chooseCategory: "Choose a category",
    brand: "Brand", model: "Model", sku: "SKU", price: "Price", currency: "Currency", stock: "In stock (pcs)", stockHint: "Leave empty to not count. If set, it drops with each sale and at 0 the product is out of stock.",
    warranty: "Warranty", warrantyPh: "e.g. 12 months, manufacturer's warranty", description: "Description", descriptionHint: "At least 20 characters: what it is for, what is included, main benefits.",
    specs: "Specifications", specKey: "Name (e.g. Resolution)", specValue: "Value (e.g. 4 MP)", addSpec: "Add a specification",
    translations: "Russian and English (optional)", ruName: "Name (Russian)", ruDescription: "Description (Russian)", enName: "Name (English)", enDescription: "Description (English)",
    reviewNote: "A new product goes on sale after a Tecsecure staff check.",
    reReviewNote: "Changing text, photos or specifications sends the product back to review and hides it until approved. Price and stock change at once.",
    submitNew: "Send for review", submitEdit: "Save", saved: "Saved", sentToReview: "Sent for review", required: "Fill in the required fields: photo, name, category, price and description."
  },
  balance: {
    title: "Balance", available: "Available to withdraw", pending: "On the way", pendingHint: "From accepted orders not yet delivered, not yet paid, or still within the hold.",
    commission: "Commission", referral: "Through QR", history: "History", noHistory: "No movements yet.",
    kinds: { SALE: "Sale", PROMOTION: "Advertising", PAYOUT: "Payout", PAYOUT_RETURNED: "Returned", ADJUSTMENT: "Adjustment" },
    payout: "Withdraw", payoutHint: "Money goes to the shop's bank account. The amount is held from the balance until reviewed.",
    amount: "Amount (so‘m)", all: "All", request: "Send request", requested: "Request sent",
    payouts: "Requests", payoutStatus: { REQUESTED: "In review", PAID: "Paid", REJECTED: "Returned" },
    details: "Bank details", detailsHint: "Only the shop's business bank account. Card numbers are not accepted.",
    bank: "Bank", account: "Account (20 digits)", mfo: "MFO (5 digits)", recipient: "Recipient (business name)", saveDetails: "Save bank details", needDetails: "Enter bank details first."
  },
  profile: {
    title: "Shop settings", notify: "Telegram messages", notifyHint: "About new orders, payments and stock.", info: "Shop details",
    storefront: "Shop page", qr: "Download QR code", card: "Print visit card", logout: "Sign out", status: "Status", web: "Open in browser"
  },
  apply: { title: "Open a shop", hint: "Fill in the application. Our staff will check it and reply through this bot.", staff: "This is a staff account. The shop cabinet opens with a customer account." }
};

export const sellerAppCopy: Record<Locale, SellerAppCopy> = { uz, ru, en };
export type { SellerAppCopy };
