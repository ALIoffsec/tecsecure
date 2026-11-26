/**
 * Which ways a signed-in person may confirm it is really them before a sensitive change. Pure, so it is
 * tested without a database; lib/reauth.ts applies it.
 */

export const REAUTH_ACTIONS = ["TELEGRAM_LINK", "TELEGRAM_UNLINK", "TWO_FACTOR_START", "TWO_FACTOR_DISABLE", "EMAIL", "PHONE", "DELETE", "ADMIN_RESET_2FA"] as const;
export type ReauthAction = typeof REAUTH_ACTIONS[number];
export type ReauthMethod = "password" | "totp" | "telegram" | "phone" | "email" | "recent";

export const RECENT_SIGN_IN_MS = 10 * 60 * 1000;
export const REAUTH_VALID_MS = 10 * 60 * 1000;

export type ReauthSubject = {
  staff: boolean;
  twoFactor: boolean;
  telegramLinked: boolean;
  phoneVerified: boolean;
  /** Telegram Gateway is set up. SMS is not used here: only the sign-in and reset texts are approved. */
  gateway: boolean;
  realEmail: boolean;
  mailConfigured: boolean;
  sessionAgeMs: number;
};

/**
 * The methods offered, in order. Staff always give their password, plus the authenticator code when two-factor
 * is on (`withTotp`). A customer with two-factor gives only the authenticator or a backup code. Any other
 * customer may use the password (whether one is known is not guessed), a code to a linked Telegram, a code to a
 * proved number by Gateway, a code to a real mailbox, or a sign-in made in the last ten minutes.
 */
export function reauthMethods(subject: ReauthSubject): { methods: ReauthMethod[]; withTotp: boolean } {
  if (subject.staff) return { methods: ["password"], withTotp: subject.twoFactor };
  if (subject.twoFactor) return { methods: ["totp"], withTotp: false };
  const methods: ReauthMethod[] = [];
  if (subject.sessionAgeMs >= 0 && subject.sessionAgeMs <= RECENT_SIGN_IN_MS) methods.push("recent");
  methods.push("password");
  if (subject.telegramLinked) methods.push("telegram");
  if (subject.phoneVerified && subject.gateway) methods.push("phone");
  if (subject.realEmail && subject.mailConfigured) methods.push("email");
  return { methods, withTotp: false };
}

/** The address a proof is bound to: one person, one session (by its hash), one action. */
export function reauthTarget(userId: string, sessionHash: string, action: ReauthAction): string {
  return `reauth:${userId}:${sessionHash}:${action}`;
}

export type SignInWays = {
  realEmail: boolean;
  /** This very request was confirmed with the password, so the password is known to work. */
  confirmedWithPassword: boolean;
  /** An OAuth link to a provider that is configured right now. */
  oauth: boolean;
  phoneVerified: boolean;
  phoneCodes: boolean;
  mailConfigured: boolean;
};

/**
 * Whether the account still has a way in once Telegram is unlinked. A stored password hash proves nothing
 * (accounts made by phone, Telegram or OAuth get a random one), so it counts only when it was just used.
 */
export function hasOtherSignIn(ways: SignInWays): boolean {
  return (ways.realEmail && ways.confirmedWithPassword)
    || ways.oauth
    || (ways.phoneVerified && ways.phoneCodes)
    || (ways.realEmail && ways.mailConfigured);
}

/** Same as above, before knowing how the request will be confirmed: could any way remain at all? */
export function couldHaveOtherSignIn(ways: Omit<SignInWays, "confirmedWithPassword">): boolean {
  return hasOtherSignIn({ ...ways, confirmedWithPassword: true });
}
