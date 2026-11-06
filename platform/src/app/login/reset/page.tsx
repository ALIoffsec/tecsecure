import { CodeSignIn } from "@/components/code-sign-in";

export const metadata = { title: "Parolni tiklash | Tecsecure" };

export default function ResetPasswordPage() {
  return <CodeSignIn purpose="RESET" />;
}
