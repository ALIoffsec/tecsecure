import { z } from "zod";
import { buildCctvEstimate } from "@/lib/cctv";

export const runtime = "nodejs";

const schema = z.object({
  cameraCount: z.number().int().min(1).max(256),
  bitrateMbps: z.number().min(0.1).max(32).optional(),
  retentionDays: z.number().int().min(1).max(365),
  recordingHoursPerDay: z.number().min(1).max(24),
  cameraCountGrowth: z.number().int().min(0).max(128).optional(),
  poeWattsPerCamera: z.number().min(1).max(90).optional()
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Kiritilgan CCTV parametrlari noto‘g‘ri." }, { status: 400 });
  return Response.json(buildCctvEstimate(parsed.data));
}
