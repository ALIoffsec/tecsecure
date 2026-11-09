import nodemailer from "nodemailer";
import { getMailCredentials, type MailCredentials } from "./integration-credentials";

export class MailSendError extends Error {
  constructor(readonly detail: string) {
    super(`Mail: ${detail}`);
    this.name = "MailSendError";
  }
}

async function mailConfig(): Promise<MailCredentials | null> {
  try {
    const config = await getMailCredentials();
    return config.address && config.password && config.host ? config : null;
  } catch (error) {
    console.error("Mail settings could not be read", error instanceof Error ? error.message : "UnknownError");
    return null;
  }
}

export async function mailConfigured(): Promise<boolean> {
  return Boolean(await mailConfig());
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] as string);

/**
 * Sends one message from the company mailbox (Gmail SMTP by default). Plain text plus a simple HTML copy
 * with the code large and selectable; no images or tracking.
 */
export async function sendMail(to: string, subject: string, text: string, highlight?: string): Promise<void> {
  const config = await mailConfig();
  if (!config) throw new MailSendError("not configured");
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.address, pass: config.password },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
  });
  const paragraphs = text.split("\n").filter(Boolean).map(line => `<p style="margin:0 0 12px">${escapeHtml(line)}</p>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:480px">
    <p style="margin:0 0 16px;font-size:18px;font-weight:bold">Tecsecure</p>
    ${highlight ? `<p style="margin:0 0 16px;font-size:30px;font-weight:bold;letter-spacing:4px">${escapeHtml(highlight)}</p>` : ""}
    ${paragraphs}
    <p style="margin:24px 0 0;color:#666;font-size:12px">tecsecure.uz</p>
  </div>`;
  try {
    await transport.sendMail({ from: { name: config.senderName || "Tecsecure", address: config.address }, to, subject, text, html });
  } catch (error) {
    const detail = error instanceof Error ? error.message.slice(0, 300) : "unknown error";
    throw new MailSendError(detail);
  }
}
