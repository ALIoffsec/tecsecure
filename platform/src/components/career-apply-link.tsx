"use client";

import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";

export function CareerApplyLink({ email }: { email: string }) {
  const { t } = useSitePreferences();
  const subject = encodeURIComponent(t("careersEmailSubject"));
  const body = encodeURIComponent(t("careersEmailBody"));

  return (
    <a className="button career-apply-button" href={`mailto:${email}?subject=${subject}&body=${body}`}>
      <UiIcon name="mail" size={18} />
      {t("careersApplyAction")}
    </a>
  );
}
