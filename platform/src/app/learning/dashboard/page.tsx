import { redirect } from "next/navigation";
import { LearningDashboard } from "@/components/learning-dashboard";
import { getCurrentUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/structured-data";

// Personal or sign-in page: reachable, but kept out of search results.
export const metadata = { ...pageMetadata({
    path: "/learning/dashboard",
    title: "O‘quv kabineti",
    description: "Kurslar bo‘yicha shaxsiy natijalar va davom ettirish."
  }), robots: { index: false, follow: true } };

export default async function LearningDashboardPage() {
  const user = await getCurrentUser();
  // A signed-in learner has one learning page, in the cabinet, read from the server.
  if (user && user.role === "CUSTOMER") redirect("/portal/learning");
  const nickname = user?.name.trim() || user?.email.split("@")[0] || null;
  return <LearningDashboard nickname={nickname} />;
}
