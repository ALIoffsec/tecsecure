import type { Locale } from "./messages";

const uz = {
  code: {
    loginTitle: "Telefon raqam bilan kirish", loginHint: "Raqamingizga kod yuboramiz. Parol kerak emas, hisob bo‘lmasa o‘zi ochiladi.",
    resetTitle: "Parolni tiklash", resetHint: "Telefon raqamingiz yoki emailingizni yozing, tasdiqlash kodini yuboramiz.",
    phone: "Telefon raqami", identifier: "Telefon raqami yoki email", send: "Kodni yuborish", sending: "Yuborilmoqda…",
    sent: "Agar bunday hisob bo‘lsa, kod yuborildi. Telegram, SMS yoki emailingizni tekshiring.", sentLogin: "Kod yuborildi. Telegram yoki SMS’ni tekshiring.",
    code: "6 xonali kod", name: "Ismingiz", newPassword: "Yangi parol", confirm: "Tasdiqlash", resend: "Kodni qayta yuborish", resendIn: "Qayta yuborish", back: "Kirish sahifasiga qaytish",
    unavailable: "SMS orqali kirish hozircha yoqilmagan. Email va parol bilan kiring yoki Telegram’ni profilingizga ulang.", done: "Tayyor, kirmoqdasiz…",
    sentSms: "Kod SMS orqali yuborildi. Bir-ikki daqiqa ichida keladi.", sentGateway: "Kod Telegram’ingizga yuborildi: Telegram’dagi “Verification Codes” chatini oching.", sentTelegram: "Kod Telegram’ga yuborildi: Tecsecure botini oching.", recent: "Kod bir daqiqa ichida allaqachon yuborilgan. Shu kodni kiriting yoki biroz kuting.",
    noChannel: "Bu raqamga kod yuborib bo‘lmadi: SMS xizmati hozircha ulanmagan. Email va parol bilan kiring yoki biz bilan bog‘laning.", sendFailed: "SMS yuborilmadi. Bir daqiqadan keyin qayta urinib ko‘ring.",
    smsOff: "SMS hozircha ishlamayapti. Kod faqat Telegram ulangan hisoblarga keladi.", sentResetNoSms: "Agar bu raqam bilan hisob bo‘lsa va unga Telegram ulangan bo‘lsa, kod Telegram’ga yuborildi. SMS hozircha ishlamayapti.", telegramGet: "Kodni Telegram botimiz orqali olish", telegramHint: "Bot ochiladi: “Raqamimni yuborish” tugmasini bosing. Telegram’dagi raqamingiz shu raqamga mos bo‘lsa, kod botga keladi.", openTelegram: "Telegram’ni ochish", telegramWaiting: "Telegram’da raqamingizni yuboring, keyin kelgan kodni shu yerga yozing.", or: "yoki", sentEmail: "Kod emailingizga yuborildi. “Spam” papkasini ham tekshiring.", verifyCode: "Kodni tasdiqlash", checking: "Tekshirilmoqda…", wrongCode: "Kod noto‘g‘ri yoki muddati tugagan.", passwordTitle: "Yangi parol o‘rnating", passwordHint: "Kod tasdiqlandi. Endi yangi parolni ikki marta kiriting.", confirmPassword: "Yangi parolni takrorlang", passwordsDiffer: "Parollar bir xil emas.", savePassword: "Parolni saqlash", ticketExpired: "Tasdiqlash vaqti tugadi. Kodni qaytadan oling.", changeNumber: "Boshqa raqam yoki email", stepIdentify: "Raqam", stepIdentifyReset: "Raqam yoki email", stepCode: "Kod", stepPassword: "Yangi parol"
  },
  auth: { forgot: "Parolni unutdingizmi?", phoneLogin: "Telefon raqam bilan kirish" },
  telegram: {
    title: "Telegram", hint: "Buyurtma holati, javoblar va kirish kodlari Telegram’ga keladi.", connect: "Telegram’ni ulash", connected: "Telegram ulangan", disconnect: "Uzish", openLink: "Telegram’da “Start” tugmasini bosing, keyin shu sahifani yangilang.", unavailable: "Telegram bot hali sozlanmagan.",
    staffTitle: "Xodimlar ilovasi", staffHint: "Telegram’ni ulasangiz, buyurtma va arizalarni xodimlar botidagi ilovadan boshqarasiz."
  },
  tma: {
    loading: "Tecsecure ochilmoqda…", outside: "Bu sahifa Telegram ichida ochiladi. Botni oching va “Tecsecure” tugmasini bosing.", failed: "Kirib bo‘lmadi.", retry: "Qayta urinish",
    welcome: "Tecsecure’ga xush kelibsiz", welcomeHint: "Telegram orqali hisob oching: buyurtma va o‘qishingiz shu yerda saqlanadi.", create: "Hisob ochish", openSite: "Saytni ochish"
  },
  staffApp: {
    title: "Xodimlar ilovasi", orders: "Buyurtmalar", wallet: "Hamyon", requests: "Arizalar", empty: "Hozircha yangi ish yo‘q.", full: "To‘liq admin panel", approve: "Tasdiqlash", reject: "Rad etish", call: "Qo‘ng‘iroq", take: "Ko‘rib chiqishga olish", proof: "Chek", deposit: "To‘ldirish", withdrawal: "Yechish", failed: "Amal bajarilmadi."
  },
  b2b: {
    who: "Kim xarid qilyapti?", person: "Jismoniy shaxs", company: "Yuridik shaxs", companyName: "Kompaniya nomi", tin: "STIR (9 raqam)", tinInvalid: "STIR 9 ta raqamdan iborat bo‘lishi kerak.",
    bank: { title: "Bank o‘tkazmasi", hint: "Hisob olasiz va bank orqali to‘laysiz" }, bankOff: "Rekvizitlar hali kiritilmagan", companyOnly: "Yuridik shaxslar uchun",
    online: { title: "Karta bilan onlayn", hint: "Payme sahifasida xavfsiz to‘lov" }, onlineGo: "To‘lovga o‘tish", nextBank: "To‘lov uchun hisob tayyor. Bank orqali to‘lang, to‘lov tushgach buyurtmani tayyorlaymiz.", nextOnline: "To‘lov sahifasiga o‘tkazilmoqda…", invoice: "To‘lov uchun hisobni ochish", pay: "To‘lash"
  },
  invoice: {
    title: "To‘lov uchun hisob", number: "Raqam", date: "Sana", seller: "Sotuvchi", buyer: "Xaridor", tin: "STIR", account: "Hisob raqami", bank: "Bank", mfo: "MFO", address: "Manzil", item: "Nomi", qty: "Soni", price: "Narxi", sum: "Summa", total: "Jami", purpose: "To‘lov maqsadi", purposeText: "buyurtma uchun to‘lov", print: "Chop etish yoki PDF", note: "Bu hujjat to‘lov uchun hisob. Rasmiy elektron hisob-faktura alohida rasmiylashtiriladi.", unavailable: "Hisob rekvizitlari hali to‘ldirilmagan."
  },
  requisites: { title: "Yuridik rekvizitlar", hint: "Yuridik shaxslarga beriladigan hisobda chiqadi. Hammasi to‘ldirilsa, “Bank o‘tkazmasi” yoqiladi.", name: "Kompaniyaning yuridik nomi", tin: "STIR", address: "Yuridik manzil", bank: "Bank nomi", account: "Hisob raqami", mfo: "MFO" },
  orderExtra: { method: { BANK_TRANSFER: "Bank o‘tkazmasi", ONLINE_PAYME: "Payme" }, status: { AWAITING_PAYMENT: "To‘lov kutilmoqda", REFUND_DUE: "Qaytarish kerak" } },
  estimate: {
    eyebrow: "Smeta", title: "Loyihangizni bir daqiqada hisoblang", intro: "Obyekt haqida bir nechta raqam kiriting, kerakli uskunalar ro‘yxatini oling. Natijani PDF qilib saqlang yoki bizga yuboring.", tabNetwork: "Tarmoq va Wi-Fi", tabCctv: "Videokuzatuv",
    workplaces: "Ish joylari soni", floors: "Qavatlar soni", area: "Umumiy maydon (m²)", users: "Wi-Fi foydalanuvchilari", cameras: "Tarmoqdagi kameralar", server: "Server yoki NAS bor", build: "Hisoblash",
    resultTitle: "Dastlabki uskunalar ro‘yxati", accessPoints: "Wi-Fi nuqtalari", ports: "Tarmoq portlari", switch24: "24 portli PoE kommutator", switch48: "48 portli PoE kommutator", cable: "Cat6 kabel", boxes: "quti (305 m)", router: "Router yoki firewall", rack: "Shkaf hajmi", ups: "UPS", poe: "PoE quvvati", pcs: "dona",
    preliminary: "Bu dastlabki hisob. Devorlar, kabel yo‘llari va mavjud uskunalar yakuniy ro‘yxatni o‘zgartiradi, shuning uchun obyektni ko‘rgach aniq taklif beramiz.", print: "PDF qilib saqlash", send: "Aniq narxni so‘rash", dateLabel: "Sana"
  },
  check: {
    eyebrow: "Xavfsizlik testi", title: "Kompaniyangiz qanchalik himoyalangan?", intro: "10 ta oddiy savol, 2 daqiqa. Natijada baho va nimadan boshlash kerakligini ko‘rasiz. Javoblar hech qayerga yuborilmaydi.",
    progress: "Savol", next: "Keyingi", back: "Orqaga", result: "Sizning natijangiz", levels: { risk: "Yuqori xavf: himoya zaif", partial: "O‘rtacha: muhim bo‘shliqlar bor", good: "Yaxshi: asosiy himoya bor" }, adviceTitle: "Nimadan boshlash kerak", cta: "Bepul maslahat olish", audit: "Audit hisoboti namunasi", again: "Qayta topshirish"
  },
  plans: {
    eyebrow: "IT yordam", title: "Oylik IT yordam", intro: "Doimiy IT xodim yollash o‘rniga tarmoq, kompyuter va xavfsizlikni bizga topshiring. Har oy aniq xizmat ko‘lami.", priceOnRequest: "Narx obyektga qarab kelishiladi", perMonth: "oyiga", choose: "Tanlash va bog‘lanish", popular: "Ko‘p tanlanadi",
    tiers: [
      { name: "Boshlang‘ich", fit: "10 tagacha ish joyi", features: ["Masofaviy yordam ish vaqtida", "Tarmoq va router monitoringi", "Oylik holat hisoboti", "Yiliga 1 marta profilaktika"] },
      { name: "Biznes", fit: "10–50 ish joyi", features: ["Masofaviy va joyiga chiqib yordam", "Server va zaxira nazorati", "Tezkor javob muddati", "Har chorakda profilaktika", "Xavfsizlik yangilanishlari"] },
      { name: "Korporativ", fit: "50+ ish joyi yoki bir nechta filial", features: ["Biriktirilgan muhandis", "24/7 monitoring va ogohlantirish", "Yillik xavfsizlik auditi", "Xodimlarni o‘qitish", "Rivojlanish rejasi"] }
    ],
    how: "Qanday ishlaydi", steps: ["Obyekt va tizimlaringizni ko‘rib chiqamiz", "Xizmat ko‘lami va narxni yozma kelishamiz", "Monitoring ulanadi, yordam boshlanadi"], note: "Javob muddatlari va shartlar shartnomada yoziladi."
  },
  business: {
    eyebrow: "Kompaniyalar uchun", title: "Xodimlaringizni o‘qiting", intro: "IT va xavfsizlik bo‘yicha guruh uchun o‘quv dasturi: kompaniyangiz vazifalariga moslab tuziladi.", cta: "Dastur haqida so‘rash", catalog: "Kurslar katalogi",
    offers: [
      { title: "Xavfsizlik savodxonligi", text: "Barcha xodimlar uchun: soxta xatlar, parollar, ma’lumotni himoya qilish." },
      { title: "IT jamoa uchun", text: "Tarmoq, Linux, Windows Server va Active Directory bo‘yicha amaliy dastur." },
      { title: "Xavfsizlik jamoasi uchun", text: "SOC, hodisalarga javob berish, OWASP va firewall bo‘yicha chuqur amaliyot." }
    ],
    benefitsTitle: "Nima olasiz", benefits: ["Darajani aniqlash va shaxsiy reja", "Laboratoriya va imtihonlar", "Har bir xodim natijasi bo‘yicha hisobot", "Tekshirsa bo‘ladigan sertifikat"]
  },
  work: { story: "Loyiha tarixi", task: "Vazifa", done: "Nima qilindi", result: "Natija", client: "Mijoz fikri", location: "Joylashuv", more: "Loyihani ko‘rish", all: "Barcha ishlar", photos: "Suratlar", cta: "Shunday loyiha kerakmi?", ctaButton: "Ariza qoldirish", list: "Loyihalar" },
  workAdmin: { location: "Joylashuv (masalan, Toshkent)", task: "Vazifa: mijozga nima kerak edi", done: "Nima qilindi", result: "Natija", clientName: "Mijoz nomi (ixtiyoriy)", clientRole: "Lavozimi", clientQuote: "Mijoz fikri" },
  integrations: { staffBot: "Xodimlar boti (ixtiyoriy)", staffToken: "Xodimlar boti tokeni", staffUsername: "Xodimlar boti nomi", staffSecret: "Xodimlar boti webhook kaliti", staffHint: "Bo‘sh qolsa, xodim xabarlari ham asosiy botga keladi.", shopBot: "Do‘konlar boti (sotuvchilar uchun)", shopToken: "Do‘konlar boti tokeni", shopUsername: "Do‘konlar boti nomi", shopSecret: "Do‘konlar boti webhook kaliti", shopHint: "Sotuvchilar shu bot orqali kabinetini ochadi va buyurtma xabarlarini oladi. Bo‘sh qolsa, ularga xabarlar asosiy botdan boradi.",
    gatewayTitle: "Telegram Gateway (tasdiqlash kodlari)", gatewayHint: "Kod raqam egasining Telegram’iga Telegram’ning o‘zidan keladi: yetkazilgan kod uchun $0.01, yetkazilmasa pul qaytadi. gateway.telegram.org’da hisob ochib, “API” bo‘limidagi tokenni shu yerga kiriting. Telegram’i yo‘q raqamlarga kod SMS (Eskiz) orqali ketadi.", gatewayToken: "Gateway API tokeni", gatewayTestPhone: "Sinov uchun raqam (o‘zingizniki bepul)", gatewayTest: "Gateway sinovi", gatewayTestSent: "Kod Telegram’ingizga yuborildi: “Verification Codes” chatini tekshiring.", mailTitle: "Email (Gmail)", mailHint: "Kirish va parolni tiklash kodlari shu pochtadan yuboriladi.", mailAddress: "Pochta manzili", mailPassword: "Google ilova paroli (16 belgi)", mailPasswordHint: "Oddiy Gmail paroli ishlamaydi. Google hisobida ikki bosqichli tasdiqni yoqing, so‘ng myaccount.google.com/apppasswords sahifasida “Tecsecure” nomli ilova paroli yarating va shu yerga kiriting.", mailSender: "Yuboruvchi nomi", mailServer: "SMTP server va port", mailTestTo: "Sinov xati qaysi manzilga", mailTest: "Sinov xat yuborish", mailTestSent: "Sinov xat yuborildi. Pochtani (va Spam papkasini) tekshiring.", smsTitle: "SMS kodlar (Eskiz)", smsHint: "Telefon raqam bilan kirish va parolni tiklash kodlari shu orqali boradi. notify.eskiz.uz kabinetiga kiradigan email va parolni yozing.", smsEmail: "Eskiz email", smsPassword: "Eskiz paroli", smsFrom: "Yuboruvchi nomi", smsFromHint: "Eskiz tasdiqlagan nom. O‘z nomingiz hali tasdiqlanmagan bo‘lsa, 4546 qoldiring.", smsTemplates: "Eskiz faqat tasdiqlangan shablonga mos matnni yuboradi. Kabinetdagi «Shablonlar» bo‘limida shu ikki matnni yuboring; raqamlar o‘zgaruvchi qism:", smsTestPhone: "Sinov uchun telefon raqami", smsTest: "Sinov SMS yuborish", smsTestSent: "Eskiz SMS’ni qabul qildi. Telefonni tekshiring: kelmasa, shablon hali tasdiqlanmagan bo‘lishi mumkin." },
  analytics: { title: "Statistika", hint: "Sayt qanday ishlatilishini tushunish uchun Yandex Metrika. Reklama uchun ishlatilmaydi.", none: "Reklama cookie’lari ishlatilmaydi." },
  errors: { recent: "Oxirgi 24 soatdagi xatolar" },
  seoFooter: "Ommabop xizmatlar"
};

