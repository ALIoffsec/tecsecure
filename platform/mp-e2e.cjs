// Marketplace end-to-end on the AUDIT database only. Setup and cleanup through Prisma; everything else over HTTP.
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const SCRATCH = "C:/Users/Asus/AppData/Local/Temp/claude/8b42b7aa0ea249a8/f7062ace-541f-4c8d-8866-5f170edd0a4b/scratchpad";
const url = fs.readFileSync(`${SCRATCH}/audit.url`, "utf8").trim();
if (!url.includes("tecsecure_audit")) throw new Error("Refusing: not the audit database");
const db = new PrismaClient({ datasources: { db: { url } } });
const BASE = "http://localhost:3000";
const out = [];
const check = (name, ok, extra = "") => { out.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  — ${extra}` : ""}`); };

class Agent {
  constructor() { this.jar = new Map(); }
  cookie() { return [...this.jar].map(([k, v]) => `${k}=${v}`).join("; "); }
  async req(path, { method = "GET", json, form, headers = {} } = {}) {
    const init = { method, headers: { ...headers, cookie: this.cookie(), origin: BASE }, redirect: "manual" };
    if (json !== undefined) { init.headers["content-type"] = "application/json"; init.body = JSON.stringify(json); }
    if (form) init.body = form;
    const res = await fetch(BASE + path, init);
    for (const c of res.headers.getSetCookie?.() ?? []) { const [pair] = c.split(";"); const i = pair.indexOf("="); const v = pair.slice(i + 1); if (v === "" || /Max-Age=0/i.test(c)) this.jar.delete(pair.slice(0, i)); else this.jar.set(pair.slice(0, i), v); }
    const text = await res.text();
    let body; try { body = JSON.parse(text); } catch { body = text; }
    return { status: res.status, body };
  }
}

async function upload(agent, file) {
  const form = new FormData();
  form.set("scope", "SHOP");
  form.set("file", new Blob([fs.readFileSync(`${SCRATCH}/mp/${file}`)], { type: "image/png" }), file);
  return agent.req("/api/media", { method: "POST", form });
}

