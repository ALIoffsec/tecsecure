export function isAdminAccessActive(
  sessionExpiresAt: Date,
  adminAccessExpiresAt: Date | null,
  now: Date = new Date()
): boolean {
  return sessionExpiresAt > now && adminAccessExpiresAt !== null && adminAccessExpiresAt > now;
}
