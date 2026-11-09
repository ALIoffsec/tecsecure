import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerOrders } from "@/components/order-views";
import { orderItemsWithProduct, withLineProducts } from "@/lib/order-lines";

export const dynamic = "force-dynamic";

export default async function PortalOrdersPage() {
  const user = await requireUser("/portal/orders");
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: { items: orderItemsWithProduct, history: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return <CustomerOrders orders={await withLineProducts(orders)} />;
}
