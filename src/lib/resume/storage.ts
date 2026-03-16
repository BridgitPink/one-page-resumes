import type { ResumeFormData } from "@/types/resume";

const KEYS = {
  formData: "resumeFormData",
  generated: "generatedResume",
  analysis: "resumeAnalysis",
  suggested: "resumeSuggestedState",
};

export function saveResumeFormData(data: ResumeFormData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.formData, JSON.stringify(data));
}

export function loadResumeFormData(): ResumeFormData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.formData);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ResumeFormData;
  } catch {
    return null;
  }
}

export function saveGeneratedResume(data: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.generated, JSON.stringify(data));
}

export function loadGeneratedResume<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.generated);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveResumeAnalysis(data: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.analysis, JSON.stringify(data));
}

export function loadResumeAnalysis<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.analysis);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveSuggestedState(data: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.suggested, JSON.stringify(data));
}

export function loadSuggestedState<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.suggested);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearResumeAnalysis() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.analysis);
}

export function clearSuggestedState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.suggested);
}

/**
 * Estimates the percentage of a one-page resume that is filled based on content.
 * Uses heuristic calculation: each section and bullet has an estimated height cost.
 * Returns object with usage percentage and boolean indicating if page is >85% full.
 */
export function estimatePageFit(resume: any): { usagePercent: number; isFull: boolean } {
  if (!resume) {
    return { usagePercent: 0, isFull: false };
  }

  let heightUnits = 0;

  // Header (name, role, contact): ~2 units
  heightUnits += 2;

  // Summary section: 1.5 units
  if (resume.summary?.trim()) {
    heightUnits += 1.5;
  }

  // Skills section: 1 unit
  if (Array.isArray(resume.skills) && resume.skills.length > 0) {
    heightUnits += 1;
  }

  // Experience section
  const experience = Array.isArray(resume.experience)
    ? resume.experience
    : Array.isArray(resume.experiences)
      ? resume.experiences
      : [];

  if (experience.length > 0) {
    heightUnits += 0.5; // Section header
    for (const exp of experience) {
      heightUnits += 0.5; // Role + organization
      if (Array.isArray(exp.bullets)) {
        heightUnits += Math.min(exp.bullets.length * 0.35, 2); // ~0.35 units per bullet, max 2
      }
    }
  }

  // Projects section
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  if (projects.length > 0) {
    heightUnits += 0.5; // Section header
    for (const proj of projects) {
      heightUnits += 0.4; // Project name
      if (Array.isArray(proj.bullets)) {
        heightUnits += Math.min(proj.bullets.length * 0.35, 2); // ~0.35 units per bullet, max 2
      }
    }
  }

  // Education section: 0.4 units
  if (resume.basics?.school || resume.basics?.degree) {
    heightUnits += 0.4;
  }

  // Additional/Extras section
  if (Array.isArray(resume.extras) && resume.extras.length > 0) {
    heightUnits += 0.5; // Section header
    heightUnits += Math.min(resume.extras.length * 0.15, 1); // ~0.15 units per line, max 1
  }

  // Estimate: 11 height units ≈ one full resume page
  const unitsPerPage = 11;
  const usagePercent = (heightUnits / unitsPerPage) * 100;

  return {
    usagePercent: Math.round(usagePercent),
    isFull: usagePercent > 85, // Gate suggestions when >85% full
  };
}