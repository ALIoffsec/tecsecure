type Copy = {
  newRequest: string; waiting: string; active: string; done: (n: number) => string; empty: string; emptyHint: string;
  quoteCame: string; invoiceDue: string; viewQuote: string; openInvoice: string; changed: (date: string) => string; open: (title: string) => string;
  askPrice: string; askPriceHint: string; priceRequest: string;
  stages: Record<"sent" | "review" | "quote" | "work" | "done", string>; projectStages: Record<"asked" | "quote" | "work" | "done", string>;
  track: string; done_: string; nextTitle: string; next: Record<string, string>; nextQuote: string; nextInvoice: string; nextFallback: string;
  quoteTitle: (number: string) => string; line: string; qty: string; total: string; includes: string; excludes: string; validUntil: string; expired: string;
  accept: string; changes: string; reject: string; askRenewal: string;
  acceptTitle: string; acceptText: string; acceptSend: string; changesTitle: string; changesHint: string; rejectTitle: string; rejectHint: string; send: string; close: string; sending: string;
  reasonShort: string; failed: string; sentChanges: string; sentReject: string; sentAccept: string;
  invoiceTitle: string; invoiceName: string; paid: string; checking: string; left: string; due: string;
  yourRequest: string; description: string; place: string; history: string; event: string; oldQuotes: string;
  cancelRequest: string; cancelText: string; cancelSend: string; cancelled: string; rejected: string;
  requisites: string; seller: string; tin: string; bank: string; account: string; mfo: string; address: string; purpose: (number: string) => string; noRequisites: string;
  copy: string; copied: string; print: string; reportPayment: string; amount: string; method: string; bankTransfer: string; cash: string; other: string; reference: string; referenceHint: string; reportSend: string; reportSent: string; payments: string;
  invoicePaid: string; invoiceVoid: string; amountBad: string; referenceShort: string; paymentStatus: Record<string, string>;
};

