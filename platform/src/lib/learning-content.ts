import { z } from "zod";
import { learningModules, learningPaths, type LearningModule, type LearningPath, type Localized } from "@/lib/learning-demo";
import { learningLabs, type LabDef } from "@/lib/learning-labs";
import { learningExams, type ExamDef } from "@/lib/learning-exams";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";

export const learningContentKinds = ["module", "path", "lab", "exam"] as const;
export type LearningContentKind = typeof learningContentKinds[number];
export type LearningDataByKind = {
  module: LearningModule;
  path: LearningPath;
  lab: LabDef;
  exam: ExamDef;
};
export type LearningPublicationStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LearningAdminDocument<K extends LearningContentKind = LearningContentKind> = K extends LearningContentKind ? {
  id: string | null;
  kind: K;
  slug: string;
  status: LearningPublicationStatus;
  data: LearningDataByKind[K];
  updatedAt: Date | null;
} : never;

export class LearningContentValidationError extends Error {}

const slugSchema = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug faqat kichik lotin harflari, raqam va chiziqchadan iborat bo‘lsin.");
const localizedSchema = z.union([
  z.string().trim().min(1).max(30000),
  z.object({ uz: z.string().max(30000), ru: z.string().max(30000), en: z.string().max(30000) }).strict()
]);
const learningImageSchema = z.object({
  src: z.string().trim().min(1).max(1000),
  alt: localizedSchema,
  caption: localizedSchema,
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000)
}).strict();
const diagramSchema = z.object({
  kind: z.enum(["cli-modes", "topology"]),
  caption: localizedSchema,
  nodes: z.array(localizedSchema).max(100),
  links: z.array(localizedSchema).max(100)
}).strict();
const questionSchema = z.object({
  prompt: localizedSchema,
  answers: z.array(z.string().trim().min(1).max(500)).min(1).max(100)
}).strict();
const terminalPracticeSchema = z.object({
  instructions: localizedSchema,
  tasks: z.array(z.object({
    id: slugSchema,
    command: z.string().trim().min(1).max(500),
    prompt: localizedSchema
  }).strict()).min(1).max(100)
}).strict();
const sectionSchema = z.object({
  title: localizedSchema,
  content: localizedSchema.optional(),
  example: localizedSchema.optional(),
  exampleExplanation: localizedSchema.optional(),
  images: z.array(learningImageSchema).max(30).optional(),
  diagram: diagramSchema.optional(),
  question: questionSchema.optional(),
  terminalPractice: terminalPracticeSchema.optional()
}).strict();
const referenceSchema = z.object({ label: localizedSchema, href: z.string().trim().min(1).max(2000) }).strict();

const moduleSchema = z.object({
  slug: slugSchema,
  title: localizedSchema,
  summary: localizedSchema,
  difficulty: z.enum(["fundamental", "easy", "medium", "hard"]),
  category: z.enum(["networking", "systems", "security", "physical"]),
  hours: z.number().positive().max(10000),
  hasLab: z.boolean(),
  labPlan: localizedSchema.optional(),
  references: z.array(referenceSchema).max(100).optional(),
  sections: z.array(sectionSchema).min(1).max(200)
}).strict();
const pathSchema = z.object({
  slug: slugSchema,
  kind: z.enum(["jobRole", "skill"]),
  title: localizedSchema,
  summary: localizedSchema,
  timeEstimate: localizedSchema,
  prerequisites: localizedSchema,
  outcomes: localizedSchema,
  capstone: localizedSchema,
  modules: z.array(slugSchema).min(1).max(100)
}).strict();
const labSchema = z.object({
  slug: slugSchema,
  moduleSlug: slugSchema,
  title: z.string().trim().min(1).max(200),
  level: z.enum(["boshlang‘ich", "o‘rta", "ilg‘or"]),
  minutes: z.number().int().positive().max(10000),
  priceTec: z.number().int().nonnegative().max(100000000),
  summary: z.string().trim().min(1).max(5000),
  scenario: z.string().trim().min(1).max(30000),
  skills: z.array(z.string().trim().min(1).max(200)).max(100),
  evidence: z.array(z.object({
    name: z.string().trim().min(1).max(200),
    content: z.string().max(50000)
  }).strict()).max(100),
  tasks: z.array(z.object({
    id: slugSchema,
    prompt: z.string().trim().min(1).max(5000),
    answers: z.array(z.string().trim().min(1).max(500)).min(1).max(100),
    hint: z.string().max(5000)
  }).strict()).min(1).max(100),
  debrief: z.string().max(30000)
}).strict();
const examSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  credential: z.string().trim().min(1).max(200),
  acronym: z.string().trim().min(1).max(40),
  accent: z.string().trim().min(1).max(40),
  summary: z.string().trim().min(1).max(5000),
  feeTec: z.number().int().nonnegative().max(100000000),
  minutes: z.number().int().positive().max(10000),
  passPercent: z.number().int().min(1).max(100),
  requiredModules: z.array(slugSchema).max(100),
  requiredLabs: z.array(slugSchema).max(100),
  topics: z.array(z.string().trim().min(1).max(200)).max(100),
  questions: z.array(z.object({
    id: slugSchema,
    text: z.string().trim().min(1).max(5000),
    options: z.tuple([z.string().min(1).max(1000), z.string().min(1).max(1000), z.string().min(1).max(1000), z.string().min(1).max(1000)]),
    correct: z.number().int().min(0).max(3),
    explanation: z.string().max(5000)
  }).strict()).min(1).max(200)
}).strict();

