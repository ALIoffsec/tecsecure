import { InstallView } from "@/components/static-pages";
import { pageMetadata } from "@/lib/structured-data";

export const metadata = pageMetadata({
  path: "/install",
  title: "Tecsecure ilovasini o‘rnatish",
  description: "Tecsecure’ni telefon yoki kompyuterga ilova sifatida o‘rnating: Android, iPhone va kompyuter uchun qisqa yo‘riqnoma."
});

export default function InstallPage() {
  return <InstallView />;
}