const uz: Copy = {
  newRequest: "Yangi ariza", waiting: "Sizdan javob kutilmoqda", active: "Jarayonda", done: n => `Yakunlangan (${n})`,
  empty: "Hali ariza yo‘q.", emptyHint: "Xizmat kerak bo‘lsa, ariza qoldiring: xodim siz bilan bog‘lanadi.",
  quoteCame: "Narx taklifi keldi", invoiceDue: "To‘lov uchun hisob", viewQuote: "Taklifni ko‘rish", openInvoice: "Hisobni ochish",
  changed: date => `oxirgi o‘zgarish: ${date}`, open: title => `${title} arizasi`,
  askPrice: "Uskunalar uchun narx so‘rash", askPriceHint: "Bir nechta mahsulot yoki xizmat uchun narx taklifi kerak bo‘lsa.", priceRequest: "Narx so‘rovi",
  stages: { sent: "Ariza yuborildi", review: "Ko‘rib chiqilmoqda", quote: "Narx taklifi", work: "Ish bajarilmoqda", done: "Yakunlandi" },
  projectStages: { asked: "Narx so‘rovi", quote: "Narx taklifi", work: "Ish bajarilmoqda", done: "Yakunlandi" },
  track: "Ariza bosqichlari", done_: "bajarildi", nextTitle: "Keyingi qadam",
  next: {
    NEW: "Arizangiz qabul qilindi. Xodim siz bilan bog‘lanadi.", UNDER_REVIEW: "Arizangizni ko‘rib chiqyapmiz.", CONTACTED: "Xodim siz bilan bog‘landi.",
    INSPECTION_REQUIRED: "Obyektni ko‘rish kerak. Vaqtni xodim bilan kelishing.", QUOTATION_SENT: "Narx taklifi bo‘yicha xodim bilan gaplashing.",
    APPROVED: "Ish tasdiqlandi. Xodim boshlash vaqtini aytadi.", IN_PROGRESS: "Ish bajarilmoqda.", COMPLETED: "Ish yakunlandi.",
    REJECTED: "Ariza rad etildi.", CANCELLED: "Ariza bekor qilindi."
  },
  nextQuote: "Narx taklifini ko‘rib chiqing va javob bering.", nextInvoice: "To‘lov uchun hisob tayyor. To‘lab, to‘lovni bildiring.", nextFallback: "Xodim siz bilan bog‘lanadi.",
  quoteTitle: number => `Narx taklifi ${number}`, line: "Nomi", qty: "Soni", total: "Jami", includes: "Narxga kiradi", excludes: "Narxga kirmaydi", validUntil: "Amal qilish muddati", expired: "Muddati tugagan",
  accept: "Qabul qilish", changes: "O‘zgartirish so‘rash", reject: "Rad etish", askRenewal: "Yangilashni so‘rash",
  acceptTitle: "Taklifni qabul qilish", acceptText: "Taklif qabul qilinadi. Xodim keyingi qadam haqida xabar beradi.", acceptSend: "Qabul qilish",
  changesTitle: "O‘zgartirish so‘rash", changesHint: "Nimani o‘zgartirish kerak?", rejectTitle: "Taklifni rad etish", rejectHint: "Rad etish sababi", send: "Yuborish", close: "Yopish", sending: "Yuborilmoqda…",
  reasonShort: "Kamida 3 belgi yozing.", failed: "Yuborilmadi. Qayta urinib ko‘ring.", sentChanges: "So‘rovingiz xodimga yuborildi.", sentReject: "Taklif rad etildi.", sentAccept: "Taklif qabul qilindi.",
  invoiceTitle: "To‘lov uchun hisob", invoiceName: "To‘lov uchun hisob", paid: "To‘landi", checking: "Tekshirilmoqda", left: "Qoldi", due: "To‘lash muddati",
  yourRequest: "Sizning so‘rovingiz", description: "Tavsif", place: "Manzil", history: "Tarix", event: "Hodisa", oldQuotes: "Oldingi takliflar",
  cancelRequest: "Arizani bekor qilish", cancelText: "Ariza bekor qilinadi va xodimga xabar boradi.", cancelSend: "Bekor qilish", cancelled: "Ariza bekor qilindi.", rejected: "Ariza rad etildi.",
  requisites: "To‘lov rekvizitlari", seller: "Qabul qiluvchi", tin: "STIR", bank: "Bank", account: "Hisob raqami", mfo: "MFO", address: "Manzil", purpose: number => `To‘lov maqsadi: ${number} hisob bo‘yicha to‘lov`,
  noRequisites: "Rekvizitlar hali kiritilmagan. Xodimdan so‘rang.",
  copy: "Nusxa olish", copied: "Nusxa olindi", print: "Chop etish", reportPayment: "To‘lovni bildirish", amount: "Summa (so‘m)", method: "Usul", bankTransfer: "Bank o‘tkazmasi", cash: "Naqd", other: "Boshqa",
  reference: "To‘lov hujjati raqami", referenceHint: "Naqd to‘lovda raqamni tizim o‘zi beradi.", reportSend: "Tekshiruvga yuborish", reportSent: "To‘lov tekshiruvga yuborildi.", payments: "Bildirilgan to‘lovlar",
  amountBad: "Summani raqam bilan yozing; u qolgan summadan oshmasin.", referenceShort: "Hujjat raqamini kamida 2 belgida yozing.",
  invoicePaid: "Hisob to‘langan.", invoiceVoid: "Hisob bekor qilingan. Bu hisob bo‘yicha to‘lamang.",
  paymentStatus: { PENDING: "Tekshirilmoqda", VERIFIED: "Tasdiqlandi", REJECTED: "Rad etildi", REFUNDED: "Qaytarildi" }
};

