"use client";

import { useEffect, useRef, useState } from "react";
import { ToastMessage } from "@/components/toast-provider";

type Coords = [number, number];
type GeoResult = { geoObjects: { get: (i: number) => { getAddressLine?: () => string } | undefined } };
type YMaps = {
  ready: (cb: () => void) => void;
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => YMap;
  Placemark: new (coords: Coords, props?: Record<string, unknown>, opts?: Record<string, unknown>) => YPlacemark;
  geocode: (query: Coords | string) => Promise<GeoResult>;
};
type YMap = {
  events: { add: (name: string, cb: (e: { get: (k: string) => Coords }) => void) => void };
  geoObjects: { add: (o: YPlacemark) => void };
  setCenter: (c: Coords, z?: number) => void;
  destroy: () => void;
};
type YPlacemark = { geometry: { setCoordinates: (c: Coords) => void } };
declare global { interface Window { ymaps?: YMaps } }

const TASHKENT: Coords = [41.311081, 69.240562];

let loader: Promise<YMaps> | null = null;
function loadYandex(apiKey: string): Promise<YMaps> {
  if (window.ymaps) return new Promise((resolve) => window.ymaps!.ready(() => resolve(window.ymaps!)));
  loader ??= new Promise<YMaps>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey ?? "")}&lang=uz_UZ`;
    script.async = true;
    script.onload = () => window.ymaps!.ready(() => resolve(window.ymaps!));
    script.onerror = () => { loader = null; reject(new Error("Yandex Maps yuklanmadi")); };
    document.head.appendChild(script);
  });
  return loader;
}

export function DeliveryMap({ value, address, onChange }: {
  value: Coords | null;
  address: string;
  onChange: (coords: Coords, address?: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [apiKey, setApiKey] = useState("");
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [mapReadyCount, setMapReadyCount] = useState(0);
  const placeRef = useRef<((coords: Coords, reverse: boolean) => Promise<void>) | null>(null);
  const mapRef = useRef<YMap | null>(null);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/integrations/yandex-maps", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Map configuration request failed: ${response.status}`);
        const result: unknown = await response.json();
        if (typeof result !== "object" || result === null || !("apiKey" in result) || typeof result.apiKey !== "string") {
          throw new Error("Map configuration response has an invalid format.");
        }
        if (!cancelled) setApiKey(result.apiKey);
      })
      .catch((error: unknown) => {
        console.error("Yandex Maps configuration could not be loaded", error instanceof Error ? error.name : "UnknownError");
        if (!cancelled) setApiKeyError(true);
      })
      .finally(() => { if (!cancelled) setApiKeyLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!open || !apiKey || !container.current) return;
    let cancelled = false;
    setState("loading");
    setError("");
    loadYandex(apiKey).then((ymaps) => {
      if (cancelled || !container.current) return;
      const map = new ymaps.Map(container.current, {
        center: value ?? TASHKENT,
        zoom: value ? 16 : 11,
        controls: ["zoomControl", "searchControl", "typeSelector"]
      });
      mapRef.current = map;
      let mark: YPlacemark | null = null;
      const place = async (coords: Coords, reverse: boolean) => {
        if (mark) mark.geometry.setCoordinates(coords);
        else {
          mark = new ymaps.Placemark(coords, {}, { preset: "islands#redDotIcon" });
          map.geoObjects.add(mark);
        }
        map.setCenter(coords, 16);
        let selectedAddress: string | undefined;
        if (reverse) {
          try { selectedAddress = (await ymaps.geocode(coords)).geoObjects.get(0)?.getAddressLine?.(); }
          catch { /* The selected coordinates remain usable without a resolved street name. */ }
        }
        if (reverse) onChangeRef.current(coords, selectedAddress);
      };
      placeRef.current = place;
      if (value) void place(value, false);
      map.events.add("click", (event) => void place(event.get("coords"), true));
      setState("ready");
      setMapReadyCount((n) => n + 1);
    }).catch(() => { if (!cancelled) setState("error"); });
    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
      placeRef.current = null;
    };
  }, [open, apiKey]);

  function useMyLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Brauzer joylashuvni aniqlashni qo‘llamaydi.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coords = [position.coords.latitude, position.coords.longitude];
        setLocating(false);
        if (coords[0] < 37 || coords[0] > 46 || coords[1] < 55 || coords[1] > 74) {
          setError("Tanlangan manzil O‘zbekiston hududidan tashqarida.");
          return;
        }
        if (mapReadyCount) void placeRef.current?.(coords, true);
      },
      (issue) => {
        setLocating(false);
        setError(issue.code === issue.PERMISSION_DENIED
          ? "Joylashuvga ruxsat berilmadi. Brauzer sozlamalarida ruxsat bering yoki xaritada nuqtani tanlang."
          : "Joylashuvni aniqlab bo‘lmadi. Xaritada nuqtani tanlang.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }

  if (!apiKeyLoaded || !apiKey) return <p className="small muted">{apiKeyError
    ? "Xarita sozlamasini yuklab bo‘lmadi. Manzilni qo‘lda kiriting."
    : apiKeyLoaded
      ? "Xarita ulanmagan. Manzilni qo‘lda kiriting."
      : "Xarita sozlamasi tekshirilmoqda…"}</p>;
  return <>
    <div className="shop-map-picker">
      <div className="shop-map-summary">
        <span className="shop-map-pin" aria-hidden="true">⌖</span>
        <div>
          <strong>{address || (value ? "Xaritadagi nuqta tanlangan" : "Manzil tanlanmagan")}</strong>
          <span className="small muted">{value ? "Yetkazish nuqtasi belgilandi" : "Xaritadan yoki joriy joylashuvingizdan tanlang"}</span>
        </div>
      </div>
      <button className="button" type="button" onClick={() => setOpen(true)}>
        {value ? "Manzilni o‘zgartirish" : "Xaritada manzil tanlash"}
      </button>
    </div>
    {open && <div className="shop-map-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="shop-map-dialog" role="dialog" aria-modal="true" aria-labelledby="delivery-map-title">
        <header className="shop-map-dialog-head">
          <div><span className="eyebrow">YETKAZIB BERISH</span><h2 id="delivery-map-title">Yetkazish manzilini tanlang</h2></div>
          <button className="button ghost" type="button" aria-label="Yopish" onClick={() => setOpen(false)}>✕</button>
        </header>
        <div className="shop-map-toolbar">
          <p className="small muted">Xaritada nuqtani bosing yoki qidiruvdan foydalaning.</p>
        </div>
        <ToastMessage message={state === "error" ? "Xarita yuklanmadi. Sahifani yangilang yoki manzilni izohda yozing." : ""} variant="error" />
        <div className="shop-map-canvas-wrap">
          <div ref={container} className="shop-map-canvas" aria-label="Yetkazish manzilini tanlash xaritasi" />
          <button className="shop-map-locate" type="button" onClick={useMyLocation} disabled={locating || state !== "ready"} aria-label="Mening joylashuvim" title="Mening joylashuvim">
            {locating ? <span className="shop-map-spinner" aria-hidden="true" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v3m0 14v3M2 12h3m14 0h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 3v4m-2-2h4" /></svg>}
          </button>
          <ToastMessage message={error} variant="error" />
        </div>
        <footer className="shop-map-dialog-foot">
          <span className="small muted">{value ? "Tanlangan nuqtani tekshirib tasdiqlang." : "Nuqta tanlanmaguncha tasdiqlash mumkin emas."}</span>
          <button className="button" type="button" disabled={!value} onClick={() => setOpen(false)}>Manzilni tasdiqlash</button>
        </footer>
      </section>
    </div>}
  </>;
}
