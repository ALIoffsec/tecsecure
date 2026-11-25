import { CodeSignIn } from "@/components/code-sign-in";
import { safeNextPath } from "@/lib/safe-next";

export const metadata = { title: { absolute: "Parolni tiklash | Tecsecure" } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  return <CodeSignIn purpose="RESET" next={safeNextPath((await searchParams).next) ?? undefined} />;
}
