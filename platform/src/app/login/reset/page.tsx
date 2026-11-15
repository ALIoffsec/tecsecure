import { CodeSignIn } from "@/components/code-sign-in";

export const metadata = { title: { absolute: "Parolni tiklash | Tecsecure" } };

export default function ResetPasswordPage() {
  return <CodeSignIn purpose="RESET" />;
}
