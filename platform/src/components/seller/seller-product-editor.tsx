"use client";

import { useEffect, useRef, useState } from "react";
import { useSitePreferences } from "../site-preferences";
import { BottomActions, haptic, useBackButton } from "../tma-kit";
import { sellerAppCopy } from "@/lib/seller-app-copy";
import { MAX_PRODUCT_PHOTOS } from "@/lib/marketplace";
import { sellerApi, toMajor, toMinor, uploadShopPhoto, useSellerData } from "./seller-api";
import { SellerSkeleton } from "./seller-home";
import type { SellerProduct } from "./seller-types";
import type { SellerNav } from "./seller-app";

type Category = { id: string; names: { uz: string; ru: string; en: string } };
type Spec = { key: string; value: string };
type Draft = {
  media: string[]; name: string; categoryId: string; brand: string; model: string; sku: string; price: string; currency: "UZS" | "USD"; stock: string;
  warranty: string; description: string; specs: Spec[]; ruName: string; ruDescription: string; enName: string; enDescription: string;
};

const emptyDraft: Draft = { media: [], name: "", categoryId: "", brand: "", model: "", sku: "", price: "", currency: "UZS", stock: "", warranty: "", description: "", specs: [], ruName: "", ruDescription: "", enName: "", enDescription: "" };

function fromProduct(product: SellerProduct): Draft {
  return {
    media: product.media ?? [], name: product.name, categoryId: product.categoryId ?? "", brand: product.brand ?? "", model: product.model ?? "", sku: product.sku ?? "",
    price: toMajor(product.priceMinor), currency: product.currency === "USD" ? "USD" : "UZS", stock: product.stockQuantity === null ? "" : String(product.stockQuantity),
    warranty: product.warrantyDescription ?? "", description: product.description,
    specs: Object.entries(product.specifications ?? {}).map(([key, value]) => ({ key, value: String(value) })),
    ruName: product.translations?.ru?.name ?? "", ruDescription: product.translations?.ru?.description ?? "", enName: product.translations?.en?.name ?? "", enDescription: product.translations?.en?.description ?? ""
  };
}

