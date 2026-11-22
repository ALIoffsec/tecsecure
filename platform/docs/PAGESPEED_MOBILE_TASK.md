# Vazifa: tecsecure.uz mobil PageSpeed natijasini tuzatish

Manba: PageSpeed Insights, mobil, 2026-11-23 02:38 (Lighthouse 13.6, Moto G Power, sekin 4G).
Hisobot: https://pagespeed.web.dev/analysis/https-tecsecure-uz/jmyc11152q?form_factor=mobile

| Toifa | Ball |
|---|---|
| Performance | **71** |
| Accessibility | 97 |
| Best Practices | 96 |
| SEO | 100 |
| Agentic browsing | 1/2 |

| Ko'rsatkich | Qiymat | Holat |
|---|---|---|
| FCP | 1,2 s | yaxshi |
| **LCP** | **6,7 s** | yomon (maqsad < 2,5 s) |
| TBT | 110 ms | o'rtacha |
| CLS | 0 | yaxshi |
| Speed Index | 5,5 s | yomon |

Asosiy muammo — LCP. LCP elementi bosh sahifa sarlavhasidagi `<span>` ("o'rnatib beramiz, o'rgatamiz, uskunasini topamiz.",
`components/home-hero.tsx:34`). TTFB atigi 100 ms, lekin **element render kechikishi 4 570 ms**. Ya'ni matn HTML'da bor, lekin
ekranga juda kech chiqadi.

---

## Qoidalar (Claude Code uchun)

- Ish `platform/` ichida. Next.js 16.4: Next API'ga tegishdan oldin `node_modules/next/dist/docs/` dagi tegishli sahifani o'qi (AGENTS.md).
- **Saytning hozirgi dizaynini o'zgartirma**: intro, liquid glass, animatsiyalar, karusellar qoladi. Faqat tezroq yuklanishini ta'minla.
- Mahsulot rasmlarini kesma, kattalashtirma, fonini olib tashlama. Faqat kichikroq o'lcham / WebP variant ber.
- Lokal dev server yoki Postgres ishga tushirma. Tekshiruv: `npx tsc --noEmit`, `npm test`, kerak bo'lsa `npm run build`.
  Foydalanuvchi deploy qilib, jonli saytda PageSpeed'ni qayta o'tkazadi.
- Push qilma, commit faqat so'ralsa.
- Har bir bandni alohida, kichik o'zgarish sifatida qil va oxirida nima qilinganini ro'yxat qilib ber.

---

## 1. LCP render kechikishi — 4,6 s (eng muhim)

Lighthouse: "Разбивка LCP → Задержка при отрисовке элемента 4 570 мс", element = hero `<h1> > span`.

Gumon qilingan sabablar (avval tekshir, keyin tuzat):

1. **Render-blocking CSS** (2-band) — 3 ta CSS fayl sekin 4G'da 2,7 s oladi, shu vaqtgacha hech narsa chizilmaydi.
2. **Hero kirish animatsiyasi** — `app/liquid-glass.css:236-238`:
   `#app-shell .brand-hero-copy > * { animation: glass-arrive 850ms ... both; }` va `@keyframes glass-arrive { from { opacity: 0 ... } }`.
   `opacity: 0` dan boshlangan element LCP'ga animatsiya tugagandan keyin hisoblanadi.
   Tuzatish: hero `h1` (va iloji bo'lsa `.lead`) uchun animatsiyani `opacity` siz qil — faqat `transform: translateY(16px) → 0`.
   Ko'rinish deyarli bir xil qoladi.
3. **`SiteMotion` sahifa kirish animatsiyasi** — `components/site-motion.tsx` ~22-qator: hidratsiyadan keyin butun
   `#main-content` ni `opacity .35 → 1` qilib qayta animatsiya qiladi. Sekin telefonda hidratsiya ~5 s da tugaydi (long task
   `chunks/33l_z0v1ex96g.js` 5 133 ms da), ya'ni hero qayta "o'chib-yonadi". Birinchi yuklanishda (initial navigation) bu animatsiyani
   o'tkazib yubor, faqat client-side navigatsiyada (pathname o'zgarganda) ishlat.
