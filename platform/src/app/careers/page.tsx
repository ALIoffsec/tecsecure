import type { Metadata } from "next";
import Link from "next/link";
import { CareerApplyLink } from "@/components/career-apply-link";
import { LocalizedText } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Karyera va vakansiyalar | Tecsecure",
  description: "Tecsecure jamoasidagi ochiq ish o‘rinlari va ishga qabul jarayoni."
};

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const emailSetting = isPreviewMode
    ? null
    : await prisma.siteSetting.findUnique({ where: { key: "email" }, select: { value: true } });
  const email = emailSetting?.value || "itstars134567890@gmail.com";

  return (
    <div className="container page-shell careers-page">
      <header className="careers-page-header">
        <span className="eyebrow"><LocalizedText id="careersEyebrow" /></span>
        <h1 className="page-title"><LocalizedText id="careersTitle" /></h1>
        <p className="lead page-intro"><LocalizedText id="careersDescription" /></p>
      </header>

      <section className="career-status-card panel-card" aria-labelledby="careers-openings-title">
        <span className="career-status-icon" aria-hidden="true"><UiIcon name="briefcase" size={24} /></span>
        <div>
          <span className="eyebrow"><LocalizedText id="careersOpeningsTitle" /></span>
          <h2 id="careers-openings-title"><LocalizedText id="careersNoOpenings" /></h2>
          <p><LocalizedText id="careersNoOpeningsDescription" /></p>
        </div>
      </section>

      <section className="career-application-card panel-card" aria-labelledby="careers-application-title">
        <div>
          <h2 id="careers-application-title"><LocalizedText id="careersApplicationTitle" /></h2>
          <p><LocalizedText id="careersApplicationDescription" /></p>
          <p className="careers-email-line">
            <LocalizedText id="careersEmailLabel" />: <a className="text-link" href={`mailto:${email}`}>{email}</a>
          </p>
        </div>
        <CareerApplyLink email={email} />
      </section>

      <div className="careers-details-grid">
        <section className="careers-info-card panel-card" aria-labelledby="careers-what-to-send-title">
          <h2 id="careers-what-to-send-title"><LocalizedText id="careersWhatToSendTitle" /></h2>
          <ul>
            <li><LocalizedText id="careersSendRole" /></li>
            <li><LocalizedText id="careersSendExperience" /></li>
            <li><LocalizedText id="careersSendContact" /></li>
          </ul>
        </section>
        <section className="careers-info-card panel-card" aria-labelledby="careers-process-title">
          <h2 id="careers-process-title"><LocalizedText id="careersProcessTitle" /></h2>
          <ol>
            <li><LocalizedText id="careersProcessStepOne" /></li>
            <li><LocalizedText id="careersProcessStepTwo" /></li>
            <li><LocalizedText id="careersProcessStepThree" /></li>
          </ol>
        </section>
      </div>

      <p className="careers-privacy-note">
        <LocalizedText id="careersPrivacyNote" />{" "}
        <Link href="/privacy"><LocalizedText id="privacyPolicy" /></Link>.
      </p>
    </div>
  );
}
