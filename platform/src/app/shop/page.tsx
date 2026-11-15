import { SellerApp } from "@/components/seller/seller-app";
import { requireUser } from "@/lib/auth";
import { loadShop } from "@/lib/shop-server";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Do‘kon kabineti | Tecsecure" }, robots: { index: false, follow: false } };

/** The same seller app as in the shop bot, opened in a browser: its own screen, without the site's menus. */
export default async function ShopCabinetPage({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const user = await requireUser("/shop");
  const staff = user.role !== "CUSTOMER";
  const open = (await searchParams).open;
  return <SellerApp shop={staff ? null : await loadShop(user.id)} staff={staff} variant="web" initialOpen={typeof open === "string" ? open.slice(0, 80) : null} />;
}
