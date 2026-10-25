import { z } from "zod";
import { isResponse, requireModuleApi } from "@/lib/auth";
import {
  getAdminLearningDocuments,
  learningContentKinds,
  learningDocumentSummary,
  LearningContentValidationError,
  saveLearningDocument
} from "@/lib/learning-content";

export const runtime = "nodejs";

const kindSchema = z.enum(learningContentKinds);
const saveSchema = z.object({
  kind: kindSchema,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  data: z.unknown()
}).strict();

export async function GET(request: Request) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const requestedKind = new URL(request.url).searchParams.get("kind");
  if (requestedKind && !kindSchema.safeParse(requestedKind).success) {
    return Response.json({ error: "Ta’lim materialining turi noto‘g‘ri." }, { status: 400 });
  }
  try {
    const kinds = requestedKind ? [kindSchema.parse(requestedKind)] : learningContentKinds;
    const documents = (await Promise.all(kinds.map((kind) => getAdminLearningDocuments(kind))))
      .flat()
      .map(learningDocumentSummary);
    return Response.json({ documents }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin learning content listing failed", error);
    return Response.json({ error: "Ta’lim materiallarini yuklab bo‘lmadi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Ta’lim materiali uchun zarur maydonlar noto‘g‘ri." }, { status: 400 });
  try {
    const document = await saveLearningDocument(parsed.data.kind, parsed.data.data, parsed.data.status, actor.id, true);
    return Response.json({ document: learningDocumentSummary(document) }, { status: 201 });
  } catch (error) {
    if (error instanceof LearningContentValidationError) return Response.json({ error: error.message }, { status: 400 });
    console.error("Admin learning content creation failed", error);
    return Response.json({ error: "Ta’lim materialini yaratib bo‘lmadi." }, { status: 500 });
  }
}
