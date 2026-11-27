import { permanentRedirect } from "next/navigation";

/** "My learning" is now the learning home itself. */
export default function LearningDashboardPage() {
  permanentRedirect("/learning");
}
