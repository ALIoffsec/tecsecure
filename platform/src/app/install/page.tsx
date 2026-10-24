import Link from "next/link";
import { AppInstallButton } from "@/components/app-install-button";

export default function InstallPage() {
  return (
    <div className="container page-shell">
      <section className="panel-card app-install-panel" id="install-help">
        <span className="eyebrow">TECSECURE · PWA</span>
        <h1>Tecsecure ilovasini o‘rnating</h1>
        <p className="muted">Saytni telefon yoki kompyuteringizga ilova sifatida qo‘shing. O‘rnatish uchun brauzeringiz HTTPS va PWA o‘rnatishni qo‘llashi kerak.</p>
        <AppInstallButton />
        <div className="app-install-instructions">
          <div><strong>Android / Chrome</strong><p className="muted">Yuqoridagi tugmani bosing yoki brauzer menyusidan “Ilovani o‘rnatish” / “Bosh ekranga qo‘shish” bandini tanlang.</p></div>
          <div><strong>iPhone / iPad</strong><p className="muted">Safari’da “Ulashish” tugmasini bosing va “Bosh ekranga qo‘shish”ni tanlang.</p></div>
          <div><strong>Kompyuter</strong><p className="muted">Chrome yoki Edge manzil satridagi o‘rnatish belgisini bosing.</p></div>
        </div>
        <Link className="button ghost" href="/">Bosh sahifaga qaytish</Link>
      </section>
    </div>
  );
}
