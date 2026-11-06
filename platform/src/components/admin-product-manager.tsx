"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUploader } from "@/components/media-uploader";
import { ProductVisual } from "@/components/product-visual";
import { SiteDialog } from "@/components/site-dialog";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { supportedCurrencies } from "@/lib/currency";
import { formatMinor, minorToMajorInput, parseMajorPrice } from "@/lib/format";
import type { Locale } from "@/lib/messages";
import { formatProductDetails, parseProductDetails } from "@/lib/product-details";

export type AdminProduct = {
  id: string; name: string; slug: string; sku: string | null; brand: string | null; model: string | null;
  categoryId: string | null; category: { name: string; slug: string } | null;
  specifications: unknown; compatibility: unknown; warrantyDescription: string | null;
  status: string; priceMinor: number | null; currency: string; stockStatus: string; description: string; media: unknown;
};
export type AdminCategory = { id: string; name: string; _count: { products: number } };

const copy = {
  uz: {
    add: "Mahsulot qo‘shish", search: "Nomi, brend, model yoki SKU", allStatus: "Barcha holatlar", allCategories: "Barcha kategoriyalar", attention: "Faqat to‘ldirilmaganlar",
    PUBLISHED: "Saytda", DRAFT: "Qoralama", ARCHIVED: "Arxivda", IN_STOCK: "Omborda bor", OUT_OF_STOCK: "Omborda yo‘q", ON_REQUEST: "Buyurtma asosida", UNKNOWN: "Noma’lum",
    noPhoto: "Rasm yo‘q", noPrice: "Narx yo‘q", noSpecs: "Xususiyat yo‘q", noCategory: "Kategoriya yo‘q", noResults: "Mos mahsulot topilmadi.", empty: "Hali mahsulot qo‘shilmagan.",
    edit: "Tahrirlash", view: "Saytda ko‘rish", archive: "Arxivlash", restore: "Qoralamaga qaytarish", publish: "Nashr qilish", unpublish: "Saytdan olish", confirmArchive: "Arxivlansinmi",
    name: "Nomi", sku: "SKU (ixtiyoriy)", brand: "Brend", model: "Model", category: "Kategoriya", noneCategory: "Kategoriya tanlanmagan", description: "Tavsif",
    specs: "Xususiyatlar", specsHint: "Har qatorda «Nomi: qiymati». Birinchi 3 tasi kartochkada ko‘rinadi.", compat: "Moslik (ixtiyoriy)", compatHint: "Har bir platforma alohida qatorda.",
    warranty: "Kafolat", price: "Narx", priceHint: "Oddiy summa, masalan 1 250 000. Bo‘sh qolsa, saytda «Narx so‘rov bo‘yicha» ko‘rinadi.", currency: "Valyuta", stock: "Ombor holati", status: "Nashr holati",
    photos: "Rasmlar", photoHint: "Birinchi rasm kartochkada ko‘rinadi. Eng yaxshisi: oq fon, kamida 1000 px, mahsulot kadrni to‘ldirgan.",
    save: "Saqlash", saving: "Saqlanmoqda…", cancel: "Bekor qilish", saved: "Saqlandi", invalidPrice: "Narxni to‘g‘ri kiriting, masalan 1250000 yoki 19.99.", publishWarning: "Diqqat: nashr qilinayotgan mahsulotda quyidagilar yo‘q:",
    prev: "Oldingi", next: "Keyingi", loading: "Yuklanmoqda…", categories: "Kategoriyalar", newCategory: "Yangi kategoriya nomi", addCategory: "Qo‘shish", rename: "Saqlash", remove: "O‘chirish", confirmRemove: "O‘chirilsinmi", failed: "So‘rov bajarilmadi."
  },
  ru: {
    add: "Добавить товар", search: "Название, бренд, модель или SKU", allStatus: "Все статусы", allCategories: "Все категории", attention: "Только незаполненные",
    PUBLISHED: "На сайте", DRAFT: "Черновик", ARCHIVED: "В архиве", IN_STOCK: "В наличии", OUT_OF_STOCK: "Нет в наличии", ON_REQUEST: "Под заказ", UNKNOWN: "Неизвестно",
    noPhoto: "Нет фото", noPrice: "Нет цены", noSpecs: "Нет характеристик", noCategory: "Нет категории", noResults: "Подходящих товаров нет.", empty: "Товары ещё не добавлены.",
    edit: "Изменить", view: "На сайте", archive: "В архив", restore: "Вернуть в черновик", publish: "Опубликовать", unpublish: "Снять с сайта", confirmArchive: "Отправить в архив",
    name: "Название", sku: "SKU (необязательно)", brand: "Бренд", model: "Модель", category: "Категория", noneCategory: "Без категории", description: "Описание",
    specs: "Характеристики", specsHint: "В каждой строке «Название: значение». Первые 3 видны на карточке.", compat: "Совместимость (необязательно)", compatHint: "Каждая платформа с новой строки.",
    warranty: "Гарантия", price: "Цена", priceHint: "Обычная сумма, например 1 250 000. Если пусто, на сайте будет «Цена по запросу».", currency: "Валюта", stock: "Наличие", status: "Статус публикации",
    photos: "Фотографии", photoHint: "Первое фото видно на карточке. Лучше всего: белый фон, от 1000 px, товар заполняет кадр.",
    save: "Сохранить", saving: "Сохранение…", cancel: "Отмена", saved: "Сохранено", invalidPrice: "Укажите цену правильно, например 1250000 или 19.99.", publishWarning: "Внимание: у публикуемого товара нет:",
    prev: "Назад", next: "Далее", loading: "Загрузка…", categories: "Категории", newCategory: "Название новой категории", addCategory: "Добавить", rename: "Сохранить", remove: "Удалить", confirmRemove: "Удалить", failed: "Запрос не выполнен."
  },
  en: {
    add: "Add product", search: "Name, brand, model or SKU", allStatus: "All statuses", allCategories: "All categories", attention: "Incomplete only",
    PUBLISHED: "Live", DRAFT: "Draft", ARCHIVED: "Archived", IN_STOCK: "In stock", OUT_OF_STOCK: "Out of stock", ON_REQUEST: "On request", UNKNOWN: "Unknown",
    noPhoto: "No photo", noPrice: "No price", noSpecs: "No specs", noCategory: "No category", noResults: "No matching products.", empty: "No products yet.",
    edit: "Edit", view: "View on site", archive: "Archive", restore: "Restore to draft", publish: "Publish", unpublish: "Unpublish", confirmArchive: "Archive",
    name: "Name", sku: "SKU (optional)", brand: "Brand", model: "Model", category: "Category", noneCategory: "No category", description: "Description",
    specs: "Specifications", specsHint: "One “Name: value” per line. The first 3 show on the card.", compat: "Compatibility (optional)", compatHint: "One platform per line.",
    warranty: "Warranty", price: "Price", priceHint: "A plain amount, like 1 250 000. Leave empty to show “Price on request”.", currency: "Currency", stock: "Stock status", status: "Publication status",
    photos: "Photos", photoHint: "The first photo shows on the card. Best: white background, 1000 px or more, product fills the frame.",
    save: "Save", saving: "Saving…", cancel: "Cancel", saved: "Saved", invalidPrice: "Enter a valid price, like 1250000 or 19.99.", publishWarning: "Note: this product is being published without:",
    prev: "Previous", next: "Next", loading: "Loading…", categories: "Categories", newCategory: "New category name", addCategory: "Add", rename: "Save", remove: "Delete", confirmRemove: "Delete", failed: "Request failed."
  }
} satisfies Record<Locale, Record<string, string>>;
type Copy = typeof copy.uz;

