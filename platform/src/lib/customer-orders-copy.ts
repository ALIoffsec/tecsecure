import type { NextStep, OrderFilter } from "./customer-orders";

type Copy = {
  filters: Record<OrderFilter, string>; filtersLabel: string; more: (n: number) => string; showMore: string;
  emptyAll: string; emptyFilter: string; browse: string;
  next: Record<NextStep, string>; nextTitle: string;
  pay: string; invoice: string; reupload: string; details: (reference: string) => string;
  order: (reference: string) => string; track: string; done: string;
  products: string; tecsecure: string; seller: string; sellerNote: string;
  sums: string; items: string; delivery: string; total: string; vat: string; pending: string;
  payment: string; method: string; paymentState: string;
  shipping: string; recipient: string; phone: string; address: string; map: string;
  history: string; historyEvent: string; cancelRequested: string; disputeOpen: string; disputeReleased: string; disputeRefunded: string;
  reorder: string; reorderMissing: (names: string) => string; reorderNone: string;
  cancel: string; cancelAsk: string; cancelConfirm: string; cancelAskConfirm: string; cancelReason: string; cancelSend: string; cancelAskSend: string; close: string; sending: string;
  problem: string; problemTitle: string; problemHint: string; problemSend: string; problemSent: string; tooShort: string; failed: string;
  checkingPayme: string; paymeNotYet: string; refresh: string;
  cancelled: string; cancelledReason: (reason: string) => string;
  capped: string; youCancelled: string; errors: Record<"TOO_LATE" | "NOT_ALLOWED" | "SHOP_PART", string>;
};

