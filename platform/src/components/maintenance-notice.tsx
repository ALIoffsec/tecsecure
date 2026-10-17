"use client";

import { MessageKey } from "@/lib/messages";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";

export function MaintenanceNotice({ title, description }: { title: MessageKey; description: MessageKey }) {
  const { t } = useSitePreferences();
  return (
    <section className="market-maintenance" aria-labelledby="maintenance-title">
      <div className="market-maintenance-icon" aria-hidden="true"><UiIcon name="settings" size={32} /></div>
      <h1 id="maintenance-title">{t(title)}</h1>
      <p className="lead">{t(description)}</p>
    </section>
  );
}
