import { TelegramEntry } from "@/components/telegram-app";

export const metadata = { title: "Tecsecure do‘konlar", robots: { index: false, follow: false } };

export default function TelegramShopEntry() {
  return <TelegramEntry app="shop" />;
}