4. Agar yuqoridagilardan keyin ham kechiksa: Chrome DevTools → Performance (CPU 4x, Slow 4G) bilan jonli saytni yozib,
   LCP qachon va nima sababdan yangilanayotganini aniqla.

Maqsad: LCP < 2,5 s.

## 2. Render-blocking so'rovlar — tejash 890 ms

| Fayl | Hajm | Vaqt |
|---|---|---|
| `chunks/3-c1xtq7p3hwz.css` | 20,9 KiB | 990 ms |
| `chunks/0gtgm8u_3tf1g.css` | 21,1 KiB | 990 ms |
| `chunks/2k_9sp3tac0yg.css` | 31,6 KiB | 750 ms |

Sabab: `app/layout.tsx:2-14` barcha 13 ta global CSS'ni har sahifaga import qiladi, shu jumladan bosh sahifaga kerak bo'lmagan
`admin.css`, `store.css`, `tma.css`, `growth.css`.

Tuzatish:
- `admin.css` ni `app/admin/layout.tsx` (yoki admin sahifalari) ga ko'chir.
- `tma.css` ni `/tg` va `/shop` layout'iga ko'chir.
- `store.css` ni do'kon sahifalariga (`products`, `cart`, `checkout`, ...) ko'chir — lekin bosh sahifadagi mahsulot vitrinasi
  ishlatadigan qoidalar bo'lsa, ularni qoldir yoki vitrinaga import qil. Ko'chirgandan keyin har bir sahifa ko'rinishi
  o'zgarmaganini tekshir (selektorlar ro'yxatini solishtir).
- `experimental.inlineCss` ni ko'rib chiq: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/inlineCss.md`.
  Kritik CSS inline bo'lsa, render-blocking so'rovlar yo'qoladi. Hujjatdagi cheklovlarni o'qib, foyda/zararini ayt.

## 3. Ishlatilmagan CSS — tejash 60 KiB

| Fayl | Hajm | Ishlatilmagan |
|---|---|---|
| `2k_9sp3tac0yg.css` | 30,7 KiB | 28,5 KiB |
| `3-c1xtq7p3hwz.css` | 20,0 KiB | 16,5 KiB |
| `0gtgm8u_3tf1g.css` | 20,2 KiB | 15,5 KiB |

2-banddagi ko'chirish asosiy qismini hal qiladi. Qo'shimcha: `globals.css` (2300+ qator) va `liquid-*.css` da hech qayerda
ishlatilmaydigan klasslarni top (`grep` bilan `className` larga solishtir) va o'chir. Dizayn variantlari (`data-design=...`)
uchun bloklarni o'chirma — ular admin'dan tanlanadi.

## 4. Rasmlar — tejash 1 014 KiB

| Element | Fayl | Hajm | Tejash | Muammo |
|---|---|---|---|---|
| `work-slide > img` | `/api/media/cmvgym0e5001so6vuf5q4vku0` | 828 KiB | 781 KiB | WebP/AVIF emas, siqilmagan |
| `work-slide > img` | `/api/media/cmveb49d50009o6jsceidkc9d` | 275 KiB | 214 KiB | 960x597, konteyner 531x708; WebP emas |
| `portal-brand > img` | `/icon.ico` | 15 KiB | 14,7 KiB | 32x32 logotip uchun ICO |
| `img.work-ambient` | `/api/media/cmveb49380008o6jskynahnj8` | 140 KiB | 5 KiB | xira fon uchun to'liq rasm |

