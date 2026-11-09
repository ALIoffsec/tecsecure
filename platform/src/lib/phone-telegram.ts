import { createHash, randomBytes, randomInt } from "node:crypto";
import { getTelegramCredentials } from "./integration-credentials";
import { findCustomerByPhone, hashCode, normalizePhone, type OtpPurpose } from "./otp";
import { prisma } from "./prisma";
import { sendTelegramMessage } from "./telegram";

const LINK_MS = 10 * 60 * 1000;
const CODE_MS = 5 * 60 * 1000;
export const PHONE_START_PREFIX = "v_";

const tokenHash = (token: string) => createHash("sha256").update(`phone-telegram:${token}`).digest("hex");

/** "+998 ** *** 12 34": enough to recognise, not enough to copy. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 12 ? `+${digits.slice(0, 3)} ** *** ${digits.slice(-4, -2)} ${digits.slice(-2)}` : "***";
}

/**
 * Step one on the site: a one-time bot link. The bot will ask the person to share their own Telegram
 * number, and only a number equal to `phone` gets a code.
 */
export async function startTelegramPhoneCheck(purpose: OtpPurpose, phone: string): Promise<string | null> {
  const { botToken, botUsername } = await getTelegramCredentials();
  const username = botUsername.replace(/^@/, "");
  if (!botToken || !username) return null;
  const token = randomBytes(24).toString("base64url");
  await prisma.phoneVerification.create({ data: { tokenHash: tokenHash(token), phone, purpose, expiresAt: new Date(Date.now() + LINK_MS) } });
  return `https://t.me/${username}?start=${PHONE_START_PREFIX}${token}`;
}

const shareButton = { keyboard: [[{ text: "📱 Raqamimni yuborish", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true };
const removeKeyboard = { remove_keyboard: true as const };

/** The bot opened from that link: remember the chat and ask for the contact. */
export async function onPhoneCheckStart(token: string, chatId: string): Promise<void> {
  const record = await prisma.phoneVerification.findUnique({ where: { tokenHash: tokenHash(token) } });
  if (!record || record.status !== "PENDING" || record.expiresAt <= new Date()) {
    await sendTelegramMessage(chatId, "Bu havola eskirgan. Saytda “Kodni Telegram orqali olish” tugmasini qayta bosing.");
    return;
  }
  await prisma.phoneVerification.update({ where: { id: record.id }, data: { chatId } });
  await sendTelegramMessage(chatId, [
    "<b>Tecsecure: telefon raqamini tasdiqlash</b>",
    `Saytda kiritilgan raqam: ${maskPhone(record.phone)}`,
    "Pastdagi “Raqamimni yuborish” tugmasini bosing. Raqam mos kelsa, tasdiqlash kodi shu yerga keladi."
  ].join("\n"), { replyMarkup: shareButton });
}

/**
 * A shared contact. It must be the sender's own (Telegram sets user_id), and its number must equal the
 * one typed on the site; then the code goes to this chat and is accepted on the site like an SMS code.
 */
export async function onSharedContact(chatId: string, fromId: number | undefined, contact: { phone_number: string; user_id?: number }): Promise<void> {
  const record = await prisma.phoneVerification.findFirst({ where: { chatId, status: "PENDING", expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
  if (!record) {
    await sendTelegramMessage(chatId, "Faol so‘rov topilmadi. Saytda “Kodni Telegram orqali olish” tugmasini qayta bosing.", { replyMarkup: removeKeyboard });
    return;
  }
  if (!fromId || contact.user_id !== fromId) {
    await sendTelegramMessage(chatId, "Faqat o‘zingizning raqamingizni “Raqamimni yuborish” tugmasi orqali yuboring.", { replyMarkup: shareButton });
    return;
  }
  const shared = normalizePhone(contact.phone_number);
  if (!shared || shared !== record.phone) {
    await prisma.phoneVerification.update({ where: { id: record.id }, data: { status: "MISMATCH" } });
    await sendTelegramMessage(chatId, `Telegram raqamingiz (${shared ? maskPhone(shared) : "noma’lum"}) saytda kiritilgan raqamga (${maskPhone(record.phone)}) mos emas. Kod yuborilmadi.\nSaytda Telegram’dagi raqamingizni kiriting yoki boshqa usulni tanlang.`, { replyMarkup: removeKeyboard });
    return;
  }
  const purpose = record.purpose === "RESET" ? "RESET" : "LOGIN";
  const customer = await findCustomerByPhone(record.phone);
  if (purpose === "RESET" && !customer) {
    await prisma.phoneVerification.update({ where: { id: record.id }, data: { status: "MISMATCH" } });
    await sendTelegramMessage(chatId, "Bu raqam bilan Tecsecure hisobi topilmadi.", { replyMarkup: removeKeyboard });
    return;
  }
  const code = String(randomInt(100000, 1000000));
  await prisma.$transaction(async (tx) => {
    await tx.phoneVerification.update({ where: { id: record.id }, data: { status: "SENT" } });
    await tx.otpCode.create({ data: { purpose, target: record.phone, codeHash: hashCode(code, record.phone), expiresAt: new Date(Date.now() + CODE_MS) } });
    // The number is now proved to belong to this Telegram account: connect them if neither is connected yet.
    if (customer && !customer.telegramChatId && !(await tx.user.findUnique({ where: { telegramChatId: chatId }, select: { id: true } }))) {
      await tx.user.update({ where: { id: customer.id }, data: { telegramChatId: chatId, phoneVerifiedAt: new Date() } });
    }
  });
  await sendTelegramMessage(chatId, `🔐 <b>Tecsecure</b>\n${purpose === "RESET" ? "Parolni tiklash" : "Kirish"} kodi: <code>${code}</code>\nKod 5 daqiqa amal qiladi. Uni hech kimga bermang.`, { replyMarkup: removeKeyboard });
}
