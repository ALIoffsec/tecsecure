import type { Locale } from "./messages";

type Text = Record<Locale, string>;
export type SecurityQuestion = { id: string; question: Text; options: [Text, Text, Text]; advice: Text };

const yesPartNo = (yes: Text, part: Text, no: Text): [Text, Text, Text] => [no, part, yes];

export const securityQuestions: SecurityQuestion[] = [
  { id: "backup", question: { uz: "Muhim ma’lumotlaringizning zaxira nusxasi bormi va uni tiklab ko‘rganmisiz?", ru: "Есть ли резервные копии важных данных и проверяли ли вы их восстановление?", en: "Do you back up important data, and have you tested restoring it?" },
    options: yesPartNo({ uz: "Ha, tiklashni sinaganmiz", ru: "Да, восстановление проверено", en: "Yes, and we tested restoring" }, { uz: "Nusxa bor, lekin sinamaganmiz", ru: "Копии есть, но не проверяли", en: "Copies exist but are untested" }, { uz: "Yo‘q", ru: "Нет", en: "No" }),
    advice: { uz: "3-2-1 qoidasi bo‘yicha zaxira qiling va har chorakda tiklashni sinang.", ru: "Делайте копии по правилу 3-2-1 и раз в квартал проверяйте восстановление.", en: "Back up using the 3-2-1 rule and test a restore every quarter." } },
  { id: "mfa", question: { uz: "Pochta va muhim xizmatlarda ikki bosqichli kirish yoqilganmi?", ru: "Включена ли двухфакторная защита для почты и важных сервисов?", en: "Is two-step sign-in on for email and key services?" },
    options: yesPartNo({ uz: "Ha, hamma uchun", ru: "Да, у всех", en: "Yes, for everyone" }, { uz: "Faqat ayrimlarda", ru: "Только у некоторых", en: "Only for some" }, { uz: "Yo‘q", ru: "Нет", en: "No" }),
    advice: { uz: "Avval pochta va administrator hisoblarida ikki bosqichli kirishni yoqing.", ru: "Сначала включите двухфакторную защиту для почты и учётных записей администраторов.", en: "Start by turning on two-step sign-in for email and admin accounts." } },
  { id: "passwords", question: { uz: "Xodimlar umumiy yoki oddiy parollardan foydalanadimi?", ru: "Используют ли сотрудники общие или простые пароли?", en: "Do staff use shared or simple passwords?" },
    options: yesPartNo({ uz: "Yo‘q, parol menejeri bor", ru: "Нет, есть менеджер паролей", en: "No, we use a password manager" }, { uz: "Ba’zan", ru: "Иногда", en: "Sometimes" }, { uz: "Ha", ru: "Да", en: "Yes" }),
    advice: { uz: "Parol menejeri joriy qiling va umumiy hisoblardan voz keching.", ru: "Внедрите менеджер паролей и откажитесь от общих учётных записей.", en: "Introduce a password manager and retire shared accounts." } },
  { id: "updates", question: { uz: "Kompyuter, server va routerlar muntazam yangilanadimi?", ru: "Регулярно ли обновляются компьютеры, серверы и роутеры?", en: "Are computers, servers and routers updated regularly?" },
    options: yesPartNo({ uz: "Ha, reja bo‘yicha", ru: "Да, по плану", en: "Yes, on a schedule" }, { uz: "Vaqti-vaqti bilan", ru: "Время от времени", en: "Now and then" }, { uz: "Deyarli yo‘q", ru: "Почти нет", en: "Hardly ever" }),
    advice: { uz: "Yangilanish jadvali tuzing, routerlarni ham unutmang: ular ko‘pincha e’tibordan chetda qoladi.", ru: "Составьте график обновлений и не забудьте про роутеры: о них часто забывают.", en: "Set an update schedule and include routers, which are often forgotten." } },
  { id: "wifi", question: { uz: "Mehmonlar uchun Wi-Fi ish tarmog‘idan ajratilganmi?", ru: "Отделён ли гостевой Wi-Fi от рабочей сети?", en: "Is guest Wi-Fi separated from your work network?" },
    options: yesPartNo({ uz: "Ha, alohida", ru: "Да, отдельно", en: "Yes, separate" }, { uz: "Bilmayman", ru: "Не знаю", en: "Not sure" }, { uz: "Yo‘q, bitta tarmoq", ru: "Нет, одна сеть", en: "No, one network" }),
    advice: { uz: "Mehmon va ish tarmog‘ini VLAN bilan ajrating, shunda mehmon qurilmasi ichki tizimga yetmaydi.", ru: "Разделите гостевую и рабочую сети через VLAN, чтобы устройства гостей не видели внутренние системы.", en: "Separate guest and work networks with a VLAN so guest devices cannot reach internal systems." } },
  { id: "cameras", question: { uz: "Kamera va NVR internetdan to‘g‘ridan-to‘g‘ri ochiq emasmi, zavod paroli o‘zgartirilganmi?", ru: "Камеры и NVR не открыты напрямую в интернет, заводской пароль изменён?", en: "Are cameras and NVRs closed to the internet, with factory passwords changed?" },
    options: yesPartNo({ uz: "Ha, yopiq va parol yangi", ru: "Да, закрыты, пароль новый", en: "Yes, closed with new passwords" }, { uz: "Aniq bilmayman", ru: "Точно не знаю", en: "Not sure" }, { uz: "Yo‘q yoki kamera bor-u, tekshirilmagan", ru: "Нет или не проверяли", en: "No, or never checked" }),
    advice: { uz: "Zavod parollarini almashtiring va masofaviy ko‘rishni faqat VPN orqali qiling.", ru: "Смените заводские пароли и давайте удалённый доступ только через VPN.", en: "Change factory passwords and allow remote viewing only through a VPN." } },
  { id: "access", question: { uz: "Ishdan ketgan xodimning kirish huquqi darhol o‘chiriladimi?", ru: "Сразу ли отключается доступ уволившегося сотрудника?", en: "Is a departing employee’s access removed right away?" },
    options: yesPartNo({ uz: "Ha, shu kuniyoq", ru: "Да, в тот же день", en: "Yes, the same day" }, { uz: "Ba’zan kechikadi", ru: "Иногда с задержкой", en: "Sometimes late" }, { uz: "Tartib yo‘q", ru: "Порядка нет", en: "There is no process" }),
    advice: { uz: "Ishga kirish va ketish uchun kirish huquqlari ro‘yxatini yuriting.", ru: "Ведите список доступов при приёме и увольнении сотрудников.", en: "Keep an access checklist for people joining and leaving." } },
  { id: "phishing", question: { uz: "Xodimlar soxta xat va havolalarni taniy oladimi?", ru: "Умеют ли сотрудники распознавать фишинговые письма и ссылки?", en: "Can staff recognise phishing emails and links?" },
    options: yesPartNo({ uz: "Ha, o‘qitilgan", ru: "Да, обучены", en: "Yes, they are trained" }, { uz: "Qisman", ru: "Частично", en: "Partly" }, { uz: "Yo‘q", ru: "Нет", en: "No" }),
    advice: { uz: "Qisqa o‘quv o‘tkazing: ko‘p hujumlar aynan soxta xatdan boshlanadi.", ru: "Проведите короткое обучение: многие атаки начинаются именно с поддельного письма.", en: "Run a short training: many attacks begin with a fake email." } },
  { id: "firewall", question: { uz: "Tarmoqda qoidalari sozlangan firewall bormi?", ru: "Есть ли в сети межсетевой экран с настроенными правилами?", en: "Does your network have a firewall with configured rules?" },
    options: yesPartNo({ uz: "Ha, qoidalar ko‘rib chiqiladi", ru: "Да, правила пересматриваются", en: "Yes, and the rules are reviewed" }, { uz: "Bor, lekin tekshirilmagan", ru: "Есть, но не проверялся", en: "Yes, but never reviewed" }, { uz: "Yo‘q yoki bilmayman", ru: "Нет или не знаю", en: "No, or not sure" }),
    advice: { uz: "Ortiqcha ochiq portlarni yoping va qoidalarni yiliga kamida bir marta ko‘rib chiqing.", ru: "Закройте лишние порты и пересматривайте правила хотя бы раз в год.", en: "Close unneeded ports and review the rules at least once a year." } },
  { id: "incident", question: { uz: "Kiberhujum bo‘lsa, kim nima qilishini bilasizmi?", ru: "Знаете ли вы, кто и что делает при кибератаке?", en: "Do you know who does what if you are attacked?" },
    options: yesPartNo({ uz: "Ha, yozma reja bor", ru: "Да, есть письменный план", en: "Yes, we have a written plan" }, { uz: "Og‘zaki kelishilgan", ru: "Устная договорённость", en: "Agreed verbally" }, { uz: "Yo‘q", ru: "Нет", en: "No" }),
    advice: { uz: "Bir sahifalik reja yozing: kimga qo‘ng‘iroq qilinadi, nima uziladi, qaysi nusxadan tiklanadi.", ru: "Напишите план на одну страницу: кому звонить, что отключать, из какой копии восстанавливать.", en: "Write a one-page plan: who to call, what to disconnect, which backup to restore." } }
];

export type SecurityResult = { percent: number; level: "risk" | "partial" | "good"; weak: SecurityQuestion[] };

/** Answers are 0 (weak), 1 (partial) or 2 (strong). Advice is ordered by the order of the questions. */
export function scoreSecurityCheck(answers: Record<string, number>): SecurityResult {
  const total = securityQuestions.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
  const percent = Math.round(total / (securityQuestions.length * 2) * 100);
  return {
    percent,
    level: percent >= 80 ? "good" : percent >= 50 ? "partial" : "risk",
    weak: securityQuestions.filter(question => (answers[question.id] ?? 0) < 2)
  };
}
