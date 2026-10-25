import { z } from "zod";
import { isResponse, requireModuleApi } from "@/lib/auth";
import {
  getAdminLearningDocument,
  learningContentKinds,
  LearningContentValidationError,
  saveLearningDocument,
  validateLearningData
} from "@/lib/learning-content";

export const runtime = "nodejs";
type Context = { params: Promise<{ kind: string; slug: string }> };

const kindSchema = z.enum(learningContentKinds);
const saveSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  data: z.unknown()
}).strict();

export async function GET(_request: Request, context: Context) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const params = await context.params;
  const kind = kindSchema.safeParse(params.kind);
  if (!kind.success) return Response.json({ error: "Ta’lim materialining turi noto‘g‘ri." }, { status: 400 });
  try {
    const document = await getAdminLearningDocument(kind.data, params.slug);
    if (!document) return Response.json({ error: "Ta’lim materiali topilmadi." }, { status: 404 });
    return Response.json({ document }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin learning content detail failed", error);
    return Response.json({ error: "Ta’lim materialini yuklab bo‘lmadi." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const params = await context.params;
  const kind = kindSchema.safeParse(params.kind);
  if (!kind.success) return Response.json({ error: "Ta’lim materialining turi noto‘g‘ri." }, { status: 400 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Ta’lim materiali uchun zarur maydonlar noto‘g‘ri." }, { status: 400 });
  try {
    const current = await getAdminLearningDocument(kind.data, params.slug);
    if (!current) return Response.json({ error: "Ta’lim materiali topilmadi." }, { status: 404 });
    const data = validateLearningData(kind.data, parsed.data.data);
    if (data.slug !== params.slug) {
      return Response.json({ error: "Ta’lim materiali slug qiymatini tahrirlab bo‘lmaydi." }, { status: 400 });
    }
    const document = await saveLearningDocument(kind.data, data, parsed.data.status, actor.id, false);
    return Response.json({ document });
  } catch (error) {
    if (error instanceof LearningContentValidationError) return Response.json({ error: error.message }, { status: 400 });
    console.error("Admin learning content update failed", error);
    return Response.json({ error: "Ta’lim materialini yangilab bo‘lmadi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const params = await context.params;
  const kind = kindSchema.safeParse(params.kind);
  if (!kind.success) return Response.json({ error: "Ta’lim materialining turi noto‘g‘ri." }, { status: 400 });
  try {
    const current = await getAdminLearningDocument(kind.data, params.slug);
    if (!current) return Response.json({ error: "Ta’lim materiali topilmadi." }, { status: 404 });
    await saveLearningDocument(kind.data, current.data, "ARCHIVED", actor.id, false);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof LearningContentValidationError) return Response.json({ error: error.message }, { status: 400 });
    console.error("Admin learning content archive failed", error);
    return Response.json({ error: "Ta’lim materialini arxivlab bo‘lmadi." }, { status: 500 });
  }
}
