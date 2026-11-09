import type { Locale } from "./messages";

const uz = {
  stepTitle: "Ikki bosqichli tasdiq",
  stepHint: "Autentifikator ilovasidagi (Google Authenticator va boshqalar) 6 xonali kodni kiriting. Telefon yo‘q bo‘lsa, zaxira kodlardan birini yozing.",
  code: "Kod", confirm: "Tasdiqlash", checking: "Tekshirilmoqda…", wrong: "Kod noto‘g‘ri. Ilovadagi joriy kodni kiriting.", expired: "Kirish vaqti tugadi. Qaytadan kiring.", restart: "Qaytadan kirish",
  card: "Ikki bosqichli himoya (ixtiyoriy)",
  cardHint: "Yoqsangiz, parol yoki SMS kodidan tashqari telefoningizdagi autentifikator ilovasi kodi ham so‘raladi. Parolingiz o‘g‘irlansa ham hisobingizga kira olmaydilar.",
  on: "Yoqilgan", off: "O‘chirilgan", enable: "Yoqish", disable: "O‘chirish", cancel: "Bekor qilish",
  scan: "1. Google Authenticator, Microsoft Authenticator yoki shunga o‘xshash ilovada QR kodni skanerlang.",
  manual: "Skanerlab bo‘lmasa, shu kalitni qo‘lda kiriting:",
  enterCode: "2. Ilova ko‘rsatgan 6 xonali kodni kiriting:",
  backupTitle: "Zaxira kodlar",
  backupHint: "Har biri bir marta ishlaydi. Telefoningiz yo‘qolsa, shu kodlar bilan kirasiz. Ularni xavfsiz joyga yozib qo‘ying: qayta ko‘rsatilmaydi.",
  copy: "Nusxalash", copied: "Nusxalandi", done: "Saqladim",
  backupLeft: "Qolgan zaxira kodlar",
  disableHint: "O‘chirish uchun ilovadagi joriy kodni yoki zaxira kodni kiriting.",
  enabledNotice: "Ikki bosqichli himoya yoqildi.", disabledNotice: "Ikki bosqichli himoya o‘chirildi.", failed: "Amal bajarilmadi. Qayta urinib ko‘ring."
};

export const securityCopy: Record<Locale, typeof uz> = {
  uz,
  ru: {
    stepTitle: "Двухэтапная проверка",
    stepHint: "Введите 6-значный код из приложения-аутентификатора (Google Authenticator и др.). Если телефона нет под рукой, введите один из резервных кодов.",
    code: "Код", confirm: "Подтвердить", checking: "Проверяем…", wrong: "Неверный код. Введите текущий код из приложения.", expired: "Время входа истекло. Войдите заново.", restart: "Войти заново",
    card: "Двухэтапная защита (по желанию)",
    cardHint: "Если включить, кроме пароля или SMS-кода понадобится код из приложения-аутентификатора на телефоне. Даже с украденным паролем в аккаунт не войдут.",
    on: "Включена", off: "Выключена", enable: "Включить", disable: "Выключить", cancel: "Отмена",
    scan: "1. Отсканируйте QR-код в Google Authenticator, Microsoft Authenticator или похожем приложении.",
    manual: "Если сканировать не получается, введите ключ вручную:",
    enterCode: "2. Введите 6-значный код, который показало приложение:",
    backupTitle: "Резервные коды",
    backupHint: "Каждый работает один раз. Если потеряете телефон, войдёте с ними. Сохраните их в надёжном месте: повторно они не показываются.",
    copy: "Копировать", copied: "Скопировано", done: "Я сохранил",
    backupLeft: "Осталось резервных кодов",
    disableHint: "Чтобы выключить, введите текущий код из приложения или резервный код.",
    enabledNotice: "Двухэтапная защита включена.", disabledNotice: "Двухэтапная защита выключена.", failed: "Не удалось. Попробуйте ещё раз."
  },
  en: {
    stepTitle: "Two-step verification",
    stepHint: "Enter the 6-digit code from your authenticator app (Google Authenticator or similar). Without your phone, type one of your backup codes.",
    code: "Code", confirm: "Confirm", checking: "Checking…", wrong: "Wrong code. Enter the current code from the app.", expired: "Sign-in timed out. Please sign in again.", restart: "Sign in again",
    card: "Two-step protection (optional)",
    cardHint: "When on, signing in also needs a code from the authenticator app on your phone, besides your password or SMS code. A stolen password alone will not get anyone in.",
    on: "On", off: "Off", enable: "Turn on", disable: "Turn off", cancel: "Cancel",
    scan: "1. Scan the QR code with Google Authenticator, Microsoft Authenticator or a similar app.",
    manual: "If you cannot scan, type this key instead:",
    enterCode: "2. Enter the 6-digit code the app shows:",
    backupTitle: "Backup codes",
    backupHint: "Each works once. If you lose your phone, sign in with these. Keep them somewhere safe: they are not shown again.",
    copy: "Copy", copied: "Copied", done: "I saved them",
    backupLeft: "Backup codes left",
    disableHint: "To turn it off, enter the current code from the app or a backup code.",
    enabledNotice: "Two-step protection is on.", disabledNotice: "Two-step protection is off.", failed: "That did not work. Try again."
  }
};
