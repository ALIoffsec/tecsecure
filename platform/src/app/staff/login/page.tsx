import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

export default async function StaffLoginPage() {
  return <div className="container page-shell"><AuthForm mode="login" audience="staff" /></div>;
}
