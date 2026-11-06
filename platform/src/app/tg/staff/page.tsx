import { TelegramEntry } from "@/components/telegram-app";

export const metadata = { title: "Tecsecure", robots: { index: false, follow: false } };

export default function TelegramStaffEntry() {
  return <TelegramEntry app="staff" />;
}
