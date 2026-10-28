import { learningExams } from "@/lib/learning-exams";
import { learningLabs } from "@/lib/learning-labs";
import { learningModules } from "@/lib/learning-demo";

export type ProfileInput = {
  sections: { moduleSlug: string; sectionIndex: number }[];
  modulesDone: string[];
  labsDone: string[];
  examsPassed: string[];
  certificates: number;
  pathsFinished: number;
  catalogs?: {
    modules: typeof learningModules;
    labs: typeof learningLabs;
    exams: typeof learningExams;
  };
};

export const XP_RULES = { section: 10, module: 100, labByLevel: { "boshlang‘ich": 100, "o‘rta": 150, "ilg‘or": 200 } as Record<string, number>, exam: 400 };

const levelSteps = [0, 100, 300, 600, 1000, 1600, 2400, 3400, 4600, 6000];
const levelNames = ["Yangi", "O‘quvchi", "Amaliyotchi", "Tahlilchi", "Tajribali", "Mutaxassis", "Ekspert", "Usta", "Ustoz", "Afsona"];

const skillDefs = [
  { key: "net", title: "Tarmoq", modules: ["network-fundamentals", "network-engineering-advanced", "computer-science-core", "cisco-ios-fundamentals", "mikrotik-routeros-basics", "wifi-security"] },
  { key: "sys", title: "Tizimlar", modules: ["linux-fundamentals", "linux-systems-administration", "windows-fundamentals", "windows-active-directory-operations"] },
  { key: "sec", title: "Xavfsizlik", modules: ["intro-cybersecurity", "web-security-owasp", "security-engineering-appsec", "cloud-devsecops-operations", "senior-infrastructure-architecture", "cctv-system-design"] },
  { key: "soc", title: "SOC tahlil", modules: ["soc-log-analysis", "soc-incident-response-detection"] },
  { key: "fw", title: "Firewall", modules: ["firewall-zero-to-hero", "kerio-control-zero-to-hero"] },
  { key: "ad", title: "Identifikatsiya", modules: ["active-directory-security", "windows-active-directory-operations"] },
  { key: "cloud", title: "Cloud/DevOps", modules: ["cloud-devsecops-operations", "linux-systems-administration"] },
  { key: "grc", title: "GRC va Privacy", modules: ["iso-27001-isms", "gdpr-privacy-engineering"] }
];

export type SkillRating = { key: string; title: string; score: number; label: string };
export type Achievement = { id: string; title: string; hint: string; earned: boolean; tone: "cyan" | "gold" | "green" | "violet" };
export type PracticeProfile = {
  xp: number;
  level: number;
  levelName: string;
  levelFloor: number;
  levelCeil: number | null;
  skills: SkillRating[];
  achievements: Achievement[];
  breakdown: { sections: number; modules: number; labs: number; exams: number };
};

const skillLabel = (score: number) => (score >= 75 ? "Ilg‘or" : score >= 45 ? "Amaliy" : score >= 15 ? "Asos" : "Boshlang‘ich");

