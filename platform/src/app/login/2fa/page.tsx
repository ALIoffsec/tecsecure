import { TwoFactorLanding } from "@/components/two-factor-landing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ikki bosqichli tasdiq | Tecsecure", robots: { index: false, follow: false } };

/** Where a Google/GitHub/Yandex/Microsoft sign-in lands when the account has two-factor on. */
export default async function TwoFactorPage({ searchParams }: { searchParams: Promise<{ ticket?: string | string[] }> }) {
  const { ticket } = await searchParams;
  return <TwoFactorLanding ticket={typeof ticket === "string" ? ticket : ""} />;
}
