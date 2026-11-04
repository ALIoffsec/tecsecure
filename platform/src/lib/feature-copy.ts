import type { Locale } from "./messages";

type FeatureCopy = {
  welcome: string; join: string; accountNote: string; staffNote: string;
  walletDetails: string; walletFront: string; walletNote: string;
  loading: string; loadingHint: string; notFound: string; notFoundHint: string;
  home: string; search: string;
  introTitle: string; skipIntro: string;
};

export const featureCopy: Record<Locale, FeatureCopy> = {
  uz: {
    welcome: "Yana xush kelibsiz.", join: "Imkoniyatlar shu yerdan boshlanadi.",
    accountNote: "Buyurtmalar, amaliy ta'lim va shaxsiy hamyon — bitta hisobda.",
    staffNote: "Jamoa uchun xizmatlar, loyihalar va boshqaruv vositalari.",
    walletDetails: "Mukofotlarni ko'rish", walletFront: "Balansga qaytish",
    walletNote: "Tecsecure ichki hamyoni. Bank kartasi emas.",
    loading: "Ma'lumotlar yuklanmoqda", loadingHint: "Sahifa tayyor bo'lishi bilan ochiladi.",
    notFound: "Bu sahifani topa olmadik", notFoundHint: "Havola eskirgan yoki manzil noto'g'ri bo'lishi mumkin.",
    home: "Bosh sahifaga", search: "Saytdan qidirish",
    introTitle: "Tecsecure — saytga kirish animatsiyasi", skipIntro: "Saytga o'tish"
  },
  ru: {
    welcome: "С возвращением.", join: "Возможности начинаются здесь.",
    accountNote: "Заказы, практическое обучение и кошелёк — в одном аккаунте.",
    staffNote: "Услуги, проекты и инструменты управления для команды.",
    walletDetails: "Посмотреть награды", walletFront: "Вернуться к балансу",
    walletNote: "Внутренний кошелёк Tecsecure. Не банковская карта.",
    loading: "Загрузка данных", loadingHint: "Страница откроется, как только будет готова.",
    notFound: "Страница не найдена", notFoundHint: "Возможно, ссылка устарела или адрес указан неверно.",
    home: "На главную", search: "Поиск по сайту",
    introTitle: "Tecsecure — вступительная анимация", skipIntro: "Перейти на сайт"
  },
  en: {
    welcome: "Welcome back.", join: "Your next step starts here.",
    accountNote: "Orders, practical learning and your wallet — in one account.",
    staffNote: "Services, projects and management tools for the team.",
    walletDetails: "View rewards", walletFront: "Back to balance",
    walletNote: "Tecsecure internal wallet. Not a bank card.",
    loading: "Loading your content", loadingHint: "The page will open as soon as it is ready.",
    notFound: "We couldn't find this page", notFoundHint: "The link may have expired or the address may be incorrect.",
    home: "Back to home", search: "Search the site",
    introTitle: "Tecsecure — opening animation", skipIntro: "Enter the site"
  }
};
