import assert from "node:assert/strict";
import test from "node:test";
import { decryptIntegrationCredential, encryptIntegrationCredential } from "./integration-credentials";

const masterSecret = "test-integration-encryption-key-0123456789abcdef";
const storageKey = "integration:telegram";

test("integration credentials encrypt at rest and decrypt with the same context", () => {
  const plaintext = JSON.stringify({ botToken: "token-value", adminChatId: "12345" });
  const encrypted = encryptIntegrationCredential(plaintext, storageKey, masterSecret);

  assert.notEqual(encrypted, plaintext);
  assert.match(encrypted, /^v1\./);
  assert.equal(decryptIntegrationCredential(encrypted, storageKey, masterSecret), plaintext);
  assert.notEqual(encrypted, encryptIntegrationCredential(plaintext, storageKey, masterSecret));
});

test("integration credential ciphertext cannot be moved to another setting or key", () => {
  const encrypted = encryptIntegrationCredential("credential", storageKey, masterSecret);

  assert.throws(() => decryptIntegrationCredential(encrypted, "integration:oauth:google", masterSecret));
  assert.throws(() => decryptIntegrationCredential(encrypted, storageKey, `${masterSecret}-changed`));
});
