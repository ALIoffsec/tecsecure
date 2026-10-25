import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { getAuthOptions } from "@/lib/next-auth";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ nextauth: string[] }> };

async function handler(request: NextRequest, context: RouteContext) {
  return NextAuth(request, context, await getAuthOptions());
}

export { handler as GET, handler as POST };
