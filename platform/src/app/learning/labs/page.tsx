import { permanentRedirect } from "next/navigation";

/** The labs list moved under practice for good; a 308 tells search engines to move the old address too. */
export default function LearningLabsPage() {
  permanentRedirect("/learning/practice/labs");
}
