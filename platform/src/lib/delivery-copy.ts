import type { Locale } from "./messages";

const uz = {
  title: "Yetkazish va QQS",
  hint: "Mijoz checkout’da viloyatini tanlaydi va shu yerdagi narx va muddatni ko‘radi. Bo‘sh katak shu usul u yerda yo‘qligini bildiradi. Hech narsa kiritilmasa, yetkazish narxi avvalgidek telefonda kelishiladi.",
  region: "Viloyat", express: "Shahar ichida kuryer, so‘m", courier: "Viloyatga kuryer yoki pochta, so‘m", days: "Muddat",
  copyDown: "Toshkent viloyati qatorini boshqa viloyatlarga nusxalash", fillHint: "Narxlarni kuryer xizmatlari bilan kelishganingizdan keyin kiriting.",
  pickup: "Olib ketish", pickupOn: "Mijoz buyurtmani o‘zi olib ketishi mumkin", pickupAddress: "Olib ketish manzili (bo‘sh qolsa, kompaniya manzili)",
  freeFrom: "Shu summadan boshlab yetkazish bepul, so‘m (bo‘sh = hech qachon)",
  vat: "QQS", vatNone: "Narxlarda QQS yo‘q (QQS to‘lovchisi emasmiz)", vatIncluded: "Narxlar QQS 12% bilan: chek va hisob-fakturada alohida ko‘rsatiladi",
  vatHint: "Buni buxgalteringiz bilan tasdiqlang: aylanma solig‘idagi korxona QQS ko‘rsatmaydi.",
  save: "Saqlash", saved: "Yetkazish sozlamalari saqlandi.", failed: "Saqlab bo‘lmadi. Qayta urinib ko‘ring.",
  daysPresets: { "0-0": "Bugun", "0-1": "Bugun yoki ertaga", "1-1": "Ertaga", "1-2": "1–2 kun", "1-3": "1–3 kun", "2-3": "2–3 kun", "2-4": "2–4 kun", "3-5": "3–5 kun", "5-7": "5–7 kun", "7-14": "7–14 kun" } as Record<string, string>
};

export const deliveryAdminCopy: Record<Locale, typeof uz> = {
  uz,
  ru: {
    title: "Доставка и НДС",
    hint: "Покупатель выбирает область при оформлении и видит здесь указанные цену и срок. Пустая ячейка значит, что такого способа там нет. Если ничего не заполнено, стоимость доставки, как и раньше, согласуется по телефону.",
    region: "Область", express: "Курьер по городу, сум", courier: "Курьер или почта в область, сум", days: "Срок",
    copyDown: "Скопировать строку Ташкентской области в остальные области", fillHint: "Заполните цены после договорённости с курьерскими службами.",
    pickup: "Самовывоз", pickupOn: "Покупатель может забрать заказ сам", pickupAddress: "Адрес самовывоза (если пусто, адрес компании)",
    freeFrom: "Бесплатная доставка от суммы, сум (пусто = никогда)",
    vat: "НДС", vatNone: "В ценах нет НДС (мы не плательщик НДС)", vatIncluded: "Цены с НДС 12%: в чеке и счёте он выделяется отдельно",
    vatHint: "Подтвердите с бухгалтером: компания на налоге с оборота НДС не выделяет.",
    save: "Сохранить", saved: "Настройки доставки сохранены.", failed: "Не удалось сохранить. Попробуйте ещё раз.",
    daysPresets: { "0-0": "Сегодня", "0-1": "Сегодня или завтра", "1-1": "Завтра", "1-2": "1–2 дня", "1-3": "1–3 дня", "2-3": "2–3 дня", "2-4": "2–4 дня", "3-5": "3–5 дней", "5-7": "5–7 дней", "7-14": "7–14 дней" }
  },
  en: {
    title: "Delivery and VAT",
    hint: "At checkout the customer picks a region and sees the price and time set here. An empty cell means that method is not offered there. If nothing is filled in, delivery is agreed by phone as before.",
    region: "Region", express: "City courier, so‘m", courier: "Courier or post to the region, so‘m", days: "Time",
    copyDown: "Copy the Tashkent region row to the other regions", fillHint: "Fill in prices once you have agreed them with the courier services.",
    pickup: "Pickup", pickupOn: "Customers may collect orders themselves", pickupAddress: "Pickup address (empty = company address)",
    freeFrom: "Free delivery from this amount, so‘m (empty = never)",
    vat: "VAT", vatNone: "Prices carry no VAT (we are not a VAT payer)", vatIncluded: "Prices include 12% VAT, shown separately on receipts and invoices",
    vatHint: "Confirm with your accountant: a company on turnover tax does not show VAT.",
    save: "Save", saved: "Delivery settings saved.", failed: "Could not save. Try again.",
    daysPresets: { "0-0": "Today", "0-1": "Today or tomorrow", "1-1": "Tomorrow", "1-2": "1–2 days", "1-3": "1–3 days", "2-3": "2–3 days", "2-4": "2–4 days", "3-5": "3–5 days", "5-7": "5–7 days", "7-14": "7–14 days" }
  }
};