export const customerOrdersCopy: Record<"uz" | "ru" | "en", Copy> = {
  uz: {
    filters: { all: "Hammasi", active: "Faol", delivered: "Yetkazilgan", cancelled: "Bekor qilingan" }, filtersLabel: "Buyurtmalarni saralash",
    more: n => `yana ${n} ta`, showMore: "Yana ko‘rsatish",
    emptyAll: "Hali buyurtma yo‘q.", emptyFilter: "Bu bo‘limda buyurtma yo‘q.", browse: "Uskunalarni ko‘rish",
    next: {
      payPayme: "To‘lovni Payme orqali yakunlang.", payBank: "Hisob bo‘yicha bank orqali to‘lang.", reupload: "Chek qabul qilinmadi. Yangi chek yuklang.",
      checking: "To‘lovingizni tekshiryapmiz.", refundDue: "Pulingiz qaytariladi. Xodimimiz bog‘lanadi.", refunded: "Pul qaytarildi.",
      cancelRequested: "Bekor qilish so‘raldi. Xodim javob beradi.", received: "Buyurtma qabul qilindi. Xodim tasdiqlaydi.",
      preparing: "Buyurtmangiz tayyorlanmoqda.", onTheWay: "Buyurtmangiz yo‘lda.", delivered: "Buyurtma yetkazildi.", cancelled: "Buyurtma bekor qilindi."
    },
    nextTitle: "Keyingi qadam",
    pay: "To‘lash", invoice: "Hisobni ochish", reupload: "Chekni qayta yuklash", details: reference => `${reference} buyurtmasi`,
    order: reference => `Buyurtma ${reference}`, track: "Buyurtma bosqichlari", done: "bajarildi",
    products: "Mahsulotlar", tecsecure: "Tecsecure", seller: "Sotuvchi", sellerNote: "Sotuvchi izohi",
    sums: "Summa", items: "Mahsulotlar", delivery: "Yetkazish", total: "Jami", vat: "QQS ichida", pending: "Summa kelishiladi",
    payment: "To‘lov", method: "Usul", paymentState: "Holat",
    shipping: "Yetkazish", recipient: "Qabul qiluvchi", phone: "Telefon", address: "Manzil", map: "Xaritada ko‘rish",
    history: "Tarix", historyEvent: "Hodisa", cancelRequested: "Bekor qilish so‘raldi",
    disputeOpen: "Murojaat ko‘rib chiqilmoqda; hal bo‘lguncha sotuvchiga pul o‘tkazilmaydi.", disputeReleased: "Murojaat ko‘rib chiqildi.", disputeRefunded: "Murojaat siz foydasiga hal qilindi.",
    reorder: "Qayta buyurtma berish", reorderMissing: names => `Hozir sotuvda yo‘q: ${names}.`, reorderNone: "Bu mahsulotlar hozir sotuvda yo‘q.",
    cancel: "Buyurtmani bekor qilish", cancelAsk: "Bekor qilishni so‘rash",
    cancelConfirm: "Buyurtma bekor qilinadi. To‘langan bo‘lsa, pul qaytariladi.", cancelAskConfirm: "Xodimga bekor qilish so‘rovi yuboriladi. Buyurtma u javob bergunicha o‘zgarmaydi.",
    cancelReason: "Sabab (ixtiyoriy)", cancelSend: "Bekor qilish", cancelAskSend: "So‘rov yuborish", close: "Yopish", sending: "Yuborilmoqda…",
    problem: "Muammo bor", problemTitle: "Buyurtma bo‘yicha muammo", problemHint: "Nima bo‘ldi? Masalan: kelmadi, boshqa mahsulot keldi, singan.", problemSend: "Yuborish",
    problemSent: "Murojaatingiz qabul qilindi. Xodimimiz bog‘lanadi.", tooShort: "Kamida 5 belgi yozing.", failed: "Yuborilmadi. Qayta urinib ko‘ring.",
    checkingPayme: "To‘lov tekshirilmoqda…", paymeNotYet: "To‘lov hali tasdiqlanmadi. Biroz kutib yangilang.", refresh: "Yangilash",
    cancelled: "Buyurtma bekor qilindi", cancelledReason: reason => `Sabab: ${reason}`,
    capped: "Ro‘yxatda oxirgi 200 ta buyurtma. Eskilari uchun boshqa filtrni tanlang yoki bizga yozing.", youCancelled: "Buyurtmani o‘zingiz bekor qildingiz.",
    errors: { TOO_LATE: "Buyurtma allaqachon ko‘rib chiqilmoqda. “Bekor qilishni so‘rash” orqali yozing.", NOT_ALLOWED: "Bu buyurtmani hozir bekor qilishni so‘rab bo‘lmaydi.", SHOP_PART: "Do‘kon jo‘natmasi bo‘yicha muammoni o‘sha jo‘natma ostida yozing." }
  },
  ru: {
    filters: { all: "Все", active: "Активные", delivered: "Доставленные", cancelled: "Отменённые" }, filtersLabel: "Фильтр заказов",
    more: n => `ещё ${n}`, showMore: "Показать ещё",
    emptyAll: "Заказов пока нет.", emptyFilter: "В этом разделе заказов нет.", browse: "Смотреть оборудование",
    next: {
      payPayme: "Завершите оплату через Payme.", payBank: "Оплатите счёт банковским переводом.", reupload: "Чек не принят. Загрузите новый.",
      checking: "Проверяем вашу оплату.", refundDue: "Деньги вернут. С вами свяжется сотрудник.", refunded: "Деньги возвращены.",
      cancelRequested: "Запрошена отмена. Сотрудник ответит.", received: "Заказ принят. Сотрудник подтвердит.",
      preparing: "Заказ готовится.", onTheWay: "Заказ в пути.", delivered: "Заказ доставлен.", cancelled: "Заказ отменён."
    },
    nextTitle: "Следующий шаг",
    pay: "Оплатить", invoice: "Открыть счёт", reupload: "Загрузить чек заново", details: reference => `заказ ${reference}`,
    order: reference => `Заказ ${reference}`, track: "Этапы заказа", done: "выполнено",
    products: "Товары", tecsecure: "Tecsecure", seller: "Продавец", sellerNote: "Комментарий продавца",
    sums: "Сумма", items: "Товары", delivery: "Доставка", total: "Итого", vat: "в т.ч. НДС", pending: "Сумма согласуется",
    payment: "Оплата", method: "Способ", paymentState: "Статус",
    shipping: "Доставка", recipient: "Получатель", phone: "Телефон", address: "Адрес", map: "Открыть на карте",
    history: "История", historyEvent: "Событие", cancelRequested: "Запрошена отмена",
    disputeOpen: "Обращение рассматривается; пока вопрос не решён, продавец денег не получит.", disputeReleased: "Обращение рассмотрено.", disputeRefunded: "Обращение решено в вашу пользу.",
    reorder: "Заказать снова", reorderMissing: names => `Сейчас нет в продаже: ${names}.`, reorderNone: "Этих товаров сейчас нет в продаже.",
    cancel: "Отменить заказ", cancelAsk: "Попросить отмену",
    cancelConfirm: "Заказ будет отменён. Если он оплачен, деньги вернутся.", cancelAskConfirm: "Сотруднику уйдёт просьба об отмене. До его ответа заказ не изменится.",
    cancelReason: "Причина (необязательно)", cancelSend: "Отменить", cancelAskSend: "Отправить просьбу", close: "Закрыть", sending: "Отправляется…",
    problem: "Есть проблема", problemTitle: "Проблема с заказом", problemHint: "Что случилось? Например: не пришло, пришёл другой товар, сломано.", problemSend: "Отправить",
    problemSent: "Обращение принято. Сотрудник свяжется с вами.", tooShort: "Напишите хотя бы 5 символов.", failed: "Не отправлено. Попробуйте ещё раз.",
    checkingPayme: "Проверяем оплату…", paymeNotYet: "Оплата ещё не подтверждена. Подождите и обновите.", refresh: "Обновить",
    cancelled: "Заказ отменён", cancelledReason: reason => `Причина: ${reason}`,
    capped: "В списке последние 200 заказов. Для более старых выберите другой фильтр или напишите нам.", youCancelled: "Вы отменили заказ сами.",
    errors: { TOO_LATE: "Заказ уже рассматривается. Напишите через «Попросить отмену».", NOT_ALLOWED: "Сейчас нельзя попросить отмену этого заказа.", SHOP_PART: "О проблеме с отправлением магазина напишите под этим отправлением." }
  },
  en: {
    filters: { all: "All", active: "Active", delivered: "Delivered", cancelled: "Cancelled" }, filtersLabel: "Filter orders",
    more: n => `${n} more`, showMore: "Show more",
    emptyAll: "No orders yet.", emptyFilter: "No orders here.", browse: "Browse equipment",
    next: {
      payPayme: "Finish paying with Payme.", payBank: "Pay the invoice by bank transfer.", reupload: "The receipt was not accepted. Upload a new one.",
      checking: "We are checking your payment.", refundDue: "Your money will be returned. Our staff will contact you.", refunded: "Money returned.",
      cancelRequested: "Cancellation requested. Staff will reply.", received: "Order received. Staff will confirm it.",
      preparing: "Your order is being prepared.", onTheWay: "Your order is on the way.", delivered: "Order delivered.", cancelled: "Order cancelled."
    },
    nextTitle: "Next step",
    pay: "Pay", invoice: "Open invoice", reupload: "Upload the receipt again", details: reference => `order ${reference}`,
    order: reference => `Order ${reference}`, track: "Order progress", done: "done",
    products: "Products", tecsecure: "Tecsecure", seller: "Seller", sellerNote: "Seller's note",
    sums: "Amount", items: "Products", delivery: "Delivery", total: "Total", vat: "VAT included", pending: "Amount to be agreed",
    payment: "Payment", method: "Method", paymentState: "Status",
    shipping: "Delivery", recipient: "Recipient", phone: "Phone", address: "Address", map: "Show on map",
    history: "History", historyEvent: "Event", cancelRequested: "Cancellation requested",
    disputeOpen: "Report under review; the seller is not paid until it is settled.", disputeReleased: "Report reviewed.", disputeRefunded: "The report was settled in your favour.",
    reorder: "Order again", reorderMissing: names => `Not on sale now: ${names}.`, reorderNone: "These products are not on sale now.",
    cancel: "Cancel order", cancelAsk: "Ask to cancel",
    cancelConfirm: "The order will be cancelled. If it was paid, the money is returned.", cancelAskConfirm: "Staff get a request to cancel. The order stays as it is until they reply.",
    cancelReason: "Reason (optional)", cancelSend: "Cancel order", cancelAskSend: "Send request", close: "Close", sending: "Sending…",
    problem: "Report a problem", problemTitle: "A problem with the order", problemHint: "What happened? For example: it did not arrive, wrong item, broken.", problemSend: "Send",
    problemSent: "We got your report. Our staff will contact you.", tooShort: "Write at least 5 characters.", failed: "Not sent. Please try again.",
    checkingPayme: "Checking the payment…", paymeNotYet: "The payment is not confirmed yet. Wait a little and refresh.", refresh: "Refresh",
    cancelled: "Order cancelled", cancelledReason: reason => `Reason: ${reason}`,
    capped: "The list shows the last 200 orders. For older ones pick another filter or write to us.", youCancelled: "You cancelled the order yourself.",
    errors: { TOO_LATE: "The order is already being handled. Use “Ask to cancel”.", NOT_ALLOWED: "This order cannot be asked to cancel now.", SHOP_PART: "Report a problem with a shop's parcel under that parcel." }
  }
};