type GrowthCopy = typeof uz;

const ru: GrowthCopy = {
  code: {
    loginTitle: "Вход по номеру телефона", loginHint: "Отправим код на ваш номер. Пароль не нужен, а аккаунт создастся сам, если его ещё нет.",
    resetTitle: "Восстановление пароля", resetHint: "Укажите телефон или email, и мы отправим код подтверждения.",
    phone: "Номер телефона", identifier: "Телефон или email", send: "Отправить код", sending: "Отправка…",
    sent: "Если такой аккаунт есть, код отправлен. Проверьте Telegram, SMS или email.", sentLogin: "Код отправлен. Проверьте Telegram или SMS.",
    code: "Код из 6 цифр", name: "Ваше имя", newPassword: "Новый пароль", confirm: "Подтвердить", resend: "Отправить код ещё раз", resendIn: "Повторить", back: "Вернуться ко входу",
    unavailable: "Вход по SMS пока не включён. Войдите по email и паролю или подключите Telegram в профиле.", done: "Готово, выполняем вход…",
    sentSms: "Код отправлен по SMS. Он придёт в течение пары минут.", sentGateway: "Код отправлен в ваш Telegram: откройте чат «Verification Codes».", sentTelegram: "Код отправлен в Telegram: откройте бот Tecsecure.", recent: "Код уже отправлен меньше минуты назад. Введите его или немного подождите.",
    noChannel: "Не удалось отправить код на этот номер: SMS-сервис пока не подключён. Войдите по email и паролю или свяжитесь с нами.", sendFailed: "SMS не отправлено. Попробуйте ещё раз через минуту.",
    smsOff: "SMS пока не работает. Код приходит только в аккаунты с подключённым Telegram.", sentResetNoSms: "Если с этим номером есть аккаунт и к нему подключён Telegram, код отправлен в Telegram. SMS пока не работает.", telegramGet: "Получить код через наш Telegram-бот", telegramHint: "Откроется бот: нажмите «Отправить мой номер». Если номер в Telegram совпадает с этим, код придёт в бот.", openTelegram: "Открыть Telegram", telegramWaiting: "Отправьте номер в Telegram, затем введите пришедший код здесь.", or: "или", sentEmail: "Код отправлен на email. Проверьте и папку «Спам».", verifyCode: "Подтвердить код", checking: "Проверяем…", wrongCode: "Неверный или просроченный код.", passwordTitle: "Установите новый пароль", passwordHint: "Код подтверждён. Теперь введите новый пароль дважды.", confirmPassword: "Повторите новый пароль", passwordsDiffer: "Пароли не совпадают.", savePassword: "Сохранить пароль", ticketExpired: "Время подтверждения истекло. Получите код заново.", changeNumber: "Другой номер или email", stepIdentify: "Номер", stepIdentifyReset: "Номер или email", stepCode: "Код", stepPassword: "Новый пароль"
  },
  auth: { forgot: "Забыли пароль?", phoneLogin: "Войти по номеру телефона" },
  telegram: {
    title: "Telegram", hint: "Статусы заказов, ответы и коды входа будут приходить в Telegram.", connect: "Подключить Telegram", connected: "Telegram подключён", disconnect: "Отключить", openLink: "Нажмите «Start» в Telegram, затем обновите эту страницу.", unavailable: "Telegram-бот ещё не настроен.",
    staffTitle: "Приложение для сотрудников", staffHint: "Подключив Telegram, вы сможете вести заказы и заявки из приложения в боте для сотрудников."
  },
  tma: {
    loading: "Открываем Tecsecure…", outside: "Эта страница открывается внутри Telegram. Откройте бота и нажмите кнопку «Tecsecure».", failed: "Не удалось войти.", retry: "Повторить",
    welcome: "Добро пожаловать в Tecsecure", welcomeHint: "Откройте аккаунт через Telegram: заказы и обучение будут сохраняться здесь.", create: "Открыть аккаунт", openSite: "Открыть сайт"
  },
  staffApp: {
    title: "Приложение для сотрудников", orders: "Заказы", wallet: "Кошелёк", requests: "Заявки", empty: "Новых задач пока нет.", full: "Полная админ-панель", approve: "Подтвердить", reject: "Отклонить", call: "Позвонить", take: "Взять в работу", proof: "Чек", deposit: "Пополнение", withdrawal: "Вывод", failed: "Не удалось выполнить."
  },
  b2b: {
    who: "Кто покупает?", person: "Физическое лицо", company: "Юридическое лицо", companyName: "Название компании", tin: "ИНН (9 цифр)", tinInvalid: "ИНН должен состоять из 9 цифр.",
    bank: { title: "Банковский перевод", hint: "Получите счёт и оплатите через банк" }, bankOff: "Реквизиты ещё не указаны", companyOnly: "Для юридических лиц",
    online: { title: "Картой онлайн", hint: "Безопасная оплата на странице Payme" }, onlineGo: "Перейти к оплате", nextBank: "Счёт на оплату готов. Оплатите через банк, и после поступления мы подготовим заказ.", nextOnline: "Переходим на страницу оплаты…", invoice: "Открыть счёт на оплату", pay: "Оплатить"
  },
  invoice: {
    title: "Счёт на оплату", number: "Номер", date: "Дата", seller: "Продавец", buyer: "Покупатель", tin: "ИНН", account: "Расчётный счёт", bank: "Банк", mfo: "МФО", address: "Адрес", item: "Наименование", qty: "Кол-во", price: "Цена", sum: "Сумма", total: "Итого", purpose: "Назначение платежа", purposeText: "оплата по заказу", print: "Печать или PDF", note: "Это счёт на оплату. Официальная электронная счёт-фактура оформляется отдельно.", unavailable: "Реквизиты счёта ещё не заполнены."
  },
  requisites: { title: "Юридические реквизиты", hint: "Показываются в счёте для юридических лиц. Когда всё заполнено, включается «Банковский перевод».", name: "Юридическое название компании", tin: "ИНН", address: "Юридический адрес", bank: "Название банка", account: "Расчётный счёт", mfo: "МФО" },
  orderExtra: { method: { BANK_TRANSFER: "Банковский перевод", ONLINE_PAYME: "Payme" }, status: { AWAITING_PAYMENT: "Ожидается оплата", REFUND_DUE: "Нужен возврат" } },
  estimate: {
    eyebrow: "Смета", title: "Рассчитайте проект за минуту", intro: "Укажите несколько цифр об объекте и получите список оборудования. Сохраните результат в PDF или отправьте нам.", tabNetwork: "Сеть и Wi-Fi", tabCctv: "Видеонаблюдение",
    workplaces: "Количество рабочих мест", floors: "Количество этажей", area: "Общая площадь (м²)", users: "Пользователи Wi-Fi", cameras: "Камеры в сети", server: "Есть сервер или NAS", build: "Рассчитать",
    resultTitle: "Предварительный список оборудования", accessPoints: "Точки Wi-Fi", ports: "Сетевые порты", switch24: "Коммутатор PoE на 24 порта", switch48: "Коммутатор PoE на 48 портов", cable: "Кабель Cat6", boxes: "бухт (305 м)", router: "Роутер или firewall", rack: "Объём шкафа", ups: "ИБП", poe: "Мощность PoE", pcs: "шт.",
    preliminary: "Это предварительный расчёт. Стены, кабельные трассы и имеющееся оборудование изменят итоговый список, поэтому точное предложение мы дадим после осмотра объекта.", print: "Сохранить в PDF", send: "Узнать точную цену", dateLabel: "Дата"
  },
  check: {
    eyebrow: "Тест безопасности", title: "Насколько защищена ваша компания?", intro: "10 простых вопросов, 2 минуты. В конце вы увидите оценку и с чего начать. Ответы никуда не отправляются.",
    progress: "Вопрос", next: "Далее", back: "Назад", result: "Ваш результат", levels: { risk: "Высокий риск: защита слабая", partial: "Средний уровень: есть важные пробелы", good: "Хорошо: базовая защита есть" }, adviceTitle: "С чего начать", cta: "Получить бесплатную консультацию", audit: "Образец отчёта об аудите", again: "Пройти заново"
  },
  plans: {
    eyebrow: "IT-поддержка", title: "Ежемесячная IT-поддержка", intro: "Вместо штатного IT-специалиста доверьте нам сеть, компьютеры и безопасность. Чёткий объём услуг каждый месяц.", priceOnRequest: "Цена зависит от объекта", perMonth: "в месяц", choose: "Выбрать и связаться", popular: "Чаще выбирают",
    tiers: [
      { name: "Базовый", fit: "До 10 рабочих мест", features: ["Удалённая помощь в рабочее время", "Мониторинг сети и роутера", "Ежемесячный отчёт о состоянии", "Профилактика раз в год"] },
      { name: "Бизнес", fit: "10–50 рабочих мест", features: ["Удалённая помощь и выезд", "Контроль серверов и резервных копий", "Быстрое время реакции", "Профилактика раз в квартал", "Обновления безопасности"] },
      { name: "Корпоративный", fit: "От 50 мест или несколько филиалов", features: ["Закреплённый инженер", "Мониторинг и оповещения 24/7", "Ежегодный аудит безопасности", "Обучение сотрудников", "План развития"] }
    ],
    how: "Как это работает", steps: ["Изучаем объект и ваши системы", "Письменно согласуем объём и цену", "Подключаем мониторинг и начинаем поддержку"], note: "Сроки реакции и условия указываются в договоре."
  },
  business: {
    eyebrow: "Для компаний", title: "Обучайте своих сотрудников", intro: "Программа для группы по IT и безопасности, составленная под задачи вашей компании.", cta: "Узнать о программе", catalog: "Каталог курсов",
    offers: [
      { title: "Грамотность в безопасности", text: "Для всех сотрудников: фишинг, пароли, защита данных." },
      { title: "Для IT-команды", text: "Практическая программа по сетям, Linux, Windows Server и Active Directory." },
      { title: "Для команды безопасности", text: "Глубокая практика по SOC, реагированию на инциденты, OWASP и firewall." }
    ],
    benefitsTitle: "Что вы получите", benefits: ["Оценку уровня и индивидуальный план", "Лаборатории и экзамены", "Отчёт о результатах каждого сотрудника", "Сертификат, который можно проверить"]
  },
  work: { story: "История проекта", task: "Задача", done: "Что сделано", result: "Результат", client: "Отзыв клиента", location: "Расположение", more: "Посмотреть проект", all: "Все работы", photos: "Фотографии", cta: "Нужен такой проект?", ctaButton: "Оставить заявку", list: "Проекты" },
  workAdmin: { location: "Расположение (например, Ташкент)", task: "Задача: что было нужно клиенту", done: "Что сделано", result: "Результат", clientName: "Имя клиента (необязательно)", clientRole: "Должность", clientQuote: "Отзыв клиента" },
  integrations: { staffBot: "Бот для сотрудников (необязательно)", staffToken: "Токен бота сотрудников", staffUsername: "Имя бота сотрудников", staffSecret: "Секрет вебхука бота сотрудников", staffHint: "Если оставить пустым, сообщения сотрудникам будут идти в основной бот.", shopBot: "Бот для магазинов (продавцов)", shopToken: "Токен бота магазинов", shopUsername: "Имя бота магазинов", shopSecret: "Секрет вебхука бота магазинов", shopHint: "Через этот бот продавцы открывают кабинет и получают уведомления о заказах. Если пусто, им пишет основной бот.",
    gatewayTitle: "Telegram Gateway (коды подтверждения)", gatewayHint: "Код приходит владельцу номера в Telegram от самого Telegram: $0.01 за доставленный код, при недоставке деньги возвращаются. Откройте аккаунт на gateway.telegram.org и вставьте сюда токен из раздела «API». На номера без Telegram код уходит по SMS (Eskiz).", gatewayToken: "API-токен Gateway", gatewayTestPhone: "Номер для проверки (свой — бесплатно)", gatewayTest: "Проверить Gateway", gatewayTestSent: "Код отправлен в ваш Telegram: проверьте чат «Verification Codes».", mailTitle: "Email (Gmail)", mailHint: "С этого ящика отправляются коды входа и восстановления пароля.", mailAddress: "Адрес почты", mailPassword: "Пароль приложения Google (16 символов)", mailPasswordHint: "Обычный пароль Gmail не подойдёт. Включите в аккаунте Google двухэтапную проверку, затем на странице myaccount.google.com/apppasswords создайте пароль приложения «Tecsecure» и вставьте сюда.", mailSender: "Имя отправителя", mailServer: "SMTP-сервер и порт", mailTestTo: "Куда отправить тестовое письмо", mailTest: "Отправить тестовое письмо", mailTestSent: "Тестовое письмо отправлено. Проверьте почту (и папку «Спам»).", smsTitle: "SMS-коды (Eskiz)", smsHint: "Через него уходят коды входа по телефону и восстановления пароля. Укажите email и пароль от кабинета notify.eskiz.uz.", smsEmail: "Email Eskiz", smsPassword: "Пароль Eskiz", smsFrom: "Имя отправителя", smsFromHint: "Имя, одобренное Eskiz. Пока ваше не одобрено, оставьте 4546.", smsTemplates: "Eskiz отправляет только текст, совпадающий с одобренным шаблоном. Отправьте эти два текста в разделе «Шаблоны»; цифры — переменная часть:", smsTestPhone: "Номер для проверки", smsTest: "Отправить тестовое SMS", smsTestSent: "Eskiz принял SMS. Проверьте телефон: если не пришло, шаблон, возможно, ещё не одобрен." },
  analytics: { title: "Статистика", hint: "Яндекс Метрика, чтобы понимать, как используется сайт. Не для рекламы.", none: "Рекламные cookie не используются." },
  errors: { recent: "Ошибки за последние 24 часа" },
  seoFooter: "Популярные услуги"
};

