import type { Locale } from "./messages";

const uz = {
  title: "Do‘kon kabineti",
  introTitle: "Tecsecure’da o‘z do‘koningiz bilan soting",
  intro: "Mahsulot va narxni o‘zingiz kiritasiz, buyurtmani o‘zingiz jo‘natasiz. Mijoz puli Tecsecure orqali o‘tadi va yetkazilgandan keyin balansingizga yoziladi.",
  points: [
    "Komissiya: sotuvdan 15%. Mijozni o‘z QR kodingiz orqali olib kelsangiz, 10%.",
    "Har bir mahsulot kartasi bir xil sifatda: rasm va tavsif qoidalari bor, admin tekshiradi.",
    "Vizit karta va QR: mijoz skanerlaydi va do‘koningiz mahsulotlarini ko‘radi.",
    "Yangi buyurtmalar Telegram botga keladi."
  ],
  apply: "Ariza yuborish", applying: "Yuborilmoqda…", save: "Saqlash", saving: "Saqlanmoqda…", saved: "Saqlandi.",
  form: {
    name: "Do‘kon nomi", phone: "Telefon", telegram: "Telegram (@username)", instagram: "Instagram (@username)",
    region: "Viloyat", city: "Shahar yoki tuman", address: "Do‘kon manzili", description: "Do‘kon haqida qisqacha",
    legalName: "Yuridik shaxs yoki YaTT nomi", tin: "STIR (9 raqam) yoki JShShIR (14 raqam)", chooseRegion: "Viloyatni tanlang",
    legalHint: "Sotuvchi sifatida rasmiy ro‘yxatdan o‘tgan bo‘lishingiz kerak: chek va kafolat siz tomondan beriladi."
  },
  status: {
    PENDING: { title: "Ariza ko‘rib chiqilmoqda", text: "Odatda bir ish kuni ichida javob beramiz. Natija shu yerda va Telegram botda ko‘rinadi." },
    ACTIVE: { title: "Do‘kon faol", text: "Mahsulot qo‘shishingiz va buyurtmalarni qabul qilishingiz mumkin." },
    SUSPENDED: { title: "Do‘kon vaqtincha to‘xtatilgan", text: "Mahsulotlaringiz saytda ko‘rinmaydi. Savollar bo‘lsa, admin bilan bog‘laning." },
    REJECTED: { title: "Ariza rad etildi", text: "Sababini o‘qing, ma’lumotlarni tuzating va qayta yuboring." }
  } as Record<string, { title: string; text: string }>,
  reason: "Sabab", resubmit: "Tuzatib qayta yuborish",
  balance: "Balans", balanceHint: "Yetkazilgan buyurtmalar uchun sizga to‘lanadigan summa.",
  commission: "Komissiya", referral: "O‘z QR kodingiz orqali", link: "Do‘kon havolasi",
  profile: "Do‘kon ma’lumotlari",
  staffAccount: "Xodim hisobi bilan do‘kon ochib bo‘lmaydi. Mijoz hisobi bilan kiring.",
  failed: "Saqlab bo‘lmadi. Maydonlarni tekshiring.",
  admin: {
    title: "Do‘konlar", all: "Hammasi", empty: "Bu holatda do‘kon yo‘q.", owner: "Egasi", legal: "Yuridik shaxs", applied: "Ariza",
    approve: "Tasdiqlash", reject: "Rad etish", suspend: "To‘xtatish", reactivate: "Qayta yoqish", saveCommission: "Komissiyani saqlash",
    note: "Sabab (do‘konchiga ko‘rinadi)", noteNeeded: "Rad etish uchun sababini yozing.", done: "Saqlandi.",
    commission: "Komissiya, %", referral: "QR orqali, %"
  }
};

