import { parseTariffs, type DeliveryTariffs } from "./delivery";
import { prisma } from "./prisma";

export const TARIFFS_KEY = "deliveryTariffs";
export const VAT_KEY = "vatMode";
export type VatMode = "NONE" | "INCLUDED";

/** Delivery prices and the VAT setting, as staff saved them in Admin → Company. */
export async function getCheckoutSettings(): Promise<{ tariffs: DeliveryTariffs; vat: VatMode; companyAddress: string }> {
  const records = await prisma.siteSetting.findMany({ where: { key: { in: [TARIFFS_KEY, VAT_KEY, "address"] } }, select: { key: true, value: true } });
  const values = Object.fromEntries(records.map(record => [record.key, record.value]));
  return {
    tariffs: parseTariffs(values[TARIFFS_KEY]),
    vat: values[VAT_KEY] === "INCLUDED" ? "INCLUDED" : "NONE",
    companyAddress: values.address?.trim() ?? ""
  };
}
