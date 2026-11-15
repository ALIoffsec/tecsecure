"use client";

/**
 * DEMO (/?demo=exploded): a scroll-driven exploded view of an IP camera, drawn in code. To remove it,
 * delete this file and app/exploded-demo.css, and the `explodedDemo` lines in app/page.tsx and
 * components/home-content.tsx.
 */
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSitePreferences } from "./site-preferences";
import { motionPreference } from "@/lib/motion";
import "@/app/exploded-demo.css";

type Part = { id: string; name: string; note: string };

const copy = {
  uz: {
    eyebrow: "Videokuzatuv", title: "Kamera ichida nima bor?", hint: "Pastga aylantiring — kamera qismlarga ajraladi",
    doneTitle: "Har bir qismni joyingizga moslab tanlaymiz va o‘rnatamiz", cta: "Videokuzatuv xizmati",
    parts: [
      { id: "glass", name: "Old himoya oynasi", note: "Xona yoki ko‘cha uchun mos korpusni tanlaymiz" },
      { id: "ir", name: "IR yoritgich", note: "Tungi tasvirni sozlaymiz" },
      { id: "lens", name: "Linza bloki", note: "Burchak va ruxsatni joyga qarab tanlaymiz" },
      { id: "sensor", name: "Tasvir sensori", note: "Yorug‘lik sharoitiga mos kamerani tavsiya qilamiz" },
      { id: "board", name: "Asosiy plata: PoE va xotira", note: "Tarmoq va PoE kabelni tortamiz, arxiv va telefonda ko‘rishni sozlaymiz" },
      { id: "body", name: "Korpus va kronshteyn", note: "O‘rnatamiz va kafolat beramiz" }
    ] as Part[]
  },
  ru: {
    eyebrow: "Видеонаблюдение", title: "Что внутри камеры?", hint: "Прокрутите вниз — камера разберётся на части",
    doneTitle: "Подбираем и устанавливаем каждую деталь под ваш объект", cta: "Услуга видеонаблюдения",
    parts: [
      { id: "glass", name: "Защитное стекло", note: "Подбираем корпус для помещения или улицы" },
      { id: "ir", name: "ИК-подсветка", note: "Настраиваем ночное изображение" },
      { id: "lens", name: "Объектив", note: "Подбираем угол и разрешение под место" },
      { id: "sensor", name: "Матрица", note: "Советуем камеру под условия освещения" },
      { id: "board", name: "Основная плата: PoE и память", note: "Прокладываем сеть и PoE-кабель, настраиваем архив и просмотр с телефона" },
      { id: "body", name: "Корпус и кронштейн", note: "Устанавливаем и даём гарантию" }
    ] as Part[]
  },
  en: {
    eyebrow: "Video surveillance", title: "What is inside a camera?", hint: "Scroll down — the camera comes apart",
    doneTitle: "We choose and install every part to suit your site", cta: "Video surveillance service",
    parts: [
      { id: "glass", name: "Front cover glass", note: "We pick a housing for indoors or outdoors" },
      { id: "ir", name: "IR illuminator", note: "We tune the night picture" },
      { id: "lens", name: "Lens block", note: "We choose the angle and resolution for the spot" },
      { id: "sensor", name: "Image sensor", note: "We suggest a camera for the lighting" },
      { id: "board", name: "Main board: PoE and storage", note: "We run the network and PoE cable, set up recording and phone viewing" },
      { id: "body", name: "Housing and bracket", note: "We install it and give a warranty" }
    ] as Part[]
  }
};

/** Front to back; each layer's place on the axis when assembled (z0) and taken apart (z1), in px. */
const layout: Record<string, { z0: number; z1: number; side: "up" | "down"; start: number }> = {
  glass: { z0: 46, z1: 250, side: "up", start: 0.12 },
  ir: { z0: 30, z1: 150, side: "down", start: 0.22 },
  lens: { z0: 14, z1: 50, side: "up", start: 0.32 },
  sensor: { z0: -4, z1: -50, side: "down", start: 0.42 },
  board: { z0: -22, z1: -150, side: "up", start: 0.52 },
  body: { z0: -44, z1: -250, side: "down", start: 0.62 }
};