type LearningRow = {
  id: string;
  slug: string;
  category: string;
  title: string;
  difficulty: string | null;
  content: string;
  status: LearningPublicationStatus;
  updatedAt: Date;
};

function storageCategory(kind: LearningContentKind) {
  return `ADMIN_LEARNING_${kind.toUpperCase()}`;
}

export function learningStorageSlug(kind: LearningContentKind, slug: string) {
  return `admin-learning-${kind}-${slug}`;
}

export function validateLearningData<K extends LearningContentKind>(kind: K, value: unknown): LearningDataByKind[K] {
  const parsed = kind === "module" ? moduleSchema.safeParse(value)
    : kind === "path" ? pathSchema.safeParse(value)
      : kind === "lab" ? labSchema.safeParse(value)
        : examSchema.safeParse(value);
  if (!parsed.success) {
    throw new LearningContentValidationError(`Ta’lim materiali noto‘g‘ri: ${parsed.error.issues.slice(0, 5).map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  }
  return parsed.data as LearningDataByKind[K];
}

function parseRow<K extends LearningContentKind>(kind: K, row: LearningRow): LearningAdminDocument<K> {
  let decoded: unknown;
  try {
    decoded = JSON.parse(row.content);
  } catch {
    throw new Error(`Ta’lim materiali bazada buzilgan (slug: ${row.slug}).`);
  }
  const data = validateLearningData(kind, decoded);
  if (row.category !== storageCategory(kind) || data.slug !== row.slug.slice(`admin-learning-${kind}-`.length)) {
    throw new Error(`Ta’lim materiali turi yoki slug qiymati bazaga mos kelmaydi (slug: ${row.slug}).`);
  }
  return { id: row.id, kind, slug: data.slug, status: row.status, data, updatedAt: row.updatedAt } as LearningAdminDocument<K>;
}

function staticData<K extends LearningContentKind>(kind: K): LearningDataByKind[K][] {
  if (kind === "module") return learningModules as LearningDataByKind[K][];
  if (kind === "path") return learningPaths as LearningDataByKind[K][];
  if (kind === "lab") return learningLabs as LearningDataByKind[K][];
  return learningExams as LearningDataByKind[K][];
}

async function allDocuments<K extends LearningContentKind>(kind: K): Promise<LearningAdminDocument<K>[]> {
  const rows = await prisma.learningContent.findMany({ where: { category: storageCategory(kind) } });
  const stored = rows.map((row) => parseRow(kind, row as LearningRow));
  const storedBySlug = new Map(stored.map((document) => [document.slug, document]));
  const defaults = staticData(kind);
  const seen = new Set<string>();
  const merged: LearningAdminDocument<K>[] = defaults.map((data) => {
    seen.add(data.slug);
    return storedBySlug.get(data.slug) as LearningAdminDocument<K> | undefined ?? {
      id: null, kind, slug: data.slug, status: "PUBLISHED" as const, data, updatedAt: null
    } as LearningAdminDocument<K>;
  });
  for (const document of stored) if (!seen.has(document.slug)) merged.push(document as LearningAdminDocument<K>);
  return merged;
}

export async function getAdminLearningDocuments<K extends LearningContentKind>(kind: K) {
  return allDocuments(kind);
}

export async function getAdminLearningDocument<K extends LearningContentKind>(kind: K, slug: string) {
  return (await allDocuments(kind)).find((document) => document.slug === slug);
}

export async function getPublishedLearningDocuments<K extends LearningContentKind>(kind: K): Promise<LearningDataByKind[K][]> {
  if (isPreviewMode) return staticData(kind);
  return (await allDocuments(kind)).filter((document) => document.status === "PUBLISHED").map((document) => document.data as LearningDataByKind[K]);
}

export async function getPublishedLearningDocument<K extends LearningContentKind>(kind: K, slug: string): Promise<LearningDataByKind[K] | undefined> {
  if (isPreviewMode) return staticData(kind).find((document) => document.slug === slug);
  const document = await getAdminLearningDocument(kind, slug);
  return document?.status === "PUBLISHED" ? document.data as LearningDataByKind[K] : undefined;
}

export const getLearningModule = (slug: string) => getPublishedLearningDocument("module", slug);
export const getLearningPath = (slug: string) => getPublishedLearningDocument("path", slug);
export const getLearningLab = (slug: string) => getPublishedLearningDocument("lab", slug);
export const getLearningExam = (slug: string) => getPublishedLearningDocument("exam", slug);

function localizedText(value: string | Localized): string {
  return typeof value === "string" ? value : value.uz;
}

export function learningDocumentSummary(document: {
  id: string | null;
  kind: LearningContentKind;
  slug: string;
  status: LearningPublicationStatus;
  data: LearningDataByKind[LearningContentKind];
  updatedAt: Date | null;
}) {
  const data = document.data;
  const title = localizedText(data.title);
  const summary = localizedText(data.summary);
  const count = "sections" in data ? data.sections.length
    : "tasks" in data ? data.tasks.length
      : "questions" in data ? data.questions.length
        : data.modules.length;
  return {
    kind: document.kind,
    slug: document.slug,
    title,
    summary,
    status: document.status,
    updatedAt: document.updatedAt?.toISOString() ?? null,
    overridden: document.id !== null,
    count
  };
}

async function validatePublishedReferences<K extends LearningContentKind>(
  kind: K,
  data: LearningDataByKind[K],
  status: LearningPublicationStatus
) {
  if (status === "PUBLISHED" && kind === "path" && "modules" in data) {
    const modules = await allDocuments("module");
    const published = new Set(modules.filter((item) => item.status === "PUBLISHED").map((item) => item.slug));
    if (data.modules.some((slug) => !published.has(slug))) {
      throw new LearningContentValidationError("Nashr qilinadigan yo‘nalish faqat nashr qilingan kurs modullariga bog‘lanishi kerak.");
    }
  }
  if (status === "PUBLISHED" && kind === "lab" && "moduleSlug" in data) {
    const modules = await allDocuments("module");
    if (!modules.some((item) => item.slug === data.moduleSlug && item.status === "PUBLISHED")) {
      throw new LearningContentValidationError("Laboratoriyani nashr qilishdan oldin uning kurs modulini nashr qiling.");
    }
  }
  if (status === "PUBLISHED" && kind === "exam" && "requiredModules" in data) {
    const [modules, labs] = await Promise.all([allDocuments("module"), allDocuments("lab")]);
    const publishedModules = new Set(modules.filter((item) => item.status === "PUBLISHED").map((item) => item.slug));
    const publishedLabs = new Set(labs.filter((item) => item.status === "PUBLISHED").map((item) => item.slug));
    if (data.requiredModules.some((slug) => !publishedModules.has(slug)) || data.requiredLabs.some((slug) => !publishedLabs.has(slug))) {
      throw new LearningContentValidationError("Nashr qilinadigan imtihon faqat nashr qilingan modullar va laboratoriyalarga bog‘lanishi kerak.");
    }
  }
  if (status !== "PUBLISHED" && kind === "module" && "sections" in data) {
    const [paths, labs, exams] = await Promise.all([allDocuments("path"), allDocuments("lab"), allDocuments("exam")]);
    const referenced = paths.some((item) => item.status === "PUBLISHED" && item.data.modules.includes(data.slug))
      || labs.some((item) => item.status === "PUBLISHED" && item.data.moduleSlug === data.slug)
      || exams.some((item) => item.status === "PUBLISHED" && item.data.requiredModules.includes(data.slug));
    if (referenced) throw new LearningContentValidationError("Bu modul nashr qilingan yo‘nalish, laboratoriya yoki imtihonda ishlatilmoqda. Avval ulardagi bog‘lanishni yangilang.");
  }
  if (status !== "PUBLISHED" && kind === "lab" && "moduleSlug" in data) {
    const exams = await allDocuments("exam");
    if (exams.some((item) => item.status === "PUBLISHED" && item.data.requiredLabs.includes(data.slug))) {
      throw new LearningContentValidationError("Bu laboratoriya nashr qilingan imtihonda ishlatilmoqda. Avval imtihondagi bog‘lanishni yangilang.");
    }
  }
}

export async function saveLearningDocument<K extends LearningContentKind>(
  kind: K,
  dataValue: unknown,
  status: LearningPublicationStatus,
  actorId: string,
  createOnly: boolean
) {
  const data = validateLearningData(kind, dataValue);
  await validatePublishedReferences(kind, data, status);
  const slug = learningStorageSlug(kind, data.slug);
  const existing = await prisma.learningContent.findUnique({ where: { slug }, select: { id: true } });
  if (createOnly && (existing || staticData(kind).some((item) => item.slug === data.slug))) {
    throw new LearningContentValidationError("Bu slug bilan ta’lim materiali allaqachon mavjud.");
  }
  const title = localizedText(data.title);
  const difficulty = "difficulty" in data ? data.difficulty : "level" in data ? data.level : null;
  const content = JSON.stringify(data);
  if (new TextEncoder().encode(content).byteLength > 2_000_000) {
    throw new LearningContentValidationError("Ta’lim materiali 2 MB dan katta bo‘lmasligi kerak.");
  }
  return prisma.$transaction(async (tx) => {
    const saved = await tx.learningContent.upsert({
      where: { slug },
      create: { slug, title, category: storageCategory(kind), difficulty, content, status },
      update: { title, category: storageCategory(kind), difficulty, content, status }
    });
    await tx.auditLog.create({
      data: {
        actorId,
        action: `LEARNING_${kind.toUpperCase()}_SAVED`,
        entity: "LearningContent",
        entityId: saved.id,
        metadata: { slug: data.slug, status }
      }
    });
    return { id: saved.id, kind, slug: data.slug, status, data, updatedAt: saved.updatedAt };
  });
}
