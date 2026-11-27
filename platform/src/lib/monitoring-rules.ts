/**
 * Monitoring subscriptions: who starts a trial, the status moves, and what a cancellation stops. Pure, so it is
 * tested alone.
 */
export const LIVE_SUBSCRIPTION_STATUSES = ["TRIAL_ACTIVE", "ACTIVE", "PAST_DUE"] as const;

/** One trial per organisation, ever: a cancelled or expired trial still counts. */
export function trialAllowed(trialsSoFar: number): boolean {
  return trialsSoFar === 0;
}

const moves: Record<string, readonly string[]> = {
  NOT_ENROLLED: ["TRIAL_ACTIVE", "CANCELLED"],
  TRIAL_ACTIVE: ["ACTIVE", "PAST_DUE", "CANCELLED"],
  ACTIVE: ["PAST_DUE", "SUSPENDED", "CANCELLED"],
  PAST_DUE: ["ACTIVE", "SUSPENDED", "CANCELLED"],
  SUSPENDED: ["ACTIVE", "CANCELLED"],
  CANCELLED: []
};
export function subscriptionMoveAllowed(from: string, to: string): boolean {
  return moves[from]?.includes(to) ?? false;
}

/**
 * Device checks stop only when a subscription moves to CANCELLED and the organisation has no other live one.
 * Devices staff turned on without any subscription are never touched by this.
 */
export function cancelStopsMonitoring(to: string, otherLive: number): boolean {
  return to === "CANCELLED" && otherLive === 0;
}

/**
 * A device's status after a check: one failed check is not yet "not responding" (it shows as out of date);
 * two failed checks in a row are.
 */
export function nextDeviceStatus(online: boolean, previousOnline: boolean | null): "ONLINE" | "OFFLINE" | "STALE" {
  if (online) return "ONLINE";
  return previousOnline === false ? "OFFLINE" : "STALE";
}

/** A check that failed because the name does not resolve: the address itself is wrong. */
export function isWrongAddress(detail: string | null | undefined): boolean {
  return Boolean(detail && detail.startsWith("DNS"));
}
