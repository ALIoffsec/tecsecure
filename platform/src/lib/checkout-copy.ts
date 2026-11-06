import type { Locale } from "./messages";

const uz = {
  steps: ["Savat", "Yetkazish", "To‘lov"], stepsLabel: "Buyurtma bosqichlari",
  accepted: "Buyurtma qabul qilindi", reference: "Buyurtma raqami",
  next: {
    CASH: "Tez orada aloqaga chiqamiz. To‘lovni buyurtmani qabul qilganingizda naqd pulda qilasiz.",
    CARD_ON_DELIVERY: "Tez orada aloqaga chiqamiz. To‘lovni kuryerga terminal orqali karta bilan qilasiz.",
    CARD_TRANSFER: "Chekingizni tekshirib, to‘lovni tasdiqlaymiz va buyurtmani tayyorlashni boshlaymiz.",
    WALLET: "To‘lov hamyoningizdan yechildi. Buyurtma bekor qilinsa, mablag‘ avtomatik qaytadi."
  },
  track: "Buyurtmani kuzatish", continue: "Xaridni davom ettirish", empty: "Savat bo‘sh", emptyHint: "Katalogdan kerakli uskunani tanlang.",
  products: "Savatdagi mahsulotlar", decrease: "Kamaytirish", increase: "Ko‘paytirish",
  addressTitle: "Qayerga yetkazamiz?", addressHint: "Manzilni yozing yoki xaritadan nuqtani belgilang.",
  city: "Shahar yoki viloyat", address: "Manzil", addressPlaceholder: "Ko‘cha, uy, kirish yoki mo‘ljal",
  contactTitle: "Kim qabul qiladi?", contactHint: "Yetkazishni kelishish uchun shu raqamga qo‘ng‘iroq qilamiz.",
  name: "Qabul qiluvchi ismi", phone: "Telefon raqami", note: "Izoh yoki manzil tafsilotlari (ixtiyoriy)",
  summary: "Buyurtma", count: "Mahsulotlar soni", location: "Manzil", chosen: "Xaritada tanlangan", manual: "Yozilgan",
  submit: "Buyurtmani tasdiqlash", sending: "Yuborilmoqda…", fail: "Buyurtma yuborilmadi.", network: "Internet bilan aloqa uzildi. Qayta urinib ko‘ring.",
  back: "Orqaga", toDelivery: "Yetkazishga o‘tish", toPayment: "To‘lovga o‘tish", locationNeeded: "Manzilni yozing yoki xaritadan nuqtani tanlang.", staffCannotOrder: "Xodim hisobi bilan buyurtma berib bo‘lmaydi. Mijoz hisobiga kiring.",
  paymentTitle: "Qanday to‘laysiz?", paymentHint: "Sizga qulay usulni tanlang.", balance: "Balans", soon: "Tez orada",
  methods: {
    cash: { title: "Naqd pul", hint: "Buyurtmani qabul qilganda to‘laysiz" },
    terminal: { title: "Karta bilan kuryerga", hint: "Terminal orqali Uzcard, Humo yoki Visa" },
    transfer: { title: "Kartaga o‘tkazma", hint: "Hozir o‘tkazasiz va chekni yuklaysiz" },
    wallet: { title: "Tecsecure hamyoni", hint: "" },
    online: { title: "Karta raqami bilan onlayn", hint: "Payme, Click yoki Uzum orqali" }
  },
  transferOff: "Hozircha mavjud emas", prepayNeedsPrice: "Narxi kelishiladigan mahsulot bor: qabul qilganda to‘lang", walletShort: "Hamyonda mablag‘ yetarli emas",
  transferSteps: ["Bank ilovangizdan quyidagi kartaga pul o‘tkazing", "O‘tkazma chekini rasm qilib yuklang", "Buyurtmani tasdiqlang"],
  toTransfer: "O‘tkaziladigan summa", receipt: "To‘lov cheki", transferNote: "Izoh (ixtiyoriy)", transferNotePlaceholder: "Masalan, karta egasining ismi", receiptRequired: "Davom etish uchun to‘lov chekini yuklang.",
  afterPayment: "To‘lovdan keyingi balans", topUp: "Hamyonni to‘ldirish →",
};
export const checkoutCopy: Record<Locale, typeof uz> = {
  uz,
  ru: {
    steps: ["Корзина", "Доставка", "Оплата"], stepsLabel: "Этапы заказа",
    accepted: "Заказ принят", reference: "Номер заказа",
    next: {
      CASH: "Скоро свяжемся с вами. Оплата наличными при получении заказа.",
      CARD_ON_DELIVERY: "Скоро свяжемся с вами. Оплата картой курьеру через терминал.",
      CARD_TRANSFER: "Проверим чек, подтвердим оплату и начнём готовить заказ.",
      WALLET: "Оплата списана с кошелька. При отмене заказа деньги вернутся автоматически."
    },
    track: "Отследить заказ", continue: "Продолжить покупки", empty: "Корзина пуста", emptyHint: "Выберите нужное оборудование в каталоге.",
    products: "Товары в корзине", decrease: "Уменьшить", increase: "Увеличить",
    addressTitle: "Куда доставить?", addressHint: "Введите адрес или отметьте точку на карте.",
    city: "Город или область", address: "Адрес", addressPlaceholder: "Улица, дом, подъезд или ориентир",
    contactTitle: "Кто получит заказ?", contactHint: "Позвоним на этот номер, чтобы согласовать доставку.",
    name: "Имя получателя", phone: "Номер телефона", note: "Комментарий или детали адреса (необязательно)",
    summary: "Заказ", count: "Количество товаров", location: "Адрес", chosen: "Выбран на карте", manual: "Указан вручную",
    submit: "Подтвердить заказ", sending: "Отправка…", fail: "Не удалось отправить заказ.", network: "Нет связи с интернетом. Попробуйте ещё раз.",
    back: "Назад", toDelivery: "К доставке", toPayment: "К оплате", locationNeeded: "Введите адрес или выберите точку на карте.", staffCannotOrder: "С аккаунта сотрудника нельзя оформить заказ. Войдите как клиент.",
    paymentTitle: "Как будете платить?", paymentHint: "Выберите удобный способ.", balance: "Баланс", soon: "Скоро",
    methods: {
      cash: { title: "Наличные", hint: "Оплата при получении заказа" },
      terminal: { title: "Картой курьеру", hint: "Через терминал: Uzcard, Humo или Visa" },
      transfer: { title: "Перевод на карту", hint: "Переведите сейчас и загрузите чек" },
      wallet: { title: "Кошелёк Tecsecure", hint: "" },
      online: { title: "Онлайн по номеру карты", hint: "Через Payme, Click или Uzum" }
    },
    transferOff: "Пока недоступно", prepayNeedsPrice: "Есть товар с ценой по запросу: оплатите при получении", walletShort: "В кошельке недостаточно средств",
    transferSteps: ["Переведите деньги на карту ниже в приложении банка", "Загрузите фото чека о переводе", "Подтвердите заказ"],
    toTransfer: "Сумма перевода", receipt: "Чек об оплате", transferNote: "Комментарий (необязательно)", transferNotePlaceholder: "Например, имя владельца карты", receiptRequired: "Чтобы продолжить, загрузите чек об оплате.",
    afterPayment: "Баланс после оплаты", topUp: "Пополнить кошелёк →",
  },
  en: {
    steps: ["Cart", "Delivery", "Payment"], stepsLabel: "Order steps",
    accepted: "Order received", reference: "Order number",
    next: {
      CASH: "We will contact you shortly. Pay in cash when you receive the order.",
      CARD_ON_DELIVERY: "We will contact you shortly. Pay the courier by card through a terminal.",
      CARD_TRANSFER: "We will check your receipt, confirm the payment and start preparing your order.",
      WALLET: "The payment was taken from your wallet. If the order is cancelled, the money returns automatically."
    },
    track: "Track order", continue: "Continue shopping", empty: "Your cart is empty", emptyHint: "Choose the equipment you need from the catalog.",
    products: "Products in your cart", decrease: "Decrease", increase: "Increase",
    addressTitle: "Where should we deliver?", addressHint: "Type the address or mark a point on the map.",
    city: "City or region", address: "Address", addressPlaceholder: "Street, building, entrance or landmark",
    contactTitle: "Who will receive it?", contactHint: "We will call this number to arrange delivery.",
    name: "Recipient name", phone: "Phone number", note: "Note or address details (optional)",
    summary: "Order", count: "Number of products", location: "Address", chosen: "Chosen on the map", manual: "Typed in",
    submit: "Confirm order", sending: "Sending…", fail: "Could not submit the order.", network: "Connection lost. Please try again.",
    back: "Back", toDelivery: "Continue to delivery", toPayment: "Continue to payment", locationNeeded: "Type an address or choose a point on the map.", staffCannotOrder: "Staff accounts cannot place orders. Sign in with a customer account.",
    paymentTitle: "How would you like to pay?", paymentHint: "Choose what suits you.", balance: "Balance", soon: "Coming soon",
    methods: {
      cash: { title: "Cash", hint: "Pay when you receive the order" },
      terminal: { title: "Card to courier", hint: "By terminal: Uzcard, Humo or Visa" },
      transfer: { title: "Card transfer", hint: "Transfer now and upload the receipt" },
      wallet: { title: "Tecsecure wallet", hint: "" },
      online: { title: "Online with card number", hint: "Through Payme, Click or Uzum" }
    },
    transferOff: "Not available yet", prepayNeedsPrice: "One product has no fixed price: pay on delivery", walletShort: "Not enough money in your wallet",
    transferSteps: ["Transfer the money to the card below in your bank app", "Upload a photo of the transfer receipt", "Confirm the order"],
    toTransfer: "Amount to transfer", receipt: "Payment receipt", transferNote: "Note (optional)", transferNotePlaceholder: "For example, the card holder’s name", receiptRequired: "Upload the payment receipt to continue.",
    afterPayment: "Balance after payment", topUp: "Top up your wallet →",
  },
};
