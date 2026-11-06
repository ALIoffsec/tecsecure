import type { Locale } from "./messages";

type FeatureCopy = {
  welcome: string; join: string; accountNote: string; staffNote: string;
  walletDetails: string; walletFront: string; walletNote: string;
  notFound: string; notFoundHint: string;
  home: string; search: string;
  introTitle: string;
  workNext: string; workPrev: string; workOpen: string;
  footerExplore: string; footerHelp: string; footerCompany: string;
};

export const featureCopy: Record<Locale, FeatureCopy> = {
  uz: {
    welcome: "Yana xush kelibsiz.", join: "Imkoniyatlar shu yerdan boshlanadi.",
    accountNote: "Buyurtmalar, amaliy ta'lim va shaxsiy hamyon — bitta hisobda.",
    staffNote: "Jamoa uchun xizmatlar, loyihalar va boshqaruv vositalari.",
    walletDetails: "Mukofotlarni ko'rish", walletFront: "Balansga qaytish",
    walletNote: "Tecsecure ichki hamyoni. Bank kartasi emas.",
    notFound: "Bu sahifani topa olmadik", notFoundHint: "Havola eskirgan yoki manzil noto'g'ri bo'lishi mumkin.",
    home: "Bosh sahifaga", search: "Saytdan qidirish",
    introTitle: "Tecsecure — saytga kirish animatsiyasi",
    workNext: "Keyingi ish", workPrev: "Oldingi ish", workOpen: "Kattalashtirish",
    footerExplore: "Yo'nalishlar", footerHelp: "Yordam", footerCompany: "Kompaniya"
  },
  ru: {
    welcome: "С возвращением.", join: "Возможности начинаются здесь.",
    accountNote: "Заказы, практическое обучение и кошелёк — в одном аккаунте.",
    staffNote: "Услуги, проекты и инструменты управления для команды.",
    walletDetails: "Посмотреть награды", walletFront: "Вернуться к балансу",
    walletNote: "Внутренний кошелёк Tecsecure. Не банковская карта.",
    notFound: "Страница не найдена", notFoundHint: "Возможно, ссылка устарела или адрес указан неверно.",
    home: "На главную", search: "Поиск по сайту",
    introTitle: "Tecsecure — вступительная анимация",
    workNext: "Следующая работа", workPrev: "Предыдущая работа", workOpen: "Увеличить",
    footerExplore: "Направления", footerHelp: "Помощь", footerCompany: "Компания"
  },
  en: {
    welcome: "Welcome back.", join: "Your next step starts here.",
    accountNote: "Orders, practical learning and your wallet — in one account.",
    staffNote: "Services, projects and management tools for the team.",
    walletDetails: "View rewards", walletFront: "Back to balance",
    walletNote: "Tecsecure internal wallet. Not a bank card.",
    notFound: "We couldn't find this page", notFoundHint: "The link may have expired or the address may be incorrect.",
    home: "Back to home", search: "Search the site",
    introTitle: "Tecsecure — opening animation",
    workNext: "Next project", workPrev: "Previous project", workOpen: "View larger",
    footerExplore: "Explore", footerHelp: "Help", footerCompany: "Company"
  }
};
