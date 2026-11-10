import { TelegramEntry } from "@/components/telegram-app";
import { ShopMiniApp } from "@/components/tma-shop";
import { getCurrentUser } from "@/lib/auth";
import { loadShop } from "@/lib/shop-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tecsecure · Do‘kon kabineti", robots: { index: false, follow: false } };

/** The shop bot's own app: the owner's shop only. Without a session it shows the Telegram sign-in first. */
export default async function TelegramShopApp() {
  const user = await getCurrentUser();
  if (!user) return <TelegramEntry app="shop" />;
  const staff = user.role !== "CUSTOMER";
  return <ShopMiniApp shop={staff ? null : await loadShop(user.id)} staff={staff} />;
}
