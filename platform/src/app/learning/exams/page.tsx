import { permanentRedirect } from "next/navigation";

/** Exams and the certificates they give now live together. */
export default function LearningExamsPage() {
  permanentRedirect("/learning/certifications");
}
