import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-origin";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Vizitka | Tecsecure" }, robots: { index: false, follow: false } };

/** A 90×50 mm visit card for the shop, ready to print: the QR leads buyers to the shop's page. */
export default async function ShopVisitCard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await prisma.shop.findFirst({ where: { slug, status: "ACTIVE" }, select: { slug: true, name: true, phone: true, telegram: true, instagram: true, city: true, logoMediaId: true } });
  if (!shop) notFound();
  const link = `${siteOrigin().replace(/^https?:\/\//, "")}/s/${shop.slug}`;
  return <div className="container page-shell visit-card-page">
    <div className="visit-card-tools">
      <h1 className="page-title">Vizitka</h1>
      <p className="muted">90×50 mm. Chop etishda “Haqiqiy o‘lcham” (100%) ni tanlang. QR do‘kon sahifangizni ochadi, u orqali kelgan mijozlardan komissiya kamroq olinadi.</p>
      <div className="journey-actions"><PrintButton /><a className="button secondary" href={`/api/shops/${shop.slug}/qr?size=1600`} download={`tecsecure-${shop.slug}-qr.png`}>QR rasmini yuklab olish</a></div>
    </div>
    <div className="visit-card-sheet">
      {Array.from({ length: 2 }, (_, index) => <div className="visit-card" key={index}>
        <div className="visit-card-info">
          {shop.logoMediaId ? <img className="visit-card-logo" src={`/api/media/${shop.logoMediaId}`} alt="" /> : null}
          <strong className="visit-card-name">{shop.name}</strong>
          <span>{shop.phone}</span>
          {shop.telegram && <span>t.me/{shop.telegram}</span>}
          {shop.instagram && <span>@{shop.instagram}</span>}
          <span className="visit-card-link">{link}</span>
        </div>
        <div className="visit-card-qr">
          <img src={`/api/shops/${shop.slug}/qr?size=600`} alt={`QR: ${link}`} />
          <small>Tecsecure’da xarid qiling</small>
        </div>
      </div>)}
    </div>
  </div>;
}