export function ExplodedDemo() {
  const { locale } = useSitePreferences();
  const c = copy[locale] ?? copy.uz;
  const root = useRef<HTMLElement>(null);
  const [still, setStill] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const motion = motionPreference();
    const sync = () => setStill(motion.matches);
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (still) { node.style.setProperty("--p", "1"); setDone(true); return; }
    let frame = 0;
    let last = -1;
    const update = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      const travel = Math.max(1, box.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -box.top / travel));
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      node.style.setProperty("--p", p.toFixed(3));
      setDone(p > 0.86);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [still]);

  return <section ref={root} className={`exploded-demo${still ? " is-still" : ""}${done ? " is-done" : ""}`} aria-labelledby="exploded-demo-title" style={{ "--p": 0 } as CSSProperties}>
    <div className="exploded-demo-sticky">
      <div className="exploded-demo-head">
        <span className="eyebrow">{c.eyebrow}</span>
        <h2 id="exploded-demo-title">{c.title}</h2>
        <div className="exploded-demo-cue">
          {!still && <p className="exploded-demo-hint">{c.hint}</p>}
          <div className="exploded-demo-done">
            <p>{c.doneTitle}</p>
            <Link className="button" href="/xizmat/toshkentda-videokuzatuv-ornatish" tabIndex={done ? undefined : -1}>{c.cta}</Link>
          </div>
        </div>
      </div>

      <div className="exploded-demo-stage" aria-hidden="true">
        <div className="exploded-demo-rig">
          {c.parts.map(part => {
            const place = layout[part.id];
            return <div key={part.id} className={`exploded-demo-layer is-${part.id}`} style={{ "--z0": `${place.z0}px`, "--z1": `${place.z1}px`, "--s": place.start } as CSSProperties}>
              <PartArt id={part.id} />
              <div className={`exploded-demo-tag is-${place.side}`}>
                <span className="exploded-demo-label"><strong>{part.name}</strong><span>{part.note}</span></span>
              </div>
            </div>;
          })}
        </div>
      </div>

      <ol className="exploded-demo-list">
        {c.parts.map(part => <li key={part.id} style={{ "--s": layout[part.id].start } as CSSProperties}><strong>{part.name}</strong><span>{part.note}</span></li>)}
      </ol>

    </div>
  </section>;
}

/** Rounded so the server and the browser print the same SVG numbers (no hydration mismatch). */
const at = (angle: number, radius: number, axis: "x" | "y") => Math.round((100 + (axis === "x" ? Math.cos(angle) : Math.sin(angle)) * radius) * 100) / 100;

