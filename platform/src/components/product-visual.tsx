import type { ReactNode } from "react";
import { productKind, type ProductKind } from "@/lib/product-kind";

/** A one-unit hardware chassis seen from slightly above. */
function Chassis({ y, height, children }: { y: number; height: number; children?: ReactNode }) {
  return <>
    <path className="dv-top" d={`M28 ${y}l16-15h184l-16 15z`} />
    <path className="dv-side" d={`M212 ${y}l16-15v${height}l-16 15z`} />
    <rect className="dv-front" x="28" y={y} width="184" height={height} rx="3" />
    <path className="dv-shine" d={`M28 ${y + 1.5}h184`} />
    {children}
  </>;
}

function Ports({ x, y, columns, rows = 1, gap = 13 }: { x: number; y: number; columns: number; rows?: number; gap?: number }) {
  const ports = [];
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    ports.push(<rect key={`${row}-${column}`} className="dv-port" x={x + column * gap} y={y + row * 13} width={gap - 3} height="9" rx="1.2" />);
  }
  return <>{ports}</>;
}

const leds = (x: number, y: number, count: number) => Array.from({ length: count }, (_, index) =>
  <circle key={index} className={index === 0 ? "dv-led" : "dv-led-dim"} cx={x + index * 9} cy={y} r="2.1" />);

