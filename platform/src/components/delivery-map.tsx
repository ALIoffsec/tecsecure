"use client";

import { useEffect, useRef, useState } from "react";

type Coords = [number, number];
type YMaps = {
  ready: (cb: () => void) => void;
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => YMap;
  Placemark: new (coords: Coords, props?: Record<string, unknown>, opts?: Record<string, unknown>) => YPlacemark;
  geocode: (query: Coords | string, opts?: Record<string, unknown>) => Promise<{ geoObjects: { get: (i: number) => { getAddressLine?: () => string; geometry?: { getCoordinates: () => Coords } } | undefined } }>;
};
type YMap = { events: { add: (name: string, cb: (e: { get: (k: string) => Coords }) => void) => void }; geoObjects: { add: (o: YPlacemark) => void; remove: (o: YPlacemark) => void }; setCenter: (c: Coords, z?: number) => void; destroy: () => void };
type YPlacemark = { geometry: { setCoordinates: (c: Coords) => void } };
declare global { interface Window { ymaps?: YMaps } }

const TASHKENT: Coords = [41.311081, 69.240562];
const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

let loader: Promise<YMaps> | null = null;
function loadYandex(): Promise<YMaps> {
  if (window.ymaps) return new Promise((r) => window.ymaps!.ready(() => r(window.ymaps!)));
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

export function DeliveryMap({ value, onChange }: {
  value: Coords | null;
  onChange: (coords: Coords, address?: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const [state, setState] = useState<"loading" | "ready" | "error">(apiKey ? "loading" : "error");
  const initial = useRef(value);

  useEffect(() => { onChangeRef.current = onChange; });

  useEffect(() => {
    if (!apiKey || !container.current) return;
    let map: YMap | null = null;
    let cancelled = false;
    loadYandex().then((ymaps) => {
      if (cancelled || !container.current) return;
      map = new ymaps.Map(container.current, { center: initial.current ?? TASHKENT, zoom: initial.current ? 15 : 11, controls: ["zoomControl", "geolocationControl", "searchControl"] });
      let mark: YPlacemark | null = null;
      const place = async (coords: Coords, reverse: boolean) => {
        if (mark) mark.geometry.setCoordinates(coords);
        else { mark = new ymaps.Placemark(coords, {}, { preset: "islands#redDotIcon" }); map!.geoObjects.add(mark); }
        let address: string | undefined;
        if (reverse) {
          try { address = (await ymaps.geocode(coords)).geoObjects.get(0)?.getAddressLine?.(); } catch { address = undefined; }
        }
        onChangeRef.current(coords, address);
      };
      if (initial.current) void place(initial.current, false);
      map.events.add("click", (e) => void place(e.get("coords"), true));
      setState("ready");
    }).catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; map?.destroy(); };
  }, []);

  if (state === "error") {
    return <p className="small muted">{apiKey ? "Xarita yuklanmadi. Manzilni matn ko‘rinishida kiriting." : "Xarita hozircha ulanmagan. Manzilni matn ko‘rinishida kiriting."}</p>;
  }
  return <div>
    <div ref={container} style={{ width: "100%", height: 340, borderRadius: 12, overflow: "hidden", background: "#e8ecef" }} aria-label="Yetkazib berish xaritasi" />
    <p className="small muted" style={{ marginTop: 6 }}>{state === "loading" ? "Xarita yuklanmoqda…" : "Xaritada yetkazib berish joyini bosing yoki qidiring."}</p>
  </div>;
}
