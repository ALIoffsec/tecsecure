"use client";

import { useEffect } from "react";

// Replaces the root layout when it fails (for example, the database is unreachable),
// so it cannot use site providers or stylesheets.
export default function GlobalError({ error }: { error: unknown }) {
  useEffect(() => { console.error("Root layout failed", error); }, [error]);
  return <html lang="uz">
    <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "#080d20", color: "#f5f7fc", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
      <main>
        <h1 style={{ margin: "0 0 12px", fontSize: "1.6rem" }}>Tecsecure vaqtincha ishlamayapti</h1>
        <p style={{ margin: "0 0 20px", color: "#c3cee2" }}>Tez orada qayta ishga tushadi. Bir ozdan so‘ng urinib ko‘ring.</p>
        {/* A full reload is the only reliable recovery once the root layout has failed. */}
        <a href="/" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 999, background: "#89c8ff", color: "#071b30", fontWeight: 650, textDecoration: "none" }}>Qayta yuklash</a>
      </main>
    </body>
  </html>;
}
