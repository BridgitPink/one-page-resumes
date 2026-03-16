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