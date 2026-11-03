import type { Locale } from "./messages";

const uz = {
  steps: ["Savat", "Yetkazib berish", "Tasdiqlash"],
  accepted: "Buyurtma qabul qilindi", reference: "Buyurtma raqami", nextStep: "Xodimlar narx, mavjudlik va yetkazishni siz bilan kelishadi. Bu hali to‘lov tasdig‘i emas.",
  track: "Buyurtmani kuzatish", continue: "Xaridni davom ettirish", empty: "Savat bo‘sh", emptyHint: "Katalogdan kerakli uskunalarni tanlang.",
  products: "Savatdagi mahsulotlar", decrease: "Kamaytirish", increase: "Ko‘paytirish",
  addressTitle: "Yetkazish manzili", addressHint: "Manzilni yozing yoki xaritadan nuqta tanlang. Joylashuvni aniqlash majburiy emas.",
  city: "Shahar / viloyat", address: "Manzil", addressPlaceholder: "Ko‘cha, uy, kirish yoki mo‘ljal",
  contactTitle: "Qabul qiluvchi va aloqa", contactHint: "Buyurtma va yetkazishni kelishish uchun.",
  name: "Qabul qiluvchi nomi", phone: "Telefon raqami", note: "Izoh yoki qo‘shimcha manzil tafsilotlari (ixtiyoriy)",
  summary: "Buyurtma xulosasi", count: "Mahsulotlar", location: "Yetkazish nuqtasi", chosen: "Tanlangan", manual: "Matn bilan",
  submit: "Buyurtma so‘rovini yuborish", sending: "Yuborilmoqda…", fail: "Buyurtma yuborilmadi.", network: "Tarmoq xatosi. Qayta urinib ko‘ring.",
};
export const checkoutCopy: Record<Locale, { [K in keyof typeof uz]: typeof uz[K] }> = {
  uz,
  ru: {
    steps: ["Корзина", "Доставка", "Подтверждение"],
    accepted: "Заказ принят", reference: "Номер заказа", nextStep: "Сотрудники согласуют цену, наличие и доставку. Это ещё не подтверждение оплаты.",
    track: "Отследить заказ", continue: "Продолжить покупки", empty: "Корзина пуста", emptyHint: "Выберите оборудование в каталоге.",
    products: "Товары в корзине", decrease: "Уменьшить", increase: "Увеличить",
    addressTitle: "Адрес доставки", addressHint: "Введите адрес или выберите точку на карте. Определение геопозиции не обязательно.",
    city: "Город / область", address: "Адрес", addressPlaceholder: "Улица, дом, подъезд или ориентир",
    contactTitle: "Получатель и контакты", contactHint: "Для согласования заказа и доставки.",
    name: "Имя получателя", phone: "Телефон", note: "Комментарий или детали адреса (необязательно)",
    summary: "Итог заказа", count: "Товары", location: "Место доставки", chosen: "Выбрано", manual: "Текстовый адрес",
    submit: "Отправить запрос на заказ", sending: "Отправка…", fail: "Не удалось отправить заказ.", network: "Ошибка сети. Попробуйте снова.",
  },
  en: {
    steps: ["Cart", "Delivery", "Confirmation"],
    accepted: "Order request received", reference: "Order reference", nextStep: "The team will confirm price, availability and delivery with you. This is not a payment confirmation.",
    track: "Track order", continue: "Continue shopping", empty: "Your cart is empty", emptyHint: "Choose equipment from the catalog.",
    products: "Products in your cart", decrease: "Decrease", increase: "Increase",
    addressTitle: "Delivery address", addressHint: "Enter an address or choose a map point. Geolocation is optional.",
    city: "City / region", address: "Address", addressPlaceholder: "Street, building, entrance or landmark",
    contactTitle: "Recipient and contact", contactHint: "To agree on the order and delivery.",
    name: "Recipient name", phone: "Phone", note: "Note or additional address details (optional)",
    summary: "Order summary", count: "Products", location: "Delivery location", chosen: "Selected", manual: "Written address",
    submit: "Send order request", sending: "Sending…", fail: "Could not submit the order.", network: "Network error. Please try again.",
  },
};
