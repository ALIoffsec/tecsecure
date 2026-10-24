import { prisma } from "@/lib/prisma";
import { MONITORING_INTERVAL_MS, parseMonitoringTarget, runTcpCheck } from "@/lib/monitoring";

const POLL_INTERVAL_MS = 15_000;
const BATCH_SIZE = 50;

async function runMonitoring() {
  const dueBefore = new Date(Date.now() - MONITORING_INTERVAL_MS);
  const devices = await prisma.device.findMany({
    where: { monitored: true, OR: [{ lastCheckAt: null }, { lastCheckAt: { lte: dueBefore } }] },
    orderBy: { lastCheckAt: "asc" },
    take: 20,
    select: { id: true, hostname: true, monitoringMethod: true }
  });
  for (const device of devices) {
    const target = parseMonitoringTarget(device.monitoringMethod, device.hostname);
    const result = target
      ? await runTcpCheck(target.host, target.port)
      : { online: false, latencyMs: null, detail: "Monitoring maqsadi noto‘g‘ri sozlangan." };
    const status = result.online ? "ONLINE" : "OFFLINE";
    await prisma.$transaction([
      prisma.monitoringCheck.create({ data: { deviceId: device.id, status, latencyMs: result.latencyMs, detail: result.detail } }),
      prisma.device.update({ where: { id: device.id }, data: { status, lastCheckAt: new Date() } })
    ]);
  }
}

async function runOnce() {
  const pending = await prisma.notification.findMany({
    where: { status: "PENDING", channel: { not: "IN_APP" } },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
    select: { id: true, channel: true }
  });

  for (const notification of pending) {
    await prisma.notification.updateMany({
      where: { id: notification.id, status: "PENDING" },
      data: {
        status: "FAILED",
        lastError: `${notification.channel} provider is not configured. No message was sent.`
      }
    });
    console.error(`Notification ${notification.id} failed: ${notification.channel} provider is not configured.`);
  }

  const now = new Date();
  const expiredTrials = await prisma.subscription.findMany({
    where: { status: "TRIAL_ACTIVE", trialEndsAt: { lte: now } },
    include: { organization: { select: { members: { select: { userId: true } } } } },
    take: BATCH_SIZE
  });
  for (const subscription of expiredTrials) {
    await prisma.$transaction(async (tx) => {
      const changed = await tx.subscription.updateMany({
        where: { id: subscription.id, status: "TRIAL_ACTIVE" },
        data: { status: "PAST_DUE" }
      });
      if (!changed.count) return;
      await tx.subscriptionEvent.create({
        data: { subscriptionId: subscription.id, fromStatus: "TRIAL_ACTIVE", toStatus: "PAST_DUE", note: "Trial muddati tugadi; avtomatik to‘lov olinmadi." }
      });
      await tx.notification.createMany({
        data: subscription.organization.members.map((member) => ({
          userId: member.userId,
          channel: "IN_APP",
          event: "TRIAL_EXPIRED",
          status: "DELIVERED",
          dedupKey: `${subscription.id}:expired:${member.userId}`,
          payload: { subscriptionId: subscription.id, message: "Trial tugadi. Avtomatik to‘lov olinmadi." }
        })),
        skipDuplicates: true
      });
    });
  }

  const upcomingTrials = await prisma.subscription.findMany({
    where: { status: "TRIAL_ACTIVE", trialEndsAt: { gt: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } },
    include: { organization: { select: { members: { select: { userId: true } } } } },
    take: BATCH_SIZE
  });
  for (const subscription of upcomingTrials) {
    const trialEndsAt = subscription.trialEndsAt;
    if (!trialEndsAt) continue;
    const daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const reminderWindow = daysRemaining > 3 ? "7-day" : daysRemaining > 1 ? "3-day" : "1-day";
    await prisma.notification.createMany({
      data: subscription.organization.members.map((member) => ({
        userId: member.userId,
        channel: "IN_APP",
        event: "TRIAL_EXPIRING",
        status: "DELIVERED",
        dedupKey: `${subscription.id}:${reminderWindow}:${member.userId}`,
        payload: { subscriptionId: subscription.id, daysRemaining, trialEndsAt: trialEndsAt.toISOString() }
      })),
      skipDuplicates: true
    });
  }

  await prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  await runMonitoring();
  await prisma.authRateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
}

async function main() {
  console.info("Tecsecure worker started. TCP monitoring runs for opted-in devices; external notification providers are not configured.");
  while (true) {
    try {
      await runOnce();
    } catch (error) {
      console.error("Worker cycle failed", error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main().catch((error: unknown) => {
  console.error("Worker stopped unexpectedly", error);
  process.exitCode = 1;
});
