import { TelegramEntry } from "@/components/telegram-app";
import { SellerApp } from "@/components/seller/seller-app";
import { getCurrentUser } from "@/lib/auth";
import { loadShop } from "@/lib/shop-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tecsecure · Do‘kon kabineti", robots: { index: false, follow: false } };

/** The shop bot's own app. Without a session it signs in from Telegram first; ?open= lands on one screen. */
export default async function TelegramShopApp({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <TelegramEntry app="shop" />;
  const staff = user.role !== "CUSTOMER";
  const open = (await searchParams).open;
  return <SellerApp shop={staff ? null : await loadShop(user.id)} staff={staff} variant="telegram" initialOpen={typeof open === "string" ? open.slice(0, 80) : null} />;
}
