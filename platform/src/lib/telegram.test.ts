import assert from "node:assert/strict";
import test from "node:test";
import {
  createTelegramAdminKeyboard,
  escapeTelegramHtml,
  parseTelegramAdminCallbackData
} from "./telegram";

test("Telegram HTML escaping keeps customer text from becoming bot markup", () => {
  assert.equal(escapeTelegramHtml("<script>&hello</script>"), "&lt;script&gt;&amp;hello&lt;/script&gt;");
});

test("admin notifications include reply, progress, completion, and admin-panel actions", () => {
  const keyboard = createTelegramAdminKeyboard("TS-2026-AB12", "https://example.test/admin");
  assert.deepEqual(keyboard, {
    inline_keyboard: [
      [
        { text: "✍️ Javob berish", callback_data: "tc:reply:TS-2026-AB12" },
        { text: "🟡 Jarayonda", callback_data: "tc:progress:TS-2026-AB12" }
      ],
      [
        { text: "✅ Yakunlash", callback_data: "tc:done:TS-2026-AB12" },
        { text: "🌐 Admin panel", url: "https://example.test/admin" }
      ]
    ]
  });
});

test("Telegram triage buttons only offer valid next actions", () => {
  const inProgress = createTelegramAdminKeyboard("ORD-2026-AB12", undefined, "in_progress");
  const completed = createTelegramAdminKeyboard("ORD-2026-AB12", "https://example.test/admin", "done");
  assert.deepEqual(inProgress, {
    inline_keyboard: [[
      { text: "✍️ Javob berish", callback_data: "tc:reply:ORD-2026-AB12" },
      { text: "✅ Yakunlash", callback_data: "tc:done:ORD-2026-AB12" }
    ]]
  });
  assert.deepEqual(completed, {
    inline_keyboard: [[{ text: "🌐 Admin panel", url: "https://example.test/admin" }]]
  });
});

test("Telegram admin callback data rejects malformed references and actions", () => {
  assert.deepEqual(parseTelegramAdminCallbackData("tc:reply:MSG-2026-AB12"), {
    action: "reply",
    reference: "MSG-2026-AB12"
  });
  assert.equal(parseTelegramAdminCallbackData("tc:delete:MSG-2026-AB12"), null);
  assert.equal(parseTelegramAdminCallbackData("tc:done:bad reference"), null);
});