Tuzatish:
- `app/api/media/[id]/route.ts` ga ixtiyoriy `?w=` parametri qo'sh (ruxsat etilgan o'lchamlar ro'yxati, masalan 320/480/640/960/1280,
  boshqasi rad etiladi). `sharp` bilan `resize({ width, withoutEnlargement: true })` + `webp({ quality: 78 })` (yoki `Accept`
  sarlavhasiga qarab AVIF/WebP), `Vary: Accept`, mavjud `Cache-Control` saqlanadi. Natijani xotirada yoki diskda keshla, har
  so'rovda qayta siqma. Private fayllar uchun mavjud ruxsat tekshiruvi o'zgarmasin. Video fayllarga tegma.
- `components/work-carousel.tsx:43-48` `SlideImage`: `srcSet` (`?w=480 480w, ?w=640 640w, ?w=960 960w`) va `sizes` qo'sh;
  faqat aktiv slayd `loading="eager"` + `fetchPriority="high"`, qo'shnilari `lazy`. Hozir ikkita slayd `eager`.
- `work-carousel.tsx:219` `work-ambient` (xira fon): `?w=64` yoki `?w=128` kichik variant — baribir blur qilinadi.
- `components/site-nav.tsx:111` logotip: `/icon.ico` o'rniga `/icon.svg` yoki `/favicon-32x32.png`.
- Mahsulot kartalari (`product-*`) va boshqa `/api/media/...` rasmlari uchun ham shu `srcSet` ni qo'lla.
- Rasmlarni kesma va kattalashtirma: `withoutEnlargement: true` majburiy.

## 5. Ishlatilmagan JavaScript — tejash 48 KiB

| Fayl | Hajm | Ishlatilmagan |
|---|---|---|
| `chunks/2mx7c48cwt5tz.js` | 71,6 KiB | 25,6 KiB |
| `chunks/0h0iqmp6to1i8.js` | 31,0 KiB | 22,9 KiB |

Tuzatish:
- `npm run build` dan keyin qaysi modullar shu chunk'larda ekanini aniqla (build chiqishi / `.next` manifestlari).
- Birinchi ekranda ko'rinmaydigan client komponentlarni `next/dynamic` bilan kechiktir: bosh sahifadagi `WorkCarousel`,
  mahsulot vitrinasi karuseli (`showcase-carousel.tsx`), `ContactDock`, cookie banneri, `TelegramBridge` (faqat Telegram ichida kerak),
  `ServiceWorkerRegistration`. SSR'ni o'chirish kerak bo'lmasa, o'chirma (SEO uchun matn HTML'da qolsin).
- `layout.tsx` dagi `LearningCatalogProvider` har sahifaga butun kurs katalogini yuboradi — faqat kerakli sahifalarda bering yoki
  minimal maydonlarga qisqartir.

## 6. Eskirgan JavaScript (polifillar) — tejash 14 KiB

`chunks/2mx7c48cwt5tz.js` ichida: `Array.prototype.at`, `flat`, `flatMap`, `Object.fromEntries`, `Object.hasOwn`,
`String.prototype.trimEnd`, `trimStart` polifillari.

Tuzatish: `package.json` ga zamonaviy `browserslist` qo'sh (Next 16 hujjatidagi tavsiya etilgan qiymatni tekshir,
masalan `["chrome 111", "edge 111", "firefox 111", "safari 16.4"]`). Agar polifillar Next'ning o'z `polyfill-module` idan kelsa va
o'chirib bo'lmasa, shuni ayt va bu bandni yop.

## 7. Asosiy oqimdagi ish — 2,0 s, 6 ta uzun vazifa

| Toifa | Vaqt |
|---|---|
| Script Evaluation | 654 ms |
| Other | 577 ms |
| Style & Layout | 377 ms |
| Rendering | 201 ms |
| Script Parsing | 146 ms |

Uzun vazifalar: `33l_z0v1ex96g.js` (103 ms, 5,1 s da), hujjatning o'zi (94, 71, 69 ms), `2mx7c48cwt5tz.js` (51 ms).