/** The listing form: photos first, then what a buyer needs to decide. New and changed listings go to staff review. */
export function SellerProductEditor({ id, nav }: { id: string | null; nav: SellerNav }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const e = c.editor;
  const existing = useSellerData<{ product: SellerProduct }>(id ? `/api/shop/products/${id}` : null);
  const categories = useSellerData<{ categories: Category[] }>("/api/shop/categories");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loaded, setLoaded] = useState(id === null);
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  useBackButton(nav.back);

  useEffect(() => {
    if (existing.data && !loaded) { setDraft(fromProduct(existing.data.product)); setLoaded(true); }
  }, [existing.data, loaded]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({ ...current, [key]: value }));

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_PRODUCT_PHOTOS - draft.media.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    setUploading(value => value + chosen.length);
    for (const file of chosen) {
      const result = await uploadShopPhoto(file);
      setUploading(value => value - 1);
      if (!result.ok) { haptic.error(); nav.error(result.error); continue; }
      setDraft(current => current.media.length >= MAX_PRODUCT_PHOTOS ? current : { ...current, media: [...current.media, result.data.id] });
    }
  }
  const movePhoto = (index: number, delta: number) => setDraft(current => {
    const media = [...current.media];
    const [item] = media.splice(index, 1);
    media.splice(index + delta, 0, item);
    return { ...current, media };
  });

  async function submit() {
    const priceMinor = toMinor(draft.price);
    const stock = draft.stock.trim() === "" ? null : Number(draft.stock);
    if (!draft.media.length || draft.name.trim().length < 3 || !draft.categoryId || priceMinor === null || draft.description.trim().length < 20 || (stock !== null && (!Number.isInteger(stock) || stock < 0))) {
      haptic.error(); nav.error(e.required); return;
    }
    const specifications = Object.fromEntries(draft.specs.filter(spec => spec.key.trim() && spec.value.trim()).map(spec => [spec.key.trim(), spec.value.trim()]));
    const language = (name: string, description: string) => (name.trim() || description.trim()) ? { ...(name.trim() ? { name: name.trim() } : {}), ...(description.trim() ? { description: description.trim() } : {}) } : undefined;
    const ru = language(draft.ruName, draft.ruDescription);
    const en = language(draft.enName, draft.enDescription);
    const body = {
      name: draft.name.trim(), description: draft.description.trim(), categoryId: draft.categoryId, brand: draft.brand.trim(), model: draft.model.trim(), sku: draft.sku.trim(),
      priceMinor, currency: draft.currency, stockQuantity: stock, warrantyDescription: draft.warranty.trim(), specifications, media: draft.media,
      ...(ru || en ? { translations: { ...(ru ? { ru } : {}), ...(en ? { en } : {}) } } : {})
    };
    setBusy(true);
    const result = await sellerApi<{ product: SellerProduct; review?: boolean }>(id ? `/api/shop/products/${id}` : "/api/shop/products", { method: id ? "PUT" : "POST", body });
    setBusy(false);
    if (!result.ok) { haptic.error(); nav.error(result.error); return; }
    haptic.success();
    nav.notice(!id || result.data.review ? e.sentToReview : e.saved);
    nav.back();
  }

  if ((id && existing.failed && !existing.data) || (categories.failed && !categories.data)) return <div className="tma-empty"><p>{c.common.failed}</p><button type="button" className="tma-button secondary" onClick={() => { existing.reload(); categories.reload(); }}>{c.common.retry}</button></div>;
  if (!loaded || !categories.data) return <SellerSkeleton />;
  const remaining = MAX_PRODUCT_PHOTOS - draft.media.length;

  return <>
    <header className="tma-detail-head"><h1>{id ? e.editTitle : e.newTitle}</h1></header>
    <p className="tma-notice">{id ? e.reReviewNote : e.reviewNote}</p>

    <h2 className="tma-section-title">{e.photos} · {draft.media.length}/{MAX_PRODUCT_PHOTOS}</h2>
    <section className="tma-section">
      <p className="tma-hint tma-hint-flat">{e.photosHint}</p>
      <ul className="tma-photo-grid">
        {draft.media.map((mediaId, index) => <li key={mediaId} className="tma-photo">
          <img src={`/api/media/${mediaId}`} alt="" />
          {index === 0 && <span className="tma-photo-cover">{e.cover}</span>}
          <span className="tma-photo-actions">
            {index > 0 && <button type="button" aria-label={e.left} onClick={() => movePhoto(index, -1)}>←</button>}
            {index < draft.media.length - 1 && <button type="button" aria-label={e.right} onClick={() => movePhoto(index, 1)}>→</button>}
            <button type="button" className="is-danger" aria-label={e.removePhoto} onClick={() => set("media", draft.media.filter(item => item !== mediaId))}>×</button>
          </span>
        </li>)}
        {Array.from({ length: uploading }, (_, index) => <li key={`up-${index}`} className="tma-photo is-loading"><span>{e.uploading}</span></li>)}
        {remaining > uploading && <li className="tma-photo is-add"><button type="button" onClick={() => fileInput.current?.click()}><span aria-hidden="true">+</span>{e.addPhoto}</button></li>}
      </ul>
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={event => { void addPhotos(event.currentTarget.files); event.currentTarget.value = ""; }} />
    </section>

    <section className="tma-section tma-form">
      <div className="field"><label htmlFor="p-name">{e.name} *</label><input id="p-name" value={draft.name} maxLength={160} placeholder={e.namePh} onChange={event => set("name", event.target.value)} /></div>
      <div className="field"><label htmlFor="p-category">{e.category} *</label>
        <select id="p-category" value={draft.categoryId} onChange={event => set("categoryId", event.target.value)}>
          <option value="">{e.chooseCategory}</option>
          {categories.data.categories.map(category => <option key={category.id} value={category.id}>{category.names[locale]}</option>)}
        </select>
      </div>
      <div className="tma-form-row">
        <div className="field"><label htmlFor="p-brand">{e.brand}</label><input id="p-brand" value={draft.brand} maxLength={100} onChange={event => set("brand", event.target.value)} /></div>
        <div className="field"><label htmlFor="p-model">{e.model}</label><input id="p-model" value={draft.model} maxLength={120} onChange={event => set("model", event.target.value)} /></div>
      </div>
      <div className="tma-form-row">
        <div className="field"><label htmlFor="p-price">{e.price} *</label><input id="p-price" inputMode="decimal" value={draft.price} onChange={event => set("price", event.target.value)} /></div>
        <div className="field"><label htmlFor="p-currency">{e.currency}</label>
          <select id="p-currency" value={draft.currency} onChange={event => set("currency", event.target.value as Draft["currency"])}><option value="UZS">so‘m (UZS)</option><option value="USD">USD</option></select>
        </div>
      </div>
      <div className="tma-form-row">
        <div className="field"><label htmlFor="p-stock">{e.stock}</label><input id="p-stock" inputMode="numeric" value={draft.stock} onChange={event => set("stock", event.target.value.replace(/\D/g, ""))} /></div>
        <div className="field"><label htmlFor="p-sku">{e.sku}</label><input id="p-sku" value={draft.sku} maxLength={80} onChange={event => set("sku", event.target.value)} /></div>
      </div>
      <p className="tma-hint tma-hint-flat">{e.stockHint}</p>
      <div className="field"><label htmlFor="p-warranty">{e.warranty}</label><input id="p-warranty" value={draft.warranty} maxLength={300} placeholder={e.warrantyPh} onChange={event => set("warranty", event.target.value)} /></div>
      <div className="field"><label htmlFor="p-description">{e.description} *</label><textarea id="p-description" rows={6} value={draft.description} maxLength={5000} onChange={event => set("description", event.target.value)} />
        <small className="tma-hint tma-hint-flat">{e.descriptionHint} ({draft.description.trim().length}/20)</small></div>
    </section>

    <h2 className="tma-section-title">{e.specs}</h2>
    <section className="tma-section tma-form">
      {draft.specs.map((spec, index) => <div className="tma-spec-row" key={index}>
        <input aria-label={e.specKey} placeholder={e.specKey} value={spec.key} maxLength={80} onChange={event => set("specs", draft.specs.map((item, i) => i === index ? { ...item, key: event.target.value } : item))} />
        <input aria-label={e.specValue} placeholder={e.specValue} value={spec.value} maxLength={300} onChange={event => set("specs", draft.specs.map((item, i) => i === index ? { ...item, value: event.target.value } : item))} />
        <button type="button" className="tma-chip is-danger" aria-label={e.removePhoto} onClick={() => set("specs", draft.specs.filter((_, i) => i !== index))}>×</button>
      </div>)}
      {draft.specs.length < 40 && <button type="button" className="tma-button secondary" onClick={() => set("specs", [...draft.specs, { key: "", value: "" }])}>+ {e.addSpec}</button>}
    </section>

    <details className="tma-section tma-form">
      <summary>{e.translations}</summary>
      <div className="field"><label htmlFor="p-ru-name">{e.ruName}</label><input id="p-ru-name" value={draft.ruName} maxLength={160} onChange={event => set("ruName", event.target.value)} /></div>
      <div className="field"><label htmlFor="p-ru-desc">{e.ruDescription}</label><textarea id="p-ru-desc" rows={4} value={draft.ruDescription} maxLength={5000} onChange={event => set("ruDescription", event.target.value)} /></div>
      <div className="field"><label htmlFor="p-en-name">{e.enName}</label><input id="p-en-name" value={draft.enName} maxLength={160} onChange={event => set("enName", event.target.value)} /></div>
      <div className="field"><label htmlFor="p-en-desc">{e.enDescription}</label><textarea id="p-en-desc" rows={4} value={draft.enDescription} maxLength={5000} onChange={event => set("enDescription", event.target.value)} /></div>
    </details>

    <BottomActions main={{ text: id ? e.submitEdit : e.submitNew, busy, disabled: uploading > 0, onClick: () => void submit() }} />
  </>;
}
