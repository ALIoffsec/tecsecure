/**
 * Errors that are not bugs in the site, so the team is not alerted about them:
 * the visitor closed the page mid-response, or a scanner sent a forged Next.js Server Action request.
 * Everything else, however odd, is still recorded and reported.
 */
const VISITOR_LEFT = /destination stream errored|ResponseAborted|ERR_STREAM_PREMATURE_CLOSE|ECONNRESET|socket hang up|^AbortError/i;
const ACTION_PROBE = /Failed to find Server Action|Server Reference ID did not match the expected format|Invalid Server Actions? request/i;

export function isErrorNoise(message: string): boolean {
  return VISITOR_LEFT.test(message) || ACTION_PROBE.test(message);
}
