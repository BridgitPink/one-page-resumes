import type {
  GeneratedResume,
  ResumeBullet,
  ResumeFormData,
} from "@/types/resume";
import { getDisplayBullet, isResumeBullet } from "@/lib/resume/getDisplayBullet";

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => safeString(item)).filter(Boolean);
}

function normalizeBullet(value: unknown): ResumeBullet {
  if (isResumeBullet(value)) {
    return {
      originalInput: safeString(value.originalInput),
      polished: safeString(value.polished),
      expanded: safeString(value.expanded),
      impactTags: safeStringArray(value.impactTags),
      matchedKeywords: safeStringArray(value.matchedKeywords),
    };
  }

  if (typeof value === "string") {
    return {
      originalInput: value,
      polished: value,
      expanded: value,
      impactTags: [],
      matchedKeywords: [],
    };
  }

  return {
    originalInput: "",
    polished: "",
    expanded: "",
    impactTags: [],
    matchedKeywords: [],
  };
}

export function normalizeGeneratedResume(value: unknown): GeneratedResume | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Partial<GeneratedResume>;

  return {
    basics: {
      fullName: safeString(raw.basics?.fullName),
      email: safeString(raw.basics?.email),
      phone: safeString(raw.basics?.phone),
      location: safeString(raw.basics?.location),
      linkedin: safeString(raw.basics?.linkedin),
      github: safeString(raw.basics?.github),
      school: safeString(raw.basics?.school),
      degree: safeString(raw.basics?.degree),
      graduationDate: safeString(raw.basics?.graduationDate),
      gpa: safeString(raw.basics?.gpa),
    },
    target: {
      role: safeString(raw.target?.role),
      industry: safeString(raw.target?.industry),
      jobDescription: safeString(raw.target?.jobDescription),
    },
    summary: safeString(raw.summary),
    experience: Array.isArray(raw.experience)
      ? raw.experience.map((item) => ({
          role: safeString(item?.role),
          organization: safeString(item?.organization),
          bullets: Array.isArray(item?.bullets)
            ? item.bullets.map(normalizeBullet).filter((bullet) => bullet.polished)
            : [],
        }))
      : [],
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((item) => ({
          name: safeString(item?.name),
          bullets: Array.isArray(item?.bullets)
            ? item.bullets.map(normalizeBullet).filter((bullet) => bullet.polished)
            : [],
        }))
      : [],
    skills: safeStringArray(raw.skills),
    extras: safeStringArray(raw.extras),
  };
}

export function normalizeResumeFormData(value: unknown): ResumeFormData | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Partial<ResumeFormData>;

  return {
    basics: {
      fullName: safeString(raw.basics?.fullName),
      email: safeString(raw.basics?.email),
      phone: safeString(raw.basics?.phone),
      location: safeString(raw.basics?.location),
      linkedin: safeString(raw.basics?.linkedin),
      github: safeString(raw.basics?.github),
      school: safeString(raw.basics?.school),
      degree: safeString(raw.basics?.degree),
      graduationDate: safeString(raw.basics?.graduationDate),
      gpa: safeString(raw.basics?.gpa),
    },
    target: {
      role: safeString(raw.target?.role),
      industry: safeString(raw.target?.industry),
      jobDescription: safeString(raw.target?.jobDescription),
    },
    experiences: Array.isArray(raw.experiences)
      ? raw.experiences.map((item) => ({
          role: safeString(item?.role),
          organization: safeString(item?.organization),
          details: safeString(item?.details),
        }))
      : [],
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((item) => ({
          name: safeString(item?.name),
          details: safeString(item?.details),
        }))
      : [],
    skills: safeString(raw.skills),
    extras: safeString(raw.extras),
  };
}

export function generatedResumeToStorage(value: GeneratedResume) {
  return JSON.stringify(normalizeGeneratedResume(value));
}

export function parseGeneratedResumeFromStorage(
  raw: string | null
): GeneratedResume | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return normalizeGeneratedResume(parsed);
  } catch (error) {
    console.error("Failed to parse generated resume from storage:", error);
    return null;
  }
}

export function parseResumeFormDataFromStorage(
  raw: string | null
): ResumeFormData | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return normalizeResumeFormData(parsed);
  } catch (error) {
    console.error("Failed to parse resume form data from storage:", error);
    return null;
  }
}

export function getResumeSearchText(resume: GeneratedResume): string {
  return [
    resume.summary,
    ...resume.experience.flatMap((item) => [
      item.role,
      item.organization,
      ...item.bullets.map(getDisplayBullet),
    ]),
    ...resume.projects.flatMap((item) => [
      item.name,
      ...item.bullets.map(getDisplayBullet),
    ]),
    ...resume.skills,
    ...resume.extras,
    resume.target.role,
    resume.target.industry,
  ]
    .filter(Boolean)
    .join(" ");
}