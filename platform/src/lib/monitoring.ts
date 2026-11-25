import { lookup } from "node:dns/promises";
import { BlockList, isIP, Socket } from "node:net";

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

const blockedIpv4 = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
  ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]
] as const) blockedIpv4.addSubnet(network, prefix, "ipv4");

// IPv6 has lists of its own: Node also matches IPv4 against IPv6 rules, so the two must not share one.
const globalIpv6 = new BlockList();
globalIpv6.addSubnet("2000::", 3, "ipv6");
const blockedIpv6 = new BlockList();
for (const [network, prefix] of [
  ["::", 96], ["::ffff:0:0", 96], ["64:ff9b::", 96], ["64:ff9b:1::", 48], ["100::", 64], ["2001::", 23], ["2001:db8::", 32],
  ["2002::", 16], ["3fff::", 20], ["fc00::", 7], ["fe80::", 10], ["fec0::", 10], ["ff00::", 8]
] as const) blockedIpv6.addSubnet(network, prefix, "ipv6");

/** True only for an address on the public internet: never loopback, private, link-local, mapped or otherwise special. */
export function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return !blockedIpv4.check(address, "ipv4");
  if (version === 6) return globalIpv6.check(address, "ipv6") && !blockedIpv6.check(address, "ipv6");
  return false;
}

type Lookup = (host: string) => Promise<string[]>;
const systemLookup: Lookup = async (host) => (await lookup(host, { all: true, verbatim: true })).map((entry) => entry.address);

/**
 * Every address the host resolves to, checked now. The check then connects to one of these same addresses,
 * so a second lookup cannot swap in another one.
 */
export async function resolvePublicAddresses(host: string, resolve: Lookup = systemLookup): Promise<{ ok: true; addresses: string[] } | { ok: false; reason: "dns" | "private" }> {
  let addresses: string[];
  try {
    addresses = isIP(host) ? [host] : await resolve(host);
  } catch {
    return { ok: false, reason: "dns" };
  }
  if (!addresses.length) return { ok: false, reason: "dns" };
  return addresses.every(isPublicAddress) ? { ok: true, addresses } : { ok: false, reason: "private" };
}

export type TcpCheckResult = { online: boolean; latencyMs: number | null; detail: string };

export async function runTcpCheck(host: string, port: number): Promise<TcpCheckResult> {
  const resolved = await resolvePublicAddresses(host);
  if (!resolved.ok) {
    return { online: false, latencyMs: null, detail: resolved.reason === "dns" ? "DNS nomi topilmadi." : "Manzil ommaviy emas; tekshiruv bajarilmadi." };
  }
  const addresses = resolved.addresses;
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
