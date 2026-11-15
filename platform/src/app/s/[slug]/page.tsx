import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loadProductCards } from "@/lib/product-listing";
import { ProductCard } from "@/components/product-card";
import { Localized } from "@/components/localized";
import { ReferralMark } from "@/components/referral-mark";
import { regionNames, type RegionCode } from "@/lib/delivery";
import { perLocale } from "@/lib/product-i18n";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function activeShop(slug: string) {
  return prisma.shop.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, slug: true, name: true, description: true, city: true, region: true, phone: true, telegram: true, instagram: true, logoMediaId: true, approvedAt: true }
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shop = await activeShop((await params).slug);
  if (!shop) return { title: "Do‘kon topilmadi | Tecsecure" };
  return {
    title: `${shop.name} — do‘kon | Tecsecure`,
    description: shop.description?.slice(0, 160) || `${shop.name} mahsulotlari Tecsecure’da: to‘lov Tecsecure orqali, do‘kon o‘zi yetkazadi.`,
    alternates: { canonical: `/s/${shop.slug}` }
  };
}

/** A shop's own page: who it is and everything it sells. Its QR code and visit card lead here. */
export default async function ShopStorefront({ params }: Props) {
  const shop = await activeShop((await params).slug);
  if (!shop) notFound();
  const [products, total, sold] = await Promise.all([
    loadProductCards({ shopId: shop.id, status: "PUBLISHED" }, "new", 0, 60),
    prisma.product.count({ where: { shopId: shop.id, status: "PUBLISHED" } }),
    prisma.shopOrder.count({ where: { shopId: shop.id, status: "DELIVERED" } })
  ]);
  const regionName = shop.region ? perLocale(locale => regionNames[locale][shop.region as RegionCode] ?? "") : null;
  return <div className="container page-shell storefront-page">
    <ReferralMark slug={shop.slug} />
    <nav className="shop-crumbs" aria-label="Breadcrumb">
      <Link href="/products"><Localized values={{ uz: "Katalog", ru: "Каталог", en: "Catalogue" }} /></Link><span>/</span>
      <span aria-current="page">{shop.name}</span>
    </nav>
    <section className="panel-card storefront-head">
      <span className="storefront-logo" aria-hidden="true">{shop.logoMediaId ? <img src={`/api/media/${shop.logoMediaId}`} alt="" /> : shop.name.slice(0, 1).toUpperCase()}</span>
      <div className="storefront-about">
        <span className="eyebrow"><Localized values={{ uz: "Tecsecure do‘koni", ru: "Магазин на Tecsecure", en: "Shop on Tecsecure" }} /></span>
        <h1 className="page-title">{shop.name}</h1>
        <p className="muted">
          {shop.city}{shop.city && regionName ? ", " : ""}{regionName ? <Localized values={regionName} /> : null}
          {" · "}<Localized values={{ uz: `${total} ta mahsulot`, ru: `${total} товаров`, en: `${total} products` }} />
          {sold > 0 && <>{" · "}<Localized values={{ uz: `${sold} ta yetkazilgan buyurtma`, ru: `${sold} доставленных заказов`, en: `${sold} orders delivered` }} /></>}
        </p>
        {shop.description && <p className="storefront-text">{shop.description}</p>}
        <div className="journey-actions">
          {shop.telegram && <a className="button secondary" href={`https://t.me/${shop.telegram}`} target="_blank" rel="noreferrer">Telegram</a>}
          {shop.instagram && <a className="button secondary" href={`https://instagram.com/${shop.instagram}`} target="_blank" rel="noreferrer">Instagram</a>}
        </div>
        <p className="small muted"><Localized values={{ uz: "To‘lov Tecsecure orqali o‘tadi va do‘kon buyurtmani jo‘natib, siz olganingizdan keyingina unga o‘tkaziladi.", ru: "Оплата проходит через Tecsecure и переводится магазину только после того, как вы получили заказ.", en: "Payment goes through Tecsecure and reaches the shop only after you receive the order." }} /></p>
      </div>
    </section>
    {products.length > 0
      ? <div className="shop-grid storefront-grid">{products.map(({ assets, ...product }) => <ProductCard key={product.id} product={product} assets={assets} />)}</div>
      : <div className="empty-state"><Localized values={{ uz: "Do‘konda hozircha sotuvdagi mahsulot yo‘q.", ru: "В магазине пока нет товаров в продаже.", en: "The shop has no products on sale yet." }} /></div>}
  </div>;
}
