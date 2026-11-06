import { prisma } from "@/lib/prisma";

/** The company card customers transfer to. Set by staff in Admin → Company; nothing here is customer data. */
export async function getPaymentCard() {
  const records = await prisma.siteSetting.findMany({ where: { key: { in: ["paymentCardNumber", "paymentCardHolder", "paymentCardBank"] } } });
  const values = Object.fromEntries(records.map(item => [item.key, item.value]));
  if (!values.paymentCardNumber?.trim()) return null;
  return { number: values.paymentCardNumber.trim(), holder: values.paymentCardHolder?.trim() ?? "", bank: values.paymentCardBank?.trim() ?? "" };
}

export type CompanyRequisites = { legalName: string; tin: string; address: string; bankName: string; account: string; mfo: string };

/** The seller's details on an invoice. Null until staff have filled in everything a bank transfer needs. */
export async function getCompanyRequisites(): Promise<CompanyRequisites | null> {
  const records = await prisma.siteSetting.findMany({ where: { key: { in: ["legalName", "legalTin", "legalAddress", "bankName", "bankAccount", "bankMfo"] } } });
  const values = Object.fromEntries(records.map(item => [item.key, item.value.trim()]));
  if (!values.legalName || !values.legalTin || !values.bankName || !values.bankAccount || !values.bankMfo) return null;
  return { legalName: values.legalName, tin: values.legalTin, address: values.legalAddress ?? "", bankName: values.bankName, account: values.bankAccount, mfo: values.bankMfo };
}
