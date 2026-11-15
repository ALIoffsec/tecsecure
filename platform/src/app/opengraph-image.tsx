import { ImageResponse } from "next/og";

/** The site-wide share card (1200×630): the shield logo and the name, in the site's dark blue and cyan. */
export const alt = "Tecsecure — IT va kiberxavfsizlik";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// public/icon.svg, inlined so the card does not depend on reading files at request time.
const logo = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#0b1b2b"/><path d="M256 84l140 52v108c0 92-58 150-140 184-82-34-140-92-140-184V136z" fill="none" stroke="#50d5e8" stroke-width="28" stroke-linejoin="round"/><path d="M190 200h132M256 200v128" stroke="#50d5e8" stroke-width="30" stroke-linecap="round"/></svg>')}`;

export default function OpengraphImage() {
  return new ImageResponse(
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px",
      background: "radial-gradient(circle at 18% 12%, #123a57 0%, #0b1b2b 46%, #07111f 100%)", color: "#f2f6fc", fontFamily: "sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={128} height={128} alt="" style={{ borderRadius: 28, border: "2px solid #50d5e855" }} />
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>Tecsecure</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", width: 120, height: 6, borderRadius: 3, background: "#50d5e8" }} />
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 980 }}>Tecsecure — IT va kiberxavfsizlik</div>
        <div style={{ display: "flex", fontSize: 34, color: "#a8b7c9" }}>Videokuzatuv · Tarmoq · Kiberxavfsizlik · Ta’lim</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 32 }}>
        <div style={{ display: "flex", color: "#50d5e8", fontWeight: 700 }}>tecsecure.uz</div>
        <div style={{ display: "flex", color: "#a8b7c9" }}>Toshkent</div>
      </div>
    </div>,
    size
  );
}
