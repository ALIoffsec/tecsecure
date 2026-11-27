/**
 * Phone numbers as account identity. Pure functions only (no database), so the rules can be tested alone.
 *
 * A number counts for sign-in, password reset and code delivery only on an account where it was proved
 * (phoneVerifiedAt set). A number someone merely typed into a profile is ignored there, and its text stays.
 */

/** One spelling for a Uzbek mobile number, however it was typed: +998901234567. Null if it is not one. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^998\d{9}$/.test(digits)) return `+${digits}`;
  if (/^\d{9}$/.test(digits)) return `+998${digits}`;
  return null;
}

export type PhoneHolder = {
  id: string;
  role: string;
  active: boolean;
  deletedAt: Date | null;
  phone: string | null;
  phoneVerifiedAt: Date | null;
  telegramChatId?: string | null;
};

/** Customer accounts that hold this number, proved or not. The email address never counts as proof. */
export function phoneHolders<T extends PhoneHolder>(accounts: T[], phone: string): { verified: T[]; unverified: T[] } {
  const holders = accounts.filter(account => account.role === "CUSTOMER" && !account.deletedAt && account.phone !== null && normalizePhone(account.phone) === phone);
  return {
    verified: holders.filter(account => account.phoneVerifiedAt !== null),
    unverified: holders.filter(account => account.phoneVerifiedAt === null)
  };
}

export type PhoneSignIn =
  /** a) exactly one active account proved this number: sign in to it. */
  | { kind: "signIn"; userId: string }
  /** b) the proved account is blocked, or more than one proved it: a person has to look. */
  | { kind: "review" }
  /** c) nobody holds the number: a new account, proved now. */
  | { kind: "create" }
  /** d) only accounts where it was typed but never proved: ask before opening anything. */
  | { kind: "choose" };

/** What a correct sign-in code for this number leads to. */
export function decidePhoneSignIn(accounts: PhoneHolder[], phone: string): PhoneSignIn {
  const { verified, unverified } = phoneHolders(accounts, phone);
  if (verified.length === 1) return verified[0].active ? { kind: "signIn", userId: verified[0].id } : { kind: "review" };
  if (verified.length > 1) return { kind: "review" };
  return unverified.length ? { kind: "choose" } : { kind: "create" };
}

/**
 * The one account that may receive this number's codes in its own Telegram, be reset through it, or have
 * a Telegram chat linked by sharing it: a single active account that proved the number. Otherwise null.
 */
export function phoneOwner<T extends PhoneHolder>(accounts: T[], phone: string): T | null {
  const { verified } = phoneHolders(accounts, phone);
  return verified.length === 1 && verified[0].active ? verified[0] : null;
}

/** The last two digits, enough to narrow the search to a few rows that are then compared whole. */
export function phoneSearchSuffix(phone: string): string {
  return phone.replace(/\D/g, "").slice(-2);
}

/** A phone for display with the middle hidden: "+998 90 *** ** 12". Anything that is not an Uzbek mobile keeps only its last two digits. */
export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) return `+998 ${digits.slice(3, 5)} *** ** ${digits.slice(-2)}`;
  return digits.length >= 4 ? `*** ${digits.slice(-2)}` : null;
}