export function computeProfile(input: ProfileInput): PracticeProfile {
  const modulesCatalog = input.catalogs?.modules ?? learningModules;
  const labsCatalog = input.catalogs?.labs ?? learningLabs;
  const examsCatalog = input.catalogs?.exams ?? learningExams;
  const sectionSet = new Set(input.sections.map((item) => `${item.moduleSlug}:${item.sectionIndex}`));
  const modulesDone = new Set(input.modulesDone);
  const labsDone = new Set(input.labsDone);
  const examsPassed = new Set(input.examsPassed);

  const sectionsXp = sectionSet.size * XP_RULES.section;
  const modulesXp = modulesDone.size * XP_RULES.module;
  const labsXp = labsCatalog.filter((lab) => labsDone.has(lab.slug)).reduce((sum, lab) => sum + (XP_RULES.labByLevel[lab.level] ?? 100), 0);
  const examsXp = examsCatalog.filter((exam) => examsPassed.has(exam.slug)).length * XP_RULES.exam;
  const xp = sectionsXp + modulesXp + labsXp + examsXp;

  let level = 1;
  levelSteps.forEach((step, index) => { if (xp >= step) level = index + 1; });
  const levelFloor = levelSteps[level - 1];
  const levelCeil = levelSteps[level] ?? null;

  const skills = skillDefs.map((skill) => {
    const modules = modulesCatalog.filter((item) => skill.modules.includes(item.slug));
    const totalSections = modules.reduce((sum, item) => sum + item.sections.length, 0);
    const doneSections = modules.reduce((sum, item) => sum + item.sections.filter((_, index) => sectionSet.has(`${item.slug}:${index}`)).length, 0);
    const labs = labsCatalog.filter((lab) => skill.modules.includes(lab.moduleSlug));
    const exams = examsCatalog.filter((exam) => exam.requiredModules.some((slug) => skill.modules.includes(slug)));
    const parts: [number, number][] = [[totalSections ? doneSections / totalSections : 0, 50]];
    if (labs.length) parts.push([labs.filter((lab) => labsDone.has(lab.slug)).length / labs.length, 30]);
    if (exams.length) parts.push([exams.filter((exam) => examsPassed.has(exam.slug)).length / exams.length, 20]);
    const weight = parts.reduce((sum, [, w]) => sum + w, 0);
    const score = Math.round(parts.reduce((sum, [ratio, w]) => sum + ratio * w, 0) / weight * 100);
    return { key: skill.key, title: skill.title, score, label: skillLabel(score) };
  });

  const achievements: Achievement[] = [
    { id: "first-lesson", title: "Birinchi qadam", hint: "Birinchi darsni yakunlang", earned: input.sections.length >= 1, tone: "cyan" },
    { id: "ten-lessons", title: "Izchil o‘quvchi", hint: "10 ta bo‘limni yakunlang", earned: input.sections.length >= 10, tone: "cyan" },
    { id: "first-module", title: "Modul egasi", hint: "Birinchi modulni tugating", earned: modulesDone.size >= 1, tone: "green" },
    { id: "three-modules", title: "Keng qamrov", hint: "3 ta modulni tugating", earned: modulesDone.size >= 3, tone: "green" },
    { id: "first-lab", title: "Birinchi dalil", hint: "Birinchi laboratoriyani yakunlang", earned: labsDone.size >= 1, tone: "violet" },
    { id: "lab-hunter", title: "Dalil ovchisi", hint: "4 ta laboratoriyani yakunlang", earned: labsDone.size >= 4, tone: "violet" },
    { id: "all-labs", title: "Laboratoriya ustasi", hint: "Barcha laboratoriyalarni yakunlang", earned: labsDone.size >= labsCatalog.length, tone: "violet" },
    { id: "first-exam", title: "Imtihondan o‘tdi", hint: "Birinchi imtihondan o‘ting", earned: examsPassed.size >= 1, tone: "gold" },
    { id: "all-exams", title: "To‘liq tasdiq", hint: "Barcha imtihonlardan o‘ting", earned: examsPassed.size >= examsCatalog.length, tone: "gold" },
    { id: "path", title: "Yo‘nalish yakuni", hint: "Bitta yo‘nalishni to‘liq tugating", earned: input.pathsFinished >= 1, tone: "green" },
    { id: "level-5", title: "5-daraja", hint: "5-darajaga yeting", earned: level >= 5, tone: "gold" },
    { id: "xp-1000", title: "1000 XP", hint: "1000 XP to‘plang", earned: xp >= 1000, tone: "cyan" }
  ];

  return { xp, level, levelName: levelNames[level - 1], levelFloor, levelCeil, skills, achievements, breakdown: { sections: sectionsXp, modules: modulesXp, labs: labsXp, exams: examsXp } };
}
