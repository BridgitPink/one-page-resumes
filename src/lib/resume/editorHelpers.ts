import type { ResumeBullet } from "@/types/resume";

/**
 * Extract display text from a ResumeBullet object or string
 * Prioritizes: polished > expanded > originalInput
 */
export function getBulletText(bullet: any): string {
  if (typeof bullet === "string") return bullet;
  
  if (!bullet || typeof bullet !== "object") return "";
  
  return bullet.polished || bullet.expanded || bullet.originalInput || "";
}

/**
 * Get experience array from resume, handling both 'experience' and 'experiences' keys
 */
export function getExperience(resume: any) {
  if (Array.isArray(resume?.experience)) return resume.experience;
  if (Array.isArray(resume?.experiences)) return resume.experiences;
  return [];
}

/**
 * Get projects array from resume
 */
export function getProjects(resume: any) {
  if (!Array.isArray(resume?.projects)) return [];
  return resume.projects;
}

/**
 * Determine if summary should be shown based on content density
 * Shows summary only if there are fewer than 6 total bullets
 */
export function shouldShowSummary(resume: any): boolean {
  if (!resume?.summary?.trim()) return false;

  const experience = getExperience(resume);
  const projects = getProjects(resume);

  const experienceBullets = experience.reduce(
    (sum: number, item: any) => sum + (item.bullets?.length ?? 0),
    0
  );
  const projectBullets = projects.reduce(
    (sum: number, item: any) => sum + (item.bullets?.length ?? 0),
    0
  );

  const totalBullets = experienceBullets + projectBullets;
  return totalBullets < 6;
}

/**
 * Get skills array from resume, handling both flat array and categorized object formats
 */
export function getSkills(resume: any): string[] {
  const skills = resume?.skills;

  if (Array.isArray(skills)) return skills.filter(Boolean);

  if (skills && typeof skills === "object") {
    return [
      ...(Array.isArray(skills.languages) ? skills.languages : []),
      ...(Array.isArray(skills.frameworks) ? skills.frameworks : []),
      ...(Array.isArray(skills.tools) ? skills.tools : []),
      ...(Array.isArray(skills.databases) ? skills.databases : []),
      ...(Array.isArray(skills.cloud) ? skills.cloud : []),
      ...(Array.isArray(skills.concepts) ? skills.concepts : []),
      ...(Array.isArray(skills.additional) ? skills.additional : []),
    ].filter(Boolean);
  }

  return [];
}
