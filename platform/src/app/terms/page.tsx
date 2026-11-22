import { LegalDocument } from "@/components/legal-documents";
import { pageMetadata } from "@/lib/structured-data";

export const metadata = pageMetadata({
  path: "/terms",
  title: "Foydalanish shartlari",
  description: "Tecsecure sayti, akkaunt, buyurtmalar, o‘quv materiallari va xizmatlardan foydalanish qoidalari."
});

export default function TermsPage() {
  return <LegalDocument kind="terms" />;
}