const ru: Copy = {
  newRequest: "Новая заявка", waiting: "Ждёт вашего ответа", active: "В работе", done: n => `Завершённые (${n})`,
  empty: "Заявок пока нет.", emptyHint: "Если нужна услуга, оставьте заявку: сотрудник свяжется с вами.",
  quoteCame: "Пришло предложение", invoiceDue: "Счёт на оплату", viewQuote: "Открыть предложение", openInvoice: "Открыть счёт",
  changed: date => `последнее изменение: ${date}`, open: title => `заявка ${title}`,
  askPrice: "Запросить цену на оборудование", askPriceHint: "Если нужно предложение на несколько товаров или услуг.", priceRequest: "Запрос цены",
  stages: { sent: "Заявка отправлена", review: "На рассмотрении", quote: "Предложение", work: "Работа выполняется", done: "Завершено" },
  projectStages: { asked: "Запрос цены", quote: "Предложение", work: "Работа выполняется", done: "Завершено" },
  track: "Этапы заявки", done_: "выполнено", nextTitle: "Следующий шаг",
  next: {
    NEW: "Заявка принята. Сотрудник свяжется с вами.", UNDER_REVIEW: "Рассматриваем вашу заявку.", CONTACTED: "Сотрудник связался с вами.",
    INSPECTION_REQUIRED: "Нужен осмотр объекта. Согласуйте время с сотрудником.", QUOTATION_SENT: "Обсудите предложение с сотрудником.",
    APPROVED: "Работа согласована. Сотрудник сообщит время начала.", IN_PROGRESS: "Работа выполняется.", COMPLETED: "Работа завершена.",
    REJECTED: "Заявка отклонена.", CANCELLED: "Заявка отменена."
  },
  nextQuote: "Посмотрите предложение и ответьте.", nextInvoice: "Счёт готов. Оплатите и сообщите об оплате.", nextFallback: "Сотрудник свяжется с вами.",
  quoteTitle: number => `Предложение ${number}`, line: "Наименование", qty: "Кол-во", total: "Итого", includes: "Входит в цену", excludes: "Не входит в цену", validUntil: "Действует до", expired: "Срок истёк",
  accept: "Принять", changes: "Попросить изменить", reject: "Отклонить", askRenewal: "Попросить обновить",
  acceptTitle: "Принять предложение", acceptText: "Предложение будет принято. Сотрудник сообщит о следующем шаге.", acceptSend: "Принять",
  changesTitle: "Попросить изменить", changesHint: "Что нужно изменить?", rejectTitle: "Отклонить предложение", rejectHint: "Причина отказа", send: "Отправить", close: "Закрыть", sending: "Отправляется…",
  reasonShort: "Напишите хотя бы 3 символа.", failed: "Не отправлено. Попробуйте ещё раз.", sentChanges: "Просьба отправлена сотруднику.", sentReject: "Предложение отклонено.", sentAccept: "Предложение принято.",
  invoiceTitle: "Счёт на оплату", invoiceName: "Счёт на оплату", paid: "Оплачено", checking: "Проверяется", left: "Осталось", due: "Срок оплаты",
  yourRequest: "Ваш запрос", description: "Описание", place: "Адрес", history: "История", event: "Событие", oldQuotes: "Прежние предложения",
  cancelRequest: "Отменить заявку", cancelText: "Заявка будет отменена, сотрудник получит уведомление.", cancelSend: "Отменить", cancelled: "Заявка отменена.", rejected: "Заявка отклонена.",
  requisites: "Реквизиты для оплаты", seller: "Получатель", tin: "ИНН", bank: "Банк", account: "Расчётный счёт", mfo: "МФО", address: "Адрес", purpose: number => `Назначение платежа: оплата по счёту ${number}`,
  noRequisites: "Реквизиты ещё не заполнены. Спросите сотрудника.",
  copy: "Копировать", copied: "Скопировано", print: "Печать", reportPayment: "Сообщить об оплате", amount: "Сумма (сум)", method: "Способ", bankTransfer: "Банковский перевод", cash: "Наличные", other: "Другое",
  reference: "Номер платёжного документа", referenceHint: "При оплате наличными номер присвоит система.", reportSend: "Отправить на проверку", reportSent: "Оплата отправлена на проверку.", payments: "Сообщённые оплаты",
  amountBad: "Укажите сумму цифрами; она не должна превышать остаток.", referenceShort: "Номер документа: не меньше 2 символов.",
  invoicePaid: "Счёт оплачен.", invoiceVoid: "Счёт отменён. Не оплачивайте его.",
  paymentStatus: { PENDING: "Проверяется", VERIFIED: "Подтверждено", REJECTED: "Отклонено", REFUNDED: "Возвращено" }
};