const en: GrowthCopy = {
  code: {
    loginTitle: "Sign in with your phone", loginHint: "We will send a code to your number. No password needed, and an account is created if you do not have one.",
    resetTitle: "Reset your password", resetHint: "Enter your phone number or email and we will send a confirmation code.",
    phone: "Phone number", identifier: "Phone number or email", send: "Send code", sending: "Sending…",
    sent: "If this account exists, a code was sent. Check Telegram, SMS or email.", sentLogin: "Code sent. Check Telegram or SMS.",
    code: "6-digit code", name: "Your name", newPassword: "New password", confirm: "Confirm", resend: "Send the code again", resendIn: "Resend", back: "Back to sign in",
    unavailable: "SMS sign-in is not switched on yet. Use email and password, or connect Telegram in your profile.", done: "Done, signing you in…",
    sentSms: "Code sent by SMS. It arrives within a minute or two.", sentGateway: "Code sent to your Telegram: open the “Verification Codes” chat.", sentTelegram: "Code sent to Telegram: open the Tecsecure bot.", recent: "A code was already sent less than a minute ago. Enter it or wait a little.",
    noChannel: "We could not send a code to this number: the SMS service is not connected yet. Sign in with email and password, or contact us.", sendFailed: "The SMS was not sent. Try again in a minute.",
    smsOff: "SMS is not working yet. Codes only reach accounts with Telegram connected.", sentResetNoSms: "If an account uses this number and has Telegram connected, the code was sent to Telegram. SMS is not working yet.", telegramGet: "Get the code through our Telegram bot", telegramHint: "The bot opens: press “Send my number”. If your Telegram number matches this one, the code arrives in the bot.", openTelegram: "Open Telegram", telegramWaiting: "Send your number in Telegram, then type the code you receive here.", or: "or", sentEmail: "Code sent to your email. Check the Spam folder too.", verifyCode: "Verify code", checking: "Checking…", wrongCode: "Wrong or expired code.", passwordTitle: "Set a new password", passwordHint: "Code confirmed. Now enter the new password twice.", confirmPassword: "Repeat the new password", passwordsDiffer: "The passwords do not match.", savePassword: "Save password", ticketExpired: "Confirmation timed out. Get a new code.", changeNumber: "Different number or email", stepIdentify: "Number", stepIdentifyReset: "Number or email", stepCode: "Code", stepPassword: "New password"
  },
  auth: { forgot: "Forgot your password?", phoneLogin: "Sign in with your phone" },
  telegram: {
    title: "Telegram", hint: "Order updates, replies and sign-in codes arrive in Telegram.", connect: "Connect Telegram", connected: "Telegram connected", disconnect: "Disconnect", openLink: "Press “Start” in Telegram, then refresh this page.", unavailable: "The Telegram bot is not set up yet.",
    staffTitle: "Staff app", staffHint: "Connect Telegram to manage orders and requests from the app in the staff bot."
  },
  tma: {
    loading: "Opening Tecsecure…", outside: "This page opens inside Telegram. Open the bot and press the “Tecsecure” button.", failed: "Could not sign in.", retry: "Try again",
    welcome: "Welcome to Tecsecure", welcomeHint: "Open an account through Telegram: your orders and learning are kept here.", create: "Open an account", openSite: "Open the site"
  },
  staffApp: {
    title: "Staff app", orders: "Orders", wallet: "Wallet", requests: "Requests", empty: "Nothing new right now.", full: "Full admin panel", approve: "Approve", reject: "Reject", call: "Call", take: "Start review", proof: "Receipt", deposit: "Top-up", withdrawal: "Withdrawal", failed: "That did not work."
  },
  b2b: {
    who: "Who is buying?", person: "Individual", company: "Company", companyName: "Company name", tin: "Tax ID (9 digits)", tinInvalid: "The tax ID must be 9 digits.",
    bank: { title: "Bank transfer", hint: "Get an invoice and pay through your bank" }, bankOff: "Bank details are not filled in yet", companyOnly: "For companies",
    online: { title: "Card online", hint: "Secure payment on the Payme page" }, onlineGo: "Continue to payment", nextBank: "Your invoice is ready. Pay through your bank, and we will prepare the order once it arrives.", nextOnline: "Taking you to the payment page…", invoice: "Open the invoice", pay: "Pay now"
  },
  invoice: {
    title: "Payment invoice", number: "Number", date: "Date", seller: "Seller", buyer: "Buyer", tin: "Tax ID", account: "Account number", bank: "Bank", mfo: "MFO", address: "Address", item: "Item", qty: "Qty", price: "Price", sum: "Amount", total: "Total", purpose: "Payment purpose", purposeText: "payment for order", print: "Print or PDF", note: "This is a payment invoice. The official electronic tax invoice is issued separately.", unavailable: "Invoice details are not filled in yet."
  },
  requisites: { title: "Legal details", hint: "Shown on invoices for companies. Once everything is filled in, “Bank transfer” turns on.", name: "Company legal name", tin: "Tax ID", address: "Legal address", bank: "Bank name", account: "Account number", mfo: "MFO" },
  orderExtra: { method: { BANK_TRANSFER: "Bank transfer", ONLINE_PAYME: "Payme" }, status: { AWAITING_PAYMENT: "Awaiting payment", REFUND_DUE: "Refund due" } },
  estimate: {
    eyebrow: "Estimate", title: "Estimate your project in a minute", intro: "Enter a few numbers about your site and get an equipment list. Save it as a PDF or send it to us.", tabNetwork: "Network and Wi-Fi", tabCctv: "CCTV",
    workplaces: "Workplaces", floors: "Floors", area: "Total area (m²)", users: "Wi-Fi users", cameras: "Cameras on the network", server: "We have a server or NAS", build: "Calculate",
    resultTitle: "Preliminary equipment list", accessPoints: "Wi-Fi access points", ports: "Network ports", switch24: "24-port PoE switch", switch48: "48-port PoE switch", cable: "Cat6 cable", boxes: "boxes (305 m)", router: "Router or firewall", rack: "Rack size", ups: "UPS", poe: "PoE power", pcs: "pcs",
    preliminary: "This is a first estimate. Walls, cable routes and existing equipment will change the final list, so we give an exact proposal after seeing the site.", print: "Save as PDF", send: "Ask for an exact price", dateLabel: "Date"
  },
  check: {
    eyebrow: "Security check", title: "How well protected is your company?", intro: "10 simple questions, 2 minutes. You get a score and where to start. Your answers are not sent anywhere.",
    progress: "Question", next: "Next", back: "Back", result: "Your result", levels: { risk: "High risk: protection is weak", partial: "Average: there are important gaps", good: "Good: the basics are in place" }, adviceTitle: "Where to start", cta: "Get a free consultation", audit: "Sample audit report", again: "Take it again"
  },
  plans: {
    eyebrow: "IT support", title: "Monthly IT support", intro: "Instead of hiring a full-time IT person, hand your network, computers and security to us. A clear scope every month.", priceOnRequest: "Price depends on your site", perMonth: "per month", choose: "Choose and contact us", popular: "Most chosen",
    tiers: [
      { name: "Starter", fit: "Up to 10 workplaces", features: ["Remote help in working hours", "Network and router monitoring", "Monthly status report", "Maintenance once a year"] },
      { name: "Business", fit: "10–50 workplaces", features: ["Remote and on-site help", "Server and backup oversight", "Fast response time", "Quarterly maintenance", "Security updates"] },
      { name: "Corporate", fit: "50+ workplaces or several branches", features: ["A dedicated engineer", "24/7 monitoring and alerts", "Yearly security audit", "Staff training", "A development plan"] }
    ],
    how: "How it works", steps: ["We review your site and systems", "We agree scope and price in writing", "Monitoring goes live and support begins"], note: "Response times and terms are set out in the contract."
  },
  business: {
    eyebrow: "For companies", title: "Train your team", intro: "A group programme in IT and security, built around your company’s work.", cta: "Ask about the programme", catalog: "Course catalog",
    offers: [
      { title: "Security awareness", text: "For all staff: phishing, passwords and protecting data." },
      { title: "For the IT team", text: "A hands-on programme on networks, Linux, Windows Server and Active Directory." },
      { title: "For the security team", text: "In-depth practice in SOC, incident response, OWASP and firewalls." }
    ],
    benefitsTitle: "What you get", benefits: ["A level check and a personal plan", "Labs and exams", "A report on each person’s results", "A certificate anyone can verify"]
  },
  work: { story: "Project story", task: "The task", done: "What we did", result: "The result", client: "Client’s words", location: "Location", more: "View project", all: "All projects", photos: "Photos", cta: "Need a project like this?", ctaButton: "Send a request", list: "Projects" },
  workAdmin: { location: "Location (for example, Tashkent)", task: "Task: what the client needed", done: "What we did", result: "Result", clientName: "Client name (optional)", clientRole: "Role", clientQuote: "Client’s words" },
  integrations: { staffBot: "Staff bot (optional)", staffToken: "Staff bot token", staffUsername: "Staff bot username", staffSecret: "Staff bot webhook secret", staffHint: "If left empty, staff messages also go to the main bot.", shopBot: "Shop bot (for sellers)", shopToken: "Shop bot token", shopUsername: "Shop bot username", shopSecret: "Shop bot webhook secret", shopHint: "Sellers open their cabinet and get order alerts through this bot. If left empty, the main bot messages them.",
    gatewayTitle: "Telegram Gateway (verification codes)", gatewayHint: "The code reaches the number owner’s Telegram from Telegram itself: $0.01 per delivered code, refunded if not delivered. Open an account at gateway.telegram.org and paste the token from its “API” section here. Numbers without Telegram get the code by SMS (Eskiz).", gatewayToken: "Gateway API token", gatewayTestPhone: "Test number (your own is free)", gatewayTest: "Test Gateway", gatewayTestSent: "Code sent to your Telegram: check the “Verification Codes” chat.", mailTitle: "Email (Gmail)", mailHint: "Sign-in and password reset codes are sent from this mailbox.", mailAddress: "Mailbox address", mailPassword: "Google app password (16 characters)", mailPasswordHint: "The normal Gmail password will not work. Turn on 2-Step Verification in the Google account, then create an app password named “Tecsecure” at myaccount.google.com/apppasswords and paste it here.", mailSender: "Sender name", mailServer: "SMTP server and port", mailTestTo: "Send the test to", mailTest: "Send a test email", mailTestSent: "Test email sent. Check the inbox (and Spam).", smsTitle: "SMS codes (Eskiz)", smsHint: "Phone sign-in and password reset codes go out through it. Enter the email and password of your notify.eskiz.uz account.", smsEmail: "Eskiz email", smsPassword: "Eskiz password", smsFrom: "Sender name", smsFromHint: "The name Eskiz approved. Keep 4546 until yours is approved.", smsTemplates: "Eskiz only sends text that matches an approved template. Submit these two texts under Templates in the cabinet; the digits are the variable part:", smsTestPhone: "Phone number for the test", smsTest: "Send a test SMS", smsTestSent: "Eskiz accepted the SMS. Check the phone: if nothing arrives, the template may not be approved yet." },
  analytics: { title: "Statistics", hint: "Yandex Metrika, to understand how the site is used. Not used for advertising.", none: "We do not use advertising cookies." },
  errors: { recent: "Errors in the last 24 hours" },
  seoFooter: "Popular services"
};

