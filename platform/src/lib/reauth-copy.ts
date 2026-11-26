import type { Locale } from "./messages";

type Copy = {
  title: string; hint: string; password: string; code: string; totpCode: string; confirm: string; checking: string; cancel: string;
  recent: string; recentHint: string; sendTelegram: string; sendPhone: string; sendEmail: string; sending: string; sent: string;
  signInAgain: string; signInAgainHint: string; failed: string;
};

export const reauthCopy: Record<Locale, Copy> = {
  uz: {
    title: "Bu siz ekaningizni tasdiqlang", hint: "Hisob xavfsizligiga tegishli o‘zgarishdan oldin bir marta tasdiq kerak.",
    password: "Joriy parol", code: "Kod", totpCode: "Autentifikator yoki zaxira kod", confirm: "Tasdiqlash", checking: "Tekshirilmoqda…", cancel: "Bekor qilish",
    recent: "Davom etish", recentHint: "Siz yaqinda kirgansiz, shuning uchun qayta tasdiq shart emas.",
    sendTelegram: "Kodni Telegram’ga yuborish", sendPhone: "Kodni telefonga yuborish", sendEmail: "Kodni emailga yuborish", sending: "Yuborilmoqda…", sent: "Kod yuborildi. Uni pastga yozing.",
    signInAgain: "Chiqib, qayta kirish", signInAgainHint: "Parolingiz bo‘lmasa, chiqib qayta kiring: 10 daqiqa ichida qayta tasdiq so‘ralmaydi.",
    failed: "Tasdiqlab bo‘lmadi."
  },
  ru: {
    title: "Подтвердите, что это вы", hint: "Перед изменением, связанным с безопасностью аккаунта, нужно одно подтверждение.",
    password: "Текущий пароль", code: "Код", totpCode: "Код из приложения или резервный код", confirm: "Подтвердить", checking: "Проверка…", cancel: "Отмена",
    recent: "Продолжить", recentHint: "Вы недавно вошли, поэтому повторное подтверждение не нужно.",
    sendTelegram: "Отправить код в Telegram", sendPhone: "Отправить код на телефон", sendEmail: "Отправить код на email", sending: "Отправка…", sent: "Код отправлен. Введите его ниже.",
    signInAgain: "Выйти и войти снова", signInAgainHint: "Если у вас нет пароля, выйдите и войдите снова: 10 минут подтверждение не потребуется.",
    failed: "Не удалось подтвердить."
  },
  en: {
    title: "Confirm it’s you", hint: "A change to your account’s security needs one confirmation first.",
    password: "Current password", code: "Code", totpCode: "Authenticator or backup code", confirm: "Confirm", checking: "Checking…", cancel: "Cancel",
    recent: "Continue", recentHint: "You signed in recently, so no extra confirmation is needed.",
    sendTelegram: "Send the code to Telegram", sendPhone: "Send the code to my phone", sendEmail: "Send the code by email", sending: "Sending…", sent: "The code was sent. Type it below.",
    signInAgain: "Sign out and sign in again", signInAgainHint: "If you have no password, sign out and sign in again: no confirmation is asked for 10 minutes.",
    failed: "Could not confirm."
  }
};