const en: Copy = {
  newRequest: "New request", waiting: "Waiting for your answer", active: "In progress", done: n => `Finished (${n})`,
  empty: "No requests yet.", emptyHint: "Need a service? Leave a request and our staff will contact you.",
  quoteCame: "A quote arrived", invoiceDue: "Payment invoice", viewQuote: "View quote", openInvoice: "Open invoice",
  changed: date => `last change: ${date}`, open: title => `request ${title}`,
  askPrice: "Ask for an equipment price", askPriceHint: "When you need one quote for several products or services.", priceRequest: "Price request",
  stages: { sent: "Request sent", review: "Under review", quote: "Quote", work: "Work in progress", done: "Done" },
  projectStages: { asked: "Price request", quote: "Quote", work: "Work in progress", done: "Done" },
  track: "Request progress", done_: "done", nextTitle: "Next step",
  next: {
    NEW: "We got your request. Our staff will contact you.", UNDER_REVIEW: "We are reviewing your request.", CONTACTED: "Our staff contacted you.",
    INSPECTION_REQUIRED: "The site needs a visit. Agree on a time with our staff.", QUOTATION_SENT: "Talk the quote over with our staff.",
    APPROVED: "The work is agreed. Staff will tell you when it starts.", IN_PROGRESS: "The work is in progress.", COMPLETED: "The work is done.",
    REJECTED: "The request was declined.", CANCELLED: "The request was cancelled."
  },
  nextQuote: "Look at the quote and answer it.", nextInvoice: "The invoice is ready. Pay it and report the payment.", nextFallback: "Our staff will contact you.",
  quoteTitle: number => `Quote ${number}`, line: "Item", qty: "Qty", total: "Total", includes: "Included", excludes: "Not included", validUntil: "Valid until", expired: "Expired",
  accept: "Accept", changes: "Ask for changes", reject: "Decline", askRenewal: "Ask to renew",
  acceptTitle: "Accept the quote", acceptText: "The quote will be accepted. Staff will tell you the next step.", acceptSend: "Accept",
  changesTitle: "Ask for changes", changesHint: "What should change?", rejectTitle: "Decline the quote", rejectHint: "Reason", send: "Send", close: "Close", sending: "Sending…",
  reasonShort: "Write at least 3 characters.", failed: "Not sent. Please try again.", sentChanges: "Your request went to our staff.", sentReject: "Quote declined.", sentAccept: "Quote accepted.",
  invoiceTitle: "Payment invoice", invoiceName: "Payment invoice", paid: "Paid", checking: "Being checked", left: "Left to pay", due: "Due date",
  yourRequest: "Your request", description: "Description", place: "Address", history: "History", event: "Event", oldQuotes: "Earlier quotes",
  cancelRequest: "Cancel request", cancelText: "The request will be cancelled and staff notified.", cancelSend: "Cancel request", cancelled: "Request cancelled.", rejected: "Request declined.",
  requisites: "Payment details", seller: "Payee", tin: "Tax ID", bank: "Bank", account: "Account number", mfo: "MFO", address: "Address", purpose: number => `Payment purpose: payment for invoice ${number}`,
  noRequisites: "Payment details are not filled in yet. Ask our staff.",
  copy: "Copy", copied: "Copied", print: "Print", reportPayment: "Report a payment", amount: "Amount (UZS)", method: "Method", bankTransfer: "Bank transfer", cash: "Cash", other: "Other",
  reference: "Payment document number", referenceHint: "For cash the system gives the number.", reportSend: "Send for review", reportSent: "Payment sent for review.", payments: "Reported payments",
  amountBad: "Enter the amount in digits; it must not exceed what is left.", referenceShort: "The document number needs at least 2 characters.",
  invoicePaid: "The invoice is paid.", invoiceVoid: "The invoice was cancelled. Do not pay it.",
  paymentStatus: { PENDING: "Being checked", VERIFIED: "Confirmed", REJECTED: "Rejected", REFUNDED: "Refunded" }
};

export const customerRequestsCopy = { uz, ru, en };
