import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Where scripts may come from. Only our own origin and the third parties the site really loads:
 * Yandex Metrika (consent-gated) and Telegram's Mini App script. 'unsafe-inline' stays because Next.js
 * and the two bootstrap scripts in the layout are inline and nonces would make every page dynamic;
 * eval is refused in production. Images, fonts and fetches are deliberately left open so maps, OAuth
 * and Google Fonts keep working.
 */
const baseScripts = ["'self'", "'unsafe-inline'", "blob:", "https://mc.yandex.ru", "https://mc.yandex.com", "https://yastatic.net", "https://telegram.org", ...(isDev ? ["'unsafe-eval'"] : [])];
/** Yandex Maps 2.1 (checkout only) loads further scripts from its own hosts and needs eval for its templates. */
const mapScripts = [...baseScripts, "https://api-maps.yandex.ru", "https://yandex.ru", "https://*.yandex.ru", "https://*.yandex.net", ...(isDev ? [] : ["'unsafe-eval'"])];

const csp = (scripts: string[]) => [
  `script-src ${scripts.join(" ")}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"])
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
    cpus: 2,
    // The dev disk cache left pages reloading in an endless loop after a server restart.
    turbopackFileSystemCacheForDev: false
  },
  poweredByHeader: false,
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy", value: csp(baseScripts) }
        ]
      },
      // Later rules win for the same header: the checkout map gets the wider script list.
      { source: "/cart", headers: [{ key: "Content-Security-Policy", value: csp(mapScripts) }] }
    ];
  }
};

export default nextConfig;
