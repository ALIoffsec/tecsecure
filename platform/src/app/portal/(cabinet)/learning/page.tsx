import { permanentRedirect } from "next/navigation";

/** "My learning" moved to the learning home. */
export default function CabinetLearningPage() {
  permanentRedirect("/learning");
}
