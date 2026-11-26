import assert from "node:assert/strict";
import test from "node:test";
import { deletionBlockers, deletionBlockerText, type DeletionCounts } from "./account-rules";

const clear: DeletionCounts = { walletBalanceMinor: 0, pendingWallet: 0, openOrders: 0, openPayments: 0, openDisputes: 0, unpaidInvoices: 0, pendingPayments: 0, activeProjects: 0, shopBalanceMinor: 0, shopPayouts: 0, shopOpenParts: 0, soleOwner: false, paymePending: 0 };

test("a clean account can be closed", () => {
  assert.deepEqual(deletionBlockers(clear), []);
});

test("each open thing blocks on its own, and all are listed together", () => {
  const cases: [Partial<DeletionCounts>, string][] = [
    [{ walletBalanceMinor: 1 }, "WALLET_BALANCE"], [{ walletBalanceMinor: -1 }, "WALLET_BALANCE"], [{ pendingWallet: 1 }, "WALLET_PENDING"],
    [{ openOrders: 1 }, "ORDER_OPEN"], [{ openPayments: 1 }, "ORDER_PAYMENT_OPEN"], [{ openDisputes: 1 }, "DISPUTE_OPEN"],
    [{ unpaidInvoices: 1 }, "INVOICE_UNPAID"], [{ pendingPayments: 1 }, "PAYMENT_PENDING"], [{ activeProjects: 1 }, "PROJECT_ACTIVE"],
    [{ shopBalanceMinor: 5 }, "SHOP_OPEN"], [{ shopPayouts: 1 }, "SHOP_OPEN"], [{ shopOpenParts: 1 }, "SHOP_OPEN"],
    [{ soleOwner: true }, "ORGANIZATION_SOLE_OWNER"], [{ paymePending: 1 }, "PAYME_PENDING"]
  ];
  for (const [change, key] of cases) assert.deepEqual(deletionBlockers({ ...clear, ...change }), [key], key);
  assert.equal(deletionBlockers({ ...clear, walletBalanceMinor: 1, openOrders: 2, soleOwner: true }).length, 3);
});

test("every reason has a text and a link in every language", () => {
  for (const locale of ["uz", "ru", "en"] as const) {
    for (const key of deletionBlockers({ ...clear, walletBalanceMinor: 1, pendingWallet: 1, openOrders: 1, openPayments: 1, openDisputes: 1, unpaidInvoices: 1, pendingPayments: 1, activeProjects: 1, shopPayouts: 1, soleOwner: true, paymePending: 1 })) {
      assert.ok(deletionBlockerText[locale][key].text && deletionBlockerText[locale][key].href.startsWith("/"), `${locale} ${key}`);
    }
  }
});