(async () => {
  const seller = new Agent(), buyer = new Agent(), admin = new Agent(), anon = new Agent();
  const sellerEmail = (await db.user.findFirst({ where: { email: { startsWith: "qa-seller-" } }, select: { email: true } })).email;
  const buyerUser = await db.user.findFirst({ where: { email: { startsWith: "qa-csp-" } }, select: { id: true, email: true } });
  const shop = await db.shop.findFirst({ where: { owner: { email: sellerEmail } } });
  const startBalance = shop.balanceMinor;
  await db.user.update({ where: { id: buyerUser.id }, data: { walletBalanceMinor: 10_000_000_00 } });
  const category = await db.productCategory.findFirst({ select: { id: true } });
  const created = { products: [], orders: [], payouts: [] };

  check("seller login", (await seller.req("/api/auth/login", { method: "POST", json: { email: sellerEmail, password: "QaSeller!2026xyz" } })).status === 200);
  check("buyer login", (await buyer.req("/api/auth/login", { method: "POST", json: { email: buyerUser.email, password: "CspPass!2026xyz" } })).status === 200);
  check("admin login", (await admin.req("/api/auth/login", { method: "POST", json: { email: "qa-admin@tecsecure.test", password: "QaAdmin!2026xyz", audience: "staff" } })).status === 200);

  // Photos
  const small = await upload(seller, "small.png");
  check("small photo refused", small.status === 422, `${small.status} ${small.body.error ?? ""}`);
  const p1 = await upload(seller, "photo1.png"), p2 = await upload(seller, "photo2.png");
  check("photos uploaded", p1.status === 201 && p2.status === 201);
  const buyerUpload = await upload(buyer, "photo1.png");
  check("non-shop customer cannot upload shop photo", buyerUpload.status === 403, String(buyerUpload.status));

  // Create listing
  const base = { name: "QA-MP IP kamera 4MP", description: "Tungi ko‘rish 30 m, PoE, H.265, IP67 korpus — ofis va ombor uchun.", categoryId: category.id, brand: "Hikvision", model: "QA-4MP", priceMinor: 100_000_00, currency: "UZS", stockQuantity: 3, warrantyDescription: "12 oy", specifications: { Ruxsat: "4 MP" }, media: [p1.body.asset.id, p2.body.asset.id] };
  const badMedia = await seller.req("/api/shop/products", { method: "POST", json: { ...base, media: [buyerUpload.body?.asset?.id ?? "ckxxxxxxxxxxxxxxxxxxxxxxx"] } });
  check("foreign photo refused", badMedia.status === 400, String(badMedia.status));
  const create = await seller.req("/api/shop/products", { method: "POST", json: base });
  check("listing created as PENDING draft", create.status === 201 && create.body.product.moderation === "PENDING" && create.body.product.status === "DRAFT", JSON.stringify(create.body.error ?? ""));
  const productId = create.body.product.id; created.products.push(productId);
  const slug = create.body.product.slug;
  check("pending listing not public", (await anon.req(`/products/${slug}`)).status === 404);

  // Moderation
  const reject = await admin.req(`/api/admin/shop-products/${productId}`, { method: "PATCH", json: { action: "REJECT" } });
  check("reject needs reason", reject.status === 400);
  const approve = await admin.req(`/api/admin/shop-products/${productId}`, { method: "PATCH", json: { action: "APPROVE" } });
  check("staff approve", approve.status === 200);
  const page = await anon.req(`/products/${slug}`);
  check("approved listing is public with seller box", page.status === 200 && String(page.body).includes("shop-seller-box"), String(page.status));
  const catalog = await anon.req(`/products?q=${encodeURIComponent("QA-MP")}`);
  check("catalog card shows seller", String(catalog.body).includes("shop-card-seller"));

  // Quick edit: hide/show, price change does not need review
  const hide = await seller.req(`/api/shop/products/${productId}`, { method: "PATCH", json: { sellerHidden: true } });
  check("seller hides listing", hide.status === 200 && hide.body.product.status === "DRAFT");
  check("hidden listing not public", (await anon.req(`/products/${slug}`)).status === 404);
  const show = await seller.req(`/api/shop/products/${productId}`, { method: "PATCH", json: { sellerHidden: false, priceMinor: 120_000_00 } });
  check("seller shows again + price change without review", show.status === 200 && show.body.product.status === "PUBLISHED" && show.body.product.moderation === "APPROVED");
  const textEdit = await seller.req(`/api/shop/products/${productId}`, { method: "PUT", json: { ...base, priceMinor: 120_000_00, name: "QA-MP IP kamera 4MP Pro" } });
  check("text edit goes back to review and off sale", textEdit.status === 200 && textEdit.body.review === true && textEdit.body.product.status === "DRAFT");
  await admin.req(`/api/admin/shop-products/${productId}`, { method: "PATCH", json: { action: "APPROVE" } });

  // Ordering: cash refused, stock limit, wallet order
  const preview = await buyer.req("/api/orders/preview", { method: "POST", json: { ids: [productId] } });
  const pv = preview.body.products?.[0];
  check("preview carries seller", pv?.shop?.slug === shop.slug);
  const orderBody = (method, quantity) => ({ recipientName: "QA Xaridor", phone: "+998901234567", city: "Toshkent", address: "Chilonzor 1", paymentMethod: method, customerType: "INDIVIDUAL", items: [{ productId, quantity }] });
  const cash = await buyer.req("/api/orders", { method: "POST", json: orderBody("CASH", 1) });
  check("cash refused for shop goods", cash.status === 400 && cash.body.code === "SHOP_NEEDS_PREPAY", JSON.stringify(cash.body).slice(0, 120));
  const tooMany = await buyer.req("/api/orders", { method: "POST", json: orderBody("WALLET", 5) });
  check("stock limit enforced", tooMany.status === 409 && tooMany.body.code === "STOCK_LIMIT");
  const order = await buyer.req("/api/orders", { method: "POST", json: orderBody("WALLET", 2) });
  check("wallet order created", order.status === 201, JSON.stringify(order.body).slice(0, 200));
  const orderId = order.body.order?.id; created.orders.push(orderId);
  const part = await db.shopOrder.findUnique({ where: { orderId_shopId: { orderId, shopId: shop.id } } });
  check("shop part created with commission", part && part.itemsTotalMinor === 240_000_00 && part.commissionMinor === 36_000_00 && part.payoutMinor === 204_000_00, part ? `${part.itemsTotalMinor}/${part.commissionMinor}/${part.payoutMinor}` : "none");
  const stockNow = (await db.product.findUnique({ where: { id: productId }, select: { stockQuantity: true } })).stockQuantity;
  check("stock decreased 3→1", stockNow === 1, String(stockNow));

  // Seller fulfils
  const list = await seller.req("/api/shop/orders");
  check("seller sees its part with own lines", list.status === 200 && list.body.orders.some(o => o.order.id === orderId && o.order.items.length === 1));
  const skip = await seller.req(`/api/shop/orders/${orderId}`, { method: "PATCH", json: { status: "SHIPPED" } });
  check("cannot skip steps", skip.status === 409);
  for (const status of ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"]) {
    const step = await seller.req(`/api/shop/orders/${orderId}`, { method: "PATCH", json: { status, ...(status === "SHIPPED" ? { note: "Trek: QA123" } : {}) } });
    check(`seller → ${status}`, step.status === 200, JSON.stringify(step.body).slice(0, 120));
  }
  const orderAfter = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
  check("whole-shop order follows the part (DELIVERED)", orderAfter.status === "DELIVERED", orderAfter.status);
  const shopAfter = await db.shop.findUnique({ where: { id: shop.id }, select: { balanceMinor: true } });
  check("balance credited once with payout", shopAfter.balanceMinor === startBalance + 204_000_00, `${startBalance} → ${shopAfter.balanceMinor}`);
  const sales = await db.shopLedgerEntry.count({ where: { shopId: shop.id, shopOrderId: part.id, kind: "SALE" } });
  check("one SALE ledger line", sales === 1);
  const buyerView = await buyer.req("/portal/orders");
  check("buyer sees seller note", String(buyerView.body).includes("Trek: QA123"));

  // Overview + balance API
  const overview = await seller.req("/api/shop/overview");
  check("overview loads", overview.status === 200 && overview.body.money.balanceMinor === shopAfter.balanceMinor);

  // Promotion
  const promoOff = await seller.req(`/api/shop/products/${productId}/promote`, { method: "POST", json: { days: 2 } });
  check("promotion off without a price", promoOff.status === 409 && promoOff.body.code === "PROMOTION_OFF");
  const priceSet = await admin.req("/api/admin/shop-promotion", { method: "PUT", json: { pricePerDayMinor: 5_000_00, maxDays: 14 } });
  check("admin sets ad price", priceSet.status === 200);
  const promo = await seller.req(`/api/shop/products/${productId}/promote`, { method: "POST", json: { days: 2 } });
  check("promotion bought from balance", promo.status === 200 && promo.body.balanceMinor === shopAfter.balanceMinor - 10_000_00, JSON.stringify(promo.body).slice(0, 120));
  const catalog2 = await anon.req("/products");
  const html = String(catalog2.body);
  check("advertised card marked and first", html.includes("shop-card-ad") && html.indexOf("QA-MP") > -1 && html.indexOf("QA-MP") < html.indexOf("shop-card-body", html.indexOf("shop-card-body") + 1));

  // Payout
  const noDetails = await seller.req("/api/shop/payouts", { method: "POST", json: { amountMinor: 1000_00 } });
  check("payout needs bank details", noDetails.status === 409 && noDetails.body.code === "NO_DETAILS");
  const card = await seller.req("/api/shop/balance", { method: "PUT", json: { payoutBankName: "Kapitalbank", payoutAccount: "8600123412341234", payoutMfo: "01088", payoutRecipient: "QA MChJ" } });
  check("card number refused as account", card.status === 400);
  const details = await seller.req("/api/shop/balance", { method: "PUT", json: { payoutBankName: "Kapitalbank", payoutAccount: "2020 8000 1234 5678 9012", payoutMfo: "01088", payoutRecipient: "QA MChJ" } });
  check("bank details saved", details.status === 200);
  const before = (await db.shop.findUnique({ where: { id: shop.id }, select: { balanceMinor: true } })).balanceMinor;
  const tooBig = await seller.req("/api/shop/payouts", { method: "POST", json: { amountMinor: before + 100 } });
  check("payout above balance refused", tooBig.status === 409);
  const payout = await seller.req("/api/shop/payouts", { method: "POST", json: { amountMinor: 50_000_00 } });
  check("payout requested and held", payout.status === 201, JSON.stringify(payout.body).slice(0, 120));
  created.payouts.push(payout.body.payout?.id);
  const second = await seller.req("/api/shop/payouts", { method: "POST", json: { amountMinor: 1000_00 } });
  check("only one open payout", second.status === 409 && second.body.code === "PAYOUT_OPEN");
  const reject2 = await admin.req(`/api/admin/shop-payouts/${payout.body.payout.id}`, { method: "PATCH", json: { action: "REJECT", note: "QA qaytarish" } });
  const afterReject = (await db.shop.findUnique({ where: { id: shop.id }, select: { balanceMinor: true } })).balanceMinor;
  check("rejected payout returns money", reject2.status === 200 && afterReject === before, `${before} vs ${afterReject}`);
  const payout2 = await seller.req("/api/shop/payouts", { method: "POST", json: { amountMinor: 50_000_00 } });
  created.payouts.push(payout2.body.payout?.id);
  const paid = await admin.req(`/api/admin/shop-payouts/${payout2.body.payout.id}`, { method: "PATCH", json: { action: "PAID", reference: "QA-PP-1" } });
  const twice = await admin.req(`/api/admin/shop-payouts/${payout2.body.payout.id}`, { method: "PATCH", json: { action: "PAID", reference: "QA-PP-1" } });
  check("payout marked paid once", paid.status === 200 && twice.status === 409);
  const ledger = await db.shopLedgerEntry.findMany({ where: { shopId: shop.id }, orderBy: { createdAt: "asc" } });
  const last = ledger[ledger.length - 1];
  const finalBalance = (await db.shop.findUnique({ where: { id: shop.id }, select: { balanceMinor: true } })).balanceMinor;
  check("ledger explains the balance", last.balanceAfterMinor === finalBalance && ledger.reduce((s, e) => s + e.amountMinor, 0) === finalBalance - (startBalance - 0), `sum=${ledger.reduce((s, e) => s + e.amountMinor, 0)} final=${finalBalance} start=${startBalance}`);

  // Cancel by shop: stock back, wallet refunded
  const order2 = await buyer.req("/api/orders", { method: "POST", json: orderBody("WALLET", 1) });
  created.orders.push(order2.body.order?.id);
  const walletMid = (await db.user.findUnique({ where: { id: buyerUser.id }, select: { walletBalanceMinor: true } })).walletBalanceMinor;
  const noReason = await seller.req(`/api/shop/orders/${order2.body.order.id}`, { method: "PATCH", json: { status: "CANCELLED" } });
  check("cancel needs reason", noReason.status === 400);
  const cancel = await seller.req(`/api/shop/orders/${order2.body.order.id}`, { method: "PATCH", json: { status: "CANCELLED", note: "Omborda qolmadi (QA)" } });
  const stockBack = (await db.product.findUnique({ where: { id: productId }, select: { stockQuantity: true } })).stockQuantity;
  const walletAfter = (await db.user.findUnique({ where: { id: buyerUser.id }, select: { walletBalanceMinor: true } })).walletBalanceMinor;
  const o2 = await db.order.findUnique({ where: { id: order2.body.order.id }, select: { status: true, paymentStatus: true, totalMinor: true } });
  check("shop cancel: order cancelled + refunded + stock back", cancel.status === 200 && o2.status === "CANCELLED" && o2.paymentStatus === "REFUNDED" && walletAfter === walletMid + o2.totalMinor && stockBack === 1, `${o2.status}/${o2.paymentStatus} stock=${stockBack}`);

  // Storefront, QR, referral → lower commission
  const store = await anon.req(`/s/${shop.slug}`);
  check("storefront page", store.status === 200 && String(store.body).includes("QA-MP"));
  const qr = await fetch(`${BASE}/api/shops/${shop.slug}/qr`);
  check("QR png", qr.status === 200 && qr.headers.get("content-type") === "image/png");
  check("visit card page", (await anon.req(`/s/${shop.slug}/card`)).status === 200);
  const ref = await buyer.req("/api/ref", { method: "POST", json: { slug: shop.slug } });
  check("referral cookie set", ref.status === 200 && buyer.jar.has("tec_ref"));
  const order3 = await buyer.req("/api/orders", { method: "POST", json: orderBody("WALLET", 1) });
  created.orders.push(order3.body.order?.id);
  const part3 = await db.shopOrder.findUnique({ where: { orderId_shopId: { orderId: order3.body.order.id, shopId: shop.id } } });
  check("QR buyer gets referral commission", part3?.commissionPercent === shop.referralCommissionPercent, `${part3?.commissionPercent} vs ${shop.referralCommissionPercent}`);

  // Bot message text endpoint not callable here; suspend hides listings
  const suspend = await admin.req(`/api/admin/shops/${shop.id}`, { method: "PATCH", json: { action: "SUSPEND", note: "QA" } });
  const hidden = (await db.product.findUnique({ where: { id: productId }, select: { status: true } })).status;
  const reactivate = await admin.req(`/api/admin/shops/${shop.id}`, { method: "PATCH", json: { action: "REACTIVATE" } });
  const back = (await db.product.findUnique({ where: { id: productId }, select: { status: true } })).status;
  check("suspend hides, reactivate restores listings", suspend.status === 200 && hidden === "DRAFT" && reactivate.status === 200 && back === "PUBLISHED", `${hidden} → ${back}`);

  fs.writeFileSync(`${SCRATCH}/mp/created.json`, JSON.stringify({ ...created, shopId: shop.id, startBalance, buyerId: buyerUser.id, sellerEmail }, null, 2));
  console.log(out.join("\n"));
  console.log(`\n${out.filter(l => l.startsWith("PASS")).length}/${out.length} passed`);
  await db.$disconnect();
})().catch(async error => { console.log(out.join("\n")); console.error("CRASH", error); await db.$disconnect(); process.exit(1); });
