import assert from "node:assert/strict";
import test from "node:test";
import { escapeTelegramHtml } from "./telegram";

test("Telegram HTML escaping keeps customer text from becoming bot markup", () => {
  assert.equal(escapeTelegramHtml("<script>&hello</script>"), "&lt;script&gt;&amp;hello&lt;/script&gt;");
});
