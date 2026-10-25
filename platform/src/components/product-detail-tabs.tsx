"use client";

import { useState, type ReactNode } from "react";

type ProductTab = {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
};

export function ProductDetailTabs({ tabs }: { tabs: ProductTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  return <>
    <div className="shop-tabs" role="group" aria-label="Mahsulot bo‘limlari">
      {tabs.map((tab) => <button
        key={tab.id}
        id={`product-tab-${tab.id}`}
        type="button"
        aria-pressed={activeTab === tab.id}
        aria-controls={`product-panel-${tab.id}`}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}{tab.count !== undefined && <span>{tab.count}</span>}
      </button>)}
    </div>
    {tabs.map((tab) => <div
      key={tab.id}
      id={`product-panel-${tab.id}`}
      aria-labelledby={`product-tab-${tab.id}`}
      className="shop-section"
      hidden={activeTab !== tab.id}
    >
      {tab.content}
    </div>)}
  </>;
}

export function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const canCollapse = text.length > 220;

  return <div className="shop-expandable-text">
    <p className={!expanded && canCollapse ? "is-collapsed" : ""} style={{ whiteSpace: "pre-line" }}>{text}</p>
    {canCollapse && <button
      className="shop-text-toggle"
      type="button"
      aria-expanded={expanded}
      onClick={() => setExpanded((value) => !value)}
    >
      {expanded ? "Kamroq" : "Batafsil"}
    </button>}
  </div>;
}

export function CollapsibleSpecs({ rows }: { rows: [string, string][] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? rows : rows.slice(0, 5);

  return <>
    {rows.length > 0 ? <table className="shop-specs">
      <tbody>
        {visibleRows.map(([label, value], index) => <tr key={`${label}-${index}`}>
          <th>{label}</th>
          <td>{value}</td>
        </tr>)}
      </tbody>
    </table> : <p className="muted">Xususiyatlar kiritilmagan.</p>}
    {rows.length > 5 && <button
      className="shop-text-toggle"
      type="button"
      aria-expanded={expanded}
      onClick={() => setExpanded((value) => !value)}
    >
      {expanded ? "Kamroq" : `Yana ${rows.length - 5} ta xususiyat`}
    </button>}
  </>;
}
