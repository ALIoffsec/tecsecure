import { LearningDashboard } from "@/components/learning-dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function LearningDashboardPage() {
  const user = await getCurrentUser();
  const nickname = user?.name.trim() || user?.email.split("@")[0] || null;
  return <LearningDashboard nickname={nickname} />;
}