/** Each part drawn face-on in a 200×200 box; the 3D comes from where the layer sits on the axis. */
function PartArt({ id }: { id: string }) {
  const g = `ed-${id}`;
  switch (id) {
    case "glass":
      return <svg viewBox="0 0 200 200" className="exploded-demo-art">
        <defs>
          <radialGradient id={g} cx="38%" cy="30%" r="80%"><stop offset="0" stopColor="#ffffff" stopOpacity=".55" /><stop offset=".45" stopColor="#bfe9ff" stopOpacity=".16" /><stop offset="1" stopColor="#6fb6d6" stopOpacity=".28" /></radialGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill={`url(#${g})`} stroke="#7fb6d2" strokeOpacity=".9" strokeWidth="3" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#5f9fbf" strokeOpacity=".35" strokeWidth="1.5" />
        <path d="M48 70 A60 60 0 0 1 104 38" fill="none" stroke="#ffffff" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round" />
        <path d="M150 128 A56 56 0 0 1 128 152" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      </svg>;
    case "ir":
      return <svg viewBox="0 0 200 200" className="exploded-demo-art">
        <defs>
          <radialGradient id={g}><stop offset=".6" stopColor="#1b222c" /><stop offset="1" stopColor="#0c1016" /></radialGradient>
          <radialGradient id={`${g}-led`}><stop offset="0" stopColor="#ff8a7a" /><stop offset=".55" stopColor="#b3261e" /><stop offset="1" stopColor="#3a0b0b" /></radialGradient>
        </defs>
        <path d="M100 10a90 90 0 1 0 0.01 0Zm0 42a48 48 0 1 1-0.01 0Z" fill={`url(#${g})`} fillRule="evenodd" stroke="#3a4656" strokeWidth="2" />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <g key={i}>
            <circle cx={at(a, 70, "x")} cy={at(a, 70, "y")} r="9" fill="#05070a" />
            <circle cx={at(a, 70, "x")} cy={at(a, 70, "y")} r="6.5" fill={`url(#${g}-led)`} className="exploded-demo-led" />
          </g>;
        })}
      </svg>;
    case "lens":
      return <svg viewBox="0 0 200 200" className="exploded-demo-art">
        <defs>
          <radialGradient id={g} cx="42%" cy="38%"><stop offset="0" stopColor="#5b6cff" stopOpacity=".9" /><stop offset=".35" stopColor="#1b2350" /><stop offset="1" stopColor="#020309" /></radialGradient>
          <linearGradient id={`${g}-barrel`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a5566" /><stop offset="1" stopColor="#141a22" /></linearGradient>
        </defs>
        <circle cx="100" cy="100" r="58" fill={`url(#${g}-barrel)`} stroke="#6b7a8f" strokeWidth="2" />
        {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return <line key={i} x1={at(a, 52, "x")} y1={at(a, 52, "y")} x2={at(a, 58, "x")} y2={at(a, 58, "y")} stroke="#0a0d12" strokeWidth="2" />; })}
        <circle cx="100" cy="100" r="44" fill="#0b0f15" stroke="var(--accent)" strokeOpacity=".7" strokeWidth="2" />
        <circle cx="100" cy="100" r="34" fill={`url(#${g})`} />
        <ellipse cx="88" cy="86" rx="11" ry="7" fill="#ffffff" fillOpacity=".55" transform="rotate(-30 88 86)" />
        <circle cx="113" cy="114" r="4" fill="#9fb2ff" fillOpacity=".5" />
      </svg>;
    case "sensor":
      return <svg viewBox="0 0 200 200" className="exploded-demo-art">
        <defs>
          <linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7b5cff" /><stop offset=".5" stopColor="#2bd4c9" /><stop offset="1" stopColor="#ff7ad9" /></linearGradient>
        </defs>
        <rect x="32" y="32" width="136" height="136" rx="10" fill="#0f3b33" stroke="#2f7a69" strokeWidth="2" />
        {[44, 156].flatMap(x => [44, 156].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#c9d3dc" stroke="#6b7a86" />))}
        <rect x="64" y="70" width="72" height="60" rx="5" fill="#16191f" stroke="#c9a85a" strokeWidth="2" />
        <rect x="74" y="80" width="52" height="40" rx="2" fill={`url(#${g})`} opacity=".85" />
        <path d="M58 150h84M58 160h60M150 60v80" stroke="#c9a85a" strokeOpacity=".7" strokeWidth="1.5" />
      </svg>;
    case "board":
      return <svg viewBox="0 0 200 200" className="exploded-demo-art">
        <circle cx="100" cy="100" r="84" fill="#123f35" stroke="#2f7a69" strokeWidth="2" />
        <path d="M40 100h40l10-12h30M100 40v34l14 10M130 120h30M60 130l20 20h40" fill="none" stroke="#c9a85a" strokeOpacity=".75" strokeWidth="1.6" />
        <rect x="76" y="76" width="48" height="48" rx="4" fill="#15181d" stroke="#3b4652" />
        <text x="100" y="104" textAnchor="middle" fontSize="9" fill="#8794a3" fontFamily="DM Sans, sans-serif">SoC</text>
        <rect x="132" y="66" width="22" height="34" rx="2" fill="#15181d" stroke="#3b4652" />
        <rect x="60" y="140" width="80" height="26" rx="3" fill="#c7ccd2" stroke="#7d8790" strokeWidth="1.5" />
        <rect x="72" y="146" width="56" height="14" rx="2" fill="#2a3038" />
        <text x="100" y="156" textAnchor="middle" fontSize="8" fill="#9fe8f2" fontFamily="DM Sans, sans-serif">PoE</text>
        <rect x="36" y="76" width="18" height="40" rx="2" fill="#aab3bd" stroke="#6b7682" />
        <rect x="40" y="82" width="10" height="28" rx="1" fill="#1d232b" />
        <text x="45" y="128" textAnchor="middle" fontSize="7" fill="#c9d3dc" fontFamily="DM Sans, sans-serif">SD</text>
      </svg>;
    default:
      return <svg viewBox="0 0 200 200" className="exploded-demo-art">
        <defs>
          <linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f7fb" /><stop offset=".55" stopColor="#c3ccd7" /><stop offset="1" stopColor="#8b97a6" /></linearGradient>
        </defs>
        <rect x="88" y="150" width="24" height="44" rx="5" fill={`url(#${g})`} stroke="#7d8996" />
        <rect x="64" y="184" width="72" height="12" rx="6" fill={`url(#${g})`} stroke="#7d8996" />
        <path d="M100 6a94 94 0 1 0 0.01 0Zm0 14a80 80 0 1 1-0.01 0Z" fill={`url(#${g})`} fillRule="evenodd" stroke="#8a96a4" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="80" fill="#0f141b" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#2a333f" strokeWidth="6" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="#1c232d" strokeDasharray="3 7" strokeWidth="2" />
      </svg>;
  }
}
