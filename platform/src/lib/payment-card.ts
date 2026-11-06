import { prisma } from "@/lib/prisma";

/** The company card customers transfer to. Set by staff in Admin → Company; nothing here is customer data. */
export async function getPaymentCard() {
  const records = await prisma.siteSetting.findMany({ where: { key: { in: ["paymentCardNumber", "paymentCardHolder", "paymentCardBank"] } } });
  const values = Object.fromEntries(records.map(item => [item.key, item.value]));
  if (!values.paymentCardNumber?.trim()) return null;
  return { number: values.paymentCardNumber.trim(), holder: values.paymentCardHolder?.trim() ?? "", bank: values.paymentCardBank?.trim() ?? "" };
}
