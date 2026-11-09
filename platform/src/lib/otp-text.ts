export type OtpPurpose = "LOGIN" | "RESET";

/**
 * The SMS texts, word for word. Eskiz delivers only texts that match a template approved in its cabinet,
 * and it approves a code text only when it names the site and says what the code is for.
 * Register exactly these two, with the digits as the variable part. Plain ASCII keeps each one a single SMS.
 */
export function otpSmsText(purpose: OtpPurpose, code: string): string {
  return purpose === "LOGIN"
    ? `tecsecure.uz saytiga kirish uchun tasdiqlash kodi: ${code}. Kodni hech kimga bermang!`
    : `tecsecure.uz saytida parolni tiklash uchun tasdiqlash kodi: ${code}. Agar buni siz so'ramagan bo'lsangiz, xabarga e'tibor bermang.`;
}
