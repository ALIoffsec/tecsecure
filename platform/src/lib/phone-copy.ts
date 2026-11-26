import type { Locale } from "./messages";

/** Texts for proving a phone number: the sign-in choice and the profile check. */
export const phoneCopy: Record<Locale, {
  chooseTitle: string; chooseHint: string; oldAccount: string; oldHint: string; newAccount: string;
  verifyTitle: string; verifyHint: string; verified: string; notVerified: string; sendSms: string; viaTelegram: string; telegramWaiting: string; openTelegram: string;
  sentSms: string; sentGateway: string; recent: string; code: string; confirm: string; checking: string; sending: string; done: string; unsupported: string;
}> = {
  uz: {
    chooseTitle: "Bu raqam boshqa hisobda tasdiqlanmagan holda yozilgan",
    chooseHint: "Agar o‘sha hisob sizniki bo‘lsa, unga odatdagidek kiring va profilda raqamni tasdiqlang. Aks holda shu raqam bilan yangi hisob oching.",
    oldAccount: "Eski hisobimga kiraman", oldHint: "Email va parol yoki tashqi hisob (Google va b.) bilan kiring, keyin profilda “Raqamni tasdiqlash”ni bosing.",
    newAccount: "Yangi hisob ochaman",
    verifyTitle: "Telefon raqamini tasdiqlash", verifyHint: "Tasdiqlangan raqam bilan kod orqali kirasiz va parolni tiklaysiz.",
    verified: "Tasdiqlangan", notVerified: "Tasdiqlanmagan", sendSms: "Kodni olish", viaTelegram: "Telegram orqali tasdiqlash",
    telegramWaiting: "Telegram’da “Raqamimni yuborish” tugmasini bosing, kelgan kodni shu yerga yozing.", openTelegram: "Telegram’ni ochish",
    sentSms: "Kod SMS orqali yuborildi.", sentGateway: "Kod Telegram’dagi “Verification Codes” chatiga yuborildi.", recent: "Kod bir daqiqa ichida yuborilgan. Shu kodni kiriting yoki biroz kuting.",
    code: "6 xonali kod", confirm: "Tasdiqlash", checking: "Tekshirilmoqda…", sending: "Yuborilmoqda…", done: "Raqam tasdiqlandi.",
    unsupported: "Faqat O‘zbekiston raqamini (+998) tasdiqlash mumkin."
  },
  ru: {
    chooseTitle: "Этот номер записан в другом аккаунте без подтверждения",
    chooseHint: "Если тот аккаунт ваш, войдите в него как обычно и подтвердите номер в профиле. Иначе откройте новый аккаунт с этим номером.",
    oldAccount: "Войду в старый аккаунт", oldHint: "Войдите по email и паролю или через внешний аккаунт (Google и др.), затем в профиле нажмите «Подтвердить номер».",
    newAccount: "Открою новый аккаунт",
    verifyTitle: "Подтверждение номера телефона", verifyHint: "С подтверждённым номером можно входить по коду и восстанавливать пароль.",
    verified: "Подтверждён", notVerified: "Не подтверждён", sendSms: "Получить код", viaTelegram: "Подтвердить через Telegram",
    telegramWaiting: "В Telegram нажмите «Отправить мой номер» и введите пришедший код здесь.", openTelegram: "Открыть Telegram",
    sentSms: "Код отправлен по SMS.", sentGateway: "Код отправлен в чат «Verification Codes» в Telegram.", recent: "Код уже отправлен в течение минуты. Введите его или немного подождите.",
    code: "Код из 6 цифр", confirm: "Подтвердить", checking: "Проверка…", sending: "Отправка…", done: "Номер подтверждён.",
    unsupported: "Подтвердить можно только номер Узбекистана (+998)."
  },
  en: {
    chooseTitle: "This number is on another account but was never confirmed there",
    chooseHint: "If that account is yours, sign in to it as usual and confirm the number in your profile. Otherwise open a new account with this number.",
    oldAccount: "I’ll sign in to my old account", oldHint: "Sign in with email and password or an external account (Google etc.), then press “Confirm number” in your profile.",
    newAccount: "Open a new account",
    verifyTitle: "Confirm your phone number", verifyHint: "With a confirmed number you can sign in by code and reset your password.",
    verified: "Confirmed", notVerified: "Not confirmed", sendSms: "Get a code", viaTelegram: "Confirm through Telegram",
    telegramWaiting: "In Telegram press “Send my number”, then type the code you get here.", openTelegram: "Open Telegram",
    sentSms: "The code was sent by SMS.", sentGateway: "The code was sent to the “Verification Codes” chat in Telegram.", recent: "A code was sent less than a minute ago. Enter it or wait a little.",
    code: "6-digit code", confirm: "Confirm", checking: "Checking…", sending: "Sending…", done: "Your number is confirmed.",
    unsupported: "Only Uzbek numbers (+998) can be confirmed."
  }
};