const art: Record<ProductKind, ReactNode> = {
  switch: <Chassis y={78} height={40}>
    {leds(38, 90, 3)}
    <path className="dv-detail" d="M38 104h26" />
    <Ports x={78} y={86} columns={9} rows={2} />
  </Chassis>,
  router: <>
    <path className="dv-antenna" d="M66 76 56 26M120 66V18M174 76l10-50" />
    <circle className="dv-led" cx="120" cy="18" r="2.6" />
    <Chassis y={82} height={34}>
      {leds(40, 99, 4)}
      <Ports x={106} y={94} columns={7} gap={14} />
    </Chassis>
  </>,
  recorder: <Chassis y={70} height={50}>
    <rect className="dv-screen" x="38" y="80" width="62" height="30" rx="3" />
    <path className="dv-screen-line" d="M44 102l12-10 10 6 14-13 14 9" />
    {leds(112, 86, 4)}
    <rect className="dv-port" x="112" y="96" width="30" height="10" rx="2" />
    <rect className="dv-port" x="148" y="96" width="30" height="10" rx="2" />
    <circle className="dv-detail-fill" cx="195" cy="95" r="9" />
    <circle className="dv-led" cx="195" cy="95" r="3" />
  </Chassis>,
  firewall: <Chassis y={76} height={44}>
    <path className="dv-emblem" d="M58 86l15 5v10c0 8-6 13-15 16-9-3-15-8-15-16V91z" />
    <path className="dv-emblem-mark" d="m52 100 4.5 4.5L65 96" />
    {leds(88, 90, 3)}
    <path className="dv-detail" d="M88 104h28" />
    <Ports x={128} y={92} columns={6} gap={13} />
    <rect className="dv-port" x="128" y="105" width="74" height="4" rx="2" />
  </Chassis>,
  bullet: <>
    <path className="dv-side" d="M108 108h18l6 30h-30z" />
    <rect className="dv-top" x="88" y="136" width="58" height="9" rx="3" />
    <rect className="dv-front" x="50" y="58" width="132" height="52" rx="16" />
    <path className="dv-top" d="M60 58h116a10 10 0 0 1 10 10l-8-1H62z" />
    <path className="dv-side" d="M170 58h4a16 16 0 0 1 16 16v20a16 16 0 0 1-16 16h-4z" />
    <circle className="dv-lens-ring" cx="66" cy="84" r="24" />
    <circle className="dv-lens" cx="66" cy="84" r="15" />
    <circle className="dv-lens-glint" cx="60" cy="78" r="4.5" />
    <circle className="dv-led" cx="104" cy="72" r="2.6" />
    <path className="dv-detail" d="M104 94h52" />
  </>,
  dome: <>
    <ellipse className="dv-top" cx="120" cy="56" rx="72" ry="16" />
    <path className="dv-front" d="M48 56v12c0 10 32 18 72 18s72-8 72-18V56c0 10-32 18-72 18s-72-8-72-18z" />
    <path className="dv-glass" d="M72 78c0 34 21 58 48 58s48-24 48-58c-14 5-30 8-48 8s-34-3-48-8z" />
    <circle className="dv-lens-ring" cx="120" cy="108" r="20" />
    <circle className="dv-lens" cx="120" cy="108" r="12" />
    <circle className="dv-lens-glint" cx="115" cy="103" r="3.6" />
    <circle className="dv-led" cx="150" cy="66" r="2.4" />
  </>,
  wifi: <>
    <path className="dv-wave" d="M72 54a68 68 0 0 1 96 0M88 70a45 45 0 0 1 64 0M104 86a22 22 0 0 1 32 0" />
    <ellipse className="dv-side" cx="120" cy="134" rx="74" ry="20" />
    <ellipse className="dv-front" cx="120" cy="126" rx="74" ry="20" />
    <ellipse className="dv-top" cx="120" cy="122" rx="62" ry="15" />
    <circle className="dv-led" cx="120" cy="122" r="3.4" />
  </>,
  access: <>
    <path className="dv-side" d="M172 36l10-8v110l-10 8z" />
    <path className="dv-top" d="M70 36l10-8h102l-10 8z" />
    <rect className="dv-front" x="70" y="36" width="102" height="110" rx="6" />
    <rect className="dv-screen" x="82" y="46" width="78" height="26" rx="3" />
    <path className="dv-screen-mark" d="m112 59 6 6 12-12" />
    {[0, 1, 2].map(row => [0, 1, 2].map(column => <rect key={`${row}${column}`} className="dv-port" x={88 + column * 24} y={82 + row * 19} width="18" height="13" rx="3" />))}
  </>,
  server: <>
    <Chassis y={42} height={30}><Ports x={38} y={52} columns={5} gap={18} />{leds(160, 57, 4)}</Chassis>
    <rect className="dv-front" x="28" y="76" width="184" height="30" rx="3" /><path className="dv-side" d="M212 76l16-15v30l-16 15z" /><Ports x={38} y={86} columns={5} gap={18} />{leds(160, 91, 4)}
    <rect className="dv-front" x="28" y="110" width="184" height="30" rx="3" /><path className="dv-side" d="M212 110l16-15v30l-16 15z" /><Ports x={38} y={120} columns={5} gap={18} />{leds(160, 125, 4)}
  </>,
  ups: <>
    <path className="dv-side" d="M162 30l12-10v118l-12 10z" />
    <path className="dv-top" d="M78 30l12-10h84l-12 10z" />
    <rect className="dv-front" x="78" y="30" width="84" height="118" rx="5" />
    <rect className="dv-screen" x="90" y="42" width="60" height="30" rx="3" />
    <path className="dv-screen-mark" d="M124 46l-12 12h10l-5 10 13-13h-10z" />
    {leds(102, 86, 4)}
    <path className="dv-detail" d="M90 104h60M90 116h60M90 128h60" />
  </>,
  phone: <>
    <path className="dv-side" d="M60 134l24-74h86l16 74z" />
    <path className="dv-front" d="M52 140l22-80h92l22 80z" />
    <rect className="dv-screen" x="92" y="70" width="56" height="20" rx="3" />
    <rect className="dv-top" x="54" y="46" width="30" height="88" rx="12" />
    {[0, 1, 2].map(row => [0, 1, 2].map(column => <rect key={`${row}${column}`} className="dv-port" x={98 + column * 16 + row * 2} y={96 + row * 13} width="12" height="9" rx="2" />))}
  </>,
  cable: <>
    <ellipse className="dv-coil" cx="120" cy="88" rx="66" ry="46" />
    <ellipse className="dv-coil" cx="120" cy="88" rx="52" ry="35" />
    <ellipse className="dv-coil" cx="120" cy="88" rx="38" ry="24" />
    <path className="dv-coil" d="M182 106c18 8 26 18 26 30" />
    <rect className="dv-top" x="198" y="134" width="20" height="16" rx="2.5" />
    <rect className="dv-led" x="203" y="150" width="10" height="4" rx="1" />
  </>,
  box: <>
    <path className="dv-top" d="M120 30l74 30-74 30-74-30z" />
    <path className="dv-front" d="M46 60l74 30v62l-74-30z" />
    <path className="dv-side" d="M194 60l-74 30v62l74-30z" />
    <path className="dv-detail" d="M83 45l74 30v18" />
    <circle className="dv-led" cx="84" cy="104" r="3" />
  </>
};

// Illustrative product-type artwork, not a product photograph.
export function ProductVisual({ categorySlug, productSlug, name, large = false }: { categorySlug?: string | null; productSlug?: string; name?: string; large?: boolean }) {
  const kind = productKind({ name, slug: productSlug, categorySlug });
  return <div className={`shop-visual shop-visual-${kind}${large ? " is-large" : ""}`} aria-hidden="true">
    <svg viewBox="0 0 240 180" role="presentation">
      <ellipse className="dv-shadow" cx="120" cy="158" rx="92" ry="9" />
      {art[kind]}
    </svg>
  </div>;
}
