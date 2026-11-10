import { TelegramEntry } from "@/components/telegram-app";
import { StaffMiniApp } from "@/components/tma-staff";
import { getStaffAppUser } from "@/lib/auth";
import { loadStaffDesk } from "@/lib/staff-desk";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tecsecure · Ish oynasi", robots: { index: false, follow: false } };

/** The staff bot's own app. Without a live staff session it shows the Telegram sign-in, which reloads into the desk. */
export default async function TelegramStaffApp() {
  const actor = await getStaffAppUser();
  if (!actor) return <TelegramEntry app="staff" />;
  return <StaffMiniApp desk={await loadStaffDesk(actor)} />;
}
