import { LegalDocument } from "@/components/legal-documents";
import { pageMetadata } from "@/lib/structured-data";

export const metadata = pageMetadata({
  path: "/privacy",
  title: "Maxfiylik siyosati",
  description: "Tecsecure saytida qanday shaxsiy ma’lumotlar olinadi, nima uchun ishlatiladi, qancha saqlanadi va ularni tuzatish yoki o‘chirishni qanday so‘rash mumkin."
});

export default function PrivacyPage() {
  return <LegalDocument kind="privacy" />;
}
