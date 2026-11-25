import { redirect } from "next/navigation";
import { CodeSignIn } from "@/components/code-sign-in";
import { getCurrentUser } from "@/lib/auth";
import { landingFor, safeNextPath } from "@/lib/safe-next";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Telefon raqam bilan kirish | Tecsecure" } };

export default async function CodeLoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const next = safeNextPath((await searchParams).next) ?? undefined;
  const user = await getCurrentUser();
  if (user) redirect(landingFor(user.role, next));
  return <CodeSignIn purpose="LOGIN" next={next} />;
}