export const sellerCopy: Record<Locale, typeof uz> = {
  uz,
  ru: {
    title: "Кабинет магазина",
    introTitle: "Продавайте на Tecsecure под именем своего магазина",
    intro: "Товары и цены вы указываете сами и сами отправляете заказы. Деньги покупателя проходят через Tecsecure и после доставки зачисляются на ваш баланс.",
    points: [
      "Комиссия: 15% с продажи. Если покупатель пришёл по вашему QR-коду, 10%.",
      "Карточки товаров одинакового качества: есть правила для фото и описания, администратор проверяет.",
      "Визитка и QR: покупатель сканирует и видит товары вашего магазина.",
      "Новые заказы приходят в Telegram-бот."
    ],
    apply: "Отправить заявку", applying: "Отправка…", save: "Сохранить", saving: "Сохранение…", saved: "Сохранено.",
    form: {
      name: "Название магазина", phone: "Телефон", telegram: "Telegram (@username)", instagram: "Instagram (@username)",
      region: "Область", city: "Город или район", address: "Адрес магазина", description: "Коротко о магазине",
      legalName: "Название юрлица или ИП", tin: "ИНН (9 цифр) или ПИНФЛ (14 цифр)", chooseRegion: "Выберите область",
      legalHint: "Продавец должен быть официально зарегистрирован: чек и гарантию выдаёте вы."
    },
    status: {
      PENDING: { title: "Заявка на рассмотрении", text: "Обычно отвечаем в течение рабочего дня. Результат появится здесь и в Telegram-боте." },
      ACTIVE: { title: "Магазин активен", text: "Можно добавлять товары и принимать заказы." },
      SUSPENDED: { title: "Магазин временно приостановлен", text: "Ваши товары не видны на сайте. По вопросам свяжитесь с администратором." },
      REJECTED: { title: "Заявка отклонена", text: "Прочитайте причину, исправьте данные и отправьте снова." }
    },
    reason: "Причина", resubmit: "Исправить и отправить снова",
    balance: "Баланс", balanceHint: "Сумма к выплате за доставленные заказы.",
    commission: "Комиссия", referral: "По вашему QR-коду", link: "Ссылка на магазин",
    profile: "Данные магазина",
    staffAccount: "С аккаунта сотрудника нельзя открыть магазин. Войдите как клиент.",
    failed: "Не удалось сохранить. Проверьте поля.",
    admin: {
      title: "Магазины", all: "Все", empty: "Магазинов с таким статусом нет.", owner: "Владелец", legal: "Юрлицо", applied: "Заявка",
      approve: "Одобрить", reject: "Отклонить", suspend: "Приостановить", reactivate: "Включить снова", saveCommission: "Сохранить комиссию",
      note: "Причина (увидит продавец)", noteNeeded: "Укажите причину отказа.", done: "Сохранено.",
      commission: "Комиссия, %", referral: "По QR, %"
    }
  },
  en: {
    title: "Shop cabinet",
    introTitle: "Sell on Tecsecure under your own shop's name",
    intro: "You set your products and prices and ship the orders yourself. The customer pays through Tecsecure, and after delivery the money is added to your balance.",
    points: [
      "Commission: 15% of the sale, or 10% when the customer came through your own QR code.",
      "Every product card has the same quality: photo and description rules, checked by staff.",
      "Visit card and QR: customers scan it and see your shop's products.",
      "New orders arrive in the Telegram bot."
    ],
    apply: "Send application", applying: "Sending…", save: "Save", saving: "Saving…", saved: "Saved.",
    form: {
      name: "Shop name", phone: "Phone", telegram: "Telegram (@username)", instagram: "Instagram (@username)",
      region: "Region", city: "City or district", address: "Shop address", description: "About the shop, briefly",
      legalName: "Company or sole trader name", tin: "Tax ID (9 digits) or PINFL (14 digits)", chooseRegion: "Choose a region",
      legalHint: "Sellers must be officially registered: you issue the receipt and the warranty."
    },
    status: {
      PENDING: { title: "Application under review", text: "We usually answer within one working day. The result appears here and in the Telegram bot." },
      ACTIVE: { title: "Shop is active", text: "You can add products and take orders." },
      SUSPENDED: { title: "Shop is suspended", text: "Your products are hidden from the site. Contact staff with any questions." },
      REJECTED: { title: "Application rejected", text: "Read the reason, correct the details and send it again." }
    },
    reason: "Reason", resubmit: "Correct and send again",
    balance: "Balance", balanceHint: "What you are owed for delivered orders.",
    commission: "Commission", referral: "Through your QR code", link: "Shop link",
    profile: "Shop details",
    staffAccount: "A staff account cannot open a shop. Sign in with a customer account.",
    failed: "Could not save. Check the fields.",
    admin: {
      title: "Shops", all: "All", empty: "No shops with this status.", owner: "Owner", legal: "Legal entity", applied: "Applied",
      approve: "Approve", reject: "Reject", suspend: "Suspend", reactivate: "Reactivate", saveCommission: "Save commission",
      note: "Reason (the seller sees it)", noteNeeded: "Write the reason for rejecting.", done: "Saved.",
      commission: "Commission, %", referral: "Through QR, %"
    }
  }
};
