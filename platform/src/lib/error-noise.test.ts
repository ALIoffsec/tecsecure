import assert from "node:assert/strict";
import test from "node:test";
import { isErrorNoise } from "./error-noise";

test("forged Server Action requests and closed connections are not reported as site errors", () => {
  for (const message of [
    "Error: Failed to find Server Action \"7f…\". This request might be from an older or newer deployment.",
    "Error: Failed to find Server Action. This request might be from an older or newer deployment.",
    "Error: The Server Reference ID did not match the expected format. Received \"abc\".",
    "Error: Invalid Server Actions request.",
    "Error: ECONNRESET",
    "AbortError: This operation was aborted"
  ]) assert.equal(isErrorNoise(message), true, message);
});

test("real server errors are still reported", () => {
  for (const message of [
    "Error: useSitePreferences must be used within SitePreferencesProvider",
    "PrismaClientKnownRequestError: Unique constraint failed on the fields: (`email`)",
    "TypeError: Cannot read properties of undefined (reading 'map')",
    "Error: Server Action failed to save the order"
  ]) assert.equal(isErrorNoise(message), false, message);
});
