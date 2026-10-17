"use client";

import { useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";

type ServiceCategory = "network" | "installation" | "consulting" | "equipment";

const categories: { id: ServiceCategory; title: "serviceNetworkCategory" | "serviceInstallationCategory" | "serviceConsultingCategory" | "serviceEquipmentCategory"; image: "network" | "camera" | "clipboard" | "toolbox" }[] = [
  { id: "network", title: "serviceNetworkCategory", image: "network" },
  { id: "installation", title: "serviceInstallationCategory", image: "camera" },
  { id: "consulting", title: "serviceConsultingCategory", image: "clipboard" },
  { id: "equipment", title: "serviceEquipmentCategory", image: "toolbox" }
];

const contentKeys: Record<ServiceCategory, "networkInfrastructureServices" | "installationServices" | "consultingServices" | "equipmentBrands"> = {
  network: "networkInfrastructureServices",
  installation: "installationServices",
  consulting: "consultingServices",
  equipment: "equipmentBrands"
};

const illustrationKeys: Record<ServiceCategory, "networkIllustration" | "installationIllustration" | "consultingIllustration" | "equipmentIllustration"> = {
  network: "networkIllustration",
  installation: "installationIllustration",
  consulting: "consultingIllustration",
  equipment: "equipmentIllustration"
};

function ServiceArtwork({ category, description }: { category: ServiceCategory; description: string }) {
  return (
    <div className={`service-artwork service-artwork-${category}`} role="img" aria-label={description}>
      {category === "network" && <svg viewBox="0 0 360 230" aria-hidden="true">
        <rect x="115" y="24" width="132" height="182" rx="15" className="art-frame" />
        {[0, 1, 2, 3].map((row) => <g key={row}>
          <rect x="132" y={42 + row * 39} width="98" height="28" rx="6" className="art-device" />
          <circle cx="145" cy={56 + row * 39} r="4" className="art-light" />
          <path d={`M160 ${56 + row * 39}h54`} className="art-line" />
        </g>)}
        <circle cx="70" cy="76" r="24" className="art-node" /><circle cx="293" cy="151" r="25" className="art-node" />
        <path d="M92 84l28 15m127 57 22-4" className="art-connector" />
      </svg>}
      {category === "installation" && <svg viewBox="0 0 360 230" aria-hidden="true">
        <path d="M45 179h270M62 179V86h88v93m20 0V54h112v125" className="art-frame" />
        <rect x="78" y="101" width="57" height="32" rx="8" className="art-device" />
        <circle cx="108" cy="117" r="10" className="art-light" />
        <rect x="190" y="78" width="70" height="24" rx="6" className="art-device" />
        <rect x="190" y="118" width="70" height="24" rx="6" className="art-device" />
        <path d="M65 60l40-24 40 24M278 62l24 13v30l-24 13-24-13V75z" className="art-node" />
        <path d="M138 117h43m82 13h37m-144-29l45-26" className="art-connector" />
      </svg>}
      {category === "consulting" && <svg viewBox="0 0 360 230" aria-hidden="true">
        <path d="M101 27h119l43 43v135H101z" className="art-frame" />
        <path d="M220 28v44h43M127 94h86M127 116h53" className="art-line" />
        <rect x="126" y="140" width="22" height="42" rx="4" className="art-device" />
        <rect x="157" y="126" width="22" height="56" rx="4" className="art-light" />
        <rect x="188" y="108" width="22" height="74" rx="4" className="art-node" />
        <circle cx="285" cy="60" r="25" className="art-node" />
        <path d="M278 60l6 6 11-14M74 157l16 16 21-30" className="art-connector" />
      </svg>}
      {category === "equipment" && <svg viewBox="0 0 360 230" aria-hidden="true">
        <rect x="58" y="42" width="105" height="64" rx="12" className="art-frame" />
        <rect x="198" y="42" width="105" height="64" rx="12" className="art-frame" />
        <rect x="58" y="126" width="105" height="64" rx="12" className="art-frame" />
        <rect x="198" y="126" width="105" height="64" rx="12" className="art-frame" />
        <path d="M86 73h50m-25-15v30M224 73h52m-43-12v24m14-24v24m14-24v24M82 157h57m-49-12v25m16-25v25m16-25v25M225 158h51" className="art-line" />
        <circle cx="288" cy="172" r="6" className="art-light" />
      </svg>}
      <span className="service-art-label">{description}</span>
    </div>
  );
}

export function ServicesShowcase() {
  const { t } = useSitePreferences();
  const [selected, setSelected] = useState<ServiceCategory>("network");
  const active = categories.find(({ id }) => id === selected) ?? categories[0];
  const services = t(contentKeys[selected]).split("\n");

  return (
    <div className="service-showcase">
      <p className="page-intro">{t("serviceCategoryHint")}</p>
      <div className="service-category-tabs" role="tablist" aria-label={t("serviceCategoriesEyebrow")}>
        {categories.map(({ id, title, image }) => (
          <button
            key={id}
            id={`service-tab-${id}`}
            className={`service-category-tab ${selected === id ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={selected === id}
            aria-controls="service-category-panel"
            onClick={() => setSelected(id)}
          >
            <span aria-hidden="true"><UiIcon name={image} size={25} /></span>
            {t(title)}
          </button>
        ))}
      </div>
      <div className="service-category-panel" id="service-category-panel" role="tabpanel" aria-labelledby={`service-tab-${active.id}`}>
        <ServiceArtwork category={active.id} description={t(illustrationKeys[active.id])} />
        <div className="service-category-details">
          <span className="eyebrow">{t(active.title)}</span>
          <h3>{t(active.title)}</h3>
          {active.id === "equipment"
            ? <div className="equipment-brand-list">{services.map((brand) => <span className="equipment-brand" key={brand}>{brand}</span>)}</div>
            : <ul className="service-bullet-list">{services.map((service) => <li key={service}>{service}</li>)}</ul>}
        </div>
      </div>
    </div>
  );
}
