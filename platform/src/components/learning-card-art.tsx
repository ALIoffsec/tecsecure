import type { Category } from "@/lib/learning-demo";

type Illustration = "topology" | "terminal" | "windows" | "router" | "shield" | "browser" | "analytics" | "wifi" | "directory" | "switch" | "camera" | "firewall" | "kerio";

const theme: Record<Category, { className: string; label: string }> = {
  networking: { className: "network", label: "Network topology illustration" },
  systems: { className: "systems", label: "Terminal and systems illustration" },
  security: { className: "security", label: "Cybersecurity shield illustration" },
  physical: { className: "physical", label: "Physical security camera illustration" }
};

const pathArtCategory: Record<string, Category> = {
  "soc-analyst": "security",
  "firewall-engineering-zero-to-hero": "security",
  "active-directory-security": "systems",
  "wireless-network-security": "security",
  "cctv-physical-security": "physical"
};

const illustrations: Record<string, Illustration> = {
  "network-fundamentals": "topology",
  "linux-fundamentals": "terminal",
  "windows-fundamentals": "windows",
  "mikrotik-routeros-basics": "router",
  "intro-cybersecurity": "shield",
  "web-security-owasp": "browser",
  "soc-log-analysis": "analytics",
  "wifi-security": "wifi",
  "active-directory-security": "directory",
  "cisco-ios-fundamentals": "switch",
  "cctv-system-design": "camera",
  "firewall-zero-to-hero": "firewall",
  "kerio-control-zero-to-hero": "kerio"
};

const pathIllustrations: Record<string, Illustration> = {
  "it-support-networking": "switch",
  "soc-analyst": "shield",
  "network-admin-mikrotik": "router",
  "firewall-engineering-zero-to-hero": "kerio",
  "cisco-ios-zero-to-hero": "topology",
  "wireless-network-security": "browser",
  "active-directory-security": "windows",
  "cctv-physical-security": "analytics"
};

const illustrationLabel: Record<Illustration, string> = {
  topology: "Network topology",
  terminal: "Linux terminal",
  windows: "Windows systems",
  router: "Router configuration",
  shield: "Cybersecurity shield",
  browser: "Web application security",
  analytics: "Security operations analytics",
  wifi: "Wireless network",
  directory: "Directory services",
  switch: "Cisco network switch",
  camera: "Video surveillance",
  firewall: "Firewall architecture",
  kerio: "Kerio Control gateway"
};

export function getPathArtCategory(slug: string, fallback: Category): Category {
  return pathArtCategory[slug] ?? fallback;
}