export const growthCopy: Record<Locale, GrowthCopy> = { uz, ru, en };

/** Links from the home footer, so people and crawlers can reach the pages written for one job. */
export const seoFooterLinks: Record<Locale, { href: string; title: string }[]> = {
  uz: [
    { href: "/xizmat/toshkentda-videokuzatuv-ornatish", title: "Videokuzatuv o‘rnatish" },
    { href: "/xizmat/ofis-tarmogi-va-wifi-ornatish", title: "Ofis tarmog‘i va Wi-Fi" },
    { href: "/xizmat/kiberxavfsizlik-auditi", title: "Kiberxavfsizlik auditi" },
    { href: "/xizmat/kompaniyalar-uchun-it-yordam", title: "Oylik IT yordam" }
  ],
  ru: [
    { href: "/ru/uslugi/ustanovka-videonablyudeniya-tashkent", title: "Установка видеонаблюдения" },
    { href: "/ru/uslugi/lokalnaya-set-i-wifi-dlya-ofisa", title: "Локальная сеть и Wi-Fi" },
    { href: "/ru/uslugi/audit-kiberbezopasnosti", title: "Аудит кибербезопасности" },
    { href: "/ru/uslugi/it-podderzhka-dlya-kompanii", title: "Ежемесячная IT-поддержка" }
  ],
  en: []
};
