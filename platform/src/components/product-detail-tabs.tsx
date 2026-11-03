"use client";

import { useState, type ReactNode } from "react";
import { useSitePreferences } from "./site-preferences";
import { shopCopy } from "@/lib/shop-copy";

type ProductTab = {
  id: string;
  label: ReactNode;
  count?: number;
  content: ReactNode;
};

export function ProductDetailTabs({ tabs }: { tabs: ProductTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const { locale } = useSitePreferences();

  return <>
    <div className="shop-tabs" role="group" aria-label={shopCopy[locale].details}>
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
  const { locale } = useSitePreferences();
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
      {expanded ? shopCopy[locale].less : shopCopy[locale].more}
    </button>}
  </div>;
}

export function CollapsibleSpecs({ rows }: { rows: [ReactNode, string][] }) {
  const { locale } = useSitePreferences();
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? rows : rows.slice(0, 5);

  return <>
    {rows.length > 0 ? <table className="shop-specs">
      <tbody>
        {visibleRows.map(([label, value], index) => <tr key={index}>
          <th>{label}</th>
          <td>{value}</td>
        </tr>)}
      </tbody>
    </table> : <p className="muted">{shopCopy[locale].missingSpecs}</p>}
    {rows.length > 5 && <button
      className="shop-text-toggle"
      type="button"
      aria-expanded={expanded}
      onClick={() => setExpanded((value) => !value)}
    >
      {expanded ? shopCopy[locale].less : `${shopCopy[locale].more} (${rows.length - 5})`}
    </button>}
  </>;
}
