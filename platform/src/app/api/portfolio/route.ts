import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const posts = await prisma.portfolioPost.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" }
  });
  return Response.json({ posts });
}
