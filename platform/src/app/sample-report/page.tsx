import { SampleReportView } from "@/components/static-pages";

export const metadata = {
  title: { absolute: "Audit hisoboti namunasi | Tecsecure" },
  description: "Kiberxavfsizlik auditi hisobotining namunasi: topilmalar, xavf darajasi va tavsiyalar qanday ko‘rinishda beriladi.",
  alternates: { canonical: "/sample-report" }
};

export default function SampleReportPage() {
  return <SampleReportView />;
}
