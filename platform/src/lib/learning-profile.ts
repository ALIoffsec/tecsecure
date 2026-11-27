import { learningExams } from "@/lib/learning-exams";
import { learningLabs } from "@/lib/learning-labs";
import { learningModules } from "@/lib/learning-demo";
import { LEVEL_NAMES, levelForXp, skillScore } from "@/lib/learning-xp";

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
export const labXp = (level: string) => XP_RULES.labByLevel[level] ?? 100;


/** The skill axes: groups of modules from the catalogue (its four broad categories are too coarse for a chart). */
export const skillDefs = [
  { key: "net", title: "Tarmoq", modules: ["network-fundamentals", "network-engineering-advanced", "computer-science-core", "cisco-ios-fundamentals", "mikrotik-routeros-basics", "wifi-security", "firewall-zero-to-hero", "kerio-control-zero-to-hero"] },
  { key: "sys", title: "Linux va tizimlar", modules: ["linux-fundamentals", "linux-systems-administration", "cloud-devsecops-operations"] },
  { key: "win", title: "Windows/AD", modules: ["windows-fundamentals", "windows-active-directory-operations", "active-directory-security"] },
  { key: "sec", title: "Veb va AppSec", modules: ["intro-cybersecurity", "web-security-owasp", "security-engineering-appsec", "senior-infrastructure-architecture"] },
  { key: "soc", title: "SOC tahlil", modules: ["soc-log-analysis", "soc-incident-response-detection", "iso-27001-isms", "gdpr-privacy-engineering"] },
  { key: "iot", title: "CCTV/IoT", modules: ["cctv-system-design"] }
];

export type SkillRating = { key: string; title: string; score: number; label: string };
export type Achievement = { id: string; title: string; hint: string; earned: boolean; tone: "cyan" | "gold" | "green" | "violet" };
export type PracticeProfile = {
  xp: number;
  level: number;
  levelName: string;
  levelFloor: number;
  levelCeil: number | null;
  /** Index into LEVEL_NAMES and the stage (1–3) within that name. */
  nameIndex: number;
  stage: number;
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
  const labsXp = labsCatalog.filter((lab) => labsDone.has(lab.slug)).reduce((sum, lab) => sum + labXp(lab.level), 0);
  const examsXp = examsCatalog.filter((exam) => examsPassed.has(exam.slug)).length * XP_RULES.exam;
  const xp = sectionsXp + modulesXp + labsXp + examsXp;

  const levelInfo = levelForXp(xp);
  const level = levelInfo.level;

  // A skill's score is the XP earned in its modules, labs and exams over the XP they can give.
  const skills = skillDefs.map((skill) => {
    const modules = modulesCatalog.filter((item) => skill.modules.includes(item.slug));
    const labs = labsCatalog.filter((lab) => skill.modules.includes(lab.moduleSlug));
    const exams = examsCatalog.filter((exam) => exam.requiredModules.some((slug) => skill.modules.includes(slug)));
    const possible = modules.reduce((sum, item) => sum + item.sections.length * XP_RULES.section + XP_RULES.module, 0)
      + labs.reduce((sum, lab) => sum + labXp(lab.level), 0) + exams.length * XP_RULES.exam;
    const earned = modules.reduce((sum, item) => sum + item.sections.filter((_, index) => sectionSet.has(`${item.slug}:${index}`)).length * XP_RULES.section + (modulesDone.has(item.slug) ? XP_RULES.module : 0), 0)
      + labs.filter((lab) => labsDone.has(lab.slug)).reduce((sum, lab) => sum + labXp(lab.level), 0)
      + exams.filter((exam) => examsPassed.has(exam.slug)).length * XP_RULES.exam;
    const score = skillScore(earned, possible);
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

  return { xp, level, levelName: LEVEL_NAMES.uz[levelInfo.nameIndex], levelFloor: levelInfo.floor, levelCeil: levelInfo.ceil, nameIndex: levelInfo.nameIndex, stage: levelInfo.stage, skills, achievements, breakdown: { sections: sectionsXp, modules: modulesXp, labs: labsXp, exams: examsXp } };
}
