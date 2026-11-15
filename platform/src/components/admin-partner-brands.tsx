"use client";

import { useEffect, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { MAX_BRANDS_PER_ROW, brandLogoSrc, defaultPartnerBrands, partnerBrandsCopy, type PartnerBrand, type PartnerBrands } from "@/lib/partner-brands";
import type { Locale } from "@/lib/messages";

const bundled = ["asus.svg", "cisco.svg", "cudy.png", "dlink.png", "grandstream.png", "hikvision.png", "huawei.svg", "juniper.svg", "mikrotik.svg", "tenda.png", "tplink.svg", "ubiquiti.svg", "zyxel.png"];
const locales: Locale[] = ["uz", "ru", "en"];

const copy = {
  uz: {
    title: "Brendlar lentasi (bosh sahifa)", hint: "Ikki qator: yuqorisi o‘ngdan chapga, pastkisi chapdan o‘ngga harakatlanadi. Har brendga nom va logo kerak. Logo — tayyor ro‘yxatdan yoki o‘zingiz yuklagan rasm (PNG, JPG yoki WebP, oq yoki shaffof fonda yaxshi ko‘rinadi).",
    heading: "Sarlavha", note: "Izoh", emptyHint: "Bo‘sh qolsa, standart matn chiqadi:", row1: "1-qator (o‘ngdan chapga)", row2: "2-qator (chapdan o‘ngga)",
    name: "Brend nomi", logo: "Logo", ready: "Tayyor logo", upload: "Rasm yuklash", uploading: "Yuklanmoqda…", add: "Brend qo‘shish", remove: "O‘chirish",
    left: "Chapga", right: "O‘ngga", toOther: "Boshqa qatorga", save: "Saqlash", saving: "Saqlanmoqda…", saved: "Saqlandi. Bosh sahifada darhol ko‘rinadi.",
    reset: "Standart ro‘yxatga qaytarish", resetConfirm: "Kiritilgan brendlar o‘rniga standart 13 ta brend qo‘yilsinmi? Saqlash tugmasini bosmaguningizcha saytda o‘zgarmaydi.",
    empty: "Bu qator bo‘sh — saytda ko‘rinmaydi.", full: `Qatorda ${MAX_BRANDS_PER_ROW} tadan ko‘p brend bo‘lmaydi.`, failed: "Saqlab bo‘lmadi.", noName: "Har bir brendga nom yozing."
  },
  ru: {
    title: "Лента брендов (главная)", hint: "Две строки: верхняя движется справа налево, нижняя — слева направо. У каждого бренда нужны название и логотип: из готового списка или загруженная картинка (PNG, JPG или WebP, лучше на белом или прозрачном фоне).",
    heading: "Заголовок", note: "Пояснение", emptyHint: "Если пусто, выводится стандартный текст:", row1: "Строка 1 (справа налево)", row2: "Строка 2 (слева направо)",
    name: "Название бренда", logo: "Логотип", ready: "Готовый логотип", upload: "Загрузить картинку", uploading: "Загрузка…", add: "Добавить бренд", remove: "Удалить",
    left: "Влево", right: "Вправо", toOther: "В другую строку", save: "Сохранить", saving: "Сохраняем…", saved: "Сохранено. На главной видно сразу.",
    reset: "Вернуть стандартный список", resetConfirm: "Поставить стандартные 13 брендов вместо введённых? На сайте изменится только после сохранения.",
    empty: "Строка пуста — на сайте не показывается.", full: `В строке не больше ${MAX_BRANDS_PER_ROW} брендов.`, failed: "Не удалось сохранить.", noName: "Укажите название каждого бренда."
  },
  en: {
    title: "Brand strip (home page)", hint: "Two rows: the top one moves right to left, the bottom one left to right. Each brand needs a name and a logo: from the ready list or an image you upload (PNG, JPG or WebP, best on a white or transparent background).",
    heading: "Title", note: "Note", emptyHint: "Left empty, the standard text shows:", row1: "Row 1 (right to left)", row2: "Row 2 (left to right)",
    name: "Brand name", logo: "Logo", ready: "Ready logo", upload: "Upload image", uploading: "Uploading…", add: "Add brand", remove: "Remove",
    left: "Left", right: "Right", toOther: "To the other row", save: "Save", saving: "Saving…", saved: "Saved. It shows on the home page right away.",
    reset: "Restore the standard list", resetConfirm: "Replace the brands entered with the standard 13? The site changes only when you save.",
    empty: "This row is empty and is not shown on the site.", full: `A row holds at most ${MAX_BRANDS_PER_ROW} brands.`, failed: "Could not save.", noName: "Give every brand a name."
  }
};

/** Staff edit the two rows of brand logos on the home page here, including partners' own logos. */
export function AdminPartnerBrands() {
  const { locale } = useSitePreferences();
  const c = copy[locale];
  const [data, setData] = useState<PartnerBrands | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void fetch("/api/admin/partner-brands").then(response => response.ok ? response.json() : null)
      .then(result => setData(result?.brands ?? defaultPartnerBrands)).catch(() => setData(defaultPartnerBrands));
  }, []);

  const updateRow = (rowIndex: 0 | 1, change: (row: PartnerBrand[]) => PartnerBrand[]) => setData(current => {
    if (!current) return current;
    const rows = [...current.rows] as PartnerBrands["rows"];
    rows[rowIndex] = change([...rows[rowIndex]]);
    return { ...current, rows };
  });
  const setText = (field: "title" | "note", lang: Locale, value: string) => setData(current => current ? { ...current, [field]: { ...current[field], [lang]: value } } : current);

  function move(rowIndex: 0 | 1, index: number, delta: number) {
    updateRow(rowIndex, row => { const [item] = row.splice(index, 1); row.splice(index + delta, 0, item); return row; });
  }
  function toOtherRow(rowIndex: 0 | 1, index: number) {
    if (!data) return;
    const other = rowIndex === 0 ? 1 : 0;
    if (data.rows[other].length >= MAX_BRANDS_PER_ROW) { setError(c.full); return; }
    const item = data.rows[rowIndex][index];
    setData({ ...data, rows: (rowIndex === 0 ? [data.rows[0].filter((_, i) => i !== index), [...data.rows[1], item]] : [[...data.rows[0], item], data.rows[1].filter((_, i) => i !== index)]) as PartnerBrands["rows"] });
  }
  function addBrand(rowIndex: 0 | 1) {
    if (!data) return;
    if (data.rows[rowIndex].length >= MAX_BRANDS_PER_ROW) { setError(c.full); return; }
    updateRow(rowIndex, row => [...row, { name: "", logo: `/brands/${bundled[0]}` }]);
  }

  async function uploadLogo(rowIndex: 0 | 1, index: number, file: File | undefined) {
    if (!file) return;
    const key = `${rowIndex}-${index}`;
    setUploading(key); setError("");
    try {
      const form = new FormData();
      form.set("scope", "CONTENT");
      form.set("file", file);
      const response = await fetch("/api/media", { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.asset?.id) throw new Error(result.error ?? c.failed);
      updateRow(rowIndex, row => row.map((item, i) => i === index ? { ...item, logo: result.asset.id as string } : item));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : c.failed);
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    if (!data) return;
    if (data.rows.flat().some(item => !item.name.trim())) { setError(c.noName); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/partner-brands", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? c.failed);
      setData(result.brands);
      setNotice(c.saved);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : c.failed);
    } finally {
      setBusy(false);
    }
  }

  return <details className="admin-records-accordion admin-partner-brands">
    <summary>{c.title}</summary>
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <p className="small muted">{c.hint}</p>
    {!data ? <p className="muted">…</p> : <div className="form">
      {(["title", "note"] as const).map(field => <fieldset className="admin-partner-text" key={field}>
        <legend>{field === "title" ? c.heading : c.note}</legend>
        {locales.map(lang => <div className="field" key={lang}>
          <label htmlFor={`brands-${field}-${lang}`}>{lang.toUpperCase()}</label>
          <input id={`brands-${field}-${lang}`} value={data[field][lang]} maxLength={120} placeholder={partnerBrandsCopy[lang][field]} onChange={event => setText(field, lang, event.target.value)} />
        </div>)}
        <p className="small muted">{c.emptyHint} «{partnerBrandsCopy[locale][field]}»</p>
      </fieldset>)}

      {([0, 1] as const).map(rowIndex => <fieldset className="admin-partner-row" key={rowIndex}>
        <legend>{rowIndex === 0 ? c.row1 : c.row2} · {data.rows[rowIndex].length}</legend>
        {data.rows[rowIndex].length === 0 && <p className="small muted">{c.empty}</p>}
        <ul className="admin-partner-list">
          {data.rows[rowIndex].map((item, index) => {
            const key = `${rowIndex}-${index}`;
            return <li className="admin-partner-item" key={key}>
              <span className="admin-partner-logo"><img src={brandLogoSrc(item.logo)} alt="" /></span>
              <div className="admin-partner-fields">
                <div className="field"><label htmlFor={`brand-name-${key}`}>{c.name}</label>
                  <input id={`brand-name-${key}`} value={item.name} maxLength={40} required onChange={event => { const name = event.target.value; updateRow(rowIndex, row => row.map((entry, i) => i === index ? { ...entry, name } : entry)); }} />
                </div>
                <div className="field"><label htmlFor={`brand-logo-${key}`}>{c.ready}</label>
                  <select id={`brand-logo-${key}`} value={item.logo.startsWith("/brands/") ? item.logo : ""} onChange={event => { const logo = event.target.value; if (logo) updateRow(rowIndex, row => row.map((entry, i) => i === index ? { ...entry, logo } : entry)); }}>
                    {!item.logo.startsWith("/brands/") && <option value="">— {c.upload} —</option>}
                    {bundled.map(file => <option key={file} value={`/brands/${file}`}>{file.replace(/\.(svg|png)$/, "")}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-partner-actions">
                <label className="button secondary admin-partner-upload">
                  {uploading === key ? c.uploading : c.upload}
                  <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading !== null} onChange={event => { void uploadLogo(rowIndex, index, event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
                </label>
                <button type="button" className="button ghost" disabled={index === 0} onClick={() => move(rowIndex, index, -1)}>← {c.left}</button>
                <button type="button" className="button ghost" disabled={index === data.rows[rowIndex].length - 1} onClick={() => move(rowIndex, index, 1)}>{c.right} →</button>
                <button type="button" className="button ghost" onClick={() => toOtherRow(rowIndex, index)}>{c.toOther}</button>
                <button type="button" className="button danger" onClick={() => updateRow(rowIndex, row => row.filter((_, i) => i !== index))}>{c.remove}</button>
              </div>
            </li>;
          })}
        </ul>
        <button type="button" className="button secondary" onClick={() => addBrand(rowIndex)}>+ {c.add}</button>
      </fieldset>)}

      <div className="admin-partner-save">
        <button type="button" className="button" disabled={busy || uploading !== null} onClick={() => void save()}>{busy ? c.saving : c.save}</button>
        <button type="button" className="button ghost" disabled={busy} onClick={() => { if (window.confirm(c.resetConfirm)) setData({ ...defaultPartnerBrands, title: data.title, note: data.note }); }}>{c.reset}</button>
      </div>
    </div>}
  </details>;
}