const stockOptions = ["IN_STOCK", "ON_REQUEST", "OUT_OF_STOCK", "UNKNOWN"] as const;
const statusOptions = ["PUBLISHED", "DRAFT", "ARCHIVED"] as const;
const mediaOf = (product: Pick<AdminProduct, "media">) => Array.isArray(product.media) ? product.media.filter((id): id is string => typeof id === "string") : [];
const hasDetails = (value: unknown) => Boolean(value) && typeof value === "object" && Object.keys(value as object).length > 0;

function gaps(product: { media: unknown; priceMinor: number | null; specifications: unknown; categoryId: string | null }, c: Copy) {
  return [
    mediaOf(product).length === 0 && c.noPhoto,
    product.priceMinor === null && c.noPrice,
    !hasDetails(product.specifications) && c.noSpecs,
    !product.categoryId && c.noCategory
  ].filter((item): item is string => Boolean(item));
}

async function send(path: string, method: string, body?: unknown) {
  const response = await fetch(path, { method, ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? "");
  return result;
}

export function AdminProductManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const { locale } = useSitePreferences();
  const c = copy[locale];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [attention, setAttention] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const listTop = useRef<HTMLDivElement>(null);
  const failedText = c.failed;

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  // A new filter starts again from the first page.
  useEffect(() => { setPage(1); }, [query, status, categoryId, attention]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });
      if (query.trim()) params.set("q", query.trim());
      if (status) params.set("status", status);
      if (categoryId) params.set("categoryId", categoryId);
      if (attention) params.set("attention", "1");
      try {
        const response = await fetch(`/api/admin/products?${params}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "");
        setProducts(result.products);
        setTotal(result.total);
        setPageSize(result.pageSize);
        setError("");
      } catch (issue) {
        if (controller.signal.aborted) return;
        setError(issue instanceof Error && issue.message ? issue.message : failedText);
      }
      setLoading(false);
    }, query ? 300 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, status, categoryId, attention, page, version, failedText]);

  function goToPage(next: number) {
    setPage(next);
    listTop.current?.scrollIntoView({ block: "start" });
  }
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const firstShown = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastShown = Math.min(page * pageSize, total);

  async function quickUpdate(product: AdminProduct, next: string) {
    if (next === "ARCHIVED" && !window.confirm(`${c.confirmArchive}: ${product.name}?`)) return;
    setBusyId(product.id); setError(""); setNotice("");
    try {
      await send(`/api/products/${product.id}`, next === "ARCHIVED" ? "DELETE" : "PATCH", next === "ARCHIVED" ? undefined : { status: next });
      setNotice(c.saved);
      reload();
      router.refresh();
    } catch (issue) { setError(issue instanceof Error && issue.message ? issue.message : c.failed); }
    finally { setBusyId(""); }
  }

  return <section className="panel-card admin-panel-section active admin-products">
    <ToastMessage message={error || notice} variant={error ? "error" : "success"} />
    <div className="admin-products-head">
      <h2>{locale === "en" ? "Products" : locale === "ru" ? "Товары" : "Mahsulotlar"} <span className="muted">· {total}</span></h2>
      <button className="button" type="button" onClick={() => setEditing("new")}>+ {c.add}</button>
    </div>
    <div className="admin-products-filters" ref={listTop}>
      <input type="search" aria-label={c.search} placeholder={c.search} value={query} onChange={(event) => setQuery(event.target.value)} />
      <select aria-label={c.status} value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">{c.allStatus}</option>
        {statusOptions.map((value) => <option key={value} value={value}>{c[value]}</option>)}
      </select>
      <select aria-label={c.category} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
        <option value="">{c.allCategories}</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <label className="admin-products-toggle"><input type="checkbox" checked={attention} onChange={(event) => setAttention(event.target.checked)} /> {c.attention}</label>
    </div>

    {loading && products.length === 0
      ? <div className="empty-state" role="status">{c.loading}</div>
      : products.length === 0
      ? <div className="empty-state">{query || status || categoryId || attention ? c.noResults : c.empty}</div>
      : <ul className="admin-product-list" aria-busy={loading}>{products.map((product) => {
        const ids = mediaOf(product);
        const missing = gaps(product, c);
        return <li className="admin-product-row" key={product.id}>
          <div className="admin-product-thumb">
            {/* Admin thumbnails need no optimizer: staff may be reviewing just-uploaded originals. */}
            {ids[0] ? <img src={`/api/media/${ids[0]}`} alt="" loading="lazy" /> : <ProductVisual categorySlug={product.category?.slug} productSlug={product.slug} name={product.name} />}
          </div>
          <div className="admin-product-main">
            <strong>{product.name}</strong>
            <span className="small muted">{[product.brand, product.model, product.sku, product.category?.name].filter(Boolean).join(" · ") || "—"}</span>
            {missing.length > 0 && <span className="admin-product-gaps">{missing.map((item) => <i key={item}>{item}</i>)}</span>}
          </div>
          <div className="admin-product-facts">
            <strong>{product.priceMinor === null ? "—" : formatMinor(product.priceMinor, product.currency, locale)}</strong>
            <span className="small muted">{c[product.stockStatus as keyof Copy] ?? product.stockStatus}</span>
          </div>
          <span className={`admin-status-pill is-${product.status.toLowerCase()}`}>{c[product.status as keyof Copy] ?? product.status}</span>
          <div className="admin-product-actions">
            <button className="button secondary small" type="button" onClick={() => setEditing(product)}>{c.edit}</button>
            {product.status === "PUBLISHED" && <Link className="button ghost small" href={`/products/${product.slug}`} target="_blank">{c.view}</Link>}
            {product.status === "DRAFT" && <button className="button ghost small" type="button" disabled={busyId === product.id} onClick={() => void quickUpdate(product, "PUBLISHED")}>{c.publish}</button>}
            {product.status === "PUBLISHED" && <button className="button ghost small" type="button" disabled={busyId === product.id} onClick={() => void quickUpdate(product, "DRAFT")}>{c.unpublish}</button>}
            {product.status === "ARCHIVED"
              ? <button className="button ghost small" type="button" disabled={busyId === product.id} onClick={() => void quickUpdate(product, "DRAFT")}>{c.restore}</button>
              : <button className="button danger small" type="button" disabled={busyId === product.id} onClick={() => void quickUpdate(product, "ARCHIVED")}>{c.archive}</button>}
          </div>
        </li>;
      })}</ul>}

    {pages > 1 && <nav className="admin-products-pager" aria-label={c.search}>
      <button className="button secondary small" type="button" disabled={page <= 1 || loading} onClick={() => goToPage(page - 1)}>← {c.prev}</button>
      <span className="small muted">{firstShown}–{lastShown} / {total}</span>
      <button className="button secondary small" type="button" disabled={page >= pages || loading} onClick={() => goToPage(page + 1)}>{c.next} →</button>
    </nav>}

    <CategoryManager categories={categories} c={c} />
    {editing && <ProductEditor key={editing === "new" ? "new" : editing.id} product={editing === "new" ? null : editing} categories={categories} c={c} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setError(""); setNotice(c.saved); reload(); router.refresh(); }} />}
  </section>;
}

function ProductEditor({ product, categories, c, onClose, onSaved }: { product: AdminProduct | null; categories: AdminCategory[]; c: Copy; onClose: () => void; onSaved: () => void }) {
  const [media, setMedia] = useState<string[]>(() => product ? mediaOf(product) : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const priceMinor = parseMajorPrice(String(data.get("price") ?? ""));
    if (priceMinor !== null && !Number.isSafeInteger(priceMinor)) { setError(c.invalidPrice); return; }
    setBusy(true); setError("");
    try {
      const body = {
        name: data.get("name"), description: data.get("description"), sku: data.get("sku"),
        brand: data.get("brand"), model: data.get("model"), warrantyDescription: data.get("warrantyDescription"),
        categoryId: data.get("categoryId") || null,
        specifications: parseProductDetails(String(data.get("specifications") ?? ""), "specifications"),
        compatibility: parseProductDetails(String(data.get("compatibility") ?? ""), "compatibility"),
        priceMinor, currency: data.get("currency"), stockStatus: data.get("stockStatus"), status: data.get("status"), media
      };
      if (body.status === "PUBLISHED" && product?.status !== "PUBLISHED") {
        const missing = gaps({ media, priceMinor, specifications: body.specifications, categoryId: body.categoryId as string | null }, c);
        if (missing.length && !window.confirm(`${c.publishWarning}\n${missing.join(", ")}`)) { setBusy(false); return; }
      }
      await send(product ? `/api/products/${product.id}` : "/api/products", product ? "PATCH" : "POST", body);
      onSaved();
    } catch (issue) { setError(issue instanceof Error && issue.message ? issue.message : c.failed); }
    finally { setBusy(false); }
  }

  return <SiteDialog className="admin-product-dialog" title={product ? `${c.edit}: ${product.name}` : c.add} onClose={onClose}>
    <form className="form admin-product-form" onSubmit={submit}>
      <div className="field"><label>{c.photos}</label><MediaUploader scope="PRODUCTS" value={media} onChange={setMedia} reorderable hideLabel /><p className="small muted">{c.photoHint}</p></div>
      <div className="form-row"><div className="field"><label>{c.name}</label><input name="name" defaultValue={product?.name ?? ""} required minLength={2} maxLength={160} /></div><div className="field"><label>{c.category}</label><select name="categoryId" defaultValue={product?.categoryId ?? ""}><option value="">{c.noneCategory}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div></div>
      <div className="form-row admin-form-3"><div className="field"><label>{c.brand}</label><input name="brand" defaultValue={product?.brand ?? ""} maxLength={100} /></div><div className="field"><label>{c.model}</label><input name="model" defaultValue={product?.model ?? ""} maxLength={120} /></div><div className="field"><label>{c.sku}</label><input name="sku" defaultValue={product?.sku ?? ""} maxLength={80} /></div></div>
      <div className="form-row admin-form-price"><div className="field"><label>{c.price}</label><input name="price" inputMode="decimal" autoComplete="off" defaultValue={minorToMajorInput(product?.priceMinor)} placeholder="1250000" /></div><div className="field"><label>{c.currency}</label><select name="currency" defaultValue={product?.currency ?? "UZS"}>{product && !supportedCurrencies.some((code) => code === product.currency) && <option value={product.currency}>{product.currency}</option>}{supportedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}</select></div></div>
      <p className="small muted">{c.priceHint}</p>
      <div className="form-row"><div className="field"><label>{c.stock}</label><select name="stockStatus" defaultValue={product?.stockStatus ?? "IN_STOCK"}>{stockOptions.map((value) => <option key={value} value={value}>{c[value]}</option>)}</select></div><div className="field"><label>{c.status}</label><select name="status" defaultValue={product?.status ?? "DRAFT"}>{statusOptions.map((value) => <option key={value} value={value}>{c[value]}</option>)}</select></div></div>
      <div className="field"><label>{c.description}</label><textarea name="description" rows={4} defaultValue={product?.description ?? ""} required minLength={5} maxLength={5000} /></div>
      <div className="form-row"><div className="field"><label>{c.specs}</label><textarea name="specifications" rows={5} defaultValue={formatProductDetails(product?.specifications)} placeholder={"Portlar: 8\nTezlik: 1 Gbit/s"} /><small className="muted">{c.specsHint}</small></div><div className="field"><label>{c.compat}</label><textarea name="compatibility" rows={5} defaultValue={formatProductDetails(product?.compatibility)} placeholder={"Windows\nLinux"} /><small className="muted">{c.compatHint}</small></div></div>
      <div className="field"><label>{c.warranty}</label><input name="warrantyDescription" defaultValue={product?.warrantyDescription ?? ""} maxLength={500} /></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="hero-actions"><button className="button" disabled={busy}>{busy ? c.saving : c.save}</button><button className="button ghost" type="button" onClick={onClose}>{c.cancel}</button></div>
    </form>
  </SiteDialog>;
}

function CategoryManager({ categories, c }: { categories: AdminCategory[]; c: Copy }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function run(action: () => Promise<unknown>) {
    setError(""); setNotice("");
    try { await action(); setNotice(c.saved); router.refresh(); }
    catch (issue) { setError(issue instanceof Error && issue.message ? issue.message : c.failed); }
  }
  return <details className="admin-records-accordion admin-category-manager">
    <summary>{c.categories} · {categories.length}</summary>
    <div className="admin-category-body">
      <ToastMessage message={error || notice} variant={error ? "error" : "success"} />
      <form className="admin-category-add" onSubmit={(event) => { event.preventDefault(); void run(async () => { await send("/api/product-categories", "POST", { name }); setName(""); }); }}>
        <input aria-label={c.newCategory} placeholder={c.newCategory} value={name} required minLength={2} maxLength={80} onChange={(event) => setName(event.target.value)} />
        <button className="button secondary">{c.addCategory}</button>
      </form>
      <ul className="admin-category-list">{categories.map((category) => <li key={category.id}>
        <form onSubmit={(event) => { event.preventDefault(); const next = String(new FormData(event.currentTarget).get("name") ?? ""); void run(() => send(`/api/product-categories/${category.id}`, "PATCH", { name: next })); }}>
          <input name="name" aria-label={c.name} defaultValue={category.name} required minLength={2} maxLength={80} />
          <span className="small muted">{category._count.products}</span>
          <button className="button secondary small">{c.rename}</button>
          <button className="button danger small" type="button" disabled={category._count.products > 0} onClick={() => { if (window.confirm(`${c.confirmRemove}: ${category.name}?`)) void run(() => send(`/api/product-categories/${category.id}`, "DELETE")); }}>{c.remove}</button>
        </form>
      </li>)}</ul>
    </div>
  </details>;
}
