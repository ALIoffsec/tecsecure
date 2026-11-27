import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminMonitoring } from "@/components/admin-monitoring";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Monitoring | Tecsecure" }, robots: { index: false, follow: false } };

/** Devices and customer subscriptions. Device checks are for administrators; subscriptions for the SUBSCRIPTIONS module. */
export default async function AdminMonitoringPage() {
  const actor = await requireAdminPage();
  const admin = actor.role === "FOUNDER" || actor.role === "ADMIN";
  const subscriptionsAllowed = admin || actor.permissions.includes("SUBSCRIPTIONS");
  if (!admin && !subscriptionsAllowed) redirect("/admin");
  const [devices, subscriptions, organizations, plans] = await Promise.all([
    admin ? prisma.device.findMany({
      orderBy: [{ monitored: "desc" }, { createdAt: "desc" }], take: 300,
      select: { id: true, type: true, model: true, hostname: true, monitoringMethod: true, monitored: true, status: true, lastCheckAt: true, organization: { select: { name: true } }, checks: { orderBy: { checkedAt: "desc" }, take: 1, select: { detail: true } } }
    }) : [],
    subscriptionsAllowed ? prisma.subscription.findMany({
      orderBy: { createdAt: "desc" }, take: 300,
      select: { id: true, status: true, trialEndsAt: true, createdAt: true, plan: { select: { name: true } }, organization: { select: { id: true, name: true } } }
    }) : [],
    subscriptionsAllowed ? prisma.organization.findMany({ orderBy: { name: "asc" }, take: 500, select: { id: true, name: true } }) : [],
    subscriptionsAllowed ? prisma.subscriptionPlan.findMany({ where: { active: true, trialDays: { gt: 0 } }, select: { id: true, name: true, trialDays: true } }) : []
  ]);
  return <AdminMonitoring devices={devices} subscriptions={subscriptions} organizations={organizations} plans={plans} canDevices={admin} />;
}
