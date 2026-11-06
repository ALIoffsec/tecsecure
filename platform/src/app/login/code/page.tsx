import { redirect } from "next/navigation";
import { CodeSignIn } from "@/components/code-sign-in";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Telefon raqam bilan kirish | Tecsecure" };

export default async function CodeLoginPage() {
  if (await getCurrentUser()) redirect("/portal");
  return <CodeSignIn purpose="LOGIN" />;
}
