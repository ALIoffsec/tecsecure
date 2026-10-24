import { lookup } from "node:dns/promises";
import { isIP, Socket } from "node:net";

export const MONITORING_INTERVAL_MS = 5 * 60 * 1000;
export const MONITORING_TIMEOUT_MS = 4000;

export function parseMonitoringTarget(method: string | null | undefined, hostname: string | null | undefined) {
  const match = /^tcp:(\d{1,5})$/.exec(method ?? "");
  const host = (hostname ?? "").trim().toLowerCase();
  if (!match || !host || host.length > 253) return null;
  const port = Number(match[1]);
  if (port < 1 || port > 65535) return null;
  if (!/^[a-z0-9.-]+$/.test(host) && isIP(host) === 0) return null;
  return { host, port };
}

export function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 168 || (b === 0 && address.startsWith("192.0.0.")))) return false;
    if (a === 198 && (b === 18 || b === 19)) return false;
    return true;
  }
  if (version === 6) {
    const value = address.toLowerCase();
    if (value === "::" || value === "::1") return false;
    if (value.startsWith("::ffff:")) return isPublicAddress(value.slice(7));
    if (/^f[cd]/.test(value) || /^fe[89ab]/.test(value) || value.startsWith("ff")) return false;
    return true;
  }
  return false;
}

export type TcpCheckResult = { online: boolean; latencyMs: number | null; detail: string };

export async function runTcpCheck(host: string, port: number): Promise<TcpCheckResult> {
  let addresses: string[];
  try {
    addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((entry) => entry.address);
  } catch {
    return { online: false, latencyMs: null, detail: "DNS nomi topilmadi." };
  }
  if (!addresses.length || addresses.some((address) => !isPublicAddress(address))) {
    return { online: false, latencyMs: null, detail: "Manzil ommaviy emas; tekshiruv bajarilmadi." };
  }
  const started = Date.now();
  return new Promise<TcpCheckResult>((resolve) => {
    const socket = new Socket();
    const finish = (online: boolean, detail: string) => {
      socket.destroy();
      resolve({ online, latencyMs: online ? Date.now() - started : null, detail });
    };
    socket.setTimeout(MONITORING_TIMEOUT_MS);
    socket.once("connect", () => finish(true, `TCP ${port} ochiq.`));
    socket.once("timeout", () => finish(false, "Ulanish vaqti tugadi."));
    socket.once("error", () => finish(false, "Ulanib bo‘lmadi."));
    socket.connect(port, addresses[0]);
  });
}