Tuzatish:
- 5-band (dynamic import) shuni kamaytiradi.
- `SiteMotion` (`site-motion.tsx`): `document.querySelectorAll(REVEAL)` + har biriga `getBoundingClientRect()` hidratsiya
  paytida layout'ni majburlaydi. `requestIdleCallback` (fallback `setTimeout`) ichiga o'tkaz.
- Mobil qurilmada og'ir effektlar (SVG `filter: url(#...)` suv effekti, `backdrop-filter`) "Style & Layout / Rendering" ni
  oshiradi. Dizaynni o'zgartirmasdan: mobil + `prefers-reduced-motion` uchun ular allaqachon cheklanganmi, tekshir.

## 8. DOM hajmi — 1 286 element

- Eng ko'p bola: `footer.footer > div.feature-footer-glow > div.feature-footer-liquid` — **56 ta** dekorativ `div`
  (`components/feature-visuals.tsx:31`, SVG filter bilan). Ko'rinishni saqlagan holda sonini kamaytir (masalan mobil uchun 12–16 ta
  yoki CSS gradient/pseudo-elementlar bilan), va footer ekranga yaqinlashgandagina render qil.
- `showcase-carousel` nuqtalari takrorlanadi (9-bandga qara) — ortiqcha DOM.
- Eng chuqur: `svg > defs > linearGradient#learn-art-module-linux-fundamentals > stop` (chuqurlik 15) — muammo emas.

## 9. Accessibility: bosish maydonlari juda kichik (`target-size`)

