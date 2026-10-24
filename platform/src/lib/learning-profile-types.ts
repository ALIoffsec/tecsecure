import type { PracticeProfile } from "@/lib/learning-profile";

export type ProfileCertificate = {
  code: string;
  examSlug: string;
  title: string;
  acronym: string;
  accent: string;
  scorePercent: number;
  issuedAt: string;
};

export type ProfileProgress = {
  completedSections: { moduleSlug: string; sectionIndex: number }[];
  completions: { moduleSlug: string; title: { uz: string; ru: string; en: string }; rewardTec: number; completedAt: string }[];
  earnedTec: number;
  paths: { slug: string; title: { uz: string; ru: string; en: string }; total: number; done: number }[];
};

export type ProfilePractice = {
  profile: PracticeProfile;
  certificates: ProfileCertificate[];
  progress: ProfileProgress;
};