export function LearningCardArt({ category, slug, title, kind = "module" }: { category: Category; slug: string; title: string; kind?: "module" | "path" }) {
  const art = theme[category];
  const illustration = (kind === "path" ? pathIllustrations[slug] : illustrations[slug])
    ?? (category === "systems" ? "terminal" : category === "security" ? "shield" : category === "physical" ? "camera" : "topology");
  const gradientId = `learn-art-${kind}-${slug.replace(/[^a-z0-9-]/gi, "")}`;
  return (
    <div className={`learn-card-art learn-card-art-${art.className} learn-card-art-${illustration}`} role="img" aria-label={`${title} — ${illustrationLabel[illustration] || art.label}`}>
      <svg viewBox="0 0 520 180" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".34" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".04" />
          </linearGradient>
        </defs>
        <path className="learn-art-orbit" d="M18 145C116 15 265 8 502 43" />
        <path className="learn-art-orbit secondary" d="M4 171C150 87 329 72 510 115" />
        <path className="learn-art-glow" d="M26 0h494v180H26z" fill={`url(#${gradientId})`} />
        {illustration === "topology" && (
          <g className="learn-art-icon">
            <path d="M162 86h72m50 0h72M211 62l33-23m51 23-33-23M211 110l33 23m51-23-33 23" />
            <rect x="105" y="64" width="58" height="44" rx="10" />
            <rect x="234" y="64" width="50" height="44" rx="10" />
            <rect x="357" y="64" width="58" height="44" rx="10" />
            <circle cx="127" cy="86" r="4" /><circle cx="141" cy="86" r="4" />
            <circle cx="379" cy="86" r="4" /><circle cx="393" cy="86" r="4" />
            <circle cx="259" cy="86" r="7" />
          </g>
        )}
        {illustration === "terminal" && (
          <g className="learn-art-icon">
            <rect x="155" y="37" width="210" height="106" rx="13" />
            <path d="M155 63h210M181 86l18 14-18 14m37 0h47" />
            <circle cx="179" cy="50" r="3" /><circle cx="192" cy="50" r="3" /><circle cx="205" cy="50" r="3" />
          </g>
        )}
        {illustration === "shield" && (
          <g className="learn-art-icon">
            <path d="M260 31 337 59v44c0 33-30 53-77 69-47-16-77-36-77-69V59l77-28Z" />
            <rect x="234" y="82" width="52" height="42" rx="8" />
            <path d="M246 82v-9a14 14 0 0 1 28 0v9m-14 19v8" />
          </g>
        )}
        {illustration === "camera" && (
          <g className="learn-art-icon">
            <path d="M168 73h139l53 34v17H168a25 25 0 0 1 0-51Z" />
            <path d="m307 73 29-28 25 9-1 53m-192-34-22-18m0 18V52m0 11 22-18" />
            <circle cx="220" cy="98" r="17" />
            <circle cx="220" cy="98" r="8" />
          </g>
        )}
        {illustration === "windows" && (
          <g className="learn-art-icon">
            <path d="m172 50 80-12v50h-80V50Zm98-15 78-11v64h-78V35ZM172 98h80v49l-80-12V98Zm98 0h78v64l-78-11V98Z" />
          </g>
        )}
        {illustration === "router" && (
          <g className="learn-art-icon">
            <path d="m189 102 71-40 71 40v27H189v-27Zm44 27v-30h54v30M213 62V36m94 26V36m-94 0-15-15m15 15 15-15m79 15-15-15m15 15 15-15" />
            <circle cx="221" cy="113" r="4" /><circle cx="239" cy="113" r="4" /><circle cx="257" cy="113" r="4" />
          </g>
        )}
        {illustration === "browser" && (
          <g className="learn-art-icon">
            <rect x="153" y="35" width="214" height="112" rx="12" />
            <path d="M153 62h214m-190 28 14 13-14 13m34 0h45" />
            <circle cx="174" cy="49" r="3" /><circle cx="187" cy="49" r="3" /><circle cx="200" cy="49" r="3" />
            <path d="m324 82 20 8v15c0 10-8 17-20 22-12-5-20-12-20-22V90l20-8Z" />
          </g>
        )}
        {illustration === "analytics" && (
          <g className="learn-art-icon">
            <path d="M165 137V48m0 89h196M190 119V93h30v26m21 0V69h30v50m21 0V51h30v68m21 0V83h30v36" />
            <path d="m192 77 35-21 33 9 37-29 30 9 31-22" />
            <circle cx="192" cy="77" r="4" /><circle cx="227" cy="56" r="4" /><circle cx="260" cy="65" r="4" /><circle cx="297" cy="36" r="4" /><circle cx="327" cy="45" r="4" />
          </g>
        )}
        {illustration === "wifi" && (
          <g className="learn-art-icon">
            <path d="M166 73c52-47 136-47 188 0M194 100c37-33 95-33 132 0m-99 27c18-16 48-16 66 0" />
            <circle cx="260" cy="148" r="8" />
            <path d="M260 140v-30m-31-2 31 32 31-32" />
          </g>
        )}
        {illustration === "directory" && (
          <g className="learn-art-icon">
            <rect x="231" y="34" width="58" height="36" rx="9" />
            <rect x="149" y="113" width="58" height="36" rx="9" />
            <rect x="231" y="113" width="58" height="36" rx="9" />
            <rect x="313" y="113" width="58" height="36" rx="9" />
            <path d="M260 70v23m-82 0h164m-164 0v20m82-20v20m82-20v20" />
            <circle cx="260" cy="52" r="7" /><circle cx="178" cy="131" r="6" /><circle cx="260" cy="131" r="6" /><circle cx="342" cy="131" r="6" />
          </g>
        )}
        {illustration === "switch" && (
          <g className="learn-art-icon">
            <path d="m159 65 101-34 101 34v64l-101 34-101-34V65Z" />
            <path d="m159 65 101 36 101-36m-101 36v62" />
            <path d="M184 78v28m23-20v28m23-20v28m23-20v28m23-28v28m23-36v28m23-36v28" />
          </g>
        )}
        {illustration === "firewall" && (
          <g className="learn-art-icon">
            <path d="M154 55h212v91H154zM154 85h212m-212 30h212M207 55v30m53 0v30m53-30v30m-106 0v31m106-31v31" />
            <path d="m239 83 21 12 21-12m-42 34 21 12 21-12" />
          </g>
        )}
        {illustration === "kerio" && (
          <g className="learn-art-icon">
            <path d="m260 29 77 27v45c0 33-30 54-77 70-47-16-77-37-77-70V56l77-27Z" />
            <path d="M217 86h86m-86 24h86m-62-24v24m38-24v24" />
            <circle cx="260" cy="133" r="8" />
          </g>
        )}
        <circle className="learn-art-point" cx="75" cy="46" r="4" />
        <circle className="learn-art-point" cx="445" cy="145" r="5" />
        <circle className="learn-art-point" cx="473" cy="70" r="2.5" />
      </svg>
    </div>
  );
}