`button.showcase-dot` ("2 — kartochkaga o'tish", ...) — 10x10 px, `::before` bilan ham ~18 px kenglik va bir-biriga yaqin.
Qoida: kamida 24x24 px (yoki atrofida yetarli bo'sh joy).

Tuzatish (`app/journeys.css:333-339`, `components/showcase-carousel.tsx:126-129`):
- Tugmaning o'zini 24x24 (mobil uchun 32x32) qil, ko'rinadigan nuqtani ichki pseudo-element (`::after`) sifatida chiz —
  tashqi ko'rinish o'zgarmaydi. `.showcase-dot-fill` va `aria-current` holatini shu ichki nuqtaga ko'chir.
- Nuqtalar orasidagi `gap` ni shunga moslashtir.
- Hisobotda nuqtalar takrorlanib chiqqan (bir xil "2, 3, 3, 2, 4..."): bir nechta `ShowcaseCarousel` nusxasi yoki klon
  slaydlar uchun alohida nuqtalar render bo'layotgan bo'lishi mumkin — sababini top va bitta to'plam qoldir.

## 10. Accessibility + Agentic: cookie banneridagi ARIA roli

`<aside class="cookie-consent" role="dialog" aria-modal="false">` — `aside` elementiga `dialog` roli ruxsat etilmagan.
Bu ham `aria-allowed-role`, ham "Agentic browsing → accessibility tree" xatosini beradi (1/2 → 2/2).

Tuzatish (`components/site-preferences.tsx:128`): `aside` ni `div` ga almashtir (`role="dialog"` qoladi) yoki
`<section role="region" aria-labelledby="cookie-consent-title">` qil. CSS'da `aside.cookie-consent` selektorlari bo'lsa,
ularni ham yangila — dizayn o'zgarmasin.

## 11. Best Practices: Chrome Issues — Content Security Policy

Sahifa yuklanganda CSP biror narsani blokladi. Jonli saytda DevTools → Issues / Console'da aniq qaysi resurs ekanini top
(ehtimol `fonts.googleapis.com` style, inline `style`, worker yoki Yandex Metrika domeni). Keyin
`next.config.ts` dagi `csp()` ga **faqat o'sha bitta manbani** qo'sh yoki resursni o'zing yukla. CSP'ni kengaytirib yuborma.

## 12. Xavfsizlik tavsiyalari (ballga kam ta'sir qiladi, ehtiyotkorlik bilan)

- **CSP `'unsafe-inline'` script-src'da** (yuqori): nonce yoki hash'ga o'tish. Diqqat: Next'da nonce har sahifani dinamik qiladi
  (`next.config.ts` izohida yozilgan). Ikkita o'z inline skriptimiz (`preferenceBootstrapScript`, JSON-LD) uchun **sha256 hash**
  variantini ko'rib chiq; Next'ning o'z inline skriptlari bilan ishlashini Next hujjatidan tekshir
  (`node_modules/next/dist/docs` → Content Security Policy). Ishonchli yo'l bo'lmasa — o'zgartirma, sababini yoz.
- **HSTS `preload`** yo'q (o'rta): `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. Bu **qaytarish qiyin**
  qadam (hstspreload.org ro'yxati) — barcha subdomenlar HTTPS'da ekaniga ishonch bo'lsagina. O'zgartirishdan oldin foydalanuvchidan so'ra.
- **Trusted Types** (yuqori deb ko'rsatilgan): `require-trusted-types-for 'script'` Next/React va Yandex Metrika bilan
  buzilishi mumkin. Avval `Content-Security-Policy-Report-Only` bilan sinash taklifini yoz, majburiy qilma.

## 13. Google Fonts (uchinchi tomon, 27 KiB)

`components/font-loader.tsx` va `app/layout.tsx:85` 7 ta oila x 4–5 vazn so'raydi (DM Sans, IBM Plex Sans, JetBrains Mono, Manrope,
Outfit, Playfair Display, Space Grotesk). Lekin standart `liquid` dizayni tizim shriftini ishlatadi
(`liquid-glass.css:16-17`: `--design-font-body: -apple-system, ...`).

Tuzatish: faqat joriy `data-design` uchun kerakli oilalarni yukla (`globals.css:1045-1093` dagi xarita bo'yicha),
`liquid` uchun Google Font yuklanmasin — lekin `Manrope`/`DM Sans` boshqa joylarda bevosita ishlatilsa
(`globals.css` da `font-family: Manrope ...`), ularni ham hisobga ol. Imkon bo'lsa `next/font/google` ga o'tish (self-host,
uchinchi tomon so'rovi va preconnect'lar yo'qoladi). Keraksiz bo'lib qolgan `preconnect` larni olib tashla.

## 14. Baseline (ma'lumot uchun, tuzatish shart emas)

"Limited availability": `::marker`, `prefers-reduced-transparency`, `accent-color`, `background-clip: text`, UA client hints,
`referenceTarget`. Ular progressive enhancement sifatida ishlatilganini (fallback borligini) tekshir —
ayniqsa `background-clip: text` (fallback rang bo'lmasa, eski Safari/Firefox'da matn ko'rinmay qolishi mumkin).

## 15. SEO — 100, qo'lda tekshirish

"Structured data is valid" — https://search.google.com/test/rich-results da bosh sahifani tekshirish (foydalanuvchi qiladi).

---

## Bajarish tartibi

1. 1-band (LCP: hero animatsiyasi + `SiteMotion`) — eng katta foyda.
2. 4-band (rasmlar, `/api/media?w=`).
3. 2–3-band (CSS'ni sahifalarga bo'lish, `inlineCss`).
4. 13-band (shriftlar).
5. 9–10-band (accessibility, kichik).
6. 5–8-band (JS, DOM).
7. 11-band (CSP issue), 6-band.
8. 12-band — faqat taklif, foydalanuvchi tasdig'i bilan.

Har bosqichdan keyin: `npx tsc --noEmit` va `npm test`. Oxirida `npm run build` muvaffaqiyatli o'tsin.
Yakuniy hisobotda: nima o'zgardi (fayl:qator), nima qilinmadi va nega, foydalanuvchi deploydan keyin nimani tekshirishi kerak
(PageSpeed mobil qayta o'tkazish, Rich Results test, CSP issue yo'qolgani).
